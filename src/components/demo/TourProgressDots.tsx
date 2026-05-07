'use client'

import { useTour } from './TourProvider'

/**
 * Progress dots — bottom-center, fixed position. Shows where the user
 * is in the tour as a row of dots. Dots stop being decorative + start
 * being scannable once you're past stop 4 of 7.
 *
 * Lives outside the tooltip so it stays visible even when the spotlight
 * shifts. Always-on; deactivates with the tour.
 */
export function TourProgressDots() {
  const tour = useTour()

  if (!tour.persona || !tour.totalSteps) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1002,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 999,
        boxShadow: '0 6px 16px rgba(11, 8, 40, 0.18)',
        fontFamily: 'var(--font-fragment), monospace',
        fontSize: 10,
        letterSpacing: '0.16em',
        color: 'var(--brand-indigo-mute)',
        fontWeight: 700,
      }}
    >
      <span>{tour.stepIndex + 1}/{tour.totalSteps}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: tour.totalSteps }).map((_, i) => {
          const isCurrent = i === tour.stepIndex
          const isPast = i < tour.stepIndex
          return (
            <span
              key={i}
              style={{
                width: isCurrent ? 14 : 6,
                height: 6,
                borderRadius: 999,
                background: isCurrent
                  ? 'var(--brand-indigo)'
                  : isPast
                  ? 'var(--brand-indigo-mute)'
                  : 'var(--brand-line)',
                transition: 'all 200ms ease',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
