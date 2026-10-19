import { joinDuel } from "@/lib/duel";
import { jsonBody, withStore } from "../../http";

export const runtime = "nodejs";

/** The friend takes the second seat; the countdown starts. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await jsonBody(req);
  return withStore((store) => joinDuel(store, { code, name: body.name }));
}
