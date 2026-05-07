'use client'

import { Star } from 'lucide-react'
import type { Session, MatchAnalysis } from '@/lib/types'
import { parentScoreColor } from '@/lib/parent-score-color'

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
      style={{
        flexShrink: 0,
        width: 116,
        minHeight: 168,
        padding: '12px 10px',
        background: surfaceColor,
        border: `${selected ? 2 : 1}px solid ${
          selected ? 'var(--brand-indigo)' : 'var(--brand-line)'
        }`,
        borderRadius: 10,
        cursor: upcoming ? 'default' : 'pointer',
        color: textColor,
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: upcoming ? 0.6 : 1,
        boxShadow: selected
          ? '0 8px 20px rgba(11, 8, 40, 0.32)'
          : '0 2px 6px rgba(11, 8, 40, 0.04)',
        transition: 'all 200ms ease',
      }}
    >
      {/* Date eyebrow + MOTM star */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {motm && (
          <Star
            size={11}
            fill={selected ? 'var(--brand-yellow)' : 'var(--brand-yellow)'}
            color="var(--brand-yellow)"
          />
        )}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.16em',
            fontWeight: 700,
            color: selected ? 'var(--brand-yellow)' : muteColor,
          }}
        >
          {formatShortDate(session.date)}
        </span>
      </div>

      {/* Composite score (centered hero) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {upcoming ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.18em',
              fontWeight: 700,
              color: muteColor,
            }}
          >
            SOON
          </span>
        ) : composite > 0 ? (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 38,
              color: scoreColor,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {composite}
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.18em',
              color: muteColor,
              fontWeight: 700,
            }}
          >
            —
          </span>
        )}
      </div>

      {/* Footer: opponent or training chip */}
      <div>
        {isTraining ? (
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: '0.16em',
              color: 'var(--brand-indigo)',
              background: 'var(--brand-yellow)',
              padding: '2px 6px',
              borderRadius: 3,
              lineHeight: 1,
            }}
          >
            TRAINING
          </span>
        ) : (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: textColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
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
