'use client'

import { ChevronRight, Star } from 'lucide-react'
import type { Session, MatchAnalysis, Highlight } from '@/lib/types'

/* TODO: design-refinement-target — Pack 3 will refine.
 * Mobile-native vertical match card. Replaces the desktop filmstrip on
 * the parent/player portal. Each card: composite arc / score number,
 * date eyebrow, opponent or training-match label, result + key stats. */

interface MatchListCardProps {
  session: Session
  analysis: MatchAnalysis | null
  highlightCount: number
  /** "Won" / "Lost" / "Drew" / "·" — passed in pre-computed since the
   *  caller is the canonical source of game scores. */
  resultLabel: string | null
  /** When true the session is in the future (no data yet). */
  upcoming?: boolean
  /** When true the analysis was a MOTM-level performance for the kid. */
  motm?: boolean
  onClick: () => void
}

export function MatchListCard({
  session,
  analysis,
  highlightCount,
  resultLabel,
  upcoming,
  motm,
  onClick,
}: MatchListCardProps) {
  const composite = analysis?.compositeScore ?? 0
  const compositeColor = composite >= 80
    ? 'var(--brand-yellow)'
    : composite >= 70
    ? 'var(--brand-indigo)'
    : composite >= 60
    ? 'var(--brand-indigo-mute)'
    : 'var(--brand-coral)'

  const isTraining = session.type === 'training_match'

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr auto',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        background: upcoming ? 'transparent' : 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 10,
        padding: '12px 14px',
        cursor: upcoming ? 'default' : 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        opacity: upcoming ? 0.6 : 1,
      }}
    >
      {/* Score circle */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--brand-sand)',
          border: `2px solid ${composite > 0 ? compositeColor : 'var(--brand-line)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {upcoming ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.18em',
              fontWeight: 700,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            SOON
          </span>
        ) : composite > 0 ? (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              color: compositeColor,
              letterSpacing: '-0.02em',
            }}
          >
            {composite}
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8.5,
              letterSpacing: '0.18em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            —
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.18em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {motm && <Star size={11} fill="var(--brand-yellow)" color="var(--brand-yellow)" />}
          <span>{formatShortDate(session.date)}</span>
          {isTraining && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8.5,
                fontWeight: 800,
                letterSpacing: '0.16em',
                color: 'var(--brand-indigo)',
                background: 'var(--brand-yellow)',
                padding: '1px 5px',
                borderRadius: 3,
                lineHeight: 1,
              }}
            >
              TRAINING
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            color: 'var(--brand-indigo)',
            marginTop: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isTraining
            ? 'Training match'
            : session.opponent
            ? `vs ${session.opponent}`
            : 'Match'}
        </div>
        {!upcoming && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--brand-indigo-mute)',
              marginTop: 2,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {resultLabel && <span>{resultLabel}</span>}
            {analysis?.minutesPlayed !== undefined && (
              <>
                {resultLabel && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />}
                <span>{analysis.minutesPlayed} mins</span>
              </>
            )}
            {highlightCount > 0 && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
                <span>{highlightCount} clip{highlightCount === 1 ? '' : 's'}</span>
              </>
            )}
          </div>
        )}
      </div>

      <ChevronRight size={16} color="var(--brand-indigo-mute)" />
    </button>
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
