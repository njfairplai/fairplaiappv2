'use client'

import type { MatchAnalysis } from '@/lib/types'
import {
  PolyRadar,
  RADAR_CATEGORIES,
  type RadarCategory,
  type RadarSeries,
} from '@/components/coach/player-profile/PolyRadar'

export interface ComparePlayerRow {
  id: string
  label: string
  color: string
  records: MatchAnalysis[]
}

/** Average a list of analyses into the 6-axis 0-100 shape the radar wants. */
export function averageScores(records: MatchAnalysis[]): Record<RadarCategory, number> {
  const acc: Record<RadarCategory, number> = {
    Physical: 0,
    Positional: 0,
    Passing: 0,
    Dribbling: 0,
    Control: 0,
    Defending: 0,
  }
  if (records.length === 0) return acc
  for (const r of records) {
    acc.Physical += r.physicalScore
    acc.Positional += r.positionalScore
    acc.Passing += r.passingScore
    acc.Dribbling += r.dribblingScore
    acc.Control += r.controlScore
    acc.Defending += r.defendingScore
  }
  for (const c of RADAR_CATEGORIES) {
    acc[c] = Math.round(acc[c] / records.length)
  }
  return acc
}

interface CompareRadarProps {
  rows: ComparePlayerRow[]
  size: number
}

/**
 * Multi-player overlay radar. One polygon per player, colour-coded.
 * Built on the shared `PolyRadar` primitive so the visual treatment matches
 * the player profile.
 */
export function CompareRadar({ rows, size }: CompareRadarProps) {
  const series: RadarSeries[] = rows.map(r => ({
    values: averageScores(r.records),
    color: r.color,
    fillOpacity: 0.16,
    strokeWidth: 2,
    dotStroke: 'var(--brand-sand)',
  }))
  return (
    <div className="flex flex-col items-center gap-3.5">
      <PolyRadar series={series} size={size} />
      <div className="flex flex-wrap justify-center gap-[18px] font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
        {rows.map(r => (
          <span key={r.id} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-3.5"
              style={{ background: r.color }}
            />
            {r.label.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  )
}
