'use client'

import React from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { players, coaches, rosters, sessions, academies } from '@/lib/mockData'
import { Users, Shield, ClipboardList, Calendar, CreditCard } from 'lucide-react'

const ACADEMY_ID = 'academy_001'

const STAT_ICONS: Record<string, React.ElementType> = {
  Players: Users,
  Coaches: Shield,
  Squads: ClipboardList,
  Sessions: Calendar,
  Credits: CreditCard,
  Plan: CreditCard,
}

interface StatItem {
  label: string
  value: string | number
}

export default function StatSummaryCard({ stats }: { stats?: StatItem[] }) {
  // If no stats provided, compute from mock data
  const displayStats = stats || (() => {
    const academy = academies.find(a => a.id === ACADEMY_ID)
    return [
      { label: 'Players', value: players.filter(p => p.academyId === ACADEMY_ID).length },
      { label: 'Coaches', value: coaches.filter(c => c.academyId === ACADEMY_ID).length },
      { label: 'Squads', value: rosters.filter(r => r.academyId === ACADEMY_ID).length },
      { label: 'Sessions', value: sessions.filter(s => s.academyId === ACADEMY_ID).length },
      { label: 'Credits', value: `${academy?.creditBalance ?? 0} min` },
    ]
  })()

  return (
    <div style={{
      background: '#fff', borderRadius: RADIUS.card, padding: 16,
      boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(displayStats.length, 3)}, 1fr)`, gap: 12 }}>
        {displayStats.map((stat, i) => {
          const Icon = STAT_ICONS[stat.label] || Users
          return (
            <div key={i} style={{
              textAlign: 'center', padding: 12, borderRadius: RADIUS.input,
              background: COLORS.lightBg,
            }}>
              <Icon size={18} color={COLORS.primary} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
