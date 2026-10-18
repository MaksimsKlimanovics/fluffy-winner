"use client";

import Link from "next/link";
import { getGrade } from "@/lib/curriculum";
import { stageOf } from "@/lib/skola2030";
import { type T, UI } from "@/lib/i18n";
import { readableOn } from "@/lib/color";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";

const KIND_LABEL: Record<string, T> = {
  algebra: { lv: "Aritmētika un algebra", ru: "Арифметика и алгебра" },
  geometry: { lv: "Ģeometrija", ru: "Геометрия" },
  data: { lv: "Dati un varbūtība", ru: "Данные и вероятность" },
};

export function GradeView({ grade }: { grade: number }) {
  const { t, stars } = useApp();
  const g = getGrade(grade)!;

  const stage = stageOf(grade);

  return (
    <div className="page" style={{ "--c": g.color, "--on-c": readableOn(g.color) } as React.CSSProperties}>
      <TopBar back="/" backLabel={t(UI.home)} title={`${g.grade}. ${t(UI.grade)}`} />
      <main className="content">
        <header className="large-title">
          <div>
            <p className="eyebrow">
              {g.grade}. {t(UI.grade)}
            </p>
            <h1 data-large-title>{t(g.title)}</h1>
            <p className="subtitle">{t(g.subtitle)}</p>
          </div>
          <Mascot size={76} color={g.color} mood="cheer" />
        </header>

        <section className="group">
          <h2 className="group-header">
            {t({ lv: "Tēmas", ru: "Темы" })} · {g.topics.length}
          </h2>
          <ul className="list">
            {g.topics.map((topic) => {
              const s = stars(grade, topic.id);
              return (
                <li key={topic.id}>
                  <Link href={`/klase/${grade}/${topic.id}`} className="row">
                    <span className="row-icon" aria-hidden="true">
                      {topic.icon}
                    </span>
                    <span className="row-text">
                      <strong>{t(topic.title)}</strong>
                      <small>
                        <span className={`tag tag-${topic.kind}`}>{t(KIND_LABEL[topic.kind])}</span>
                        <span className="row-stars" aria-label={`${s} ${t(UI.stars)}`}>
                          {[0, 1, 2].map((i) => (
                            <Icon key={i} name="star" size={12} filled={i < s} className={i < s ? "on" : ""} />
                          ))}
                        </span>
                      </small>
                    </span>
                    <Icon name="chevronRight" size={18} className="chevron" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="group-footer">
            Skola2030 ·{" "}
            {t({
              lv: `${stage - 2}.–${stage}. klases posma sasniedzamie rezultāti`,
              ru: `результаты этапа ${stage - 2}–${stage} классов`,
            })}
          </p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
