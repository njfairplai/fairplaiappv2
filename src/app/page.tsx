'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { applyTheme } from '@/lib/themes'
import { Logo } from '@/components/shared/Logo'

/**
 * / (landing).
 *
 * Sets the default Cloudline palette on mount. CTA takes the tester
 * straight into the demo (no more upfront palette voting — that now
 * happens AFTER the demo so testers form their colour opinions from
 * inside the actual product experience, not from sterile preview iframes).
 */
export default function UserTestingLandingPage() {
  useEffect(() => {
    // Default palette switched from 'touchline' (green) to 'cloudline'
    // (cool light + indigo + electric blue) — closer to the intended
    // FairplAI brand, cleaner canvas for the Digital CV bib hero.
    applyTheme('cloudline')
    // Reset any prior dwell tracking from a previous session
    try { localStorage.removeItem('fairplai-testing-dwell') } catch { /* noop */ }
    // Wipe stale auth + demo state from prior testing sessions. Without
    // this, a tester who previously logged in as coach has fairplai_role
    // + fairplai_auth_session lingering — which causes the palette
    // iframes (loading /parent/home) to bounce to /login mid-voting.
    // Same for demo-completion state: a tester who previously finished
    // a tour has fairplai_demo_completed='true' which would surface the
    // SoftLockBanner inside the palette iframe — confusing context.
    // The demo entry is a fresh session by definition.
    try {
      localStorage.removeItem('fairplai_role')
      localStorage.removeItem('fairplai_auth_session')
      localStorage.removeItem('fairplai_consented')
      localStorage.removeItem('fairplai_demo_completed')
      localStorage.removeItem('fairplai_demo_active')
      localStorage.removeItem('fairplai_demo_persona')
      localStorage.removeItem('fairplai_demo_step')
      localStorage.removeItem('fairplai_demo_tester')
      sessionStorage.removeItem('fairplai_demo_banner_dismissed')
      sessionStorage.removeItem('fairplai_demo_toggle_dismissed')
    } catch { /* noop */ }
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--brand-sand)',
      color: 'var(--brand-indigo)',
      fontFamily: 'var(--font-satoshi)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 48 }}>
          <Logo height={32} />
        </div>

        {/* Eyebrow */}
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 12,
          letterSpacing: '0.22em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 14,
        }}>
          USER TESTING
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 56,
          lineHeight: 0.98,
          letterSpacing: '-0.02em',
          margin: '0 0 24px',
          fontWeight: 700,
        }}>
          Help us shape<br />the coach portal.
        </h1>

        {/* Body */}
        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 32, maxWidth: 580 }}>
          Fairplai is a sports-tech platform for football academies. Take a
          short guided demo (~5 minutes), tell us what worked, then vote on
          a palette at the end.
        </p>

        {/* CTA */}
        <Link
          href="/demo/persona"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 22px',
            background: 'var(--brand-indigo)',
            color: 'var(--brand-sand)',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-satoshi)',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          }}
        >
          Start the demo
          <span aria-hidden>→</span>
        </Link>

        <div style={{
          marginTop: 48,
          fontSize: 12,
          color: 'var(--brand-indigo-mute)',
          fontFamily: 'var(--font-fragment)',
          letterSpacing: '0.16em',
        }}>
          TAKES ABOUT 5 MINUTES
        </div>
      </div>
    </main>
  )
}
