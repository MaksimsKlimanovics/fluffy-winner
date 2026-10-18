/**
 * A small set of line icons drawn in the spirit of SF Symbols (2px strokes,
 * round caps) so controls use one icon language instead of emoji.
 */
const PATHS = {
  chevronLeft: "M15 5l-7 7 7 7",
  chevronRight: "M9 5l7 7-7 7",
  chevronDown: "M6 9l6 6 6-6",
  house: "M4 11l8-7 8 7M6 9.5V20h4.5v-5h3v5H18V9.5",
  bubble: "M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4.5 3.5V17H5a2 2 0 01-2-2V7a2 2 0 012-2z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
  lightbulb: "M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z",
  refresh: "M20 12a8 8 0 11-2.3-5.7M20 4v5h-5",
  xmark: "M6 6l12 12M18 6L6 18",
  send: "M12 19V5M5.5 11.5L12 5l6.5 6.5",
  checkmark: "M5 12.5l4.5 4.5L19 7.5",
  sparkles: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  book: "M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 016.5 18H20v3H6.5",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  filled = false,
  label,
  className,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
  /** Accessible name; omit for decorative icons next to visible text. */
  label?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className ? `icon ${className}` : "icon"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
