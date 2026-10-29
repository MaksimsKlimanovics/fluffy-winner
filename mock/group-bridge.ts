import { GRADES } from "@/lib/curriculum";
import { DuelError } from "@/lib/duel";
import {
  type Activity,
  adminView,
  challenge,
  createGroup,
  heartbeat,
  joinGroup,
  leaveGroup,
  removeMember,
  respond,
} from "@/lib/groups";
import { runBot, store } from "./sim";

/**
 * Groups in the clickable mock: the same lib/groups.ts code with the in-memory
 * store, and a demo class (code KLASE5) whose classmates are simulated. They
 * wander between topics, accept most challenges, and one of them challenges
 * you about half a minute after you join.
 */

export const DEMO_GROUP = "KLASE5";

type Bot = { name: string; grade: number; token: string; memberId: string; available: boolean };
const bots: Bot[] = [];
let challengedYou = false;

function pickActivity(grade: number): Activity {
  const r = Math.random();
  if (r < 0.15) return { kind: "chat" };
  if (r < 0.3) return { kind: "lobby" };
  const topics = GRADES.find((g) => g.grade === grade)!.topics;
  return { kind: "topic", grade, topicId: topics[Math.floor(Math.random() * topics.length)].id };
}

async function botTick(bot: Bot) {
  try {
    const r = await heartbeat(store, { code: DEMO_GROUP, token: bot.token, activity: pickActivity(bot.grade), available: bot.available });
    for (const inv of r.invites) {
      setTimeout(async () => {
        const accept = Math.random() < 0.8;
        const res = await respond(store, { code: DEMO_GROUP, token: bot.token, inviteId: inv.id, accept });
        if (accept && res.duelToken) runBot(res.duelCode, res.duelToken);
      }, 2000 + Math.random() * 2000);
    }
    // Once, the first classmate challenges the real child.
    const you = r.online.find((p) => !bots.some((b) => b.memberId === p.id) && p.available && p.activity.kind !== "duel");
    if (you && !challengedYou && bot === bots[0]) {
      challengedYou = true;
      setTimeout(async () => {
        try {
          const duel = await challenge(store, { code: DEMO_GROUP, token: bot.token, targetId: you.id, grade: you.grade, duration: 60 });
          runBot(duel.duelCode, duel.duelToken);
        } catch {
          challengedYou = false;
        }
      }, 25_000);
    }
  } catch {
    /* ignore */
  }
}

const ready = (async () => {
  await createGroup(store, { name: "Demo klase" }, Date.now(), DEMO_GROUP);
  const people: [string, number, boolean][] = [
    ["Pūcīte", 4, true],
    ["Zibens", 6, true],
    ["Lācītis", 2, true],
    ["Ezītis", 5, false],
  ];
  for (const [name, grade, available] of people) {
    const m = await joinGroup(store, { code: DEMO_GROUP, name, grade });
    bots.push({ name, grade, available, token: m.token, memberId: m.memberId });
  }
  for (const bot of bots) {
    void botTick(bot);
    setInterval(() => void botTick(bot), 8000 + Math.random() * 3000);
  }
})();

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function handleGroups(url: URL, init: RequestInit | undefined): Promise<Response> {
  await ready;
  const headers = new Headers(init?.headers);
  const token = headers.get("x-group-token");
  const adminToken = headers.get("x-group-admin");
  let b: Record<string, unknown> = {};
  try {
    b = JSON.parse(String(init?.body ?? "{}"));
  } catch {
    /* empty */
  }
  const [, , code, action] = url.pathname.split("/").filter(Boolean);
  try {
    if (!code) return json(await createGroup(store, { name: b.name }));
    switch (action) {
      case "join":
        return json(await joinGroup(store, { code, name: b.name, grade: b.grade }));
      case "presence":
        return json(await heartbeat(store, { code, token, activity: b.activity, available: b.available }));
      case "challenge":
        return json(await challenge(store, { code, token, targetId: b.targetId, grade: b.grade, duration: b.duration }));
      case "respond":
        return json(await respond(store, { code, token, inviteId: b.inviteId, accept: b.accept }));
      case "leave":
        return json(await leaveGroup(store, { code, token }));
      case "admin":
        return json(await adminView(store, { code, adminToken }));
      case "remove":
        return json(await removeMember(store, { code, adminToken, memberId: b.memberId }));
    }
    return json({ error: "not_found" }, 404);
  } catch (err) {
    if (err instanceof DuelError) return json({ error: err.code }, err.status);
    return json({ error: "server" }, 500);
  }
}
