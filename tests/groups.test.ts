import assert from "node:assert/strict";
import { test } from "node:test";
import { DuelError, getDuel } from "../lib/duel";
import { MemoryStore } from "../lib/duel-store";
import {
  ONLINE_MS,
  adminView,
  challenge,
  cleanActivity,
  cleanGroupCode,
  createGroup,
  heartbeat,
  joinGroup,
  removeMember,
  respond,
} from "../lib/groups";

const T0 = 1_800_000_000_000;

async function rejects(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => e instanceof DuelError && e.code === code);
}

async function setup() {
  const store = new MemoryStore();
  const g = await createGroup(store, { name: "5.b klase" }, T0);
  const anna = await joinGroup(store, { code: g.code, name: "Anna", grade: 5 }, T0);
  const peteris = await joinGroup(store, { code: g.code, name: "Pēteris", grade: 5 }, T0);
  return { store, g, anna, peteris };
}

const home = { kind: "home" };

test("group codes are six unambiguous characters", async () => {
  const store = new MemoryStore();
  const g = await createGroup(store, { name: "Ģimene" }, T0);
  assert.match(g.code, /^[A-HJ-NP-Z2-9]{6}$/);
  assert.equal(cleanGroupCode(g.code.toLowerCase()), g.code);
  assert.equal(cleanGroupCode("O0I1AB"), null);
  await rejects(joinGroup(store, { code: "ZZZZZZ", name: "Anna", grade: 3 }), "not_found");
  await rejects(joinGroup(store, { code: g.code, name: "A", grade: 3 }), "bad_request");
});

test("only what the curriculum knows can be reported as an activity", () => {
  assert.deepEqual(cleanActivity({ kind: "topic", grade: 2, topicId: "saskaitisana-100" }), {
    kind: "topic",
    grade: 2,
    topicId: "saskaitisana-100",
  });
  assert.deepEqual(cleanActivity({ kind: "topic", grade: 2, topicId: "<script>" }), { kind: "home" });
  assert.deepEqual(cleanActivity({ kind: "chat", text: "hi" }), { kind: "chat" });
});

test("members see who in their group is online, and nobody else", async () => {
  const { store, g, anna, peteris } = await setup();
  const other = await createGroup(store, { name: "Cita klase" }, T0);
  const stranger = await joinGroup(store, { code: other.code, name: "Svešais", grade: 5 }, T0);

  await heartbeat(store, { code: g.code, token: peteris.token, activity: { kind: "grade", grade: 5 }, available: true }, T0);
  await heartbeat(store, { code: other.code, token: stranger.token, activity: home, available: true }, T0);

  const seen = await heartbeat(store, { code: g.code, token: anna.token, activity: home, available: true }, T0 + 1000);
  assert.deepEqual(seen.online.map((p) => p.name), ["Pēteris"]);
  assert.deepEqual(seen.online[0].activity, { kind: "grade", grade: 5 });
  assert.equal("token" in seen.online[0], false, "secrets never leave the server");

  // A token from another group does not open this one.
  await rejects(heartbeat(store, { code: g.code, token: stranger.token, activity: home, available: true }), "forbidden");

  // Silent for too long = offline.
  const later = await heartbeat(store, { code: g.code, token: anna.token, activity: home, available: true }, T0 + ONLINE_MS + 5000);
  assert.deepEqual(later.online, []);
});

test("a challenge reaches the friend, who accepts or declines", async () => {
  const { store, g, anna, peteris } = await setup();
  await heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: true }, T0);

  const sent = await challenge(store, { code: g.code, token: anna.token, targetId: peteris.memberId, grade: 5, duration: 120 }, T0 + 100);
  const inbox = await heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: true }, T0 + 200);
  assert.equal(inbox.invites.length, 1);
  assert.equal(inbox.invites[0].fromName, "Anna");
  assert.equal(inbox.invites[0].duelCode, sent.duelCode);

  const joined = await respond(store, { code: g.code, token: peteris.token, inviteId: inbox.invites[0].id, accept: true }, T0 + 300);
  assert.ok(joined.duelToken);
  const view = await getDuel(store, sent.duelCode, sent.duelToken, T0 + 400);
  assert.equal(view.status, "countdown");
  assert.equal(view.opponent?.name, "Pēteris");

  // The invitation is used up.
  await rejects(respond(store, { code: g.code, token: peteris.token, inviteId: inbox.invites[0].id, accept: true }), "closed");

  // A second challenge, declined: the challenger's waiting room learns about it.
  await heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: true }, T0 + 500);
  const again = await challenge(store, { code: g.code, token: anna.token, targetId: peteris.memberId, grade: 5, duration: 60 }, T0 + 600);
  const box = await heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: true }, T0 + 700);
  await respond(store, { code: g.code, token: peteris.token, inviteId: box.invites[0].id, accept: false }, T0 + 800);
  assert.equal((await getDuel(store, again.duelCode, again.duelToken, T0 + 900)).declined, true);
});

test("nobody can be challenged while offline, busy or unavailable, nor too often", async () => {
  const { store, g, anna, peteris } = await setup();
  const ask = (now: number) =>
    challenge(store, { code: g.code, token: anna.token, targetId: peteris.memberId, grade: 5, duration: 60 }, now);

  await rejects(ask(T0), "closed"); // never online
  await heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: false }, T0);
  await rejects(ask(T0 + 100), "closed"); // switched off
  await heartbeat(store, { code: g.code, token: peteris.token, activity: { kind: "duel" }, available: true }, T0 + 200);
  await rejects(ask(T0 + 300), "closed"); // already in a match
  await rejects(
    challenge(store, { code: g.code, token: anna.token, targetId: anna.memberId, grade: 5, duration: 60 }),
    "bad_request",
  );

  await heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: true }, T0 + 400);
  for (let i = 0; i < 4; i++) await ask(T0 + 500 + i);
  await rejects(ask(T0 + 600), "full"); // at most four a minute
});

test("the group's admin sees everyone and can remove a child", async () => {
  const { store, g, anna, peteris } = await setup();
  await rejects(adminView(store, { code: g.code, adminToken: anna.token }), "forbidden");
  await heartbeat(store, { code: g.code, token: anna.token, activity: home, available: true }, T0);

  const view = await adminView(store, { code: g.code, adminToken: g.adminToken }, T0 + 1000);
  assert.deepEqual(
    view.members.map((m) => [m.name, m.online]),
    [
      ["Anna", true],
      ["Pēteris", false],
    ],
  );

  await removeMember(store, { code: g.code, adminToken: g.adminToken, memberId: peteris.memberId });
  await rejects(heartbeat(store, { code: g.code, token: peteris.token, activity: home, available: true }), "forbidden");
  assert.equal((await adminView(store, { code: g.code, adminToken: g.adminToken })).members.length, 1);
});
