'use client'

import { COLORS } from '@/lib/constants'
import { sessions, pitches, academies } from '@/lib/mockData'

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function SessionCalendar() {
  // Weekly view for current week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 1, 23 + i) // Feb 23 = Mon
    return { label: dayLabels[i], date: d.toISOString().split('T')[0], day: d.getDate() }
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr>
            <th style={{ width: 120, padding: 10, textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.muted, borderBottom: `2px solid ${COLORS.border}` }}>Pitch</th>
            {weekDates.map((d) => (
              <th key={d.date} style={{ padding: 10, textAlign: 'center', fontSize: 12, fontWeight: 700, color: COLORS.muted, borderBottom: `2px solid ${COLORS.border}` }}>
                {d.label} {d.day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pitches.map((pitch) => (
            <tr key={pitch.id}>
              <td style={{ padding: 10, fontSize: 13, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{pitch.name}</td>
              {weekDates.map((d) => {
                const daySessions = sessions.filter((s) => s.pitchId === pitch.id && s.date === d.date)
                return (
                  <td key={d.date} style={{ padding: 4, borderBottom: `1px solid ${COLORS.border}`, verticalAlign: 'top' }}>
                    {daySessions.map((s) => {
                      const academy = academies.find((a) => a.id === s.academyId)
                      return (
                        <div key={s.id} style={{ padding: '4px 6px', borderRadius: 4, background: s.type === 'match' ? `${COLORS.primary}15` : `${COLORS.success}15`, marginBottom: 2, fontSize: 11, fontWeight: 600, color: s.type === 'match' ? COLORS.primary : COLORS.success }}>
                          {s.startTime} {academy?.name.split(' ')[0]}
                        </div>
                      )
                    })}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
