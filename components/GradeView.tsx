"use client";

import Link from "next/link";
import { getGrade } from "@/lib/curriculum";
import { type T, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { Mascot } from "./Mascot";

const KIND_LABEL: Record<string, T> = {
  algebra: { lv: "Aritmētika un algebra", ru: "Арифметика и алгебра" },
  geometry: { lv: "Ģeometrija", ru: "Геометрия" },
  data: { lv: "Dati un varbūtība", ru: "Данные и вероятность" },
};

export function GradeView({ grade }: { grade: number }) {
  const { t, stars } = useApp();
  const g = getGrade(grade)!;

  return (
    <div className="page" style={{ "--c": g.color } as React.CSSProperties}>
      <TopBar back="/" />
      <main className="content">
        <section className="grade-hero">
          <div>
            <span className="grade-hero-num">
              {g.grade}. {t(UI.grade)}
            </span>
            <h1>{t(g.title)}</h1>
            <p>{t(g.subtitle)}</p>
          </div>
          <Mascot size={96} color={g.color} mood="cheer" />
        </section>

        <ul className="topic-list">
          {g.topics.map((topic) => {
            const s = stars(grade, topic.id);
            return (
              <li key={topic.id}>
                <Link href={`/klase/${grade}/${topic.id}`} className="topic-card">
                  <span className="topic-icon" aria-hidden="true">
                    {topic.icon}
                  </span>
                  <span className="topic-text">
                    <small className={`tag tag-${topic.kind}`}>{t(KIND_LABEL[topic.kind])}</small>
                    <strong>{t(topic.title)}</strong>
                    <span className="topic-why">{t(topic.why)}</span>
                  </span>
                  <span className="topic-stars" aria-label={`${s} ${t(UI.stars)}`}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={i < s ? "on" : ""}>
                        ★
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <BottomNav />
    </div>
  );
}
