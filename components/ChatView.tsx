"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getGrade, getTopic } from "@/lib/curriculum";
import { type T, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { Mascot } from "./Mascot";
import { Messages, RichText } from "./chat/Messages";
import { useTutorChat } from "./chat/useTutorChat";

const STARTERS: T[] = [
  { lv: "Kāpēc man vispār vajag matemātiku?", ru: "Зачем мне вообще нужна математика?" },
  { lv: "Paskaidro daļas ar picas piemēru", ru: "Объясни дроби на примере пиццы" },
  { lv: "Kā atrisināt 3x + 5 = 20?", ru: "Как решить 3x + 5 = 20?" },
  { lv: "Iedod man interesantu uzdevumu!", ru: "Дай мне интересную задачку!" },
];

export function ChatView() {
  const { t } = useApp();
  const params = useSearchParams();
  const grade = Number(params.get("grade")) || undefined;
  const topicId = params.get("topic") ?? undefined;
  const g = grade ? getGrade(grade) : undefined;
  const topic = g && topicId ? getTopic(g.grade, topicId) : undefined;

  const { messages, busy, send: sendRaw, reset } = useTutorChat({ grade: g?.grade, topicId: topic?.id });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefilled = useRef(false);

  useEffect(() => {
    const q = params.get("q");
    if (q && !prefilled.current) {
      prefilled.current = true;
      setInput(q);
    }
  }, [params]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    void sendRaw(text);
  };

  const color = g?.color ?? "#5b5bf7";

  return (
    <div className="page chat-page" style={{ "--c": color } as React.CSSProperties}>
      <TopBar back={topic && g ? `/klase/${g.grade}/${topic.id}` : "/"} />
      <div className="chat-head">
        <Mascot size={52} color={color} mood={busy ? "thinking" : "happy"} />
        <div>
          <strong>{t(UI.chatTitle)}</strong>
          {topic && g && (
            <small>
              {t(UI.chatContext)}: {g.grade}. {t(UI.grade)} · {topic.icon} {t(topic.title)}
            </small>
          )}
        </div>
        {messages.length > 0 && (
          <button
            className="btn ghost small"
            onClick={reset}
          >
            ↺ {t(UI.chatClear)}
          </button>
        )}
      </div>

      <div className="chat-scroll" ref={scrollRef} aria-live="polite">
        <div className="msg assistant">
          <RichText text={t(UI.chatHello)} />
        </div>
        {messages.length === 0 && (
          <div className="starters">
            <small>{t(UI.suggestions)}</small>
            {(topic ? topic.askAi : STARTERS).map((s, i) => (
              <button key={i} className="chip" onClick={() => send(t(s))}>
                {t(s)}
              </button>
            ))}
          </div>
        )}
        <Messages messages={messages} />
        <p className="disclaimer">{t(UI.aiDisclaimer)}</p>
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={t(UI.chatPlaceholder)}
          aria-label={t(UI.chatPlaceholder)}
          rows={Math.min(4, input.split("\n").length)}
          maxLength={2000}
        />
        <button className="btn primary send" type="submit" disabled={busy || !input.trim()} aria-label={t(UI.send)}>
          ➤
        </button>
      </form>
      <BottomNav />
    </div>
  );
}
