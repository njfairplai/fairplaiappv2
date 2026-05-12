'use client'

import { Star } from 'lucide-react'
import type { Session, MatchAnalysis } from '@/lib/types'
import { parentScoreColor } from '@/lib/parent-score-color'
import { cn } from '@/lib/cn'

/* TODO: design-refinement-target — Pack 3 will refine.
 * Compact horizontal-filmstrip card used on parent/player Stats. Used in
 * the top half of the split-screen layout where the radar sits below.
 * Selected card highlighted indigo so the user knows which match drives
 * the radar. */

interface MatchFilmstripCardProps {
  session: Session
  analysis: MatchAnalysis | null
  selected: boolean
  onClick: () => void
  /** True when the session is in the future (no data yet). */
  upcoming?: boolean
  /** True when the analysis was a MOTM-level performance (composite ≥ 80). */
  motm?: boolean
}

export function MatchFilmstripCard({
  session,
  analysis,
  selected,
  onClick,
  upcoming,
  motm,
}: MatchFilmstripCardProps) {
  const composite = analysis?.compositeScore ?? 0
  const isTraining = session.type === 'training_match'

  // Traffic-light score: green ≥80 / amber ≥60 / red <60. Selected
  // state overrides to sand-on-indigo for legibility on the dark fill.
  const scoreColor = selected
    ? 'var(--brand-sand)'
    : parentScoreColor(composite)

  const surfaceColor = selected
    ? 'var(--brand-indigo)'
    : upcoming
    ? 'var(--brand-sand)'
    : 'var(--brand-paper)'

  const textColor = selected ? 'var(--brand-sand)' : 'var(--brand-indigo)'
  const muteColor = selected ? 'rgba(238, 228, 200, 0.7)' : 'var(--brand-indigo-mute)'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={upcoming}
      aria-pressed={selected}
      aria-label={`${formatShortDate(session.date)}, ${session.opponent ?? 'Match'}, score ${composite}`}
      className={cn(
        'shrink-0 w-[116px] min-h-[168px] px-2.5 py-3 rounded-[10px] text-left font-satoshi flex flex-col gap-2 transition-all duration-200',
        selected
          ? 'border-2 border-brand-indigo shadow-[0_8px_20px_rgba(11,8,40,0.32)]'
          : 'border border-brand-line shadow-[0_2px_6px_rgba(11,8,40,0.04)]',
        upcoming ? 'cursor-default opacity-60' : 'cursor-pointer opacity-100',
      )}
      style={{ background: surfaceColor, color: textColor }}
    >
      {/* Date eyebrow + MOTM star */}
      <div className="flex items-center gap-1">
        {motm && (
          <Star
            size={11}
            fill={selected ? 'var(--brand-yellow)' : 'var(--brand-yellow)'}
            color="var(--brand-yellow)"
          />
        )}
        <span
          className="font-fragment text-[9px] tracking-[0.16em] font-bold"
          style={{ color: selected ? 'var(--brand-yellow)' : muteColor }}
        >
          {formatShortDate(session.date)}
        </span>
      </div>

      {/* Composite score (centered hero) */}
      <div className="flex-1 flex items-center justify-center">
        {upcoming ? (
          <span
            className="font-fragment text-[9px] tracking-[0.18em] font-bold"
            style={{ color: muteColor }}
          >
            SOON
          </span>
        ) : composite > 0 ? (
          <span
            className="font-clash text-[38px] tracking-[-0.02em] leading-none"
            style={{ color: scoreColor }}
          >
            {composite}
          </span>
        ) : (
          <span
            className="font-fragment text-[9px] tracking-[0.18em] font-bold"
            style={{ color: muteColor }}
          >
            —
          </span>
        )}
      </div>

      {/* Footer: opponent or training chip */}
      <div>
        {isTraining ? (
          <span className="inline-block font-fragment text-[8px] font-extrabold tracking-[0.16em] text-brand-indigo bg-brand-yellow px-1.5 py-[2px] rounded-[3px] leading-none">
            TRAINING
          </span>
        ) : (
          <div
            className="text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: textColor }}
          >
            {session.opponent ? abbreviateOpponent(session.opponent) : 'Match'}
          </div>
        )}
      </div>
    </button>
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

/** Abbreviate long opponent names to fit the compact card footer. */
function abbreviateOpponent(name: string): string {
  if (name.length <= 12) return name
  // Strip trailing "(away)" / "FC" / "Academy" type tokens for compactness.
  const stripped = name
    .replace(/\s*\(away\)\s*$/i, '')
    .replace(/\s+(FC|SC|Academy)\s*$/i, '')
  return stripped.length <= 12 ? stripped : stripped.slice(0, 11) + '…'
}
