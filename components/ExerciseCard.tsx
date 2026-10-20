"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Exercise, type GeneratorId, checkAnswer, formatAnswer, generateExercise, problemSet } from "@/lib/exercises";
import { gradeColorAttrs, usesKeypad } from "@/lib/grade-ui";
import { UI } from "@/lib/i18n";
import type { ExerciseContext } from "@/lib/tutor";
import { useApp } from "./AppProvider";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { persona, personaUI } from "@/lib/persona";
import { ExerciseTutor } from "./chat/ExerciseTutor";

type Status = "idle" | "correct" | "wrong";

/** Streaks worth a small celebration. */
const MILESTONES = [3, 5, 10, 20];

/**
 * On-screen number pad for grades 1–2: big keys a small hand can hit, no system keyboard
 * covering half the screen, and only the characters an answer can contain.
 */
function Keypad({ onKey, disabled }: { onKey: (key: string) => void; disabled: boolean }) {
  const { t } = useApp();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];
  return (
    <div className="keypad" role="group" aria-label={t({ lv: "Ciparu tastatūra", ru: "Цифровая клавиатура" })}>
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          className={k === "⌫" ? "key erase" : "key"}
          onClick={() => onKey(k)}
          disabled={disabled}
          aria-label={k === "⌫" ? t({ lv: "Dzēst", ru: "Стереть" }) : k}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

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
  const { t, addStar, solved, markSolved, ready } = useApp();
  // The topic's fixed, numbered problems. Each is a seed, so the tutor API can rebuild the
  // exact same exercise, answer key included. The card opens on the first unsolved one
  // once browser storage has been read.
  const set = useMemo(() => problemSet(generator), [generator]);
  const done = solved(grade, topicId);
  const [task, setTask] = useState<{ index: number; seed: number; ex: Exercise } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const tutorButtonRef = useRef<HTMLButtonElement>(null);
  const [streak, setStreak] = useState(0);

  const open = useCallback(
    (index: number) => {
      const seed = set[index];
      setTask({ index, seed, ex: generateExercise(generator, seed) });
      setInput("");
      setStatus("idle");
      setAttempts([]);
      setShowHint(false);
      setShowSolution(false);
    },
    [generator, set],
  );

  /** The next unsolved problem after `from` (wrapping around), or simply the next one when all are solved. */
  const nextIndex = (from: number) => {
    for (let step = 1; step <= set.length; step++) {
      const i = (from + step) % set.length;
      if (!done.includes(i)) return i;
    }
    return (from + 1) % set.length;
  };

  useEffect(() => {
    if (ready && !task) open(done.length ? nextIndex(-1) : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the first open waits for storage
  }, [ready, task, open]);

  // The sheet covers the lower part of the screen: once it is open (and the page has
  // room to scroll), bring the question up into view above it.
  useEffect(() => {
    if (!showTutor) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() =>
      cardRef.current?.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" }),
    );
    return () => cancelAnimationFrame(id);
  }, [showTutor]);

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
  const { ex, seed, index } = task;
  const solvedBefore = done.includes(index);
  const keypad = usesKeypad(grade);
  const milestone = status === "correct" && !showSolution && MILESTONES.includes(streak);

  const submit = (value: string) => {
    if (status === "correct" || !value.trim()) return;
    if (checkAnswer(ex, value)) {
      setStatus("correct");
      if (!showSolution) {
        // One star per problem: solving it again is practice, not a new star.
        if (!solvedBefore) {
          addStar(grade, topicId);
          markSolved(grade, topicId, index);
        }
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
    <div ref={cardRef} className={`exercise status-${status}`} {...gradeColorAttrs(grade)}>
      <div className="exercise-head">
        <span className="badge">{t(UI.practice)}</span>
        <span className="problem-no">
          {t(UI.problem)} {index + 1}/{set.length}
          {solvedBefore && <Icon name="checkmark" size={16} label={t(UI.solvedMark)} />}
        </span>
        {streak > 1 && (
          <span className="streak">
            <Icon name="sparkles" size={16} /> {streak} {t(UI.streak)}
          </span>
        )}
      </div>
      <div className="problem-progress">
        <span className="meter" aria-hidden="true">
          <span style={{ width: `${(done.length / set.length) * 100}%` }} />
        </span>
        <small>
          {t(UI.solvedCount)}: {done.length}/{set.length}
        </small>
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
            // With the on-screen pad, keep the system keyboard down (a hardware keyboard still types).
            inputMode={keypad ? "none" : "decimal"}
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
      {keypad && ex.kind !== "choice" && (
        <Keypad
          disabled={status === "correct"}
          onKey={(k) => {
            if (status === "wrong") setStatus("idle");
            setInput((v) => (k === "⌫" ? v.slice(0, -1) : v.length < 6 ? v + k : v));
          }}
        />
      )}

      {status === "correct" && (
        <div className={milestone ? "feedback ok celebrate" : "feedback ok"} role="status">
          <Mascot size={milestone ? 64 : 44} mood="cheer" color={color} grade={grade} />
          <span className="feedback-text">
            {t(UI.correct)}
            {milestone && (
              <small className="milestone">
                {t({ lv: `${streak} pēc kārtas — tā turpināt!`, ru: `${streak} подряд — так держать!` })}
              </small>
            )}
          </span>
          {!showSolution && <Icon name="star" size={18} filled className="star-earned" label={t(UI.stars)} />}
        </div>
      )}
      {status === "wrong" && (
        <div className="feedback bad" role="status">
          {t(UI.wrong)}
        </div>
      )}

      {showHint && (
        <div className="hint">
          <Icon name="lightbulb" size={18} /> <span><strong>{t(UI.hint)}:</strong> {t(ex.hint)}</span>
        </div>
      )}
      {showSolution && (
        <div className="solution">
          <Icon name="checkmark" size={18} /> <span>{t(ex.solution)} → <strong>{formatAnswer(ex)}</strong></span>
        </div>
      )}

      <div className="exercise-actions">
        {!showHint && (
          <button className="btn ghost" onClick={() => setShowHint(true)}>
            <Icon name="lightbulb" size={18} /> {t(UI.hint)}
          </button>
        )}
        {!showSolution && (attempts.length >= 2 || status === "correct") && (
          <button className="btn ghost" onClick={() => setShowSolution(true)}>
            {t(UI.showSolution)}
          </button>
        )}
        <button
          ref={tutorButtonRef}
          className={`btn ${showTutor ? "tutor-on" : "ghost"}`}
          onClick={() => setShowTutor(true)}
          aria-haspopup="dialog"
          aria-expanded={showTutor}
        >
          <Icon name="bubble" size={18} /> {t(personaUI(persona(grade)).askAi)}
        </button>
        <button className="btn ghost" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {t(UI.allProblems)}
        </button>
        <span className="problem-nav">
          <button
            className="icon-btn"
            onClick={() => open((index - 1 + set.length) % set.length)}
            aria-label={t(UI.prevProblem)}
          >
            <Icon name="chevronLeft" size={20} />
          </button>
          <button className="btn primary" onClick={() => open(nextIndex(index))}>
            {t(UI.nextProblem)} <Icon name="chevronRight" size={18} />
          </button>
        </span>
      </div>

      {showAll && (
        <div className="problem-grid" role="group" aria-label={t(UI.allProblems)}>
          {set.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${done.includes(i) ? "done" : ""} ${i === index ? "current" : ""}`}
              aria-current={i === index ? "true" : undefined}
              aria-label={`${t(UI.problem)} ${i + 1}${done.includes(i) ? `, ${t(UI.solvedMark)}` : ""}`}
              onClick={() => {
                open(i);
                setShowAll(false);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showTutor && cardRef.current?.closest<HTMLElement>(".page") && (
        // Keyed by seed: a new exercise starts a fresh conversation.
        <ExerciseTutor
          key={seed}
          grade={grade}
          topicId={topicId}
          color={color}
          getContext={getContext}
          hasWrongAttempts={attempts.length > 0}
          solved={status === "correct"}
          host={cardRef.current.closest<HTMLElement>(".page")!}
          onClose={() => {
            setShowTutor(false);
            tutorButtonRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}
