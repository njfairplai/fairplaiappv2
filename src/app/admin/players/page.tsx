'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PlayerForm from '@/components/academy-admin/PlayerForm'
import { players, rosters } from '@/lib/mockData'
import { Search, Upload } from 'lucide-react'

const COLORS = { primary: '#4A4AFF', navy: '#1B1650', muted: '#6E7180', border: '#E8EAED', error: '#E74C3C' }
const SHADOWS = { card: '0 2px 12px rgba(0,0,0,0.06)' }

export default function AcademyPlayersPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const academyPlayers = players.filter((p) => p.academyId === 'academy_001')
  const filtered = search ? academyPlayers.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())) : academyPlayers
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Players</h1>
        <div style={{ display: 'flex', gap: 8 }}><Button variant="secondary" size="sm"><Upload size={14} /> Import CSV</Button><Button onClick={() => setFormOpen(true)}>Add Player</Button></div>
      </div>
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} color={COLORS.muted} style={{ position: 'absolute', left: 14, top: 12 }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players..." style={{ width: '100%', maxWidth: 400, padding: '10px 14px 10px 36px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none' }} />
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: SHADOWS.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>{['', 'Name', 'DOB', 'Position', 'Roster', 'Jersey', 'Status', 'Parent', 'Actions'].map((h) => (<th key={h} style={{ padding: '12px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>))}</tr></thead>
          <tbody>
            {filtered.map((p) => {
              const roster = rosters.find((r) => r.academyId === p.academyId && r.ageGroup === (p.dateOfBirth.startsWith('2014') ? 'U12' : 'U14'))
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '10px 12px' }}><Avatar firstName={p.firstName} lastName={p.lastName} photo={p.photo} size={32} /></td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: COLORS.navy }}>{p.firstName} {p.lastName}</td>
                  <td style={{ padding: '10px 12px', color: COLORS.muted }}>{p.dateOfBirth}</td>
                  <td style={{ padding: '10px 12px', color: COLORS.muted }}>{p.position.join(', ')}</td>
                  <td style={{ padding: '10px 12px', color: COLORS.muted }}>{roster?.name || '—'}</td>
                  <td style={{ padding: '10px 12px', color: COLORS.navy, fontWeight: 600 }}>#{p.jerseyNumber}</td>
                  <td style={{ padding: '10px 12px' }}><Badge variant={p.status === 'active' ? 'success' : p.status === 'injured' ? 'error' : 'neutral'}>{p.status}</Badge></td>
                  <td style={{ padding: '10px 12px' }}><Badge variant={p.parentIds.length > 0 ? 'success' : 'warning'}>{p.parentIds.length > 0 ? 'Linked' : 'Pending'}</Badge></td>
                  <td style={{ padding: '10px 12px' }}><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 13, fontWeight: 600 }}>Edit</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {formOpen && <PlayerForm onClose={() => setFormOpen(false)} />}
    </div>
  )
}
