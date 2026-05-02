'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { applyTheme } from '@/lib/themes'
import { FeedbackForm } from '@/components/user-testing/FeedbackForm'

export default function FeedbackPage() {
  const search = useSearchParams()
  const submitted = search?.get('submitted') === '1'

  // Reset to default sand for the feedback screen so the form is on a
  // calm surface regardless of which palette they were last in.
  useEffect(() => {
    applyTheme('sand')
  }, [])

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
            That&apos;s exactly what we needed. We&apos;ll factor your vote and notes
            into the next design pass.
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
        {/* Header */}
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
        }}>STEP 6 OF 6 · YOUR FEEDBACK</div>
        <h1 style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 44,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
        }}>
          Vote for the look<br />of the coach portal.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 36, maxWidth: 560 }}>
          You&apos;ve seen all five palettes. Pick the one that felt right and
          tell us why. Two short answers and a vote — that&apos;s it.
        </p>

        <FeedbackForm />
      </div>
    </main>
  )
}
