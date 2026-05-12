'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle } from 'lucide-react'
import { sessions, players, matchAnalyses, highlights, pitches } from '@/lib/mockData'
import type { MatchAnalysis, Player, Highlight, InjuryFlag } from '@/lib/types'
import { BRAND, COLORS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { getKeyStats } from '@/lib/squad-position-stats'
import {
  getInjuryFlagsForSession,
  getLatestFatigueByPlayer,
  getFatigueSamplesForPlayer,
  fatigueTier,
  type FatigueTier,
} from '@/lib/parent-portal'
import { InjurySheet } from '@/components/coach/match-center/InjurySheet'
import { FatigueTile } from '@/components/welfare/FatigueTile'
import { MatchVideoPanel } from '@/components/video/MatchVideoPanel'
import { DEMO_MATCH_VIDEO_URL, DEMO_MATCH_OVERLAY_URL } from '@/lib/demo-video'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div className="h-[220px]" /> })

/* ──────────────────────────────────────────────────────────────────
   Coach Match Analysis (Direction C — sand-first redesign).
   Visual language: sand surface, indigo structure, yellow earns its keep.
   ────────────────────────────────────────────────────────────────── */

/* ── Hardcoded match scores (mirrors current page) ── */
const gameScores: Record<string, { homeGoals: number; awayGoals: number }> = {
  session_005: { homeGoals: 2, awayGoals: 1 },
  session_006: { homeGoals: 1, awayGoals: 2 },
  session_007: { homeGoals: 3, awayGoals: 1 },
  session_010: { homeGoals: 0, awayGoals: 0 },
  session_013: { homeGoals: 2, awayGoals: 0 },
  session_014: { homeGoals: 3, awayGoals: 2 },
}

/* ── Team stats per session — mirrors legacy [sessionId]/page.tsx so the v3
 * route shows the same comparison data once we wire it in. */
type TeamStat = { possession: number; passAccuracy: number; shotsOnTarget: number; tackles: number; intercepts: number }
const gameTeamStats: Record<string, { home: TeamStat; away: TeamStat }> = {
  session_005: { home: { possession: 58, passAccuracy: 81, shotsOnTarget: 6, tackles: 15, intercepts: 22 }, away: { possession: 42, passAccuracy: 68, shotsOnTarget: 3, tackles: 12, intercepts: 18 } },
  session_006: { home: { possession: 48, passAccuracy: 72, shotsOnTarget: 5, tackles: 16, intercepts: 24 }, away: { possession: 52, passAccuracy: 75, shotsOnTarget: 7, tackles: 19, intercepts: 28 } },
  session_007: { home: { possession: 54, passAccuracy: 78, shotsOnTarget: 8, tackles: 18, intercepts: 26 }, away: { possession: 46, passAccuracy: 65, shotsOnTarget: 4, tackles: 14, intercepts: 19 } },
  session_010: { home: { possession: 51, passAccuracy: 74, shotsOnTarget: 4, tackles: 20, intercepts: 25 }, away: { possession: 49, passAccuracy: 71, shotsOnTarget: 3, tackles: 17, intercepts: 22 } },
  session_013: { home: { possession: 62, passAccuracy: 84, shotsOnTarget: 9, tackles: 14, intercepts: 30 }, away: { possession: 38, passAccuracy: 62, shotsOnTarget: 2, tackles: 11, intercepts: 16 } },
  session_014: { home: { possession: 55, passAccuracy: 77, shotsOnTarget: 10, tackles: 16, intercepts: 27 }, away: { possession: 45, passAccuracy: 70, shotsOnTarget: 7, tackles: 18, intercepts: 23 } },
}

/** Stable team-stats fallback for analysed sessions we haven't hand-
 *  authored entries for. Seeds off the sessionId so the same match
 *  always shows the same numbers — possession sums to 100, the rest
 *  sit in plausible per-match ranges. Demo-only; real analyser will
 *  hydrate these from the AI run. */
function getOrSynthTeamStats(sessionId: string): { home: TeamStat; away: TeamStat } {
  const known = gameTeamStats[sessionId]
  if (known) return known
  let seed = 0
  for (let i = 0; i < sessionId.length; i++) seed = (seed * 31 + sessionId.charCodeAt(i)) >>> 0
  const rng = (n: number, range: number, base: number) => base + (((seed >>> (n * 3)) & 0xff) % range)
  const homePoss = rng(0, 21, 44)
  return {
    home: {
      possession: homePoss,
      passAccuracy: rng(1, 22, 64),
      shotsOnTarget: rng(2, 10, 3),
      tackles: rng(3, 12, 12),
      intercepts: rng(4, 16, 16),
    },
    away: {
      possession: 100 - homePoss,
      passAccuracy: rng(5, 22, 60),
      shotsOnTarget: rng(6, 9, 2),
      tackles: rng(7, 12, 10),
      intercepts: rng(8, 14, 14),
    },
  }
}

/* ── Helpers ── */
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatDateMeta(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()].toUpperCase()} ${d.getDate()} ${monthAbbr[d.getMonth()]}`
}

/** Score values: keep traffic-light semantics (red/yellow/green) for clarity per locked plan. */
function scoreValueColor(score: number): string {
  if (score >= 80) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}

/** "Exceptional" tier per v3 — drives MOTM treatment. */
function isExceptional(score: number): boolean {
  return score >= 85
}

/** Compute a "key stats" line that surfaces 1-2 facts that show why this player
 *  stood out vs the squad: top-1, top-3, or X above squad avg. Templated until
 *  Coach Mikel ships AI-generated copy. */
function keyStatsForHighlight(
  h: Pick<Highlight, 'eventType'>,
  a: MatchAnalysis | undefined,
  squad: MatchAnalysis[],
): string {
  if (!a || squad.length === 0) {
    return 'Stats not available for this player yet.'
  }
  // Helpers for squad-relative ranking.
  const rank = (key: keyof MatchAnalysis): { rank: number; total: number } => {
    const value = a[key] as number
    const sorted = [...squad].map(x => x[key] as number).sort((x, y) => y - x)
    return { rank: sorted.indexOf(value) + 1, total: sorted.length }
  }
  const avg = (key: keyof MatchAnalysis): number => {
    const sum = squad.reduce((s, x) => s + (x[key] as number), 0)
    return Math.round(sum / squad.length)
  }
  const ordinal = (n: number): string => {
    if (n === 1) return 'highest'
    if (n === 2) return 'second-highest'
    if (n === 3) return 'third-highest'
    return `#${n}`
  }
  const km = a.distanceCovered.toFixed(1)
  const kmh = a.topSpeed.toFixed(1)
  const compRank = rank('compositeScore')
  const speedRank = rank('topSpeed')
  const passRank = rank('passCompletion')
  const defRank = rank('defendingScore')
  const posRank = rank('positionalScore')
  const sprintRank = rank('sprintCount')
  const passAvg = avg('passCompletion')
  const defAvg = avg('defendingScore')

  switch (h.eventType) {
    case 'goal': {
      const headline = compRank.rank <= 3
        ? `Composite ${a.compositeScore}, ${ordinal(compRank.rank)} in the squad today.`
        : `Composite ${a.compositeScore} this match.`
      const second = speedRank.rank <= 3
        ? `Top speed ${kmh} km/h, ${ordinal(speedRank.rank)} sprint of the day.`
        : `Top speed ${kmh} km/h.`
      return `${headline} ${second}`
    }
    case 'key_pass': {
      const diff = a.passCompletion - passAvg
      const above = diff > 0 ? `, ${diff} above squad avg ${passAvg}%` : ''
      return `Pass completion ${a.passCompletion}%${above}. Passing score ${a.passingScore} today.`
    }
    case 'sprint_recovery':
      return `${a.sprintCount} sprints (${ordinal(sprintRank.rank)} on the squad). Top speed ${kmh} km/h, ${km} km covered.`
    case 'tackle': {
      const diff = a.defendingScore - defAvg
      const above = diff > 0 ? `, ${diff} above squad avg ${defAvg}` : ''
      return `Defending score ${a.defendingScore}${above}. ${a.sprintCount} sprints this match.`
    }
    case 'save':
      return `Positional score ${a.positionalScore} (${ordinal(posRank.rank)} on the squad). ${km} km covered, ${a.sprintCount} sprints.`
    default:
      return `Composite ${a.compositeScore} (${ordinal(compRank.rank)} on the squad). Defending ${a.defendingScore}, passing ${a.passCompletion}%.`
  }
}

/** Map highlight event type → v3 letter + label. */
const eventMeta: Record<string, { letter: string; label: string; isWarning?: boolean }> = {
  goal:             { letter: 'G', label: 'GOAL' },
  key_pass:         { letter: 'A', label: 'KEY PASS' },
  sprint_recovery:  { letter: 'P', label: 'PRESS' },
  tackle:           { letter: 'T', label: 'TACKLE' },
  save:             { letter: 'S', label: 'SAVE' },
}

/* ─────────── Motion (inline <style>) ─────────── */
const v3Motion = `
@keyframes v3-track-draw { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
@keyframes v3-pin-pop    { 0% { transform: translate(-50%,-50%) scale(0); opacity:0 } 60% { transform: translate(-50%,-50%) scale(1.18); opacity:1 } 100% { transform: translate(-50%,-50%) scale(1); opacity:1 } }
@keyframes v3-row-rise   { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: translateY(0) } }
@keyframes v3-pulse-ring { 0% { transform: translate(-50%,-50%) scale(0.6); opacity:0.6 } 100% { transform: translate(-50%,-50%) scale(2.2); opacity:0 } }
@keyframes v3-playhead   { 0%,100% { opacity:0.55 } 50% { opacity:1 } }
@keyframes v3-panel-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes v3-panel-up    { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes v3-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
.v3-row { animation: v3-row-rise .42s cubic-bezier(.2,.7,.2,1) both; }
.v3-pin { animation: v3-pin-pop .38s cubic-bezier(.2,1.4,.4,1) both; }
.v3-track-line { stroke-dasharray: 1200; animation: v3-track-draw 900ms cubic-bezier(.6,0,.2,1) 80ms both; }
.v3-pulse-ring { animation: v3-pulse-ring 1.6s ease-out infinite; }
.v3-playhead { animation: v3-playhead 1.6s ease-in-out infinite; }
.v3-row .v3-stripe, .v3-row .v3-num, .v3-row .v3-arrow { transition: all 220ms cubic-bezier(.2,.7,.3,1); }
.v3-row:hover { background: rgba(27,21,80,0.025); }
.v3-row:hover .v3-stripe { filter: brightness(0.9); }
.v3-row:hover .v3-num    { background: ${BRAND.indigo}; color: ${BRAND.sand}; transform: scale(1.04); }
.v3-row .v3-arrow { opacity: 0; transform: translateX(-4px); }
.v3-row:hover .v3-arrow { opacity: 1; transform: translateX(0); }
.v3-cta { transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease; }
.v3-cta:hover { transform: translateY(-1px); }
.v3-cta:active { transform: translateY(0); }
.v3-pill:hover { background: rgba(27,21,80,0.06); }
`

/* ─────────────────── Back row ───────────────────
 * Replaces the redundant V3Header band. The existing coach layout
 * already provides the brand mark and the Coach's Hub / Video /
 * Analysis / Squad / IDPs nav. We just need a back-link + a place
 * for the "Share recap" CTA, both on the sand surface so they
 * read as part of the v3 page, not the platform chrome.
 */
/* Back row — just "Back to matches".
 *
 * The earlier version carried "Watch full match" (routing to a stub
 * /coach/web/video page) and "Share recap" (opening the WhatsApp recap
 * modal). Both dropped: Watch was wired to the wrong destination, and
 * sharing competes with the action surface elsewhere in the app. The
 * roster + player detail surfaces here are about review, not export. */
function V3BackRow({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3.5 bg-brand-sand px-7 pt-3.5 pb-1 font-satoshi">
      <button
        onClick={onBack}
        className="v3-cta flex items-center gap-2 border-none bg-transparent px-0 py-1 font-fragment text-sm font-semibold tracking-[0.16em] text-brand-indigo cursor-pointer"
        aria-label="Back to matches"
      >
        ← BACK TO MATCHES
      </button>
    </div>
  )
}

type RosterSortKey = 'score' | 'position'

const ROSTER_SORT_DEFS: { key: RosterSortKey; label: string }[] = [
  { key: 'score',    label: 'Score ↓' },
  { key: 'position', label: 'Position' },
]

/* ─────────────────── Score strip ─────────────────── */
/* Score strip — team names, goal count, FT meta. The filter pills that
 *  used to live here drove the (now removed) timeline below. With the
 *  timeline gone, the pills had no purpose. */
function V3ScoreStrip({
  homeName, awayName, homeGoals, awayGoals, hasScore, dateLabel, venue,
}: {
  homeName: string; awayName: string;
  homeGoals: number; awayGoals: number;
  /** When false, the team-score row is suppressed (a "0 - 0" header on a
   *  match with no GAME_SCORES entry + no events read as a broken state). */
  hasScore: boolean;
  dateLabel: string; venue: string;
}) {
  const homeWon = homeGoals > awayGoals
  const drew = homeGoals === awayGoals
  return (
    <div className="flex flex-wrap items-center gap-[18px] border-b border-brand-line bg-brand-sand px-7 pt-3.5 pb-[22px]">
      <div className="font-clash text-[32px] tracking-[0.02em] text-brand-indigo">{homeName.toUpperCase()}</div>
      {hasScore ? (
        <div className="flex items-baseline gap-2.5 font-clash text-[44px] tracking-[-0.02em] text-brand-indigo">
          <span className="relative inline-block">
            {/* yellow swatch behind the winning team's goal count (or both, if draw) */}
            {(homeWon || drew) && (
              <span className="absolute inset-[-8px_-10px] z-0 rounded-[4px] bg-brand-yellow" />
            )}
            <span className="relative z-[1]">{homeGoals}</span>
          </span>
          <span className="text-2xl text-brand-indigo-mute">-</span>
          <span
            className={cn('relative inline-block', homeWon ? 'text-brand-indigo-mid' : 'text-brand-indigo')}
          >
            {(drew || (!homeWon && homeGoals !== awayGoals)) && (
              <span className="absolute inset-[-8px_-10px] z-0 rounded-[4px] bg-brand-yellow" />
            )}
            <span className="relative z-[1]">{awayGoals}</span>
          </span>
        </div>
      ) : (
        <div className="font-fragment text-[11px] font-bold tracking-[0.18em] text-brand-indigo-mute">
          VS
        </div>
      )}
      <div className="font-clash text-[32px] tracking-[0.02em] text-brand-indigo-mute">{awayName.toUpperCase()}</div>
      <div className="ml-1.5 h-7 w-px bg-brand-line" />
      <div className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute">
        {hasScore ? `FT · ${dateLabel} · ${venue}` : `${dateLabel} · ${venue}`}
      </div>

    </div>
  )
}

/* ─────────────────── Match stats strip ───────────────────
 * Five paired bars (possession, pass accuracy, shots on target, tackles,
 * intercepts) reading the same data the legacy sidebar showed, but folded
 * into the page narrative below the score strip. Indigo for the home team,
 * indigoMute for the away — the leading bar gets a yellow tip so the eye
 * lands on who won each duel. */
function V3MatchStats({ stats, homeName, awayName }: {
  stats: { home: TeamStat; away: TeamStat } | undefined
  homeName: string
  awayName: string
}) {
  if (!stats) return null
  const rows: { key: keyof TeamStat; label: string; suffix: string }[] = [
    { key: 'possession',    label: 'POSSESSION',     suffix: '%' },
    { key: 'passAccuracy',  label: 'PASS ACCURACY',  suffix: '%' },
    { key: 'shotsOnTarget', label: 'SHOTS ON TARGET', suffix: '' },
    { key: 'tackles',       label: 'TACKLES',         suffix: '' },
    { key: 'intercepts',    label: 'INTERCEPTS',      suffix: '' },
  ]
  return (
    <div className="flex flex-col gap-3 border-b border-brand-line bg-brand-sand px-7 pt-5 pb-[22px]">
      <div className="flex flex-wrap items-baseline justify-between gap-3.5">
        <div className="font-fragment text-[11px] font-bold tracking-[0.22em] text-brand-indigo-mute">
          MATCH IN NUMBERS
        </div>
        <div className="flex gap-3.5 font-fragment text-[9.5px] tracking-[0.16em] text-brand-indigo-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-brand-indigo" /> {homeName.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-brand-indigo-mute" /> {awayName.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
        {rows.map(({ key, label, suffix }) => {
          const h = stats.home[key]
          const a = stats.away[key]
          const total = h + a || 1
          const homePct = (h / total) * 100
          const awayPct = (a / total) * 100
          const homeWon = h > a
          const drew = h === a
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-fragment text-[9.5px] font-bold tracking-[0.16em] text-brand-indigo-mute">
                <span className="font-clash text-lg tracking-[-0.01em] text-brand-indigo">{h}{suffix}</span>
                <span>{label}</span>
                <span className="font-clash text-lg tracking-[-0.01em] text-brand-indigo">{a}{suffix}</span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-[3px] bg-brand-indigo-soft">
                <div
                  className={cn('relative', homeWon ? 'bg-brand-indigo' : 'bg-brand-indigo-mid')}
                  style={{ width: `${homePct}%` }}
                >
                  {/* yellow leading-tip when home wins this stat */}
                  {homeWon && (
                    <span className="absolute top-0 right-0 bottom-0 w-1 bg-brand-yellow" />
                  )}
                </div>
                <div className="w-px bg-brand-sand" />
                <div
                  className={cn('relative', !homeWon && !drew ? 'bg-brand-indigo' : 'bg-brand-indigo-mute')}
                  style={{ width: `${awayPct}%` }}
                >
                  {!homeWon && !drew && (
                    <span className="absolute top-0 bottom-0 left-0 w-1 bg-brand-yellow" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* Per-event item used by the page's data-building logic. Drives the
 *  per-player event tags on each roster row. The earlier match drill-in
 *  also rendered a horizontal Timeline + ClipPanel keyed off this type;
 *  both surfaces are gone now (clips live on /coach/web/highlights), so
 *  TLEvent only feeds the roster's secondary signals. */
type TLEvent = { id: string; t: number; type: string; playerId: string; isGoal: boolean; isWarning: boolean }

/* Per-player row used by the roster + player detail panels. The events
 *  list drives the per-row event tags ("2G 1A" style) so the coach can
 *  scan who did what without diving into the player detail. */
type PlayerRow = {
  player: Player
  analysis: MatchAnalysis
  events: TLEvent[]
  /** Most-recent fatigue tier from welfare-store, undefined if no sample. */
  fatigue?: FatigueTier
}

/** Map a fatigue tier to a dot color. Subtle on the row so it doesn't
 *  fight the composite-score colour, but visible enough to scan. */
function fatigueDotColor(tier: FatigueTier | undefined): string | null {
  if (!tier) return null
  if (tier === 'high') return BRAND.coral
  if (tier === 'moderate') return BRAND.yellow
  return 'transparent' // low — no dot, keeps row clean
}

/* Desktop roster grid template — jersey, name, position, composite,
 *  event tags, chevron. Used by both V3RosterRow and the section header
 *  so they stay aligned. */
const ROSTER_GRID_DESKTOP = '40px minmax(160px, 1fr) 60px 80px 100px 100px 24px'

function V3RosterRow({ row, idx, onSelect }: {
  row: PlayerRow; idx: number;
  onSelect: (playerId: string) => void;
}) {
  const { player: p, analysis: a, events, fatigue } = row
  const c = scoreValueColor(a.compositeScore)
  const exceptional = isExceptional(a.compositeScore)
  const [ks1, ks2] = getKeyStats(p.position[0] || 'CM', a)
  const fatigueColor = fatigueDotColor(fatigue)
  // Dedupe event chips by type so a player with two goals shows one G chip,
  // not two — they read as "what kind of moments did this player have."
  const uniqueChips = Array.from(new Set(events.map(e => e.type))).slice(0, 3)
  return (
    <div
      className="v3-row relative grid cursor-pointer items-center gap-4 border-b border-brand-line px-1 py-3.5"
      onClick={() => onSelect(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}
      style={{
        animationDelay: `${100 + idx * 35}ms`,
        gridTemplateColumns: ROSTER_GRID_DESKTOP,
      }}
    >
      <div className="relative">
        <div
          className={cn(
            'v3-num flex h-9 w-9 items-center justify-center rounded-lg font-clash text-[15px] text-brand-indigo',
            exceptional ? 'bg-brand-yellow border-[1.5px] border-brand-indigo' : 'bg-brand-paper border-[1.5px] border-brand-line',
          )}
        >{p.jerseyNumber}</div>
        {/* Fatigue dot — top-right of jersey badge. Coral when high,
         *  yellow when moderate, hidden when low (or no sample). */}
        {fatigueColor && fatigue !== 'low' && (
          <div
            title={`Fatigue: ${fatigue}`}
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-sand"
            style={{ background: fatigueColor }}
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 font-satoshi text-sm font-semibold text-brand-indigo">
          {p.firstName} {p.lastName}
          {exceptional && <span className="rounded-[2px] bg-brand-yellow px-1.5 py-px font-fragment text-[10px] font-bold tracking-[0.12em] text-brand-indigo">★ MOTM</span>}
          {/* Inline event chips — moments without a dedicated column */}
          {uniqueChips.map((type, i) => {
            const m = eventMeta[type] || { letter: '·' }
            const isGoal = type === 'goal'
            return (
              <span
                key={i}
                title={m.label}
                className={cn(
                  'rounded-[3px] px-1.5 py-px font-fragment text-[9px] font-bold tracking-[0.12em] text-brand-indigo',
                  isGoal ? 'bg-brand-yellow' : 'bg-brand-indigo-soft',
                )}
              >{m.letter}</span>
            )
          })}
        </div>
        <div className="mt-0.5 font-fragment text-[9.5px] tracking-[0.16em] text-brand-indigo-mute">
          {(p.position[0] || '').toUpperCase()}
        </div>
      </div>

      {/* Composite score */}
      <div className="text-right">
        <div className="font-clash text-[22px] leading-none tracking-[-0.02em]" style={{ color: c }}>{a.compositeScore}</div>
      </div>

      {/* Distance — universal stat */}
      <div>
        <div className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">DISTANCE</div>
        <div className="mt-0.5 font-clash text-[17px] leading-[1.1] tracking-[-0.01em] text-brand-indigo">
          {a.distanceCovered.toFixed(1)} km
        </div>
      </div>

      {/* Key stat 1 — position-aware */}
      <div>
        <div className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">{ks1.label}</div>
        <div className="mt-0.5 font-clash text-[17px] leading-[1.1] tracking-[-0.01em] text-brand-indigo">
          {ks1.value}{ks1.suffix}
        </div>
      </div>

      {/* Key stat 2 — position-aware */}
      <div>
        <div className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">{ks2.label}</div>
        <div className="mt-0.5 font-clash text-[17px] leading-[1.1] tracking-[-0.01em] text-brand-indigo">
          {ks2.value}{ks2.suffix}
        </div>
      </div>

      <div className="v3-arrow font-satoshi text-base text-brand-indigo">→</div>
    </div>
  )
}

/* ─────────────────── Roster row (mobile) ─────────────────── */
function V3RosterRowMobile({ row, idx, onSelect }: {
  row: PlayerRow; idx: number;
  onSelect: (playerId: string) => void;
}) {
  const { player: p, analysis: a, fatigue } = row
  const c = scoreValueColor(a.compositeScore)
  const exceptional = isExceptional(a.compositeScore)
  const fatigueColor = fatigueDotColor(fatigue)
  return (
    <div
      className="v3-row grid cursor-pointer items-center gap-4 border-b border-brand-line px-1 py-3"
      onClick={() => onSelect(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}
      style={{
        animationDelay: `${100 + idx * 28}ms`,
        gridTemplateColumns: '40px 1fr 60px 24px',
      }}
    >
      <div className="relative">
        <div
          className={cn(
            'v3-num flex h-8 w-8 items-center justify-center rounded-lg font-clash text-[13px] text-brand-indigo',
            exceptional ? 'bg-brand-yellow border-[1.5px] border-brand-indigo' : 'bg-brand-paper border-[1.5px] border-brand-line',
          )}
        >{p.jerseyNumber}</div>
        {fatigueColor && fatigue !== 'low' && (
          <div
            title={`Fatigue: ${fatigue}`}
            className="absolute -top-0.5 -right-0.5 h-[9px] w-[9px] rounded-full border-2 border-brand-sand"
            style={{ background: fatigueColor }}
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-satoshi text-[13.5px] font-semibold text-brand-indigo">
          {p.firstName} {p.lastName}
          {exceptional && <span className="rounded-[2px] bg-brand-yellow px-1 py-px font-fragment text-[9px] font-bold tracking-[0.12em] text-brand-indigo">★</span>}
        </div>
        <div className="mt-0.5 font-fragment text-[9px] tracking-[0.16em] text-brand-indigo-mute">
          {(p.position[0] || '').toUpperCase()} · {row.events.length} {row.events.length === 1 ? 'MOMENT' : 'MOMENTS'}
        </div>
      </div>

      <div className="text-right">
        <div className="font-clash text-[22px] leading-none tracking-[-0.02em]" style={{ color: c }}>{a.compositeScore}</div>
      </div>

      <div className="v3-arrow font-satoshi text-base text-brand-indigo" style={{ opacity: 1, transform: 'translateX(0)' }}>→</div>
    </div>
  )
}

/* ─────────────────── Roster section (single team or one of A/B) ───────────────────
 * Owns the column header + the list of rows. When called twice (training match),
 * each section gets its own sub-header (Team A / Team B) with avg score and a
 * yellow / indigo accent square. The sort pills above the section apply to both. */
function V3RosterSection({ title, rows, avg, accent, isMobile, onSelect }: {
  title?: string
  rows: PlayerRow[]
  avg?: number
  accent?: 'A' | 'B'
  isMobile: boolean
  onSelect: (playerId: string) => void
}) {
  const showHeader = !!title
  const accentColor = accent === 'A' ? BRAND.yellow : accent === 'B' ? BRAND.indigo : null
  return (
    <div>
      {showHeader && (
        <div className="flex flex-wrap items-baseline justify-between gap-2.5 px-1 pt-3 pb-2.5">
          <div className="flex items-center gap-2.5">
            {accentColor && (
              <span
                className={cn('h-3.5 w-3.5 rounded-[3px]', accent === 'B' && 'border-[1.5px] border-brand-indigo')}
                style={{ background: accentColor }}
                aria-hidden
              />
            )}
            <span className={cn('font-clash tracking-[-0.01em] text-brand-indigo', isMobile ? 'text-xl' : 'text-2xl')}>{title}</span>
            <span className="font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-indigo-mute">
              {rows.length} {rows.length === 1 ? 'PLAYER' : 'PLAYERS'}
            </span>
          </div>
          {typeof avg === 'number' && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">AVG</span>
              <span className="font-clash text-[22px] tracking-[-0.02em]" style={{ color: scoreValueColor(avg) }}>{avg}</span>
            </div>
          )}
        </div>
      )}

      {/* column header — desktop has shared headers for # / NAME / SCORE only;
          stat cells self-label per row so they can vary by position. */}
      <div
        className="grid gap-4 border-b border-brand-line px-1 py-2 font-fragment text-[9.5px] tracking-[0.18em] text-brand-indigo-mute"
        style={{ gridTemplateColumns: isMobile ? '40px 1fr 60px 24px' : ROSTER_GRID_DESKTOP }}
      >
        {isMobile ? (
          <>
            <div>#</div><div>NAME · POS</div><div className="text-right">SCORE</div><div></div>
          </>
        ) : (
          <>
            <div>#</div><div>NAME · POS</div><div className="text-right">SCORE</div><div></div><div></div><div></div><div></div>
          </>
        )}
      </div>

      {rows.map((r, i) =>
        isMobile ? (
          <V3RosterRowMobile key={r.player.id} row={r} idx={i} onSelect={onSelect} />
        ) : (
          <V3RosterRow key={r.player.id} row={r} idx={i} onSelect={onSelect} />
        )
      )}
    </div>
  )
}

/* ─────────────────── Player detail panel ─────────────────── */
/** Letter grade + colour band for a category score (0–100). */
function getGrade(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: 'A', color: COLORS.success }
  if (score >= 70) return { grade: 'B', color: COLORS.success }
  if (score >= 60) return { grade: 'C', color: COLORS.warning }
  if (score >= 50) return { grade: 'D', color: COLORS.warning }
  return { grade: 'F', color: COLORS.error }
}

/** Mobile detection — full-page takeover on phones, slide-in on desktop. */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = () => setIsMobile(m.matches)
    handler()
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

function V3PlayerDetail({
  row,
  sessionInjuries,
  onClose,
  onWelfareChange,
}: {
  row: PlayerRow
  /** Injury flags filtered to this session — V3PlayerDetail filters again
   *  to this player so the panel shows only relevant rows. */
  sessionInjuries: InjuryFlag[]
  onClose: () => void
  /** Called when a new injury is logged so the parent page re-reads. */
  onWelfareChange: () => void
}) {
  const { player: p, analysis: a } = row
  const isMobile = useIsMobile()
  const compositeColor = scoreValueColor(a.compositeScore)
  const exceptional = isExceptional(a.compositeScore)
  const [injurySheetOpen, setInjurySheetOpen] = useState(false)
  const playerInjuries = sessionInjuries.filter(i => i.playerId === p.id)

  // Fatigue samples (mock 0–100 from welfare-store) — hydrated client-side
  // so SSR + client match. Sorted oldest → newest for FatigueTile's trend.
  const [fatigueSamples, setFatigueSamples] = useState<
    ReturnType<typeof getFatigueSamplesForPlayer>
  >([])
  useEffect(() => {
    setFatigueSamples(
      [...getFatigueSamplesForPlayer(p.id)].sort((s1, s2) =>
        s1.date.localeCompare(s2.date),
      ),
    )
  }, [p.id])

  // Season average not tracked per-match in mock data — use composite as a placeholder.
  // Real implementation will pull this from PlayerSeasonStats.
  const radarData = [
    { category: 'Physical',   score: a.physicalScore,   avg: a.compositeScore },
    { category: 'Passing',    score: a.passingScore,    avg: a.compositeScore },
    { category: 'Dribbling',  score: a.dribblingScore,  avg: a.compositeScore },
    { category: 'Defending',  score: a.defendingScore,  avg: a.compositeScore },
    { category: 'Control',    score: a.controlScore,    avg: a.compositeScore },
    { category: 'Positional', score: a.positionalScore, avg: a.compositeScore },
  ]

  const grades = [
    { label: 'Physical', score: a.physicalScore },
    { label: 'Passing', score: a.passingScore },
    { label: 'Dribbling', score: a.dribblingScore },
    { label: 'Defending', score: a.defendingScore },
    { label: 'Control', score: a.controlScore },
    { label: 'Positional', score: a.positionalScore },
  ]

  // Persisted per-session, per-player coach notes (mirrors the existing match page pattern).
  const noteKey = `fairplai_player_session_note_${a.sessionId}_${p.id}`
  const [note, setNote] = useState<string>('')
  useEffect(() => {
    if (typeof window === 'undefined') return
    // SSR-safe localStorage hydration. Sync setState in effect is the
    // right shape here — same pattern used across the brand surfaces.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(window.localStorage.getItem(noteKey) ?? '')
  }, [noteKey])
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (note) window.localStorage.setItem(noteKey, note)
  }, [note, noteKey])

  // Common panel content (header + score + radar + grades + physical + notes)
  const content = (
    <div className="h-full overflow-y-auto bg-brand-sand font-satoshi text-brand-indigo">
      {/* Header */}
      <div className="sticky top-0 z-[2] flex items-center gap-3 bg-brand-indigo px-6 py-5 text-brand-sand">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-sand font-clash text-lg font-bold text-brand-indigo"
          style={{ boxShadow: exceptional ? `0 0 0 2px ${BRAND.yellow}` : 'none' }}
        >{p.jerseyNumber}</div>
        <div className="min-w-0 flex-1">
          <div className="font-clash text-[22px] leading-[1.1] tracking-[-0.01em]">
            {p.firstName} {p.lastName}
          </div>
          <div className="mt-1 font-fragment text-[10.5px] tracking-[0.18em] text-brand-sand/70">
            #{p.jerseyNumber} · {(p.position[0] || '').toUpperCase()} · {a.minutesPlayed ?? '-'}&apos;
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="v3-cta flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(238,228,200,0.2)] bg-[rgba(238,228,200,0.10)] text-base text-brand-sand"
        >×</button>
      </div>

      {/* Composite score band */}
      <div className="flex items-center gap-[18px] border-b border-brand-line p-6">
        <div
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-brand-paper"
          style={{ border: `4px solid ${compositeColor}` }}
        >
          <div className="font-clash text-[34px] leading-none tracking-[-0.02em]" style={{ color: compositeColor }}>{a.compositeScore}</div>
          <div className="mt-1 font-fragment text-[8.5px] tracking-[0.2em] text-brand-indigo-mute">SCORE</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-fragment text-[10.5px] font-bold tracking-[0.2em] text-brand-indigo-mute">SESSION SCORE</div>
          <div className="mt-1 font-clash text-2xl tracking-[-0.01em]">
            {a.compositeScore >= 85 ? 'Exceptional.' : a.compositeScore >= 75 ? 'Strong session.' : a.compositeScore >= 60 ? 'Solid.' : 'Room to grow.'}
          </div>
          {exceptional && (
            <div className="mt-2 inline-block rounded-[4px] bg-brand-yellow px-2.5 py-1 font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo">★ MOTM</div>
          )}
        </div>
      </div>

      {/* Fatigue tile — sits below the composite band as a peer metric. */}
      <div className="border-b border-brand-line px-6 pb-5">
        <FatigueTile samples={fatigueSamples} size="wide" />
      </div>

      {/* Performance Radar */}
      <div className="border-b border-brand-line px-6 py-5">
        <div className="mb-2 font-fragment text-[10.5px] font-bold tracking-[0.2em] text-brand-indigo-mute">PERFORMANCE RADAR</div>
        <div className="rounded-xl border border-brand-line bg-brand-paper p-3">
          <RadarChartDynamic data={radarData} height={isMobile ? 240 : 280} />
        </div>
      </div>

      {/* Category Grades */}
      <div className="border-b border-brand-line px-6 py-5">
        <div className="mb-2.5 font-fragment text-[10.5px] font-bold tracking-[0.2em] text-brand-indigo-mute">CATEGORY GRADES</div>
        <div className="grid grid-cols-2 gap-2">
          {grades.map(({ label, score }) => {
            const { grade, color } = getGrade(score)
            return (
              <div key={label} className="flex items-center justify-between gap-2.5 rounded-[10px] border border-brand-line bg-brand-paper px-3.5 py-3">
                <div>
                  <div className="font-fragment text-xs tracking-[0.12em] text-brand-indigo-mute">{label.toUpperCase()}</div>
                  <div className="mt-0.5 font-clash text-[22px] tracking-[-0.01em] text-brand-indigo">{score}</div>
                </div>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg font-clash text-base font-extrabold"
                  style={{ background: `${color}1A`, color }}
                >{grade}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Physical Details */}
      <div className="border-b border-brand-line px-6 py-5">
        <div className="mb-2.5 font-fragment text-[10.5px] font-bold tracking-[0.2em] text-brand-indigo-mute">PHYSICAL</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Distance', value: `${a.distanceCovered.toFixed(1)} km` },
            { label: 'Top Speed', value: `${a.topSpeed.toFixed(1)} km/h` },
            { label: 'Sprints', value: `${a.sprintCount}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[10px] border border-brand-line bg-brand-paper px-2 py-3 text-center">
              <div className="font-clash text-lg font-bold tracking-[-0.01em] text-brand-indigo">{value}</div>
              <div className="mt-1 font-fragment text-[9.5px] tracking-[0.16em] text-brand-indigo-mute">{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Welfare — flag injury button + list of any injury flags
       *  already logged for this player in this session. */}
      <div className="border-b border-brand-line px-6 py-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="font-fragment text-[10.5px] font-bold tracking-[0.2em] text-brand-indigo-mute">
            INJURY MOMENTS
          </div>
          <button
            type="button"
            onClick={() => setInjurySheetOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-brand-coral bg-transparent px-3 py-1.5 font-fragment text-[10.5px] font-bold tracking-[0.16em] text-brand-coral"
          >
            <AlertTriangle size={11} />
            FLAG INJURY
          </button>
        </div>
        {playerInjuries.length === 0 ? (
          <div className="font-satoshi text-[12.5px] text-brand-indigo-mute">
            No injury moments flagged this match.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {playerInjuries.map(inj => (
              <div
                key={inj.id}
                className="flex items-center gap-2.5 rounded-lg border border-brand-line bg-brand-paper px-2.5 py-2"
              >
                <span className="font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-coral">
                  {inj.minute}&apos;
                </span>
                <span className="font-satoshi text-[12.5px] capitalize text-brand-indigo">
                  {inj.type}
                </span>
                <span className="font-fragment text-[9.5px] font-bold tracking-[0.14em] text-brand-indigo-mute">
                  SEV {inj.severity}
                </span>
                {inj.notes && (
                  <span
                    className="min-w-0 flex-1 overflow-hidden font-satoshi text-xs text-brand-indigo-mid text-ellipsis whitespace-nowrap"
                    title={inj.notes}
                  >
                    · {inj.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coach notes */}
      <div className="px-6 pt-5 pb-8">
        <div className="mb-2 font-fragment text-[10.5px] font-bold tracking-[0.2em] text-brand-indigo-mute">SESSION NOTES</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={`Add notes about ${p.firstName}...`}
          className="box-border w-full min-h-[90px] resize-y rounded-[10px] border border-brand-line bg-brand-paper p-3 font-satoshi text-sm text-brand-indigo"
        />
      </div>

      <InjurySheet
        open={injurySheetOpen}
        sessionId={a.sessionId}
        playerId={p.id}
        playerName={`${p.firstName} ${p.lastName}`}
        onClose={() => setInjurySheetOpen(false)}
        onSaved={onWelfareChange}
      />
    </div>
  )

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-[rgba(11,8,40,0.45)]"
        style={{ animation: 'v3-backdrop-in 180ms ease-out both' }}
      />
      {/* panel: takeover on mobile, slide-in 460px on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 bottom-0 z-[100] bg-brand-sand shadow-[-8px_0_32px_rgba(11,8,40,0.18)]"
        style={{
          width: isMobile ? '100vw' : 460,
          animation: isMobile
            ? 'v3-panel-up 280ms cubic-bezier(.2,.7,.2,1) both'
            : 'v3-panel-right 280ms cubic-bezier(.2,.7,.2,1) both',
        }}
      >
        {content}
      </div>
    </>
  )
}


/* ─────────────────── Page ─────────────────── */
export default function CoachMatchAnalysisPage() {
  const params = useParams<{ sessionId: string }>()
  const router = useRouter()
  const sessionId = params?.sessionId ?? ''

  const session = useMemo(() => sessions.find(s => s.id === sessionId), [sessionId])

  // Compute roster rows from real data
  const sessionAnalyses = useMemo(() => matchAnalyses.filter(a => a.sessionId === sessionId), [sessionId])

  // Highlights live in a separate top-level export, joined by sessionId.
  const sessionHighlights = useMemo(() => highlights.filter(h => h.sessionId === sessionId), [sessionId])

  // Aggregate timeline events across all highlights for the session
  const allEvents: TLEvent[] = useMemo(
    () => sessionHighlights
      .map(h => ({
        id: h.id,
        t: h.timestampSeconds / 60, // seconds → minutes
        type: h.eventType,
        playerId: h.playerId,
        isGoal: h.eventType === 'goal',
        isWarning: false,
      }))
      .sort((a, b) => a.t - b.t),
    [sessionHighlights],
  )

  // Welfare overlay — fatigue tier per player + injury flags for the
  // session. `welfareTick` is bumped from the InjurySheet's onSaved so
  // the panel re-reads localStorage without a full page reload.
  const [welfareTick, setWelfareTick] = useState(0)
  const fatigueByPlayer = useMemo(
    () => getLatestFatigueByPlayer(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [welfareTick],
  )
  const sessionInjuries: InjuryFlag[] = useMemo(
    () => getInjuryFlagsForSession(sessionId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, welfareTick],
  )

  // Player rows always show all players; their per-row event ticks/tags filter
  // along with the timeline so the page reads as one coordinated filter state.
  const buildPlayerRows = (events: TLEvent[]): PlayerRow[] => {
    const rows: PlayerRow[] = []
    for (const a of sessionAnalyses) {
      const p = players.find(pl => pl.id === a.playerId)
      if (!p) continue
      const evs: TLEvent[] = events.filter(e => e.playerId === a.playerId)
      const sample = fatigueByPlayer[a.playerId]
      const row: PlayerRow = { player: p, analysis: a, events: evs }
      if (sample) row.fatigue = fatigueTier(sample.load)
      rows.push(row)
    }
    return rows.sort((a, b) => b.analysis.compositeScore - a.analysis.compositeScore)
  }
  const playerRows: PlayerRow[] = useMemo(
    () => buildPlayerRows(allEvents),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionAnalyses, allEvents, fatigueByPlayer],
  )

  const totalMin = useMemo(() => {
    if (!session) return 70
    const [sh, sm] = session.startTime.split(':').map(Number)
    const [eh, em] = session.endTime.split(':').map(Number)
    return Math.max(20, (eh * 60 + em) - (sh * 60 + sm))
  }, [session])

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [rosterSort, setRosterSort] = useState<RosterSortKey>('score')
  const isMobile = useIsMobile()

  /* Roster sort — score (composite desc) or position (alphabetical
   *  by primary position with composite as a tiebreaker). The earlier
   *  filter axis (Goals / Key passes / Tackles / Saves) drove the now-
   *  removed timeline; with that gone, the roster always shows the
   *  full per-player event list. */
  const sortRows = (rows: PlayerRow[]): PlayerRow[] => {
    const next = [...rows]
    switch (rosterSort) {
      case 'score':
        return next.sort((a, b) => b.analysis.compositeScore - a.analysis.compositeScore)
      case 'position':
        return next.sort((a, b) => {
          const ap = (a.player.position[0] || '').toString()
          const bp = (b.player.position[0] || '').toString()
          if (ap !== bp) return ap.localeCompare(bp)
          return b.analysis.compositeScore - a.analysis.compositeScore
        })
      default:
        return next
    }
  }
  const sortedPlayerRows: PlayerRow[] = useMemo(
    () => sortRows(playerRows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerRows, rosterSort],
  )

  // Detect a training-match split (any analysis has teamAssignment set).
  // For competitive matches, render a single squad list; for training,
  // two stacked sections with their own avg score.
  const isTeamSplit = sessionAnalyses.some(a => a.teamAssignment === 'A' || a.teamAssignment === 'B')
  const teamARows = useMemo(() => sortRows(playerRows.filter(r => r.analysis.teamAssignment === 'A')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerRows, rosterSort])
  const teamBRows = useMemo(() => sortRows(playerRows.filter(r => r.analysis.teamAssignment === 'B')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerRows, rosterSort])
  const teamAvg = (rows: PlayerRow[]): number => rows.length === 0
    ? 0
    : Math.round(rows.reduce((s, r) => s + r.analysis.compositeScore, 0) / rows.length)

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-sand p-10 font-satoshi text-brand-indigo">
        <style dangerouslySetInnerHTML={{ __html: v3Motion }} />
        <div className="font-clash text-[32px]">Session not found</div>
        <button onClick={() => router.back()} className="mt-5">Go back</button>
      </div>
    )
  }

  // Header / score strip data
  const score = gameScores[sessionId]
  const homeName = 'Lions U13' // placeholder — real roster name would come from rosters/squad
  const awayName = session.opponent ?? 'Training B'
  const dateLabel = formatDateMeta(session.date)
  const venue = pitches.find(p => p.id === session.pitchId)?.name ?? 'Academy Pitch'
  const homeGoals = score?.homeGoals ?? 0
  const awayGoals = score?.awayGoals ?? 0

  return (
    <div className="flex min-h-screen w-full flex-col bg-brand-sand font-satoshi text-brand-indigo">
      <style dangerouslySetInnerHTML={{ __html: v3Motion }} />

      <V3BackRow onBack={() => router.back()} />

      {/* Same layout on desktop + mobile now that the highlights/clip
       *  surfaces have been removed. The score strip, team stats, and
       *  roster reflow naturally; no mobile-specific reel needed. */}
      <V3ScoreStrip
        homeName={homeName}
        awayName={awayName}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        hasScore={!!score}
        dateLabel={dateLabel}
        venue={venue}
      />

      <V3MatchStats stats={getOrSynthTeamStats(sessionId)} homeName={homeName} awayName={awayName} />

      {/* Watch full match — renders for every analysed session. Sessions
       *  with their own footage use it; the rest fall back to the demo
       *  asset so coaches always see a "play full match" affordance with
       *  real video behind it. Standard ↔ AI Overlay toggle defaults to
       *  overlay because the AI moment is the demo's wow. */}
      {session.status === 'analysed' && (
        <div className={cn(isMobile ? 'px-[18px] pb-3' : 'px-7 pb-4')}>
          <MatchVideoPanel
            rawUrl={session.matchVideoUrl ?? DEMO_MATCH_VIDEO_URL}
            overlayUrl={session.matchOverlayUrl ?? DEMO_MATCH_OVERLAY_URL}
          />
        </div>
      )}

      {/* Roster — both layouts share it; on mobile it falls below the reel */}
      <div className={cn('bg-brand-sand', isMobile ? 'px-[18px] pt-5 pb-8' : 'px-7 pt-6 pb-8')}>
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-fragment text-[11px] font-bold tracking-[0.22em] text-brand-indigo-mute">
              {isTeamSplit
                ? `TRAINING MATCH · ${playerRows.length} PLAYERS`
                : `SQUAD · ${playerRows.length} PLAYERS`}
            </div>
            <div className={cn('mt-0.5 font-clash tracking-[-0.01em] text-brand-indigo', isMobile ? 'text-[22px]' : 'text-[32px]')}>
              {isTeamSplit ? 'Who lined up where.' : 'Who did what at a glance.'}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ROSTER_SORT_DEFS.map(({ key, label }) => {
              const active = rosterSort === key
              return (
                <button
                  key={key}
                  onClick={() => setRosterSort(key)}
                  className={cn(
                    'cursor-pointer rounded-full border px-[11px] py-1.5 font-satoshi text-[11.5px] transition-all duration-150',
                    active
                      ? 'border-brand-indigo bg-brand-indigo font-semibold text-brand-sand'
                      : 'v3-pill border-brand-line bg-transparent font-medium text-brand-indigo',
                  )}
                >{label}</button>
              )
            })}
          </div>
        </div>

        {isTeamSplit ? (
          <>
            <V3RosterSection title="Team A" rows={teamARows} avg={teamAvg(teamARows)} accent="A" isMobile={isMobile} onSelect={setSelectedPlayerId} />
            <div className="h-[18px]" />
            <V3RosterSection title="Team B" rows={teamBRows} avg={teamAvg(teamBRows)} accent="B" isMobile={isMobile} onSelect={setSelectedPlayerId} />
          </>
        ) : (
          <V3RosterSection rows={sortedPlayerRows} isMobile={isMobile} onSelect={setSelectedPlayerId} />
        )}
      </div>

      {/* Player detail panel (slide-in on desktop, takeover on mobile) */}
      {selectedPlayerId && (() => {
        const row = playerRows.find(r => r.player.id === selectedPlayerId)
        if (!row) return null
        return (
          <V3PlayerDetail
            row={row}
            sessionInjuries={sessionInjuries}
            onClose={() => setSelectedPlayerId(null)}
            onWelfareChange={() => setWelfareTick(t => t + 1)}
          />
        )
      })()}
    </div>
  )
}
