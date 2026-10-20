"use client";

import { useRef, useState } from "react";
import { gradeAttrs } from "@/lib/grade-ui";
import { type T, UI } from "@/lib/i18n";
import type { ExerciseContext } from "@/lib/tutor";
import { useApp } from "../AppProvider";
import { Icon } from "../Icon";
import { Mascot } from "../Mascot";
import { persona, personaUI } from "@/lib/persona";
import { Sheet } from "../Sheet";
import { Messages } from "./Messages";
import { useScrollToLatestQuestion, useTutorChat } from "./useTutorChat";

const ACTIONS: Record<"start" | "explain" | "mistake" | "why", T> = {
  start: { lv: "Ar ko sākt?", ru: "С чего начать?" },
  explain: { lv: "Paskaidro risinājuma gaitu soli pa solim", ru: "Объясни ход решения по шагам" },
  mistake: { lv: "Kur es kļūdījos?", ru: "Где я ошибся?" },
  why: { lv: "Kāpēc tieši tā ir pareizi?", ru: "Почему именно так правильно?" },
};

/**
 * The grade's helper (Cipariņš … Cipara kungs) for the exercise on screen, in a bottom sheet. It knows the exact
 * task (the server rebuilds it from the seed), the child's wrong attempts and
 * whether they already solved it, so "explain the solution" is about *this* task.
 */
export function ExerciseTutor({
  grade,
  topicId,
  color,
  getContext,
  hasWrongAttempts,
  solved,
  host,
  onClose,
}: {
  grade: number;
  topicId: string;
  color: string;
  getContext: () => ExerciseContext;
  hasWrongAttempts: boolean;
  solved: boolean;
  /** The page the sheet attaches to. */
  host: HTMLElement;
  onClose: () => void;
}) {
  const { t } = useApp();
  const { messages, busy, send } = useTutorChat({ grade, topicId, exercise: getContext });
  const [input, setInput] = useState("");
  const helper = persona(grade);
  const helperUI = personaUI(helper);
  const scrollRef = useRef<HTMLDivElement>(null);

  useScrollToLatestQuestion(scrollRef, messages);

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    void send(text);
  };

  const quick = [
    solved ? ACTIONS.why : ACTIONS.start,
    ACTIONS.explain,
    ...(hasWrongAttempts && !solved ? [ACTIONS.mistake] : []),
  ];

  return (
    <Sheet host={host} label={t(helperUI.helps)} onClose={onClose}>
      {({ grab, close }) => (
        <div className="exercise-tutor" {...gradeAttrs(grade)}>
          <div className="exercise-tutor-head" {...grab}>
            <Mascot size={40} color={color} grade={grade} mood={busy ? "thinking" : "happy"} />
            <div>
              <strong>{t(helper.name)}</strong>
              <small>{t({ lv: "Redzu tavu uzdevumu un mēģinājumus", ru: "Вижу твою задачу и попытки" })}</small>
            </div>
            <button type="button" className="icon-btn small" onClick={close} aria-label={t({ lv: "Aizvērt", ru: "Закрыть" })}>
              <Icon name="xmark" size={16} />
            </button>
          </div>

          <div className="exercise-tutor-scroll" ref={scrollRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="msg assistant">
                {t({
                  lv: "Kopā izdomāsim šo uzdevumu! Izvēlies, ar ko palīdzēt:",
                  ru: "Давай разберёмся с этой задачей вместе! Выбери, чем помочь:",
                })}
              </div>
            )}
            <Messages messages={messages} />
          </div>

          <div className="quick-actions">
            {quick.map((q) => (
              <button key={q.lv} type="button" className="chip" onClick={() => ask(t(q))} disabled={busy}>
                {t(q)}
              </button>
            ))}
          </div>

          <form
            className="chat-input inline"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={t(UI.chatPlaceholder)}
              aria-label={t(UI.chatPlaceholder)}
            />
            <button className="btn primary send" type="submit" disabled={busy || !input.trim()} aria-label={t(UI.send)}>
              <Icon name="send" size={20} />
            </button>
          </form>
          <p className="disclaimer">{t(helperUI.aiDisclaimer)}</p>
        </div>
      )}
    </Sheet>
  );
}
