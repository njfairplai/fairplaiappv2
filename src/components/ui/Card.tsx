'use client'

import { HTMLAttributes } from 'react'
import { RADIUS, SHADOWS } from '@/lib/constants'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string
  variant?: 'default' | 'dark' | 'gradient'
}

export default function Card({ padding = 16, variant = 'default', style, children, ...props }: CardProps) {
  const bg =
    variant === 'dark'
      ? 'linear-gradient(135deg, #1B1650 0%, #282689 100%)'
      : variant === 'gradient'
        ? 'linear-gradient(135deg, #1B1650 0%, #0D1020 100%)'
        : '#fff'

  return (
    <div
      style={{
        background: bg,
        borderRadius: RADIUS.card,
        padding,
        boxShadow: variant === 'default' ? SHADOWS.card : SHADOWS.elevated,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
