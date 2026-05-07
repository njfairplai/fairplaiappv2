'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

/**
 * /demo/palette-thanks — terminal screen for users who picked a palette
 * but don't want to walk through the demo tour. Tiny thanks + a Calendly
 * link in case they change their mind.
 */
export default function PaletteThanksPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-satoshi)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <Logo height={28} />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-fragment)',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          PALETTE FEEDBACK · RECEIVED
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 44,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 18px',
            fontWeight: 700,
          }}
        >
          Thanks for your<br />palette feedback.
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>
          That&apos;s all we needed. If you&apos;d like to see the actual coach + parent
          experience next time, book a demo with the founder and we&apos;ll walk you through it.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://calendly.com/fairplai-demo"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--font-satoshi)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            Book a demo →
          </a>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 20px',
              background: 'transparent',
              color: 'var(--brand-indigo)',
              border: '1px solid var(--brand-line)',
              borderRadius: 8,
              fontFamily: 'var(--font-satoshi)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Back to start
          </Link>
        </div>
      </div>
    </main>
  )
}
