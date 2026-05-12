'use client'

import { useState, useMemo, useEffect, type Dispatch, type SetStateAction } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronRight, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/cn'

import type { Player, MatchAnalysis, RadarDataItem } from '@/lib/types'
import { matchAnalyses, sessions } from '@/lib/mockData'
import { scoreColor, type SeasonScore } from '@/lib/squad-season-score'
import { getKeyStats, aggregateSeasonAnalysis } from '@/lib/squad-position-stats'
import { getLatestFatigueByPlayer, fatigueTier } from '@/lib/parent-portal'

// Recharts is heavy + client-only — load on demand. Same component the
// match + player pages use so the radar reads identically across the app.
const RadarChartDynamic = dynamic(
  () => import('@/components/charts/RadarChart'),
  { ssr: false, loading: () => <div className="h-60" /> },
)

type StatScope = 'last' | 'last5' | 'season'

const SCOPE_LABELS: Record<StatScope, string> = {
  last: 'Last session',
  last5: 'Last 5 matches',
  season: 'Whole season',
}

interface SideRailProps {
  /** Selected player. When null the panel is empty (overlay still mounts so
   *  the slide-out animation gets a stable target on close). */
  player: Player | null
  season: SeasonScore | null
  /** Toggle the slide-in overlay state. */
  open: boolean
  onClose: () => void
}

/** Average a numeric field across the player's MatchAnalysis records. */
function avg(records: MatchAnalysis[], pick: (r: MatchAnalysis) => number): number {
  if (records.length === 0) return 0
  const sum = records.reduce((acc, r) => acc + pick(r), 0)
  return Math.round(sum / records.length)
}

/** Most recent MatchAnalysis record for a player, by session date. */
function lastSessionRecord(playerId: string): MatchAnalysis | null {
  const matchSessionIds = new Set(
    sessions.filter(s => s.type === 'match' || s.type === 'training_match').map(s => s.id),
  )
  const records = matchAnalyses
    .filter(a => a.playerId === playerId && matchSessionIds.has(a.sessionId))
  if (records.length === 0) return null
  // sessions are id-ordered chronologically in mock data; sort defensively.
  records.sort((a, b) => a.sessionId.localeCompare(b.sessionId))
  return records[records.length - 1]
}

/**
 * Right-edge slide-in panel for the selected player. Hidden by default;
 * slides in from the right when `open === true`. Header shows jersey, name,
 * score with trend, and a top-right "open full profile" link. A toggle
 * switches the radar + stat rows between last-session and whole-season
 * scope. Bottom CTA navigates to /coach/web/player/[id].
 */
export function SideRail({ player, season, open, onClose }: SideRailProps) {
  const isMobile = useIsMobile()
  const [scope, setScope] = useState<StatScope>('last')

  // Reset scope when a different player is opened so the panel always lands
  // on "Last session" first.
  useEffect(() => {
    if (player) setScope('last')
  }, [player?.id])

  const records = useMemo(
    () => (player ? matchAnalyses.filter(a => a.playerId === player.id) : []),
    [player?.id],
  )
  const last = useMemo(() => (player ? lastSessionRecord(player.id) : null), [player?.id])

  // Keep the body from scrolling while the panel is open (matches sheet).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      {/* scrim — click anywhere outside the panel to close */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-30 transition-opacity duration-200 ease-in-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
      />

      {/* panel — slides in from the right on desktop (a side rail);
       *  slides up from the bottom on mobile (a bottom sheet). The
       *  content is identical, only the docking edge changes. The
       *  bottom-sheet variant caps at 88vh and rounds the top corners
       *  so it reads as lifting off the page. */}
      <aside
        role="dialog"
        aria-label={player ? `${player.firstName} ${player.lastName} player profile` : 'Player profile'}
        className={cn(
          'fixed z-[31] flex flex-col overflow-y-auto bg-brand-indigo font-satoshi text-brand-sand transition-transform duration-[240ms] ease-in-out',
          isMobile
            ? 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t border-[rgba(238,228,200,0.08)] shadow-[0_-16px_40px_rgba(0,0,0,0.4)]'
            : 'right-0 bottom-0 top-[108px] w-[min(420px,92vw)] border-l border-[rgba(238,228,200,0.08)] shadow-[-12px_0_36px_rgba(0,0,0,0.35)]',
        )}
        style={{
          transform: isMobile
            ? open ? 'translateY(0)' : 'translateY(100%)'
            : open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {isMobile && (
          <div className="flex justify-center pt-2">
            <span className="h-1 w-9 rounded-[2px] bg-[rgba(238,228,200,0.25)]" />
          </div>
        )}
        {player && season ? (
          <Body player={player} season={season} records={records} last={last} scope={scope} setScope={setScope} onClose={onClose} />
        ) : null}
      </aside>
    </>
  )
}

function Body({
  player,
  season,
  records,
  last,
  scope,
  setScope,
  onClose,
}: {
  player: Player
  season: SeasonScore
  records: MatchAnalysis[]
  last: MatchAnalysis | null
  scope: StatScope
  setScope: (s: StatScope) => void
  onClose: () => void
}) {
  // The "current" record set drives the score, radar, and stats based on
  // the dropdown scope:
  //   last   = single most-recent match
  //   last5  = average of the most-recent 5 matches
  //   season = average of every match this season
  const isLast = scope === 'last'
  const isLast5 = scope === 'last5'
  const recentRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.sessionId.localeCompare(b.sessionId))
    return sorted.slice(-5)
  }, [records])
  const headlineScore = isLast
    ? last?.compositeScore ?? 0
    : isLast5
    ? avg(recentRecords, x => x.compositeScore)
    : season.avg
  const trend = isLast
    ? last && season.avg ? last.compositeScore - season.avg : 0
    : isLast5
    ? headlineScore - season.avg
    : season.trendVsLast ?? 0
  const c = scoreColor(headlineScore || 0)

  // Per-category averages for the 6-axis radar — driven by scope.
  const r = (pick: (rec: MatchAnalysis) => number): number =>
    isLast ? (last ? pick(last) : 0) : isLast5 ? avg(recentRecords, pick) : avg(records, pick)
  const radarData: RadarDataItem[] = [
    { category: 'Physical',   score: r(x => x.physicalScore),   avg: season.avg },
    { category: 'Positional', score: r(x => x.positionalScore), avg: season.avg },
    { category: 'Passing',    score: r(x => x.passingScore),    avg: season.avg },
    { category: 'Dribbling',  score: r(x => x.dribblingScore),  avg: season.avg },
    { category: 'Control',    score: r(x => x.controlScore),    avg: season.avg },
    { category: 'Defending',  score: r(x => x.defendingScore),  avg: season.avg },
  ]
  // Position-aware key stats — same shape as before; source analysis is the
  // chosen scope's representative record.
  const sourceAnalysis: MatchAnalysis | null = isLast
    ? last
    : isLast5
    ? recentRecords.length > 0 ? aggregateSeasonAnalysis(recentRecords) : null
    : records.length > 0 ? aggregateSeasonAnalysis(records) : null
  const [keyA, keyB] = sourceAnalysis
    ? getKeyStats(player.position[0] ?? 'CM', sourceAnalysis)
    : [{ label: '', value: 0, suffix: '' }, { label: '', value: 0, suffix: '' }]
  const stats: Array<[string, string]> = sourceAnalysis
    ? [
        [keyA.label,        `${keyA.value}${keyA.suffix}`],
        [keyB.label,        `${keyB.value}${keyB.suffix}`],
        ['Minutes',         `${sourceAnalysis.minutesPlayed ?? 0}'`],
        ['Distance',        `${sourceAnalysis.distanceCovered.toFixed(1)} km`],
        ['Top speed',       `${sourceAnalysis.topSpeed.toFixed(1)} km/h`],
      ]
    : []

  return (
    <>
      {/* header bar */}
      <div className="flex items-center gap-2.5 border-b border-[rgba(238,228,200,0.08)] py-3.5 pl-[18px] pr-3.5">
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[rgba(238,228,200,0.08)] font-clash text-[17px] text-brand-sand"
          style={{ border: `2px solid ${c}` }}
        >
          {player.jerseyNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-clash text-lg uppercase leading-[1.05] tracking-[0.01em]">
            {player.firstName} {player.lastName}
          </div>
          <div className="mt-[3px] font-fragment text-[10px] tracking-[0.15em] text-[rgba(238,228,200,0.6)]">
            {player.position.join(' · ')} · #{player.jerseyNumber}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player panel"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[rgba(238,228,200,0.15)] bg-transparent text-brand-sand"
        >
          <X size={16} />
        </button>
      </div>

      {/* primary CTAs — pinned to the top of the body so the coach can deep-
          link to the profile or IDP without scrolling through the summary. */}
      <div className="flex gap-2 px-[18px] pt-3.5">
        <Link
          href={`/coach/web/player/${player.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-none bg-brand-yellow p-3 font-satoshi text-[13px] font-bold no-underline"
          style={{ color: '#0B0828' }}
        >
          View full profile <ChevronRight size={14} />
        </Link>
        <Link
          href={`/coach/web/idps?player=${player.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[rgba(238,228,200,0.25)] bg-transparent p-3 font-satoshi text-[13px] font-semibold text-brand-sand no-underline"
        >
          Open IDP <ChevronRight size={14} />
        </Link>
      </div>

      {/* Quick-note editor — collapsed by default. Saves a timestamped
       *  note to fairplai_player_notes_${id}. Lets the coach jot
       *  something while they're in the squad context, no full-profile
       *  navigation. */}
      <div className="px-[18px] pt-3">
        <SideRailNoteEditor playerId={player.id} />
      </div>

      {/* Scope dropdown: drives the score, radar, and stats below. Defaults
          to Last session; coach can switch to Last 5 matches or Whole season. */}
      <div className="px-[18px] pt-3.5">
        <label className="inline-flex items-center gap-2 rounded-lg border border-[rgba(238,228,200,0.16)] bg-[rgba(238,228,200,0.06)] px-2.5 py-1.5">
          <span className="font-fragment text-[9.5px] font-bold tracking-[0.18em] text-[rgba(238,228,200,0.6)]">
            SCOPE
          </span>
          <select
            value={scope}
            onChange={e => setScope(e.target.value as StatScope)}
            className="cursor-pointer appearance-none border-none bg-transparent pr-3.5 font-satoshi text-[13px] font-semibold text-brand-sand outline-none"
          >
            {(Object.entries(SCOPE_LABELS) as [StatScope, string][]).map(([k, label]) => (
              <option key={k} value={k} style={{ color: '#0B0828' }}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* content scroll area */}
      <div className="flex flex-col gap-[18px] px-[18px] pb-6 pt-4">
        {/* headline score + trend */}
        <div className="flex items-baseline gap-2.5">
          <div
            className="font-clash leading-[0.85] tracking-[-0.02em]"
            style={{ fontSize: 88, color: c }}
          >
            {headlineScore || '—'}
          </div>
          <div className="font-fragment text-[11px] tracking-[0.12em] text-[rgba(238,228,200,0.6)]">
            {isLast ? 'LAST' : isLast5 ? 'LAST 5' : 'SEASON'}<br />SCORE
          </div>
          {(season.matches > 0 || last) && (
            <div
              className="ml-auto text-right font-fragment text-[11px] font-bold"
              style={{ color: trend >= 0 ? '#9BD08A' : '#EB4D6D' }}
            >
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}<br />
              <span className="font-normal text-[rgba(238,228,200,0.5)]">
                {isLast ? 'vs season avg' : isLast5 ? 'vs season avg' : 'vs recent'}
              </span>
            </div>
          )}
        </div>

        {/* fairplai read */}
        <div className="border-l-2 border-brand-yellow bg-[rgba(252,215,24,0.06)] py-3.5 pl-4 pr-3.5 font-satoshi text-[13px] leading-[1.55] text-[rgba(238,228,200,0.92)]">
          <div className="mb-1 font-fragment text-[10px] tracking-[0.15em] text-brand-yellow">
            FAIRPLAI READ
          </div>
          {readForPlayer(player, season, last, isLast)}
        </div>

        {/* Fatigue chip — pulled from welfare-store. Sits between the
         *  Fairplai read and the radar so welfare lives next to
         *  performance on every player view. */}
        <FatigueChip playerId={player.id} />

        {/* radar — 6 categories, identical to the analysis page */}
        <div className="rounded-xl bg-[rgba(238,228,200,0.04)] px-1 py-2">
          <RadarChartDynamic data={radarData} height={260} />
        </div>

        {/* stats */}
        <div>
          {stats.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-b border-[rgba(238,228,200,0.08)] py-2.5"
            >
              <span className="font-fragment text-[11px] uppercase tracking-[0.12em] text-[rgba(238,228,200,0.6)]">
                {k}
              </span>
              <span className="font-clash text-[17px]">{v}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

/** Heuristic one-liner that adapts to the active scope. */
function readForPlayer(
  player: Player,
  season: SeasonScore,
  last: MatchAnalysis | null,
  isLast: boolean,
): string {
  if (isLast) {
    if (!last) return `No matches recorded yet for ${player.firstName}.`
    const delta = last.compositeScore - season.avg
    if (delta >= 6) return `Last match popped. ${last.compositeScore} is ${delta} above the season average.`
    if (delta <= -6) return `Below the line last match. ${last.compositeScore} vs ${season.avg} season average. Worth a 1:1.`
    return `In the groove last match. ${last.compositeScore} composite, in line with the season trend.`
  }
  if (season.matches === 0) return `${player.firstName} hasn't played a recorded match this season yet.`
  if (season.recent - season.avg >= 4) return `Trending up. Recent form (${season.recent}) is above ${player.firstName}'s season average.`
  if (season.avg - season.recent >= 4) return `Form has dipped. Last few matches (${season.recent}) are below the season line.`
  if (season.avg >= 75) return `Holding a high standard at ${season.avg} across ${season.matches} matches.`
  if (season.avg < 60) return `Composite is below the squad's working line. Worth a 1:1 to talk through what's on top of mind.`
  return `Steady. ${season.avg} composite over ${season.matches} matches.`
}

/* Quick-note editor for the SideRail.
 *
 * Default state: a single "+ Add note" link button that shows the
 * current note count if any exist. Click → expands to a textarea +
 * Save / Cancel pair. Save persists a timestamped entry to the
 * fairplai_player_notes_${playerId} array in localStorage. The
 * count badge updates immediately so the coach sees their note was
 * captured.
 *
 * No external coupling to the full profile yet — that wiring lands
 * when the player profile note panel reads from the same key. */
interface PlayerNote {
  text: string
  savedAt: string
}

function readPlayerNotes(playerId: string): PlayerNote[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(`fairplai_player_notes_${playerId}`)
    return raw ? (JSON.parse(raw) as PlayerNote[]) : []
  } catch {
    return []
  }
}
function writePlayerNotes(playerId: string, notes: PlayerNote[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`fairplai_player_notes_${playerId}`, JSON.stringify(notes))
  } catch {
    /* ignore */
  }
}

function SideRailNoteEditor({ playerId }: { playerId: string }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState<PlayerNote[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setNotes(readPlayerNotes(playerId))
    setDraft('')
    setOpen(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [playerId])

  // Auto-clear toast after 2.2s.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  function save() {
    const text = draft.trim()
    if (!text) return
    const next: PlayerNote[] = [
      { text, savedAt: new Date().toISOString() },
      ...notes,
    ]
    writePlayerNotes(playerId, next)
    setNotes(next)
    setDraft('')
    setOpen(false)
    setToast('Note saved')
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[rgba(238,228,200,0.18)] bg-[rgba(238,228,200,0.08)] p-2.5 font-satoshi text-[13px] font-semibold text-brand-sand"
        >
          <span>+ Add note</span>
          {notes.length > 0 && (
            <span className="font-fragment text-[10px] font-bold tracking-[0.16em] text-[rgba(238,228,200,0.7)]">
              {notes.length} SAVED
            </span>
          )}
        </button>
        {toast && (
          <div className="mt-2 font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-yellow">
            ✓ {toast.toUpperCase()}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[rgba(238,228,200,0.18)] bg-[rgba(238,228,200,0.05)] p-2.5">
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={`Quick note about this player…`}
        rows={3}
        className="w-full resize-y border-none bg-transparent font-satoshi text-[13px] leading-[1.5] text-brand-sand outline-none"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setDraft('')
            setOpen(false)
          }}
          className="cursor-pointer border-none bg-transparent px-3 py-1.5 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-[rgba(238,228,200,0.7)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={draft.trim().length === 0}
          className={cn(
            'rounded-[4px] border-none px-3.5 py-1.5 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em]',
            draft.trim() ? 'cursor-pointer' : 'cursor-default',
          )}
          style={{
            background: draft.trim() ? 'var(--brand-yellow)' : 'rgba(238, 228, 200, 0.12)',
            color: draft.trim() ? '#0B0828' : 'rgba(238, 228, 200, 0.4)',
          }}
        >
          Save note
        </button>
      </div>
    </div>
  )
}


/** Inline fatigue chip styled for the dark indigo SideRail surface.
 *  Reads the latest fatigue sample from welfare-store. Hidden when no
 *  sample exists for the player. */
function FatigueChip({ playerId }: { playerId: string }) {
  const [load, setLoad] = useState<number | null>(null)
  useEffect(() => {
    const map = getLatestFatigueByPlayer()
    const sample = map[playerId]
    setLoad(sample ? sample.load : null)
  }, [playerId])
  if (load == null) return null
  const tier = fatigueTier(load)
  const color =
    tier === 'high' ? 'var(--brand-coral)' :
    tier === 'moderate' ? '#E89A45' : '#9BD08A'
  const tierLabel = tier === 'high' ? 'HIGH' : tier === 'moderate' ? 'MOD' : 'LOW'
  return (
    <div
      className="flex items-center justify-between rounded-xl bg-[rgba(238,228,200,0.04)] px-3.5 py-3"
      style={{ border: `1px solid ${color}55` }}
    >
      <div>
        <div className="mb-1 font-fragment text-[10px] font-bold tracking-[0.18em] text-[rgba(238,228,200,0.6)]">
          FATIGUE LOAD
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="font-clash text-[28px] leading-none tracking-[-0.02em]"
            style={{ color }}
          >
            {load}
          </span>
          <span
            className="font-fragment text-[10px] font-bold tracking-[0.18em]"
            style={{ color }}
          >
            {tierLabel}
          </span>
        </div>
      </div>
      <div className="max-w-[140px] text-right font-satoshi text-[11.5px] leading-[1.4] text-[rgba(238,228,200,0.5)]">
        From sprint count + distance per minute over the last 7 days.
      </div>
    </div>
  )
}
