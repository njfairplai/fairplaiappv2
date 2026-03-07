'use client'

import { useState, useMemo } from 'react'
import { COLORS, SHADOWS } from '@/lib/constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Session, TournamentFixture } from '@/lib/types'
import { rosters } from '@/lib/mockData'
import Badge from '@/components/ui/Badge'

type CalendarMode = 'list' | 'week' | 'month'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface CalendarViewProps {
  sessions: Session[]
  tournamentFixtures: TournamentFixture[]
}

function getSessionColor(s: Session): string {
  if (s.tournamentFixtureId) return COLORS.warning
  if (s.type === 'match') return COLORS.periwinkle
  return COLORS.primary
}

function getSessionTypeLabel(s: Session): string {
  if (s.tournamentFixtureId) return 'Tournament'
  if (s.type === 'match') return 'Match'
  if (s.type === 'training_match') return 'Training Match'
  return 'Training'
}

function getSessionEmoji(s: Session): string {
  if (s.tournamentFixtureId) return '🏆'
  if (s.type === 'match') return '⚽'
  return '🏃'
}

export default function CalendarView({ sessions, tournamentFixtures }: CalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {}
    sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return map
  }, [sessions])

  // Upcoming sessions for list view
  const upcomingSessions = useMemo(() => {
    return [...sessions]
      .filter(s => s.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 8)
  }, [sessions])

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 16,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : COLORS.muted,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.border}`,
    transition: 'all 0.15s ease',
  })

  // ─── MONTH VIEW HELPERS ─────────────────────────
  function getMonthDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    // Get Monday-based start offset (0=Mon, 6=Sun)
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6

    const days: { date: Date; inMonth: boolean }[] = []
    // Fill previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, inMonth: false })
    }
    // Fill current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), inMonth: true })
    }
    // Fill next month to complete grid
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, days.length - startOffset - lastDay.getDate() + 1)
      days.push({ date: d, inMonth: false })
    }
    return days
  }

  function dateToStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function navigateMonth(delta: number) {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    setSelectedDay(null)
  }

  // ─── WEEK VIEW HELPERS ──────────────────────────
  function getWeekDays(baseDate: Date) {
    const d = new Date(baseDate)
    const dayOfWeek = d.getDay()
    // Get Monday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    d.setDate(d.getDate() + diff)
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return days
  }

  function navigateWeek(delta: number) {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  const weekDays = getWeekDays(currentDate)
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())

  function renderSessionCard(s: Session, compact?: boolean) {
    const roster = rosters.find(r => r.id === s.rosterId)
    const fixture = s.tournamentFixtureId ? tournamentFixtures.find(f => f.id === s.tournamentFixtureId) : null
    const color = getSessionColor(s)

    if (compact) {
      return (
        <div key={s.id} style={{
          padding: '6px 8px', borderRadius: 6,
          background: `${color}14`, borderLeft: `3px solid ${color}`,
          marginBottom: 4, fontSize: 11,
        }}>
          <div style={{ fontWeight: 700, color: COLORS.navy }}>
            {s.startTime} {getSessionEmoji(s)}
          </div>
          <div style={{ color: COLORS.muted, marginTop: 1 }}>
            {roster?.name?.split(' ').pop()}
            {s.opponent ? ` vs ${s.opponent}` : ''}
          </div>
        </div>
      )
    }

    return (
      <div key={s.id} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0', borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: `${color}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontSize: 18,
        }}>
          {getSessionEmoji(s)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>
              {s.opponent ? `vs ${s.opponent}` : 'Training'}
            </span>
            <Badge variant={s.tournamentFixtureId ? 'warning' : s.type === 'match' ? 'info' : 'success'}>
              {getSessionTypeLabel(s)}
            </Badge>
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            {roster?.name} &middot; {s.startTime}&ndash;{s.endTime}
          </span>
          {fixture && (
            <div style={{ fontSize: 11, color: COLORS.warning, fontWeight: 600, marginTop: 2 }}>
              {fixture.round} &middot; {fixture.venue}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card }}>
      {/* Header with mode toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Sessions</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['list', 'week', 'month'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setSelectedDay(null) }} style={pill(mode === m)}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LIST VIEW ─── */}
      {mode === 'list' && (
        <div>
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(s => renderSessionCard(s))
          ) : (
            <p style={{ fontSize: 14, color: COLORS.muted, textAlign: 'center', padding: 20 }}>No upcoming sessions</p>
          )}
        </div>
      )}

      {/* ─── MONTH VIEW ─── */}
      {mode === 'month' && (
        <div>
          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <button onClick={() => navigateMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ChevronLeft size={18} color={COLORS.muted} />
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, minWidth: 160, textAlign: 'center' }}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={() => navigateMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ChevronRight size={18} color={COLORS.muted} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
            {DAY_HEADERS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: COLORS.muted, padding: '4px 0', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {monthDays.map(({ date, inMonth }, idx) => {
              const str = dateToStr(date)
              const daySessions = sessionsByDate[str] || []
              const isToday = str === todayStr
              const isSelected = str === selectedDay

              // Get unique dots (by session type)
              const dots: string[] = []
              daySessions.forEach(s => {
                const c = getSessionColor(s)
                if (!dots.includes(c)) dots.push(c)
              })

              return (
                <button
                  key={idx}
                  onClick={() => daySessions.length > 0 ? setSelectedDay(isSelected ? null : str) : null}
                  style={{
                    background: isSelected ? `${COLORS.primary}0D` : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 4px',
                    cursor: daySessions.length > 0 ? 'pointer' : 'default',
                    textAlign: 'center',
                    position: 'relative',
                    minHeight: 44,
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: isToday ? 800 : 400,
                    color: !inMonth ? '#D1D5DB' : isToday ? COLORS.primary : COLORS.navy,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28, height: 28,
                    borderRadius: '50%',
                    border: isToday ? `2px solid ${COLORS.primary}` : 'none',
                  }}>
                    {date.getDate()}
                  </span>
                  {/* Dots */}
                  {dots.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 2 }}>
                      {dots.map((c, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day detail */}
          {selectedDay && sessionsByDate[selectedDay] && (
            <div style={{ marginTop: 16, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
                {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {sessionsByDate[selectedDay].map(s => renderSessionCard(s))}
            </div>
          )}
        </div>
      )}

      {/* ─── WEEK VIEW ─── */}
      {mode === 'week' && (
        <div>
          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <button onClick={() => navigateWeek(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ChevronLeft size={18} color={COLORS.muted} />
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, minWidth: 200, textAlign: 'center' }}>
              {MONTH_SHORT[weekDays[0].getMonth()]} {weekDays[0].getDate()} &ndash; {MONTH_SHORT[weekDays[6].getMonth()]} {weekDays[6].getDate()}, {weekDays[6].getFullYear()}
            </span>
            <button onClick={() => navigateWeek(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ChevronRight size={18} color={COLORS.muted} />
            </button>
          </div>

          {/* Week grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {weekDays.map((day, idx) => {
              const str = dateToStr(day)
              const daySessions = sessionsByDate[str] || []
              const isToday = str === todayStr

              return (
                <div key={idx} style={{
                  borderRadius: 8,
                  background: isToday ? `${COLORS.primary}08` : '#F9FAFB',
                  border: isToday ? `1.5px solid ${COLORS.primary}30` : '1px solid transparent',
                  padding: 8,
                  minHeight: 120,
                }}>
                  <div style={{
                    textAlign: 'center', marginBottom: 6,
                    fontSize: 11, fontWeight: 700,
                    color: isToday ? COLORS.primary : COLORS.muted,
                    textTransform: 'uppercase',
                  }}>
                    {DAY_HEADERS[idx]}
                  </div>
                  <div style={{
                    textAlign: 'center', marginBottom: 8,
                    fontSize: 16, fontWeight: isToday ? 800 : 600,
                    color: isToday ? COLORS.primary : COLORS.navy,
                  }}>
                    {day.getDate()}
                  </div>
                  {daySessions.map(s => renderSessionCard(s, true))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
