'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type CardVariant = 'default' | 'dark' | 'gradient'
type CardPadding = 'sm' | 'md' | 'lg' | 'none' | number

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `'sm'` = 12px, `'md'` (default) = 16px, `'lg'` = 24px, `'none'` = 0, or a numeric pixel value. */
  padding?: CardPadding
  variant?: CardVariant
}

const VARIANT: Record<CardVariant, string> = {
  default: 'bg-brand-paper shadow-[0_2px_12px_rgba(0,0,0,0.06)]',
  // Brand v3: "dark" + "gradient" are legacy AHOY-blue gradient cards used on
  // a few non-redesigned screens. Kept as inline gradients here because they
  // need fixed colour stops (not palette-aware). New code should prefer
  // `variant="default"` and let the active palette do the work.
  dark: 'shadow-[0_8px_32px_rgba(27,22,80,0.25)] text-white bg-[linear-gradient(135deg,#1B1650_0%,#282689_100%)]',
  gradient:
    'shadow-[0_8px_32px_rgba(27,22,80,0.25)] text-white bg-[linear-gradient(135deg,#1B1650_0%,#0D1020_100%)]',
}

const PADDING_CLASS: Record<Exclude<CardPadding, number>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

function paddingStyle(p: CardPadding): { className?: string; style?: React.CSSProperties } {
  if (typeof p === 'number') return { style: { padding: p } }
  return { className: PADDING_CLASS[p] }
}

export default function Card({
  padding = 'md',
  variant = 'default',
  className,
  style,
  children,
  ...props
}: CardProps) {
  const pad = paddingStyle(padding)
  return (
    <div
      className={cn('rounded-xl', VARIANT[variant], pad.className, className)}
      style={{ ...pad.style, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
