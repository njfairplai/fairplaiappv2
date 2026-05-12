'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { THEMES } from '@/lib/themes'
import {
  COMPREHENSION_QUESTIONS,
  FEATURE_LABEL,
  FEATURES,
  FEEL_QUESTIONS,
  INTENT_OPTIONS,
  ROLES,
  readKey,
  type IntentValue,
} from '@/lib/feedback-schema'
import type { FeedbackRow } from './FeedbackView'

function paletteName(id: string): string {
  return THEMES.find(t => t.id === id)?.name ?? id
}

function roleLabel(value: string | null): string {
  if (!value) return 'Unspecified'
  return ROLES.find(r => r.value === value)?.label ?? value
}

function pct(n: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function fmtAvg(n: number | null): string {
  return n === null ? '—' : n.toFixed(1)
}

/**
 * Bar accent tokens. We use Tailwind class names rather than `var()` strings
 * so the HBar can drop them directly into `className`. The named "indigo" /
 * "yellow" / "coral" / "indigo-mid" set is everything Tally consumes today.
 */
type BarAccent = 'indigo' | 'yellow' | 'coral' | 'indigo-mid'

const BAR_ACCENT: Record<BarAccent, string> = {
  indigo: 'bg-brand-indigo',
  yellow: 'bg-brand-yellow',
  coral: 'bg-brand-coral',
  'indigo-mid': 'bg-brand-indigo-mid',
}

function SectionHeader({ title, n }: { title: string; n: number }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      <h2 className="m-0 font-clash text-xl font-bold tracking-[-0.01em]">{title}</h2>
      <span className="font-fragment text-[11px] font-bold tracking-[0.18em] text-brand-indigo-mute">
        n = {n}
      </span>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-brand-line bg-brand-paper p-[18px]">
      {children}
    </div>
  )
}

function HBar({ label, count, total, accent = 'indigo' }: { label: string; count: number; total: number; accent?: BarAccent }) {
  const widthPct = total === 0 ? 0 : Math.max(2, (count / total) * 100)
  return (
    <div className="mb-1.5 grid grid-cols-[1fr_auto] items-center gap-3">
      <div>
        <div className="mb-1 text-[13px] text-brand-indigo">{label}</div>
        <div className="h-2 overflow-hidden rounded bg-brand-line-soft">
          <div
            className={cn('h-full rounded transition-[width] duration-200 ease-out', BAR_ACCENT[accent])}
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </div>
      <div className="font-clash text-[13px] font-bold text-brand-indigo">
        {count}{' '}
        <span className="text-[11px] font-medium text-brand-indigo-mute">· {pct(count, total)}</span>
      </div>
    </div>
  )
}

function LikertHistogram({ values }: { values: (number | null | undefined)[] }) {
  const present = values.filter((v): v is number => typeof v === 'number')
  const counts = [1, 2, 3, 4, 5].map(n => present.filter(v => v === n).length)
  const total = present.length
  const average = avg(present)
  const lowCount = counts[0] + counts[1]
  return (
    <div>
      <div className="mb-2.5 flex items-baseline gap-3.5">
        <span className="font-clash text-[22px] font-bold text-brand-indigo">
          {fmtAvg(average)}
        </span>
        <span className="font-fragment text-[11px] font-bold tracking-[0.18em] text-brand-indigo-mute">
          AVG
        </span>
        {lowCount > 0 && (
          <span className="rounded-full bg-brand-coral/20 px-2 py-0.5 font-fragment text-[11px] font-bold tracking-[0.1em] text-brand-coral">
            {lowCount} LOW
          </span>
        )}
      </div>
      <div>
        {[1, 2, 3, 4, 5].map(n => (
          <HBar
            key={n}
            label={`${n}`}
            count={counts[n - 1]}
            total={total}
            accent={n <= 2 ? 'coral' : n >= 4 ? 'yellow' : 'indigo-mid'}
          />
        ))}
      </div>
    </div>
  )
}

function NPSDist({ values }: { values: (number | null | undefined)[] }) {
  const present = values.filter((v): v is number => typeof v === 'number')
  const promoters = present.filter(v => v >= 9).length
  const passives = present.filter(v => v >= 7 && v <= 8).length
  const detractors = present.filter(v => v <= 6).length
  const total = present.length
  const average = avg(present)
  const score = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null
  return (
    <div>
      <div className="mb-3.5 flex items-baseline gap-3.5">
        <span className="font-clash text-[28px] font-bold text-brand-indigo">
          {score === null ? '—' : score}
        </span>
        <span className="font-fragment text-[11px] font-bold tracking-[0.18em] text-brand-indigo-mute">
          NPS · AVG {fmtAvg(average)}
        </span>
      </div>
      <HBar label="Promoters (9–10)" count={promoters} total={total} accent="yellow" />
      <HBar label="Passives (7–8)"   count={passives}   total={total} accent="indigo-mid" />
      <HBar label="Detractors (0–6)" count={detractors} total={total} accent="coral" />
    </div>
  )
}

function IntentDist({ values }: { values: (IntentValue | null | undefined)[] }) {
  const total = values.filter(v => v !== null && v !== undefined).length
  return (
    <div>
      {INTENT_OPTIONS.map(opt => {
        const count = values.filter(v => v === opt.value).length
        const accent: BarAccent =
          opt.tone === 'positive' ? 'yellow' :
          opt.tone === 'negative' ? 'coral' :
          'indigo-mid'
        return <HBar key={opt.value} label={opt.label} count={count} total={total} accent={accent} />
      })}
    </div>
  )
}

function PaletteDist({ rows }: { rows: FeedbackRow[] }) {
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.palette_vote, (counts.get(r.palette_vote) ?? 0) + 1)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return (
    <div>
      {sorted.map(([id, n]) => (
        <HBar key={id} label={paletteName(id)} count={n} total={rows.length} accent="indigo" />
      ))}
    </div>
  )
}

function FeatureDist({ rows, kind }: { rows: FeedbackRow[]; kind: 'favourite_features' | 'kill_features' }) {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const list = (r.responses?.[kind] ?? []) as string[]
    for (const f of list) counts.set(f, (counts.get(f) ?? 0) + 1)
  }
  const sorted = FEATURES.map(f => [f.key, counts.get(f.key) ?? 0] as [string, number])
    .sort((a, b) => b[1] - a[1])
  const total = rows.length
  const accent: BarAccent = kind === 'kill_features' ? 'coral' : 'yellow'
  return (
    <div>
      {sorted.map(([key, count]) => (
        <HBar key={key} label={FEATURE_LABEL[key] ?? key} count={count} total={total} accent={accent} />
      ))}
    </div>
  )
}

function WordsCloud({ rows }: { rows: FeedbackRow[] }) {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const words = r.responses?.palette_words ?? []
    for (const w of words) {
      const key = w.trim().toLowerCase()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
  if (sorted.length === 0) return <div className="text-[13px] text-brand-indigo-mute">No words yet.</div>
  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(([word, n]) => (
        <span
          key={word}
          className="rounded-full border border-brand-yellow bg-brand-yellow-soft px-3 py-1.5 text-[13px] text-brand-indigo"
        >
          {word} <strong className="ml-1">×{n}</strong>
        </span>
      ))}
    </div>
  )
}

function RoleDist({ rows }: { rows: FeedbackRow[] }) {
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.role ?? '', (counts.get(r.role ?? '') ?? 0) + 1)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return (
    <div>
      {sorted.map(([k, n]) => (
        <HBar key={k || '__none__'} label={roleLabel(k || null)} count={n} total={rows.length} accent="indigo-mid" />
      ))}
    </div>
  )
}

function DwellAvg({ rows }: { rows: FeedbackRow[] }) {
  const sums = new Map<string, { total: number; n: number }>()
  for (const r of rows) {
    if (!r.dwell_seconds) continue
    for (const [pid, sec] of Object.entries(r.dwell_seconds)) {
      const cur = sums.get(pid) ?? { total: 0, n: 0 }
      cur.total += sec
      cur.n += 1
      sums.set(pid, cur)
    }
  }
  if (sums.size === 0) return <div className="text-[13px] text-brand-indigo-mute">No dwell data yet.</div>
  const sorted = [...sums.entries()]
    .map(([pid, v]) => ({ pid, avg: v.n > 0 ? v.total / v.n : 0 }))
    .sort((a, b) => b.avg - a.avg)
  const max = sorted[0]?.avg ?? 1
  return (
    <div>
      {sorted.map(({ pid, avg: a }) => (
        <HBar key={pid} label={paletteName(pid)} count={Math.round(a)} total={Math.round(max)} accent="indigo-mid" />
      ))}
      <div className="mt-2 font-fragment text-[11px] tracking-[0.08em] text-brand-indigo-mute">
        AVG SECONDS PER PALETTE · BAR LENGTH RELATIVE TO TOP
      </div>
    </div>
  )
}

function OpenList({ rows, getter, label }: { rows: FeedbackRow[]; getter: (r: FeedbackRow) => string | null | undefined; label: string }) {
  const [open, setOpen] = useState(false)
  const items = rows.map(r => ({ id: r.id, text: getter(r), role: r.role })).filter(x => !!x.text && x.text.trim() !== '')
  if (items.length === 0) return <div className="text-[13px] text-brand-indigo-mute">No {label.toLowerCase()} yet.</div>
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="mb-2 cursor-pointer border-none bg-transparent p-0 text-[13px] font-bold text-brand-indigo"
      >
        {open ? '▼' : '▶'} {items.length} {label.toLowerCase()} comment{items.length === 1 ? '' : 's'}
      </button>
      {open && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map(it => (
            <li
              key={it.id}
              className="rounded-md border border-brand-line-soft bg-brand-sand px-3 py-2 text-[13px] italic text-brand-indigo"
            >
              &ldquo;{it.text}&rdquo;
              <span className="mt-1 block text-[11px] not-italic text-brand-indigo-mute">
                — {it.role || 'no role'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Tally({ rows }: { rows: FeedbackRow[] }) {
  const n = rows.length

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3.5">
      <SectionCard>
        <SectionHeader title="Palette vote" n={n} />
        <PaletteDist rows={rows} />
      </SectionCard>

      {COMPREHENSION_QUESTIONS.map(q => (
        <SectionCard key={q.key}>
          <SectionHeader title={q.short} n={n} />
          <LikertHistogram values={rows.map(r => readKey(r.responses as Record<string, unknown>, q.key) as number | null)} />
        </SectionCard>
      ))}

      {FEEL_QUESTIONS.map(q => (
        <SectionCard key={q.key}>
          <SectionHeader title={q.short} n={n} />
          <LikertHistogram values={rows.map(r => readKey(r.responses as Record<string, unknown>, q.key) as number | null)} />
        </SectionCard>
      ))}

      <SectionCard>
        <SectionHeader title="Intent" n={n} />
        <IntentDist values={rows.map(r => r.responses?.intent ?? null)} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="NPS" n={n} />
        <NPSDist values={rows.map(r => r.responses?.nps ?? null)} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Favourite features" n={n} />
        <FeatureDist rows={rows} kind="favourite_features" />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Kill features" n={n} />
        <FeatureDist rows={rows} kind="kill_features" />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Words" n={n} />
        <WordsCloud rows={rows} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Role" n={n} />
        <RoleDist rows={rows} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Dwell" n={n} />
        <DwellAvg rows={rows} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Surprise comments" n={n} />
        <OpenList rows={rows} getter={r => r.responses?.surprise} label="Surprise" />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Missing / change comments" n={n} />
        <OpenList rows={rows} getter={r => r.whats_missing} label="Missing" />
      </SectionCard>
    </div>
  )
}
