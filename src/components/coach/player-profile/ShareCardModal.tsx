'use client'

import { useState, useEffect, useMemo } from 'react'
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

          {/* Format picker */}
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
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {(Object.entries(BIB_FORMATS) as [BibFormat, (typeof BIB_FORMATS)[BibFormat]][]).map(
                ([k, v]) => {
                  const active = format === k
                  const previewH = 100
                  const aspect = k === 'square' ? 1 : k === 'story' ? 9 / 16 : 16 / 10
                  const previewW = previewH * aspect
                  const cardScale = (previewH - 8) / v.h
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFormat(k)}
                      style={{
                        flex: 1,
                        background: active ? 'var(--brand-indigo)' : 'var(--brand-paper)',
                        border: '1.5px solid var(--brand-indigo)',
                        padding: '10px 8px 8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                        borderRadius: 6,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          height: previewH,
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: previewW,
                            height: previewH,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <BibCard
                            player={player}
                            radar={radar}
                            seasonScore={seasonScore}
                            matchesPlayed={matchesPlayed}
                            minutesPlayed={minutesPlayed}
                            trend={trend}
                            rosterName={rosterName}
                            format={k}
                            scale={cardScale}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          letterSpacing: '0.18em',
                          fontWeight: 700,
                          marginTop: 6,
                          color: active ? 'var(--brand-yellow)' : 'var(--brand-indigo-mute)',
                        }}
                      >
                        {v.label.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 9.5,
                          marginTop: 2,
                          opacity: 0.75,
                        }}
                      >
                        {v.sub}
                      </div>
                    </button>
                  )
                },
              )}
            </div>
          </div>

          {/* Share targets */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid var(--brand-line)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              SHARE TO
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--brand-yellow)',
                  color: 'var(--brand-indigo)',
                  border: '1px solid var(--brand-indigo)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  borderRadius: 6,
                }}
              >
                <span>Download PNG</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    opacity: 0.6,
                  }}
                >
                  {native.w}×{native.h}
                </span>
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'transparent',
                  color: 'var(--brand-indigo)',
                  border: '1px solid var(--brand-indigo)',
                  padding: '11px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    background: '#25D366',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 3,
                  }}
                >
                  W
                </span>
                Send via WhatsApp
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'transparent',
                  color: 'var(--brand-indigo)',
                  border: '1px solid var(--brand-indigo)',
                  padding: '11px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    background: '#E1306C',
                    display: 'inline-block',
                    borderRadius: 3,
                  }}
                />
                Post to Instagram Story
              </button>
            </div>
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
