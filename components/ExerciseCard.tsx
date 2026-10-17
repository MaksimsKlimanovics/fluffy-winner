"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type Exercise, type GeneratorId, checkAnswer, formatAnswer, generators } from "@/lib/exercises";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { Mascot } from "./Mascot";

type Status = "idle" | "correct" | "wrong";

export function ExerciseCard({
  generator,
  grade,
  topicId,
  color,
}: {
  generator: GeneratorId;
  grade: number;
  topicId: string;
  color: string;
}) {
  const { t, addStar } = useApp();
  // Generated after mount: random numbers would otherwise differ between
  // the server render and hydration.
  const [ex, setEx] = useState<Exercise | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [tries, setTries] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [streak, setStreak] = useState(0);

  const next = useCallback(() => {
    setEx(generators[generator]());
    setInput("");
    setStatus("idle");
    setTries(0);
    setShowHint(false);
    setShowSolution(false);
  }, [generator]);

  useEffect(next, [next]);

  if (!ex) return <div className="exercise skeleton" />;

  const submit = (value: string) => {
    if (status === "correct" || !value.trim()) return;
    if (checkAnswer(ex, value)) {
      setStatus("correct");
      if (!showSolution) {
        addStar(grade, topicId);
        setStreak((s) => s + 1);
      }
    } else {
      setStatus("wrong");
      setTries((n) => n + 1);
      setStreak(0);
      if (tries >= 1) setShowHint(true);
    }
  };

  const askQuestion = `${t(ex.question)}\n\n${t({
    lv: "Es nesaprotu, kā to atrisināt. Vari palīdzēt ar padomu?",
    ru: "Я не понимаю, как это решить. Можешь помочь подсказкой?",
  })}`;

  return (
    <div className={`exercise status-${status}`} style={{ "--c": color } as React.CSSProperties}>
      <div className="exercise-head">
        <span className="badge">{t(UI.practice)}</span>
        {streak > 1 && (
          <span className="streak">
            🔥 {streak} {t(UI.streak)}
          </span>
        )}
      </div>

      <p className="exercise-q">{t(ex.question)}</p>

      {ex.kind === "choice" ? (
        <div className="choices">
          {ex.choices.map((c) => (
            <button
              key={c}
              className={`choice ${input === c ? (status === "correct" ? "right" : status === "wrong" ? "bad" : "picked") : ""}`}
              onClick={() => {
                setInput(c);
                submit(c);
              }}
              disabled={status === "correct"}
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
            submit(input);
          }}
        >
          <input
            inputMode="decimal"
            autoComplete="off"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (status === "wrong") setStatus("idle");
            }}
            placeholder={t(UI.yourAnswer)}
            aria-label={t(UI.yourAnswer)}
            disabled={status === "correct"}
          />
          {ex.unit && <span className="unit">{t(ex.unit)}</span>}
          <button className="btn primary" type="submit" disabled={status === "correct"}>
            {t(UI.check)}
          </button>
        </form>
      )}

      {status === "correct" && (
        <div className="feedback ok" role="status">
          <Mascot size={44} mood="cheer" color={color} /> {t(UI.correct)} {!showSolution && "⭐"}
        </div>
      )}
      {status === "wrong" && (
        <div className="feedback bad" role="status">
          {t(UI.wrong)}
        </div>
      )}

      {showHint && (
        <div className="hint">
          💡 <strong>{t(UI.hint)}:</strong> {t(ex.hint)}
        </div>
      )}
      {showSolution && (
        <div className="solution">
          ✅ {t(ex.solution)} → <strong>{formatAnswer(ex)}</strong>
        </div>
      )}

      <div className="exercise-actions">
        {!showHint && (
          <button className="btn ghost" onClick={() => setShowHint(true)}>
            💡 {t(UI.hint)}
          </button>
        )}
        {!showSolution && (tries >= 2 || status === "correct") && (
          <button className="btn ghost" onClick={() => setShowSolution(true)}>
            {t(UI.showSolution)}
          </button>
        )}
        <Link
          className="btn ghost"
          href={`/chat?grade=${grade}&topic=${topicId}&q=${encodeURIComponent(askQuestion)}`}
        >
          💬 {t(UI.askAi)}
        </Link>
        <button className="btn primary" onClick={next}>
          {t(UI.newTask)} ↻
        </button>
      </div>
    </div>
  );
}
