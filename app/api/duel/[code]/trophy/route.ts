import Anthropic from "@anthropic-ai/sdk";
import { type TrophyFacts, getTrophy } from "@/lib/duel";
import { TROPHY_SCHEMA, type TrophySpec, classicSpec, normalizeSpec, trophyPrompt } from "@/lib/trophy";
import { tokenOf, withStore } from "../../http";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

/** Claude designs the trophy as structured JSON; any failure falls back to the built-in design. */
async function design(facts: TrophyFacts): Promise<TrophySpec> {
  const fallback = classicSpec(facts.code, facts.grade);
  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      // A creative one-off with a fixed shape: little thinking needed.
      output_config: { effort: "low", format: { type: "json_schema", schema: TROPHY_SCHEMA } },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content: trophyPrompt(facts) }],
    });
    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") return fallback;
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? normalizeSpec(JSON.parse(textBlock.text), fallback) : fallback;
  } catch (err) {
    console.error("trophy design failed", err instanceof Anthropic.APIError ? err.status : "", err);
    return fallback;
  }
}

/** Only the winner of a finished match gets an answer here. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return withStore(async (store) => {
    const { spec, winnerName, facts } = await getTrophy(store, code, tokenOf(req), design);
    return { spec, winnerName, grade: facts.grade, score: facts.score };
  });
}
