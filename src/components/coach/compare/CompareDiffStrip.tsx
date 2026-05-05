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
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: '20px 22px',
        display: 'grid',
        gap: 14,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          letterSpacing: '0.22em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          borderTop: '2px solid var(--brand-indigo)',
          paddingTop: 8,
        }}
      >
        BY CATEGORY
      </div>

      {RADAR_CATEGORIES.map(cat => {
        const ranked = rows
          .map(r => ({ id: r.id, color: r.color, label: r.label, score: scores[r.id][cat] }))
          .sort((a, b) => b.score - a.score)
        const top = ranked[0]?.score ?? 0

        return (
          <div key={cat} style={{ display: 'grid', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.01em',
                }}
              >
                {cat}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                LEAD · {top}
              </span>
            </div>
            {rows.map(r => {
              const s = scores[r.id][cat]
              const isLead = ranked[0]?.id === r.id && rows.length > 1
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 36px',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'var(--font-body)',
                      fontSize: 12.5,
                      color: 'var(--brand-indigo)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: r.color,
                        flexShrink: 0,
                      }}
                    />
                    {r.label}
                  </span>
                  <div
                    style={{
                      height: 10,
                      background: 'var(--brand-line-soft)',
                      borderRadius: 999,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: `${Math.max(0, Math.min(100, s))}%`,
                        background: r.color,
                        borderRadius: 999,
                        opacity: isLead ? 1 : 0.7,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--brand-indigo)',
                      textAlign: 'right',
                    }}
                  >
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
