'use client'

import { COLORS, RADIUS } from '@/lib/constants'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: React.CSSProperties
}

const variantMap: Record<BadgeVariant, { bg: string; color: string }> = {
  success: { bg: `${COLORS.success}22`, color: COLORS.success },
  warning: { bg: `${COLORS.warning}22`, color: COLORS.warning },
  error: { bg: `${COLORS.error}22`, color: COLORS.error },
  info: { bg: `${COLORS.primary}22`, color: COLORS.primary },
  neutral: { bg: '#F5F6FC', color: COLORS.muted },
}

export default function Badge({ children, variant = 'neutral', style }: BadgeProps) {
  const { bg, color } = variantMap[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: RADIUS.pill,
        background: bg,
        color,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
