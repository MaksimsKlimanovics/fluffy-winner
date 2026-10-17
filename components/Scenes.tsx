/**
 * Flat illustrations in the style of the design references: soft sky,
 * stylised Riga skyline, round hills. Used as hero art on cards.
 */
export function CityScene({ accent = "#ffc93c", sky = "#5b5bf7" }: { accent?: string; sky?: string }) {
  return (
    <svg viewBox="0 0 320 200" className="scene" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      <rect width="320" height="200" fill={sky} />
      <circle cx="250" cy="52" r="26" fill={accent} />
      <g fill="#fff" opacity="0.9">
        <ellipse cx="70" cy="40" rx="26" ry="9" />
        <ellipse cx="88" cy="34" rx="16" ry="9" />
        <ellipse cx="190" cy="70" rx="20" ry="7" />
      </g>
      {/* Riga skyline: St. Peter's spire, Dom tower, houses */}
      <g fill="#2b2d42" opacity="0.18">
        <rect x="20" y="110" width="30" height="90" />
        <rect x="56" y="96" width="24" height="104" />
        <rect x="250" y="104" width="34" height="96" />
        <rect x="288" y="120" width="28" height="80" />
      </g>
      <g fill="#fff" opacity="0.95">
        <rect x="96" y="120" width="34" height="80" />
        <polygon points="96,120 113,100 130,120" />
        <rect x="140" y="92" width="22" height="108" />
        <polygon points="140,92 151,30 162,92" />
        <rect x="149" y="22" width="4" height="10" />
        <rect x="170" y="112" width="40" height="88" />
        <polygon points="170,112 190,84 210,112" />
        <rect x="216" y="128" width="28" height="72" />
      </g>
      <g fill={sky} opacity="0.55">
        <rect x="104" y="132" width="6" height="9" rx="1" />
        <rect x="116" y="132" width="6" height="9" rx="1" />
        <rect x="104" y="150" width="6" height="9" rx="1" />
        <rect x="116" y="150" width="6" height="9" rx="1" />
        <rect x="147" y="104" width="8" height="12" rx="4" />
        <rect x="180" y="124" width="7" height="10" rx="1" />
        <rect x="193" y="124" width="7" height="10" rx="1" />
        <rect x="180" y="144" width="7" height="10" rx="1" />
        <rect x="193" y="144" width="7" height="10" rx="1" />
      </g>
      <path d="M0 178 Q80 150 160 172 T320 166 V200 H0 Z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function BooksScene({ color = "#7b2ff7" }: { color?: string }) {
  return (
    <svg viewBox="0 0 320 200" className="scene" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      <rect width="320" height="200" fill={color} />
      <circle cx="60" cy="50" r="30" fill="#fff" opacity="0.15" />
      <circle cx="280" cy="30" r="50" fill="#fff" opacity="0.1" />
      {/* stacked books */}
      {[
        ["#ffc93c", 90, 150, 150],
        ["#ff8a3d", 100, 132, 130],
        ["#2ec4b6", 85, 114, 150],
        ["#f72585", 105, 96, 120],
      ].map(([c, x, y, w], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height="18" rx="4" fill={c as string} />
          <rect x={(x as number) + 6} y={(y as number) + 6} width={(w as number) - 20} height="3" rx="1.5" fill="#fff" opacity="0.6" />
        </g>
      ))}
      {/* ladder */}
      <g stroke="#2b2d42" strokeWidth="4" strokeLinecap="round">
        <line x1="60" y1="190" x2="88" y2="96" />
        <line x1="80" y1="190" x2="108" y2="96" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={63 + i * 5.5} y1={178 - i * 19} x2={83 + i * 5.5} y2={178 - i * 19} />
        ))}
      </g>
      {/* math symbols floating */}
      <g fill="#fff" fontWeight="800" fontFamily="inherit">
        <text x="240" y="80" fontSize="28">π</text>
        <text x="40" y="110" fontSize="22" opacity="0.8">+</text>
        <text x="270" y="140" fontSize="22" opacity="0.8">√</text>
        <text x="200" y="60" fontSize="18" opacity="0.7">%</text>
      </g>
      <path d="M0 186 Q160 170 320 186 V200 H0 Z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function BusScene({ color = "#ff8a3d" }: { color?: string }) {
  return (
    <svg viewBox="0 0 320 200" className="scene" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      <rect width="320" height="200" fill="#ffc93c" />
      <g fill={color} opacity="0.85">
        <rect x="20" y="70" width="40" height="130" />
        <rect x="70" y="40" width="30" height="160" />
        <rect x="230" y="60" width="36" height="140" />
        <rect x="272" y="90" width="30" height="110" />
      </g>
      <g fill="#fff" opacity="0.7">
        <rect x="78" y="56" width="6" height="16" />
        <rect x="88" y="56" width="6" height="16" />
        <rect x="240" y="76" width="6" height="16" />
        <rect x="252" y="76" width="6" height="16" />
      </g>
      {/* tram */}
      <rect x="60" y="120" width="200" height="56" rx="12" fill="#5b5bf7" />
      <rect x="60" y="160" width="200" height="8" fill="#f72585" />
      {[76, 116, 156, 196].map((x) => (
        <rect key={x} x={x} y="130" width="30" height="22" rx="4" fill="#bde0fe" />
      ))}
      <rect x="232" y="130" width="18" height="34" rx="3" fill="#2b2d42" opacity="0.4" />
      <line x1="160" y1="120" x2="140" y2="96" stroke="#2b2d42" strokeWidth="3" />
      <line x1="140" y1="96" x2="180" y2="96" stroke="#2b2d42" strokeWidth="3" />
      <circle cx="96" cy="180" r="9" fill="#2b2d42" />
      <circle cx="224" cy="180" r="9" fill="#2b2d42" />
      <rect x="0" y="188" width="320" height="12" fill="#fff" opacity="0.9" />
    </svg>
  );
}
