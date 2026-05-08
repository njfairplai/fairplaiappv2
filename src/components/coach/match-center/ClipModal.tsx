'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { MatchCenterHighlight } from '@/lib/match-center'
import { isClipFlagged, toggleFlaggedClip } from '@/lib/match-center-state'
import { MEyebrow, VideoBlock, mcButtons } from './atoms'

/* Clip modal — renders when the coach clicks ▶ on a HighlightCard or
 * "▶ Play match reel" on a match group header.
 *
 * Single mode (one clip in the queue) shows the clip metadata and a
 * Done CTA. Reel mode (multiple clips) adds a "Clip N of M" indicator
 * and ‹ Prev / Next › controls so the modal walks through the queue
 * sequentially. Flag + share both apply to the currently-visible
 * clip.
 *
 * No real video file (clip stream lands when API + CDN ship), so the
 * body is the same brand-chrome `VideoBlock` placeholder we use across
 * Match Center. */

interface ClipModalProps {
  /** Queue of clips to play. Empty / null closes the modal. Single
   *  clip = single-clip mode; 2+ clips = reel mode. */
  queue: MatchCenterHighlight[] | null
  /** Optional title rendered above the metadata band — e.g. "Match
   *  reel · vs Al Wasl · 6 clips". Single-clip mode omits this. */
  title?: string
  onClose: () => void
  onShare: (clip: MatchCenterHighlight) => void
  onFlagChange: (clip: MatchCenterHighlight, isNowFlagged: boolean) => void
}

export function ClipModal({
  queue,
  title,
  onClose,
  onShare,
  onFlagChange,
}: ClipModalProps) {
  const isMobile = useIsMobile()
  const backdropRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  // Bumps when the user toggles flag — forces re-read of localStorage
  // for the displayed flag state.
  const [flagTick, setFlagTick] = useState(0)

  // Reset index when the queue identity changes (new clip / reel opens).
  useEffect(() => {
    setIndex(0)
  }, [queue])

  useEffect(() => {
    if (!queue) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [queue])

  useEffect(() => {
    if (!queue) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && queue.length > 1)
        setIndex(i => Math.min(queue.length - 1, i + 1))
      if (e.key === 'ArrowLeft' && queue.length > 1)
        setIndex(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [queue, onClose])

  const clip = queue && queue.length > 0 ? queue[index] : null
  const isReel = queue ? queue.length > 1 : false
  const flagged = useMemo(() => {
    if (!clip) return false
    return isClipFlagged(clip.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, flagTick])

  if (!queue || !clip) return null

  function handleFlag() {
    const isNowFlagged = toggleFlaggedClip(clip!.id)
    setFlagTick(t => t + 1)
    onFlagChange(clip!, isNowFlagged)
  }

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
        padding: isMobile ? 12 : 24,
      }}
    >
      <div
        style={{
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderRadius: 8,
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
        }}
      >
        {/* Header band */}
        <div
          style={{
            padding: isMobile ? '14px 16px' : '16px 22px',
            background: BRAND.yellowSoft,
            borderBottom: `1px solid ${BRAND.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {isReel && title && (
            <div style={{ width: '100%' }}>
              <MEyebrow>MATCH REEL</MEyebrow>
              <div
                style={{
                  fontFamily: TYPE.display,
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  color: BRAND.indigo,
                  marginTop: 2,
                }}
              >
                {title}
              </div>
            </div>
          )}
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
          {isReel && (
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10,
                letterSpacing: '0.18em',
                color: BRAND.indigoMute,
                fontWeight: 700,
              }}
            >
              CLIP {index + 1} OF {queue.length}
            </span>
          )}
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
        <div style={{ padding: isMobile ? '16px 16px' : '20px 22px' }}>
          {clip.clipUrl ? (
            // Re-key so Safari reloads the source on next/prev clip
            // instead of trying to swap mid-stream (which it hates).
            <video
              key={clip.id + '|' + clip.clipUrl}
              src={clip.clipUrl}
              controls
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: isMobile ? 220 : 320,
                background: '#000',
                borderRadius: 4,
                display: 'block',
              }}
            />
          ) : (
            <VideoBlock
              height={isMobile ? 220 : 320}
              label={`${clip.ev} · ${clip.minute}'`}
              sub={`${clip.player.toUpperCase()} #${clip.num}`}
            />
          )}

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
              onClick={handleFlag}
              style={{
                ...mcButtons.ghost,
                background: flagged ? BRAND.indigo : 'transparent',
                color: flagged ? BRAND.sand : BRAND.indigo,
              }}
              aria-pressed={flagged}
            >
              {flagged ? '⚑ Flagged' : '⚑ Flag clip'}
            </button>
            <button
              type="button"
              style={mcButtons.ghost}
              onClick={() => onShare(clip)}
            >
              ↗ Share
            </button>
            <span style={{ flex: 1 }} />
            {isReel ? (
              <>
                <button
                  type="button"
                  style={{
                    ...mcButtons.ghost,
                    opacity: index === 0 ? 0.4 : 1,
                    cursor: index === 0 ? 'default' : 'pointer',
                  }}
                  onClick={() => setIndex(i => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  ‹ Prev clip
                </button>
                {index === queue.length - 1 ? (
                  <button type="button" style={mcButtons.primary} onClick={onClose}>
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    style={mcButtons.primary}
                    onClick={() => setIndex(i => Math.min(queue.length - 1, i + 1))}
                  >
                    Next clip ›
                  </button>
                )}
              </>
            ) : (
              <button type="button" style={mcButtons.primary} onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
