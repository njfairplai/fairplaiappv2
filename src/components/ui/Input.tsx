'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

/**
 * Brand-token text input. Pair with `<Label>` for accessible labelling.
 *
 * @example
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" type="email" placeholder="you@example.com" />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-lg border bg-brand-paper px-3.5 py-3 font-satoshi text-[15px] text-brand-indigo',
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

export default Input
