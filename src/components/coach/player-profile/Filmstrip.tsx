'use client'

import { useState, useEffect } from 'react'
import type { ProgressionFrame } from '@/lib/player-progression'
import { Frame } from './Frame'

interface FilmstripProps {
  data: ProgressionFrame[]
  currentMd: number
  onSelect: (md: number) => void
  /** Override the auto-derived window size. Leave undefined to let the strip
   *  pick 7 / 5 / 3 frames based on viewport width. */
  windowSize?: number
  /** Pass false for the lighter-paper compact strip used on the scrolled view. */
  dark?: boolean
  frameW?: number
  frameH?: number
}

/** Auto-derive how many frames fit at the current viewport. Floors at 5 on
 *  any reasonable desktop width — 4 frames felt too sparse and the cards
 *  read as oversized. Mobile drops to 3. */
function useResponsiveWindowSize(): number {
  const [size, setSize] = useState(7)
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      if (w >= 1280) return 7
      if (w >= 1024) return 6
      if (w >= 720) return 5
      return 3
    }
    setSize(compute())
    const handler = () => setSize(compute())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

/**
 * Paged filmstrip — shows `windowSize` frames at a time with chevron pagination.
 * The window auto-positions to keep the playhead visible. Below the strip:
 * a season mini-map dot row that highlights MOTM (yellow), poor (coral), DNP
 * (coral-soft), upcoming (faded), and the active window range.
 */
export function Filmstrip({
  data,
  currentMd,
  onSelect,
  windowSize: windowSizeProp,
  dark = true,
  frameW = 138,
  frameH = 172,
}: FilmstripProps) {
  const responsiveWindowSize = useResponsiveWindowSize()
  const windowSize = windowSizeProp ?? responsiveWindowSize
  const playheadIdx = data.findIndex(d => d.md === currentMd)
  const totalLen = data.length
  const initialStart = Math.max(
    0,
    Math.min(totalLen - windowSize, playheadIdx - windowSize + 2),
  )
  const [start, setStart] = useState(initialStart)

  useEffect(() => {
    // Only re-window when the new playhead falls OUTSIDE the current visible
    // slice. Clicking a frame that's already on screen used to re-center the
    // window unnecessarily, which made the strip lurch every click and broke
    // the "step through adjacent matches" mental model. Now we behave like
    // `scrollIntoView({block: 'nearest'})` — leave the window alone if the
    // playhead is already showing.
    setStart(prev => {
      if (playheadIdx >= prev && playheadIdx < prev + windowSize) return prev
      return Math.max(
        0,
        Math.min(totalLen - windowSize, playheadIdx - windowSize + 2),
      )
    })
  }, [currentMd, totalLen, windowSize, playheadIdx])

  const end = Math.min(start + windowSize, totalLen)
  const visible = data.slice(start, end)
  const canBack = start > 0
  const canFwd = end < totalLen
  const cellW = frameW
  const gap = 12

  const playheadInWindow = playheadIdx >= start && playheadIdx < end
  // The yellow playhead bar sits on the LEFT EDGE of the selected frame
  // (used to bisect the frame, which read as a confusing axis line).
  const playheadOffset = (playheadIdx - start) * (cellW + gap)

  // Page-window labels — date ranges (e.g. "FEB 24 – APR 19") not MD numbers.
  const prevWin =
    canBack && data[Math.max(0, start - 1)]
      ? `${data[Math.max(0, start - windowSize)].shortDate.toUpperCase()} – ${data[start - 1].shortDate.toUpperCase()}`
      : ''
  const nextWin = canFwd
    ? `${data[end].shortDate.toUpperCase()} – ${data[Math.min(totalLen - 1, end + windowSize - 1)].shortDate.toUpperCase()}`
    : ''
  const currentRange =
    visible.length > 0
      ? `${visible[0].shortDate.toUpperCase()} – ${visible[visible.length - 1].shortDate.toUpperCase()}`
      : ''

  const bg = dark ? 'var(--brand-indigo)' : 'var(--brand-paper)'
  const fg = dark ? 'var(--brand-sand)' : 'var(--brand-indigo)'
  const muted = dark ? 'rgba(238, 228, 200, 0.65)' : 'var(--brand-indigo-mute)'
  const yellow = 'var(--brand-yellow)'
  const ringBtn = dark ? 'rgba(238, 228, 200, 0.3)' : 'var(--brand-line)'
  // Compact mode triggers off the same threshold the windowSize hook
  // uses (sub-720 = mobile). Frames are tighter, header drops its
  // descriptive text, and chevrons go icon-only.
  const isCompact = windowSize <= 3

  return (
    <div
      className="relative rounded-xl px-4 pt-4 pb-5 sm:px-7 sm:pt-5 sm:pb-[26px]"
      style={{ background: bg, color: fg }}
    >
      {/* Header — compact on mobile (drops the "FEB 24 – APR 19 · 28
          MATCHES" descriptor + the date-range labels inside the chevron
          buttons). Desktop keeps the full chrome. */}
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div className="flex items-baseline gap-2 sm:gap-3.5">
          <span
            className="font-fragment text-[10.5px] font-bold tracking-[0.22em]"
            style={{ color: yellow }}
          >
            SEASON
          </span>
          {!isCompact && (
            <span
              className="font-fragment text-[11px] font-semibold tracking-[0.16em]"
              style={{ color: muted }}
            >
              {currentRange} · {totalLen} MATCHES
            </span>
          )}
          {isCompact && (
            <span
              className="font-fragment text-[10px] font-semibold tracking-[0.14em]"
              style={{ color: muted }}
            >
              {totalLen} MATCHES
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => canBack && setStart(Math.max(0, start - windowSize))}
            disabled={!canBack}
            aria-label="Previous window"
            className="rounded-full bg-transparent px-2.5 py-1 font-fragment text-[12px] font-bold tracking-[0.16em] sm:px-3.5 sm:py-[7px] sm:text-[10px]"
            style={{
              color: fg,
              border: `1px solid ${ringBtn}`,
              opacity: canBack ? 1 : 0.3,
              cursor: canBack ? 'pointer' : 'default',
            }}
          >
            <span className="sm:hidden">‹</span>
            <span className="hidden sm:inline">‹ {canBack ? prevWin : ''}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              canFwd && setStart(Math.min(totalLen - windowSize, start + windowSize))
            }
            disabled={!canFwd}
            aria-label="Next window"
            className="rounded-full bg-transparent px-2.5 py-1 font-fragment text-[12px] font-bold tracking-[0.16em] sm:px-3.5 sm:py-[7px] sm:text-[10px]"
            style={{
              color: fg,
              border: `1px solid ${ringBtn}`,
              opacity: canFwd ? 1 : 0.3,
              cursor: canFwd ? 'pointer' : 'default',
            }}
          >
            <span className="sm:hidden">›</span>
            <span className="hidden sm:inline">{canFwd ? nextWin : ''} ›</span>
          </button>
        </div>
      </div>

      {/* Strip — overflow-x is a safety net for narrow viewports where the
          window count couldn't shrink any further (e.g. tiny preview iframes). */}
      <div
        className="flex relative overflow-x-auto pb-1"
        style={{ gap, scrollbarWidth: 'thin' }}
      >
        {visible.map(d => (
          <Frame
            key={d.md}
            frame={d}
            isPlayhead={d.md === currentMd}
            onClick={() => !d.upcoming && onSelect(d.md)}
            width={cellW}
            height={frameH}
          />
        ))}
        {/* Yellow playhead bar */}
        {playheadInWindow && (
          <div
            className="absolute -top-2.5 -bottom-[18px] w-0.5 z-10 pointer-events-none"
            style={{ left: playheadOffset - 1, background: yellow }}
            aria-hidden
          >
            <div
              className="absolute -top-2 -left-[7px] w-4 h-4 rounded-full border-[3px] border-brand-indigo"
              style={{ background: yellow }}
            />
            <div
              className="absolute -bottom-2 -left-[7px] w-4 h-4 rounded-full border-[3px] border-brand-indigo"
              style={{ background: yellow }}
            />
          </div>
        )}
      </div>

    </div>
  )
}
