"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { Readout, Slider, type WidgetProps, fmt } from "./shared";

const CATEGORIES = [
  { lv: "Zoodārzs", ru: "Зоопарк", icon: "🦒" },
  { lv: "Rundāle", ru: "Рундале", icon: "🏰" },
  { lv: "Akvaparks", ru: "Аквапарк", icon: "🌊" },
  { lv: "Planetārijs", ru: "Планетарий", icon: "🔭" },
];

/** Stage 1–3: read and compare (5.1.2–5.1.4). Stage 7–9: mode, median, range (5.1.4). */
export function BarChart({ color, grade }: WidgetProps) {
  const { lang, t } = useApp();
  const [values, setValues] = useState([9, 6, 11, 4]);
  const max = 15;
  const top = Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = (sorted[1] + sorted[2]) / 2;
  const total = values.reduce((s, v) => s + v, 0);
  const winners = CATEGORIES.filter((_, i) => values[i] === top).map((c) => c[lang]);
  const H = 150;
  return (
    <div className="widget">
      <svg viewBox="0 0 320 200" className="widget-svg">
        {[0, 5, 10, 15].map((v) => (
          <g key={v}>
            <line x1="30" y1={170 - (v / max) * H} x2="310" y2={170 - (v / max) * H} stroke="#e3e6f7" />
            <text x="22" y={174 - (v / max) * H} fontSize="10" textAnchor="end" fill="#6b6f93">
              {v}
            </text>
          </g>
        ))}
        {values.map((v, i) => (
          <g key={i}>
            <rect
              x={44 + i * 68}
              y={170 - (v / max) * H}
              width="44"
              height={(v / max) * H}
              rx="6"
              fill={v === top ? color : "#b8bcf0"}
            />
            <text x={66 + i * 68} y={164 - (v / max) * H} textAnchor="middle" fontSize="12" fontWeight="800">
              {v}
            </text>
            <text x={66 + i * 68} y="190" textAnchor="middle" fontSize="16">
              {CATEGORIES[i].icon}
            </text>
          </g>
        ))}
      </svg>
      {CATEGORIES.map((c, i) => (
        <Slider
          key={i}
          label={{ lv: `${c.icon} ${c.lv}`, ru: `${c.icon} ${c.ru}` }}
          value={values[i]}
          min={0}
          max={max}
          onChange={(v) => setValues((prev) => prev.map((x, j) => (j === i ? v : x)))}
        />
      ))}
      <Readout>
        {t({ lv: "Visvairāk balsu", ru: "Больше всего голосов" })}: <b>{winners.join(", ")}</b> ({top})
        <br />
        {t({ lv: "Kopā nobalsoja", ru: "Всего проголосовало" })}: {values.join(" + ")} = <b>{total}</b>
        {grade >= 7 && (
          <>
            <br />
            {t({ lv: "Sakārtots", ru: "По порядку" })}: {sorted.join("; ")} → {t({ lv: "mediāna", ru: "медиана" })} ={" "}
            <b>{fmt(median)}</b>, {t({ lv: "amplitūda", ru: "амплитуда" })} = {sorted[3]} − {sorted[0]} ={" "}
            <b>{sorted[3] - sorted[0]}</b>
          </>
        )}
      </Readout>
    </div>
  );
}

/** Stage 4–6: read and plot a point by its coordinates (6:6.2.1). */
export function CoordPlane({ color }: WidgetProps) {
  const { t } = useApp();
  const [x, setX] = useState(3);
  const [y, setY] = useState(2);
  const u = 18;
  const X = (v: number) => 160 + v * u;
  const Y = (v: number) => 120 - v * u;
  const s = (v: number) => String(v).replace("-", "−");
  const where =
    x === 0 && y === 0
      ? { lv: "koordinātu sākumpunktā", ru: "в начале координат" }
      : x === 0
        ? { lv: "uz y ass", ru: "на оси y" }
        : y === 0
          ? { lv: "uz x ass", ru: "на оси x" }
          : x > 0
            ? y > 0
              ? { lv: "augšā pa labi", ru: "вверху справа" }
              : { lv: "lejā pa labi", ru: "внизу справа" }
            : y > 0
              ? { lv: "augšā pa kreisi", ru: "вверху слева" }
              : { lv: "lejā pa kreisi", ru: "внизу слева" };
  return (
    <div className="widget">
      <svg viewBox="0 0 320 240" className="widget-svg">
        {Array.from({ length: 17 }, (_, i) => i - 8).map((v) => (
          <g key={v}>
            <line x1={X(v)} y1="0" x2={X(v)} y2="240" stroke="#eef0fb" />
            {Math.abs(v) <= 6 && <line x1="0" y1={Y(v)} x2="320" y2={Y(v)} stroke="#eef0fb" />}
          </g>
        ))}
        <line x1="0" y1={Y(0)} x2="320" y2={Y(0)} stroke="#2b2d42" strokeWidth="1.5" />
        <line x1={X(0)} y1="0" x2={X(0)} y2="240" stroke="#2b2d42" strokeWidth="1.5" />
        <text x="310" y={Y(0) - 5} fontSize="11">x</text>
        <text x={X(0) + 5} y="12" fontSize="11">y</text>
        {[-6, -3, 3, 6].map((v) => (
          <g key={v} fontSize="9" fill="#8d90b5">
            <text x={X(v)} y={Y(0) + 12} textAnchor="middle">{s(v)}</text>
            <text x={X(0) - 4} y={Y(v) + 3} textAnchor="end">{s(v)}</text>
          </g>
        ))}
        <line x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(y)} stroke={color} strokeDasharray="4 3" strokeWidth="2" />
        <line x1={X(0)} y1={Y(y)} x2={X(x)} y2={Y(y)} stroke={color} strokeDasharray="4 3" strokeWidth="2" />
        <circle cx={X(x)} cy={Y(y)} r="7" fill={color} stroke="#fff" strokeWidth="2" />
        <text x={X(x) + 10} y={Y(y) - 8} fontSize="12" fontWeight="800">
          A({s(x)}; {s(y)})
        </text>
      </svg>
      <Slider label={{ lv: "x (pa labi / pa kreisi)", ru: "x (вправо / влево)" }} value={x} min={-8} max={8} onChange={setX} />
      <Slider label={{ lv: "y (uz augšu / uz leju)", ru: "y (вверх / вниз)" }} value={y} min={-6} max={6} onChange={setY} />
      <Readout>
        A(<b>{s(x)}</b>; <b>{s(y)}</b>) — {t(where)}
        <br />
        <small>
          {t({
            lv: `No sākumpunkta: ${Math.abs(x)} ${x >= 0 ? "pa labi" : "pa kreisi"}, ${Math.abs(y)} ${y >= 0 ? "uz augšu" : "uz leju"}.`,
            ru: `От начала: ${Math.abs(x)} ${x >= 0 ? "вправо" : "влево"}, ${Math.abs(y)} ${y >= 0 ? "вверх" : "вниз"}.`,
          })}
        </small>
      </Readout>
    </div>
  );
}
