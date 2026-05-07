'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

/**
 * /demo/palette-thanks — terminal screen for users who picked a palette
 * but don't want to walk through the demo tour. Clean thanks; no Calendly
 * CTA because testers only land on this surface after they've already
 * booked a call (the demo link is the prequel, not the entry point).
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
          That&apos;s all we needed from you here. We&apos;ll talk through the rest on our call.
        </p>

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
            fontFamily: 'inherit',
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
