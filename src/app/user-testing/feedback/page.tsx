'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { applyTheme, readStoredTheme } from '@/lib/themes'
import { PortalFeedbackForm } from '@/components/user-testing/PortalFeedbackForm'

/**
 * /user-testing/feedback — Phase 2B (Slice 4.5).
 *
 * Final feedback after the user has explored the app in their chosen palette.
 * Renders <PortalFeedbackForm /> which reads palette + words from
 * localStorage and submits everything in one POST.
 *
 * After submission, ?submitted=1 query param flips us into the thank-you
 * state.
 */
export default function FeedbackPage() {
  const search = useSearchParams()
  const submitted = search?.get('submitted') === '1'

  // Keep their chosen theme applied on this page (so the form lives in the
  // same palette they just explored). Falls back to sand on the thank-you
  // screen for a calm finish.
  useEffect(() => {
    if (submitted) {
      applyTheme('sand')
    } else {
      applyTheme(readStoredTheme())
    }
  }, [submitted])

  if (submitted) {
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
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'var(--brand-yellow)',
            color: 'var(--brand-indigo)',
            borderRadius: 4,
            fontFamily: 'var(--font-fragment)',
            fontSize: 11,
            letterSpacing: '0.22em',
            fontWeight: 700,
            marginBottom: 24,
          }}>★ THANK YOU</div>
          <h1 style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 48,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}>
            Got it. Your feedback is in.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 32 }}>
            That&apos;s exactly what we needed. We&apos;ll factor your vote and
            notes into the next design pass.
          </p>
          <Link
            href="/user-testing"
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            ← Back to start
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--brand-sand)',
      color: 'var(--brand-indigo)',
      fontFamily: 'var(--font-satoshi)',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/user-testing" style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 24,
          letterSpacing: '0.04em',
          fontWeight: 700,
          color: 'var(--brand-indigo)',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 36,
        }}>FAIRPL.AI</Link>

        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.22em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 12,
        }}>PHASE 2 OF 2 · APP FEEDBACK</div>
        <h1 style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 44,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
        }}>
          Tell us about<br />the app.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 36, maxWidth: 560 }}>
          Now that you&apos;ve used Fairplai in your chosen palette, what
          worked, what didn&apos;t, and what would you change? Most questions
          are one click — about 3 minutes.
        </p>

        <PortalFeedbackForm />
      </div>
    </main>
  )
}
