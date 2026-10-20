import assert from "node:assert/strict";
import { test } from "node:test";
import { GRADES } from "../lib/curriculum";
import { bandOf, gradeAttrs, usesKeypad } from "../lib/grade-ui";

test("every topic has its own line glyph (no emoji fallback)", async () => {
  const src = await import("node:fs").then((fs) => fs.readFileSync(new URL("../components/TopicGlyph.tsx", import.meta.url), "utf8"));
  for (const g of GRADES) {
    for (const topic of g.topics) {
      assert.ok(src.includes(`"${topic.id}":`) || src.includes(`  ${topic.id}:`), `no glyph for ${g.grade}/${topic.id}`);
    }
  }
});

test("the interface bands follow the Skola2030 stages", () => {
  assert.deepEqual([1, 2, 3].map(bandOf), ["young", "young", "young"]);
  assert.deepEqual([4, 5, 6].map(bandOf), ["middle", "middle", "middle"]);
  assert.deepEqual([7, 8, 9].map(bandOf), ["teen", "teen", "teen"]);
  assert.equal(usesKeypad(2), true);
  assert.equal(usesKeypad(3), false);
  assert.deepEqual(gradeAttrs(undefined), {});
  assert.deepEqual(gradeAttrs(5), { "data-grade": "5", "data-band": "middle" });
});
