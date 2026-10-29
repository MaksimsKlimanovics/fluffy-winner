import { type DuelMeta, answerDuel, getDuel } from "@/lib/duel";
import { MemoryStore } from "@/lib/duel-store";
import { formatAnswer, generateExercise } from "@/lib/exercises";

/** The mock's one shared in-memory store, and the simulated opponent who plays in it. */
export const store = new MemoryStore();

/** The demo friend answers every few seconds and is right about two times out of three. */
export function runBot(code: string, token: string) {
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
