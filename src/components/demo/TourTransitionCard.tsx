'use client'

import { useTour } from './TourProvider'
import { COACH_TO_PARENT_TRANSITION } from '@/lib/demo-tour-steps'

/**
 * Full-screen interstitial shown between the coach tour and the parent
 * tour for the COACH persona. Renders when the current step has
 * `cta === 'transition'` and the user clicks Next.
 *
 * Single primary CTA "Continue →" advances into the parent tour.
 */
export function TourTransitionCard() {
  const tour = useTour()

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 8, 40, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1003,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'transitionIn 280ms cubic-bezier(.2,.7,.2,1) both',
      }}
    >
      <style>{`
        @keyframes transitionIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          maxWidth: 540,
          width: '100%',
          background: 'var(--brand-paper)',
          color: 'var(--brand-indigo)',
          borderRadius: 16,
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 24px 56px rgba(0, 0, 0, 0.4)',
          fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          PART 2 OF 2
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-clash), system-ui, sans-serif',
            fontSize: 38,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '0 0 14px',
            fontWeight: 700,
          }}
        >
          {COACH_TO_PARENT_TRANSITION.headline}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, margin: '0 0 28px', color: 'var(--brand-indigo-mid, #3A3478)' }}>
          {COACH_TO_PARENT_TRANSITION.body}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={tour.skip}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              color: 'var(--brand-indigo-mute)',
              border: '1px solid var(--brand-line)',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Skip the rest
          </button>
          <button
            type="button"
            onClick={tour.next}
            style={{
              padding: '13px 24px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.22)',
            }}
          >
            {COACH_TO_PARENT_TRANSITION.cta}
          </button>
        </div>
      </div>
    </div>
  )
}
