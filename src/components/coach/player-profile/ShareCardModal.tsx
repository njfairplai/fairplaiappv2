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
      className="fixed inset-0 flex items-center justify-center z-[80] p-6"
      style={{
        background: 'rgba(11, 8, 40, 0.55)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-brand-sand rounded-[14px] px-7 py-6 grid gap-7 max-w-[1100px] w-full overflow-auto"
        style={{
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          maxHeight: '92vh',
          boxShadow: '0 24px 60px rgba(11, 8, 40, 0.4)',
        }}
      >
        {/* Preview pane */}
        <div className="flex flex-col items-center gap-3">
          <span className="self-start font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
            PREVIEW . {BIB_FORMATS[format].label.toUpperCase()} . {native.w}×{native.h}
          </span>
          <div className="flex items-center justify-center flex-1">
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
        <div className="flex flex-col">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
                FAIRPL.AI
              </div>
              <div className="font-clash text-[32px] text-brand-indigo tracking-[-0.02em] leading-[0.95] mt-1.5">
                Player card.
              </div>
              <div className="font-satoshi text-[12.5px] text-brand-indigo-mute mt-1.5 leading-[1.5]">
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
              className="bg-transparent border-0 text-brand-indigo text-[22px] cursor-pointer leading-none"
            >
              ✕
            </button>
          </div>

          {/* Format picker — text pills, no inline thumbnails. The single
              live preview on the left already shows the active format; the
              picker just needs to read at a glance. */}
          <div className="mt-6">
            <span className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold">
              FORMAT
            </span>
            <div
              role="tablist"
              aria-label="Card format"
              className="flex mt-2.5 bg-brand-paper border border-brand-indigo rounded-full p-[3px] gap-[2px]"
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
                      className={`flex-1 border-0 px-2.5 py-2 cursor-pointer text-center rounded-full font-satoshi text-[13px] font-bold tracking-[0.01em] ${
                        active
                          ? 'bg-brand-indigo text-brand-sand'
                          : 'bg-transparent text-brand-indigo'
                      }`}
                    >
                      {v.label}
                    </button>
                  )
                },
              )}
            </div>
            <div className="mt-2 font-fragment text-[10px] tracking-[0.16em] text-brand-indigo-mute font-semibold">
              {BIB_FORMATS[format].sub.toUpperCase()} . {native.w}×{native.h}
            </div>
          </div>

          {/* One big Share button. Click → popover with Download / WhatsApp /
              Instagram. Replaces the previous always-visible 3-button strip. */}
          <div
            ref={shareRef}
            className="relative mt-6 pt-[18px] border-t border-brand-line"
          >
            <button
              type="button"
              onClick={() => setShareOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={shareOpen}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-yellow text-brand-indigo border border-brand-indigo px-4 py-3.5 font-satoshi text-[15px] font-extrabold cursor-pointer rounded-lg tracking-[0.01em]"
            >
              <Share2 size={16} />
              Share player card
            </button>

            {shareOpen && (
              <div
                role="menu"
                className="absolute left-0 right-0 bg-brand-sand border border-brand-indigo rounded-[10px] p-2 flex flex-col gap-1 z-[2]"
                style={{
                  bottom: 'calc(100% - 8px)',
                  marginBottom: 4,
                  boxShadow: '0 14px 32px rgba(11, 8, 40, 0.22)',
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

          <div className="mt-auto pt-[18px] font-fragment text-[9.5px] tracking-[0.18em] text-brand-indigo-mute font-semibold text-center">
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
      className="flex items-center justify-between gap-2.5 bg-transparent text-brand-indigo border-0 px-3 py-2.5 font-satoshi text-[13px] font-semibold cursor-pointer rounded-lg text-left hover:bg-brand-paper"
    >
      <span className="inline-flex items-center gap-2.5">
        {swatch && (
          <span
            className="w-[18px] h-[18px] rounded-[3px] inline-flex items-center justify-center text-[10px] font-extrabold text-white"
            style={{ background: swatch.bg }}
          >
            {swatch.glyph}
          </span>
        )}
        {label}
      </span>
      {meta && (
        <span className="font-fragment text-[10px] tracking-[0.16em] opacity-60">
          {meta}
        </span>
      )}
    </button>
  )
}
