'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { THEMES } from '@/lib/themes'
import {
  COMPREHENSION_QUESTIONS,
  FEATURE_LABEL,
  FEEL_QUESTIONS,
  INTENT_OPTIONS,
  questionLabel,
  readKey,
  resolveRole,
  type IntentValue,
  type Role,
} from '@/lib/feedback-schema'
import { Eyebrow, Headline } from '@/components/ui/typography'
import { Tally } from './Tally'

export interface FeedbackRow {
  id: string
  created_at: string
  palette_vote: string
  responses: {
    palette_words?: string[]
    feel?: Record<string, number | null>
    favourite_features?: string[]
    kill_features?: string[]
    nps?: number | null
    intent?: IntentValue | null
    surprise?: string | null
    tour_clarity?: number | null
    mikel_understood?: number | null
    score_understood?: number | null
  } | null
  whats_missing: string | null
  role: string | null
  email: string | null
  dwell_seconds: Record<string, number> | null
  user_agent: string | null
  referrer: string | null
}

type ViewMode = 'cards' | 'tally'
type RoleFilter = 'all' | 'coach' | 'parent' | 'other'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function paletteName(id: string): string {
  return THEMES.find(t => t.id === id)?.name ?? id
}

function Placeholder() {
  return <span className="italic text-brand-indigo-mute">—</span>
}

function LikertChip({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <Placeholder />
  return (
    <strong className="font-clash text-sm text-brand-indigo">
      {value}/5
    </strong>
  )
}

function IntentChip({ value }: { value: IntentValue | null | undefined }) {
  if (!value) return <Placeholder />
  const opt = INTENT_OPTIONS.find(o => o.value === value)
  const tone = opt?.tone ?? 'neutral'
  const toneClass =
    tone === 'positive' ? 'bg-brand-yellow-soft' :
    tone === 'negative' ? 'bg-brand-coral/20' :
    'bg-brand-indigo-soft'
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-[3px] font-clash text-[13px] font-bold text-brand-indigo',
        toneClass,
      )}
    >
      {opt?.label ?? value}
    </span>
  )
}

function ResponseCard({ row }: { row: FeedbackRow }) {
  const resp = row.responses ?? {}
  const role: Role = resolveRole(row.role)

  const npsValue = resp.nps ?? null
  const npsClass =
    npsValue === null ? 'text-brand-indigo-mute' :
    npsValue >= 9 ? 'text-brand-yellow' :
    npsValue >= 7 ? 'text-brand-indigo' :
    'text-brand-coral'

  const dwellSummary = (() => {
    if (!row.dwell_seconds || Object.keys(row.dwell_seconds).length === 0) return null
    const top = Object.entries(row.dwell_seconds).sort((a, b) => b[1] - a[1])[0]
    return top ? `${paletteName(top[0])} ${top[1].toFixed(0)}s` : null
  })()

  return (
    <div className="rounded-[10px] border border-brand-line bg-brand-paper p-[18px] text-[13px] leading-[1.5] text-brand-indigo">
      {/* Header */}
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <div>
          <div className="font-clash text-[18px] font-bold tracking-[-0.01em]">
            {paletteName(row.palette_vote)}
          </div>
          <div className="text-xs text-brand-indigo-mute">
            {fmtDate(row.created_at)} · {row.role || 'no role'} · {row.email || 'no email'}
          </div>
        </div>
        <div className="text-right">
          <div className={cn('font-clash text-2xl font-bold', npsClass)}>
            NPS {npsValue ?? '—'}
          </div>
          <IntentChip value={resp.intent ?? null} />
        </div>
      </div>

      {/* Words from phase 1 */}
      <Row label="Words">
        {resp.palette_words && resp.palette_words.length > 0
          ? resp.palette_words.join(', ')
          : <Placeholder />}
      </Row>

      {/* Comprehension trio */}
      <RowGroup label="Comprehension">
        {COMPREHENSION_QUESTIONS.map(q => (
          <Field key={q.key} label={q.short}>
            <LikertChip value={readKey(resp as Record<string, unknown>, q.key) as number | null} />
          </Field>
        ))}
      </RowGroup>

      {/* Feel */}
      <RowGroup label="Feel">
        {FEEL_QUESTIONS.map(q => (
          <Field key={q.key} label={q.short} title={questionLabel(q, role)}>
            <LikertChip value={readKey(resp as Record<string, unknown>, q.key) as number | null} />
          </Field>
        ))}
      </RowGroup>

      {/* Favourites */}
      <Row label="Favourites">
        {resp.favourite_features && resp.favourite_features.length > 0
          ? resp.favourite_features.map(k => FEATURE_LABEL[k] ?? k).join(', ')
          : <Placeholder />}
      </Row>

      {/* Kill */}
      <Row label="Kill" tone="negative">
        {resp.kill_features && resp.kill_features.length > 0
          ? resp.kill_features.map(k => FEATURE_LABEL[k] ?? k).join(', ')
          : <Placeholder />}
      </Row>

      {/* Surprise */}
      <Row label="Surprise">
        {resp.surprise
          ? <span className="italic">&ldquo;{resp.surprise}&rdquo;</span>
          : <Placeholder />}
      </Row>

      {/* What's missing */}
      <Row label="Missing">
        {row.whats_missing
          ? <span className="italic">&ldquo;{row.whats_missing}&rdquo;</span>
          : <Placeholder />}
      </Row>

      {/* Footer: dwell */}
      {dwellSummary && (
        <div className="mt-3 border-t border-dashed border-brand-line-soft pt-2.5 font-fragment text-[11px] tracking-[0.08em] text-brand-indigo-mute">
          DWELL TOP · {dwellSummary.toUpperCase()}
        </div>
      )}
    </div>
  )
}

function Row({ label, children, tone }: { label: string; children: React.ReactNode; tone?: 'negative' }) {
  return (
    <div className="mb-2">
      <span
        className={cn(
          'mr-2 text-[11px] font-bold tracking-[0.1em]',
          tone === 'negative' ? 'text-brand-coral' : 'text-brand-indigo-mute',
        )}
      >
        {label.toUpperCase()} ·
      </span>
      {children}
    </div>
  )
}

function RowGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
      <span className="text-[11px] font-bold tracking-[0.1em] text-brand-indigo-mute">
        {label.toUpperCase()} ·
      </span>
      {children}
    </div>
  )
}

function Field({ label, children, title }: { label: string; children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="inline-flex items-baseline gap-1">
      <span className="text-xs text-brand-indigo-mute">{label}:</span>
      {children}
    </span>
  )
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-2 font-satoshi text-[13px] transition-colors duration-[140ms] ease-out',
        active
          ? 'border-brand-indigo bg-brand-indigo font-bold text-brand-sand'
          : 'border-brand-line bg-brand-paper font-medium text-brand-indigo hover:bg-brand-paper-hi',
      )}
    >
      {children}
    </button>
  )
}

export function FeedbackView({ rows, error }: { rows: FeedbackRow[]; error: string | null }) {
  const [view, setView] = useState<ViewMode>(rows.length >= 3 ? 'tally' : 'cards')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const filteredRows = useMemo(() => {
    if (roleFilter === 'all') return rows
    return rows.filter(r => resolveRole(r.role) === roleFilter)
  }, [rows, roleFilter])

  return (
    <main className="min-h-screen bg-brand-sand px-6 pb-20 pt-8 font-satoshi text-brand-indigo">
      <div className="mx-auto max-w-[980px]">
        <Link
          href="/demo-admin"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-indigo no-underline"
        >
          <ArrowLeft size={13} /> Back to demo admin
        </Link>

        <Eyebrow className="mb-3">FAIRPLAI · USER FEEDBACK</Eyebrow>

        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-3">
          <Headline as="h1" size="lg" className="m-0 text-[40px]">
            User testing feedback
          </Headline>
          <div className="text-[13px] font-semibold text-brand-indigo-mute">
            {filteredRows.length} of {rows.length} response{rows.length === 1 ? '' : 's'}
          </div>
        </div>
        <p className="mb-6 mt-0 max-w-[540px] text-sm leading-[1.5] text-brand-indigo-mute">
          Live from Neon. Reload the page to fetch the latest. Sorted newest first.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-brand-coral bg-brand-yellow-soft p-4 text-sm text-brand-indigo">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Toggle + filter chips */}
        <div className="mb-6 flex flex-wrap items-center gap-[18px]">
          <div className="flex gap-2">
            <ChipButton active={view === 'tally'} onClick={() => setView('tally')}>Tally</ChipButton>
            <ChipButton active={view === 'cards'} onClick={() => setView('cards')}>By response</ChipButton>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-fragment text-[10px] font-bold tracking-[0.2em] text-brand-indigo-mute">
              ROLE ·
            </span>
            <ChipButton active={roleFilter === 'all'} onClick={() => setRoleFilter('all')}>All</ChipButton>
            <ChipButton active={roleFilter === 'coach'} onClick={() => setRoleFilter('coach')}>Coach</ChipButton>
            <ChipButton active={roleFilter === 'parent'} onClick={() => setRoleFilter('parent')}>Parent</ChipButton>
            <ChipButton active={roleFilter === 'other'} onClick={() => setRoleFilter('other')}>Other</ChipButton>
          </div>
        </div>

        {filteredRows.length === 0 && !error && (
          <div className="rounded-lg border border-brand-line bg-brand-paper p-6 text-sm text-brand-indigo-mute">
            No responses match the current filter.
          </div>
        )}

        {filteredRows.length > 0 && view === 'tally' && <Tally rows={filteredRows} />}
        {filteredRows.length > 0 && view === 'cards' && (
          <div className="flex flex-col gap-3">
            {filteredRows.map(r => <ResponseCard key={r.id} row={r} />)}
          </div>
        )}
      </div>
    </main>
  )
}
