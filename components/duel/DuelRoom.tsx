"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getGrade } from "@/lib/curriculum";
import type { DuelView, LastResult, PublicQuestion } from "@/lib/duel";
import type { T } from "@/lib/i18n";
import { persona } from "@/lib/persona";
import { useApp } from "../AppProvider";
import { BottomNav, TopBar } from "../Chrome";
import { Icon } from "../Icon";
import { Mascot } from "../Mascot";
import { DuelApiError, duelApi, errorText, formatCode, loadToken } from "./api";
import { TrophyPanel } from "./TrophyPanel";

const POLL_MS = 1500;
/** How long the ✓ / ✗ stays before the next question. */
const FEEDBACK_MS = 900;

const L = {
  title: { lv: "Sacensības", ru: "Соревнования" },
  tellCode: { lv: "Pasaki draugam šo kodu", ru: "Скажи другу этот код" },
  waiting: { lv: "Gaidām draugu…", ru: "Ждём друга…" },
  share: { lv: "Dalīties ar saiti", ru: "Поделиться ссылкой" },
  copied: { lv: "Saite nokopēta", ru: "Ссылка скопирована" },
  getReady: { lv: "Gatavs? Sākam pēc", ru: "Готов? Начинаем через" },
  vs: { lv: "pret", ru: "против" },
  you: { lv: "Tu", ru: "Ты" },
  points: { lv: "punkti", ru: "очки" },
  answer: { lv: "Atbildēt", ru: "Ответить" },
  final: { lv: "Atbildi vairs nevarēs labot.", ru: "Ответ нельзя будет исправить." },
  yourAnswer: { lv: "Tava atbilde", ru: "Твой ответ" },
  right: { lv: "Pareizi! +10", ru: "Верно! +10" },
  wrongWas: { lv: "Nē. Pareizi:", ru: "Нет. Правильно:" },
  timeUp: { lv: "Laiks beidzies! Skaitām punktus…", ru: "Время вышло! Считаем очки…" },
  allDone: { lv: "Visi uzdevumi atrisināti! Gaidām zvanu…", ru: "Все задачи решены! Ждём звонка…" },
  win: { lv: "Tu uzvarēji!", ru: "Ты победил!" },
  lose: { lv: "Šoreiz uzvarēja", ru: "На этот раз победил(а)" },
  draw: { lv: "Neizšķirts!", ru: "Ничья!" },
  drawText: {
    lv: "Vienādi punkti tieši vienā laikā. Trofeja gaida nākamo spēli!",
    ru: "Одинаковые очки в одно и то же время. Кубок ждёт следующей игры!",
  },
  loseText: { lv: "Labs mēģinājums! Revanšs?", ru: "Хорошая попытка! Реванш?" },
  again: { lv: "Jaunas sacensības", ru: "Новое соревнование" },
  correct: { lv: "pareizi", ru: "верно" },
  notHere: { lv: "Pievienoties ar šo kodu", ru: "Присоединиться с этим кодом" },
} satisfies Record<string, T>;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function clock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function DuelRoom({ code }: { code: string }) {
  const { t } = useApp();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<DuelView | null>(null);
  const [error, setError] = useState<T | null>(null);
  const [question, setQuestion] = useState<PublicQuestion | undefined>();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [last, setLast] = useState<LastResult | null>(null);
  const [copied, setCopied] = useState(false);
  // Server clock minus device clock, so both players see the same countdown.
  const offset = useRef(0);
  const feedbackUntil = useRef(0);

  useEffect(() => setToken(loadToken(code)), [code]);

  const apply = useCallback((v: DuelView) => {
    offset.current = v.serverNow - Date.now();
    setView(v);
    // Keep the answered question (and its ✓/✗) on screen for a moment.
    if (Date.now() >= feedbackUntil.current) {
      setQuestion((q) => (q && v.question && q.index === v.question.index ? q : v.question));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const v = await duelApi.get(code, token);
        if (stop) return;
        apply(v);
        setError(null);
        if (v.status === "finished") return;
      } catch (e) {
        if (stop) return;
        setError(errorText(e));
        if (e instanceof DuelApiError && (e.message === "not_found" || e.message === "forbidden")) return;
      }
      timer = setTimeout(tick, POLL_MS);
    };
    void tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [code, token, apply]);

  const live = view?.status === "countdown" || view?.status === "playing";
  const now = useNow(live) + offset.current;

  const submit = async (answer: string) => {
    if (!token || !question || sending || !answer.trim()) return;
    setSending(true);
    try {
      const r = await duelApi.answer(code, token, question.index, answer);
      feedbackUntil.current = Date.now() + FEEDBACK_MS;
      setLast(r.last);
      offset.current = r.view.serverNow - Date.now();
      setView(r.view);
      setTimeout(() => {
        setLast(null);
        setInput("");
        setQuestion(r.view.question);
      }, FEEDBACK_MS);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSending(false);
    }
  };

  const share = async () => {
    const url = `${location.origin}/sacensibas?kods=${code}`;
    const text = t({ lv: `Izaicinu tevi Cipariņos! Kods: ${formatCode(code)}`, ru: `Вызываю тебя в Ципариньях! Код: ${formatCode(code)}` });
    try {
      if (navigator.share) await navigator.share({ title: "Cipariņi", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      }
    } catch {
      /* the child closed the share sheet */
    }
  };

  const g = view ? getGrade(view.grade) : undefined;
  const color = g?.color ?? "#5856d6";

  if (token === null) {
    return (
      <Shell title={t(L.title)} color={color}>
        <div className="duel-card center">
          <Mascot size={96} mood="thinking" />
          <p>{t(errorText(new DuelApiError("forbidden")))}</p>
          <Link className="btn primary" href={`/sacensibas?kods=${code}`}>
            {t(L.notHere)}
          </Link>
        </div>
      </Shell>
    );
  }

  if (!view) {
    return (
      <Shell title={t(L.title)} color={color}>
        <div className="duel-card center">
          {error ? <p className="feedback bad">{t(error)}</p> : <div className="typing" aria-label="…"><i /><i /><i /></div>}
        </div>
      </Shell>
    );
  }

  const opponent = view.opponent;
  const meta = `${view.grade}. ${t({ lv: "klase", ru: "класс" })} · ${view.duration / 60} ${t({ lv: "min", ru: "мин" })}`;

  return (
    <Shell title={t(L.title)} color={color}>
      {view.status === "waiting" && (
        <div className="duel-card center">
          <p className="eyebrow">{meta}</p>
          <h1>{t(L.tellCode)}</h1>
          <p className="duel-code" aria-label={code.split("").join(" ")}>
            {formatCode(code)}
          </p>
          <button className="btn ghost" type="button" onClick={share}>
            <Icon name="share" size={18} /> {t(copied ? L.copied : L.share)}
          </button>
          <div className="duel-wait">
            <Mascot size={64} grade={view.grade} color={color} mood="thinking" />
            <span>{t(L.waiting)}</span>
          </div>
        </div>
      )}

      {view.status !== "waiting" && (
        <Scoreboard view={view} now={now} you={t(L.you)} vs={t(L.vs)} color={color} />
      )}

      {view.status === "countdown" && view.startAt && (
        <div className="duel-card center">
          <p>{t(L.getReady)}</p>
          <p className="duel-count" key={Math.ceil((view.startAt - now) / 1000)}>
            {Math.max(1, Math.ceil((view.startAt - now) / 1000))}
          </p>
          <p className="eyebrow">{meta}</p>
        </div>
      )}

      {view.status === "playing" && view.endAt && (
        <>
          {now >= view.endAt ? (
            <div className="duel-card center">
              <Mascot size={80} grade={view.grade} color={color} mood="thinking" />
              <p>{t(L.timeUp)}</p>
            </div>
          ) : question ? (
            <div className={`exercise duel-q ${last ? (last.ok ? "status-correct" : "status-wrong") : ""}`} key={question.index}>
              <div className="exercise-head">
                <span className="badge">#{question.index + 1}</span>
                <small className="duel-final">
                  <Icon name="lock" size={14} /> {t(L.final)}
                </small>
              </div>
              <p className="exercise-q">{t(question.question)}</p>
              {question.kind === "choice" ? (
                <div className="choices">
                  {question.choices?.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`choice ${input === c ? (last ? (last.ok ? "right" : "bad") : "picked") : ""}`}
                      disabled={sending || !!last}
                      onClick={() => {
                        setInput(c);
                        void submit(c);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <form
                  className="answer-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit(input);
                  }}
                >
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t(L.yourAnswer)}
                    aria-label={t(L.yourAnswer)}
                    disabled={sending || !!last}
                  />
                  {question.unit && <span className="unit">{t(question.unit)}</span>}
                  <button className="btn primary" type="submit" disabled={sending || !!last || !input.trim()}>
                    {t(L.answer)}
                  </button>
                </form>
              )}
              {last && (
                <div className={`feedback ${last.ok ? "ok" : "bad"}`} role="status">
                  {last.ok ? (
                    <>
                      <Icon name="checkmark" size={18} /> {t(L.right)}
                    </>
                  ) : (
                    <>
                      <Icon name="xmark" size={18} /> {t(L.wrongWas)} <strong>{last.correct}</strong>
                      {last.unit ? ` ${t(last.unit)}` : ""}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="duel-card center">
              <p>{t(L.allDone)}</p>
            </div>
          )}
        </>
      )}

      {view.status === "finished" && view.result && opponent && (
        <div className="duel-card center">
          {view.result.outcome === "win" && (
            <>
              <Mascot size={110} grade={view.grade} color={color} mood="cheer" />
              <h1>{t(L.win)}</h1>
            </>
          )}
          {view.result.outcome === "lose" && (
            <>
              <Mascot size={96} grade={view.grade} color={color} mood="happy" />
              <h1>
                {t(L.lose)} {opponent.name}
              </h1>
              <p>{t(L.loseText)}</p>
            </>
          )}
          {view.result.outcome === "draw" && (
            <>
              <Mascot size={96} grade={view.grade} color={color} mood="cheer" />
              <h1>{t(L.draw)}</h1>
              <p>{t(L.drawText)}</p>
            </>
          )}
          <p className="duel-summary">
            {t(L.you)}: <strong>{view.me.score}</strong> ({view.me.correct}/{view.me.answered} {t(L.correct)}) · {opponent.name}:{" "}
            <strong>{opponent.score}</strong> ({opponent.correct}/{opponent.answered})
          </p>
        </div>
      )}

      {view.status === "finished" && view.result?.outcome === "win" && token && (
        <TrophyPanel code={code} token={token} helperName={t(persona(view.grade).name)} />
      )}

      {view.status === "finished" && (
        <Link className="btn primary big" href={`/sacensibas?klase=${view.grade}`}>
          <Icon name="refresh" size={18} /> {t(L.again)}
        </Link>
      )}

      {error && view.status !== "finished" && <p className="feedback bad">{t(error)}</p>}
    </Shell>
  );
}

function Shell({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="page" style={{ "--c": color } as React.CSSProperties}>
      <TopBar back="/sacensibas" backLabel={title} title={title} />
      <main className="content duel">{children}</main>
      <BottomNav />
    </div>
  );
}

function Scoreboard({ view, now, you, vs, color }: { view: DuelView; now: number; you: string; vs: string; color: string }) {
  const total = view.duration * 1000;
  const left = view.endAt ? Math.max(0, view.endAt - Math.max(now, view.startAt ?? now)) : total;
  const o = view.opponent;
  const lead = o ? Math.sign(view.me.score - o.score) : 0;
  return (
    <section className="duel-board" aria-live="polite">
      <div className={`duel-player me ${lead > 0 ? "lead" : ""}`}>
        <small>{you}</small>
        <strong>{view.me.name}</strong>
        <span className="duel-points">{view.me.score}</span>
      </div>
      <div className="duel-clock">
        <span className={left < 10_000 && view.status === "playing" ? "hurry" : ""}>{clock(left)}</span>
        <small>{vs}</small>
      </div>
      <div className={`duel-player ${lead < 0 ? "lead" : ""}`}>
        <small>&nbsp;</small>
        <strong>{o?.name ?? "…"}</strong>
        <span className="duel-points">{o?.score ?? 0}</span>
      </div>
      <div className="duel-timebar" style={{ "--c": color } as React.CSSProperties}>
        <span style={{ width: `${(left / total) * 100}%` }} />
      </div>
    </section>
  );
}
