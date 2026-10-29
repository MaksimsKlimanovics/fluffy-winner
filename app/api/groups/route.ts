import { createGroup } from "@/lib/groups";
import { jsonBody, tooManyMatches, withStore } from "../duel/http";

export const runtime = "nodejs";

/** A parent or teacher opens a group; the answer holds its code and their admin secret. */
export async function POST(req: Request) {
  if (tooManyMatches(req)) return Response.json({ error: "busy" }, { status: 429 });
  const body = await jsonBody(req);
  return withStore((store) => createGroup(store, { name: body.name }));
}
