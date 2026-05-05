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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <PolyRadar series={series} size={size} />
      <div
        style={{
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}
      >
        {rows.map(r => (
          <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 14,
                height: 2,
                background: r.color,
                display: 'inline-block',
              }}
            />
            {r.label.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  )
}
