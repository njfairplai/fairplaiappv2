'use client'

import React from 'react'
import { COLORS, RADIUS } from '@/lib/constants'
import { CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'

const ACTION_LABELS: Record<string, string> = {
  add_player: 'Player added — onboarding invite sent to guardian',
  add_coach: 'Coach added — onboarding invite sent',
  create_roster: 'Squad created successfully',
  schedule_session: 'Session scheduled successfully',
  add_program: 'Program created — sessions generated',
  bulk_import: 'Players imported — onboarding invites sent',
}

interface Props {
  action: string
  payload?: Record<string, unknown>
}

export default function ConfirmationCard({ action, payload }: Props) {
  const inviteToken = payload?.inviteToken as string | undefined

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '10px 14px', borderRadius: RADIUS.card,
      background: `${COLORS.success}10`, border: `1px solid ${COLORS.success}30`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircle size={18} color={COLORS.success} />
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.success }}>
          {ACTION_LABELS[action] || 'Action completed'}
        </span>
      </div>
      {action === 'add_player' && inviteToken && (
        <Link
          href={`/admin/invite-preview/${inviteToken}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: COLORS.primary,
            textDecoration: 'none', marginLeft: 28,
          }}
        >
          <Mail size={13} /> Preview invite email →
        </Link>
      )}
      {action === 'add_coach' && inviteToken && (
        <Link
          href={`/admin/invite-preview/coach/${inviteToken}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: COLORS.primary,
            textDecoration: 'none', marginLeft: 28,
          }}
        >
          <Mail size={13} /> Preview invite email →
        </Link>
      )}
    </div>
  )
}
