import { answerDuel } from "@/lib/duel";
import { jsonBody, tokenOf, withStore } from "../../http";

export const runtime = "nodejs";

/** One final answer to the current question; returns the verdict and the next question. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await jsonBody(req);
  return withStore((store) => answerDuel(store, { code, token: tokenOf(req), index: body.index, answer: body.answer }));
}
