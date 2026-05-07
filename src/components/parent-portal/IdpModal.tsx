'use client'

import { useEffect } from 'react'
import { X, Printer } from 'lucide-react'
import type {
  Player,
  CoachFeedback,
  SeasonReviewData,
} from '@/lib/types'
import { parentScoreColor } from '@/lib/parent-score-color'

/**
 * IDP modal — the parent's "Individual Development Plan" document.
 *
 * Surfaces the coach's full plan in one view: free-text observation,
 * strengths, growth areas, soft-skill bars, season composite, season
 * review summary. Replaces the previously bloated /parent/development
 * page with a single CTA that opens this modal.
 *
 * "Download PDF" uses `window.print()` against a print-only stylesheet
 * scoped to `#idp-print-area`. Browser's native print dialog has
 * "Save as PDF" built in. Zero-dependency PDF path; output is a clean
 * one-page document. Real PDF library swap-in later if needed.
 */

interface IdpModalProps {
  open: boolean
  onClose: () => void
  player: Player
  /** From `developmentReportData[playerId]` — only `coachNotes` is used
   *  here today (softSkills are read from `feedback` instead since it's
   *  the more recent shape). */
  dev?: { coachNotes?: string } | null
  /** Soft-skill scores 1–5 from CoachFeedback. */
  feedback?: CoachFeedback | null
  /** Season composite from squadScores. */
  composite?: number | null
  /** Season review including strengths + improvement areas + summary stats. */
  review?: SeasonReviewData | null
}

export function IdpModal({
  open,
  onClose,
  player,
  dev,
  feedback,
  composite,
  review,
}: IdpModalProps) {
  // Esc closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    // Lock body scroll while modal is open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const compositeColor = parentScoreColor(composite)

  function handlePrint() {
    if (typeof window === 'undefined') return
    window.print()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${player.firstName}'s development plan`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="idp-modal-scrim"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 8, 40, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
        fontFamily: 'var(--font-satoshi)',
      }}
    >
      {/* Print-only stylesheet — hides everything except the IDP body
       *  on print + nudges margins so the printable area takes the page. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #idp-print-area, #idp-print-area * { visibility: visible !important; }
          #idp-print-area {
            position: absolute !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .idp-modal-scrim {
            background: white !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            inset: 0 !important;
            position: static !important;
          }
          .idp-modal-no-print { display: none !important; }
        }
      `}</style>

      <div
        id="idp-print-area"
        style={{
          width: '100%',
          maxWidth: 720,
          background: 'var(--brand-paper)',
          color: 'var(--brand-indigo)',
          borderRadius: 14,
          border: '1px solid var(--brand-line)',
          boxShadow: '0 24px 56px rgba(11, 8, 40, 0.32)',
          padding: '28px 32px',
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        {/* Header — eyebrow + name + close */}
        <div
          className="idp-modal-no-print"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 4,
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid var(--brand-line)',
              color: 'var(--brand-indigo-mute)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-fragment)',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          INDIVIDUAL DEVELOPMENT PLAN
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 36,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '6px 0 4px',
            fontWeight: 700,
          }}
        >
          {player.firstName} {player.lastName}
        </h1>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--brand-indigo-mute)',
            marginBottom: 24,
          }}
        >
          #{player.jerseyNumber} · {player.position.join(' · ')}
        </div>

        {/* Coach plan */}
        {(dev?.coachNotes || review?.strengthAreas?.length || review?.improvementAreas?.length) && (
          <Section label="Coach's plan">
            {dev?.coachNotes && (
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: 'var(--brand-indigo)',
                  margin: '0 0 14px',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{dev.coachNotes}&rdquo;
              </p>
            )}
            {review?.strengthAreas && review.strengthAreas.length > 0 && (
              <PillRow label="Strengths" items={review.strengthAreas} variant="positive" />
            )}
            {review?.improvementAreas && review.improvementAreas.length > 0 && (
              <PillRow label="Working on" items={review.improvementAreas} variant="growth" />
            )}
          </Section>
        )}

        {/* Soft skills */}
        {feedback && (
          <Section label="Soft skills">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SoftSkillBar label="Attitude" value={feedback.attitude} />
              <SoftSkillBar label="Effort" value={feedback.effort} />
              <SoftSkillBar label="Coachability" value={feedback.coachability} />
              <SoftSkillBar label="Sportsmanship" value={feedback.sportsmanship} />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11.5,
                color: 'var(--brand-indigo-mute)',
                marginTop: 12,
              }}
            >
              Last updated {feedback.date}
            </div>
          </Section>
        )}

        {/* Season composite */}
        {composite != null && (
          <Section label="Season composite">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 48,
                  color: compositeColor,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {composite}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--brand-indigo-mute)',
                }}
              >
                Composite score across all matches this season.
              </span>
            </div>
          </Section>
        )}

        {/* Season review summary */}
        {review && (
          <Section label="Season summary">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10,
              }}
            >
              <Stat label="Matches" value={String(review.matchesPlayed)} />
              <Stat label="Minutes" value={String(review.totalMinutes)} />
              <Stat label="Avg score" value={String(review.avgScore)} />
              <Stat label="Peak score" value={String(review.peakScore)} />
              <Stat label="Goals + Assists" value={String(review.goalsAndAssists)} />
              <Stat label="Highlights" value={String(review.highlightCount)} />
            </div>
            {review.bestMatch && (
              <div
                style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  background: 'var(--brand-sand)',
                  border: '1px solid var(--brand-line)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--brand-indigo)',
                }}
              >
                <span style={{ color: 'var(--brand-indigo-mute)', marginRight: 6 }}>Best match:</span>
                vs {review.bestMatch.opponent} · {review.bestMatch.score} ({review.bestMatch.date})
              </div>
            )}
          </Section>
        )}

        {/* Actions — print-hidden */}
        <div
          className="idp-modal-no-print"
          style={{
            marginTop: 28,
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            paddingTop: 18,
            borderTop: '1px solid var(--brand-line)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              color: 'var(--brand-indigo)',
              border: '1px solid var(--brand-line)',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 18px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(11, 8, 40, 0.18)',
            }}
          >
            <Printer size={14} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 10,
          letterSpacing: '0.22em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 10,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {children}
    </section>
  )
}

function PillRow({
  label,
  items,
  variant,
}: {
  label: string
  items: string[]
  variant: 'positive' | 'growth'
}) {
  const color = variant === 'positive' ? 'var(--brand-yellow)' : 'var(--brand-coral)'
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {items.map(item => (
          <span
            key={item}
            style={{
              padding: '5px 12px',
              border: `1.5px solid ${color}`,
              borderRadius: 999,
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--brand-indigo)',
              background: variant === 'positive' ? 'rgba(252, 215, 24, 0.12)' : 'transparent',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function SoftSkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13.5,
            color: 'var(--brand-indigo)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {value} / 5
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: n <= value ? 'var(--brand-yellow)' : 'var(--brand-line-soft)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        border: '1px solid var(--brand-line)',
        borderRadius: 8,
        padding: '10px 12px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          letterSpacing: '-0.02em',
          color: 'var(--brand-indigo)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.16em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
    </div>
  )
}
