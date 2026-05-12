'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'
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
      className={cn(
        'fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(11,8,40,0.62)] backdrop-blur-[4px]',
        isMobile ? 'p-3' : 'p-6',
      )}
    >
      <div
        className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-lg border border-brand-line bg-brand-paper shadow-[0_24px_56px_rgba(11,8,40,0.4)]"
      >
        {/* Header band */}
        <div
          className={cn(
            'flex flex-wrap items-center gap-2.5 border-b border-brand-line bg-brand-yellow-soft',
            isMobile ? 'px-4 py-3.5' : 'px-[22px] py-4',
          )}
        >
          {isReel && title && (
            <div className="w-full">
              <MEyebrow>MATCH REEL</MEyebrow>
              <div className="mt-0.5 font-clash text-[22px] tracking-[-0.01em] text-brand-indigo">
                {title}
              </div>
            </div>
          )}
          <span className="rounded-sm bg-brand-yellow px-1.5 py-[3px] font-fragment text-[9px] font-bold tracking-[0.18em] text-brand-indigo">
            {clip.ev}
          </span>
          <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            {clip.minute}&apos; · {clip.dur}S · {clip.player.toUpperCase()} #{clip.num}
          </span>
          <span className="flex-1" />
          {isReel && (
            <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
              CLIP {index + 1} OF {queue.length}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer border-none bg-transparent px-1 font-fragment text-sm text-brand-indigo"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={cn(isMobile ? 'p-4' : 'px-[22px] py-5')}>
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
              className="block w-full rounded-sm bg-black"
              style={{ height: isMobile ? 220 : 320 }}
            />
          ) : (
            <VideoBlock
              height={isMobile ? 220 : 320}
              label={`${clip.ev} · ${clip.minute}'`}
              sub={`${clip.player.toUpperCase()} #${clip.num}`}
            />
          )}

          <div className="mt-3.5 rounded-sm border border-brand-line bg-white px-4 py-3.5">
            <MEyebrow color={BRAND.indigoMute}>HEADLINE</MEyebrow>
            <div className="mt-1.5 font-satoshi text-sm leading-[1.55] text-brand-indigo">
              {clip.headline}
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-[18px] flex flex-wrap items-center gap-2">
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
            <span className="flex-1" />
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
