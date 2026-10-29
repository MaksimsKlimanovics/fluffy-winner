"use client";

import { useCallback, useEffect, useState } from "react";
import { GRADES, getGrade } from "@/lib/curriculum";
import { DURATIONS, MAX_NAME, cleanName } from "@/lib/duel";
import { gradeColorAttrs } from "@/lib/grade-ui";
import { cleanGroupCode, type PresenceView } from "@/lib/groups";
import type { T } from "@/lib/i18n";
import { useApp } from "../AppProvider";
import { Icon } from "../Icon";
import { Mascot } from "../Mascot";
import { errorText, loadNick, saveNick } from "../duel/api";
import { type AdminMember, groupApi } from "./api";
import { activityText, useGroup } from "./GroupProvider";

const L = {
  title: { lv: "Mana grupa", ru: "Моя группа" },
  lead: {
    lv: "Ar grupas kodu redzēsi, kurš no tavas klases vai ģimenes šobrīd ir šeit, un varēsi viņu izaicināt. Citi tevi neredz.",
    ru: "С кодом группы увидишь, кто из твоего класса или семьи сейчас здесь, и сможешь бросить вызов. Другие тебя не видят.",
  },
  code: { lv: "Grupas kods", ru: "Код группы" },
  codeHint: { lv: "6 zīmes, ko iedeva skolotājs vai vecāki", ru: "6 знаков от учителя или родителей" },
  nick: { lv: "Tavs segvārds", ru: "Твой ник" },
  grade: { lv: "Tava klase", ru: "Твой класс" },
  join: { lv: "Pievienoties grupai", ru: "Войти в группу" },
  forAdults: { lv: "Esi vecāks vai skolotājs? Izveido grupu", ru: "Ты родитель или учитель? Создай группу" },
  groupName: { lv: "Grupas nosaukums", ru: "Название группы" },
  create: { lv: "Izveidot grupu", ru: "Создать группу" },
  online: { lv: "Tagad šeit", ru: "Сейчас здесь" },
  nobody: {
    lv: "Pašlaik neviens cits no grupas nav šeit. Kad kāds atvērs Cipariņus, viņš parādīsies šajā sarakstā.",
    ru: "Сейчас больше никого из группы нет. Когда кто-то откроет Ципариньи, он появится в этом списке.",
  },
  available: { lv: "Var mani izaicināt", ru: "Меня можно вызвать" },
  busy: { lv: "Nav pieejams", ru: "Недоступен" },
  inDuel: { lv: "Sacensībās", ru: "Соревнуется" },
  send: { lv: "Sūtīt izaicinājumu", ru: "Отправить вызов" },
  leave: { lv: "Iziet no grupas", ru: "Выйти из группы" },
  removed: {
    lv: "Grupas veidotājs tevi izņēma no grupas, vai grupa vairs nepastāv.",
    ru: "Создатель группы убрал тебя из группы, или группы больше нет.",
  },
  min: { lv: "min", ru: "мин" },
} satisfies Record<string, T>;

export function GroupPanel() {
  const g = useGroup();
  return (
    <>
      {g.admin && <AdminCard />}
      {g.session ? <Lobby /> : <JoinCard />}
    </>
  );
}

function JoinCard() {
  const { t } = useApp();
  const g = useGroup();
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [grade, setGrade] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [adultOpen, setAdultOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<T | null>(null);

  useEffect(() => setNick(loadNick()), []);

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="duel-form group-card">
      <h2>
        <Icon name="people" size={22} /> {t(L.title)}
      </h2>
      <p className="group-lead">{t(L.lead)}</p>
      {g.removed && <p className="feedback bad">{t(L.removed)}</p>}
      <form
        className="group-join"
        onSubmit={(e) => {
          e.preventDefault();
          const c = cleanGroupCode(code);
          const n = cleanName(nick);
          if (!c) return setError({ lv: "Grupas kodā ir 6 zīmes.", ru: "В коде группы 6 знаков." });
          if (!n) return setError({ lv: "Segvārdam vajag vismaz 2 burtus.", ru: "В нике нужно минимум 2 буквы." });
          saveNick(n);
          void run(() => g.join(c, n, grade));
        }}
      >
        <label className="field">
          <span>{t(L.code)}</span>
          <input
            className="code-input"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={6}
            placeholder="ABC234"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          />
          <small>{t(L.codeHint)}</small>
        </label>
        <label className="field">
          <span>{t(L.nick)}</span>
          <input autoComplete="nickname" maxLength={MAX_NAME} value={nick} onChange={(e) => setNick(e.target.value)} />
        </label>
        <fieldset className="field">
          <legend>{t(L.grade)}</legend>
          <div className="grade-pick">
            {GRADES.map((gr) => (
              <button key={gr.grade} type="button" aria-pressed={grade === gr.grade} {...gradeColorAttrs(gr.grade)} onClick={() => setGrade(gr.grade)}>
                {gr.grade}.
              </button>
            ))}
          </div>
        </fieldset>
        {error && !adultOpen && <p className="feedback bad">{t(error)}</p>}
        <button className="btn primary big" type="submit" disabled={busy}>
          {t(L.join)}
        </button>
      </form>

      {!g.admin && (
        <details className="group-adult" open={adultOpen} onToggle={(e) => setAdultOpen((e.target as HTMLDetailsElement).open)}>
          <summary>{t(L.forAdults)}</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => g.create(groupName));
            }}
          >
            <label className="field">
              <span>{t(L.groupName)}</span>
              <input maxLength={32} value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder={t({ lv: "piem., 5.b klase", ru: "напр., 5Б класс" })} />
              <small>
                {t({
                  lv: "Tu saņemsi kodu, ko iedot bērniem, un varēsi redzēt un izņemt grupas dalībniekus šajā ierīcē.",
                  ru: "Ты получишь код для детей и сможешь видеть и удалять участников группы на этом устройстве.",
                })}
              </small>
            </label>
            {error && adultOpen && <p className="feedback bad">{t(error)}</p>}
            <button className="btn ghost" type="submit" disabled={busy || groupName.trim().length < 2}>
              {t(L.create)}
            </button>
          </form>
        </details>
      )}
    </section>
  );
}

function Lobby() {
  const { t } = useApp();
  const g = useGroup();
  const s = g.session!;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="group-card lobby">
      <header className="lobby-head">
        <div>
          <p className="eyebrow">{t(L.title)}</p>
          <h2>{s.groupName}</h2>
          <small>
            {s.name} · {s.grade}. {t({ lv: "klase", ru: "класс" })}
          </small>
        </div>
        <label className="switch">
          <input type="checkbox" checked={g.available} onChange={(e) => g.setAvailable(e.target.checked)} />
          <span aria-hidden="true" />
          <small>{t(L.available)}</small>
        </label>
      </header>

      <h3 className="group-header">
        {t(L.online)} · {g.online.length}
      </h3>
      {g.online.length === 0 ? (
        <p className="lobby-empty">{t(L.nobody)}</p>
      ) : (
        <ul className="list lobby-list">
          {g.online.map((p) => (
            <li key={p.id}>
              <PersonRow person={p} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} />
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn ghost small lobby-leave" onClick={() => void g.leave()}>
        {t(L.leave)}
      </button>
    </section>
  );
}

function PersonRow({ person, open, onToggle }: { person: PresenceView; open: boolean; onToggle: () => void }) {
  const { t } = useApp();
  const g = useGroup();
  const [grade, setGrade] = useState(person.grade);
  const [duration, setDuration] = useState<number>(120);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<T | null>(null);
  const reachable = person.available && person.activity.kind !== "duel";

  return (
    <div className={`person ${open ? "open" : ""}`}>
      <button type="button" className="row person-row" onClick={onToggle} disabled={!reachable} aria-expanded={open}>
        <span className="person-avatar">
          <Mascot size={40} grade={person.grade} color={getGrade(person.grade)?.color} mood="happy" />
          <i className={`presence-dot ${reachable ? "on" : "busy"}`} aria-hidden="true" />
        </span>
        <span className="row-text">
          <strong>{person.name}</strong>
          <small>
            {person.grade}. {t({ lv: "kl.", ru: "кл." })} · {t(activityText(person.activity))}
          </small>
        </span>
        {reachable ? (
          <span className="person-cta">
            <Icon name="trophy" size={18} /> {t({ lv: "Izaicināt", ru: "Вызвать" })}
          </span>
        ) : (
          <small className="person-busy">{t(person.activity.kind === "duel" ? L.inDuel : L.busy)}</small>
        )}
      </button>
      {open && reachable && (
        <div className="person-challenge">
          <div className="grade-pick small">
            {GRADES.map((gr) => (
              <button key={gr.grade} type="button" aria-pressed={grade === gr.grade} {...gradeColorAttrs(gr.grade)} onClick={() => setGrade(gr.grade)}>
                {gr.grade}.
              </button>
            ))}
          </div>
          <div className="segmented wide" role="group">
            {DURATIONS.map((d) => (
              <button key={d} type="button" aria-pressed={duration === d} onClick={() => setDuration(d)}>
                {d / 60} {t(L.min)}
              </button>
            ))}
          </div>
          {error && <p className="feedback bad">{t(error)}</p>}
          <button
            type="button"
            className="btn primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await g.challenge(person, grade, duration);
              } catch (e) {
                setError(
                  e instanceof Error && e.message === "closed"
                    ? { lv: `${person.name} pašlaik nav pieejams.`, ru: `${person.name} сейчас недоступен.` }
                    : errorText(e),
                );
                setBusy(false);
              }
            }}
          >
            <Icon name="send" size={18} /> {t(L.send)}
          </button>
        </div>
      )}
    </div>
  );
}

function AdminCard() {
  const { t } = useApp();
  const g = useGroup();
  const a = g.admin!;
  const [members, setMembers] = useState<AdminMember[] | null>(null);
  const [error, setError] = useState<T | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMembers((await groupApi.admin(a)).members);
      setError(null);
    } catch (e) {
      setError(errorText(e));
    }
  }, [a]);

  useEffect(() => {
    void refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const share = async () => {
    const text = t({
      lv: `Pievienojies mūsu grupai "${a.name}" Cipariņos! Grupas kods: ${a.code}`,
      ru: `Присоединяйся к нашей группе «${a.name}» в Ципариньях! Код группы: ${a.code}`,
    });
    try {
      if (navigator.share) await navigator.share({ title: "Cipariņi", text, url: `${location.origin}/sacensibas` });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }
    } catch {
      /* closed */
    }
  };

  return (
    <section className="group-card admin">
      <p className="eyebrow">{t({ lv: "Grupas pārvaldība", ru: "Управление группой" })}</p>
      <h2>{a.name}</h2>
      <p className="group-lead">{t({ lv: "Iedod šo kodu bērniem:", ru: "Дай этот код детям:" })}</p>
      <p className="group-code">{a.code}</p>
      <button type="button" className="btn ghost small" onClick={share}>
        <Icon name="share" size={16} /> {t(copied ? { lv: "Nokopēts", ru: "Скопировано" } : { lv: "Dalīties", ru: "Поделиться" })}
      </button>
      {error && <p className="feedback bad">{t(error)}</p>}
      <h3 className="group-header">
        {t({ lv: "Dalībnieki", ru: "Участники" })} · {members?.length ?? "…"}
      </h3>
      {members && members.length === 0 && (
        <p className="lobby-empty">{t({ lv: "Vēl neviens nav pievienojies.", ru: "Пока никто не присоединился." })}</p>
      )}
      {members && members.length > 0 && (
        <ul className="list">
          {members.map((m) => (
            <li key={m.id} className="row admin-row">
              <i className={`presence-dot ${m.online ? "on" : ""}`} aria-label={m.online ? "online" : "offline"} />
              <span className="row-text">
                <strong>{m.name}</strong>
                <small>
                  {m.grade}. {t({ lv: "klase", ru: "класс" })}
                </small>
              </span>
              <button
                type="button"
                className="btn ghost small"
                onClick={async () => {
                  if (!window.confirm(t({ lv: `Izņemt ${m.name} no grupas?`, ru: `Убрать ${m.name} из группы?` }))) return;
                  await groupApi.remove(a, m.id).catch(() => undefined);
                  void refresh();
                }}
              >
                {t({ lv: "Izņemt", ru: "Убрать" })}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="btn ghost small lobby-leave"
        onClick={() => {
          if (window.confirm(t({ lv: "Aizmirst šīs grupas pārvaldību šajā ierīcē?", ru: "Забыть управление группой на этом устройстве?" }))) g.forgetAdmin();
        }}
      >
        {t({ lv: "Aizmirst šajā ierīcē", ru: "Забыть на этом устройстве" })}
      </button>
    </section>
  );
}
