'use client'

import type { CSSProperties } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { SESSIONS_BY_DAY } from '@/lib/match-center'
import { MEyebrow } from './atoms'
import { SessionFrame } from './SessionFrame'

/* The Calendar primitive is built once and rendered in two views:
 *
 *   view="month" — 5×7 grid showing the active month at-a-glance
 *   view="week"  — horizontal filmstrip with 7 framed days
 *
 * Tapping a session in either view sets the selectedDay; the contextual
 * pane below the calendar keys off that day. The header is shared (month
 * label, prev/next, view toggle, + RECORD SESSION primary CTA). */

interface CalendarProps {
  view: 'month' | 'week'
  selectedDay: number | null
  onSelect: (day: number) => void
  onViewChange: (view: 'month' | 'week') => void
  onRecord?: () => void
}

const btnIconStyle: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 4,
  border: `1px solid ${BRAND.line}`,
  background: BRAND.paper,
  color: BRAND.indigo,
  cursor: 'pointer',
  fontFamily: TYPE.mono,
  fontSize: 12,
}

export function Calendar({
  view,
  selectedDay,
  onSelect,
  onViewChange,
  onRecord,
}: CalendarProps) {
  return (
    <div>
      {/* Header — month label, prev/next, view toggle, record CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <button type="button" style={btnIconStyle} aria-label="Previous month">
          ◀
        </button>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 28,
            letterSpacing: '-0.01em',
            color: BRAND.indigo,
          }}
        >
          FEBRUARY <span style={{ color: BRAND.indigoMute }}>2026</span>
        </div>
        <button type="button" style={btnIconStyle} aria-label="Next month">
          ▶
        </button>

        <span style={{ flex: 1 }} />

        {/* View toggle */}
        <div
          style={{
            display: 'inline-flex',
            background: BRAND.paper,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 4,
            padding: 3,
            gap: 0,
          }}
        >
          {(['month', 'week'] as const).map(v => {
            const active = v === view
            return (
              <button
                key={v}
                type="button"
                onClick={() => onViewChange(v)}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? BRAND.indigo : 'transparent',
                  color: active ? BRAND.sand : BRAND.indigo,
                  fontFamily: TYPE.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  borderRadius: 2,
                  textTransform: 'uppercase',
                }}
              >
                {v}
              </button>
            )
          })}
        </div>

        {/* Record session CTA */}
        <button
          type="button"
          onClick={onRecord}
          style={{
            padding: '8px 14px',
            background: BRAND.indigo,
            color: BRAND.sand,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: TYPE.mono,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.16em',
          }}
        >
          + RECORD SESSION
        </button>
      </div>

      {view === 'month' ? (
        <MonthGrid selectedDay={selectedDay} onSelect={onSelect} />
      ) : (
        <WeekFilmstrip selectedDay={selectedDay} onSelect={onSelect} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Month grid — 5×7. Feb 2026 has 28 days, Feb 1 is a Sunday so the
// first row starts at column 0 with `01`. 7 trailing cells render as
// the start of March (greyed).
// ─────────────────────────────────────────────────────────────────────
const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function MonthGrid({
  selectedDay,
  onSelect,
}: {
  selectedDay: number | null
  onSelect: (day: number) => void
}) {
  const cells: { day: number; trailing?: boolean }[] = []
  for (let i = 0; i < 35; i++) {
    const d = i + 1
    if (d <= 28) cells.push({ day: d })
    else cells.push({ day: d - 28, trailing: true })
  }

  return (
    <div
      style={{
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {/* Day-of-week header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: `1px solid ${BRAND.line}`,
        }}
      >
        {DAY_LABELS.map(d => (
          <div
            key={d}
            style={{
              padding: '8px 10px',
              fontFamily: TYPE.mono,
              fontSize: 9.5,
              letterSpacing: '0.22em',
              color: BRAND.indigoMute,
              fontWeight: 700,
              textAlign: 'left',
              borderRight: `1px solid ${BRAND.line}`,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 5 rows × 7 cols */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: '102px',
        }}
      >
        {cells.map((c, i) => {
          const session = c.trailing ? null : SESSIONS_BY_DAY[c.day]
          const isSelected = !c.trailing && c.day === selectedDay
          return (
            <div
              key={i}
              style={{
                borderRight: `1px solid ${BRAND.line}`,
                borderBottom: i < 28 ? `1px solid ${BRAND.line}` : 'none',
                padding: '6px 6px',
                background: c.trailing
                  ? BRAND.sand
                  : isSelected
                  ? BRAND.yellowSoft
                  : 'transparent',
                opacity: c.trailing ? 0.4 : 1,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: c.trailing ? BRAND.indigoMute : BRAND.indigo,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{String(c.day).padStart(2, '0')}</span>
                {session?.status === 'ready' && session.score != null && (
                  <span
                    style={{
                      background: BRAND.indigo,
                      color: BRAND.sand,
                      fontSize: 8.5,
                      padding: '1px 4px',
                      borderRadius: 2,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {session.score}
                  </span>
                )}
              </div>
              {session && (
                <SessionFrame
                  s={session}
                  shape="cell"
                  selected={isSelected}
                  onClick={() => onSelect(session.day)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Week filmstrip — horizontal row of 7 frames spanning Feb 22-28.
// (Real wiring will derive the active week from selectedDay; for now
// we anchor on the populated Feb 24 reference week.)
// ─────────────────────────────────────────────────────────────────────
const WEEK_DAYS = [22, 23, 24, 25, 26, 27, 28]
const WEEK_DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const LEGEND: [string, string][] = [
  ['Ready', BRAND.indigo],
  ['Processing', BRAND.indigoMute],
  ['Drills', BRAND.sandDeeper],
  ['Prep', BRAND.coral],
]

function WeekFilmstrip({
  selectedDay,
  onSelect,
}: {
  selectedDay: number | null
  onSelect: (day: number) => void
}) {
  return (
    <div
      style={{
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 6,
        padding: '18px 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <MEyebrow>WEEK 9 · FEB 22 — FEB 28</MEyebrow>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {LEGEND.map(([l, c]) => (
            <span
              key={l}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: TYPE.mono,
                fontSize: 9,
                letterSpacing: '0.18em',
                color: BRAND.indigoMute,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: c,
                }}
              />
              {l.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'stretch',
          overflowX: 'auto',
        }}
      >
        {WEEK_DAYS.map((d, i) => {
          const session = SESSIONS_BY_DAY[d]
          if (!session) {
            return (
              <div
                key={d}
                style={{
                  width: 156,
                  minWidth: 156,
                  height: 188,
                  border: `1px dashed ${BRAND.line}`,
                  borderRadius: 6,
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 9,
                    letterSpacing: '0.22em',
                    color: BRAND.indigoMute,
                    fontWeight: 700,
                  }}
                >
                  {WEEK_DAY_NAMES[i]}
                </div>
                <div
                  style={{
                    fontFamily: TYPE.display,
                    fontSize: 28,
                    color: BRAND.indigoMute,
                    marginTop: 4,
                  }}
                >
                  {d}
                </div>
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 8.5,
                    letterSpacing: '0.18em',
                    color: BRAND.indigoMute,
                    marginTop: 6,
                  }}
                >
                  —
                </div>
              </div>
            )
          }
          return (
            <SessionFrame
              key={d}
              s={{ ...session, dateLabel: `FEB ${String(d).padStart(2, '0')}` }}
              shape="frame"
              selected={d === selectedDay}
              onClick={() => onSelect(d)}
            />
          )
        })}
      </div>
    </div>
  )
}
