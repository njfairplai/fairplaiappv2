'use client'

import { useEffect, useMemo, useState } from 'react'
import { terms, playerSessionAttendance } from '@/lib/mockData'
import type { PlayerSessionAttendanceEntry } from '@/lib/types'
import { SHADOWS, COLORS } from '@/lib/constants'

interface AttendanceCardProps {
  playerId: string
}

const TODAY = new Date('2026-04-21') // matches the session's currentDate

function attendanceColor(pct: number): string {
  if (pct >= 90) return COLORS.success
  if (pct >= 70) return COLORS.warning
  return COLORS.error
}

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7) // YYYY-MM
}

function monthLabel(key: string): string {
  const d = new Date(key + '-01T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function ScoreArc({ pct, size = 90, color }: { pct: number; size?: number; color: string }) {
  const stroke = 7
  const r = (size - stroke * 2) / 2 - 2
  const C = 2 * Math.PI * r
  const offset = C * (1 - pct / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} strokeLinecap="round" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${size / 2}px ${size / 2}px`,
          strokeDasharray: C,
          strokeDashoffset: offset,
          transition: 'stroke-dashoffset 0.4s ease',
        }}
      />
    </svg>
  )
}

function StatusDot({ attended, isMatch, selected }: { attended: boolean; isMatch: boolean; selected: boolean }) {
  // 18px outer canvas; 14px visible dot.
  const SIZE = 18
  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = 7
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
      {/* Selected halo */}
      {selected && (
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={COLORS.navy} strokeOpacity={0.55} strokeWidth={1.5} />
      )}
      {attended ? (
        <circle cx={cx} cy={cy} r={r} fill={COLORS.success} />
      ) : (
        <>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={COLORS.error} strokeWidth={1.5} />
          {/* Diagonal slash for shape-distinct missed state (colorblind safe) */}
          <line x1={cx - 3} y1={cy - 3} x2={cx + 3} y2={cy + 3} stroke={COLORS.error} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={cx + 3} y1={cy - 3} x2={cx - 3} y2={cy + 3} stroke={COLORS.error} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
      {/* Match indicator: extra outer ring */}
      {isMatch && (
        <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke={COLORS.navy} strokeOpacity={0.85} strokeWidth={1} />
      )}
    </svg>
  )
}

export default function AttendanceCard({ playerId }: AttendanceCardProps) {
  const log = useMemo(() => playerSessionAttendance[playerId] ?? [], [playerId])

  const currentTermFromDate = useMemo(() => {
    const today = TODAY.toISOString().slice(0, 10)
    return terms.find(t => today >= t.startDate && today <= t.endDate)?.id ?? terms[terms.length - 1].id
  }, [])

  const [selectedTermId, setSelectedTermId] = useState<string>(currentTermFromDate)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const termSessions = useMemo(() => log.filter(s => s.termId === selectedTermId), [log, selectedTermId])
  const sortedAsc = useMemo(() => [...termSessions].sort((a, b) => a.date.localeCompare(b.date)), [termSessions])

  const total = termSessions.length
  const present = termSessions.filter(s => s.status === 'present').length
  const missed = total - present
  const pct = total === 0 ? 0 : Math.round((present / total) * 100)

  const sortedDesc = useMemo(() => [...termSessions].sort((a, b) => b.date.localeCompare(a.date)), [termSessions])
  const streak = useMemo(() => {
    let n = 0
    for (const s of sortedDesc) {
      if (s.status === 'present') n++
      else break
    }
    return n
  }, [sortedDesc])

  // Default the highlighted session to the most recent one whenever the term changes.
  useEffect(() => {
    setSelectedSessionId(sortedDesc[0]?.sessionId ?? null)
  }, [selectedTermId, sortedDesc])

  // Group by month preserving chronological order.
  const monthGroups = useMemo(() => {
    const groups: { key: string; label: string; sessions: PlayerSessionAttendanceEntry[] }[] = []
    const map = new Map<string, PlayerSessionAttendanceEntry[]>()
    for (const s of sortedAsc) {
      const k = monthKey(s.date)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(s)
    }
    for (const [k, sessions] of map) {
      groups.push({ key: k, label: monthLabel(k), sessions })
    }
    return groups
  }, [sortedAsc])

  const selectedSession = useMemo(
    () => termSessions.find(s => s.sessionId === selectedSessionId) ?? null,
    [termSessions, selectedSessionId],
  )

  const arcColor = attendanceColor(pct)
  const hasData = total > 0

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: SHADOWS.card }}>
      {/* Term toggle */}
      <div style={{
        display: 'inline-flex',
        background: '#F1F5F9',
        borderRadius: 10,
        padding: 3,
        marginBottom: 16,
      }}>
        {terms.map(t => {
          const active = t.id === selectedTermId
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTermId(t.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: active ? '#fff' : 'transparent',
                color: active ? COLORS.navy : '#9DA2B3',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.name}
            </button>
          )
        })}
      </div>

      {hasData ? (
        <>
          {/* Headline row: arc + breakdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <ScoreArc pct={pct} color={arcColor} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: arcColor, lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#9DA2B3', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>attended</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, marginBottom: 2 }}>
                {present} of {total} sessions attended
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>
                {missed > 0 ? `${missed} missed` : 'No sessions missed'}
              </div>
              {streak >= 2 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 700, color: COLORS.success,
                  background: `${COLORS.success}18`, padding: '3px 8px', borderRadius: 8,
                }}>
                  🔥 {streak} in a row
                </div>
              )}
            </div>
          </div>

          {/* Month rows */}
          <div style={{
            paddingTop: 12,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            {monthGroups.map(group => (
              <div key={group.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9DA2B3',
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  flexShrink: 0,
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                  {group.sessions.map(s => {
                    const isSelected = s.sessionId === selectedSessionId
                    const attended = s.status === 'present'
                    const isMatch = s.sessionType === 'match'
                    return (
                      <button
                        key={s.sessionId}
                        onClick={() => setSelectedSessionId(s.sessionId)}
                        aria-label={`${formatLongDate(s.date)} · ${s.sessionType} · ${attended ? 'attended' : 'missed'}`}
                        aria-pressed={isSelected}
                        style={{
                          width: 30,
                          height: 30,
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderRadius: 8,
                        }}
                      >
                        <StatusDot attended={attended} isMatch={isMatch} selected={isSelected} />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Inline detail caption */}
          {selectedSession && (
            <div style={{
              marginTop: 10,
              padding: '8px 12px',
              background: '#F8FAFC',
              borderRadius: 8,
              fontSize: 12,
              color: COLORS.navy,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}>
              <span>{formatLongDate(selectedSession.date)}</span>
              <span style={{ color: '#9DA2B3' }}>·</span>
              <span style={{ textTransform: 'capitalize' }}>{selectedSession.sessionType}</span>
              <span style={{ color: '#9DA2B3' }}>·</span>
              <span style={{
                color: selectedSession.status === 'present' ? COLORS.success : COLORS.error,
                fontWeight: 700,
              }}>
                {selectedSession.status === 'present' ? 'Attended' : 'Missed'}
              </span>
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px 16px',
            fontSize: 11, color: '#9DA2B3', marginTop: 10,
            alignItems: 'center',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <StatusDot attended={true} isMatch={false} selected={false} /> Attended
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <StatusDot attended={false} isMatch={false} selected={false} /> Missed
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <StatusDot attended={true} isMatch={true} selected={false} /> Match
            </span>
            <span style={{ color: '#CBD5E1' }}>· Tap any session for details</span>
          </div>
        </>
      ) : (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0 }}>No sessions tracked for this term yet.</p>
        </div>
      )}
    </div>
  )
}
