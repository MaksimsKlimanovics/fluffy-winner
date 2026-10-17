"use client";

import type { WidgetId } from "@/lib/curriculum";
import { LinearGraph, Parabola, Pythagoras, Triangle, Trig } from "./advanced";
import { Clock, Coins, MultGrid, NumberLine, Shapes } from "./basic";
import { BarChart, CoordPlane } from "./data";
import { Angle, AreaGrid, Balance, Circle, FractionPizza, PercentBar } from "./measure";
import type { WidgetProps } from "./shared";

const WIDGETS: Record<WidgetId, (props: WidgetProps) => React.ReactNode> = {
  numberLine: NumberLine,
  coins: Coins,
  shapes: Shapes,
  clock: Clock,
  multGrid: MultGrid,
  areaGrid: AreaGrid,
  fractionPizza: FractionPizza,
  angle: Angle,
  percentBar: PercentBar,
  circle: Circle,
  balance: Balance,
  triangle: Triangle,
  linearGraph: LinearGraph,
  pythagoras: Pythagoras,
  parabola: Parabola,
  trig: Trig,
  barChart: BarChart,
  coordPlane: CoordPlane,
};

export function Widget({ id, color, grade }: { id: WidgetId; color: string; grade: number }) {
  const Component = WIDGETS[id];
  return <Component color={color} grade={grade} />;
}
