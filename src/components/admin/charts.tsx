"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GOLD = "#B8893F";
const INK = "#1B1A17";
const GRID = "rgba(27,26,23,.10)";
const AXIS = { fontSize: 12, fill: "rgba(27,26,23,.62)" };

const tooltipStyle = {
  contentStyle: {
    background: "#FBF8F2",
    border: "1px solid rgba(27,26,23,.13)",
    borderRadius: 12,
    fontFamily: "inherit",
    fontSize: 13,
  },
  labelStyle: { fontWeight: 700, color: INK },
  itemStyle: { color: INK },
};

/** Single-series daily revenue (orders are shown in the stat tiles — never a second y-axis) */
export function RevenueChart({
  data,
  label,
  rtl,
  currency,
}: {
  data: { day: string; revenue: number; orders: number }[];
  label: string;
  rtl: boolean;
  currency: string;
}) {
  return (
    <div className="h-[280px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
              <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="day"
            tick={AXIS}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            reversed={rtl}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={56}
            orientation={rtl ? "right" : "left"}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))}
          />
          <Tooltip
            {...tooltipStyle}
            cursor={{ stroke: INK, strokeOpacity: 0.25 }}
            formatter={(v) => [`${Number(v).toLocaleString("en-US")} ${currency}`, label]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name={label}
            stroke={GOLD}
            strokeWidth={2}
            fill="url(#rev)"
            activeDot={{ r: 5, stroke: "#FBF8F2", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bars for a handful of categories (one series → no legend; values labelled in the tooltip) */
export function CategoryBars({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  return (
    <div className="w-full" style={{ height: Math.max(160, data.length * 44) }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={10}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={120} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(184,137,63,.10)" }} formatter={(v) => [String(v), label]} />
          <Bar dataKey="value" name={label} fill={GOLD} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
