"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { radarData as defaultRadarData } from "@/data/playerData";

type RadarDataItem = { category: string; score: number; avg: number };

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RadarDataItem }>;
}) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        className="rounded-xl px-3 py-2"
        style={{ background: "#1E1E24", border: "1px solid rgba(74,74,255,0.3)" }}
      >
        <p className="font-bold text-sm" style={{ color: "#F5F6FC" }}>
          {d.category}
        </p>
        <p style={{ fontSize: 12, color: "#757FFF" }}>
          This match: <strong style={{ color: "#F5F6FC" }}>{d.score}</strong>
        </p>
        <p style={{ fontSize: 12, color: "#6E7180" }}>Season avg: {d.avg}</p>
      </div>
    );
  }
  return null;
};

export default function RadarChartClient({ data }: { data?: RadarDataItem[] }) {
  const chartData = data ?? defaultRadarData;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart
        data={chartData}
        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
      >
        <PolarGrid
          gridType="polygon"
          stroke="rgba(74,74,255,0.1)"
          strokeWidth={1}
        />
        <PolarAngleAxis
          dataKey="category"
          tick={{
            fill: "#6E7180",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
          }}
        />
        <Radar
          name="Season Avg"
          dataKey="avg"
          stroke="#d1d5db"
          fill="#d1d5db"
          fillOpacity={0.15}
          strokeWidth={1.5}
          dot={false}
        />
        <Radar
          name="This Match"
          dataKey="score"
          stroke="#4A4AFF"
          fill="#4A4AFF"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: "#4A4AFF", r: 3, strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
