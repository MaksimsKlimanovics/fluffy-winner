/**
 * How a grade dresses the interface. `data-grade` picks the grade's colours, precomputed per
 * theme in globals.css; `data-band` sizes type and touch targets for the child's age, so the
 * interface grows up together with Cipariņš: large and roomy in grades 1–3, denser by 7–9.
 */
export type Band = "young" | "middle" | "teen";

export function bandOf(grade: number): Band {
  return grade <= 3 ? "young" : grade <= 6 ? "middle" : "teen";
}

/** Grades 1–2 answer on an on-screen number pad instead of the system keyboard. */
export function usesKeypad(grade: number): boolean {
  return grade <= 2;
}

export function gradeAttrs(grade: number | undefined) {
  if (!grade) return {};
  return { "data-grade": String(grade), "data-band": bandOf(grade) };
}

/** Only the colours: for small parts (a card, a button) that sit inside another grade's page. */
export function gradeColorAttrs(grade: number | undefined) {
  return grade ? { "data-grade": String(grade) } : {};
}
