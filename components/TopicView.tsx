"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getGrade, getTopic } from "@/lib/curriculum";
import { gradeAttrs } from "@/lib/grade-ui";
import { type T, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { ExerciseCard } from "./ExerciseCard";
import { Icon } from "./Icon";
import { MascotSays } from "./Mascot";
import { persona, personaUI } from "@/lib/persona";
import { Skola2030Box } from "./Skola2030Box";
import { TopicGlyph } from "./TopicGlyph";
import { Widget } from "./widgets";

type Part = { id: string; label: T };
const LEARN: Part = { id: "saproti", label: { lv: "Saproti", ru: "Пойми" } };
const TRY: Part = { id: "izmegini", label: { lv: "Izmēģini", ru: "Попробуй" } };
const PRACTICE: Part = { id: "trenejies", label: { lv: "Trenējies", ru: "Тренируйся" } };

/**
 * A topic is a long read; this sticky switcher jumps straight to its three parts and shows
 * where the child is. On wide screens the parts sit side by side and it hides.
 */
function TopicJump({ parts }: { parts: Part[] }) {
  const { t } = useApp();
  const [active, setActive] = useState(parts[0].id);

  // The current part is the last one whose top has passed under the switcher. Scroll events are
  // caught in the capture phase, so this also works when the page scrolls inside a frame; parts
  // are looked up inside this page, so several pages side by side (the mock) don't mix.
  const navRef = useRef<HTMLElement>(null);
  const part = (id: string) => navRef.current?.closest(".page")?.querySelector<HTMLElement>(`#${id}`) ?? null;

  useEffect(() => {
    const update = () => {
      const line = (navRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
      let current = parts[0].id;
      for (const p of parts) {
        const el = part(p.id);
        if (el && el.getBoundingClientRect().top <= line) current = p.id;
      }
      setActive(current);
    };
    document.addEventListener("scroll", update, { capture: true, passive: true });
    update();
    return () => document.removeEventListener("scroll", update, { capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the ids are the dependency
  }, [parts.map((p) => p.id).join()]);

  return (
    <nav className="topic-jump" ref={navRef} aria-label={t({ lv: "Tēmas daļas", ru: "Части темы" })}>
      <div className="segmented wide">
        {parts.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={active === p.id}
            onClick={() => {
              setActive(p.id);
              const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              part(p.id)?.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
            }}
          >
            {t(p.label)}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function TopicView({ grade, topicId }: { grade: number; topicId: string }) {
  const { t, visitTopic } = useApp();
  const g = getGrade(grade)!;
  const topic = getTopic(grade, topicId)!;
  const idx = g.topics.findIndex((x) => x.id === topicId);
  const nextTopic = g.topics[idx + 1];
  const helperUI = personaUI(persona(grade));
  const parts = topic.widget ? [LEARN, TRY, PRACTICE] : [LEARN, PRACTICE];

  // Remembered for the home screen's "continue" card.
  useEffect(() => visitTopic(grade, topicId), [visitTopic, grade, topicId]);

  return (
    <div className="page" {...gradeAttrs(grade)}>
      <TopBar back={`/klase/${grade}`} backLabel={`${g.grade}. ${t(UI.grade)}`} title={t(topic.title)} />
      <main className="content topic">
        <header className="large-title with-icon">
          <span className="title-icon" aria-hidden="true">
            <TopicGlyph topicId={topic.id} size={34} />
          </span>
          <div>
            <p className="eyebrow">
              {g.grade}. {t(UI.grade)}
            </p>
            <h1 data-large-title>{t(topic.title)}</h1>
          </div>
        </header>

        <TopicJump parts={parts} />

        <div className="topic-cols">
          <div className="topic-learn" id={LEARN.id}>
            <Skola2030Box grade={grade} codes={topic.skola2030} />

            <section className="block">
              <h2>{t(UI.why)}</h2>
              <MascotSays color={g.color} grade={g.grade}>
                {t(topic.why)}
              </MascotSays>
            </section>

            <section className="block real-case">
              <span className="badge">{t(UI.realCase)}</span>
              <h3>{t(topic.realCase.title)}</h3>
              <p>{t(topic.realCase.text)}</p>
            </section>

            <section className="group">
              <h2 className="group-header">{t(UI.howItWorks)}</h2>
              <ul className="list">
                {topic.theory.map((line, i) => (
                  <li key={i} className="row static">
                    <span className="row-bullet" aria-hidden="true" />
                    <span className="row-text">{t(line)}</span>
                  </li>
                ))}
                {topic.formula && (
                  <li className="row static formula-row">
                    <span className="formula">{topic.formula}</span>
                  </li>
                )}
              </ul>
            </section>
          </div>

          <div className="topic-practice">
            {topic.widget && (
              <section className="block" id={TRY.id}>
                <h2>{t(UI.tryIt)}</h2>
                <div className="widget-card">
                  <Widget id={topic.widget} color={g.color} grade={grade} />
                </div>
              </section>
            )}

            <section className="block" id={PRACTICE.id}>
              <ExerciseCard generator={topic.generator} grade={grade} topicId={topicId} color={g.color} />
            </section>
          </div>
        </div>

        <section className="group">
          <h2 className="group-header">{t(helperUI.askAiAbout)}</h2>
          <ul className="list">
            {topic.askAi.map((q, i) => (
              <li key={i}>
                <Link className="row" href={`/chat?grade=${grade}&topic=${topicId}&q=${encodeURIComponent(t(q))}`}>
                  <Icon name="bubble" size={20} className="row-glyph" />
                  <span className="row-text">{t(q)}</span>
                  <Icon name="chevronRight" size={18} className="chevron" />
                </Link>
              </li>
            ))}
            <li>
              <Link className="row tinted" href={`/chat?grade=${grade}&topic=${topicId}`}>
                <Icon name="sparkles" size={20} className="row-glyph" />
                <span className="row-text">{t(helperUI.askAi)}</span>
                <Icon name="chevronRight" size={18} className="chevron" />
              </Link>
            </li>
          </ul>
        </section>

        {nextTopic && (
          <section className="group">
            <ul className="list">
              <li>
                <Link href={`/klase/${grade}/${nextTopic.id}`} className="row">
                  <span className="row-icon" aria-hidden="true">
                    <TopicGlyph topicId={nextTopic.id} />
                  </span>
                  <span className="row-text">
                    <small>{t(UI.next)}</small>
                    <strong>{t(nextTopic.title)}</strong>
                  </span>
                  <Icon name="chevronRight" size={18} className="chevron" />
                </Link>
              </li>
            </ul>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
