'use client'

import { useState } from 'react'

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
      className="bg-brand-indigo rounded-2xl p-4 text-brand-sand"
    >
      <header className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="font-fragment text-[10px] tracking-[0.22em] font-extrabold text-brand-yellow">
            WATCH FULL MATCH
          </div>
          <div className="font-clash text-[18px] tracking-[-0.01em] mt-0.5">
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
          className="inline-flex bg-brand-sand/[0.08] rounded-full p-[3px] border border-brand-sand/[0.16]"
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
        className="w-full aspect-video bg-black rounded-[10px] block"
      />

      <p className="mt-2.5 mb-0 font-satoshi text-[11.5px] text-brand-sand/[0.62] leading-snug">
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
      className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border-0 font-satoshi text-xs font-bold tracking-[0.02em] cursor-pointer transition-all duration-150 ${
        active ? 'bg-brand-sand text-brand-indigo' : 'bg-transparent text-brand-sand'
      }`}
    >
      {yellowDot && (
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full bg-brand-yellow"
          style={{ boxShadow: active ? 'none' : '0 0 6px rgba(252, 215, 24, 0.6)' }}
        />
      )}
      {label}
    </button>
  )
}
