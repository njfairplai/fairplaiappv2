'use client'

import { useEffect, useState } from 'react'
import { useTour } from './TourProvider'

/**
 * Tour floating action — bottom-right pill, persistent during the tour.
 *
 * Label + behaviour switch by the current step's CTA:
 *   - normal stops      → "Next →"        (tour.next() advances)
 *   - transition stop   → "Continue →"    (tour.next() shows interstitial)
 *   - last stop (finish)→ "End demo →"    (tour.next() routes to /demo/end)
 *
 * The historical "End demo always visible" pill was confusing on mobile —
 * after hiding the tooltip card, End demo was the ONLY action visible,
 * which tempted testers to wrap up early. Making the pill Next-by-default
 * keeps the natural flow available even when the tooltip is hidden, and
 * reserves the End demo label for the actual last step.
 *
 * Hidden when there's no active persona (before tour / after completion).
 * Hidden inside iframes (palette voting context).
 */
export function EndDemoPill() {
  const tour = useTour()
  const [inIframe, setInIframe] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setInIframe(window.self !== window.top)
  }, [])

  if (inIframe) return null
  if (!tour.persona || !tour.step) return null

  const cta = tour.step.cta
  const label =
    cta === 'finish' ? 'End demo →' :
    cta === 'transition' ? 'Continue →' :
    'Next →'

  // Last stop gets a stronger visual treatment so the user knows this is
  // the wrap-up action, not just the next step.
  const isFinal = cta === 'finish'

  return (
    <button
      type="button"
      onClick={tour.next}
      style={{
        position: 'fixed',
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        right: 20,
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '11px 20px',
        background: isFinal ? 'var(--brand-yellow)' : 'var(--brand-indigo)',
        color: 'var(--brand-indigo)',
        // Indigo bg needs sand text for contrast; yellow bg keeps indigo text.
        ...(isFinal ? {} : { color: 'var(--brand-sand)' }),
        border: 'none',
        borderRadius: 999,
        boxShadow: '0 8px 22px rgba(11, 8, 40, 0.32)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        letterSpacing: '0.02em',
        transition: 'all 180ms ease',
      }}
    >
      {label}
    </button>
  )
}
