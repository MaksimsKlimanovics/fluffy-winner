import { createDuel } from "@/lib/duel";
import { jsonBody, tooManyMatches, withStore } from "./http";

export const runtime = "nodejs";

/** Opens a match and returns its six-digit invitation code. */
export async function POST(req: Request) {
  if (tooManyMatches(req)) return Response.json({ error: "busy" }, { status: 429 });
  const body = await jsonBody(req);
  return withStore((store) => createDuel(store, { name: body.name, grade: body.grade, duration: body.duration }));
}
