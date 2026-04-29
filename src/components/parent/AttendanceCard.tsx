'use client'

import { useMemo, useState } from 'react'
import { terms, playerSessionAttendance } from '@/lib/mockData'
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

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export default function AttendanceCard({ playerId }: AttendanceCardProps) {
  const log = useMemo(() => playerSessionAttendance[playerId] ?? [], [playerId])

  // Default to the term that contains today's date, fall back to most recent term that has data
  const currentTermFromDate = useMemo(() => {
    const today = TODAY.toISOString().slice(0, 10)
    return terms.find(t => today >= t.startDate && today <= t.endDate)?.id ?? terms[terms.length - 1].id
  }, [])

  const [selectedTermId, setSelectedTermId] = useState<string>(currentTermFromDate)

  const termSessions = useMemo(() => log.filter(s => s.termId === selectedTermId), [log, selectedTermId])
  const total = termSessions.length
  const present = termSessions.filter(s => s.status === 'present').length
  const missed = total - present
  const pct = total === 0 ? 0 : Math.round((present / total) * 100)

  // Streak — count consecutive most-recent presents
  const sortedDesc = useMemo(() => [...termSessions].sort((a, b) => b.date.localeCompare(a.date)), [termSessions])
  const streak = useMemo(() => {
    let n = 0
    for (const s of sortedDesc) {
      if (s.status === 'present') n++
      else break
    }
    return n
  }, [sortedDesc])

  // Sessions in chronological order for the dot strip
  const sortedAsc = useMemo(() => [...termSessions].sort((a, b) => a.date.localeCompare(b.date)), [termSessions])

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
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

          {/* Dot strip */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            paddingTop: 10, borderTop: '1px solid #F1F5F9',
          }}>
            {sortedAsc.map(s => (
              <div
                key={s.sessionId}
                title={`${formatShortDate(s.date)} · ${s.sessionType} · ${s.status}`}
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: s.status === 'present' ? COLORS.success : COLORS.error,
                  border: s.sessionType === 'match' ? `2px solid ${COLORS.navy}40` : 'none',
                  boxSizing: 'border-box',
                  cursor: 'help',
                }}
              />
            ))}
          </div>
          {sortedAsc.length > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: '#9DA2B3', marginTop: 6,
            }}>
              <span>{formatShortDate(sortedAsc[0].date)}</span>
              <span>{formatShortDate(sortedAsc[sortedAsc.length - 1].date)}</span>
            </div>
          )}
          <p style={{ fontSize: 11, color: '#9DA2B3', margin: '10px 0 0' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.success, marginRight: 4 }} /> Attended
            <span style={{ marginLeft: 12, display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.error, marginRight: 4 }} /> Missed
            <span style={{ marginLeft: 12, display: 'inline-block', width: 8, height: 8, borderRadius: '50%', border: `2px solid ${COLORS.navy}40`, boxSizing: 'border-box', marginRight: 4 }} /> Match
          </p>
        </>
      ) : (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0 }}>No sessions tracked for this term yet.</p>
        </div>
      )}
    </div>
  )
}
