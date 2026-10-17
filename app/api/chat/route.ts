import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, parseExerciseContext, sanitizeHistory } from "@/lib/tutor";
import type { Lang } from "@/lib/i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

// Best-effort per-instance limiter. Serverless instances don't share memory,
// so put a real limiter (e.g. Vercel Firewall rules or Upstash) in front for
// public deployments.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

const MESSAGES = {
  lv: {
    busy: "Tu raksti ļoti ātri! Pagaidi minūti un jautā vēlreiz.",
    noKey: "AI palīgs vēl nav ieslēgts: administratoram jāiestata ANTHROPIC_API_KEY.",
    refusal: "\n\nPar šo es nevaru palīdzēt. Pajautā man kaut ko par matemātiku!",
    error: "\n\nHmm, kaut kas nogāja greizi. Pamēģini vēlreiz.",
  },
  ru: {
    busy: "Ты пишешь очень быстро! Подожди минутку и спроси ещё раз.",
    noKey: "AI-помощник ещё не включён: администратору нужно задать ANTHROPIC_API_KEY.",
    refusal: "\n\nС этим я помочь не могу. Спроси меня что-нибудь по математике!",
    error: "\n\nХм, что-то пошло не так. Попробуй ещё раз.",
  },
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lang: Lang = body.lang === "ru" ? "ru" : "lv";
  const text = MESSAGES[lang];
  const history = sanitizeHistory(body.messages);
  if (!history) return Response.json({ error: "Invalid messages" }, { status: 400 });

  const grade = typeof body.grade === "number" ? body.grade : undefined;
  const topicId = typeof body.topicId === "string" ? body.topicId : undefined;
  const exercise = parseExerciseContext(body.exercise, grade, topicId);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return Response.json({ error: text.busy }, { status: 429 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: text.noKey }, { status: 503 });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const messageStream = client.beta.messages.stream(
          {
            model: MODEL,
            max_tokens: 8000,
            // General chat stays fast; walking through a concrete exercise
            // step by step gets a bit more thinking so the steps are right.
            output_config: { effort: exercise ? "medium" : "low" },
            // If a safety classifier declines, retry on Anthropic's
            // recommended fallback model instead of failing the turn.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system: buildSystemPrompt(lang, grade, topicId, exercise),
            messages: history,
          },
          { signal: req.signal },
        );

        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await messageStream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode(text.refusal));
      } catch (err) {
        if (!req.signal.aborted) {
          console.error("chat stream failed", err instanceof Anthropic.APIError ? err.status : "", err);
          controller.enqueue(encoder.encode(text.error));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
