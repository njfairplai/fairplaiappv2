'use client'

import { ButtonHTMLAttributes } from 'react'
import { COLORS, RADIUS } from '@/lib/constants'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: COLORS.primary, color: '#fff', border: 'none' },
  secondary: { background: 'transparent', color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
  ghost: { background: 'transparent', color: COLORS.muted, border: 'none' },
  danger: { background: COLORS.error, color: '#fff', border: 'none' },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: 13, fontWeight: 600 },
  md: { padding: '12px 24px', fontSize: 15, fontWeight: 700 },
  lg: { padding: '16px 32px', fontSize: 16, fontWeight: 700 },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        borderRadius: RADIUS.pill,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.18s ease',
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
