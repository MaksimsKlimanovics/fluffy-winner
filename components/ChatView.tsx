"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getGrade, getTopic } from "@/lib/curriculum";
import { type T, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { Mascot } from "./Mascot";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS: T[] = [
  { lv: "Kāpēc man vispār vajag matemātiku?", ru: "Зачем мне вообще нужна математика?" },
  { lv: "Paskaidro daļas ar picas piemēru", ru: "Объясни дроби на примере пиццы" },
  { lv: "Kā atrisināt 3x + 5 = 20?", ru: "Как решить 3x + 5 = 20?" },
  { lv: "Iedod man interesantu uzdevumu!", ru: "Дай мне интересную задачку!" },
];

/** Renders **bold** and line breaks — the only formatting the tutor is asked to use. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="line">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part,
          )}
          {"\n"}
        </span>
      ))}
    </>
  );
}

export function ChatView() {
  const { t, lang } = useApp();
  const params = useSearchParams();
  const grade = Number(params.get("grade")) || undefined;
  const topicId = params.get("topic") ?? undefined;
  const g = grade ? getGrade(grade) : undefined;
  const topic = g && topicId ? getTopic(g.grade, topicId) : undefined;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
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

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const append = (chunk: string) =>
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: last.content + chunk };
        return next;
      });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang, grade: g?.grade, topicId: topic?.id }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        append(data?.error ?? t(UI.chatError));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        append(decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") append(t(UI.chatError));
    } finally {
      setBusy(false);
    }
  }

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
            onClick={() => {
              abortRef.current?.abort();
              setMessages([]);
            }}
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
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content ? <RichText text={m.content} /> : <span className="typing"><i /><i /><i /></span>}
          </div>
        ))}
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
