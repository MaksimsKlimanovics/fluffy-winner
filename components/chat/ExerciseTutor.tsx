"use client";

import { useEffect, useRef, useState } from "react";
import { type T, UI } from "@/lib/i18n";
import type { ExerciseContext } from "@/lib/tutor";
import { useApp } from "../AppProvider";
import { Mascot } from "../Mascot";
import { Messages } from "./Messages";
import { useTutorChat } from "./useTutorChat";

const ACTIONS: Record<"start" | "explain" | "mistake" | "why", T> = {
  start: { lv: "Ar ko sākt?", ru: "С чего начать?" },
  explain: { lv: "Paskaidro risinājuma gaitu soli pa solim", ru: "Объясни ход решения по шагам" },
  mistake: { lv: "Kur es kļūdījos?", ru: "Где я ошибся?" },
  why: { lv: "Kāpēc tieši tā ir pareizi?", ru: "Почему именно так правильно?" },
};

/**
 * Cipariņš inside the exercise card. It knows the exact task on screen (the
 * server rebuilds it from the seed), the child's wrong attempts and whether
 * they already solved it, so "explain the solution" is about *this* task.
 */
export function ExerciseTutor({
  grade,
  topicId,
  color,
  getContext,
  hasWrongAttempts,
  solved,
  onClose,
}: {
  grade: number;
  topicId: string;
  color: string;
  getContext: () => ExerciseContext;
  hasWrongAttempts: boolean;
  solved: boolean;
  onClose: () => void;
}) {
  const { t } = useApp();
  const { messages, busy, send } = useTutorChat({ grade, topicId, exercise: getContext });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
    <div className="exercise-tutor" style={{ "--c": color } as React.CSSProperties}>
      <div className="exercise-tutor-head">
        <Mascot size={40} color={color} mood={busy ? "thinking" : "happy"} />
        <div>
          <strong>Cipariņš</strong>
          <small>{t({ lv: "Redzu tavu uzdevumu un mēģinājumus", ru: "Вижу твою задачу и попытки" })}</small>
        </div>
        <button className="icon-btn small" onClick={onClose} aria-label={t(UI.back)}>
          ×
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
          <button key={q.lv} className="chip" onClick={() => ask(t(q))} disabled={busy}>
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
          ➤
        </button>
      </form>
      <p className="disclaimer">{t(UI.aiDisclaimer)}</p>
    </div>
  );
}
