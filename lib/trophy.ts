import type { TrophyFacts } from "./duel";
import type { T } from "./i18n";

/**
 * The winner's trophy. Claude designs it (an honorary title, a motto and the
 * look: shape, metal, handles, emblem, colours, background); the browser draws
 * that design as SVG and turns it into a JPG to download. Claude does not
 * paint pixels, so the design is a structured spec the app can always render.
 */

export const SHAPES = ["classic", "star", "rocket", "crystal", "shield", "globe"] as const;
export const METALS = ["gold", "silver", "bronze", "rose_gold", "emerald", "sapphire", "amethyst"] as const;
export const HANDLES = ["round", "wings", "spiral", "none"] as const;
export const BACKGROUNDS = ["sunrise", "night_sky", "ocean", "forest", "aurora", "sunset", "confetti"] as const;

export type TrophySpec = {
  title: T;
  motto: T;
  shape: (typeof SHAPES)[number];
  metal: (typeof METALS)[number];
  handles: (typeof HANDLES)[number];
  background: (typeof BACKGROUNDS)[number];
  /** A short math symbol engraved on the cup, e.g. "π", "x²", "√". */
  emblem: string;
  accent: string;
  rays: number;
  sparkles: number;
  /** "ai" when Claude designed it, "classic" for the built-in fallback. */
  source: "ai" | "classic";
};

/** JSON schema for structured outputs. Lengths and ranges are clamped in normalizeSpec. */
export const TROPHY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title_lv",
    "title_ru",
    "motto_lv",
    "motto_ru",
    "shape",
    "metal",
    "handles",
    "background",
    "emblem",
    "accent",
    "rays",
    "sparkles",
  ],
  properties: {
    title_lv: { type: "string", description: "Honorary title in Latvian, 2–5 words" },
    title_ru: { type: "string", description: "The same title in Russian" },
    motto_lv: { type: "string", description: "One short motto in Latvian, at most 60 characters" },
    motto_ru: { type: "string", description: "The same motto in Russian" },
    shape: { type: "string", enum: [...SHAPES] },
    metal: { type: "string", enum: [...METALS] },
    handles: { type: "string", enum: [...HANDLES] },
    background: { type: "string", enum: [...BACKGROUNDS] },
    emblem: { type: "string", description: "1–3 characters: a math symbol or tiny expression" },
    accent: { type: "string", description: "Accent colour as #rrggbb" },
    rays: { type: "integer", description: "Number of light rays behind the cup, 0–16" },
    sparkles: { type: "integer", description: "Number of sparkles, 0–20" },
  },
} as const;

export function trophyPrompt(f: TrophyFacts): string {
  return `Design a one-of-a-kind trophy for a schoolchild in Latvia who just won a friendly math duel in the app "Cipariņi".

Match facts:
- Grade: ${f.grade}
- Duration: ${f.duration / 60} min
- Winner: ${f.score} points (${f.correct} correct of ${f.answered} answered); the friend scored ${f.opponentScore}
- Topics in this grade: ${f.topics.join("; ")}
- Match code (use it as a source of variety): ${f.code}

Write an honorary title (2–5 words) that playfully names a math skill from this grade, for example a title like "Daļu Zibens" or "Vienādojumu Bruņinieks", but invent your own. The motto is one short, warm sentence about the win. Give both in correct Latvian and in Russian. Match the tone to the age: very simple and playful for grades 1–3, cooler and wittier for grades 7–9. Do not mention the child's name, school or anything personal; the app engraves the nickname itself.

Choose the look so it fits the title: shape, metal, handles, background, an emblem of 1–3 characters (a math symbol or a tiny expression from this grade, e.g. "π", "x²", "½", "∑", "√"), an accent colour that goes well with the metal, and the number of light rays and sparkles. Be bold and make this trophy different from a standard gold cup.`;
}

const HEX = /^#[0-9a-f]{6}$/i;

function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function pick<V extends string>(v: unknown, options: readonly V[], fallback: V): V {
  return options.includes(v as V) ? (v as V) : fallback;
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
}

/** Accepts Claude's JSON and returns a spec that is always safe to draw. */
export function normalizeSpec(raw: unknown, fallback: TrophySpec): TrophySpec {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const title = { lv: text(r.title_lv, 40), ru: text(r.title_ru, 40) };
  const motto = { lv: text(r.motto_lv, 80), ru: text(r.motto_ru, 80) };
  if (!title.lv || !title.ru) return fallback;
  const emblem = text(r.emblem, 3) || fallback.emblem;
  return {
    title,
    motto: motto.lv && motto.ru ? motto : fallback.motto,
    shape: pick(r.shape, SHAPES, fallback.shape),
    metal: pick(r.metal, METALS, fallback.metal),
    handles: pick(r.handles, HANDLES, fallback.handles),
    background: pick(r.background, BACKGROUNDS, fallback.background),
    emblem,
    accent: typeof r.accent === "string" && HEX.test(r.accent) ? r.accent : fallback.accent,
    rays: clampInt(r.rays, 0, 16, fallback.rays),
    sparkles: clampInt(r.sparkles, 0, 20, fallback.sparkles),
    source: "ai",
  };
}

const CLASSIC_TITLES: { title: T; motto: T }[] = [
  { title: { lv: "Ātro Skaitļu Čempions", ru: "Чемпион быстрых чисел" }, motto: { lv: "Domā ātri, rēķini droši!", ru: "Думай быстро, считай уверенно!" } },
  { title: { lv: "Uzdevumu Zibens", ru: "Молния задач" }, motto: { lv: "Katrs pareizs solis ir uzvara.", ru: "Каждый верный шаг — победа." } },
  { title: { lv: "Matemātikas Meistars", ru: "Мастер математики" }, motto: { lv: "Skaitļi klausa tev!", ru: "Числа слушаются тебя!" } },
  { title: { lv: "Prāta Sprinteris", ru: "Спринтер разума" }, motto: { lv: "Ātrums un precizitāte kopā.", ru: "Скорость и точность вместе." } },
];
const EMBLEMS = ["π", "∑", "√", "x²", "½", "%", "∞", "△"];
const ACCENTS = ["#ff4d6d", "#4cc9f0", "#7209b7", "#f77f00", "#06d6a0", "#3a86ff"];

function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Built-in design for when Claude is unavailable: still varied, derived from the match code. */
export function classicSpec(code: string, grade: number): TrophySpec {
  const h = hash(`${code}:${grade}`);
  const at = <V>(list: readonly V[], shift: number) => list[(h >>> shift) % list.length];
  const words = at(CLASSIC_TITLES, 0);
  return {
    ...words,
    shape: at(SHAPES, 3),
    metal: at(METALS, 6),
    handles: at(HANDLES, 9),
    background: at(BACKGROUNDS, 12),
    emblem: at(EMBLEMS, 15),
    accent: at(ACCENTS, 18),
    rays: 6 + ((h >>> 21) % 9),
    sparkles: 4 + ((h >>> 25) % 10),
    source: "classic",
  };
}
