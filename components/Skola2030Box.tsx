"use client";

import { UI } from "@/lib/i18n";
import { BIG_IDEAS, SOURCE, outcome, stageOf } from "@/lib/skola2030";
import { useApp } from "./AppProvider";

/** Shows which outcomes of the national standard this topic works towards, quoted verbatim. */
export function Skola2030Box({ grade, codes }: { grade: number; codes: string[] }) {
  const { lang, t } = useApp();
  const stage = stageOf(grade);
  return (
    <details className="skola2030">
      <summary>
        <span className="s2030-badge">Skola2030</span>
        <span>
          {t({ lv: `Sasniedzamie rezultāti, beidzot ${stage}. klasi`, ru: `Результаты к концу ${stage} класса` })} ·{" "}
          {codes.join(", ")}
        </span>
      </summary>
      <ul>
        {codes.map((code) => (
          <li key={code}>
            <small>{BIG_IDEAS[code.split(".")[0]]}</small>
            <p>
              <b>{code}.</b> {outcome(stage, code)}
            </p>
          </li>
        ))}
      </ul>
      <p className="s2030-source">
        {lang === "ru" && <>{t(UI.standardOriginal)} </>}
        <a href={SOURCE.url} target="_blank" rel="noreferrer">
          {t(SOURCE)}
        </a>
      </p>
    </details>
  );
}
