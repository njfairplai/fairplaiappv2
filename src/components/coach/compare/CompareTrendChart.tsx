'use client'

import type { ProgressionFrame } from '@/lib/player-progression'

export interface CompareTrendRow {
  id: string
  label: string
  color: string
  progression: ProgressionFrame[]
}

interface CompareTrendChartProps {
  rows: CompareTrendRow[]
}

/**
 * Tiny multi-series line chart of composite scores across each player's
 * season. X-axis is per-player matchday index (we don't try to align dates
 * across rosters), y-axis is the 0-100 composite. Lines share the same chart
 * so the coach can read trajectory side-by-side.
 */
export function CompareTrendChart({ rows }: CompareTrendChartProps) {
  const w = 720
  const h = 220
  const padL = 36
  const padR = 16
  const padT = 16
  const padB = 28
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const maxLen = Math.max(1, ...rows.map(r => r.progression.length))

  const xFor = (i: number) =>
    padL + (maxLen <= 1 ? innerW / 2 : (i / (maxLen - 1)) * innerW)
  const yFor = (score: number) =>
    padT + innerH - (Math.max(0, Math.min(100, score)) / 100) * innerH

  return (
    <div className="grid gap-3.5 rounded-xl border border-brand-line bg-brand-paper px-[22px] py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="border-t-2 border-brand-indigo pt-2 font-fragment text-[10.5px] font-bold tracking-[0.22em] text-brand-indigo-mute">
          SEASON TRAJECTORY · COMPOSITE
        </div>
        <span className="font-fragment text-[10px] font-semibold tracking-[0.18em] text-brand-indigo-mute">
          MATCHDAY 1 . LATEST
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="max-w-full">
          {/* Y gridlines at 25/50/75 */}
          {[25, 50, 75].map(g => (
            <g key={g}>
              <line
                x1={padL}
                x2={w - padR}
                y1={yFor(g)}
                y2={yFor(g)}
                stroke="var(--brand-line)"
                strokeDasharray="2 4"
              />
              <text
                x={padL - 6}
                y={yFor(g) + 3}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize={9}
                fill="var(--brand-indigo-mute)"
              >
                {g}
              </text>
            </g>
          ))}
          {/* Axis baseline */}
          <line
            x1={padL}
            x2={w - padR}
            y1={yFor(0)}
            y2={yFor(0)}
            stroke="var(--brand-indigo)"
            strokeWidth={1.5}
          />
          {/* Each player's line */}
          {rows.map(r => {
            if (r.progression.length === 0) return null
            const pts = r.progression.map((f, i) => `${xFor(i)},${yFor(f.score)}`).join(' ')
            return (
              <g key={r.id}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {r.progression.map((f, i) => (
                  <circle
                    key={f.md}
                    cx={xFor(i)}
                    cy={yFor(f.score)}
                    r={3}
                    fill={r.color}
                    stroke="var(--brand-sand)"
                    strokeWidth={1}
                  />
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-[18px] font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
        {rows.map(r => (
          <span key={r.id} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-3.5"
              style={{ background: r.color }}
            />
            {r.label.toUpperCase()} · {r.progression.length} MATCHES
          </span>
        ))}
      </div>
    </div>
  )
}
