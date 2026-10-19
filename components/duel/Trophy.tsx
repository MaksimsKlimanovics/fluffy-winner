import { forwardRef } from "react";
import { getGrade } from "@/lib/curriculum";
import type { Lang } from "@/lib/i18n";
import { persona } from "@/lib/persona";
import type { TrophySpec } from "@/lib/trophy";
import { Mascot } from "../Mascot";

/**
 * Draws a trophy design (from Claude, or the built-in fallback) as a
 * 1080 × 1350 SVG. The same SVG is shown on screen and rasterised to JPG for
 * download, so everything it needs (styles, fonts) is inside it.
 */

export const TROPHY_W = 1080;
export const TROPHY_H = 1350;

const METAL: Record<TrophySpec["metal"], [string, string, string]> = {
  gold: ["#fff3b0", "#ffcf33", "#b88400"],
  silver: ["#ffffff", "#d5dae1", "#7f8896"],
  bronze: ["#ffd9b5", "#cd7f32", "#723f14"],
  rose_gold: ["#ffe6e6", "#f2a7a7", "#a8616d"],
  emerald: ["#dcffec", "#2ecc71", "#0a6b3b"],
  sapphire: ["#e0ecff", "#3a86ff", "#173a8f"],
  amethyst: ["#f4e3ff", "#a05ce6", "#52178f"],
};

const BACKDROP: Record<TrophySpec["background"], [string, string]> = {
  sunrise: ["#ffefd6", "#fdb393"],
  night_sky: ["#0d0f30", "#30307a"],
  ocean: ["#b3d4ff", "#173f7a"],
  forest: ["#e1fca0", "#2d6a3c"],
  aurora: ["#081a36", "#14806a"],
  sunset: ["#ffa48f", "#5e2a87"],
  confetti: ["#fff8ea", "#ffe0ef"],
};

const DARK_BACKDROPS = new Set<TrophySpec["background"]>(["night_sky", "ocean", "forest", "aurora", "sunset"]);

const FONT = "Nunito, 'SF Pro Rounded', ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif";

function rng(seed: string) {
  let a = 0;
  for (const ch of seed) a = (Math.imul(a, 31) + ch.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

const CX = 540;
const CY = 470;

function Body({ shape }: { shape: TrophySpec["shape"] }) {
  const fill = "url(#metal)";
  const edge = { stroke: "url(#metalEdge)", strokeWidth: 6 };
  switch (shape) {
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? 105 : 235;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${CX + r * Math.cos(a)},${CY + 20 + r * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} fill={fill} {...edge} strokeLinejoin="round" />;
    }
    case "rocket":
      return (
        <g {...edge}>
          <path d={`M${CX - 170} 600 L${CX - 95} 470 V600 Z`} fill="url(#accentFill)" />
          <path d={`M${CX + 170} 600 L${CX + 95} 470 V600 Z`} fill="url(#accentFill)" />
          <path d={`M${CX} 205 C${CX + 120} 280 ${CX + 105} 470 ${CX + 95} 640 H${CX - 95} C${CX - 105} 470 ${CX - 120} 280 ${CX} 205 Z`} fill={fill} />
          <circle cx={CX} cy={360} r={46} fill="url(#accentFill)" />
          <path d={`M${CX - 60} 640 Q${CX} 720 ${CX + 60} 640 Z`} fill="#ff9f1c" stroke="none" />
        </g>
      );
    case "crystal":
      return (
        <g {...edge} strokeLinejoin="round">
          <polygon points={`${CX - 150},300 ${CX + 150},300 ${CX + 235},410 ${CX},680 ${CX - 235},410`} fill={fill} />
          <polyline points={`${CX - 235},410 ${CX + 235},410`} fill="none" />
          <polyline points={`${CX - 150},300 ${CX - 70},410 ${CX},680 ${CX + 70},410 ${CX + 150},300`} fill="none" />
          <polyline points={`${CX - 70},410 ${CX},300 ${CX + 70},410`} fill="none" />
        </g>
      );
    case "shield":
      return (
        <path
          d={`M${CX - 190} 290 H${CX + 190} V470 C${CX + 190} 580 ${CX + 110} 640 ${CX} 690 C${CX - 110} 640 ${CX - 190} 580 ${CX - 190} 470 Z`}
          fill={fill}
          {...edge}
        />
      );
    case "globe":
      return (
        <g {...edge}>
          <circle cx={CX} cy={CY} r={200} fill={fill} />
          <ellipse cx={CX} cy={CY} rx={200} ry={70} fill="none" />
          <ellipse cx={CX} cy={CY} rx={80} ry={200} fill="none" />
          <ellipse cx={CX} cy={CY} rx={265} ry={62} fill="none" stroke="url(#accentFill)" strokeWidth={14} transform={`rotate(-18 ${CX} ${CY})`} />
        </g>
      );
    default:
      return (
        <g {...edge}>
          <path d={`M${CX - 215} 290 H${CX + 215} C${CX + 215} 520 ${CX + 115} 650 ${CX} 660 C${CX - 115} 650 ${CX - 215} 520 ${CX - 215} 290 Z`} fill={fill} />
          <ellipse cx={CX} cy={290} rx={215} ry={34} fill="url(#metalEdge)" />
        </g>
      );
  }
}

function Handles({ kind }: { kind: TrophySpec["handles"] }) {
  const stroke = { stroke: "url(#metalEdge)", strokeWidth: 26, fill: "none", strokeLinecap: "round" as const };
  const mirror = (d: React.ReactNode) => (
    <>
      {d}
      <g transform={`translate(${2 * CX} 0) scale(-1 1)`}>{d}</g>
    </>
  );
  switch (kind) {
    case "round":
      return mirror(<path d={`M${CX - 205} 330 C${CX - 340} 330 ${CX - 340} 540 ${CX - 150} 570`} {...stroke} />);
    case "spiral":
      return mirror(
        <path d={`M${CX - 205} 330 C${CX - 330} 300 ${CX - 360} 450 ${CX - 290} 480 C${CX - 240} 500 ${CX - 220} 440 ${CX - 265} 430`} {...stroke} strokeWidth={20} />,
      );
    case "wings":
      return mirror(
        <g fill="url(#metal)" stroke="url(#metalEdge)" strokeWidth={5} strokeLinejoin="round">
          <path d={`M${CX - 200} 360 C${CX - 330} 300 ${CX - 420} 320 ${CX - 450} 290 C${CX - 430} 380 ${CX - 340} 420 ${CX - 200} 420 Z`} />
          <path d={`M${CX - 200} 410 C${CX - 310} 400 ${CX - 380} 420 ${CX - 410} 400 C${CX - 380} 470 ${CX - 300} 490 ${CX - 195} 470 Z`} />
          <path d={`M${CX - 195} 460 C${CX - 280} 470 ${CX - 330} 490 ${CX - 350} 480 C${CX - 320} 530 ${CX - 260} 540 ${CX - 180} 515 Z`} />
        </g>,
      );
    default:
      return null;
  }
}

function Sparkle({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const q = r * 0.28;
  return (
    <path
      d={`M${x} ${y - r} Q${x + q} ${y - q} ${x + r} ${y} Q${x + q} ${y + q} ${x} ${y + r} Q${x - q} ${y + q} ${x - r} ${y} Q${x - q} ${y - q} ${x} ${y - r} Z`}
      fill={color}
    />
  );
}

export const TrophyArt = forwardRef<
  SVGSVGElement,
  { spec: TrophySpec; lang: Lang; winnerName: string; grade: number; score: number; seed: string; date: string }
>(function TrophyArt({ spec, lang, winnerName, grade, score, seed, date }, ref) {
  const [hi, mid, lo] = METAL[spec.metal];
  const [bgTop, bgBottom] = BACKDROP[spec.background];
  const dark = DARK_BACKDROPS.has(spec.background);
  const ink = dark ? "#ffffff" : "#1c1c1e";
  const random = rng(seed);
  const g = getGrade(grade);
  const helper = persona(grade);
  const title = spec.title[lang];
  const motto = wrap(spec.motto[lang], 44);
  const titleSize = Math.min(76, Math.floor(1700 / Math.max(title.length, 1)));
  const rays = Array.from({ length: spec.rays }, (_, i) => (360 / spec.rays) * i);
  const sparkles = Array.from({ length: spec.sparkles }, () => ({
    x: 60 + random() * 960,
    y: 130 + random() * 640,
    r: 10 + random() * 22,
  }));
  const confetti =
    spec.background === "confetti"
      ? Array.from({ length: 46 }, () => ({ x: random() * 1080, y: random() * 900, a: random() * 180, c: random() }))
      : [];
  const stars = spec.background === "night_sky" ? Array.from({ length: 70 }, () => ({ x: random() * 1080, y: random() * 900, r: 1 + random() * 2.5 })) : [];
  const L =
    lang === "lv"
      ? { head: "SACENSĪBU TROFEJA", grade: `${grade}. klase`, points: `${score} punkti`, by: `Pasniedz ${helper.name.lv}` }
      : { head: "КУБОК СОРЕВНОВАНИЙ", grade: `${grade} класс`, points: `${score} очков`, by: `Вручает: ${helper.name.ru}` };

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${TROPHY_W} ${TROPHY_H}`}
      width={TROPHY_W}
      height={TROPHY_H}
      role="img"
      aria-label={`${title} — ${winnerName}`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <style>{`.mascot-line{stroke:#2b2d42}.mascot-foot{fill:#2b2d42}text{font-family:${FONT}}`}</style>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bgTop} />
          <stop offset="1" stopColor={bgBottom} />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <linearGradient id="metalEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lo} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <linearGradient id="accentFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={spec.accent} />
          <stop offset="1" stopColor={spec.accent} stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={dark ? 0.35 : 0.7} />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={TROPHY_W} height={TROPHY_H} fill="url(#bg)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={0.75} />
      ))}
      {spec.background === "aurora" && (
        <g opacity={0.45} fill="none" strokeWidth={70} strokeLinecap="round">
          <path d="M-50 260 C250 140 520 380 1130 180" stroke="#5dffb0" />
          <path d="M-50 380 C300 260 650 470 1130 300" stroke="#7bdcff" opacity={0.7} />
        </g>
      )}
      {confetti.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={18}
          height={8}
          rx={3}
          fill={c.c < 0.33 ? spec.accent : c.c < 0.66 ? mid : "#4cc9f0"}
          transform={`rotate(${c.a} ${c.x} ${c.y})`}
          opacity={0.8}
        />
      ))}

      {rays.map((a) => (
        <path
          key={a}
          d={`M${CX} ${CY} L${CX - 60} ${CY - 760} L${CX + 60} ${CY - 760} Z`}
          fill={spec.accent}
          opacity={dark ? 0.22 : 0.16}
          transform={`rotate(${a} ${CX} ${CY})`}
        />
      ))}
      <circle cx={CX} cy={CY} r={380} fill="url(#glow)" />

      <text x={CX} y={92} textAnchor="middle" fontSize={30} fontWeight={800} letterSpacing={6} fill={ink} opacity={0.8}>
        CIPARIŅI · {L.head}
      </text>

      {/* stem, base and pedestal */}
      <rect x={CX - 32} y={630} width={64} height={170} fill="url(#metalEdge)" />
      <path d={`M${CX - 120} 800 H${CX + 120} L${CX + 150} 850 H${CX - 150} Z`} fill="url(#metal)" />
      <rect x={CX - 200} y={850} width={400} height={86} rx={14} fill="#2b2d42" />
      <rect x={CX - 170} y={872} width={340} height={42} rx={8} fill="url(#metal)" opacity={0.9} />
      <text x={CX} y={902} textAnchor="middle" fontSize={26} fontWeight={800} fill="#2b2d42">
        {L.grade} · {L.points}
      </text>

      <Handles kind={spec.handles} />
      <Body shape={spec.shape} />
      {/* shine */}
      <ellipse cx={CX - 95} cy={CY - 60} rx={38} ry={110} fill="#ffffff" opacity={0.35} transform={`rotate(18 ${CX - 95} ${CY - 60})`} />
      <text
        x={CX}
        y={CY + 52}
        textAnchor="middle"
        fontSize={spec.emblem.length > 2 ? 104 : 140}
        fontWeight={900}
        fill={spec.accent}
        stroke="#ffffff"
        strokeWidth={10}
        paintOrder="stroke"
      >
        {spec.emblem}
      </text>

      {sparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} r={s.r} color={i % 3 ? "#ffffff" : hi} />
      ))}

      {/* the grade's helper hands over the trophy */}
      <g transform="translate(70 700)">
        <Mascot size={230} grade={grade} color={g?.color} mood="cheer" />
      </g>

      {/* plaque */}
      <rect x={60} y={980} width={960} height={310} rx={36} fill="#1c1c1e" opacity={0.92} />
      <text x={CX} y={1062} textAnchor="middle" fontSize={64} fontWeight={900} fill="#ffffff">
        {winnerName}
      </text>
      <text x={CX} y={1062 + 18 + titleSize} textAnchor="middle" fontSize={titleSize} fontWeight={800} fill={hi}>
        {title}
      </text>
      {motto.map((line, i) => (
        <text key={i} x={CX} y={1214 + i * 38} textAnchor="middle" fontSize={32} fontWeight={600} fill="#d1d1d6">
          {line}
        </text>
      ))}
      <text x={CX} y={1322} textAnchor="middle" fontSize={22} fontWeight={700} fill={ink} opacity={0.75}>
        {date} · {L.by}
        {spec.source === "ai" ? " · AI dizains" : ""}
      </text>
    </svg>
  );
});

/** Rasterises the trophy SVG to a JPG blob (the SVG is self-contained, so no canvas taint). */
export async function trophyToJpeg(svg: SVGSVGElement): Promise<Blob> {
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("trophy image failed to load"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = TROPHY_W;
    canvas.height = TROPHY_H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TROPHY_W, TROPHY_H);
    ctx.drawImage(img, 0, 0, TROPHY_W, TROPHY_H);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
