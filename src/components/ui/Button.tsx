'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-brand-indigo text-brand-sand hover:bg-brand-indigo-mid focus-visible:ring-brand-indigo',
  secondary:
    'border-brand-indigo bg-transparent text-brand-indigo hover:bg-brand-paper-hi focus-visible:ring-brand-indigo',
  ghost:
    'border-transparent bg-transparent text-brand-indigo-mute hover:bg-brand-paper hover:text-brand-indigo focus-visible:ring-brand-indigo',
  danger:
    'border-transparent bg-brand-coral text-brand-sand hover:opacity-90 focus-visible:ring-brand-coral',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[13px] font-semibold',
  md: 'px-6 py-3 text-[15px] font-bold',
  lg: 'px-8 py-4 text-base font-bold',
}

/**
 * Brand-token Button.
 *
 * Hover / focus-visible / disabled states all via Tailwind pseudo-classes —
 * no `onMouseEnter` / `useState(hovered)` plumbing required. Follows the
 * active palette automatically (`bg-brand-indigo` resolves to whatever
 * indigo the current palette defines).
 *
 * @example
 *   <Button variant="primary">Save changes</Button>
 *   <Button variant="ghost" size="sm">Cancel</Button>
 *   <Button variant="secondary" fullWidth>Submit feedback</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border font-satoshi',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sand',
        'disabled:cursor-not-allowed disabled:opacity-50',
        SIZE[size],
        VARIANT[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  )
})

export default Button
