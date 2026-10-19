"use client";

import { useEffect, useRef, useState } from "react";
import type { T } from "@/lib/i18n";
import type { TrophySpec } from "@/lib/trophy";
import { useApp } from "../AppProvider";
import { Icon } from "../Icon";
import { TrophyArt, trophyToJpeg } from "./Trophy";
import { duelApi, errorText } from "./api";
import { saveFile } from "./save";

type Trophy = { spec: TrophySpec; winnerName: string; grade: number; score: number };

/** Asks the server for the winner's trophy design, shows it and offers it as a JPG. */
export function TrophyPanel({ code, token, helperName }: { code: string; token: string; helperName: string }) {
  const { t, lang } = useApp();
  const [trophy, setTrophy] = useState<Trophy | null>(null);
  const [error, setError] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [date] = useState(() => new Date().toLocaleDateString(lang === "ru" ? "ru-LV" : "lv-LV"));

  useEffect(() => {
    let cancelled = false;
    duelApi
      .trophy(code, token)
      .then((r) => !cancelled && setTrophy(r))
      .catch((e) => !cancelled && setError(errorText(e)));
    return () => {
      cancelled = true;
    };
  }, [code, token]);

  const download = async () => {
    if (!svgRef.current || saving) return;
    setSaving(true);
    try {
      await saveFile(await trophyToJpeg(svgRef.current), `ciparini-trofeja-${code}.jpg`);
    } catch {
      setError({ lv: "Neizdevās saglabāt attēlu.", ru: "Не удалось сохранить картинку." });
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="feedback bad">{t(error)}</p>;

  if (!trophy) {
    return (
      <div className="duel-card center trophy-forging" role="status">
        <Icon name="trophy" size={40} />
        <p>
          {t({ lv: `${helperName} kaļ tavu unikālo trofeju…`, ru: `${helperName} куёт твой уникальный кубок…` })}
        </p>
        <div className="typing" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    );
  }

  return (
    <section className="trophy">
      <div className="trophy-frame">
        <TrophyArt
          ref={svgRef}
          spec={trophy.spec}
          lang={lang}
          winnerName={trophy.winnerName}
          grade={trophy.grade}
          score={trophy.score}
          seed={code}
          date={date}
        />
      </div>
      <button className="btn primary big" type="button" onClick={download} disabled={saving}>
        <Icon name="download" size={20} /> {t({ lv: "Lejupielādēt JPG", ru: "Скачать JPG" })}
      </button>
      {trophy.spec.source === "classic" && (
        <p className="disclaimer">
          {t({
            lv: "AI šobrīd nebija pieejams, tāpēc trofeja veidota no iebūvētajiem dizainiem.",
            ru: "AI сейчас был недоступен, поэтому кубок собран из встроенных дизайнов.",
          })}
        </p>
      )}
    </section>
  );
}
