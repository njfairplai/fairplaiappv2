'use client'

import type { CSSProperties } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/hooks/useIsMobile'
import { getSessionsForMonth } from '@/lib/match-center'
import { MEyebrow } from './atoms'
import { SessionFrame } from './SessionFrame'

/* The Calendar primitive renders one of two views, picked by viewport:
 *
 *   desktop (≥768px) — 5×N month grid showing the active month
 *   mobile  (<768px) — horizontal week filmstrip
 *
 * No user-facing view toggle. Each platform gets the right primitive;
 * the wrong-platform pattern (week on desktop, full-card month on phone)
 * was actively unhelpful in user testing. The status-dot variant we
 * trialled briefly is gone too — week filmstrip won the comparison.
 *
 * Navigation:
 *   desktop — prev/next advance the month
 *   mobile  — prev/next advance the WEEK. Crosses month boundaries
 *             (Feb 22-28 → Mar 1-7) so the coach can scrub the season
 *             without being month-locked.
 */

interface CalendarProps {
  /** 1-indexed month, 1=Jan. */
  currentMonth: number
  currentYear: number
  selectedDay: number | null
  /** Set of confirmed-prep session IDs. Drives the PREP→PREPPED label
   *  switch on cells where status === 'prep' and the coach has already
   *  hit "Confirm prep →" in State 1. */
  confirmedSessions: Set<string>
  /** Receives the full date of the selected cell so the page can also
   *  update currentMonth/Year if the tap crossed a month boundary
   *  (only possible in the mobile WeekFilmstrip). */
  onSelect: (year: number, month: number, day: number) => void
  /** Desktop-mode month change. Clamped to the seeded data range. */
  onMonthChange: (year: number, month: number) => void
  /** Mobile-mode week change. The handler receives the new week's
   *  anchor day + month/year so the page can update selection too. */
  onWeekChange?: (year: number, month: number, anchorDay: number) => void
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
const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Clamp month/year navigation to the months we have data for. The
 *  flat SESSIONS array currently spans Feb–Apr 2026; navigating
 *  outside that range would just show empty grids, so we soft-cap. */
const MIN_MONTH = { year: 2026, month: 2 }
const MAX_MONTH = { year: 2026, month: 4 }

function compareMonths(a: { year: number; month: number }, b: { year: number; month: number }) {
  if (a.year !== b.year) return a.year - b.year
  return a.month - b.month
}

/** Compute the Sunday-anchored start of the week containing a given date. */
function weekStartFor(year: number, month: number, day: number): {
  year: number
  month: number
  day: number
} {
  const dow = new Date(year, month - 1, day).getDay()
  const startMs = new Date(year, month - 1, day - dow).getTime()
  const start = new Date(startMs)
  return { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() }
}

/** Shift a week by ±7 days and return the new Sunday anchor. */
function shiftWeek(
  anchor: { year: number; month: number; day: number },
  deltaDays: number,
): { year: number; month: number; day: number } {
  const t = new Date(anchor.year, anchor.month - 1, anchor.day + deltaDays)
  return { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() }
}

export function Calendar({
  currentMonth,
  currentYear,
  selectedDay,
  confirmedSessions,
  onSelect,
  onMonthChange,
  onWeekChange,
  onToday,
  onRecord,
}: CalendarProps) {
  const isMobile = useIsMobile()
  const canGoPrev = compareMonths({ year: currentYear, month: currentMonth }, MIN_MONTH) > 0
  const canGoNext = compareMonths({ year: currentYear, month: currentMonth }, MAX_MONTH) < 0

  // Mobile prev/next moves the week; desktop moves the month.
  function goPrev() {
    if (isMobile && onWeekChange) {
      const anchor = weekStartFor(currentYear, currentMonth, selectedDay ?? 1)
      const next = shiftWeek(anchor, -7)
      // Clamp: don't allow weeks whose month is outside data range.
      if (compareMonths({ year: next.year, month: next.month }, MIN_MONTH) < 0) return
      onWeekChange(next.year, next.month, next.day)
      return
    }
    if (!canGoPrev) return
    if (currentMonth === 1) onMonthChange(currentYear - 1, 12)
    else onMonthChange(currentYear, currentMonth - 1)
  }
  function goNext() {
    if (isMobile && onWeekChange) {
      const anchor = weekStartFor(currentYear, currentMonth, selectedDay ?? 1)
      const next = shiftWeek(anchor, 7)
      if (compareMonths({ year: next.year, month: next.month }, MAX_MONTH) > 0) return
      onWeekChange(next.year, next.month, next.day)
      return
    }
    if (!canGoNext) return
    if (currentMonth === 12) onMonthChange(currentYear + 1, 1)
    else onMonthChange(currentYear, currentMonth + 1)
  }

  // Header label: desktop shows "FEBRUARY 2026", mobile shows the
  // week range "FEB 22 — FEB 28" (or cross-month "FEB 22 — MAR 7").
  const headerLabel = (() => {
    if (!isMobile) {
      return (
        <>
          {MONTH_NAMES[currentMonth - 1]}{' '}
          <span className="text-brand-indigo-mute">{currentYear}</span>
        </>
      )
    }
    const anchor = weekStartFor(currentYear, currentMonth, selectedDay ?? 1)
    const end = shiftWeek(anchor, 6)
    if (anchor.month === end.month) {
      return (
        <>
          {MONTH_SHORT[anchor.month - 1]} {anchor.day} —{' '}
          {MONTH_SHORT[end.month - 1]} {end.day}
        </>
      )
    }
    return (
      <>
        {MONTH_SHORT[anchor.month - 1]} {anchor.day} —{' '}
        {MONTH_SHORT[end.month - 1]} {end.day}
      </>
    )
  })()

  return (
    <div>
      {/* Header — month/week label, prev/next, today, record CTA. No
       *  view toggle: each platform gets one primitive. */}
      <div
        className={cn(
          'mb-3.5 flex flex-wrap items-center',
          isMobile ? 'gap-2' : 'gap-4',
        )}
      >
        <button
          type="button"
          style={btnIconStyle}
          aria-label={isMobile ? 'Previous week' : 'Previous month'}
          onClick={goPrev}
        >
          ◀
        </button>
        <div
          className={cn(
            'font-clash tracking-[-0.01em] text-brand-indigo',
            isMobile ? 'text-lg' : 'text-[28px]',
          )}
        >
          {headerLabel}
        </div>
        <button
          type="button"
          style={btnIconStyle}
          aria-label={isMobile ? 'Next week' : 'Next month'}
          onClick={goNext}
        >
          ▶
        </button>

        {onToday && (
          <button
            type="button"
            onClick={onToday}
            className="cursor-pointer rounded-[4px] border border-brand-line bg-transparent px-3 py-1.5 font-fragment text-[10px] font-bold uppercase tracking-[0.18em] text-brand-indigo"
          >
            Today
          </button>
        )}

        <span className="flex-1" />

        {/* Record session CTA */}
        <button
          type="button"
          onClick={onRecord}
          className={cn(
            'cursor-pointer rounded-[4px] border-none bg-brand-indigo py-2 font-fragment text-[10.5px] font-bold tracking-[0.16em] text-brand-sand',
            isMobile ? 'px-2.5' : 'px-3.5',
          )}
        >
          {isMobile ? '+ RECORD' : '+ RECORD SESSION'}
        </button>
      </div>

      {isMobile ? (
        <WeekFilmstrip
          year={currentYear}
          month={currentMonth}
          selectedDay={selectedDay}
          onSelect={onSelect}
        />
      ) : (
        <MonthGrid
          year={currentYear}
          month={currentMonth}
          selectedDay={selectedDay}
          confirmedSessions={confirmedSessions}
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
  onSelect: (year: number, month: number, day: number) => void
}) {
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
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
    <div className="overflow-hidden rounded-md border border-brand-line bg-brand-paper">
      <div className="grid grid-cols-7 border-b border-brand-line">
        {DAY_LABELS.map(d => (
          <div
            key={d}
            className="border-r border-brand-line px-2.5 py-2 text-left font-fragment text-[9.5px] font-bold tracking-[0.22em] text-brand-indigo-mute"
          >
            {d}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7"
        style={{ gridAutoRows: '102px' }}
      >
        {cells.map((c, i) => {
          const session = c.leading || c.trailing ? null : sessionsByDay[c.day]
          const isSelected = !c.leading && !c.trailing && c.day === selectedDay
          const muted = c.leading || c.trailing
          return (
            <div
              key={i}
              className={cn(
                'relative border-r border-brand-line p-1.5',
                i < (totalRows - 1) * 7 && 'border-b',
                muted ? 'bg-brand-sand opacity-40' : isSelected ? 'bg-brand-yellow-soft' : 'bg-transparent',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between font-fragment text-[10px] font-bold tracking-[0.04em]',
                  muted ? 'text-brand-indigo-mute' : 'text-brand-indigo',
                )}
              >
                <span>{muted ? '' : String(c.day).padStart(2, '0')}</span>
                {session?.status === 'ready' && session.score != null && (
                  <span className="rounded-[2px] bg-brand-indigo px-1 py-px text-[8.5px] tracking-[0.04em] text-brand-sand">
                    {session.score}
                  </span>
                )}
              </div>
              {session && (
                <SessionFrame
                  s={session}
                  shape="cell"
                  selected={isSelected}
                  prepConfirmed={confirmedSessions.has(`${session.year}-${String(session.month).padStart(2, '0')}-${String(session.day).padStart(2, '0')}`)}
                  onClick={() => onSelect(year, month, session.day)}
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
// Week filmstrip — primary mobile primitive. Anchors on the week
// containing `selectedDay`. Rendered horizontally with snap-scroll.
// Cells span months when the week crosses a boundary.
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
  onSelect: (year: number, month: number, day: number) => void
}) {
  // Anchor on the Sunday of the week containing selectedDay (or month
  // start if no selection yet). The 7 cards may span months — pull each
  // card's session from the month it actually belongs to.
  const anchor = (() => {
    if (selectedDay && selectedDay >= 1) {
      return weekStartFor(year, month, selectedDay)
    }
    return weekStartFor(year, month, 1)
  })()

  const cards: { year: number; month: number; day: number; dowIndex: number }[] = []
  for (let i = 0; i < 7; i++) {
    const t = new Date(anchor.year, anchor.month - 1, anchor.day + i)
    cards.push({
      year: t.getFullYear(),
      month: t.getMonth() + 1,
      day: t.getDate(),
      dowIndex: t.getDay(),
    })
  }

  return (
    <div className="rounded-md border border-brand-line bg-brand-paper p-3.5">
      <MEyebrow style={{ marginBottom: 10 }}>
        WEEK · {MONTH_SHORT[anchor.month - 1]} {anchor.day} —{' '}
        {MONTH_SHORT[cards[6]!.month - 1]} {cards[6]!.day}
      </MEyebrow>
      <div
        className="flex items-stretch gap-2.5 overflow-x-auto pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {cards.map(c => {
          const monthSessions = getSessionsForMonth(c.year, c.month)
          const session = monthSessions[c.day]
          const isSelected =
            session != null &&
            c.year === year &&
            c.month === month &&
            c.day === selectedDay
          if (!session) {
            return (
              <div
                key={`${c.year}-${c.month}-${c.day}`}
                className="flex h-[188px] w-[156px] min-w-[156px] flex-col items-center justify-center rounded-md border border-dashed border-brand-line bg-transparent opacity-70"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="font-fragment text-[9px] font-bold tracking-[0.22em] text-brand-indigo-mute">
                  {DAY_LABELS[c.dowIndex]}
                </div>
                <div className="mt-1 font-clash text-[28px] text-brand-indigo-mute">
                  {c.day}
                </div>
                <div className="mt-1.5 font-fragment text-[8.5px] tracking-[0.18em] text-brand-indigo-mute">
                  —
                </div>
              </div>
            )
          }
          return (
            <div
              key={`${c.year}-${c.month}-${c.day}`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <SessionFrame
                s={{
                  ...session,
                  dateLabel: `${MONTH_SHORT[c.month - 1]} ${String(c.day).padStart(2, '0')}`,
                }}
                shape="frame"
                selected={isSelected}
                onClick={() => onSelect(c.year, c.month, c.day)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
