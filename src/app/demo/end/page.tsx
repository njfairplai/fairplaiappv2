'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { DemoFeedbackForm } from '@/components/demo/DemoFeedbackForm'

/**
 * /demo/end — terminal screen after a guided tour completes.
 *
 * Marks `fairplai_demo_completed` so the SoftLockBanner activates across
 * coach/parent surfaces and the PortalToggleFab unlocks for coach + misc
 * personas.
 *
 * Single primary action: the post-tour feedback form (DemoFeedbackForm).
 * No Calendly CTA — testers only land here after they've already booked
 * the call, so booking-CTAs would be confusing.
 */
export default function DemoEndPage() {
  const [submitted, setSubmitted] = useState(false)

  // Mark tour completed so SoftLockBanner picks it up across coach/parent surfaces.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('fairplai_demo_completed', 'true')
      // Tour itself is no longer active — surfaces should render normally now.
      localStorage.removeItem('fairplai_demo_active')
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-satoshi)',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
          <Logo height={28} />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-fragment)',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          GUIDED DEMO · COMPLETE
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          That&apos;s the tour.
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: 'var(--brand-indigo-mute)',
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto 36px',
          }}
        >
          You can keep clicking around the app — a banner up top stays so you don&apos;t lose
          your way. Drop us a few minutes of feedback below; we&apos;ll dig into it together on the call.
        </p>

        {submitted ? (
          <SubmittedThanks />
        ) : (
          <DemoFeedbackForm onSubmitted={() => setSubmitted(true)} />
        )}
      </div>
    </main>
  )
}

function SubmittedThanks() {
  return (
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: 28,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 28,
          letterSpacing: '-0.02em',
          color: 'var(--brand-indigo)',
          marginBottom: 8,
        }}
      >
        Got it — thanks.
      </div>
      <p style={{ fontSize: 14, color: 'var(--brand-indigo-mute)', maxWidth: 460, margin: '0 auto 20px' }}>
        One more thing before you go: a quick palette vote. You&apos;ve seen
        the app in our default colours; now you&apos;ll see four alternates
        and tell us which one felt right.
      </p>
      <Link
        href="/user-testing/explore?step=1"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 22px',
          background: 'var(--brand-indigo)',
          color: 'var(--brand-sand)',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-satoshi)',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        Pick a palette
        <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
