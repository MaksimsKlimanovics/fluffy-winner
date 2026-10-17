import { formatAnswer, generateExercise } from "@/lib/exercises";
import type { Lang } from "@/lib/i18n";
import { buildSystemPrompt, parseExerciseContext, sanitizeHistory } from "@/lib/tutor";

/**
 * In the clickable mock there is no /api/chat server. The app still calls
 * fetch("/api/chat"); this bridge answers it in the browser with the very
 * same prompt-building code, and asks Claude through the artifact's `sample`
 * capability (on the viewer's own Claude account, after their consent).
 * Where `sample` is unavailable it answers with a clearly marked demo reply.
 */

type SampleFn = ((
  input: string | { role: "user" | "assistant"; content: string }[],
  options?: {
    onText?: (p: { text: string; delta: string }) => void;
    signal?: AbortSignal;
    modelTier?: "quick" | "default" | "complex";
    cache?: boolean;
  },
) => Promise<{ text: string; truncated: boolean }>) | null;

type ClaudeRuntime = { use: (name: string) => Promise<unknown> };

const samplePromise: Promise<SampleFn> = (() => {
  const claude = (window as unknown as { claude?: ClaudeRuntime }).claude;
  if (!claude?.use) return Promise.resolve(null);
  return claude.use("sample").then((s) => (s as SampleFn) ?? null).catch(() => null);
})();

const COPY = {
  lv: {
    notGranted: "Lai Cipariņš atbildētu, atļauj šim maketam izmantot Claude. Bez atļaujas maketā atbildes nav pieejamas.",
    busy: "Pārāk daudz jautājumu uzreiz. Pagaidi brīdi un pamēģini vēlreiz.",
    failed: "Neizdevās saņemt atbildi. Pamēģini vēlreiz.",
    truncated: "\n\n(Atbilde bija par garu un tika saīsināta.)",
    demoTag: "Demo atbilde: šajā skatā Claude nav pieejams.",
  },
  ru: {
    notGranted: "Чтобы Ципариньш ответил, разреши этому макету использовать Claude. Без разрешения ответы в макете недоступны.",
    busy: "Слишком много вопросов сразу. Подожди немного и попробуй снова.",
    failed: "Не удалось получить ответ. Попробуй ещё раз.",
    truncated: "\n\n(Ответ был слишком длинным и сокращён.)",
    demoTag: "Демо-ответ: в этом просмотре Claude недоступен.",
  },
};

function demoReply(lang: Lang, exercise: ReturnType<typeof parseExerciseContext>): string {
  const c = COPY[lang];
  if (exercise) {
    const ex = generateExercise(exercise.generator, exercise.seed);
    const done = exercise.status !== "unsolved";
    return lang === "lv"
      ? `${c.demoTag}\n\n1. **Kas dots?** Izlasi uzdevumu vēlreiz un izraksti skaitļus.\n2. **Modelis:** ${ex.hint.lv}\n3. ${done ? `**Risinājums:** ${ex.solution.lv} → ${formatAnswer(ex)}` : "Izdari pirmo aprēķinu pats — es pārbaudīšu!"}`
      : `${c.demoTag}\n\n1. **Что дано?** Перечитай задачу и выпиши числа.\n2. **Модель:** ${ex.hint.ru}\n3. ${done ? `**Решение:** ${ex.solution.ru} → ${formatAnswer(ex)}` : "Сделай первое вычисление сам — я проверю!"}`;
  }
  return lang === "lv"
    ? `${c.demoTag}\n\nĪstajā lietotnē šeit atbild Cipariņš: palīdz saprast uzdevumu soli pa solim, nevis pasaka atbildi priekšā.`
    : `${c.demoTag}\n\nВ настоящем приложении здесь отвечает Ципариньш: помогает разобраться шаг за шагом, а не подсказывает готовый ответ.`;
}

async function handleChat(init: RequestInit | undefined): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(String(init?.body ?? "{}"));
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const lang: Lang = body.lang === "ru" ? "ru" : "lv";
  const history = sanitizeHistory(body.messages);
  if (!history) return Response.json({ error: "Invalid messages" }, { status: 400 });
  const grade = typeof body.grade === "number" ? body.grade : undefined;
  const topicId = typeof body.topicId === "string" ? body.topicId : undefined;
  const exercise = parseExerciseContext(body.exercise, grade, topicId);

  const sample = await samplePromise;
  const encoder = new TextEncoder();
  if (!sample) {
    return new Response(encoder.encode(demoReply(lang, exercise)), { headers: { "Content-Type": "text/plain" } });
  }

  // `sample` has no system prompt of its own: the tutor's instructions open the first user turn.
  const system = buildSystemPrompt(lang, grade, topicId, exercise);
  const turns = history.map((t, i) =>
    i === 0 ? { ...t, content: `${system}\n\n=== The child's message ===\n${t.content}` } : t,
  );

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      sample(turns, {
        cache: false,
        signal: init?.signal ?? undefined,
        // Explaining a concrete exercise gets more thinking, as in the real app.
        modelTier: exercise ? "default" : "quick",
        onText: ({ delta }) => controller.enqueue(encoder.encode(delta)),
      })
        .then(({ truncated }) => {
          if (truncated) controller.enqueue(encoder.encode(COPY[lang].truncated));
        })
        .catch((e: { code?: string }) => {
          if (e?.code === "cancelled") return;
          const msg =
            e?.code === "not_granted" || e?.code === "sampling_disabled" || e?.code === "not_declared"
              ? COPY[lang].notGranted
              : e?.code === "rate_limited" || e?.code === "queue_overflow"
                ? COPY[lang].busy
                : COPY[lang].failed;
          controller.enqueue(encoder.encode(`\n\n${msg}`));
        })
        .finally(() => controller.close());
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export function installChatBridge() {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url === "/api/chat" || url.endsWith("/api/chat")) return handleChat(init);
    return realFetch(input, init);
  };
}
