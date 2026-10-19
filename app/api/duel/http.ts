import { DuelError, type DuelStore } from "@/lib/duel";
import { duelStore } from "@/lib/duel-store";

/** Shared plumbing for the competition API routes. */
export async function withStore(fn: (store: DuelStore) => Promise<unknown>): Promise<Response> {
  const store = duelStore();
  if (!store) return Response.json({ error: "no_store" }, { status: 503 });
  try {
    return Response.json(await fn(store), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof DuelError) return Response.json({ error: err.code }, { status: err.status });
    console.error("duel request failed", err);
    return Response.json({ error: "server" }, { status: 500 });
  }
}

export async function jsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** The player's secret travels in a header, never in a URL that could be logged or shared. */
export const tokenOf = (req: Request) => req.headers.get("x-duel-token");

// Best-effort per-instance limit on opening matches, like the chat route.
const opened = new Map<string, number[]>();
export function tooManyMatches(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (opened.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  opened.set(ip, recent);
  if (opened.size > 5000) opened.clear();
  return recent.length > 20;
}
