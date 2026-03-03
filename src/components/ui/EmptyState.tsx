'use client'

import { COLORS } from '@/lib/constants'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: 16, opacity: 0.4 }}>
        {icon || <Inbox size={48} color={COLORS.muted} />}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: '0 0 8px' }}>{title}</h3>
      {description && <p style={{ fontSize: 14, color: COLORS.muted, margin: '0 0 16px', maxWidth: 280 }}>{description}</p>}
      {action}
    </div>
  )
}
