/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const LABEL_DARK = "#1c1c1e";
export const LABEL_LIGHT = "#ffffff";

/** Text color that stays readable on a solid fill of `bg` (white or near-black, whichever contrasts more). */
export function readableOn(bg: string): string {
  return contrast(bg, LABEL_LIGHT) >= contrast(bg, LABEL_DARK) ? LABEL_LIGHT : LABEL_DARK;
}
