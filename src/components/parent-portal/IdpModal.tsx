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
      className="idp-modal-scrim fixed inset-0 backdrop-blur-[4px] flex items-start justify-center p-4 overflow-y-auto font-satoshi"
      style={{ background: 'rgba(11, 8, 40, 0.55)', zIndex: 200 }}
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
        className="w-full max-w-[720px] bg-brand-paper text-brand-indigo rounded-2xl border border-brand-line shadow-[0_24px_56px_rgba(11,8,40,0.32)] px-8 py-7 my-6"
      >
        {/* Header — eyebrow + name + close */}
        <div className="idp-modal-no-print flex justify-end mb-1">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-transparent border border-brand-line text-brand-indigo-mute cursor-pointer inline-flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        <div className="font-fragment text-[11px] tracking-[0.22em] text-brand-indigo-mute font-bold">
          INDIVIDUAL DEVELOPMENT PLAN
        </div>
        <h1 className="font-clash text-4xl tracking-[-0.02em] leading-[1.05] mt-1.5 mb-1 font-bold">
          {player.firstName} {player.lastName}
        </h1>
        <div className="font-satoshi text-[13px] text-brand-indigo-mute mb-6">
          #{player.jerseyNumber} · {player.position.join(' · ')}
        </div>

        {/* Coach plan */}
        {(dev?.coachNotes || review?.strengthAreas?.length || review?.improvementAreas?.length) && (
          <Section label="Coach's plan">
            {dev?.coachNotes && (
              <p className="text-[14.5px] leading-relaxed text-brand-indigo m-0 mb-3.5 italic">
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
            <div className="flex flex-col gap-3">
              <SoftSkillBar label="Attitude" value={feedback.attitude} />
              <SoftSkillBar label="Effort" value={feedback.effort} />
              <SoftSkillBar label="Coachability" value={feedback.coachability} />
              <SoftSkillBar label="Sportsmanship" value={feedback.sportsmanship} />
            </div>
            <div className="font-satoshi text-[11.5px] text-brand-indigo-mute mt-3">
              Last updated {feedback.date}
            </div>
          </Section>
        )}

        {/* Season composite */}
        {composite != null && (
          <Section label="Season composite">
            <div className="flex items-baseline gap-3.5">
              <span
                className="font-clash text-5xl tracking-[-0.02em] leading-none"
                style={{ color: compositeColor }}
              >
                {composite}
              </span>
              <span className="font-satoshi text-[13px] text-brand-indigo-mute">
                Composite score across all matches this season.
              </span>
            </div>
          </Section>
        )}

        {/* Season review summary */}
        {review && (
          <Section label="Season summary">
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
            >
              <Stat label="Matches" value={String(review.matchesPlayed)} />
              <Stat label="Minutes" value={String(review.totalMinutes)} />
              <Stat label="Avg score" value={String(review.avgScore)} />
              <Stat label="Peak score" value={String(review.peakScore)} />
              <Stat label="Goals + Assists" value={String(review.goalsAndAssists)} />
              <Stat label="Highlights" value={String(review.highlightCount)} />
            </div>
            {review.bestMatch && (
              <div className="mt-4 px-3.5 py-2.5 bg-brand-sand border border-brand-line rounded-lg font-satoshi text-[13px] text-brand-indigo">
                <span className="text-brand-indigo-mute mr-1.5">Best match:</span>
                vs {review.bestMatch.opponent} · {review.bestMatch.score} ({review.bestMatch.date})
              </div>
            )}
          </Section>
        )}

        {/* Actions — print-hidden */}
        <div className="idp-modal-no-print mt-7 flex gap-2.5 justify-end pt-[18px] border-t border-brand-line">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-transparent text-brand-indigo border border-brand-line rounded-lg font-semibold text-[13px] cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-[18px] py-[11px] bg-brand-indigo text-brand-sand border-0 rounded-lg font-bold text-[13px] cursor-pointer shadow-[0_4px_14px_rgba(11,8,40,0.18)]"
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
    <section className="mb-[22px]">
      <div className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold mb-2.5 uppercase">
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
    <div className="mb-3">
      <div className="font-fragment text-[9.5px] tracking-[0.18em] text-brand-indigo-mute font-bold mb-1.5">
        {label.toUpperCase()}
      </div>
      <div className="flex gap-2 flex-wrap">
        {items.map(item => (
          <span
            key={item}
            className="px-3 py-[5px] rounded-full font-satoshi text-[12.5px] font-semibold text-brand-indigo"
            style={{
              border: `1.5px solid ${color}`,
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
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-satoshi text-[13.5px] text-brand-indigo font-semibold">
          {label}
        </span>
        <span className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold">
          {value} / 5
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            className={`flex-1 h-1.5 rounded-[3px] ${
              n <= value ? 'bg-brand-yellow' : 'bg-brand-line-soft'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-sand border border-brand-line rounded-lg px-3 py-2.5">
      <div className="font-clash text-[22px] tracking-[-0.02em] text-brand-indigo">
        {value}
      </div>
      <div className="font-fragment text-[9.5px] tracking-[0.16em] text-brand-indigo-mute font-bold mt-1">
        {label.toUpperCase()}
      </div>
    </div>
  )
}
