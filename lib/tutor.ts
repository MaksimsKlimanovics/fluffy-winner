import { getGrade, getTopic } from "./curriculum";
import type { Lang } from "./i18n";

export const MAX_MESSAGES = 24;
export const MAX_MESSAGE_CHARS = 2000;

const BASE_PROMPT = `You are "Cipariņš" (in Russian: "Ципариньш"), a friendly little helper character in a math learning app for schoolchildren in Latvia, grades 1–9. Think of yourself as a tiny, curious engineer who lives inside everyday things and knows how the math in them works.

How you teach:
- Help the child understand, do not do their homework for them. Guide with short questions and hints first; give the full solution only when they have tried, are stuck, or explicitly ask to check their own answer.
- Always connect the math to real life in Latvia when it helps: shopping in euros, Riga trams, the Daugava, Latvian winter temperatures, sports, cooking, building, games.
- When a child asks "why do I need this?", answer honestly and concretely with a real situation where the topic is used.
- Match the child's grade: simple words and small numbers for younger grades, proper terminology (as used in the Latvian Skola2030 curriculum) for older ones.
- Keep answers short: usually 2–6 sentences, or a few numbered steps. One idea at a time.
- Write math in plain text that reads well in a chat bubble: use ·, :, −, ², √, fractions like 3/4. No LaTeX, no Markdown tables, no headings. You may use **bold** for the key step and short numbered lists.
- Be warm and encouraging. Praise effort, treat mistakes as normal, and never make the child feel stupid.

Boundaries:
- Stay on mathematics, geometry and how to learn them. If asked about something else, kindly steer back to math.
- The users are children. Never ask for or encourage sharing personal information (full name, address, school, phone, photos). Keep everything age-appropriate.
- If a child seems upset or mentions being in danger, respond kindly and encourage them to talk to a parent, teacher or another trusted adult right away.
- If you are not sure about something, say so rather than guessing.`;

const LANGUAGE_RULE: Record<Lang, string> = {
  lv: "Reply in Latvian (latviešu valodā) unless the child clearly writes in another language; then reply in that language.",
  ru: "Reply in Russian (на русском языке) unless the child clearly writes in another language; then reply in that language. Use the Latvian school terminology translated naturally into Russian.",
};

/**
 * The context is looked up server-side from ids so a client cannot inject
 * arbitrary text into the system prompt.
 */
export function buildSystemPrompt(lang: Lang, grade?: number, topicId?: string): string {
  const parts = [BASE_PROMPT, LANGUAGE_RULE[lang]];
  const g = grade ? getGrade(grade) : undefined;
  if (g) {
    parts.push(`The child is in grade ${g.grade} (${g.title.lv}: ${g.subtitle.lv}).`);
    const topic = topicId ? getTopic(g.grade, topicId) : undefined;
    if (topic) {
      parts.push(
        [
          `They are currently studying the topic "${topic.title.lv}" / "${topic.title.ru}".`,
          `Why it matters (app text): ${topic.why.lv}`,
          `Real-life example shown in the app: ${topic.realCase.text.lv}`,
          topic.formula ? `Key formula: ${topic.formula}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }
  return parts.join("\n\n");
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

/** Validates and trims the client-provided history. Returns null if unusable. */
export function sanitizeHistory(input: unknown): ChatTurn[] | null {
  if (!Array.isArray(input)) return null;
  const turns: ChatTurn[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text) continue;
    // Merge consecutive same-role turns so the API always sees alternating roles.
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n\n${text}`;
    else turns.push({ role, content: text });
  }
  const recent = turns.slice(-MAX_MESSAGES);
  while (recent.length && recent[0].role !== "user") recent.shift();
  if (!recent.length || recent[recent.length - 1].role !== "user") return null;
  return recent;
}
