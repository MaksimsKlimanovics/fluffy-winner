"use client";

import type { Msg } from "./useTutorChat";

/** Renders **bold** and line breaks — the only formatting the tutor is asked to use. */
export function RichText({ text }: { text: string }) {
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

export function Messages({ messages }: { messages: Msg[] }) {
  return (
    <>
      {messages.map((m, i) => (
        <div key={i} className={`msg ${m.role}`}>
          {m.content ? (
            <RichText text={m.content} />
          ) : (
            <span className="typing">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      ))}
    </>
  );
}
