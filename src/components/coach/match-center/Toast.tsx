'use client'

import { useEffect } from 'react'
import { BRAND, TYPE } from '@/lib/constants'

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
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 80,
        background: BRAND.sand,
        color: BRAND.indigo,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 6,
        padding: '10px 16px',
        fontFamily: TYPE.body,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 12px 28px rgba(11,8,40,0.20)',
        animation: 'mcToastIn 180ms ease both',
      }}
    >
      {message}
    </div>
  )
}
