"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { Icon } from "../Icon";
import { Readout, Slider, type WidgetProps, fmt } from "./shared";

export function AreaGrid({ color, grade }: WidgetProps) {
  const { t } = useApp();
  const [w, setW] = useState(5);
  const [h, setH] = useState(3);
  const cell = 24;
  const max = 12;
  return (
    <div className="widget">
      <svg viewBox={`0 0 ${max * cell + 40} ${8 * cell + 40}`} className="widget-svg">
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: max }, (_, c) => (
            <rect
              key={`${r}-${c}`}
              x={20 + c * cell}
              y={10 + r * cell}
              width={cell - 2}
              height={cell - 2}
              rx="4"
              fill={r < h && c < w ? color : "#eef0fb"}
              opacity={r < h && c < w ? 0.85 : 1}
            />
          )),
        )}
        <rect x="19" y="9" width={w * cell} height={h * cell} fill="none" stroke="#2b2d42" strokeWidth="3" rx="4" />
        <text x={20 + (w * cell) / 2} y={h * cell + 28} textAnchor="middle" fontSize="13" fontWeight="800" fill="#2b2d42">
          {w} m
        </text>
        <text x={8} y={10 + (h * cell) / 2} textAnchor="middle" fontSize="13" fontWeight="800" fill="#2b2d42" transform={`rotate(-90 8 ${10 + (h * cell) / 2})`}>
          {h} m
        </text>
      </svg>
      <Slider label={{ lv: "Garums a", ru: "Длина a" }} value={w} min={1} max={max} onChange={setW} suffix=" m" />
      <Slider label={{ lv: "Platums b", ru: "Ширина b" }} value={h} min={1} max={8} onChange={setH} suffix=" m" />
      {grade <= 3 ? (
        // Stage 1–3: area as a count of squares, perimeter as the sum of sides (Skola2030 3:6.4.2).
        <Readout>
          {t({ lv: "Laukums", ru: "Площадь" })}: <b>{w * h} {t({ lv: "rūtiņas", ru: "клеток" })}</b>
          <br />
          {t({ lv: "Apkārtmērs", ru: "Периметр" })}: {w} + {h} + {w} + {h} = <b>{2 * (w + h)} m</b>
          <br />
          <small>{t({ lv: "Saskaiti iekrāsotās rūtiņas un visas malas!", ru: "Посчитай закрашенные клетки и все стороны!" })}</small>
        </Readout>
      ) : (
        <Readout>
          {t({ lv: "Laukums", ru: "Площадь" })} S = {w} · {h} = <b>{w * h} m²</b> ({w * h} {t({ lv: "rūtiņas", ru: "клеток" })})
          <br />
          {t({ lv: "Perimetrs", ru: "Периметр" })} P = 2 · ({w} + {h}) = <b>{2 * (w + h)} m</b>
          <br />
          <small>
            {w === h
              ? grade >= 7
                ? t({ lv: "Kvadrāts! Mala = √S", ru: "Квадрат! Сторона = √S" }) + ` = √${w * h} = ${w}`
                : t({ lv: "Kvadrāts! Visas malas ir vienādas.", ru: "Квадрат! Все стороны равны." })
              : t({
                  lv: "Pārbaudi apgalvojumu: “taisnstūriem ar vienādu perimetru arī laukumi ir vienādi”. Atrodi pretpiemēru ar P = 16!",
                  ru: "Проверь утверждение: «у прямоугольников с равным периметром и площади равны». Найди контрпример с P = 16!",
                })}
          </small>
        </Readout>
      )}
    </div>
  );
}

export function FractionPizza({ color }: WidgetProps) {
  const { t } = useApp();
  const [d, setD] = useState(8);
  const [n, setN] = useState(3);
  const num = Math.min(n, d);
  const slice = (k: number) => {
    const a0 = -Math.PI / 2 + (k * 2 * Math.PI) / d;
    const a1 = -Math.PI / 2 + ((k + 1) * 2 * Math.PI) / d;
    const r = 70;
    return `M 90 90 L ${90 + r * Math.cos(a0)} ${90 + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${90 + r * Math.cos(a1)} ${90 + r * Math.sin(a1)} Z`;
  };
  return (
    <div className="widget">
      <svg viewBox="0 0 180 180" className="widget-svg small">
        <circle cx="90" cy="90" r="78" fill="#e9c46a" />
        {Array.from({ length: d }, (_, k) => (
          <path
            key={k}
            d={slice(k)}
            fill={k < num ? color : "#fff3d6"}
            stroke="#e9c46a"
            strokeWidth="3"
            onClick={() => setN(k + 1 === num ? k : k + 1)}
            style={{ cursor: "pointer" }}
          />
        ))}
        {Array.from({ length: num }, (_, k) => {
          const a = -Math.PI / 2 + ((k + 0.5) * 2 * Math.PI) / d;
          return <circle key={k} cx={90 + 45 * Math.cos(a)} cy={90 + 45 * Math.sin(a)} r="5" fill="#c1121f" />;
        })}
      </svg>
      <Slider label={{ lv: "Gabalu skaits (saucējs)", ru: "Кусков (знаменатель)" }} value={d} min={2} max={12} onChange={(v) => { setD(v); setN((x) => Math.min(x, v)); }} />
      <Slider label={{ lv: "Paņemts (skaitītājs)", ru: "Взято (числитель)" }} value={num} min={0} max={d} onChange={setN} />
      <Readout>
        <span className="fraction">
          <sup>{num}</sup>/<sub>{d}</sub>
        </span>{" "}
        = {fmt(num / d, 3)} = <b>{fmt((num / d) * 100, 1)}%</b>
        <br />
        <small>{t({ lv: "Spied uz gabaliem, lai tos “apēstu”!", ru: "Нажимай на кусочки, чтобы их «съесть»!" })}</small>
      </Readout>
    </div>
  );
}

export function Angle({ color }: WidgetProps) {
  const { t } = useApp();
  const [deg, setDeg] = useState(60);
  const a = (-deg * Math.PI) / 180;
  const R = 80;
  const large = deg > 180 ? 1 : 0;
  const type =
    deg === 0
      ? { lv: "nulles leņķis", ru: "нулевой угол" }
      : deg < 90
        ? { lv: "šaurs leņķis", ru: "острый угол" }
        : deg === 90
          ? { lv: "taisns leņķis", ru: "прямой угол" }
          : deg < 180
            ? { lv: "plats leņķis", ru: "тупой угол" }
            : deg === 180
              ? { lv: "izstiepts leņķis", ru: "развёрнутый угол" }
              : deg < 360
                ? { lv: "ieliekts leņķis", ru: "угол больше развёрнутого" }
                : { lv: "pilns leņķis", ru: "полный угол" };
  const arc = deg >= 360
    ? `M ${100 + 30} 100 A 30 30 0 1 0 ${100 - 30} 100 A 30 30 0 1 0 ${100 + 30} 100`
    : `M ${100 + 30} 100 A 30 30 0 ${large} 0 ${100 + 30 * Math.cos(a)} ${100 + 30 * Math.sin(a)}`;
  return (
    <div className="widget">
      <svg viewBox="0 0 200 200" className="widget-svg small">
        <circle cx="100" cy="100" r="92" fill="#f5f6ff" />
        {Array.from({ length: 12 }, (_, k) => {
          const b = (-k * 30 * Math.PI) / 180;
          return (
            <text key={k} x={100 + 84 * Math.cos(b)} y={104 + 84 * Math.sin(b)} textAnchor="middle" fontSize="8" fill="#8d90b5">
              {k * 30}°
            </text>
          );
        })}
        <path d={arc} fill={color} opacity="0.25" stroke={color} strokeWidth="3" />
        <line x1="100" y1="100" x2={100 + R} y2="100" stroke="#2b2d42" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="100" x2={100 + R * Math.cos(a)} y2={100 + R * Math.sin(a)} stroke={color} strokeWidth="4" strokeLinecap="round" />
        {deg === 90 && <rect x="100" y="86" width="14" height="14" fill="none" stroke="#2b2d42" strokeWidth="2" />}
        <circle cx="100" cy="100" r="5" fill="#2b2d42" />
      </svg>
      <Slider label={{ lv: "Leņķis", ru: "Угол" }} value={deg} min={0} max={360} onChange={setDeg} suffix="°" />
      <Readout>
        <b>{deg}°</b> — {t(type)}
        <br />
        <small>
          {deg <= 180 &&
            t({
              lv: `Līdz izstieptam leņķim (180°) trūkst: 180° − ${deg}° = ${180 - deg}°`,
              ru: `До развёрнутого угла (180°) не хватает: 180° − ${deg}° = ${180 - deg}°`,
            })}
        </small>
      </Readout>
    </div>
  );
}

export function PercentBar({ color }: WidgetProps) {
  const { t } = useApp();
  const [price, setPrice] = useState(80);
  const [p, setP] = useState(25);
  const off = (price * p) / 100;
  return (
    <div className="widget">
      <div className="pbar">
        <div className="pbar-pay" style={{ width: `${100 - p}%`, background: color }}>
          {fmt(price - off)} €
        </div>
        <div className="pbar-off" style={{ width: `${p}%` }}>
          {p >= 12 && `−${fmt(off)} €`}
        </div>
      </div>
      <div className="pbar-scale">
        {[0, 25, 50, 75, 100].map((v) => (
          <span key={v}>{v}%</span>
        ))}
      </div>
      <Slider label={{ lv: "Cena", ru: "Цена" }} value={price} min={5} max={200} step={5} onChange={setPrice} suffix=" €" />
      <Slider label={{ lv: "Atlaide", ru: "Скидка" }} value={p} min={0} max={90} onChange={setP} suffix="%" />
      <Readout>
        {p}% {t({ lv: "no", ru: "от" })} {price} € = {price} · {p} : 100 = <b>{fmt(off)} €</b>
        <br />
        {t({ lv: "Jāmaksā", ru: "Платим" })}: {price} − {fmt(off)} = <b>{fmt(price - off)} €</b>
        <br />
        <small>
          {t({
            lv: `Tas pats: ${price} · ${fmt(1 - p / 100)} (paliek ${100 - p}%)`,
            ru: `То же самое: ${price} · ${fmt(1 - p / 100)} (остаётся ${100 - p}%)`,
          })}
        </small>
      </Readout>
    </div>
  );
}

export function Circle({ color, grade }: WidgetProps) {
  const { t } = useApp();
  const [d, setD] = useState(4);
  const C = Math.PI * d;
  const scale = 9;
  return (
    <div className="widget">
      <svg viewBox="0 0 340 170" className="widget-svg">
        <circle cx={20 + (d * scale) / 2} cy={60} r={(d * scale) / 2} fill={color} opacity="0.2" stroke={color} strokeWidth="4" />
        <line x1="20" y1="60" x2={20 + d * scale} y2="60" stroke="#2b2d42" strokeWidth="2" strokeDasharray="4 3" />
        <text x={20 + (d * scale) / 2} y="54" textAnchor="middle" fontSize="11" fontWeight="800">
          d = {d}
        </text>
        {/* unrolled circumference */}
        <line x1="20" y1="140" x2={20 + C * scale} y2="140" stroke={color} strokeWidth="6" strokeLinecap="round" />
        {[1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={20 + k * d * scale} y1="130" x2={20 + k * d * scale} y2="150" stroke="#2b2d42" strokeWidth="2" />
            <text x={20 + k * d * scale - (d * scale) / 2} y="162" textAnchor="middle" fontSize="10">
              d
            </text>
          </g>
        ))}
        <text x="20" y="124" fontSize="11" fontWeight="700" fill="#2b2d42">
          {t({ lv: "Atritināta riņķa līnija", ru: "Развёрнутая окружность" })}
        </text>
      </svg>
      <Slider label={{ lv: "Diametrs d", ru: "Диаметр d" }} value={d} min={2} max={10} step={0.5} onChange={setD} />
      {grade <= 6 ? (
        // Stage 4–6: "riņķa līnijas garumu (aptuveni trīs diametri)"; π comes in 7–9.
        <Readout>
          C ≈ 3 · d = 3 · {fmt(d)} = <b>{fmt(3 * d)}</b>
          <br />
          <small>
            {t({
              lv: `Atritinātā līnija ir nedaudz garāka par 3 diametriem (≈ ${fmt(C)}).`,
              ru: `Развёрнутая линия чуть длиннее 3 диаметров (≈ ${fmt(C)}).`,
            })}
          </small>
        </Readout>
      ) : (
        <Readout>
          C = π · d = 3,14 · {fmt(d)} ≈ <b>{fmt(C)}</b>
          <br />
          S = π · r² ≈ 3,14 · {fmt(d / 2)}² ≈ <b>{fmt(Math.PI * (d / 2) ** 2)}</b>
          <br />
          <small>
            {t({
              lv: "Riņķa līnijā vienmēr ietilpst nedaudz vairāk par 3 diametriem — tas ir π!",
              ru: "В окружность всегда помещается чуть больше 3 диаметров — это и есть π!",
            })}
          </small>
        </Readout>
      )}
    </div>
  );
}

// [a, b, c] for a·x + b = c, all with whole-number solutions.
const EQUATIONS: [number, number, number][] = [
  [3, 4, 19],
  [2, 6, 20],
  [4, 1, 29],
  [5, 3, 18],
  [2, 3, 21],
];

export function Balance({ color }: WidgetProps) {
  const { t } = useApp();
  const [eq, setEq] = useState(0);
  const [a, b, c] = EQUATIONS[eq];
  const [x, setX] = useState(2);
  const left = a * x + b;
  const tilt = Math.max(-14, Math.min(14, (c - left) * 2));
  return (
    <div className="widget">
      <svg viewBox="0 0 320 180" className="widget-svg">
        <polygon points="160,170 140,176 180,176" fill="#2b2d42" />
        <rect x="156" y="70" width="8" height="100" fill="#2b2d42" />
        <g transform={`rotate(${tilt} 160 70)`}>
          <rect x="30" y="66" width="260" height="8" rx="4" fill="#2b2d42" />
          {/* left pan: a boxes "x" + b weights */}
          <g transform="translate(40 30)">
            {Array.from({ length: a }, (_, k) => (
              <g key={k}>
                <rect x={k * 26} y="0" width="22" height="34" rx="5" fill={color} />
                <text x={k * 26 + 11} y="22" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="13">
                  x
                </text>
              </g>
            ))}
            {Array.from({ length: b }, (_, k) => (
              <circle key={k} cx={a * 26 + 8 + (k % 2) * 14} cy={k < 2 ? 26 : 12} r="7" fill="#ffc93c" stroke="#2b2d42" />
            ))}
          </g>
          {/* right pan: c weights */}
          <g transform="translate(200 30)">
            <rect x="0" y="0" width="74" height="34" rx="6" fill="#ffc93c" stroke="#2b2d42" />
            <text x="37" y="23" textAnchor="middle" fontWeight="800" fontSize="15" fill="#2b2d42">
              {c}
            </text>
          </g>
        </g>
      </svg>
      <Slider label={{ lv: "Mēģini x", ru: "Попробуй x" }} value={x} min={0} max={10} onChange={setX} />
      <Readout>
        {a}x + {b} = {c}
        <br />
        {a} · {x} + {b} = <b>{left}</b> {left === c ? "= " : left < c ? "< " : "> "}
        {c}{" "}
        {left === c
          ? t({ lv: "— svari līdzsvarā! x = ", ru: "— весы в равновесии! x = " }) + x + " 🎉"
          : t({ lv: "— svari nav līdzsvarā", ru: "— весы не уравновешены" })}
        <br />
        <small>
          {t({
            lv: `Gudrāk: noņem ${b} no abām pusēm → ${a}x = ${c - b}, tad dali ar ${a}.`,
            ru: `Умнее: убери ${b} с обеих чаш → ${a}x = ${c - b}, потом раздели на ${a}.`,
          })}
        </small>
      </Readout>
      <button
        className="btn ghost"
        onClick={() => {
          setEq((e) => (e + 1) % EQUATIONS.length);
          setX(0);
        }}
      >
        <Icon name="refresh" size={16} /> {t({ lv: "Cits vienādojums", ru: "Другое уравнение" })}
      </button>
    </div>
  );
}
