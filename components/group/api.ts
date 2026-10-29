import type { Activity, Invite, PresenceView } from "@/lib/groups";
import { DuelApiError } from "../duel/api";

/** Browser side of groups. The child's and the admin's secrets stay on this device. */

export type GroupSession = { code: string; groupName: string; memberId: string; token: string; name: string; grade: number };
export type AdminSession = { code: string; name: string; adminToken: string };

export type HeartbeatResult = { groupName: string; me: PresenceView; online: PresenceView[]; invites: Invite[] };
export type AdminMember = { id: string; name: string; grade: number; online: boolean; joinedAt: number };

function load<V>(key: string): V | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as V) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const storedGroup = () => load<GroupSession>("ciparini.group");
export const saveGroup = (s: GroupSession | null) => save("ciparini.group", s);
export const storedAdmin = () => load<AdminSession>("ciparini.groupAdmin");
export const saveAdmin = (s: AdminSession | null) => save("ciparini.groupAdmin", s);

async function call<R>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<R> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch {
    throw new DuelApiError("network");
  }
  const json = (await res.json().catch(() => ({}))) as R & { error?: string };
  if (!res.ok) throw new DuelApiError(json.error ?? "server");
  return json;
}

const asMember = (s: GroupSession) => ({ "x-group-token": s.token });
const asAdmin = (s: AdminSession) => ({ "x-group-admin": s.adminToken });

export const groupApi = {
  create: (name: string) => call<{ code: string; adminToken: string; name: string }>("/api/groups", { name }),
  join: (code: string, name: string, grade: number) =>
    call<{ code: string; groupName: string; memberId: string; token: string }>(`/api/groups/${code}/join`, { name, grade }),
  heartbeat: (s: GroupSession, activity: Activity, available: boolean) =>
    call<HeartbeatResult>(`/api/groups/${s.code}/presence`, { activity, available }, asMember(s)),
  challenge: (s: GroupSession, targetId: string, grade: number, duration: number) =>
    call<{ duelCode: string; duelToken: string }>(`/api/groups/${s.code}/challenge`, { targetId, grade, duration }, asMember(s)),
  respond: (s: GroupSession, inviteId: string, accept: boolean) =>
    call<{ duelCode: string; duelToken?: string }>(`/api/groups/${s.code}/respond`, { inviteId, accept }, asMember(s)),
  leave: (s: GroupSession) => call<{ ok: true }>(`/api/groups/${s.code}/leave`, {}, asMember(s)),
  admin: (a: AdminSession) => call<{ code: string; name: string; members: AdminMember[] }>(`/api/groups/${a.code}/admin`, {}, asAdmin(a)),
  remove: (a: AdminSession, memberId: string) => call<{ ok: true }>(`/api/groups/${a.code}/remove`, { memberId }, asAdmin(a)),
};

/** What the page path says the child is doing. Only ids leave the device. */
export function activityFromPath(path: string): Activity {
  const topic = path.match(/^\/klase\/(\d)\/([a-z0-9-]+)/);
  if (topic) return { kind: "topic", grade: Number(topic[1]), topicId: topic[2] };
  const grade = path.match(/^\/klase\/(\d)/);
  if (grade) return { kind: "grade", grade: Number(grade[1]) };
  if (path.startsWith("/chat")) return { kind: "chat" };
  if (/^\/sacensibas\/\d{6}/.test(path)) return { kind: "duel" };
  if (path.startsWith("/sacensibas")) return { kind: "lobby" };
  return { kind: "home" };
}
