'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type PillVariant = 'default' | 'active' | 'kill' | 'subtle'
type PillSize = 'sm' | 'md'

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillVariant
  size?: PillSize
  /** Render as a static span (non-clickable label). */
  as?: 'button' | 'span'
}

const VARIANT: Record<PillVariant, string> = {
  default:
    'border-brand-line bg-brand-paper text-brand-indigo hover:bg-brand-paper-hi',
  active:
    'border-brand-indigo bg-brand-indigo text-brand-sand hover:bg-brand-indigo-mid',
  kill:
    'border-brand-coral bg-brand-coral text-brand-sand hover:opacity-90',
  subtle:
    'border-transparent bg-brand-line-soft text-brand-indigo-mute hover:bg-brand-line',
}

const SIZE: Record<PillSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-[13px]',
}

/**
 * Chip / tag / multi-select primitive. Click-action by default; pass
 * `as="span"` for static labels.
 *
 * @example
 *   <Pill variant="default">Match in numbers</Pill>
 *   <Pill variant="active">Selected</Pill>
 *   <Pill variant="kill">Unnecessary</Pill>
 *   <Pill as="span" variant="subtle">U12</Pill>
 */
const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
  { variant = 'default', size = 'md', as = 'button', className, type = 'button', children, ...rest },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center gap-1.5 rounded-full border font-satoshi font-semibold',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sand',
    'disabled:cursor-not-allowed disabled:opacity-40',
    SIZE[size],
    VARIANT[variant],
    className,
  )

  if (as === 'span') {
    return (
      <span className={classes} {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    )
  }

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  )
})

export default Pill
