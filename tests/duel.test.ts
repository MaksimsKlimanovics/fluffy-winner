import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COUNTDOWN_MS,
  DuelError,
  POINTS_PER_CORRECT,
  answerDuel,
  buildTasks,
  cleanName,
  createDuel,
  getDuel,
  getTrophy,
  joinDuel,
} from "../lib/duel";
import { MemoryStore } from "../lib/duel-store";
import { generateExercise, formatAnswer } from "../lib/exercises";
import { classicSpec, normalizeSpec } from "../lib/trophy";

const T0 = 1_800_000_000_000;

async function rejects(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => e instanceof DuelError && e.code === code);
}

/** The correct answer for a player's current question, read from the store like the server does. */
async function rightAnswer(store: MemoryStore, code: string, index: number) {
  const meta = (await store.get<{ tasks: { g: never; s: number }[] }>(`duel:${code}`))!;
  return formatAnswer(generateExercise(meta.tasks[index].g, meta.tasks[index].s));
}

async function startedMatch() {
  const store = new MemoryStore();
  const host = await createDuel(store, { name: "Anna", grade: 3, duration: 60 }, T0);
  const guest = await joinDuel(store, { code: host.code, name: "Pēteris" }, T0 + 1000);
  const start = T0 + 1000 + COUNTDOWN_MS;
  return { store, host, guest, start };
}

test("names are nicknames only and codes are six digits", async () => {
  assert.equal(cleanName("  Anna <b>@x.lv  "), "Anna bx.lv");
  assert.equal(cleanName("A"), null);
  assert.equal(cleanName("a".repeat(40))?.length, 16);
  const store = new MemoryStore();
  const { code } = await createDuel(store, { name: "Anna", grade: 5, duration: 120 }, T0);
  assert.match(code, /^\d{6}$/);
  await rejects(createDuel(store, { name: "Anna", grade: 10, duration: 120 }), "bad_request");
  await rejects(createDuel(store, { name: "Anna", grade: 5, duration: 45 }), "bad_request");
});

test("both players get the grade's exercises, every topic in turn", () => {
  const tasks = buildTasks(8, 40);
  assert.equal(tasks.length, 40);
  const generators = new Set(tasks.slice(0, 5).map((t) => t.g));
  assert.equal(generators.size, 5, "the first round has no repeats");
});

test("the match waits for the friend, counts down, then plays", async () => {
  const store = new MemoryStore();
  const host = await createDuel(store, { name: "Anna", grade: 3, duration: 60 }, T0);
  assert.equal((await getDuel(store, host.code, host.token, T0)).status, "waiting");
  await rejects(getDuel(store, host.code, "wrong-token", T0), "forbidden");

  const guest = await joinDuel(store, { code: host.code, name: "Pēteris" }, T0 + 1000);
  await rejects(joinDuel(store, { code: host.code, name: "Trešais" }, T0 + 1100), "full");
  await rejects(joinDuel(store, { code: "000000", name: "Kāds" }), "not_found");

  const counting = await getDuel(store, host.code, guest.token, T0 + 2000);
  assert.equal(counting.status, "countdown");
  assert.equal(counting.question, undefined, "no peeking before the start");
  assert.equal(counting.opponent?.name, "Anna");

  const playing = await getDuel(store, host.code, host.token, T0 + 1000 + COUNTDOWN_MS);
  assert.equal(playing.status, "playing");
  assert.equal(playing.question?.index, 0);
  assert.equal("answer" in (playing.question as object), false, "the answer key never leaves the server");
});

test("each question takes exactly one answer, in order, until the bell", async () => {
  const { store, host, guest, start } = await startedMatch();
  const code = host.code;

  await rejects(answerDuel(store, { code, token: host.token, index: 0, answer: "1" }, start - 10), "closed");

  const first = await answerDuel(store, { code, token: host.token, index: 0, answer: await rightAnswer(store, code, 0) }, start + 100);
  assert.equal(first.last.ok, true);
  assert.equal(first.view.me.score, POINTS_PER_CORRECT);
  assert.equal(first.view.question?.index, 1);

  // No corrections: answering question 0 again is refused.
  await rejects(answerDuel(store, { code, token: host.token, index: 0, answer: "7" }, start + 200), "out_of_order");

  const wrong = await answerDuel(store, { code, token: host.token, index: 1, answer: "-999999" }, start + 300);
  assert.equal(wrong.last.ok, false);
  assert.ok(wrong.last.correct.length > 0, "a wrong answer shows the right one");
  assert.equal(wrong.view.me.score, POINTS_PER_CORRECT);

  // The friend's answers are kept separately and seen by the host.
  await answerDuel(store, { code, token: guest.token, index: 0, answer: "-999999" }, start + 400);
  const seen = await getDuel(store, code, host.token, start + 500);
  assert.deepEqual(seen.opponent && { a: seen.opponent.answered, s: seen.opponent.score }, { a: 1, s: 0 });

  await rejects(answerDuel(store, { code, token: guest.token, index: 1, answer: "1" }, start + 60_000 + 2000), "closed");
});

test("more points wins; equal points go to whoever got there first", async () => {
  const { store, host, guest, start } = await startedMatch();
  const code = host.code;
  await answerDuel(store, { code, token: guest.token, index: 0, answer: await rightAnswer(store, code, 0) }, start + 1000);
  await answerDuel(store, { code, token: host.token, index: 0, answer: await rightAnswer(store, code, 0) }, start + 2000);

  const end = start + 60_000 + 2000;
  assert.equal((await getDuel(store, code, guest.token, end)).result?.outcome, "win");
  assert.equal((await getDuel(store, code, host.token, end)).result?.outcome, "lose");
});

test("only the winner gets a trophy, designed once", async () => {
  const { store, host, guest, start } = await startedMatch();
  const code = host.code;
  await answerDuel(store, { code, token: host.token, index: 0, answer: await rightAnswer(store, code, 0) }, start + 1000);
  const end = start + 60_000 + 2000;

  await rejects(getTrophy(store, code, host.token, async () => ({}), start + 5000), "closed");
  await rejects(getTrophy(store, code, guest.token, async () => ({}), end), "forbidden");

  let calls = 0;
  const design = async () => ({ n: ++calls });
  const first = await getTrophy(store, code, host.token, design, end);
  const again = await getTrophy(store, code, host.token, design, end);
  assert.deepEqual(first.spec, { n: 1 });
  assert.deepEqual(again.spec, { n: 1 });
  assert.equal(first.winnerName, "Anna");
  assert.equal(first.facts.grade, 3);
});

test("a trophy design from Claude is clamped into something drawable", () => {
  const fallback = classicSpec("123456", 4);
  const spec = normalizeSpec(
    {
      title_lv: "Daļu Zibens",
      title_ru: "Молния дробей",
      motto_lv: "Ātri kā zibens!",
      motto_ru: "Быстро, как молния!",
      shape: "spaceship",
      metal: "gold",
      handles: "wings",
      background: "aurora",
      emblem: "½ and more",
      accent: "red",
      rays: 99,
      sparkles: -3,
    },
    fallback,
  );
  assert.equal(spec.shape, fallback.shape);
  assert.equal(spec.emblem, "½ a");
  assert.equal(spec.accent, fallback.accent);
  assert.equal(spec.rays, 16);
  assert.equal(spec.sparkles, 0);
  assert.equal(spec.source, "ai");
  assert.equal(normalizeSpec({}, fallback), fallback);
  assert.notDeepEqual(classicSpec("111111", 4), classicSpec("222222", 4));
});
