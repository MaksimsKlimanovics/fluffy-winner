import { GRADES, getGrade } from "./curriculum";
import { type Exercise, type GeneratorId, MAX_SEED, checkAnswer, formatAnswer, generateExercise } from "./exercises";
import type { T } from "./i18n";

/**
 * Competition mode ("Sacensības"): two children on two devices solve the same
 * sequence of exercises for their grade against the clock.
 *
 * The server is the referee. It holds the answer keys, accepts exactly one
 * answer per question (no corrections, no skipping back), and decides the
 * clock and the winner. Each player only ever writes their own record, so two
 * answers arriving at the same moment never overwrite each other.
 */

export const DURATIONS = [60, 120, 180, 300] as const;
export type Duration = (typeof DURATIONS)[number];

export const POINTS_PER_CORRECT = 10;
/** Time between the friend joining and the first question. */
export const COUNTDOWN_MS = 5_000;
/** Answers sent this long after the bell still count (network latency). */
const GRACE_MS = 1_500;
/** The whole match is forgotten after this, finished or not. */
export const TTL_SEC = 2 * 60 * 60;
const TASKS_PER_MATCH = 100;
const CODE_DIGITS = 6;
export const MAX_NAME = 16;

export type Task = { g: GeneratorId; s: number };

export type DuelMeta = {
  code: string;
  grade: number;
  duration: Duration;
  createdAt: number;
  tasks: Task[];
};

export type Answer = { ok: boolean; at: number };

export type Player = {
  name: string;
  token: string;
  joinedAt: number;
  answers: Answer[];
};

/** The friend's record also fixes the start time, so it is written once. */
export type Guest = Player & { startAt: number };

export type Status = "waiting" | "countdown" | "playing" | "finished";

/** Minimal key-value store: Upstash Redis in production, a Map locally. */
export interface DuelStore {
  get<V>(key: string): Promise<V | null>;
  /** Returns false when `nx` is set and the key already exists. */
  set(key: string, value: unknown, opts: { ex: number; nx?: boolean }): Promise<boolean>;
}

export class DuelError extends Error {
  constructor(
    readonly code: "not_found" | "full" | "bad_request" | "forbidden" | "closed" | "out_of_order",
    readonly status: number,
  ) {
    super(code);
  }
}

const keys = {
  meta: (code: string) => `duel:${code}`,
  host: (code: string) => `duel:${code}:p0`,
  guest: (code: string) => `duel:${code}:p1`,
  trophy: (code: string) => `duel:${code}:trophy`,
};

// --- input hygiene ----------------------------------------------------------

/** Nicknames only: letters, digits, spaces and a few marks, nothing that looks like contact data. */
export function cleanName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input
    .normalize("NFC")
    .replace(/[^\p{L}\p{N} _.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME);
  return name.length >= 2 ? name : null;
}

export function cleanCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.replace(/\D/g, "");
  return code.length === CODE_DIGITS ? code : null;
}

export function isDuration(n: unknown): n is Duration {
  return DURATIONS.includes(n as Duration);
}

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function newToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The same exercise mix for both players: every topic of the grade in turn, shuffled per round. */
export function buildTasks(grade: number, count = TASKS_PER_MATCH): Task[] {
  const g = getGrade(grade);
  if (!g) throw new DuelError("bad_request", 400);
  const generators = g.topics.map((t) => t.generator);
  const tasks: Task[] = [];
  while (tasks.length < count) {
    const round = [...generators];
    for (let i = round.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [round[i], round[j]] = [round[j], round[i]];
    }
    for (const id of round) tasks.push({ g: id, s: randomInt(MAX_SEED) });
  }
  return tasks.slice(0, count);
}

// --- what the browser sees ---------------------------------------------------

/** A question without its answer key. */
export type PublicQuestion = {
  index: number;
  question: T;
  unit?: T;
  kind: Exercise["kind"];
  choices?: string[];
};

export type LastResult = { index: number; ok: boolean; correct: string; unit?: T };

export type DuelView = {
  code: string;
  grade: number;
  duration: Duration;
  status: Status;
  serverNow: number;
  startAt?: number;
  endAt?: number;
  /** 0 = the one who created the match, 1 = the friend. */
  seat: 0 | 1;
  me: { name: string; score: number; answered: number; correct: number };
  opponent?: { name: string; score: number; answered: number; correct: number };
  question?: PublicQuestion;
  result?: { outcome: "win" | "lose" | "draw" };
};

function publicQuestion(meta: DuelMeta, index: number): PublicQuestion | undefined {
  const task = meta.tasks[index];
  if (!task) return undefined;
  const ex = generateExercise(task.g, task.s);
  return {
    index,
    question: ex.question,
    unit: ex.unit,
    kind: ex.kind,
    choices: ex.kind === "choice" ? ex.choices : undefined,
  };
}

function tally(p: Player) {
  const correct = p.answers.filter((a) => a.ok).length;
  return { name: p.name, score: correct * POINTS_PER_CORRECT, answered: p.answers.length, correct };
}

export function statusOf(guest: Guest | null, meta: DuelMeta, now: number): Status {
  if (!guest) return "waiting";
  if (now < guest.startAt) return "countdown";
  if (now < guest.startAt + meta.duration * 1000 + GRACE_MS) return "playing";
  return "finished";
}

/**
 * More points wins. On equal points the one who reached that score first wins
 * (the time of their last correct answer); only a true tie is a draw.
 */
export function winnerSeat(host: Player, guest: Player): 0 | 1 | null {
  const a = tally(host).score;
  const b = tally(guest).score;
  if (a !== b) return a > b ? 0 : 1;
  const lastOk = (p: Player) => p.answers.filter((x) => x.ok).at(-1)?.at ?? Infinity;
  const ta = lastOk(host);
  const tb = lastOk(guest);
  if (ta === tb) return null;
  return ta < tb ? 0 : 1;
}

// --- operations ----------------------------------------------------------------

type Loaded = { meta: DuelMeta; host: Player; guest: Guest | null };

async function load(store: DuelStore, code: string): Promise<Loaded> {
  const [meta, host, guest] = await Promise.all([
    store.get<DuelMeta>(keys.meta(code)),
    store.get<Player>(keys.host(code)),
    store.get<Guest>(keys.guest(code)),
  ]);
  if (!meta || !host) throw new DuelError("not_found", 404);
  return { meta, host, guest };
}

function seatOf(l: Loaded, token: unknown): 0 | 1 {
  if (typeof token !== "string" || !token) throw new DuelError("forbidden", 403);
  if (token === l.host.token) return 0;
  if (l.guest && token === l.guest.token) return 1;
  throw new DuelError("forbidden", 403);
}

function view(l: Loaded, seat: 0 | 1, now: number): DuelView {
  const status = statusOf(l.guest, l.meta, now);
  const me = seat === 0 ? l.host : l.guest!;
  const other = seat === 0 ? l.guest : l.host;
  const v: DuelView = {
    code: l.meta.code,
    grade: l.meta.grade,
    duration: l.meta.duration,
    status,
    serverNow: now,
    seat,
    me: tally(me),
    opponent: other ? tally(other) : undefined,
  };
  if (l.guest) {
    v.startAt = l.guest.startAt;
    v.endAt = l.guest.startAt + l.meta.duration * 1000;
  }
  if (status === "playing") v.question = publicQuestion(l.meta, me.answers.length);
  if (status === "finished" && l.guest) {
    const w = winnerSeat(l.host, l.guest);
    v.result = { outcome: w === null ? "draw" : w === seat ? "win" : "lose" };
  }
  return v;
}

export async function createDuel(
  store: DuelStore,
  input: { name: unknown; grade: unknown; duration: unknown },
  now = Date.now(),
): Promise<{ code: string; token: string }> {
  const name = cleanName(input.name);
  const grade = typeof input.grade === "number" && GRADES.some((g) => g.grade === input.grade) ? input.grade : null;
  if (!name || !grade || !isDuration(input.duration)) throw new DuelError("bad_request", 400);

  const host: Player = { name, token: newToken(), joinedAt: now, answers: [] };
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = String(randomInt(10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0");
    // Claim the code atomically; a clash with a live match just tries another.
    if (!(await store.set(keys.host(code), host, { ex: TTL_SEC, nx: true }))) continue;
    const meta: DuelMeta = { code, grade, duration: input.duration, createdAt: now, tasks: buildTasks(grade) };
    await store.set(keys.meta(code), meta, { ex: TTL_SEC });
    return { code, token: host.token };
  }
  throw new DuelError("full", 503);
}

export async function joinDuel(
  store: DuelStore,
  input: { code: unknown; name: unknown },
  now = Date.now(),
): Promise<{ code: string; token: string }> {
  const code = cleanCode(input.code);
  const name = cleanName(input.name);
  if (!code || !name) throw new DuelError("bad_request", 400);
  const l = await load(store, code);
  if (l.guest) throw new DuelError("full", 409);
  const guest: Guest = { name, token: newToken(), joinedAt: now, answers: [], startAt: now + COUNTDOWN_MS };
  // Only one friend can take the second seat.
  if (!(await store.set(keys.guest(code), guest, { ex: TTL_SEC, nx: true }))) throw new DuelError("full", 409);
  return { code, token: guest.token };
}

export async function getDuel(store: DuelStore, code: unknown, token: unknown, now = Date.now()): Promise<DuelView> {
  const c = cleanCode(code);
  if (!c) throw new DuelError("not_found", 404);
  const l = await load(store, c);
  return view(l, seatOf(l, token), now);
}

/**
 * One answer per question, in order. A second answer to the same question, or
 * one after the bell, is rejected: competition mode has no corrections.
 */
export async function answerDuel(
  store: DuelStore,
  input: { code: unknown; token: unknown; index: unknown; answer: unknown },
  now = Date.now(),
): Promise<{ view: DuelView; last: LastResult }> {
  const code = cleanCode(input.code);
  if (!code) throw new DuelError("not_found", 404);
  const l = await load(store, code);
  const seat = seatOf(l, input.token);
  if (statusOf(l.guest, l.meta, now) !== "playing") throw new DuelError("closed", 409);
  const me = seat === 0 ? l.host : l.guest!;
  if (input.index !== me.answers.length) throw new DuelError("out_of_order", 409);
  const task = l.meta.tasks[me.answers.length];
  if (!task || typeof input.answer !== "string" || input.answer.length > 40) throw new DuelError("bad_request", 400);

  const ex = generateExercise(task.g, task.s);
  const ok = checkAnswer(ex, input.answer.trim());
  me.answers.push({ ok, at: now });
  await store.set(seat === 0 ? keys.host(code) : keys.guest(code), me, { ex: TTL_SEC });

  return {
    view: view(l, seat, now),
    last: { index: me.answers.length - 1, ok, correct: formatAnswer(ex), unit: ex.unit },
  };
}

// --- trophy ----------------------------------------------------------------------

export type TrophyFacts = {
  grade: number;
  duration: Duration;
  score: number;
  correct: number;
  answered: number;
  opponentScore: number;
  topics: string[];
  code: string;
};

/** Only the winner of a finished match may ask for the trophy. */
export async function trophyFacts(store: DuelStore, code: unknown, token: unknown, now = Date.now()) {
  const c = cleanCode(code);
  if (!c) throw new DuelError("not_found", 404);
  const l = await load(store, c);
  const seat = seatOf(l, token);
  if (!l.guest || statusOf(l.guest, l.meta, now) !== "finished") throw new DuelError("closed", 409);
  if (winnerSeat(l.host, l.guest) !== seat) throw new DuelError("forbidden", 403);
  const me = tally(seat === 0 ? l.host : l.guest);
  const other = tally(seat === 0 ? l.guest : l.host);
  const g = getGrade(l.meta.grade)!;
  const facts: TrophyFacts = {
    grade: l.meta.grade,
    duration: l.meta.duration,
    score: me.score,
    correct: me.correct,
    answered: me.answered,
    opponentScore: other.score,
    topics: g.topics.map((t) => t.title.lv),
    code: c,
  };
  return { facts, winnerName: me.name };
}

/** The design is made once per match and kept, so a reload shows the same trophy. */
export const trophyKey = keys.trophy;

/**
 * Returns the winner's trophy design, asking `design` (Claude) only the first
 * time. A double tap may design twice; the first stored design wins for both.
 */
export async function getTrophy<S>(
  store: DuelStore,
  code: unknown,
  token: unknown,
  design: (facts: TrophyFacts) => Promise<S>,
  now = Date.now(),
): Promise<{ spec: S; winnerName: string; facts: TrophyFacts }> {
  const { facts, winnerName } = await trophyFacts(store, code, token, now);
  const key = trophyKey(facts.code);
  const cached = await store.get<S>(key);
  if (cached) return { spec: cached, winnerName, facts };
  const made = await design(facts);
  await store.set(key, made, { ex: TTL_SEC, nx: true });
  return { spec: (await store.get<S>(key)) ?? made, winnerName, facts };
}
