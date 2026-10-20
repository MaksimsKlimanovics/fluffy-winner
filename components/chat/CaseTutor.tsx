"use client";

import { useEffect, useRef, useState } from "react";
import { gradeAttrs } from "@/lib/grade-ui";
import { type T, UI } from "@/lib/i18n";
import type { RealCase } from "@/lib/real-life";
import { useApp } from "../AppProvider";
import { Icon } from "../Icon";
import { Mascot } from "../Mascot";
import { persona, personaUI } from "@/lib/persona";
import { Sheet } from "../Sheet";
import { Messages } from "./Messages";
import { useScrollToLatestQuestion, useTutorChat } from "./useTutorChat";

const FOLLOW_UPS: T[] = [
  { lv: "Kur vēl to izmanto?", ru: "Где ещё это используют?" },
  { lv: "Iedod man uzdevumu par šo", ru: "Дай мне задачу про это" },
  { lv: "Paskaidro vienkāršāk", ru: "Объясни проще" },
];

/**
 * "Uzzināt vairāk" on a real-life example: the grade's helper opens in a bottom
 * sheet and right away tells more about how the topic's math works in that
 * situation. The server looks the example up by index, so the prompt only
 * ever holds our own text.
 */
export function CaseTutor({
  grade,
  topicId,
  caseIndex,
  realCase,
  color,
  host,
  onClose,
}: {
  grade: number;
  topicId: string;
  caseIndex: number;
  realCase: RealCase;
  color: string;
  /** The page the sheet attaches to. */
  host: HTMLElement;
  onClose: () => void;
}) {
  const { t } = useApp();
  const { messages, busy, send } = useTutorChat({ grade, topicId, realCase: caseIndex });
  const [input, setInput] = useState("");
  const helper = persona(grade);
  const helperUI = personaUI(helper);
  const scrollRef = useRef<HTMLDivElement>(null);

  useScrollToLatestQuestion(scrollRef, messages);

  // Ask the first question for the child. Deferred so a development double-mount cancels the
  // first attempt instead of sending it twice.
  const opening = t({ lv: `Pastāsti vairāk: ${t(realCase.title)}`, ru: `Расскажи подробнее: ${t(realCase.title)}` });
  useEffect(() => {
    const id = window.setTimeout(() => void send(opening), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opened example
  }, []);

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    void send(text);
  };

  return (
    <Sheet host={host} label={t(helperUI.helps)} onClose={onClose}>
      {({ grab, close }) => (
        <div className="exercise-tutor" {...gradeAttrs(grade)}>
          <div className="exercise-tutor-head" {...grab}>
            <Mascot size={40} color={color} grade={grade} mood={busy ? "thinking" : "happy"} />
            <div>
              <strong>{t(helper.name)}</strong>
              <small>{t(realCase.title)}</small>
            </div>
            <button type="button" className="icon-btn small" onClick={close} aria-label={t({ lv: "Aizvērt", ru: "Закрыть" })}>
              <Icon name="xmark" size={16} />
            </button>
          </div>

          <div className="exercise-tutor-scroll" ref={scrollRef} aria-live="polite">
            <Messages messages={messages} />
          </div>

          <div className="quick-actions">
            {FOLLOW_UPS.map((q) => (
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
