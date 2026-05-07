'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { THEMES, applyTheme, type Theme } from '@/lib/themes'
import { Logo } from '@/components/shared/Logo'

/**
 * /user-testing/portal — Phase 2A (Slice 4.5).
 *
 * Reads the chosen palette from localStorage and renders the coach portal in
 * an iframe with that palette applied. Top bar tells the user which phase
 * they're in and gives them a "Done → Give feedback" CTA that routes to
 * /user-testing/feedback (Phase 2B).
 *
 * Today the iframe loads /coach/web/match/session_007 because that's the
 * only redesigned screen. As more screens land in Slice 6, swap or expand
 * the iframe entrypoint so users can navigate around.
 */
export default function PortalExplorePage() {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [chosenTheme, setChosenTheme] = useState<Theme | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // On mount, read the palette they picked in /vote and apply it to the
  // outer document. If they landed here without going through /vote, fall
  // back to the default sand palette and let them keep going.
  useEffect(() => {
    let pickedId = 'almanac'
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

  /** Push the chosen palette into the iframe each time it (re)loads. */
  const onIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument
    if (doc?.documentElement && chosenTheme) {
      doc.documentElement.setAttribute('data-theme', chosenTheme.id)
    }
  }

  // Prevent SSR flicker — wait for theme to be picked from localStorage
  if (!hydrated || !chosenTheme) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--brand-indigo-mute)' }}>Loading…</div>
  }

  return (
    <div data-theme={chosenTheme.id} style={{ background: 'var(--brand-sand)', minHeight: '100vh' }}>
      {/* Top bar — "Phase 2 · Now in YOUR palette" */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--brand-sand)',
        borderBottom: '1px solid var(--brand-line)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <Link href="/user-testing" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
          <Logo height={20} />
        </Link>
        <span style={{ width: 1, height: 18, background: 'var(--brand-line)' }} />
        <span style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}>
          PHASE 2 OF 2 · USING YOUR PALETTE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 18,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.01em',
          }}>{chosenTheme.name}</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {chosenTheme.swatches.map((c, i) => (
              <span key={i} style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: c,
                border: '1px solid rgba(0,0,0,0.08)',
              }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => router.push('/demo/palette-thanks')}
          style={{
            background: 'transparent',
            color: 'var(--brand-indigo)',
            border: '1px solid var(--brand-line)',
            padding: '8px 14px',
            borderRadius: 7,
            fontFamily: 'var(--font-satoshi)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Stop here
        </button>
        <button
          onClick={() => router.push('/demo/persona')}
          style={{
            background: 'var(--brand-yellow)',
            color: 'var(--brand-indigo)',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 7,
            fontFamily: 'var(--font-satoshi)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          Continue to demo →
        </button>
      </div>

      {/* Hint copy */}
      <div style={{
        background: 'var(--brand-paper)',
        borderBottom: '1px solid var(--brand-line)',
        padding: '10px 24px',
        fontSize: 13,
        color: 'var(--brand-indigo-mute)',
        textAlign: 'center',
      }}>
        Click around the page below. When you&apos;re ready, <strong>Continue to demo</strong> for the guided tour or <strong>Stop here</strong> to wrap up.
      </div>

      <iframe
        ref={iframeRef}
        src="/coach/web/match/session_007"
        title="Coach portal — your palette"
        onLoad={onIframeLoad}
        style={{
          display: 'block',
          width: '100%',
          height: 'calc(100vh - 102px)',
          border: 'none',
          background: 'var(--brand-sand)',
        }}
      />
    </div>
  )
}
