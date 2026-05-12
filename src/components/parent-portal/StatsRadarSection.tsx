'use client'

import { useState, useMemo } from 'react'
import type { MatchAnalysis } from '@/lib/types'
import {
  PolyRadar,
  RADAR_CATEGORIES,
  type RadarCategory,
} from '@/components/coach/player-profile/PolyRadar'
import { highlights, benchmarkData } from '@/lib/mockData'
import { cn } from '@/lib/cn'

interface StatsRadarSectionProps {
  playerId: string
  /** Which match analyses drive the radar shape. In match scope, pass the
   *  single MatchAnalysis for the active match. In season scope, pass all
   *  the kid's analyses; we average them. */
  records: MatchAnalysis[]
  /** "Match" or "Season" — drives the legend label. */
  scope: 'match' | 'season'
  isMobile?: boolean
}

interface SubStat {
  label: string
  value: string
  /** Whether this is a real DB field (real) or a derived approximation
   *  (ai-derived). Surfaces an 'AI' pill on derived values. */
  source: 'real' | 'ai-derived'
}

/* TODO: design-refinement-target — Pack 3 will refine the visual layout
 * (chip placement, axis label positioning, peer-benchmark phrasing). The
 * functional behaviour is final: tap an axis → 3 sub-stats + a benchmarking
 * line below. Mirrors the coach RadarSection but trimmed for the
 * parent/player audience. */
export function StatsRadarSection({
  playerId,
  records,
  scope,
  isMobile,
}: StatsRadarSectionProps) {
  const avg = useMemo(() => {
    const pick = (f: (r: MatchAnalysis) => number): number => {
      if (records.length === 0) return 0
      return Math.round(records.reduce((s, r) => s + f(r), 0) / records.length)
    }
    return {
      physical: pick(r => r.physicalScore),
      positional: pick(r => r.positionalScore),
      passing: pick(r => r.passingScore),
      dribbling: pick(r => r.dribblingScore),
      control: pick(r => r.controlScore),
      defending: pick(r => r.defendingScore),
      distance: pick(r => Math.round(r.distanceCovered * 10)) / 10,
      topSpeed: pick(r => Math.round(r.topSpeed * 10)) / 10,
      sprintCount: pick(r => r.sprintCount),
      passCompletion: pick(r => r.passCompletion),
      dribbleSuccess: pick(r => r.dribbleSuccess),
    }
  }, [records])

  const seasonValues: Record<RadarCategory, number> = {
    Physical: avg.physical,
    Positional: avg.positional,
    Passing: avg.passing,
    Dribbling: avg.dribbling,
    Control: avg.control,
    Defending: avg.defending,
  }

  // Key passes — only highlight-derived stat we use; lines up with the
  // coach RadarSection's `keyPassCount` field.
  const keyPasses = useMemo(
    () =>
      highlights.filter(
        h => h.playerId === playerId && h.eventType === 'key_pass',
      ).length,
    [playerId],
  )

  // Strongest axis as the default-selected category.
  const strongest = useMemo<RadarCategory>(() => {
    let best: RadarCategory = 'Physical'
    let bestScore = -1
    for (const c of RADAR_CATEGORIES) {
      const s = seasonValues[c]
      if (s > bestScore) {
        bestScore = s
        best = c
      }
    }
    return best
  }, [seasonValues])

  const [selected, setSelected] = useState<RadarCategory>(strongest)

  // Sub-stats per category — must match the coach RadarSection exactly so
  // a coach reading the player profile and a parent/player reading their
  // portal see the same metrics under the same labels.
  const perLabel = scope === 'match' ? '' : ' / 90'
  const subStats: Record<RadarCategory, [SubStat, SubStat, SubStat]> = {
    Physical: [
      { label: `Distance${perLabel}`, value: `${avg.distance.toFixed(1)} km`, source: 'real' },
      { label: 'Top speed', value: `${avg.topSpeed.toFixed(1)} km/h`, source: 'real' },
      { label: `Sprints${perLabel}`, value: `${avg.sprintCount}`, source: 'real' },
    ],
    Positional: [
      { label: 'Position discipline', value: `${avg.positional}`, source: 'ai-derived' },
      { label: `Recoveries${perLabel}`, value: `${Math.round(avg.positional / 8)}`, source: 'ai-derived' },
      { label: 'Heat coverage', value: `${Math.round(avg.positional * 0.9)}%`, source: 'ai-derived' },
    ],
    Passing: [
      { label: 'Pass completion', value: `${avg.passCompletion}%`, source: 'real' },
      { label: 'Key passes', value: `${keyPasses}`, source: 'real' },
      { label: `Long balls${perLabel}`, value: `${Math.round(avg.passing / 18)}`, source: 'ai-derived' },
    ],
    Dribbling: [
      { label: 'Dribble success', value: `${avg.dribbleSuccess}%`, source: 'real' },
      { label: `Take-ons${perLabel}`, value: `${Math.round(avg.dribbling / 12)}`, source: 'ai-derived' },
      { label: 'Press-resistance', value: `${Math.round(avg.dribbling * 0.95)}`, source: 'ai-derived' },
    ],
    Control: [
      { label: `Touches${perLabel}`, value: `${Math.round(avg.control * 1.2)}`, source: 'ai-derived' },
      { label: 'Retention', value: `${Math.min(99, avg.control + 5)}%`, source: 'ai-derived' },
      { label: 'First touches won', value: `${Math.round(avg.control / 9)}`, source: 'ai-derived' },
    ],
    Defending: [
      { label: `Tackles${perLabel}`, value: `${Math.round(avg.defending / 10)}`, source: 'ai-derived' },
      { label: `Interceptions${perLabel}`, value: `${Math.round(avg.positional / 8)}`, source: 'ai-derived' },
      { label: 'Duels won', value: `${Math.min(99, avg.defending + 4)}%`, source: 'ai-derived' },
    ],
  }

  const activeStats = subStats[selected]

  // Benchmarking chip for the selected axis. Maps the radar axis to the
  // existing `benchmarkData` metric, then computes a "top X%" pill.
  const benchmarkLabel = useMemo(
    () => buildBenchmarkLabel(selected),
    [selected],
  )

  return (
    <section
      className={cn(
        'flex flex-col gap-3.5 rounded-xl border border-brand-line bg-brand-paper',
        isMobile ? 'px-3.5 py-4' : 'px-[22px] py-5',
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
          {scope === 'match' ? 'MATCH SHAPE' : 'SEASON SHAPE'}
        </span>
        <span className="font-fragment text-[9.5px] font-semibold tracking-[0.16em] text-brand-indigo-mute">
          TAP A CATEGORY
        </span>
      </div>

      <div className="flex justify-center">
        <PolyRadar
          series={[
            {
              values: seasonValues,
              color: 'var(--brand-indigo)',
              fillOpacity: 0.22,
              strokeWidth: 2,
            },
          ]}
          selected={selected}
          onSelect={setSelected}
          size={isMobile ? 240 : 320}
        />
      </div>

      {/* Sub-stats strip */}
      <div
        key={selected}
        className="grid grid-cols-3 gap-2"
        style={{ animation: 'fp-fade-in 220ms ease' }}
      >
        <style>
          {`@keyframes fp-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}
        </style>
        {activeStats.map(s => (
          <div
            key={s.label}
            className="min-w-0 rounded-lg border border-brand-line bg-brand-sand px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-fragment text-[8.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute">
                {s.label}
              </span>
              {s.source === 'ai-derived' && (
                <span
                  title="AI-derived"
                  className="rounded-full bg-brand-line-soft px-[5px] py-px font-fragment text-[8px] font-semibold tracking-[0.1em] text-brand-indigo-mute"
                >
                  AI
                </span>
              )}
            </div>
            <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-clash text-[22px] tracking-[-0.02em] text-brand-indigo">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Peer benchmark chip — privacy-preserving "top X%" framing. */}
      {benchmarkLabel && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-yellow bg-brand-yellow-soft px-3 py-2.5">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-yellow" />
          <span className="font-satoshi text-[12.5px] font-semibold text-brand-indigo">
            {benchmarkLabel}
          </span>
        </div>
      )}
    </section>
  )
}

/** Map radar axis → benchmark metric → "top X%" copy. Returns null when no
 *  good match exists. */
function buildBenchmarkLabel(axis: RadarCategory): string | null {
  // Map our radar axes to the benchmarkData metrics (closest match).
  const metricByAxis: Record<RadarCategory, string | null> = {
    Physical: 'Sprint Speed',
    Positional: 'Defensive Actions',
    Passing: 'Pass Completion',
    Dribbling: 'Dribble Success',
    Control: 'Distance Covered',
    Defending: 'Defensive Actions',
  }
  const metric = metricByAxis[axis]
  if (!metric) return null
  const positionRow = benchmarkData.position.find(b => b.metric === metric)
  if (!positionRow) return null
  const delta = positionRow.playerValue - positionRow.groupAverage
  if (delta >= 8) return `Top 25% in ${metric.toLowerCase()} for ${positionRow.groupLabel}`
  if (delta >= 0) return `Above average in ${metric.toLowerCase()} for ${positionRow.groupLabel}`
  return `Working towards group average in ${metric.toLowerCase()}`
}
