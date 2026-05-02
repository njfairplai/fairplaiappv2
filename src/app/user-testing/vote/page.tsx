'use client'

import Link from 'next/link'
import { PaletteVoteForm } from '@/components/user-testing/PaletteVoteForm'

/**
 * /user-testing/vote — Phase 1B (Slice 4.5).
 *
 * Tiny mid-test form: which palette won + 3-word descriptors. Stores answers
 * to localStorage; the next page (/user-testing/portal) reads them and
 * applies the chosen palette as the user explores the app.
 */
export default function PaletteVotePage() {
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
        }}>PHASE 1 OF 2 · PALETTE VOTE</div>
        <h1 style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 44,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
        }}>
          Pick the palette<br />that felt right.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 36, maxWidth: 560 }}>
          Two questions, ~30 seconds. Once you continue, we&apos;ll re-render
          the app in your chosen palette so you can explore it for real.
        </p>

        <PaletteVoteForm />
      </div>
    </main>
  )
}
