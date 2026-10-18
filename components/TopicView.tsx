"use client";

import Link from "next/link";
import { getGrade, getTopic } from "@/lib/curriculum";
import { UI } from "@/lib/i18n";
import { readableOn } from "@/lib/color";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { ExerciseCard } from "./ExerciseCard";
import { Icon } from "./Icon";
import { MascotSays } from "./Mascot";
import { persona, personaUI } from "@/lib/persona";
import { Skola2030Box } from "./Skola2030Box";
import { Widget } from "./widgets";

export function TopicView({ grade, topicId }: { grade: number; topicId: string }) {
  const { t } = useApp();
  const g = getGrade(grade)!;
  const topic = getTopic(grade, topicId)!;
  const idx = g.topics.findIndex((x) => x.id === topicId);
  const nextTopic = g.topics[idx + 1];
  const helperUI = personaUI(persona(grade));

  return (
    <div className="page" style={{ "--c": g.color, "--on-c": readableOn(g.color) } as React.CSSProperties}>
      <TopBar back={`/klase/${grade}`} backLabel={`${g.grade}. ${t(UI.grade)}`} title={t(topic.title)} />
      <main className="content topic">
        <header className="large-title with-icon">
          <span className="title-icon" aria-hidden="true">
            {topic.icon}
          </span>
          <div>
            <p className="eyebrow">
              {g.grade}. {t(UI.grade)}
            </p>
            <h1 data-large-title>{t(topic.title)}</h1>
          </div>
        </header>

        <Skola2030Box grade={grade} codes={topic.skola2030} />

        <section className="block">
          <h2>{t(UI.why)}</h2>
          <MascotSays color={g.color} grade={g.grade}>{t(topic.why)}</MascotSays>
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

        {topic.widget && (
          <section className="block">
            <h2>{t(UI.tryIt)}</h2>
            <div className="widget-card">
              <Widget id={topic.widget} color={g.color} grade={grade} />
            </div>
          </section>
        )}

        <section className="block">
          <ExerciseCard generator={topic.generator} grade={grade} topicId={topicId} color={g.color} />
        </section>

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
                    {nextTopic.icon}
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
