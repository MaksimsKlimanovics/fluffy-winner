"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Exercise, type GeneratorId, checkAnswer, formatAnswer, generateExercise, newSeed } from "@/lib/exercises";
import { UI } from "@/lib/i18n";
import type { ExerciseContext } from "@/lib/tutor";
import { useApp } from "./AppProvider";
import { Mascot } from "./Mascot";
import { ExerciseTutor } from "./chat/ExerciseTutor";

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
  // the server render and hydration. The seed lets the tutor API rebuild the
  // exact same exercise, answer key included.
  const [task, setTask] = useState<{ seed: number; ex: Exercise } | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [streak, setStreak] = useState(0);

  const next = useCallback(() => {
    const seed = newSeed();
    setTask({ seed, ex: generateExercise(generator, seed) });
    setInput("");
    setStatus("idle");
    setAttempts([]);
    setShowHint(false);
    setShowSolution(false);
  }, [generator]);

  useEffect(next, [next]);

  // The tutor reads this at send time, so it always sees the latest state.
  const contextRef = useRef<ExerciseContext | null>(null);
  contextRef.current = task && {
    generator,
    seed: task.seed,
    attempts,
    status: status === "correct" ? (showSolution ? "solution_shown" : "solved") : showSolution ? "solution_shown" : "unsolved",
  };
  const getContext = useCallback(() => contextRef.current!, []);

  if (!task) return <div className="exercise skeleton" />;
  const { ex, seed } = task;

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
      setAttempts((a) => [...a, value.trim()]);
      setStreak(0);
      if (attempts.length >= 1) setShowHint(true);
    }
  };

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
        {!showSolution && (attempts.length >= 2 || status === "correct") && (
          <button className="btn ghost" onClick={() => setShowSolution(true)}>
            {t(UI.showSolution)}
          </button>
        )}
        <button
          className={`btn ${showTutor ? "tutor-on" : "ghost"}`}
          onClick={() => setShowTutor((v) => !v)}
          aria-expanded={showTutor}
        >
          💬 {t(UI.askAi)}
        </button>
        <button className="btn primary" onClick={next}>
          {t(UI.newTask)} ↻
        </button>
      </div>

      {showTutor && (
        // Keyed by seed: a new exercise starts a fresh conversation.
        <ExerciseTutor
          key={seed}
          grade={grade}
          topicId={topicId}
          color={color}
          getContext={getContext}
          hasWrongAttempts={attempts.length > 0}
          solved={status === "correct"}
          onClose={() => setShowTutor(false)}
        />
      )}
    </div>
  );
}
