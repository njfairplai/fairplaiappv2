'use client'

import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'
import { rosters, coaches, players } from '@/lib/mockData'

export default function RosterTable() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
            {['Name', 'Age Group', 'Type', 'Players', 'Coach', 'Status', 'Actions'].map((h) => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rosters.filter((r) => r.academyId === 'academy_001').map((r) => {
            const coach = coaches.find((c) => c.id === r.coachId)
            const playerCount = players.filter((p) => p.academyId === r.academyId).length
            return (
              <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: COLORS.navy }}>{r.name}</td>
                <td style={{ padding: '14px 16px', color: COLORS.muted }}>{r.ageGroup}</td>
                <td style={{ padding: '14px 16px' }}><Badge variant={r.type === 'elite' ? 'info' : r.type === 'competitive' ? 'success' : 'neutral'}>{r.type}</Badge></td>
                <td style={{ padding: '14px 16px', color: COLORS.navy }}>{Math.min(playerCount, 8)}</td>
                <td style={{ padding: '14px 16px', color: COLORS.muted }}>{coach?.name || '—'}</td>
                <td style={{ padding: '14px 16px' }}><Badge variant="success">Active</Badge></td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 13, fontWeight: 600 }}>Edit</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 13, fontWeight: 600 }}>View Players</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
