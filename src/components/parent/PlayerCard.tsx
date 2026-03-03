'use client'

import Image from 'next/image'
import { playerProfile } from '@/lib/mockData'
import { COLORS } from '@/lib/constants'

export default function PlayerCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 20px 0' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', position: 'relative', border: '2px solid rgba(74,74,255,0.2)' }}>
        <Image src="/players/kiyan.jpg" alt={playerProfile.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{playerProfile.name}</p>
        <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{playerProfile.academy} · {playerProfile.team}</p>
      </div>
    </div>
  )
}
