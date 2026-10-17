"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { Readout, Slider, type WidgetProps, fmt } from "./shared";

const rad = (d: number) => (d * Math.PI) / 180;

export function Triangle({ color }: WidgetProps) {
  const { t } = useApp();
  const [A, setA] = useState(60);
  const [B, setB] = useState(50);
  const Bc = Math.min(B, 175 - A);
  const C = 180 - A - Bc;
  // Base from (40,150) to (280,150); apex from the law of sines.
  const base = 240;
  const sideB = (base * Math.sin(rad(Bc))) / Math.sin(rad(C));
  const apex = [40 + sideB * Math.cos(rad(A)), 150 - sideB * Math.sin(rad(A))];
  const scale = apex[1] < 10 ? 140 / (150 - apex[1]) : 1;
  const P = (x: number, y: number) => `${40 + (x - 40) * scale},${150 - (150 - y) * scale}`;
  return (
    <div className="widget">
      <svg viewBox="0 0 320 170" className="widget-svg">
        <polygon points={`${P(40, 150)} ${P(280, 150)} ${P(apex[0], apex[1])}`} fill={color} opacity="0.25" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <text x="52" y="144" fontSize="13" fontWeight="800">{A}°</text>
        <text x={40 + 240 * scale - 40} y="144" fontSize="13" fontWeight="800">{Bc}°</text>
        <text x={Number(P(apex[0], apex[1]).split(",")[0])} y={Number(P(apex[0], apex[1]).split(",")[1]) + 22} textAnchor="middle" fontSize="13" fontWeight="800" fill="#c1121f">
          {C}°
        </text>
      </svg>
      <Slider label={{ lv: "Leņķis α", ru: "Угол α" }} value={A} min={10} max={160} onChange={setA} suffix="°" />
      <Slider label={{ lv: "Leņķis β", ru: "Угол β" }} value={Bc} min={5} max={175 - A} onChange={setB} suffix="°" />
      <Readout>
        γ = 180° − {A}° − {Bc}° = <b>{C}°</b>
        <br />
        <small>
          {A === 90 || Bc === 90 || C === 90
            ? t({ lv: "Taisnleņķa trijstūris!", ru: "Прямоугольный треугольник!" })
            : A > 90 || Bc > 90 || C > 90
              ? t({ lv: "Platleņķa trijstūris", ru: "Тупоугольный треугольник" })
              : t({ lv: "Šaurleņķa trijstūris", ru: "Остроугольный треугольник" })}
          {(A === Bc || Bc === C || A === C) && t({ lv: " · vienādsānu", ru: " · равнобедренный" })}
        </small>
      </Readout>
    </div>
  );
}

const GX = (x: number) => 160 + x * 14;
const GY = (y: number) => 110 - y * 14;

function Grid() {
  return (
    <g>
      {Array.from({ length: 23 }, (_, i) => i - 11).map((v) => (
        <g key={v}>
          <line x1={GX(v)} y1="0" x2={GX(v)} y2="220" stroke="#eef0fb" />
          <line x1="0" y1={GY(v)} x2="320" y2={GY(v)} stroke="#eef0fb" />
        </g>
      ))}
      <line x1="0" y1={GY(0)} x2="320" y2={GY(0)} stroke="#2b2d42" strokeWidth="1.5" />
      <line x1={GX(0)} y1="0" x2={GX(0)} y2="220" stroke="#2b2d42" strokeWidth="1.5" />
      <text x="310" y={GY(0) - 4} fontSize="10">x</text>
      <text x={GX(0) + 4} y="10" fontSize="10">y</text>
      {[-10, -5, 5, 10].map((v) => (
        <text key={v} x={GX(v)} y={GY(0) + 12} fontSize="8" textAnchor="middle" fill="#8d90b5">
          {String(v).replace("-", "−")}
        </text>
      ))}
    </g>
  );
}

export function LinearGraph({ color }: WidgetProps) {
  const { t } = useApp();
  const [k, setK] = useState(1);
  const [b, setB] = useState(2);
  const pts = [-12, 12].map((x) => `${GX(x)},${GY(k * x + b)}`).join(" ");
  return (
    <div className="widget">
      <svg viewBox="0 0 320 220" className="widget-svg">
        <defs>
          <clipPath id="lg-clip">
            <rect width="320" height="220" />
          </clipPath>
        </defs>
        <Grid />
        <polyline points={pts} stroke={color} strokeWidth="3.5" fill="none" clipPath="url(#lg-clip)" />
        <circle cx={GX(0)} cy={GY(b)} r="5" fill="#ffc93c" stroke="#2b2d42" />
        {k !== 0 && Math.abs(-b / k) <= 11 && <circle cx={GX(-b / k)} cy={GY(0)} r="5" fill="#fff" stroke="#2b2d42" strokeWidth="2" />}
      </svg>
      <Slider label={{ lv: "Slīpums k", ru: "Наклон k" }} value={k} min={-3} max={3} step={0.25} onChange={setK} />
      <Slider label={{ lv: "Nobīde b", ru: "Сдвиг b" }} value={b} min={-6} max={6} step={0.5} onChange={setB} />
      <Readout>
        y = <b>{fmt(k)}</b>x {b >= 0 ? "+" : "−"} <b>{fmt(Math.abs(b))}</b>
        <br />
        <small>
          {k > 0
            ? t({ lv: "k > 0 → funkcija aug ↗", ru: "k > 0 → функция растёт ↗" })
            : k < 0
              ? t({ lv: "k < 0 → funkcija dilst ↘", ru: "k < 0 → функция убывает ↘" })
              : t({ lv: "k = 0 → horizontāla taisne", ru: "k = 0 → горизонтальная прямая" })}
          {" · "}
          {t({ lv: `krusto y asi punktā (0; ${fmt(b)})`, ru: `пересекает ось y в точке (0; ${fmt(b)})` })}
        </small>
      </Readout>
    </div>
  );
}

export function Pythagoras({ color }: WidgetProps) {
  const { t } = useApp();
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.hypot(a, b);
  // Scale so the triangle plus all three squares always fit the frame.
  const s = Math.min(16, 300 / (2 * a + b), 300 / (a + 2 * b));
  // Right angle at O; legs along +x (b) and −y (a).
  const O = [a * s + 10, (a + b) * s + 10];
  const Bp = [O[0] + b * s, O[1]];
  const Ap = [O[0], O[1] - a * s];
  const W = (2 * a + b) * s + 20;
  const H = (a + 2 * b) * s + 20;
  const sq = (p: number[], q: number[], ox: number, oy: number) =>
    `${p[0]},${p[1]} ${q[0]},${q[1]} ${q[0] + ox},${q[1] + oy} ${p[0] + ox},${p[1] + oy}`;
  return (
    <div className="widget">
      <svg viewBox={`0 0 ${W} ${H}`} className="widget-svg square">
        <polygon points={sq(O, Bp, 0, b * s)} fill="#4cc9f0" opacity="0.35" />
        <polygon points={sq(O, Ap, -a * s, 0)} fill="#ffc93c" opacity="0.5" />
        <polygon points={sq(Bp, Ap, a * s, -b * s)} fill={color} opacity="0.3" />
        <polygon points={`${O.join(",")} ${Bp.join(",")} ${Ap.join(",")}`} fill="#fff" stroke="#2b2d42" strokeWidth="3" />
        <rect x={O[0]} y={O[1] - 10} width="10" height="10" fill="none" stroke="#2b2d42" />
        <text x={O[0] - (a * s) / 2} y={O[1] - (a * s) / 2 + 4} textAnchor="middle" fontWeight="800" fontSize="12">a² = {a * a}</text>
        <text x={O[0] + (b * s) / 2} y={O[1] + (b * s) / 2 + 4} textAnchor="middle" fontWeight="800" fontSize="12">b² = {b * b}</text>
        <text x={(Ap[0] + Bp[0] + a * s) / 2} y={(Ap[1] + Bp[1] - b * s) / 2 + 4} textAnchor="middle" fontWeight="800" fontSize="12">
          c² = {fmt(c * c)}
        </text>
      </svg>
      <Slider label={{ lv: "Augstums a", ru: "Высота a" }} value={a} min={1} max={8} onChange={setA} suffix=" m" />
      <Slider label={{ lv: "Attālums b", ru: "Расстояние b" }} value={b} min={1} max={10} onChange={setB} suffix=" m" />
      <Readout>
        c = √({a}² + {b}²) = √{a * a + b * b} ≈ <b>{fmt(c)} m</b>
        <br />
        <small>
          {Number.isInteger(c)
            ? t({ lv: "Vesels skaitlis — Pitagora trijnieks! 🎉", ru: "Целое число — пифагорова тройка! 🎉" })
            : t({ lv: "Atrodi a un b, lai c būtu vesels (piem. 3 un 4)", ru: "Найди a и b, чтобы c было целым (напр. 3 и 4)" })}
        </small>
      </Readout>
    </div>
  );
}

export function Parabola({ color }: WidgetProps) {
  const { t } = useApp();
  const [a, setA] = useState(-1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);
  const D = b * b - 4 * a * c;
  const roots = a === 0 ? [] : D < 0 ? [] : D === 0 ? [-b / (2 * a)] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
  const vx = a === 0 ? 0 : -b / (2 * a);
  const vy = a * vx * vx + b * vx + c;
  const pts = Array.from({ length: 121 }, (_, i) => -12 + i * 0.2)
    .map((x) => `${GX(x)},${GY(a * x * x + b * x + c)}`)
    .join(" ");
  return (
    <div className="widget">
      <svg viewBox="0 0 320 220" className="widget-svg">
        <defs>
          <clipPath id="pb-clip">
            <rect width="320" height="220" />
          </clipPath>
        </defs>
        <Grid />
        <polyline points={pts} stroke={color} strokeWidth="3.5" fill="none" clipPath="url(#pb-clip)" />
        {a !== 0 && <circle cx={GX(vx)} cy={GY(vy)} r="5" fill="#ffc93c" stroke="#2b2d42" />}
        {roots.map((r) => (
          <circle key={r} cx={GX(r)} cy={GY(0)} r="5" fill="#fff" stroke="#2b2d42" strokeWidth="2" />
        ))}
      </svg>
      <Slider label={{ lv: "a", ru: "a" }} value={a} min={-3} max={3} step={0.5} onChange={setA} />
      <Slider label={{ lv: "b", ru: "b" }} value={b} min={-6} max={6} onChange={setB} />
      <Slider label={{ lv: "c", ru: "c" }} value={c} min={-6} max={6} onChange={setC} />
      <Readout>
        y = {fmt(a)}x² {b >= 0 ? "+" : "−"} {Math.abs(b)}x {c >= 0 ? "+" : "−"} {Math.abs(c)}
        <br />
        D = {b}² − 4·{fmt(a)}·{c} = <b>{fmt(D)}</b> →{" "}
        {a === 0
          ? t({ lv: "a = 0: tā ir taisne, nevis parabola", ru: "a = 0: это прямая, а не парабола" })
          : roots.length === 2
            ? `x₁ ≈ ${fmt(roots[0])}, x₂ ≈ ${fmt(roots[1])}`
            : roots.length === 1
              ? `x = ${fmt(roots[0])}`
              : t({ lv: "nav reālu sakņu", ru: "нет действительных корней" })}
        <br />
        <small>
          {a !== 0 &&
            t({
              lv: `Virsotne (${fmt(vx)}; ${fmt(vy)}) — ${a < 0 ? "bumbas augstākais punkts" : "zemākais punkts"}`,
              ru: `Вершина (${fmt(vx)}; ${fmt(vy)}) — ${a < 0 ? "самая высокая точка полёта мяча" : "самая низкая точка"}`,
            })}
        </small>
      </Readout>
    </div>
  );
}

export function Trig({ color }: WidgetProps) {
  const { t } = useApp();
  const [angle, setAngle] = useState(35);
  const [dist, setDist] = useState(20);
  const h = dist * Math.tan(rad(angle));
  const scale = Math.min(9, 150 / Math.max(h, 1), 240 / dist);
  const eye = [40, 170];
  const top = [eye[0] + dist * scale, eye[1] - h * scale];
  return (
    <div className="widget">
      <svg viewBox="0 0 320 200" className="widget-svg">
        <rect x="0" y="170" width="320" height="30" fill="#b7e4c7" />
        {/* tree/tower */}
        <rect x={top[0] - 4} y={top[1]} width="8" height={170 - top[1]} fill="#8d6e63" />
        <circle cx={top[0]} cy={top[1] + 6} r="14" fill="#2a9d8f" />
        {/* person */}
        <circle cx={eye[0] - 6} cy={eye[1] - 18} r="6" fill="#2b2d42" />
        <line x1={eye[0] - 6} y1={eye[1] - 12} x2={eye[0] - 6} y2={eye[1]} stroke="#2b2d42" strokeWidth="4" />
        {/* triangle */}
        <polygon points={`${eye[0]},${eye[1]} ${top[0]},${eye[1]} ${top[0]},${top[1]}`} fill={color} opacity="0.15" stroke={color} strokeWidth="2.5" strokeDasharray="6 4" />
        <path d={`M ${eye[0] + 28} ${eye[1]} A 28 28 0 0 0 ${eye[0] + 28 * Math.cos(rad(angle))} ${eye[1] - 28 * Math.sin(rad(angle))}`} fill="none" stroke="#2b2d42" strokeWidth="2" />
        <text x={eye[0] + 34} y={eye[1] - 6} fontSize="11" fontWeight="800">{angle}°</text>
        <text x={(eye[0] + top[0]) / 2} y={eye[1] + 16} textAnchor="middle" fontSize="11" fontWeight="800">{dist} m</text>
        <text x={top[0] + 18} y={(eye[1] + top[1]) / 2} fontSize="11" fontWeight="800" fill="#c1121f">h ≈ {fmt(h, 1)} m</text>
      </svg>
      <Slider label={{ lv: "Skata leņķis α", ru: "Угол взгляда α" }} value={angle} min={5} max={75} onChange={setAngle} suffix="°" />
      <Slider label={{ lv: "Attālums", ru: "Расстояние" }} value={dist} min={5} max={40} onChange={setDist} suffix=" m" />
      <Readout>
        h = {dist} · tg {angle}° = {dist} · {fmt(Math.tan(rad(angle)), 3)} ≈ <b>{fmt(h, 1)} m</b>
        <br />
        <small>
          sin {angle}° ≈ {fmt(Math.sin(rad(angle)), 3)} · cos {angle}° ≈ {fmt(Math.cos(rad(angle)), 3)} · tg {angle}° ≈{" "}
          {fmt(Math.tan(rad(angle)), 3)}
        </small>
        <br />
        <small>
          {t({
            lv: "Tā mērnieki un arhitekti nosaka augstumu, nekāpjot augšā!",
            ru: "Так геодезисты и архитекторы определяют высоту, не забираясь наверх!",
          })}
        </small>
      </Readout>
    </div>
  );
}
