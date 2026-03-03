'use client'
import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import InviteForm from '@/components/academy-admin/InviteForm'
import { coaches, rosters } from '@/lib/mockData'

const COLORS = { primary: '#4A4AFF', navy: '#1B1650', muted: '#6E7180' }
const SHADOWS = { card: '0 2px 12px rgba(0,0,0,0.06)' }

export default function CoachesPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const academyCoaches = coaches.filter((c) => c.academyId === 'academy_001')
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Coaches</h1>
        <Button onClick={() => setInviteOpen(true)}>Invite Coach</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {academyCoaches.map((c) => {
          const assignedRosters = rosters.filter((r) => c.rosterIds.includes(r.id))
          const nameParts = c.name.split(' ')
          return (
            <div key={c.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar firstName={nameParts[0]} lastName={nameParts[1] || ''} size={48} />
                <div><p style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{c.name}</p><p style={{ fontSize: 13, color: COLORS.muted, margin: '2px 0 0' }}>{c.email}</p></div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>{assignedRosters.map((r) => (<Badge key={r.id} variant="info">{r.name}</Badge>))}</div>
              <Badge variant="success">Active</Badge>
            </div>
          )
        })}
      </div>
      <InviteForm open={inviteOpen} onClose={() => setInviteOpen(false)} type="coach" />
    </div>
  )
}
