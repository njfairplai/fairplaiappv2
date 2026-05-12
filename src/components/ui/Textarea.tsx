'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/**
 * Brand-token textarea. Resizes vertically by default; pair with `<Label>`.
 *
 * @example
 *   <Label htmlFor="missing">What's missing?</Label>
 *   <Textarea id="missing" rows={4} placeholder="Features, info..." />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y rounded-lg border bg-brand-paper px-3.5 py-3 font-satoshi text-[15px] text-brand-indigo',
        'placeholder:text-brand-indigo-mute',
        'outline-none transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sand',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-brand-coral' : 'border-brand-line focus:border-brand-indigo',
        className,
      )}
      {...rest}
    />
  )
})

export default Textarea
