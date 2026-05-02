'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { applyTheme, THEMES } from '@/lib/themes'

/**
 * /user-testing — landing screen.
 *
 * Sets the default sand palette on mount, then invites the voter to walk
 * through 5 palettes one at a time. We DON'T let them choose freely;
 * sequential exposure gives us cleaner comparison data.
 */
export default function UserTestingLandingPage() {
  useEffect(() => {
    applyTheme('sand')
    // Reset any prior dwell tracking from a previous session
    try { localStorage.removeItem('fairplai-testing-dwell') } catch { /* noop */ }
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
        <div style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 28,
          letterSpacing: '0.04em',
          fontWeight: 700,
          marginBottom: 48,
        }}>
          FAIRPL.AI
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
          USER TESTING · DESIGN PREVIEW
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
          Help us shape the<br />coach portal.
        </h1>

        {/* Body */}
        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 16, maxWidth: 580 }}>
          Fairplai is a sports-tech platform for football academies. Coaches use
          it to review match footage, see per-player AI analysis, and share
          highlights with parents.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 32, maxWidth: 580 }}>
          We&apos;re testing five colour palettes for the redesign and gathering
          feedback on the coach experience overall. You&apos;ll see the same
          coach portal page in each palette, one at a time. At the end you&apos;ll
          vote for a palette and rate the design — most questions are one click.
        </p>

        {/* Palette swatches preview */}
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 12,
        }}>
          THE 5 PALETTES
        </div>
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 40,
        }}>
          {THEMES.map(t => (
            <div key={t.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: 'var(--brand-paper)',
              border: '1px solid var(--brand-line)',
              borderRadius: 8,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {t.swatches.map((c, i) => (
                  <span key={i} style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: c,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/user-testing/explore?step=1"
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
          Start exploring
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
