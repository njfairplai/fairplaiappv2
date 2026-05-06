'use client'

import { useEffect, useRef } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterHighlight } from '@/lib/match-center'
import { isClipFlagged, toggleFlaggedClip } from '@/lib/match-center-state'
import { MEyebrow, VideoBlock, mcButtons } from './atoms'

/* Clip modal — renders when the coach clicks ▶ on a HighlightCard.
 *
 * No real video file (the clip stream lands when the API + CDN ship), so
 * the body is the same brand-chrome `VideoBlock` placeholder we use
 * across Match Center. The modal carries enough metadata (event, player,
 * minute, duration, headline) that the coach can verify they picked the
 * right clip even before video plays. The flag toggle is mirrored in the
 * footer so a coach who's already opened a clip can flag it without
 * dismissing first. */

interface ClipModalProps {
  clip: MatchCenterHighlight | null
  onClose: () => void
  onShare: () => void
  onFlagToggle: (newFlagged: boolean) => void
}

export function ClipModal({ clip, onClose, onShare, onFlagToggle }: ClipModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Lock body scroll while the modal is open. `clip` toggles the lock;
  // the cleanup runs on unmount and on each clip change.
  useEffect(() => {
    if (clip) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [clip])

  // Esc closes the modal — small UX win for keyboard users.
  useEffect(() => {
    if (!clip) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clip, onClose])

  if (!clip) return null
  const flagged = isClipFlagged(clip.id)

  return (
    <div
      ref={backdropRef}
      onClick={e => {
        if (e.target === backdropRef.current) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11,8,40,0.62)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 24,
      }}
    >
      <div
        style={{
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderRadius: 8,
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
        }}
      >
        {/* Header band */}
        <div
          style={{
            padding: '16px 22px',
            background: BRAND.yellowSoft,
            borderBottom: `1px solid ${BRAND.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              background: BRAND.yellow,
              color: BRAND.indigo,
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              padding: '3px 6px',
              borderRadius: 2,
            }}
          >
            {clip.ev}
          </span>
          <span
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              color: BRAND.indigoMute,
              fontWeight: 700,
            }}
          >
            {clip.minute}&apos; · {clip.dur}S · {clip.player.toUpperCase()} #{clip.num}
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: BRAND.indigo,
              cursor: 'pointer',
              fontFamily: TYPE.mono,
              fontSize: 14,
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>
          <VideoBlock
            height={320}
            label={`${clip.ev} · ${clip.minute}'`}
            sub={`${clip.player.toUpperCase()} #${clip.num}`}
          />

          <div
            style={{
              marginTop: 14,
              padding: '14px 16px',
              background: '#fff',
              border: `1px solid ${BRAND.line}`,
              borderRadius: 4,
            }}
          >
            <MEyebrow color={BRAND.indigoMute}>HEADLINE</MEyebrow>
            <div
              style={{
                fontFamily: TYPE.body,
                fontSize: 14,
                marginTop: 6,
                color: BRAND.indigo,
                lineHeight: 1.55,
              }}
            >
              {clip.headline}
            </div>
          </div>

          {/* Footer actions */}
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => {
                const newFlagged = toggleFlaggedClip(clip.id)
                onFlagToggle(newFlagged)
              }}
              style={{
                ...mcButtons.ghost,
                background: flagged ? BRAND.indigo : 'transparent',
                color: flagged ? BRAND.sand : BRAND.indigo,
              }}
              aria-pressed={flagged}
            >
              {flagged ? '⚑ Flagged' : '⚑ Flag clip'}
            </button>
            <button type="button" style={mcButtons.ghost} onClick={onShare}>
              ↗ Share
            </button>
            <span style={{ flex: 1 }} />
            <button type="button" style={mcButtons.primary} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
