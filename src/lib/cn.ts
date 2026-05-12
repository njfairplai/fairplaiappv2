import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine Tailwind class names with conditional logic and dedupe conflicts.
 *
 * - `clsx` handles conditionals and arrays: `cn('a', cond && 'b', { c: cond2 })`
 * - `twMerge` resolves Tailwind conflicts: `cn('p-2 p-4')` → `'p-4'` (later wins)
 *
 * The Prettier plugin sorts the resulting string at write time; this helper
 * only handles runtime composition.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
