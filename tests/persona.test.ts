import assert from "node:assert/strict";
import { test } from "node:test";
import { persona, personaUI } from "../lib/persona";
import { buildSystemPrompt } from "../lib/tutor";

test("the helper grows up from Cipariņš in grade 1 to Cipara kungs in grade 9", () => {
  assert.equal(persona(1).name.lv, "Cipariņš");
  assert.equal(persona(9).name.lv, "Cipara kungs");
  assert.equal(persona(5).name.lv, "Cipars");
  assert.equal(persona().name.lv, "Cipariņš");
  assert.equal(persona(42).grade, undefined);
  const voices = new Set(Array.from({ length: 9 }, (_, i) => persona(i + 1).voice));
  assert.equal(voices.size, 9, "every grade has its own voice");
});

test("interface strings use the right case of the name", () => {
  assert.equal(personaUI(persona(1)).askAi.lv, "Jautāt Cipariņam");
  assert.equal(personaUI(persona(9)).askAi.lv, "Jautāt Cipara kungam");
  assert.equal(personaUI(persona(9)).askAi.ru, "Спросить господина Ципарса");
});

test("the tutor prompt names the grade's helper", () => {
  assert.match(buildSystemPrompt("lv", 1), /you are "Cipariņš"/);
  assert.match(buildSystemPrompt("lv", 9), /you are "Cipara kungs"/);
  assert.match(buildSystemPrompt("ru"), /you are "Cipariņš"/);
});
