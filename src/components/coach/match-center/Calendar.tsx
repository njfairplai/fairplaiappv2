'use client'

import type { CSSProperties } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { getSessionsForMonth } from '@/lib/match-center'
import { MEyebrow } from './atoms'
import { SessionFrame } from './SessionFrame'

/* The Calendar primitive is built once and rendered in two views:
 *
 *   view="month" — 5×7 grid showing the active month at-a-glance
 *   view="week"  — horizontal filmstrip with 7 framed days
 *
 * Tapping a session in either view sets the selectedDay; the
 * contextual pane below the calendar keys off that day + month + year.
 * Prev/Next arrows in the header swap month — the surface re-renders
 * with that month's session set without leaving the page.
 */

interface CalendarProps {
  view: 'month' | 'week'
  /** 1-indexed month, 1=Jan. */
  currentMonth: number
  currentYear: number
  selectedDay: number | null
  /** Set of confirmed-prep session IDs. Drives the PREP→PREPPED label
   *  switch on cells where status === 'prep' and the coach has already
   *  hit "Confirm prep →" in State 1. */
  confirmedSessions: Set<string>
  onSelect: (day: number) => void
  onViewChange: (view: 'month' | 'week') => void
  onMonthChange: (year: number, month: number) => void
  onToday?: () => void
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

const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]

/** Clamp month/year navigation to the months we have data for. The
 *  flat SESSIONS array currently spans Feb–Apr 2026; navigating
 *  outside that range would just show empty grids, so we soft-cap. */
const MIN_MONTH = { year: 2026, month: 2 }
const MAX_MONTH = { year: 2026, month: 4 }

function compareMonths(a: { year: number; month: number }, b: { year: number; month: number }) {
  if (a.year !== b.year) return a.year - b.year
  return a.month - b.month
}

export function Calendar({
  view,
  currentMonth,
  currentYear,
  selectedDay,
  confirmedSessions,
  onSelect,
  onViewChange,
  onMonthChange,
  onToday,
  onRecord,
}: CalendarProps) {
  const canGoPrev = compareMonths({ year: currentYear, month: currentMonth }, MIN_MONTH) > 0
  const canGoNext = compareMonths({ year: currentYear, month: currentMonth }, MAX_MONTH) < 0

  function goPrev() {
    if (!canGoPrev) return
    if (currentMonth === 1) onMonthChange(currentYear - 1, 12)
    else onMonthChange(currentYear, currentMonth - 1)
  }
  function goNext() {
    if (!canGoNext) return
    if (currentMonth === 12) onMonthChange(currentYear + 1, 1)
    else onMonthChange(currentYear, currentMonth + 1)
  }

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
        <button
          type="button"
          style={{
            ...btnIconStyle,
            opacity: canGoPrev ? 1 : 0.4,
            cursor: canGoPrev ? 'pointer' : 'default',
          }}
          aria-label="Previous month"
          onClick={goPrev}
          disabled={!canGoPrev}
        >
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
          {MONTH_NAMES[currentMonth - 1]}{' '}
          <span style={{ color: BRAND.indigoMute }}>{currentYear}</span>
        </div>
        <button
          type="button"
          style={{
            ...btnIconStyle,
            opacity: canGoNext ? 1 : 0.4,
            cursor: canGoNext ? 'pointer' : 'default',
          }}
          aria-label="Next month"
          onClick={goNext}
          disabled={!canGoNext}
        >
          ▶
        </button>

        {onToday && (
          <button
            type="button"
            onClick={onToday}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: `1px solid ${BRAND.line}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: BRAND.indigo,
              textTransform: 'uppercase',
            }}
          >
            Today
          </button>
        )}

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
        <MonthGrid
          year={currentYear}
          month={currentMonth}
          selectedDay={selectedDay}
          confirmedSessions={confirmedSessions}
          onSelect={onSelect}
        />
      ) : (
        <WeekFilmstrip
          year={currentYear}
          month={currentMonth}
          selectedDay={selectedDay}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Month grid — adaptive 5–6 row grid for any month / year.
// ─────────────────────────────────────────────────────────────────────
const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function MonthGrid({
  year,
  month,
  selectedDay,
  confirmedSessions,
  onSelect,
}: {
  year: number
  month: number
  selectedDay: number | null
  confirmedSessions: Set<string>
  onSelect: (day: number) => void
}) {
  // Sun=0, Mon=1, ... Sat=6. Calendar starts on Sunday.
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  // Total cells: leading blanks + days + trailing blanks to reach 35 or 42.
  const minCells = firstDow + daysInMonth
  const totalRows = Math.ceil(minCells / 7)
  const totalCells = totalRows * 7
  const trailingDays = totalCells - minCells

  const sessionsByDay = getSessionsForMonth(year, month)

  type Cell = { day: number; trailing?: boolean; leading?: boolean }
  const cells: Cell[] = []
  for (let i = 0; i < firstDow; i++) cells.push({ day: 0, leading: true })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d })
  for (let t = 1; t <= trailingDays; t++) cells.push({ day: t, trailing: true })

  return (
    <div
      style={{
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: '102px',
        }}
      >
        {cells.map((c, i) => {
          const session = c.leading || c.trailing ? null : sessionsByDay[c.day]
          const isSelected = !c.leading && !c.trailing && c.day === selectedDay
          const muted = c.leading || c.trailing
          return (
            <div
              key={i}
              style={{
                borderRight: `1px solid ${BRAND.line}`,
                borderBottom: i < (totalRows - 1) * 7 ? `1px solid ${BRAND.line}` : 'none',
                padding: '6px 6px',
                background: muted ? BRAND.sand : isSelected ? BRAND.yellowSoft : 'transparent',
                opacity: muted ? 0.4 : 1,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: muted ? BRAND.indigoMute : BRAND.indigo,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{muted ? '' : String(c.day).padStart(2, '0')}</span>
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
                  prepConfirmed={confirmedSessions.has(`${session.year}-${session.month}-${session.day}`)}
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
// Week filmstrip — anchored to the week containing `selectedDay` if
// possible, else the first 7 days that have sessions.
// ─────────────────────────────────────────────────────────────────────
function WeekFilmstrip({
  year,
  month,
  selectedDay,
  onSelect,
}: {
  year: number
  month: number
  selectedDay: number | null
  onSelect: (day: number) => void
}) {
  const sessionsByDay = getSessionsForMonth(year, month)
  const daysInMonth = new Date(year, month, 0).getDate()

  // Find the week containing `selectedDay` (Sunday-anchored). Fallback:
  // the first week that has at least one session.
  let weekStart = 1
  if (selectedDay && selectedDay >= 1 && selectedDay <= daysInMonth) {
    const dow = new Date(year, month - 1, selectedDay).getDay()
    weekStart = Math.max(1, selectedDay - dow)
  } else {
    const sessionDays = Object.keys(sessionsByDay).map(Number).sort((a, b) => a - b)
    if (sessionDays.length > 0) {
      const dow = new Date(year, month - 1, sessionDays[0]!).getDay()
      weekStart = Math.max(1, sessionDays[0]! - dow)
    }
  }
  const weekDays: number[] = []
  for (let i = 0; i < 7; i++) {
    const d = weekStart + i
    if (d <= daysInMonth) weekDays.push(d)
  }
  const weekLabel = weekDays.length
    ? `${MONTH_NAMES[month - 1].slice(0, 3)} ${weekDays[0]} — ${MONTH_NAMES[month - 1].slice(0, 3)} ${weekDays[weekDays.length - 1]}`
    : 'EMPTY WEEK'

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
        <MEyebrow>{weekLabel.toUpperCase()}</MEyebrow>
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
        {weekDays.map((d, i) => {
          const session = sessionsByDay[d]
          const dowName = DAY_LABELS[(weekStart + i - 1 + new Date(year, month - 1, weekStart).getDay()) % 7]
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
                  {dowName}
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
              s={{
                ...session,
                dateLabel: `${MONTH_NAMES[month - 1].slice(0, 3)} ${String(d).padStart(2, '0')}`,
              }}
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

const LEGEND: [string, string][] = [
  ['Ready', BRAND.indigo],
  ['Processing', BRAND.indigoMute],
  ['Drills', BRAND.sandDeeper],
  ['Prep', BRAND.coral],
]
