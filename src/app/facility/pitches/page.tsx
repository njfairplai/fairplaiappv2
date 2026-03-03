'use client'

import PitchCard from '@/components/facility-admin/PitchCard'
import Button from '@/components/ui/Button'
import { pitches } from '@/lib/mockData'

const COLORS = { navy: '#1B1650' }

export default function PitchesPage() {
  const facilityPitches = pitches.filter((p) => p.facilityId === 'facility_001')

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Pitches</h1>
        <Button>Add Pitch</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {facilityPitches.map((p) => (
          <PitchCard key={p.id} pitch={p} />
        ))}
      </div>
    </div>
  )
}
