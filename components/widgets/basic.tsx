"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { Readout, Slider, type WidgetProps, fmt } from "./shared";

export function NumberLine({ color }: WidgetProps) {
  const { t } = useApp();
  const [start, setStart] = useState(4);
  const [step, setStep] = useState(7);
  const min = -10;
  const max = 30;
  const end = start + step;
  const W = 340;
  const x = (v: number) => 14 + ((v - min) / (max - min)) * (W - 28);
  const arcTop = 70 - Math.min(60, Math.abs(x(end) - x(start)) / 2);

  return (
    <div className="widget">
      <svg viewBox={`0 0 ${W} 110`} className="widget-svg">
        <line x1="10" y1="80" x2={W - 10} y2="80" stroke="#2b2d42" strokeWidth="2" />
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={v % 5 === 0 ? 72 : 76} x2={x(v)} y2={v % 5 === 0 ? 88 : 84} stroke="#2b2d42" strokeWidth={v === 0 ? 2.5 : 1} />
            {v % 5 === 0 && (
              <text x={x(v)} y="102" textAnchor="middle" fontSize="10" fill="#2b2d42">
                {String(v).replace("-", "−")}
              </text>
            )}
          </g>
        ))}
        <path
          d={`M ${x(start)} 78 Q ${(x(start) + x(end)) / 2} ${arcTop} ${x(end)} 78`}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="5 4"
        />
        <circle cx={x(start)} cy="80" r="7" fill="#2b2d42" />
        <circle cx={x(end)} cy="80" r="8" fill={color} />
        <text x={x(end)} y={arcTop + 18} textAnchor="middle" fontSize="12" fontWeight="800" fill={color}>
          {step >= 0 ? `+${step}` : `−${-step}`}
        </text>
      </svg>
      <Slider label={{ lv: "Sākums", ru: "Начало" }} value={start} min={-10} max={20} onChange={setStart} />
      <Slider label={{ lv: "Solis", ru: "Шаг" }} value={step} min={-10} max={10} onChange={setStep} />
      <Readout>
        {fmt(start)} {step >= 0 ? "+" : "−"} {Math.abs(step)} = <b>{fmt(end)}</b>
        <br />
        <small>
          {t(
            step >= 0
              ? { lv: "Saskaitot ejam pa labi →", ru: "При сложении идём вправо →" }
              : { lv: "Atņemot ejam pa kreisi ←", ru: "При вычитании идём влево ←" },
          )}
        </small>
      </Readout>
    </div>
  );
}

const COINS = [1, 2, 5, 10, 20, 50, 100, 200];

export function Coins({ color, grade }: WidgetProps) {
  const { t } = useApp();
  // Grade 1 counts within 20 (Skola2030 3.2.2), so only the small coins.
  const small = grade <= 1;
  const coins = small ? COINS.slice(0, 4) : COINS;
  const [target, setTarget] = useState(small ? 17 : 45);
  const [purse, setPurse] = useState<number[]>([]);
  const sum = purse.reduce((s, c) => s + c, 0);
  const label = (c: number) => (c >= 100 ? `${c / 100}€` : `${c}c`);

  return (
    <div className="widget">
      <p className="widget-task">
        🍦 {t({ lv: "Saldējums maksā", ru: "Мороженое стоит" })} <b>{small ? `${target} c` : `${fmt(target / 100)} €`}</b>.{" "}
        {t({ lv: "Saliec tieši tik daudz!", ru: "Собери ровно столько!" })}
      </p>
      <div className="coin-row">
        {coins.map((c) => (
          <button key={c} className={`coin ${c >= 100 ? "euro" : c >= 10 ? "gold" : "copper"}`} onClick={() => setPurse((p) => [...p, c])}>
            {label(c)}
          </button>
        ))}
      </div>
      <div className="purse" aria-live="polite">
        {purse.length === 0 ? (
          <small>{t({ lv: "Spied uz monētām", ru: "Нажимай на монеты" })}</small>
        ) : (
          purse.map((c, i) => (
            <button key={i} className={`coin small ${c >= 100 ? "euro" : c >= 10 ? "gold" : "copper"}`} onClick={() => setPurse((p) => p.filter((_, j) => j !== i))}>
              {label(c)}
            </button>
          ))
        )}
      </div>
      <Readout>
        {t({ lv: "Kopā", ru: "Всего" })}: <b style={{ color: sum === target ? "#2a9d8f" : color }}>{sum} c</b>{" "}
        {sum === target
          ? t({ lv: "— tieši! 🎉", ru: "— ровно! 🎉" })
          : sum > target
            ? t({ lv: `— par ${sum - target} c par daudz`, ru: `— на ${sum - target} ц больше` })
            : t({ lv: `— vēl trūkst ${target - sum} c`, ru: `— не хватает ${target - sum} ц` })}
      </Readout>
      <div className="row">
        <button className="btn ghost" onClick={() => setPurse([])}>
          ↺ {t({ lv: "Iztukšot", ru: "Очистить" })}
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            setTarget(small ? 5 + Math.floor(Math.random() * 16) : 35 + Math.floor(Math.random() * 30) * 5);
            setPurse([]);
          }}
        >
          🍦 {t({ lv: "Cita cena", ru: "Другая цена" })}
        </button>
      </div>
    </div>
  );
}

const SHAPES = [
  { n: 3, lv: "Trijstūris", ru: "Треугольник", ex: { lv: "jumts, ceļa zīme", ru: "крыша, дорожный знак" } },
  { n: 4, lv: "Kvadrāts", ru: "Квадрат", ex: { lv: "šaha lauciņš, flīze", ru: "шахматная клетка, плитка" } },
  { n: 5, lv: "Piecstūris", ru: "Пятиугольник", ex: { lv: "futbola bumbas lāpīte", ru: "заплатка футбольного мяча" } },
  { n: 6, lv: "Sešstūris", ru: "Шестиугольник", ex: { lv: "bišu šūna, uzgrieznis", ru: "пчелиные соты, гайка" } },
  { n: 0, lv: "Aplis", ru: "Круг", ex: { lv: "ritenis, šķīvis, monēta", ru: "колесо, тарелка, монета" } },
];

export function Shapes({ color }: WidgetProps) {
  const { lang, t } = useApp();
  const [i, setI] = useState(0);
  const s = SHAPES[i];
  const pts = Array.from({ length: s.n }, (_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / s.n + (s.n === 4 ? Math.PI / 4 : 0);
    return [100 + 60 * Math.cos(a), 80 + 60 * Math.sin(a)];
  });
  return (
    <div className="widget">
      <div className="seg">
        {SHAPES.map((sh, k) => (
          <button key={k} className={k === i ? "active" : ""} onClick={() => setI(k)}>
            {sh[lang]}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 200 160" className="widget-svg small">
        {s.n === 0 ? (
          <circle cx="100" cy="80" r="60" fill={color} opacity="0.85" />
        ) : (
          <>
            <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={color} opacity="0.85" />
            {pts.map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r="6" fill="#ffc93c" stroke="#2b2d42" strokeWidth="2" />
            ))}
          </>
        )}
      </svg>
      <Readout>
        <b>{s[lang]}</b>:{" "}
        {s.n === 0
          ? t({ lv: "nav stūru un malu", ru: "нет углов и сторон" })
          : t({ lv: `${s.n} malas, ${s.n} stūri`, ru: `${s.n} сторон(ы), ${s.n} угла(ов)` })}
        <br />
        <small>
          {t({ lv: "Kur sastopams:", ru: "Где встречается:" })} {t(s.ex)}
        </small>
      </Readout>
    </div>
  );
}

export function Clock({ color }: WidgetProps) {
  const { t } = useApp();
  const [mins, setMins] = useState(8 * 60 + 15);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = m * 6;
  const hand = (angle: number, len: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return [80 + len * Math.cos(a), 80 + len * Math.sin(a)];
  };
  const [hx, hy] = hand(hourAngle, 34);
  const [mx, my] = hand(minAngle, 52);
  const part =
    h < 6 ? { lv: "nakts", ru: "ночь" } : h < 12 ? { lv: "rīts", ru: "утро" } : h < 18 ? { lv: "diena", ru: "день" } : { lv: "vakars", ru: "вечер" };

  return (
    <div className="widget">
      <svg viewBox="0 0 160 160" className="widget-svg small">
        <circle cx="80" cy="80" r="72" fill="#fff" stroke={color} strokeWidth="6" />
        {Array.from({ length: 12 }, (_, k) => {
          const [x, y] = hand(k * 30, 60);
          return (
            <text key={k} x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2b2d42">
              {k === 0 ? 12 : k}
            </text>
          );
        })}
        <line x1="80" y1="80" x2={hx} y2={hy} stroke="#2b2d42" strokeWidth="6" strokeLinecap="round" />
        <line x1="80" y1="80" x2={mx} y2={my} stroke={color} strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="80" r="5" fill="#2b2d42" />
      </svg>
      <Slider label={{ lv: "Laiks", ru: "Время" }} value={mins} min={0} max={1435} step={5} onChange={setMins} suffix=" min" />
      <Readout>
        <b className="digital">
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}
        </b>{" "}
        — {t(part)}
        <br />
        <small>
          {t({
            lv: `Līdz pusnaktij vēl ${Math.floor((1440 - mins) / 60)} h ${(1440 - mins) % 60} min`,
            ru: `До полуночи ещё ${Math.floor((1440 - mins) / 60)} ч ${(1440 - mins) % 60} мин`,
          })}
        </small>
      </Readout>
    </div>
  );
}

export function MultGrid({ color }: WidgetProps) {
  const { t } = useApp();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(6);
  const cell = 26;
  return (
    <div className="widget">
      <svg viewBox={`0 0 ${10 * cell + 4} ${10 * cell + 4}`} className="widget-svg square">
        {Array.from({ length: 10 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => (
            <circle
              key={`${r}-${c}`}
              cx={c * cell + cell / 2 + 2}
              cy={r * cell + cell / 2 + 2}
              r={r < rows && c < cols ? 10 : 4}
              fill={r < rows && c < cols ? color : "#d9dcf2"}
            />
          )),
        )}
      </svg>
      <Slider label={{ lv: "Rindas", ru: "Ряды" }} value={rows} min={1} max={10} onChange={setRows} />
      <Slider label={{ lv: "Kolonnas", ru: "Столбцы" }} value={cols} min={1} max={10} onChange={setCols} />
      <Readout>
        {rows} · {cols} = <b>{rows * cols}</b>
        <br />
        <small>
          {t({ lv: "Un otrādi:", ru: "И наоборот:" })} {rows * cols} : {rows} = {cols}, {rows * cols} : {cols} = {rows}
        </small>
      </Readout>
    </div>
  );
}
