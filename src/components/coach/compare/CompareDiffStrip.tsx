'use client'

import { RADAR_CATEGORIES, type RadarCategory } from '@/components/coach/player-profile/PolyRadar'
import type { ComparePlayerRow } from './CompareRadar'
import { averageScores } from './CompareRadar'

interface CompareDiffStripProps {
  rows: ComparePlayerRow[]
}

/**
 * Per-axis bar grid. For each of the 6 categories, draws each player's score
 * as a horizontal bar (longest = strongest on that axis). The leader gets a
 * "LEAD" pill so the eye lands on dominance immediately.
 */
export function CompareDiffStrip({ rows }: CompareDiffStripProps) {
  const scores: Record<string, Record<RadarCategory, number>> = {}
  for (const r of rows) scores[r.id] = averageScores(r.records)

  return (
    <div className="grid gap-3.5 rounded-xl border border-brand-line bg-brand-paper px-[22px] py-5">
      <div className="border-t-2 border-brand-indigo pt-2 font-fragment text-[10.5px] font-bold tracking-[0.22em] text-brand-indigo-mute">
        BY CATEGORY
      </div>

      {RADAR_CATEGORIES.map(cat => {
        const ranked = rows
          .map(r => ({ id: r.id, color: r.color, label: r.label, score: scores[r.id][cat] }))
          .sort((a, b) => b.score - a.score)
        const top = ranked[0]?.score ?? 0

        return (
          <div key={cat} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-clash text-base tracking-[-0.01em] text-brand-indigo">
                {cat}
              </span>
              <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                LEAD · {top}
              </span>
            </div>
            {rows.map(r => {
              const s = scores[r.id][cat]
              const isLead = ranked[0]?.id === r.id && rows.length > 1
              return (
                <div
                  key={r.id}
                  className="grid items-center gap-2.5"
                  style={{ gridTemplateColumns: '120px 1fr 36px' }}
                >
                  <span className="inline-flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-[12.5px] font-semibold text-brand-indigo">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: r.color }}
                    />
                    {r.label}
                  </span>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-brand-line-soft">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, s))}%`,
                        background: r.color,
                        opacity: isLead ? 1 : 0.7,
                      }}
                    />
                  </div>
                  <span className="text-right font-fragment text-xs font-bold text-brand-indigo">
                    {s}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
