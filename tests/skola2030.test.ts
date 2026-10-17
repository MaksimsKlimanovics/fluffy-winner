import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { GRADES } from "../lib/curriculum";
import { type Exercise, generateExercise } from "../lib/exercises";
import { BIG_IDEAS, OUTCOMES, outcome, stageOf } from "../lib/skola2030";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const source = readFileSync(new URL("../docs/skola2030/mk747-6-pielikums-matematika.txt", import.meta.url), "utf8");
const section = (title: string) => norm(source.split(`===== ${title} =====`)[1].split("=====")[0]);
const COLUMNS: Record<string, string> = {
  "3": section("BEIDZOT 3. KLASI"),
  "6": section("BEIDZOT 6. KLASI"),
  "9": section("BEIDZOT 9. KLASI"),
};
const HEADINGS = source.split("===== VIRSRAKSTI (pāri visām kolonnām) =====")[1].split("\n").map(norm).filter(Boolean);

test("every quoted outcome appears word for word in its own stage column of the standard", () => {
  for (const [key, text] of Object.entries(OUTCOMES)) {
    const [stage, code] = key.split(":");
    const [first, ...rest] = text.split("[..]").map(norm).filter(Boolean);
    assert.ok(COLUMNS[stage].includes(`${code}. ${first}`), `${key} does not match the standard`);
    for (const part of rest) assert.ok(COLUMNS[stage].includes(part), `${key}: "${part}" not found`);
  }
});

test("the six big ideas are quoted from the standard", () => {
  const all = norm(source);
  for (const [n, idea] of Object.entries(BIG_IDEAS)) {
    const heading = HEADINGS.find((h) => h.startsWith(`${n}. `));
    assert.ok(heading, `no heading for big idea ${n}`);
    const head = heading.slice(n.length + 2);
    assert.ok(idea.startsWith(head), `big idea ${n} differs from the standard`);
    const tail = norm(idea.slice(head.length));
    if (tail) assert.ok(all.includes(tail), `big idea ${n} tail not found`);
  }
});

test("every topic cites outcomes of its own grade's stage, and every quote is used", () => {
  const used = new Set<string>();
  for (const g of GRADES) {
    const stage = stageOf(g.grade);
    for (const t of g.topics) {
      assert.ok(t.skola2030.length > 0, `${t.id}: no Skola2030 outcome`);
      for (const code of t.skola2030) {
        assert.ok(outcome(stage, code), `${t.id} (grade ${g.grade}) cites ${code}, which is not a stage-${stage} outcome`);
        used.add(`${stage}:${code}`);
      }
    }
  }
  for (const key of Object.keys(OUTCOMES)) assert.ok(used.has(key), `${key} is quoted but no topic uses it`);
});

const textsOf = (ex: Exercise) => [ex.question.lv, ex.question.ru, ex.solution.lv, ex.hint.lv];
const numbersIn = (s: string) => (s.match(/\d+(?:,\d+)?/g) ?? []).map((n) => Number(n.replace(",", ".")));

test("exercises stay within the number ranges of their stage", () => {
  for (const g of GRADES) {
    for (const t of g.topics) {
      for (let seed = 0; seed < 300; seed++) {
        const ex = generateExercise(t.generator, seed);
        if (g.grade === 1) {
          // Grade 1 topics promise numbers up to 20 (3:3.2.2 "20 apjomā").
          for (const n of numbersIn(ex.question.lv)) assert.ok(n <= 20, `${t.id}: ${n} > 20 in "${ex.question.lv}"`);
          if (ex.kind === "number") assert.ok(ex.answer >= 0 && ex.answer <= 20, `${t.id}: answer ${ex.answer}`);
        }
        if (g.grade <= 3 && ex.kind === "number") {
          // 3:3.2.1 "saskaita un atņem 1000 apjomā"
          assert.ok(ex.answer >= 0 && ex.answer <= 1000, `${t.id}: answer ${ex.answer} outside 0–1000`);
          assert.ok(Number.isInteger(ex.answer), `${t.id}: grades 1–3 work with natural numbers`);
        }
      }
    }
  }
});

test("π and circle area appear only from grade 7 (stage 9 outcome 6.4.1)", () => {
  for (const g of GRADES.filter((x) => x.grade <= 6)) {
    for (const t of g.topics) {
      const content = [t.title, t.why, t.realCase.title, t.realCase.text, ...t.theory, ...t.askAi]
        .flatMap((x) => [x.lv, x.ru])
        .concat(t.formula ?? "");
      for (const c of content) assert.doesNotMatch(c, /π|πr/, `${t.id}: mentions π`);
      for (let seed = 0; seed < 100; seed++) {
        for (const s of textsOf(generateExercise(t.generator, seed))) assert.doesNotMatch(s, /π/, `${t.id}: exercise mentions π`);
      }
    }
  }
});
