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

/** Auto-derive how many frames fit at the current viewport. */
function useResponsiveWindowSize(): number {
  const [size, setSize] = useState(7)
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      if (w >= 1200) return 7
      if (w >= 768) return 5
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
    setStart(Math.max(0, Math.min(totalLen - windowSize, playheadIdx - windowSize + 2)))
  }, [currentMd, totalLen, windowSize, playheadIdx])

  const end = Math.min(start + windowSize, totalLen)
  const visible = data.slice(start, end)
  const canBack = start > 0
  const canFwd = end < totalLen
  const cellW = frameW
  const gap = 12

  const playheadInWindow = playheadIdx >= start && playheadIdx < end
  const playheadOffset = (playheadIdx - start) * (cellW + gap) + cellW / 2

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

  return (
    <div
      style={{
        background: bg,
        color: fg,
        borderRadius: 12,
        padding: '20px 28px 26px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: yellow,
              fontWeight: 700,
            }}
          >
            SEASON FILMSTRIP
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: muted,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            {currentRange} · {totalLen} MATCHES
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => canBack && setStart(Math.max(0, start - windowSize))}
            disabled={!canBack}
            style={{
              background: 'transparent',
              color: fg,
              border: `1px solid ${ringBtn}`,
              padding: '7px 14px',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              opacity: canBack ? 1 : 0.3,
              cursor: canBack ? 'pointer' : 'default',
            }}
          >
            ‹ {canBack ? prevWin : ''}
          </button>
          <button
            type="button"
            onClick={() =>
              canFwd && setStart(Math.min(totalLen - windowSize, start + windowSize))
            }
            disabled={!canFwd}
            style={{
              background: 'transparent',
              color: fg,
              border: `1px solid ${ringBtn}`,
              padding: '7px 14px',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              opacity: canFwd ? 1 : 0.3,
              cursor: canFwd ? 'pointer' : 'default',
            }}
          >
            {canFwd ? nextWin : ''} ›
          </button>
        </div>
      </div>

      {/* Strip — overflow-x is a safety net for narrow viewports where the
          window count couldn't shrink any further (e.g. tiny preview iframes). */}
      <div
        style={{
          display: 'flex',
          gap,
          position: 'relative',
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'thin',
        }}
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
            style={{
              position: 'absolute',
              top: -10,
              bottom: -18,
              left: playheadOffset - 1,
              width: 2,
              background: yellow,
              zIndex: 1,
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            <div
              style={{
                position: 'absolute',
                top: -8,
                left: -7,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: yellow,
                border: '3px solid var(--brand-indigo)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                left: -7,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: yellow,
                border: '3px solid var(--brand-indigo)',
              }}
            />
          </div>
        )}
      </div>

      {/* Mini-map dots */}
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.18em',
            color: muted,
            fontWeight: 700,
          }}
        >
          FULL SEASON
        </span>
        <div style={{ flex: 1, display: 'flex', gap: 2, position: 'relative' }}>
          {data.map((d, i) => {
            const inWindow = i >= start && i < end
            const isPlay = d.md === currentMd
            let dotColor: string = dark ? 'rgba(238, 228, 200, 0.18)' : 'var(--brand-line)'
            if (d.motm) dotColor = yellow
            else if (d.poor) dotColor = 'var(--brand-coral)'
            else if (d.dnp) dotColor = 'rgba(235, 77, 109, 0.14)'
            else if (d.upcoming) dotColor = dark ? 'rgba(238, 228, 200, 0.1)' : 'var(--brand-line-soft)'
            else if (d.score >= 75) dotColor = dark ? 'var(--brand-sand)' : 'var(--brand-indigo)'
            return (
              <div
                key={d.md}
                style={{
                  flex: 1,
                  height: 8,
                  background: dotColor,
                  opacity: inWindow ? 1 : 0.45,
                  border: isPlay ? `2px solid ${yellow}` : 'none',
                  borderRadius: 2,
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
