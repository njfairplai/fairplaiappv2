'use client'

import { useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'

/**
 * Coach-side full-match video panel with a Standard ↔ AI Overlay toggle.
 *
 * Renders only when the session has both `matchVideoUrl` and
 * `matchOverlayUrl` populated (see src/lib/demo-video.ts for the demo
 * footage). Default mode = AI Overlay because that's the wow moment we
 * want testers to see first; one-tap to flip to standard.
 *
 * Parent side never instantiates this — overlay is a coach-only AI
 * surface per the asymmetric persona rule.
 */

interface MatchVideoPanelProps {
  rawUrl: string
  overlayUrl: string
}

export function MatchVideoPanel({ rawUrl, overlayUrl }: MatchVideoPanelProps) {
  const [mode, setMode] = useState<'overlay' | 'raw'>('overlay')
  const src = mode === 'overlay' ? overlayUrl : rawUrl

  return (
    <section
      aria-label="Watch full match"
      style={{
        background: BRAND.indigo,
        borderRadius: 14,
        padding: 16,
        color: BRAND.sand,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10,
              letterSpacing: '0.22em',
              fontWeight: 800,
              color: BRAND.yellow,
            }}
          >
            WATCH FULL MATCH
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 18,
              letterSpacing: '-0.01em',
              marginTop: 2,
            }}
          >
            {mode === 'overlay'
              ? 'AI overlay — players + ball tracked'
              : 'Standard footage'}
          </div>
        </div>

        {/* Segmented toggle. Order matters — Standard left, AI Overlay
            right with the yellow dot, makes the AI side feel like the
            "live" tab. */}
        <div
          role="tablist"
          aria-label="Video mode"
          style={{
            display: 'inline-flex',
            background: 'rgba(238, 228, 200, 0.08)',
            borderRadius: 999,
            padding: 3,
            border: '1px solid rgba(238, 228, 200, 0.16)',
          }}
        >
          <ToggleBtn
            active={mode === 'raw'}
            onClick={() => setMode('raw')}
            label="Standard"
          />
          <ToggleBtn
            active={mode === 'overlay'}
            onClick={() => setMode('overlay')}
            label="AI overlay"
            yellowDot
          />
        </div>
      </header>

      {/* Re-key on src change so the player re-mounts and loads the new
          source instead of trying to swap mid-buffer (which Safari hates). */}
      <video
        key={src}
        src={src}
        controls
        playsInline
        preload="metadata"
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#000',
          borderRadius: 10,
          display: 'block',
        }}
      />

      <p
        style={{
          marginTop: 10,
          marginBottom: 0,
          fontFamily: TYPE.body,
          fontSize: 11.5,
          color: 'rgba(238, 228, 200, 0.62)',
          lineHeight: 1.4,
        }}
      >
        {mode === 'overlay'
          ? 'Detection overlay rendered alongside the camera feed. Same five minutes as Standard — toggle to compare.'
          : 'Raw broadcast feed. Toggle to AI overlay to see what Fairplai tracks.'}
      </p>
    </section>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
  yellowDot,
}: {
  active: boolean
  onClick: () => void
  label: string
  yellowDot?: boolean
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 999,
        border: 'none',
        background: active ? BRAND.sand : 'transparent',
        color: active ? BRAND.indigo : BRAND.sand,
        fontFamily: TYPE.body,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        transition: 'all 160ms ease',
      }}
    >
      {yellowDot && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: BRAND.yellow,
            boxShadow: active ? 'none' : '0 0 6px rgba(252, 215, 24, 0.6)',
          }}
        />
      )}
      {label}
    </button>
  )
}
