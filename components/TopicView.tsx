"use client";

import Link from "next/link";
import { getGrade, getTopic } from "@/lib/curriculum";
import { UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { ExerciseCard } from "./ExerciseCard";
import { MascotSays } from "./Mascot";
import { Skola2030Box } from "./Skola2030Box";
import { Widget } from "./widgets";

export function TopicView({ grade, topicId }: { grade: number; topicId: string }) {
  const { t } = useApp();
  const g = getGrade(grade)!;
  const topic = getTopic(grade, topicId)!;
  const idx = g.topics.findIndex((x) => x.id === topicId);
  const nextTopic = g.topics[idx + 1];

  return (
    <div className="page" style={{ "--c": g.color } as React.CSSProperties}>
      <TopBar back={`/klase/${grade}`} />
      <main className="content topic">
        <section className="topic-hero">
          <span className="topic-hero-icon" aria-hidden="true">
            {topic.icon}
          </span>
          <div>
            <small>
              {g.grade}. {t(UI.grade)}
            </small>
            <h1>{t(topic.title)}</h1>
          </div>
        </section>

        <Skola2030Box grade={grade} codes={topic.skola2030} />

        <section className="block">
          <h2>{t(UI.why)}</h2>
          <MascotSays color={g.color}>{t(topic.why)}</MascotSays>
        </section>

        <section className="block real-case">
          <span className="badge">{t(UI.realCase)}</span>
          <h3>{t(topic.realCase.title)}</h3>
          <p>{t(topic.realCase.text)}</p>
        </section>

        <section className="block">
          <h2>{t(UI.howItWorks)}</h2>
          <ul className="theory">
            {topic.theory.map((line, i) => (
              <li key={i}>{t(line)}</li>
            ))}
          </ul>
          {topic.formula && <div className="formula">{topic.formula}</div>}
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

        <section className="block">
          <h2>{t(UI.askAiAbout)}</h2>
          <div className="ask-chips">
            {topic.askAi.map((q, i) => (
              <Link
                key={i}
                className="chip"
                href={`/chat?grade=${grade}&topic=${topicId}&q=${encodeURIComponent(t(q))}`}
              >
                💬 {t(q)}
              </Link>
            ))}
            <Link className="chip strong" href={`/chat?grade=${grade}&topic=${topicId}`}>
              {t(UI.askAi)} →
            </Link>
          </div>
        </section>

        {nextTopic && (
          <Link href={`/klase/${grade}/${nextTopic.id}`} className="next-topic">
            <span>{t(UI.next)}:</span>
            <strong>
              {nextTopic.icon} {t(nextTopic.title)}
            </strong>
            <span aria-hidden="true">›</span>
          </Link>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
