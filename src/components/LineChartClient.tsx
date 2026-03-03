"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { seasonProgressData } from "@/data/playerData";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const trend = score >= 75 ? "Strong" : score >= 70 ? "Good" : "Developing";
    return (
      <div
        style={{
          background: "#1E1E24",
          border: "1px solid rgba(74,74,255,0.3)",
          borderRadius: 10,
          padding: "8px 12px",
        }}
      >
        <p style={{ fontSize: 12, color: "#9DA2B3", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: "#F5F6FC", margin: "2px 0 0" }}>
          {score}
        </p>
        <p style={{ fontSize: 11, color: "#27AE60", margin: 0 }}>{trend}</p>
      </div>
    );
  }
  return null;
};

export default function LineChartClient() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={seasonProgressData}
        margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
      >
        {/* Inline SVG defs for gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F39C12" />
            <stop offset="100%" stopColor="#27AE60" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F39C12" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#27AE60" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <ReferenceLine y={60} stroke="#F5F6FC" strokeWidth={1} />
        <ReferenceLine y={70} stroke="#F5F6FC" strokeWidth={1} />
        <ReferenceLine y={80} stroke="#F5F6FC" strokeWidth={1} />
        <XAxis
          dataKey="match"
          tick={{ fontSize: 10, fill: "#9DA2B3", fontFamily: "Inter, sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[55, 90]}
          tick={{ fontSize: 10, fill: "#9DA2B3", fontFamily: "Inter, sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="url(#lineGradient)"
          strokeWidth={3}
          fill="url(#areaGradient)"
          dot={{ fill: "#27AE60", r: 4, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ fill: "#4A4AFF", r: 5, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
