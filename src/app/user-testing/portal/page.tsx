'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { THEMES, applyTheme, type Theme } from '@/lib/themes'
import { Logo } from '@/components/shared/Logo'

/**
 * /user-testing/portal — interstitial after palette voting.
 *
 * Was previously an iframe sample of the coach match drill-in rendered
 * in the chosen palette. Replaced with a clean transition card so the
 * user moves directly from voting → demo without an extra "play around"
 * step that overlapped with what the guided tour now does.
 *
 * Two CTAs:
 *   - Continue to demo → /demo/persona (next: persona pick + email gate)
 *   - Stop here → /demo/palette-thanks
 *
 * The chosen palette stays applied so the transition feels like one
 * continuous experience.
 */
export default function PostPalettePage() {
  const router = useRouter()
  const [chosenTheme, setChosenTheme] = useState<Theme | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let pickedId = 'touchline'
    try {
      const raw = localStorage.getItem('fairplai-testing-palette')
      if (raw) {
        const parsed = JSON.parse(raw) as { palette_vote?: string }
        if (parsed.palette_vote) pickedId = parsed.palette_vote
      }
    } catch { /* noop */ }
    const theme = THEMES.find(t => t.id === pickedId) ?? THEMES[0]
    setChosenTheme(theme)
    setHydrated(true)
    applyTheme(theme.id)
  }, [])

  if (!hydrated || !chosenTheme) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--brand-indigo-mute)' }}>
        Loading…
      </div>
    )
  }

  return (
    <main
      data-theme={chosenTheme.id}
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
      <div style={{ maxWidth: 620, width: '100%' }}>
        <div style={{ marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Logo height={28} />
          </Link>
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
          PALETTE LOCKED · {chosenTheme.name.toUpperCase()}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 52,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
            fontWeight: 700,
          }}
        >
          Thanks for voting.
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 12, maxWidth: 520 }}>
          Your palette feedback is in. The next step is the actual demo —
          a guided 3–4 minute tour through the coach + parent surfaces.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 32, maxWidth: 520, color: 'var(--brand-indigo-mute)' }}>
          We&apos;ll discuss what you saw on the call. If you only wanted to vote on the palette, you&apos;re all set.
        </p>

        {/* Palette swatch row — small reminder of what they picked */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            borderRadius: 8,
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {chosenTheme.swatches.map((c, i) => (
              <span
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: c,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{chosenTheme.name}</span>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => router.push('/demo/persona')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            Continue to demo →
          </button>
          <button
            type="button"
            onClick={() => router.push('/demo/palette-thanks')}
            style={{
              padding: '14px 22px',
              background: 'transparent',
              color: 'var(--brand-indigo)',
              border: '1px solid var(--brand-line)',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Stop here
          </button>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 12,
            color: 'var(--brand-indigo-mute)',
            fontFamily: 'var(--font-fragment)',
            letterSpacing: '0.16em',
          }}
        >
          DEMO TAKES ABOUT 3–4 MINUTES
        </div>
      </div>
    </main>
  )
}
