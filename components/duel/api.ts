import type { DuelView, LastResult } from "@/lib/duel";
import type { T } from "@/lib/i18n";
import type { TrophySpec } from "@/lib/trophy";

/** Browser side of the competition API. The player's secret token stays on this device. */

const tokenKey = (code: string) => `ciparini.duel.${code}`;

export function saveToken(code: string, token: string) {
  try {
    localStorage.setItem(tokenKey(code), token);
  } catch {
    /* without storage the match still works until the page is reloaded */
  }
  memoryTokens.set(code, token);
}

const memoryTokens = new Map<string, string>();

export function loadToken(code: string): string | null {
  try {
    return localStorage.getItem(tokenKey(code)) ?? memoryTokens.get(code) ?? null;
  } catch {
    return memoryTokens.get(code) ?? null;
  }
}

export function loadNick(): string {
  try {
    return localStorage.getItem("ciparini.nick") ?? "";
  } catch {
    return "";
  }
}

export function saveNick(name: string) {
  try {
    localStorage.setItem("ciparini.nick", name);
  } catch {
    /* ignore */
  }
}

export class DuelApiError extends Error {}

async function call<R>(url: string, init: RequestInit & { token?: string | null } = {}): Promise<R> {
  const { token, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(token ? { "x-duel-token": token } : {}) },
      cache: "no-store",
    });
  } catch {
    throw new DuelApiError("network");
  }
  const body = (await res.json().catch(() => ({}))) as R & { error?: string };
  if (!res.ok) throw new DuelApiError(body.error ?? "server");
  return body;
}

export const duelApi = {
  create: (name: string, grade: number, duration: number) =>
    call<{ code: string; token: string }>("/api/duel", { method: "POST", body: JSON.stringify({ name, grade, duration }) }),
  join: (code: string, name: string) =>
    call<{ code: string; token: string }>(`/api/duel/${code}/join`, { method: "POST", body: JSON.stringify({ name }) }),
  get: (code: string, token: string) => call<DuelView>(`/api/duel/${code}`, { token }),
  answer: (code: string, token: string, index: number, answer: string) =>
    call<{ view: DuelView; last: LastResult }>(`/api/duel/${code}/answer`, {
      method: "POST",
      token,
      body: JSON.stringify({ index, answer }),
    }),
  trophy: (code: string, token: string) =>
    call<{ spec: TrophySpec; winnerName: string; grade: number; score: number }>(`/api/duel/${code}/trophy`, {
      method: "POST",
      token,
    }),
};

export const ERRORS: Record<string, T> = {
  not_found: { lv: "Šāds kods nav atrasts. Pārbaudi ciparus.", ru: "Такой код не найден. Проверь цифры." },
  full: { lv: "Šajās sacensībās jau ir divi dalībnieki.", ru: "В этом соревновании уже два участника." },
  bad_request: { lv: "Ieraksti segvārdu (vismaz 2 burti) un pārbaudi kodu.", ru: "Впиши ник (минимум 2 буквы) и проверь код." },
  no_store: {
    lv: "Sacensību režīms vēl nav ieslēgts: administratoram jāpieslēdz Upstash Redis.",
    ru: "Режим соревнований ещё не включён: администратору нужно подключить Upstash Redis.",
  },
  busy: { lv: "Pārāk daudz sacensību pēc kārtas. Pagaidi mazliet.", ru: "Слишком много соревнований подряд. Подожди немного." },
  closed: { lv: "Laiks jau beidzies.", ru: "Время уже вышло." },
  forbidden: { lv: "Šīs sacensības nav atvērtas šajā ierīcē.", ru: "Это соревнование открыто не на этом устройстве." },
  network: { lv: "Nav savienojuma. Pārbaudi internetu.", ru: "Нет связи. Проверь интернет." },
  server: { lv: "Kaut kas nogāja greizi. Pamēģini vēlreiz.", ru: "Что-то пошло не так. Попробуй ещё раз." },
};

export const errorText = (e: unknown): T => ERRORS[e instanceof DuelApiError ? e.message : "server"] ?? ERRORS.server;

export const formatCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;
