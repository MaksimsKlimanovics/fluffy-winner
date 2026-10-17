"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UI } from "@/lib/i18n";
import type { ExerciseContext } from "@/lib/tutor";
import { useApp } from "../AppProvider";

export type Msg = { role: "user" | "assistant"; content: string };

type Context = {
  grade?: number;
  topicId?: string;
  /** Read at send time, so the tutor always sees the latest attempts/status. */
  exercise?: () => ExerciseContext;
};

/** Streams replies from /api/chat. Shared by the chat page and the in-exercise panel. */
export function useTutorChat({ grade, topicId, exercise }: Context) {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || abortRef.current) return;
      const history: Msg[] = [...messagesRef.current, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const append = (chunk: string) => {
        if (controller.signal.aborted) return;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, lang, grade, topicId, exercise: exercise?.() }),
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
        if (abortRef.current === controller) {
          abortRef.current = null;
          setBusy(false);
        }
      }
    },
    [lang, grade, topicId, exercise, t],
  );

  return { messages, busy, send, reset };
}
