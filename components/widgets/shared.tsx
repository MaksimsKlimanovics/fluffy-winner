"use client";

import { useApp } from "../AppProvider";
import type { T } from "@/lib/i18n";

export type WidgetProps = { color: string };

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  label: T;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const { t } = useApp();
  return (
    <label className="slider">
      <span className="slider-label">
        {t(label)} <b>{fmt(value)}{suffix}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Readout({ children }: { children: React.ReactNode }) {
  return <div className="readout">{children}</div>;
}

/** Comma decimals, as written in Latvian and Russian schools. */
export function fmt(x: number, digits = 2): string {
  const r = Math.round(x * 10 ** digits) / 10 ** digits;
  return String(r).replace(".", ",").replace("-", "−");
}
