'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Share2 } from 'lucide-react'
import type { Player, MatchAnalysis } from '@/lib/types'
import type { ProgressionFrame } from '@/lib/player-progression'
import { BibCard, BIB_FORMATS, computeBibRadar, type BibFormat } from './BibCard'

interface ShareCardModalProps {
  open: boolean
  onClose: () => void
  player: Player
  /** Latest match frame — drives optional MOTM line in the future. */
  latest: ProgressionFrame | null
  /** Season composite (whole-number 0-100). */
  seasonScore: number
  /** Every match-analysis record for this player; feeds the foot stat strip. */
  records: MatchAnalysis[]
  /** Full season progression — used to derive matches/minutes/trend. */
  progression: ProgressionFrame[]
  /** Roster name surfaced on the bib footer. */
  rosterName?: string
}

/**
 * "Player card" modal — bib-shaped season card with three format presets
 * (Square / Story / Card) and a Download / WhatsApp / Instagram share strip.
 * Replaces the old plain-rectangle share card that used "Make a card" copy.
 */
export function ShareCardModal({
  open,
  onClose,
  player,
  seasonScore,
  records,
  progression,
  rosterName,
}: ShareCardModalProps) {
  const [format, setFormat] = useState<BibFormat>('square')
  const [shareOpen, setShareOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement | null>(null)

  // Outside-click + Escape close for the Share popover.
  useEffect(() => {
    if (!shareOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [shareOpen])

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const radar = useMemo(() => computeBibRadar(records), [records])
  const minutesPlayed = useMemo(
    () =>
      records.reduce((s, r) => s + (r.minutesPlayed ?? 0), 0),
    [records],
  )
  const matchesPlayed = progression.length

  // Trend = latest score minus the average of the prior 3 frames (clamped).
  const trend = useMemo(() => {
    if (progression.length < 2) return 0
    const recent = progression[progression.length - 1].score
    const slice = progression.slice(-4, -1)
    if (slice.length === 0) return 0
    const baseline = Math.round(
      slice.reduce((s, f) => s + f.score, 0) / slice.length,
    )
    return recent - baseline
  }, [progression])

  if (!open) return null

  // Pick a preview pixel target so each format fills the preview pane nicely.
  const PREVIEW_TARGET_H = 540
  const native = BIB_FORMATS[format]
  const previewScale = Math.min(
    PREVIEW_TARGET_H / native.h,
    600 / native.w,
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 8, 40, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--brand-sand)',
          borderRadius: 14,
          padding: '24px 28px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 28,
          maxWidth: 1100,
          width: '100%',
          maxHeight: '92vh',
          overflow: 'auto',
          boxShadow: '0 24px 60px rgba(11, 8, 40, 0.4)',
        }}
      >
        {/* Preview pane */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            PREVIEW . {BIB_FORMATS[format].label.toUpperCase()} . {native.w}×{native.h}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <BibCard
              player={player}
              radar={radar}
              seasonScore={seasonScore}
              matchesPlayed={matchesPlayed}
              minutesPlayed={minutesPlayed}
              trend={trend}
              rosterName={rosterName}
              format={format}
              scale={previewScale}
            />
          </div>
        </div>

        {/* Controls pane */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                FAIRPL.AI
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  marginTop: 6,
                }}
              >
                Player card.
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  color: 'var(--brand-indigo-mute)',
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                Spring 2026 season summary for{' '}
                <strong>
                  {player.firstName} {player.lastName}
                </strong>
                . Save it, send it, or post it.
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close player card"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-indigo)',
                fontSize: 22,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Format picker — text pills, no inline thumbnails. The single
              live preview on the left already shows the active format; the
              picker just needs to read at a glance. */}
          <div style={{ marginTop: 24 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              FORMAT
            </span>
            <div
              role="tablist"
              aria-label="Card format"
              style={{
                display: 'flex',
                marginTop: 10,
                background: 'var(--brand-paper)',
                border: '1px solid var(--brand-indigo)',
                borderRadius: 999,
                padding: 3,
                gap: 2,
              }}
            >
              {(Object.entries(BIB_FORMATS) as [BibFormat, (typeof BIB_FORMATS)[BibFormat]][]).map(
                ([k, v]) => {
                  const active = format === k
                  return (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFormat(k)}
                      style={{
                        flex: 1,
                        background: active ? 'var(--brand-indigo)' : 'transparent',
                        color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                        border: 'none',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        borderRadius: 999,
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                      }}
                    >
                      {v.label}
                    </button>
                  )
                },
              )}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 600,
              }}
            >
              {BIB_FORMATS[format].sub.toUpperCase()} . {native.w}×{native.h}
            </div>
          </div>

          {/* One big Share button. Click → popover with Download / WhatsApp /
              Instagram. Replaces the previous always-visible 3-button strip. */}
          <div
            ref={shareRef}
            style={{
              position: 'relative',
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid var(--brand-line)',
            }}
          >
            <button
              type="button"
              onClick={() => setShareOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={shareOpen}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--brand-yellow)',
                color: 'var(--brand-indigo)',
                border: '1px solid var(--brand-indigo)',
                padding: '14px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: 8,
                letterSpacing: '0.01em',
              }}
            >
              <Share2 size={16} />
              Share player card
            </button>

            {shareOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 'calc(100% - 8px)',
                  marginBottom: 4,
                  background: 'var(--brand-sand)',
                  border: '1px solid var(--brand-indigo)',
                  borderRadius: 10,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  boxShadow: '0 14px 32px rgba(11, 8, 40, 0.22)',
                  zIndex: 2,
                }}
              >
                <ShareOption
                  label="Download PNG"
                  meta={`${native.w}×${native.h}`}
                  swatch={null}
                />
                <ShareOption
                  label="Send via WhatsApp"
                  meta=""
                  swatch={{ bg: '#25D366', glyph: 'W' }}
                />
                <ShareOption
                  label="Post to Instagram Story"
                  meta=""
                  swatch={{ bg: '#E1306C', glyph: '' }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 18,
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.18em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            CARDS AUTO-WATERMARKED . FAIRPL.AI
          </div>
        </div>
      </div>
    </div>
  )
}

/** Single row inside the Share popover. */
function ShareOption({
  label,
  meta,
  swatch,
}: {
  label: string
  meta: string
  swatch: { bg: string; glyph: string } | null
}) {
  return (
    <button
      type="button"
      role="menuitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        background: 'transparent',
        color: 'var(--brand-indigo)',
        border: 'none',
        padding: '10px 12px',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        borderRadius: 8,
        textAlign: 'left',
      }}
      onMouseEnter={e =>
        (e.currentTarget.style.background = 'var(--brand-paper)')
      }
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        {swatch && (
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              background: swatch.bg,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {swatch.glyph}
          </span>
        )}
        {label}
      </span>
      {meta && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            opacity: 0.6,
          }}
        >
          {meta}
        </span>
      )}
    </button>
  )
}
