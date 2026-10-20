/**
 * Topic glyphs: line drawings in the same language as Icon (24px grid, 2px round strokes),
 * replacing emoji, which render differently on every platform and clash with the line icons.
 * Drawn in the grade's text colour on its soft tile.
 */
const GLYPHS = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  shapes: "M7 4l5 8H2zM16.5 13a4.5 4.5 0 110 9 4.5 4.5 0 010-9zM14 3h7v7h-7z",
  sequence: "M4 18h3v-3H4zM10.5 18h3v-7h-3zM17 18h3V7h-3z",
  coin: "M12 3a9 9 0 110 18 9 9 0 010-18zM15 9.2a3.6 3.6 0 100 5.6M8 11h6M8 13h6",
  tram: "M6 6h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2zM4 12h16M8.5 21l1.2-3M15.5 21l-1.2-3M9 3h6M12 3v3",
  times: "M6.5 6.5l11 11M17.5 6.5l-11 11",
  clock: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 7v5l3.5 2",
  cart: "M3 4h2.5l2.2 10.5h10.1L20 7.5H6.4M9 19.5h.01M17 19.5h.01",
  ruler: "M3.5 16.5L16.5 3.5l4 4-13 13zM7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2",
  abacus: "M4 4v16M20 4v16M4 8h16M4 12h16M4 16h16M8 8h.01M10.5 8h.01M15 12h.01M17.5 12h.01M9 16h.01",
  divide: "M5 12h14M12 6.5h.01M12 17.5h.01",
  fence: "M4 4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M4 9V4",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
  bars: "M4 20h16M7 20v-6M12 20V8M17 20v-10",
  pizza: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 12V3M12 12l7.8 4.5",
  grid: "M4 4h16v16H4zM4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16",
  longMult: "M8 4l5 5M13 4L8 9M5 13h14M5 18h14",
  receipt: "M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21zM9 8h6M9 12h6M9 16h3",
  fractions: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 12V3M12 12H3",
  angle: "M4 20L17 5M4 20h16M10 20a6 6 0 00-2.2-4.6",
  speed: "M4 17a8 8 0 1116 0M12 17l4-5.5M4 17h3M17 17h3",
  puzzle: "M5 5h4a2 2 0 114 0h4v4a2 2 0 110 4v4h-4a2 2 0 10-4 0H5v-4a2 2 0 100-4z",
  percent: "M19 5L5 19M7 5a2 2 0 110 4 2 2 0 010-4zM17 15a2 2 0 110 4 2 2 0 010-4z",
  ratio: "M4 19h6v-6H4zM14 19h6V7h-6z",
  thermometer: "M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0zM12 9v7",
  wheel: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 12h9M12 12h.01",
  axes: "M4 4v16h16M14 10h.01M14 10v10M4 10h10",
  balance: "M12 4v16M8 20h8M5 8h14M5 8l-3 6h6zM19 8l-3 6h6z",
  power: "M4 9l7 10M11 9l-7 10M14 5.5a2 2 0 114 .5L14 10h4.5",
  triangle: "M12 4l9 15H3zM12 4v15",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  lessEq: "M16 4L6 10l10 6M6 20h10",
  line: "M4 4v16h16M6.5 17L19 5.5",
  rightTriangle: "M5 19V5l14 14zM5 15h4v4",
  sqrt: "M3 13h3l3 7 5-16h7",
  dice: "M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM9 9h.01M15 15h.01M12 12h.01M15 9h.01M9 15h.01",
  pi: "M5 7h14M9 7v11M15 7v9a2 2 0 002 2",
  median: "M4 20h16M7 20v-4M12 20V8M17 20v-7M3 12h18",
  parabola: "M4 4c2 11 5.5 15 8 15s6-4 8-15M2 20h20",
  system: "M4 18L20 6M4 7l16 10",
  similar: "M2 20h20M3 20l4-7 4 7zM12 20l4.5-14L21 20z",
  trig: "M4 20h16V6zM10 20a6 6 0 00-1.6-4.1",
  cube: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5",
  triangleIneq: "M4 19L10 5l10 14zM6.2 11.8l2 .9M14.6 11.2l1.6-1.3M12 18v3",
} as const;

export type GlyphName = keyof typeof GLYPHS;

/** Topic id → glyph; tests/glyphs.test.ts checks every curriculum topic has one. */
const TOPIC_GLYPH: Record<string, GlyphName> = {
  "saskaitisana-20": "plus",
  "atnemsana-20": "minus",
  figuras: "shapes",
  virknes: "sequence",
  "nauda-1": "coin",
  "saskaitisana-100": "tram",
  "reizinasana-intro": "times",
  pulkstenis: "clock",
  "nauda-2": "cart",
  mervienibas: "ruler",
  reizrekins: "abacus",
  dalisana: "divide",
  perimetrs: "fence",
  "skaitli-1000": "map",
  diagrammas: "bars",
  "dalas-intro": "pizza",
  laukums: "grid",
  "rakstu-reizinasana": "longMult",
  decimaldalas: "receipt",
  "dalu-saskaitisana": "fractions",
  lenki: "angle",
  atrums: "speed",
  pirmskaitli: "puzzle",
  procenti: "percent",
  proporcijas: "ratio",
  negativi: "thermometer",
  aplis: "wheel",
  "videja-vertiba": "median",
  koordinatas: "axes",
  vienadojumi: "balance",
  pakapes: "power",
  trijsturi: "triangle",
  "procentu-izmainas": "trend",
  nevienadibas: "lessEq",
  "lineara-funkcija": "line",
  pitagors: "rightTriangle",
  kvadratsakne: "sqrt",
  varbutiba: "dice",
  "rinkis-pi": "pi",
  "moda-mediana": "bars",
  kvadratvienadojumi: "parabola",
  sistemas: "system",
  lidziba: "similar",
  trigonometrija: "trig",
  tilpums: "cube",
  progresija: "sequence",
  "trijstura-nevienadiba": "triangleIneq",
};

export function glyphFor(topicId: string): GlyphName {
  return TOPIC_GLYPH[topicId] ?? "shapes";
}

export function TopicGlyph({ topicId, size = 20 }: { topicId: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="icon glyph"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={GLYPHS[glyphFor(topicId)]} />
    </svg>
  );
}
