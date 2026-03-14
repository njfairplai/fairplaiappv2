'use client'

import React from 'react'
import { COLORS, RADIUS } from '@/lib/constants'
import { useCommandCentre } from '@/contexts/CommandCentreContext'
import { UserPlus, Users, Shield, Calendar, Upload, BarChart3, CreditCard, List, BookOpen } from 'lucide-react'
import type { AgentAction } from '@/lib/types'

const ACTION_ICONS: Record<string, React.ElementType> = {
  add_player: UserPlus,
  add_coach: Shield,
  create_roster: Users,
  schedule_session: Calendar,
  add_program: BookOpen,
  import_csv: Upload,
  view_stats: BarChart3,
  check_credits: CreditCard,
  list_players: List,
  list_rosters: List,
  list_coaches: List,
  list_sessions: List,
  list_programs: List,
}

interface Chip {
  label: string
  action: string
}

export default function ActionChips({ chips }: { chips: Chip[] }) {
  const { triggerAction } = useCommandCentre()

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
      {chips.map((chip, i) => {
        const Icon = ACTION_ICONS[chip.action] || BarChart3
        return (
          <button
            key={i}
            onClick={() => triggerAction(chip.action as AgentAction)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: RADIUS.pill,
              border: `1.5px solid ${COLORS.primary}`,
              background: '#fff', color: COLORS.primary,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.primary; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = COLORS.primary }}
          >
            <Icon size={14} />
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
