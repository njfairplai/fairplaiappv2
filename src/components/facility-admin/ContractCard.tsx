'use client'

import Badge from '@/components/ui/Badge'
import { COLORS, SHADOWS } from '@/lib/constants'
import type { LeaseContract } from '@/lib/types'
import { academies, pitches } from '@/lib/mockData'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ContractCard({ contract }: { contract: LeaseContract }) {
  const academy = academies.find((a) => a.id === contract.academyId)
  const pitch = pitches.find((p) => p.id === contract.pitchId)
  const variant = contract.status === 'active' ? 'success' : contract.status === 'expiring_soon' ? 'warning' : 'neutral'

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card, border: contract.status === 'expiring_soon' ? `1px solid ${COLORS.warning}40` : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{academy?.name || '—'}</p>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{pitch?.name}</p>
        </div>
        <Badge variant={variant}>{contract.status.replace('_', ' ')}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
        <div>
          <span style={{ color: COLORS.muted }}>Days: </span>
          <span style={{ color: COLORS.navy, fontWeight: 600 }}>{contract.dayOfWeek.map((d) => dayNames[d]).join(', ')}</span>
        </div>
        <div>
          <span style={{ color: COLORS.muted }}>Time: </span>
          <span style={{ color: COLORS.navy, fontWeight: 600 }}>{contract.startTime}–{contract.endTime}</span>
        </div>
        <div>
          <span style={{ color: COLORS.muted }}>Rate: </span>
          <span style={{ color: COLORS.navy, fontWeight: 600 }}>{contract.ratePerSession} {contract.currency}/session</span>
        </div>
        <div>
          <span style={{ color: COLORS.muted }}>Period: </span>
          <span style={{ color: COLORS.navy, fontWeight: 600 }}>{contract.startDate} – {contract.endDate}</span>
        </div>
      </div>
    </div>
  )
}
