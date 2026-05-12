'use client'

import { useEffect } from 'react'

/**
 * Tiny transient-feedback chip that fades in bottom-right and auto-dismisses.
 *
 * No shared Toast component existed in the app — `/coach/web/record/page.tsx`
 * uses an inline `useState<string|null>` + setTimeout pattern. This component
 * formalises that pattern for Match Center surfaces so handlers can call
 * `setMsg('Saved')` from anywhere without re-implementing the timer.
 *
 * Visibility is purely message-driven: when `message` is non-null the chip
 * renders and CSS animates it in; the dismiss timer fires `onDismiss` to
 * clear the parent's state. No internal `visible` state, which keeps the
 * component free of the synchronous-setState-in-effect anti-pattern.
 *
 * Usage:
 *   const [msg, setMsg] = useState<string | null>(null)
 *   ...
 *   <Toast message={msg} onDismiss={() => setMsg(null)} />
 */
export function Toast({
  message,
  onDismiss,
  durationMs = 2500,
}: {
  message: string | null
  onDismiss: () => void
  durationMs?: number
}) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(t)
  }, [message, durationMs, onDismiss])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      // `key={message}` retriggers the fade-in animation every time the
      // text changes, even if a chip is already on-screen — useful when
      // two actions fire in quick succession.
      key={message}
      className={
        'fixed right-6 bottom-6 z-[80] ' +
        'bg-brand-sand text-brand-indigo border border-brand-line rounded-md ' +
        'px-4 py-2.5 font-satoshi text-[13px] font-semibold ' +
        'shadow-[0_12px_28px_rgba(11,8,40,0.20)] ' +
        '[animation:mcToastIn_180ms_ease_both]'
      }
    >
      {message}
    </div>
  )
}
