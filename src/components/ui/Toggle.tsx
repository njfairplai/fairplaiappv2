'use client'

import { cn } from '@/lib/cn'

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  className?: string
  'aria-label'?: string
}

/**
 * Two-state switch. Brand-token track when on; muted grey when off.
 * The thumb slides via Tailwind's `translate-x` utility rather than a
 * computed `left` style.
 */
export default function Toggle({ value, onChange, className, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full border-0 p-0',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2',
        'cursor-pointer',
        value ? 'bg-brand-indigo' : 'bg-brand-line',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'absolute top-[3px] left-[3px] block h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.22)]',
          'transition-transform duration-200',
          value ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}
