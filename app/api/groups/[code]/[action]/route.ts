import { adminView, challenge, heartbeat, joinGroup, leaveGroup, removeMember, respond } from "@/lib/groups";
import { jsonBody, withStore } from "../../../duel/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ code: string; action: string }> };

/** A child's secret and the group admin's secret travel in headers, never in URLs. */
const member = (req: Request) => req.headers.get("x-group-token");
const admin = (req: Request) => req.headers.get("x-group-admin");

export async function POST(req: Request, { params }: Params) {
  const { code, action } = await params;
  const b = await jsonBody(req);
  switch (action) {
    case "join":
      return withStore((s) => joinGroup(s, { code, name: b.name, grade: b.grade }));
    case "presence":
      return withStore((s) => heartbeat(s, { code, token: member(req), activity: b.activity, available: b.available }));
    case "challenge":
      return withStore((s) =>
        challenge(s, { code, token: member(req), targetId: b.targetId, grade: b.grade, duration: b.duration }),
      );
    case "respond":
      return withStore((s) => respond(s, { code, token: member(req), inviteId: b.inviteId, accept: b.accept }));
    case "leave":
      return withStore((s) => leaveGroup(s, { code, token: member(req) }));
    case "remove":
      return withStore((s) => removeMember(s, { code, adminToken: admin(req), memberId: b.memberId }));
    case "admin":
      return withStore((s) => adminView(s, { code, adminToken: admin(req) }));
    default:
      return Response.json({ error: "not_found" }, { status: 404 });
  }
}
