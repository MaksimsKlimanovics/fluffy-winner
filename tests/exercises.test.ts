import assert from "node:assert/strict";
import { test } from "node:test";
import { GRADES } from "../lib/curriculum";
import { checkAnswer, formatAnswer, generators, parseNumber } from "../lib/exercises";

const RUNS = 400;

for (const [id, gen] of Object.entries(generators)) {
  test(`generator ${id} produces consistent, well-formed exercises`, () => {
    for (let i = 0; i < RUNS; i++) {
      const ex = gen();
      for (const text of [ex.question, ex.hint, ex.solution]) {
        for (const lang of ["lv", "ru"] as const) {
          assert.ok(text[lang].trim().length > 0, `${id}: empty ${lang} text`);
          assert.doesNotMatch(text[lang], /\bNaN\b|\bundefined\b|Infinity|\bnull\b/, `${id}: bad text "${text[lang]}"`);
        }
      }
      if (ex.kind === "number") {
        assert.ok(Number.isFinite(ex.answer), `${id}: answer not finite`);
        // The answer as displayed must itself be accepted.
        assert.ok(checkAnswer(ex, formatAnswer(ex)), `${id}: formatted answer ${formatAnswer(ex)} rejected`);
        assert.ok(!checkAnswer(ex, String(ex.answer + 1000)), `${id}: wrong answer accepted`);
      } else {
        assert.ok(ex.choices.includes(ex.answer), `${id}: answer missing from choices`);
        assert.equal(new Set(ex.choices).size, ex.choices.length, `${id}: duplicate choices`);
        assert.ok(ex.choices.length >= 2, `${id}: too few choices`);
        assert.ok(checkAnswer(ex, ex.answer));
      }
    }
  });
}

test("generators produce sensible ranges", () => {
  for (let i = 0; i < RUNS; i++) {
    const tri = generators.triangleAngles();
    assert.ok(tri.kind === "number" && tri.answer > 0 && tri.answer < 180);
    const ang = generators.angles();
    assert.ok(ang.kind === "number" && ang.answer > 0);
    const sub = generators.sub20();
    assert.ok(sub.kind === "number" && sub.answer >= 1);
    const add = generators.add20();
    assert.ok(add.kind === "number" && add.answer <= 20);
    const pct = generators.percentOf();
    assert.ok(pct.kind === "number" && pct.answer > 0);
  }
});

test("every topic points at an existing generator and has bilingual content", () => {
  const ids = new Set<string>();
  for (const g of GRADES) {
    for (const t of g.topics) {
      assert.ok(t.generator in generators, `${t.id}: unknown generator`);
      assert.ok(!ids.has(`${g.grade}/${t.id}`), `duplicate topic ${t.id}`);
      ids.add(`${g.grade}/${t.id}`);
      for (const text of [t.title, t.why, t.realCase.title, t.realCase.text, ...t.theory, ...t.askAi]) {
        assert.ok(text.lv && text.ru, `${t.id}: missing translation`);
      }
    }
  }
  assert.deepEqual(
    GRADES.map((g) => g.grade),
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
});

test("parseNumber accepts comma decimals, unicode minus and units", () => {
  assert.equal(parseNumber("3,5"), 3.5);
  assert.equal(parseNumber(" 3.5 "), 3.5);
  assert.equal(parseNumber("−4"), -4);
  assert.equal(parseNumber("12 €"), 12);
  assert.equal(parseNumber("1 000"), 1000);
  assert.equal(parseNumber("abc"), null);
  assert.equal(parseNumber(""), null);
});
