import { getGrade, getTopic } from "./curriculum";
import { DuelError, type DuelStore, cleanName, createDuel, declineDuel, isDuration, joinDuel } from "./duel";

/**
 * Groups ("Grupas"): a parent or teacher opens a group and shares its code;
 * children who join with that code see who in the group is online right now
 * and what they are doing, and can challenge each other. Nobody outside the
 * group can see or reach them, and the person who opened the group can
 * remove anyone who should not be there.
 *
 * Presence is a heartbeat: each open app reports every few seconds; a
 * child who has not reported for ONLINE_MS is offline.
 */

export const HEARTBEAT_MS = 10_000;
export const ONLINE_MS = 30_000;
const GROUP_TTL = 90 * 24 * 60 * 60;
const PRESENCE_TTL = 60 * 60;
const INVITE_MS = 90_000;
const MAX_MEMBERS = 60;
const MAX_GROUP_NAME = 32;
const MAX_INVITES_PER_MINUTE = 4;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export type Group = { code: string; name: string; createdAt: number; adminToken: string };
export type Member = { id: string; token: string; name: string; grade: number; joinedAt: number };

/** What a child is doing, as ids only; the text is built from our own curriculum. */
export type Activity =
  | { kind: "home" }
  | { kind: "grade"; grade: number }
  | { kind: "topic"; grade: number; topicId: string }
  | { kind: "chat" }
  /** On the competition page, ready to play. */
  | { kind: "lobby" }
  | { kind: "duel" };

export type Presence = { id: string; name: string; grade: number; activity: Activity; available: boolean; seenAt: number };

export type Invite = {
  id: string;
  fromId: string;
  fromName: string;
  fromGrade: number;
  duelCode: string;
  grade: number;
  duration: number;
  createdAt: number;
};

export type PresenceView = Omit<Presence, "seenAt"> & { me?: boolean };

const keys = {
  group: (code: string) => `grp:${code}`,
  members: (code: string) => `grp:${code}:members`,
  presence: (code: string) => `grp:${code}:presence`,
  inbox: (code: string, id: string) => `grp:${code}:inbox:${id}`,
  sent: (code: string, id: string) => `grp:${code}:sent:${id}`,
};

function randomString(alphabet: string, length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const newSecret = () => randomString("abcdefghijklmnopqrstuvwxyz0123456789", 32);

export function cleanGroupCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length === CODE_LENGTH && [...code].every((c) => CODE_ALPHABET.includes(c)) ? code : null;
}

function cleanGroupName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.normalize("NFC").replace(/[^\p{L}\p{N} .,_-]/gu, "").replace(/\s+/g, " ").trim().slice(0, MAX_GROUP_NAME);
  return name.length >= 2 ? name : null;
}

function cleanGrade(input: unknown): number | null {
  return typeof input === "number" && getGrade(input) ? input : null;
}

export function cleanActivity(input: unknown): Activity {
  const a = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const grade = cleanGrade(a.grade);
  if (a.kind === "topic" && grade && typeof a.topicId === "string" && getTopic(grade, a.topicId)) {
    return { kind: "topic", grade, topicId: a.topicId };
  }
  if (a.kind === "grade" && grade) return { kind: "grade", grade };
  if (a.kind === "chat" || a.kind === "duel" || a.kind === "lobby") return { kind: a.kind };
  return { kind: "home" };
}

async function loadGroup(store: DuelStore, code: unknown): Promise<Group> {
  const c = cleanGroupCode(code);
  const group = c ? await store.get<Group>(keys.group(c)) : null;
  if (!group) throw new DuelError("not_found", 404);
  return group;
}

async function memberByToken(store: DuelStore, group: Group, token: unknown): Promise<Member> {
  if (typeof token !== "string" || !token) throw new DuelError("forbidden", 403);
  const members = await store.hgetall<Member>(keys.members(group.code));
  const me = Object.values(members).find((m) => m.token === token);
  // A removed child's token no longer matches anyone.
  if (!me) throw new DuelError("forbidden", 403);
  return me;
}

// --- groups and members --------------------------------------------------------

export async function createGroup(
  store: DuelStore,
  input: { name: unknown },
  now = Date.now(),
  fixedCode?: string,
): Promise<{ code: string; adminToken: string; name: string }> {
  const name = cleanGroupName(input.name);
  if (!name) throw new DuelError("bad_request", 400);
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = fixedCode ?? randomString(CODE_ALPHABET, CODE_LENGTH);
    const group: Group = { code, name, createdAt: now, adminToken: newSecret() };
    if (await store.set(keys.group(code), group, { ex: GROUP_TTL, nx: true })) {
      return { code, adminToken: group.adminToken, name };
    }
    if (fixedCode) break;
  }
  throw new DuelError("full", 503);
}

export async function joinGroup(
  store: DuelStore,
  input: { code: unknown; name: unknown; grade: unknown },
  now = Date.now(),
): Promise<{ code: string; groupName: string; memberId: string; token: string }> {
  const group = await loadGroup(store, input.code);
  const name = cleanName(input.name);
  const grade = cleanGrade(input.grade);
  if (!name || !grade) throw new DuelError("bad_request", 400);
  const members = await store.hgetall<Member>(keys.members(group.code));
  if (Object.keys(members).length >= MAX_MEMBERS) throw new DuelError("full", 409);
  const member: Member = { id: randomString("abcdefghijkmnpqrstuvwxyz23456789", 10), token: newSecret(), name, grade, joinedAt: now };
  await store.hset(keys.members(group.code), member.id, member, { ex: GROUP_TTL });
  // Using the group keeps it alive.
  await store.set(keys.group(group.code), group, { ex: GROUP_TTL });
  return { code: group.code, groupName: group.name, memberId: member.id, token: member.token };
}

export async function leaveGroup(store: DuelStore, input: { code: unknown; token: unknown }): Promise<{ ok: true }> {
  const group = await loadGroup(store, input.code);
  const me = await memberByToken(store, group, input.token);
  await store.hdel(keys.members(group.code), me.id);
  await store.hdel(keys.presence(group.code), me.id);
  return { ok: true };
}

// --- presence -------------------------------------------------------------------

/**
 * Reports this child as online and returns who else is online, plus any
 * challenges waiting for them. Offline entries are pruned as we go.
 */
export async function heartbeat(
  store: DuelStore,
  input: { code: unknown; token: unknown; activity: unknown; available: unknown },
  now = Date.now(),
): Promise<{ groupName: string; me: PresenceView; online: PresenceView[]; invites: Invite[] }> {
  const group = await loadGroup(store, input.code);
  const me = await memberByToken(store, group, input.token);
  const mine: Presence = {
    id: me.id,
    name: me.name,
    grade: me.grade,
    activity: cleanActivity(input.activity),
    available: input.available !== false,
    seenAt: now,
  };
  await store.hset(keys.presence(group.code), me.id, mine, { ex: PRESENCE_TTL });

  const all = await store.hgetall<Presence>(keys.presence(group.code));
  const online: PresenceView[] = [];
  for (const p of Object.values(all)) {
    if (now - p.seenAt > ONLINE_MS) {
      await store.hdel(keys.presence(group.code), p.id);
      continue;
    }
    if (p.id !== me.id) online.push(strip(p));
  }
  online.sort((a, b) => a.name.localeCompare(b.name));

  const inbox = await store.hgetall<Invite>(keys.inbox(group.code, me.id));
  const invites: Invite[] = [];
  for (const inv of Object.values(inbox)) {
    if (now - inv.createdAt > INVITE_MS) await store.hdel(keys.inbox(group.code, me.id), inv.id);
    else invites.push(inv);
  }
  invites.sort((a, b) => a.createdAt - b.createdAt);

  return { groupName: group.name, me: { ...strip(mine), me: true }, online, invites };
}

function strip(p: Presence): PresenceView {
  const { seenAt: _seen, ...rest } = p;
  return rest;
}

// --- challenges -----------------------------------------------------------------

/**
 * Opens a match for the challenger (as in the code flow) and drops an
 * invitation into the friend's inbox. Only an online friend who has not
 * switched "available" off can be challenged, and only a few times a minute.
 */
export async function challenge(
  store: DuelStore,
  input: { code: unknown; token: unknown; targetId: unknown; grade: unknown; duration: unknown },
  now = Date.now(),
): Promise<{ duelCode: string; duelToken: string }> {
  const group = await loadGroup(store, input.code);
  const me = await memberByToken(store, group, input.token);
  const grade = cleanGrade(input.grade);
  if (typeof input.targetId !== "string" || input.targetId === me.id || !grade || !isDuration(input.duration)) {
    throw new DuelError("bad_request", 400);
  }
  const target = (await store.hgetall<Presence>(keys.presence(group.code)))[input.targetId];
  if (!target || now - target.seenAt > ONLINE_MS || !target.available || target.activity.kind === "duel") {
    throw new DuelError("closed", 409);
  }

  const sentKey = keys.sent(group.code, me.id);
  const recent = ((await store.get<number[]>(sentKey)) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= MAX_INVITES_PER_MINUTE) throw new DuelError("full", 429);
  await store.set(sentKey, [...recent, now], { ex: 60 });

  const duel = await createDuel(store, { name: me.name, grade, duration: input.duration }, now);
  const invite: Invite = {
    id: randomString("abcdefghijkmnpqrstuvwxyz23456789", 10),
    fromId: me.id,
    fromName: me.name,
    fromGrade: me.grade,
    duelCode: duel.code,
    grade,
    duration: input.duration,
    createdAt: now,
  };
  await store.hset(keys.inbox(group.code, target.id), invite.id, invite, { ex: INVITE_MS / 1000 + 60 });
  return { duelCode: duel.code, duelToken: duel.token };
}

/** Accepting joins the match as the second player; declining tells the challenger. */
export async function respond(
  store: DuelStore,
  input: { code: unknown; token: unknown; inviteId: unknown; accept: unknown },
  now = Date.now(),
): Promise<{ duelCode: string; duelToken?: string }> {
  const group = await loadGroup(store, input.code);
  const me = await memberByToken(store, group, input.token);
  if (typeof input.inviteId !== "string") throw new DuelError("bad_request", 400);
  const inboxKey = keys.inbox(group.code, me.id);
  const invite = (await store.hgetall<Invite>(inboxKey))[input.inviteId];
  if (!invite || now - invite.createdAt > INVITE_MS) throw new DuelError("closed", 409);
  await store.hdel(inboxKey, invite.id);
  if (input.accept !== true) {
    await declineDuel(store, invite.duelCode);
    return { duelCode: invite.duelCode };
  }
  const joined = await joinDuel(store, { code: invite.duelCode, name: me.name }, now);
  return { duelCode: joined.code, duelToken: joined.token };
}

// --- the person who opened the group ----------------------------------------------

async function asAdmin(store: DuelStore, code: unknown, adminToken: unknown): Promise<Group> {
  const group = await loadGroup(store, code);
  if (typeof adminToken !== "string" || adminToken !== group.adminToken) throw new DuelError("forbidden", 403);
  return group;
}

export async function adminView(
  store: DuelStore,
  input: { code: unknown; adminToken: unknown },
  now = Date.now(),
): Promise<{ code: string; name: string; members: { id: string; name: string; grade: number; online: boolean; joinedAt: number }[] }> {
  const group = await asAdmin(store, input.code, input.adminToken);
  const [members, presence] = await Promise.all([
    store.hgetall<Member>(keys.members(group.code)),
    store.hgetall<Presence>(keys.presence(group.code)),
  ]);
  return {
    code: group.code,
    name: group.name,
    members: Object.values(members)
      .map((m) => ({
        id: m.id,
        name: m.name,
        grade: m.grade,
        joinedAt: m.joinedAt,
        online: !!presence[m.id] && now - presence[m.id].seenAt <= ONLINE_MS,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function removeMember(
  store: DuelStore,
  input: { code: unknown; adminToken: unknown; memberId: unknown },
): Promise<{ ok: true }> {
  const group = await asAdmin(store, input.code, input.adminToken);
  if (typeof input.memberId !== "string") throw new DuelError("bad_request", 400);
  await store.hdel(keys.members(group.code), input.memberId);
  await store.hdel(keys.presence(group.code), input.memberId);
  await store.del(keys.inbox(group.code, input.memberId));
  return { ok: true };
}
