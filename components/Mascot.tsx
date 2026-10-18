import { persona } from "@/lib/persona";

/**
 * Cipariņš — the app's own tiny engineer-helper who lives inside everyday
 * things and knows the math that makes them work. Original character, drawn
 * as inline SVG so it scales crisply and can be recoloured per grade.
 *
 * He grows up with the child: with each grade the body gets taller, the eyes
 * and cheeks less babyish, and the tools grown-up — from a pencil in grade 2
 * to Cipara kungs' top hat, monocle and cane in grade 9. The belly badge shows
 * the grade digit.
 */
type Mood = "happy" | "thinking" | "cheer";

type Tool = "none" | "pencil" | "ruler" | "compass" | "cane";

/** What the character carries and wears in each grade. */
const LOOK: Record<number, { tool: Tool; backpack?: boolean; glasses?: boolean; bowtie?: boolean; gentleman?: boolean }> = {
  1: { tool: "none" },
  2: { tool: "pencil" },
  3: { tool: "pencil", backpack: true },
  4: { tool: "ruler", backpack: true },
  5: { tool: "ruler", backpack: true },
  6: { tool: "compass", glasses: true },
  7: { tool: "compass", glasses: true },
  8: { tool: "compass", glasses: true, bowtie: true },
  9: { tool: "cane", bowtie: true, gentleman: true },
};

const INK = "#2b2d42";

export function Mascot({
  size = 96,
  color = "#5b5bf7",
  mood = "happy",
  grade,
  className,
}: {
  size?: number;
  color?: string;
  mood?: Mood;
  /** 1–9; without it this is the little Cipariņš of the app's brand. */
  grade?: number;
  className?: string;
}) {
  const p = persona(grade);
  const look = LOOK[p.grade ?? 1];
  // 0 in grade 1 … 1 in grade 9
  const a = ((p.grade ?? 1) - 1) / 8;

  const bottom = 98;
  const h = 62 + 18 * a;
  const w = 72 + 8 * a;
  const x = 60 - w / 2;
  const top = bottom - h;
  const faceX = x + 11;
  const faceW = w - 22;
  const faceTop = top + 10;
  const faceH = 31 + 5 * a;
  const eyeY = faceTop + faceH * 0.45;
  const eyeR = 6.6 - 2 * a;
  const mouthY = faceTop + faceH * 0.74;
  const armY = top + h * 0.55;
  const hand = { x: x + w + 11, y: armY - 11 };
  const antenna = 7 + 7 * a;
  const badge = p.grade ? String(p.grade) : "π";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={p.name.lv}
    >
      {/* antenna with spark; Cipara kungs wears a top hat instead */}
      {!look.gentleman && (
        <>
          <line x1="60" y1={top} x2="60" y2={top - antenna} className="mascot-line" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy={top - antenna - 1} r={4 + a} fill="#ffc93c" />
        </>
      )}
      {look.backpack && <rect x={x + w - 12} y={top + h * 0.3} width="18" height={h * 0.5} rx="6" fill="#ff8a3d" />}
      {/* arms */}
      {mood === "cheer" ? (
        <>
          <path d={`M${x + 2} ${armY} L${x - 12} ${armY - 22}`} className="mascot-line" strokeWidth="5" strokeLinecap="round" />
          <path d={`M${x + w - 2} ${armY} L${x + w + 12} ${armY - 22}`} className="mascot-line" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M${x + 2} ${armY + 4} L${x - 10} ${armY + 16}`} className="mascot-line" strokeWidth="5" strokeLinecap="round" />
          <path d={`M${x + w - 2} ${armY + 4} L${hand.x} ${hand.y}`} className="mascot-line" strokeWidth="5" strokeLinecap="round" />
          <ToolInHand tool={look.tool} x={hand.x} y={hand.y} />
        </>
      )}
      {/* body */}
      <rect x={x} y={top} width={w} height={h} rx={31 - 9 * a} fill={color} />
      <rect x={x} y={top} width={w} height={h} rx={31 - 9 * a} fill="url(#mascotShine)" />
      {/* face screen */}
      <rect x={faceX} y={faceTop} width={faceW} height={faceH} rx={15} fill="#fff" />
      {mood === "thinking" ? (
        <>
          <circle cx="49" cy={eyeY + 1} r={eyeR - 0.5} fill={INK} />
          <circle cx="71" cy={eyeY - 1} r={eyeR - 0.5} fill={INK} />
        </>
      ) : (
        <>
          <circle cx="49" cy={eyeY} r={eyeR} fill={INK} />
          <circle cx="71" cy={eyeY} r={eyeR} fill={INK} />
          <circle cx="51" cy={eyeY - 2} r={1.2 + eyeR * 0.15} fill="#fff" />
          <circle cx="73" cy={eyeY - 2} r={1.2 + eyeR * 0.15} fill="#fff" />
        </>
      )}
      {look.glasses && (
        <g stroke={INK} strokeWidth="1.8" fill="none">
          <circle cx="49" cy={eyeY} r={eyeR + 3.5} />
          <circle cx="71" cy={eyeY} r={eyeR + 3.5} />
          <line x1={49 + eyeR + 3.5} y1={eyeY} x2={71 - eyeR - 3.5} y2={eyeY} />
        </g>
      )}
      {look.gentleman && (
        <g stroke={INK} fill="none">
          {/* monocle on a chain */}
          <circle cx="71" cy={eyeY} r={eyeR + 3.5} strokeWidth="1.8" />
          <path d={`M${71 + eyeR + 3.5} ${eyeY + 1} Q${x + w - 4} ${eyeY + 14} ${x + w - 8} ${faceTop + faceH + 8}`} strokeWidth="1" />
        </g>
      )}
      {mood === "thinking" ? (
        <path d={`M52 ${mouthY} Q60 ${mouthY - 3} 68 ${mouthY}`} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M51 ${mouthY - 1} Q60 ${mouthY + 7 - 2 * a} 69 ${mouthY - 1}`} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {look.gentleman && (
        <path
          d={`M60 ${mouthY - 5} Q53 ${mouthY - 7} 47 ${mouthY - 2} Q53 ${mouthY - 3} 60 ${mouthY - 2.5} Q67 ${mouthY - 3} 73 ${mouthY - 2} Q67 ${mouthY - 7} 60 ${mouthY - 5}Z`}
          fill={INK}
        />
      )}
      {/* cheeks fade as he grows up */}
      <circle cx={faceX + 7} cy={mouthY - 2} r="3.5" fill="#ff9fb2" opacity={0.85 - 0.55 * a} />
      <circle cx={faceX + faceW - 7} cy={mouthY - 2} r="3.5" fill="#ff9fb2" opacity={0.85 - 0.55 * a} />
      {look.bowtie && (
        <path
          d={`M60 ${faceTop + faceH + 6} L51 ${faceTop + faceH + 1} L51 ${faceTop + faceH + 11} Z M60 ${faceTop + faceH + 6} L69 ${faceTop + faceH + 1} L69 ${faceTop + faceH + 11} Z`}
          fill="#ff4d6d"
        />
      )}
      {/* belly badge: the grade digit */}
      <circle cx="60" cy="87" r="7" fill="#ffc93c" />
      <text x="60" y="90.5" textAnchor="middle" fontSize="10" fontWeight="800" fill={INK}>
        {badge}
      </text>
      {look.gentleman && (
        <g className="mascot-foot">
          {/* top hat */}
          <rect x="44" y={top - 17} width="32" height="17" rx="3" />
          <rect x="36" y={top - 3} width="48" height="5" rx="2.5" />
          <rect x="44" y={top - 7} width="32" height="4" fill={color} />
        </g>
      )}
      {/* feet */}
      <rect x="36" y="96" width="16" height="10" rx="5" className="mascot-foot" />
      <rect x="68" y="96" width="16" height="10" rx="5" className="mascot-foot" />
      <defs>
        <linearGradient id="mascotShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ToolInHand({ tool, x, y }: { tool: Tool; x: number; y: number }) {
  switch (tool) {
    case "pencil":
      return (
        <g transform={`rotate(20 ${x} ${y})`}>
          <rect x={x - 3} y={y - 20} width="6" height="22" rx="2" fill="#ff8a3d" />
          <path d={`M${x - 3} ${y + 2} L${x + 3} ${y + 2} L${x} ${y + 7} Z`} fill={INK} />
        </g>
      );
    case "ruler":
      return (
        <g transform={`rotate(15 ${x} ${y})`}>
          <rect x={x - 3.5} y={y - 22} width="7" height="30" rx="1.5" fill="#ffc93c" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={x - 3.5} y1={y - 18 + i * 6} x2={x - 0.5} y2={y - 18 + i * 6} stroke={INK} strokeWidth="1" />
          ))}
        </g>
      );
    case "compass":
      return (
        <g className="mascot-line" strokeWidth="2" strokeLinecap="round" fill="none">
          <line x1={x} y1={y - 18} x2={x - 5} y2={y + 6} />
          <line x1={x} y1={y - 18} x2={x + 6} y2={y + 6} />
          <circle cx={x} cy={y - 20} r="2.5" />
        </g>
      );
    case "cane":
      return (
        <path
          d={`M${x} 106 L${x} ${y - 6} Q${x} ${y - 13} ${x - 6} ${y - 13} Q${x - 11} ${y - 13} ${x - 11} ${y - 8}`}
          className="mascot-line"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      );
    default:
      return null;
  }
}

/** Speech bubble next to the mascot — the app's "here's the secret" moment. */
export function MascotSays({
  children,
  color,
  mood,
  grade,
}: {
  children: React.ReactNode;
  color?: string;
  mood?: Mood;
  grade?: number;
}) {
  return (
    <div className="mascot-says">
      <Mascot size={72} color={color} mood={mood} grade={grade} />
      <div className="bubble">{children}</div>
    </div>
  );
}
