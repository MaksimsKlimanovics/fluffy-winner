"use client";

import Link from "next/link";
import { useState } from "react";
import { GRADES, getGrade, getTopic } from "@/lib/curriculum";
import { gradeColorAttrs } from "@/lib/grade-ui";
import { type T, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { BottomNav, TopBar } from "./Chrome";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { persona, personaUI } from "@/lib/persona";

const helperUI = personaUI(persona());
import { BooksScene, BusScene, CityScene } from "./Scenes";
import { TopicGlyph } from "./TopicGlyph";

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
  const { t, stars, ready, onboarded, finishOnboarding, lastTopic } = useApp();
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const last = slide === SLIDES.length - 1;
  const resume = lastTopic && getTopic(lastTopic.grade, lastTopic.topicId);
  const resumeGrade = lastTopic && getGrade(lastTopic.grade);

  return (
    <div className="page">
      <TopBar />
      <main className="content">
        {/* The intro shows once; after that the home screen leads with the child's own work. */}
        {ready && !onboarded && (
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
                  disabled={slide === 0}
                >
                  <Icon name="chevronLeft" size={20} />
                </button>
                <div className="dots">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      className={i === slide ? "dot active" : "dot"}
                      onClick={() => setSlide(i)}
                      aria-label={`${i + 1} / ${SLIDES.length}`}
                      aria-pressed={i === slide}
                    />
                  ))}
                </div>
                {last ? (
                  <button className="btn primary" onClick={finishOnboarding}>
                    {t({ lv: "Sākam!", ru: "Начнём!" })}
                  </button>
                ) : (
                  <button className="pager-arrow primary" onClick={() => setSlide((s) => s + 1)} aria-label={t(UI.next)}>
                    <Icon name="chevronRight" size={20} />
                  </button>
                )}
              </div>
              {!last && (
                <button className="onboard-skip" onClick={finishOnboarding}>
                  {t({ lv: "Izlaist", ru: "Пропустить" })}
                </button>
              )}
            </div>
          </section>
        )}

        {ready && onboarded && resume && resumeGrade && (
          <Link
            href={`/klase/${resumeGrade.grade}/${resume.id}`}
            className="continue-card"
            {...gradeColorAttrs(resumeGrade.grade)}
          >
            <span className="row-icon big" aria-hidden="true">
              <TopicGlyph topicId={resume.id} size={28} />
            </span>
            <span className="continue-text">
              <small>
                {t({ lv: "Turpināt", ru: "Продолжить" })} · {resumeGrade.grade}. {t(UI.grade)}
              </small>
              <strong>{t(resume.title)}</strong>
              <span className="row-stars" aria-label={`${stars(resumeGrade.grade, resume.id)} ${t(UI.stars)}`}>
                {[0, 1, 2].map((i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={14}
                    filled={i < stars(resumeGrade.grade, resume.id)}
                    className={i < stars(resumeGrade.grade, resume.id) ? "on" : ""}
                  />
                ))}
              </span>
            </span>
            <span className="continue-go" aria-hidden="true">
              <Icon name="chevronRight" size={22} />
            </span>
          </Link>
        )}

        <div className="section-head">
          <Mascot size={52} mood="cheer" />
          <h2>{t(UI.chooseGrade)}</h2>
        </div>

        <div className="grade-grid">
          {GRADES.map((g) => {
            const earned = g.topics.reduce((s, tp) => s + Math.min(stars(g.grade, tp.id), 3), 0);
            const max = g.topics.length * 3;
            return (
              <Link key={g.grade} href={`/klase/${g.grade}`} className="grade-card" {...gradeColorAttrs(g.grade)}>
                <Mascot size={44} color={g.color} grade={g.grade} className="grade-mascot" />
                <span className="grade-num">{g.grade}.</span>
                <span className="grade-label">{t(UI.grade)}</span>
                <strong>{t(g.title)}</strong>
                <small>{t(g.subtitle)}</small>
                <span className="grade-stars" aria-label={`${earned} / ${max} ${t(UI.stars)}`}>
                  <Icon name="star" size={14} filled={earned > 0} className={earned > 0 ? "on" : ""} />
                  <span>
                    <b>{earned}</b>/{max}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <Link href="/sacensibas" className="cta-chat cta-duel">
          <span className="cta-icon" aria-hidden="true">
            <Icon name="trophy" size={30} />
          </span>
          <span>
            <strong>{t({ lv: "Sacensības ar draugu", ru: "Соревнование с другом" })}</strong>
            <small>
              {t({
                lv: "Izaicini draugu ar kodu: vienādi uzdevumi, viens laiks, uzvarētājam AI trofeja.",
                ru: "Вызови друга по коду: одинаковые задачи, одно время, победителю — AI-кубок.",
              })}
            </small>
          </span>
          <Icon name="chevronRight" size={22} className="cta-arrow" />
        </Link>

        <Link href="/chat" className="cta-chat">
          <Mascot size={56} mood="thinking" color="#f72585" />
          <span>
            <strong>{t(helperUI.askAi)}</strong>
            <small>{t(helperUI.askAiAbout)}</small>
          </span>
          <Icon name="chevronRight" size={22} className="cta-arrow" />
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
