"use client";

import Link from "next/link";
import { useState } from "react";
import { GRADES } from "@/lib/curriculum";
import { type T, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { Mascot } from "./Mascot";
import { BooksScene, BusScene, CityScene } from "./Scenes";

const SLIDES: { scene: React.ReactNode; title: T; text: T }[] = [
  {
    scene: <CityScene />,
    title: { lv: "Matemātika ap mums", ru: "Математика вокруг нас" },
    text: {
      lv: "Tramvaja biļete, picas gabals, jumta slīpums — katrā lietā slēpjas skaitļi. Mēs tos atradīsim kopā!",
      ru: "Билет на трамвай, кусок пиццы, наклон крыши — в каждой вещи прячутся числа. Найдём их вместе!",
    },
  },
  {
    scene: <BusScene />,
    title: { lv: "Kāpēc tas vajadzīgs?", ru: "Зачем это нужно?" },
    text: {
      lv: "Katrai tēmai — īsts dzīves gadījums un interaktīvs modelis, ko vari pagriezt, pavilkt un izmēģināt.",
      ru: "К каждой теме — настоящий случай из жизни и интерактивная модель, которую можно крутить и пробовать.",
    },
  },
  {
    scene: <BooksScene />,
    title: { lv: "Jautā Cipariņam", ru: "Спроси Ципариньша" },
    text: {
      lv: "Mūsu AI palīgs nepateiks atbildi priekšā, bet palīdzēs pašam to atrast — latviski vai krieviski.",
      ru: "Наш AI-помощник не подскажет готовый ответ, а поможет найти его самому — по-латышски или по-русски.",
    },
  },
];

export function HomeView() {
  const { t, stars } = useApp();
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];

  return (
    <div className="page">
      <TopBar />
      <main className="content">
        <section className="onboard card-phone" aria-roledescription="carousel">
          <div className="onboard-art">{current.scene}</div>
          <div className="onboard-body">
            <h1>{t(current.title)}</h1>
            <p>{t(current.text)}</p>
            <div className="pager">
              <button
                className="pager-arrow"
                onClick={() => setSlide((s) => (s + SLIDES.length - 1) % SLIDES.length)}
                aria-label={t(UI.back)}
              >
                ‹
              </button>
              <div className="dots">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={i === slide ? "dot active" : "dot"}
                    onClick={() => setSlide(i)}
                    aria-label={`${i + 1}`}
                  />
                ))}
              </div>
              <button
                className="pager-arrow primary"
                onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}
                aria-label={t(UI.next)}
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="section-head">
          <Mascot size={52} mood="cheer" />
          <h2>{t(UI.chooseGrade)}</h2>
        </div>

        <div className="grade-grid">
          {GRADES.map((g) => {
            const earned = g.topics.reduce((s, tp) => s + Math.min(stars(g.grade, tp.id), 3), 0);
            const max = g.topics.length * 3;
            return (
              <Link
                key={g.grade}
                href={`/klase/${g.grade}`}
                className="grade-card"
                style={{ "--c": g.color } as React.CSSProperties}
              >
                <span className="grade-num">{g.grade}.</span>
                <span className="grade-label">{t(UI.grade)}</span>
                <strong>{t(g.title)}</strong>
                <small>{t(g.subtitle)}</small>
                <span className="grade-progress" aria-label={`${earned}/${max}`}>
                  <span style={{ width: `${(earned / max) * 100}%` }} />
                </span>
              </Link>
            );
          })}
        </div>

        <Link href="/chat" className="cta-chat">
          <Mascot size={56} mood="thinking" color="#f72585" />
          <span>
            <strong>{t(UI.askAi)}</strong>
            <small>{t(UI.askAiAbout)}</small>
          </span>
          <span className="cta-arrow">›</span>
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
