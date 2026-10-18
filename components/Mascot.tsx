/**
 * Cipariņš — the app's own tiny engineer-helper who lives inside everyday
 * things and knows the math that makes them work. Original character, drawn
 * as inline SVG so it scales crisply and can be recoloured per grade.
 */
type Mood = "happy" | "thinking" | "cheer";

export function Mascot({
  size = 96,
  color = "#5b5bf7",
  mood = "happy",
  className,
}: {
  size?: number;
  color?: string;
  mood?: Mood;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cipariņš"
    >
      {/* antenna with spark */}
      <line x1="60" y1="22" x2="60" y2="8" className="mascot-line" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="7" r="5" fill="#ffc93c" />
      {/* arms */}
      {mood === "cheer" ? (
        <>
          <path d="M22 66 L8 44" className="mascot-line" strokeWidth="5" strokeLinecap="round" />
          <path d="M98 66 L112 44" className="mascot-line" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M22 70 L10 82" className="mascot-line" strokeWidth="5" strokeLinecap="round" />
          <path d="M98 70 L110 60" className="mascot-line" strokeWidth="5" strokeLinecap="round" />
          {/* screwdriver-pencil */}
          <rect x="106" y="40" width="6" height="22" rx="2" fill="#ff8a3d" transform="rotate(20 109 51)" />
        </>
      )}
      {/* body */}
      <rect x="20" y="22" width="80" height="76" rx="30" fill={color} />
      <rect x="20" y="22" width="80" height="76" rx="30" fill="url(#mascotShine)" />
      {/* face screen */}
      <rect x="32" y="36" width="56" height="38" rx="16" fill="#fff" />
      {mood === "thinking" ? (
        <>
          <circle cx="50" cy="52" r="5" fill="#2b2d42" />
          <circle cx="72" cy="50" r="5" fill="#2b2d42" />
          <path d="M52 65 Q60 62 68 65" stroke="#2b2d42" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="49" cy="53" r="5.5" fill="#2b2d42" />
          <circle cx="71" cy="53" r="5.5" fill="#2b2d42" />
          <circle cx="51" cy="51" r="1.8" fill="#fff" />
          <circle cx="73" cy="51" r="1.8" fill="#fff" />
          <path d="M50 63 Q60 72 70 63" stroke="#2b2d42" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* cheeks */}
      <circle cx="40" cy="64" r="3.5" fill="#ff9fb2" opacity="0.8" />
      <circle cx="80" cy="64" r="3.5" fill="#ff9fb2" opacity="0.8" />
      {/* belly badge */}
      <circle cx="60" cy="86" r="7" fill="#ffc93c" />
      <text x="60" y="90" textAnchor="middle" fontSize="10" fontWeight="800" fill="#2b2d42">
        π
      </text>
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

/** Speech bubble next to the mascot — the app's "here's the secret" moment. */
export function MascotSays({
  children,
  color,
  mood,
}: {
  children: React.ReactNode;
  color?: string;
  mood?: Mood;
}) {
  return (
    <div className="mascot-says">
      <Mascot size={72} color={color} mood={mood} />
      <div className="bubble">{children}</div>
    </div>
  );
}
