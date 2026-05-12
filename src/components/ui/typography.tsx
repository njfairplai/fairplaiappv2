'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Typography primitives matching the brand font hierarchy.
 *
 * - `Eyebrow` — small uppercase tracking-wide label (font-fragment).
 *   Used above headlines, on section headers, on small data labels.
 * - `Headline` — display heading (font-clash). Three sizes.
 * - `Label` — form-control label (font-fragment, smaller than Eyebrow).
 *
 * All three follow the active palette via `text-brand-indigo` / mute.
 */

type EyebrowProps = HTMLAttributes<HTMLDivElement>

/** Eyebrow — short kicker label above a headline. */
export function Eyebrow({ className, children, ...rest }: EyebrowProps) {
  return (
    <div
      className={cn(
        'font-fragment text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

type HeadlineSize = 'sm' | 'md' | 'lg'
type HeadlineLevel = 'h1' | 'h2' | 'h3'

interface HeadlineProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: HeadlineSize
  as?: HeadlineLevel
}

const HEADLINE_SIZE: Record<HeadlineSize, string> = {
  sm: 'text-[22px] leading-tight tracking-[-0.01em]',
  md: 'text-[32px] leading-[1.05] tracking-[-0.015em]',
  lg: 'text-[48px] leading-[1.0] tracking-[-0.02em]',
}

/** Headline — display heading in Clash Display, three sizes. */
export function Headline({ size = 'md', as = 'h2', className, children, ...rest }: HeadlineProps) {
  const Tag = as
  return (
    <Tag
      className={cn(
        'font-clash font-bold text-brand-indigo',
        HEADLINE_SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  htmlFor?: string
}

/** Label — form-input label in Fragment Mono. Smaller than Eyebrow. */
export function Label({ className, children, htmlFor, ...rest }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'mb-2 block font-fragment text-[11px] font-bold uppercase tracking-[0.2em] text-brand-indigo-mute',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  )
}
