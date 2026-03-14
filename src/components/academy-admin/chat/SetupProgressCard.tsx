'use client'

import React from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { Check } from 'lucide-react'

const STEP_LABELS: Record<string, string> = {
  roster_created: 'Create a squad',
  coach_invited: 'Invite a coach',
  players_added: 'Add players',
  session_scheduled: 'Schedule a session',
  program_created: 'Create a program',
  credits_checked: 'Check credits',
}

const ALL_STEPS = ['roster_created', 'coach_invited', 'players_added', 'session_scheduled', 'program_created', 'credits_checked']

interface Props {
  progress: { completedSteps: string[]; totalSteps: number }
}

export default function SetupProgressCard({ progress }: Props) {
  const completedCount = progress.completedSteps.length

  return (
    <div style={{
      background: '#fff', borderRadius: RADIUS.card, padding: 20,
      boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${COLORS.primary}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Setup Progress</span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: COLORS.primary,
          background: `${COLORS.primary}14`, padding: '3px 10px', borderRadius: 12,
        }}>
          {completedCount}/{progress.totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: COLORS.cloud, borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.periwinkle})`,
          width: `${(completedCount / progress.totalSteps) * 100}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {ALL_STEPS.map(step => {
          const done = progress.completedSteps.includes(step)
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: done ? COLORS.success : COLORS.cloud,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {done && <Check size={12} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{
                fontSize: 12, color: done ? COLORS.muted : COLORS.navy,
                textDecoration: done ? 'line-through' : 'none',
              }}>
                {STEP_LABELS[step]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
