'use client'

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { RadarDataItem } from '@/lib/types'
import { radarData as defaultRadarData } from '@/lib/mockData'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RadarDataItem }> }) {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div style={{ background: '#1E1E24', border: '1px solid rgba(74,74,255,0.3)', borderRadius: 10, padding: '8px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F5F6FC', margin: 0 }}>{d.category}</p>
        <p style={{ fontSize: 12, color: '#757FFF', margin: '2px 0 0' }}>
          This match: <strong style={{ color: '#F5F6FC' }}>{d.score}</strong>
        </p>
        <p style={{ fontSize: 12, color: '#6E7180', margin: '2px 0 0' }}>Season avg: {d.avg}</p>
      </div>
    )
  }
  return null
}

interface RadarChartProps {
  data?: RadarDataItem[]
  height?: number
  selectedCategory?: string
  onCategoryClick?: (category: string) => void
}

export default function RadarChartComponent({ data, height = 240, selectedCategory, onCategoryClick }: RadarChartProps) {
  const chartData = data ?? defaultRadarData
  const isInteractive = !!onCategoryClick

  const renderTick = (props: Record<string, unknown>) => {
    const { x, y, payload, textAnchor } = props as { x: number; y: number; payload: { value: string }; textAnchor: string }
    const text = payload.value
    const isSelected = text === selectedCategory

    if (isSelected && isInteractive) {
      const charWidth = 6.5
      const pillPadding = 20
      const pillWidth = text.length * charWidth + pillPadding
      const pillHeight = 22

      return (
        <g
          cursor="pointer"
          onClick={(e) => { e.stopPropagation(); onCategoryClick?.(text) }}
        >
          <rect
            x={x - pillWidth / 2}
            y={y - pillHeight / 2 - 1}
            width={pillWidth}
            height={pillHeight}
            rx={11}
            fill="#4A4AFF"
            style={{ filter: 'drop-shadow(0 0 8px rgba(74,74,255,0.5))' }}
          />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
          >
            {text}
          </text>
        </g>
      )
    }

    return (
      <g
        cursor={isInteractive ? 'pointer' : 'default'}
        onClick={(e) => { e.stopPropagation(); onCategoryClick?.(text) }}
      >
        <text
          x={x}
          y={y + 4}
          textAnchor={(textAnchor as 'start' | 'middle' | 'end') || 'middle'}
          fill="#6E7180"
          fontSize={11}
          fontWeight={600}
          fontFamily="Inter, sans-serif"
        >
          {text}
        </text>
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
        <PolarGrid gridType="polygon" stroke="rgba(74,74,255,0.1)" strokeWidth={1} />
        <PolarAngleAxis dataKey="category" tick={isInteractive ? renderTick : { fill: '#6E7180', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' }} />
        <Radar name="Season Avg" dataKey="avg" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
        <Radar name="This Match" dataKey="score" stroke="#4A4AFF" fill="#4A4AFF" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#4A4AFF', r: 3, strokeWidth: 0 }} />
        <Tooltip content={<CustomTooltip />} />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}
