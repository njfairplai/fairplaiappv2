'use client'

import { cn } from '@/lib/cn'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

/**
 * Status badge.
 *
 * Traffic-light variants (success/warning/error) keep semantic colours
 * that DON'T flip with the active palette — a "success" badge stays green
 * regardless of whether the user is on Touchline or Twilight. Info +
 * neutral DO follow the palette.
 */
const VARIANT: Record<BadgeVariant, string> = {
  success: 'bg-[#27AE60]/15 text-[#27AE60]',
  warning: 'bg-[#F39C12]/15 text-[#F39C12]',
  error: 'bg-[#E74C3C]/15 text-[#E74C3C]',
  info: 'bg-brand-indigo/12 text-brand-indigo',
  neutral: 'bg-brand-line-soft text-brand-indigo-mute',
}

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-satoshi text-xs font-bold',
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
