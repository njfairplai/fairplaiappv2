'use client'

import type { MatchRecord } from '@/lib/types'
import { scoreColor } from '@/lib/utils'
import { SHADOWS } from '@/lib/constants'
import { ChevronRight } from 'lucide-react'

interface MatchCardProps {
  match: MatchRecord
  onClick: () => void
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const c = scoreColor(match.score)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: 'none',
        borderRadius: 12, padding: '14px 16px', marginBottom: 8, width: '100%',
        textAlign: 'left', cursor: 'pointer', boxShadow: SHADOWS.card,
      }}
    >
      <div style={{ width: 44, height: 50, borderRadius: 10, background: '#F5F6FC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#1B1650', lineHeight: 1 }}>{match.day}</span>
        <span style={{ fontSize: 11, color: '#6E7180', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{match.month}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1B1650', margin: 0 }}>{match.opponent}</p>
        <p style={{ fontSize: 12, color: '#9DA2B3', marginTop: 2 }}>{match.competition}</p>
        <p style={{ fontSize: 12, color: '#9DA2B3' }}>{match.duration}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 22, fontWeight: 900, color: c, margin: 0, lineHeight: 1 }}>{match.score}</p>
        <p style={{ fontSize: 10, color: '#9DA2B3', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>score</p>
      </div>
      <ChevronRight size={16} color="#9DA2B3" />
    </button>
  )
}
