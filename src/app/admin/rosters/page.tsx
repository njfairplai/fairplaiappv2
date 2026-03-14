'use client'

import RosterTable from '@/components/academy-admin/RosterTable'
import { COLORS, SHADOWS } from '@/lib/constants'

export default function RostersPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Squads</h1>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: SHADOWS.card }}>
        <RosterTable />
      </div>
    </div>
  )
}
