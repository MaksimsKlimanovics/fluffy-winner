"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GRADES } from "@/lib/curriculum";
import { DURATIONS, MAX_NAME, cleanCode, cleanName } from "@/lib/duel";
import { gradeColorAttrs } from "@/lib/grade-ui";
import type { T } from "@/lib/i18n";
import { useApp } from "../AppProvider";
import { BottomNav, TopBar } from "../Chrome";
import { Icon } from "../Icon";
import { Mascot } from "../Mascot";
import { GroupPanel } from "../group/GroupPanel";
import { duelApi, errorText, loadNick, saveNick, saveToken } from "./api";

const L = {
  title: { lv: "Sacensības", ru: "Соревнования" },
  lead: {
    lv: "Izaicini draugu! Abi saņemat vienus un tos pašus uzdevumus un vienu laiku. Kurš savāks vairāk punktu?",
    ru: "Брось вызов другу! У вас одинаковые задачи и одно время. Кто наберёт больше очков?",
  },
  challenge: { lv: "Izaicināt", ru: "Вызвать" },
  join: { lv: "Man ir kods", ru: "У меня есть код" },
  nick: { lv: "Tavs segvārds", ru: "Твой ник" },
  nickHint: {
    lv: "Draugs to redzēs. Neraksti savu pilno vārdu un uzvārdu.",
    ru: "Друг его увидит. Не пиши своё полное имя и фамилию.",
  },
  grade: { lv: "Klase", ru: "Класс" },
  time: { lv: "Laiks", ru: "Время" },
  min: { lv: "min", ru: "мин" },
  create: { lv: "Izveidot uzaicinājuma kodu", ru: "Создать код приглашения" },
  code: { lv: "Uzaicinājuma kods", ru: "Код приглашения" },
  codeHint: { lv: "6 cipari, ko tev pateica draugs", ru: "6 цифр, которые сказал тебе друг" },
  enter: { lv: "Pievienoties", ru: "Присоединиться" },
  rules: { lv: "Noteikumi", ru: "Правила" },
} satisfies Record<string, T>;

const RULES: T[] = [
  { lv: "Uzdevumi ir no izvēlētās klases tēmām, abiem vienādi.", ru: "Задачи из тем выбранного класса, у обоих одинаковые." },
  { lv: "Katram jautājumam ir viena atbilde — to vairs nevar labot.", ru: "На каждый вопрос один ответ — исправить его нельзя." },
  { lv: "Par katru pareizu atbildi 10 punkti.", ru: "За каждый верный ответ 10 очков." },
  { lv: "Vienādi punkti? Uzvar tas, kurš tos savāca ātrāk.", ru: "Очков поровну? Побеждает тот, кто набрал их быстрее." },
  { lv: "Uzvarētājs saņem unikālu AI veidotu trofeju (JPG).", ru: "Победитель получает уникальный кубок от AI (JPG)." },
];

export function DuelHome() {
  const { t } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const invited = cleanCode(params.get("kods") ?? "");
  const [mode, setMode] = useState<"create" | "join">(invited ? "join" : "create");
  const [nick, setNick] = useState("");
  const [grade, setGrade] = useState(Number(params.get("klase")) || 1);
  const [duration, setDuration] = useState<number>(120);
  const [code, setCode] = useState(invited ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<T | null>(null);

  useEffect(() => setNick(loadNick()), []);

  const name = cleanName(nick);
  const go = async (action: () => Promise<{ code: string; token: string }>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await action();
      saveToken(r.code, r.token);
      if (name) saveNick(name);
      router.push(`/sacensibas/${r.code}`);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <TopBar title={t(L.title)} />
      <main className="content duel">
        <header className="large-title">
          <div>
            <h1 data-large-title>{t(L.title)}</h1>
            <p className="subtitle">{t(L.lead)}</p>
          </div>
          <Mascot size={76} grade={grade} mood="cheer" />
        </header>

        <GroupPanel />

        <h2 className="duel-or">{t({ lv: "Vai izaicini ar kodu", ru: "Или вызови по коду" })}</h2>

        <div className="segmented wide" role="group" aria-label={t(L.title)}>
          <button type="button" aria-pressed={mode === "create"} onClick={() => setMode("create")}>
            {t(L.challenge)}
          </button>
          <button type="button" aria-pressed={mode === "join"} onClick={() => setMode("join")}>
            {t(L.join)}
          </button>
        </div>

        <form
          className="duel-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name) return setError({ lv: "Segvārdam vajag vismaz 2 burtus.", ru: "В нике нужно минимум 2 буквы." });
            if (mode === "create") void go(() => duelApi.create(name, grade, duration));
            else {
              const c = cleanCode(code);
              if (!c) return setError({ lv: "Kodā ir 6 cipari.", ru: "В коде 6 цифр." });
              void go(() => duelApi.join(c, name));
            }
          }}
        >
          {mode === "join" && (
            <label className="field">
              <span>{t(L.code)}</span>
              <input
                className="code-input"
                inputMode="numeric"
                autoComplete="off"
                maxLength={7}
                placeholder="000 000"
                value={code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <small>{t(L.codeHint)}</small>
            </label>
          )}

          <label className="field">
            <span>{t(L.nick)}</span>
            <input
              autoComplete="nickname"
              maxLength={MAX_NAME}
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder={t({ lv: "piem., Zibens", ru: "напр., Молния" })}
            />
            <small>{t(L.nickHint)}</small>
          </label>

          {mode === "create" && (
            <>
              <fieldset className="field">
                <legend>{t(L.grade)}</legend>
                <div className="grade-pick">
                  {GRADES.map((g) => (
                    <button
                      key={g.grade}
                      type="button"
                      aria-pressed={grade === g.grade}
                      {...gradeColorAttrs(g.grade)}
                      onClick={() => setGrade(g.grade)}
                    >
                      {g.grade}.
                    </button>
                  ))}
                </div>
                <small>{t(GRADES[grade - 1].title)}</small>
              </fieldset>

              <fieldset className="field">
                <legend>{t(L.time)}</legend>
                <div className="segmented wide" role="group">
                  {DURATIONS.map((d) => (
                    <button key={d} type="button" aria-pressed={duration === d} onClick={() => setDuration(d)}>
                      {d / 60} {t(L.min)}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {error && (
            <p className="feedback bad" role="alert">
              {t(error)}
            </p>
          )}

          <button className="btn primary big" type="submit" disabled={busy}>
            <Icon name={mode === "create" ? "trophy" : "chevronRight"} size={20} />
            {t(mode === "create" ? L.create : L.enter)}
          </button>
        </form>

        <section className="group">
          <h2 className="group-header">{t(L.rules)}</h2>
          <ul className="list duel-rules">
            {RULES.map((r) => (
              <li key={r.lv}>{t(r)}</li>
            ))}
          </ul>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
