import { getDuel } from "@/lib/duel";
import { tokenOf, withStore } from "../http";

export const runtime = "nodejs";

/** The match as this player sees it: clock, scores, and their current question. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return withStore((store) => getDuel(store, code, tokenOf(req)));
}
