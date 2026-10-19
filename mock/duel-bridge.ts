import {
  type DuelError as DuelErrorType,
  type DuelMeta,
  DuelError,
  answerDuel,
  createDuel,
  getDuel,
  getTrophy,
  joinDuel,
} from "@/lib/duel";
import { MemoryStore } from "@/lib/duel-store";
import { formatAnswer, generateExercise } from "@/lib/exercises";
import { TROPHY_SCHEMA, type TrophySpec, classicSpec, normalizeSpec, trophyPrompt } from "@/lib/trophy";

/**
 * The clickable mock has one device, so the friend is simulated: the very
 * same referee code (lib/duel.ts) runs in the browser with an in-memory store,
 * and a demo friend joins a few seconds after a code is created (or hosts the
 * match when you type any code). The winner's trophy is designed by Claude
 * through the artifact's `sample` capability, with the built-in design as fallback.
 */

const store = new MemoryStore();

type SampleFn = ((input: string, options?: { modelTier?: "quick" | "default" | "complex"; cache?: boolean }) => Promise<{ text: string }>) | null;
const samplePromise: Promise<SampleFn> = (() => {
  const claude = (window as unknown as { claude?: { use: (n: string) => Promise<unknown> } }).claude;
  if (!claude?.use) return Promise.resolve(null);
  return claude.use("sample").then((s) => (s as SampleFn) ?? null).catch(() => null);
})();

const BOT_NAMES = ["Demo draugs", "Pūcīte (demo)", "Zibens (demo)"];

/** The demo friend answers every few seconds and is right about two times out of three. */
function runBot(code: string, token: string) {
  const step = async () => {
    try {
      const view = await getDuel(store, code, token);
      if (view.status === "finished") return;
      if (view.status === "playing" && view.question) {
        const meta = (await store.get<DuelMeta>(`duel:${code}`))!;
        const task = meta.tasks[view.question.index];
        const ex = generateExercise(task.g, task.s);
        const answer = Math.random() < 0.65 ? formatAnswer(ex) : ex.kind === "choice" ? ex.choices.find((c) => c !== ex.answer) ?? "?" : "0";
        await answerDuel(store, { code, token, index: view.question.index, answer });
      }
    } catch {
      /* the bell rang mid-answer */
    }
    setTimeout(step, 2500 + Math.random() * 3500);
  };
  setTimeout(step, 1500);
}

async function design(facts: Parameters<typeof trophyPrompt>[0]): Promise<TrophySpec> {
  const fallback = classicSpec(facts.code, facts.grade);
  const sample = await samplePromise;
  if (!sample) return fallback;
  try {
    const { text } = await sample(
      `${trophyPrompt(facts)}\n\nReply with only one JSON object (no prose, no code fence) that matches this JSON schema:\n${JSON.stringify(TROPHY_SCHEMA)}`,
      { modelTier: "quick", cache: false },
    );
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    return normalizeSpec(JSON.parse(json), fallback);
  } catch {
    return fallback;
  }
}

const json = (body: unknown, status = 200) => Response.json(body, { status });

async function handle(url: URL, init: RequestInit | undefined): Promise<Response> {
  const token = new Headers(init?.headers).get("x-duel-token");
  const body = (() => {
    try {
      return JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    } catch {
      return {};
    }
  })();
  const parts = url.pathname.split("/").filter(Boolean); // api, duel, code?, action?
  const [, , code, action] = parts;
  try {
    if (!code) {
      const r = await createDuel(store, { name: body.name, grade: body.grade, duration: body.duration });
      setTimeout(async () => {
        const bot = await joinDuel(store, { code: r.code, name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] });
        runBot(r.code, bot.token);
      }, 4000);
      return json(r);
    }
    if (action === "join") {
      // Any code works in the demo: an unknown one starts a match hosted by the demo friend.
      if (!(await store.get(`duel:${code}`))) {
        const host = await createDuel(store, { name: "Demo draugs", grade: 3, duration: 120 });
        runBot(host.code, host.token);
        return json(await joinDuel(store, { code: host.code, name: body.name }));
      }
      return json(await joinDuel(store, { code, name: body.name }));
    }
    if (action === "answer") return json(await answerDuel(store, { code, token, index: body.index, answer: body.answer }));
    if (action === "trophy") {
      const { spec, winnerName, facts } = await getTrophy(store, code, token, design);
      return json({ spec, winnerName, grade: facts.grade, score: facts.score });
    }
    return json(await getDuel(store, code, token));
  } catch (err) {
    if (err instanceof DuelError) return json({ error: (err as DuelErrorType).code }, (err as DuelErrorType).status);
    return json({ error: "server" }, 500);
  }
}

export function installDuelBridge() {
  const nextFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(href, "https://mock.local");
    if (url.pathname.startsWith("/api/duel")) return handle(url, init);
    return nextFetch(input, init);
  };
}
