'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle } from 'lucide-react'
import { sessions, players, matchAnalyses, highlights, pitches } from '@/lib/mockData'
import type { MatchAnalysis, Player, Highlight, InjuryFlag } from '@/lib/types'
import { BRAND, TYPE, COLORS } from '@/lib/constants'
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

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 220 }} /> })

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
    <div style={{
      background: BRAND.sand,
      padding: '14px 28px 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily: TYPE.body,
    }}>
      <button onClick={onBack} className="v3-cta" style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: BRAND.indigo, fontSize: 14,
        fontFamily: TYPE.mono, letterSpacing: '0.16em', fontWeight: 600,
        padding: '4px 0',
        display: 'flex', alignItems: 'center', gap: 8,
      }} aria-label="Back to matches">
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
    <div style={{
      padding: '14px 28px 22px',
      borderBottom: `1px solid ${BRAND.line}`,
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      background: BRAND.sand,
      flexWrap: 'wrap',
    }}>
      <div style={{ fontFamily: TYPE.display, fontSize: 32, color: BRAND.indigo, letterSpacing: '0.02em' }}>{homeName.toUpperCase()}</div>
      {hasScore ? (
        <div style={{ fontFamily: TYPE.display, fontSize: 44, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 10, color: BRAND.indigo }}>
          <span style={{ position: 'relative', display: 'inline-block' }}>
            {/* yellow swatch behind the winning team's goal count (or both, if draw) */}
            {(homeWon || drew) && (
              <span style={{ position: 'absolute', inset: '-8px -10px', background: BRAND.yellow, borderRadius: 4, zIndex: 0 }} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{homeGoals}</span>
          </span>
          <span style={{ color: BRAND.indigoMute, fontSize: 24 }}>-</span>
          <span style={{ position: 'relative', display: 'inline-block', color: homeWon ? BRAND.indigoMid : BRAND.indigo }}>
            {(drew || (!homeWon && homeGoals !== awayGoals)) && (
              <span style={{ position: 'absolute', inset: '-8px -10px', background: BRAND.yellow, borderRadius: 4, zIndex: 0 }} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{awayGoals}</span>
          </span>
        </div>
      ) : (
        <div style={{ fontFamily: TYPE.mono, fontSize: 11, letterSpacing: '0.18em', color: BRAND.indigoMute, fontWeight: 700 }}>
          VS
        </div>
      )}
      <div style={{ fontFamily: TYPE.display, fontSize: 32, color: BRAND.indigoMute, letterSpacing: '0.02em' }}>{awayName.toUpperCase()}</div>
      <div style={{ width: 1, height: 28, background: BRAND.line, marginLeft: 6 }} />
      <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em', color: BRAND.indigoMute }}>
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
    <div style={{
      padding: '20px 28px 22px',
      borderBottom: `1px solid ${BRAND.line}`,
      background: BRAND.sand,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 11, letterSpacing: '0.22em', color: BRAND.indigoMute, fontWeight: 700 }}>
          MATCH IN NUMBERS
        </div>
        <div style={{ display: 'flex', gap: 14, fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.16em', color: BRAND.indigoMute }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: BRAND.indigo }} /> {homeName.toUpperCase()}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: BRAND.indigoMute }} /> {awayName.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32, rowGap: 10 }}>
        {rows.map(({ key, label, suffix }) => {
          const h = stats.home[key]
          const a = stats.away[key]
          const total = h + a || 1
          const homePct = (h / total) * 100
          const awayPct = (a / total) * 100
          const homeWon = h > a
          const drew = h === a
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.16em', color: BRAND.indigoMute, fontWeight: 700 }}>
                <span style={{ color: BRAND.indigo, fontFamily: TYPE.display, fontSize: 18, letterSpacing: '-0.01em' }}>{h}{suffix}</span>
                <span>{label}</span>
                <span style={{ color: BRAND.indigo, fontFamily: TYPE.display, fontSize: 18, letterSpacing: '-0.01em' }}>{a}{suffix}</span>
              </div>
              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: BRAND.indigoSoft }}>
                <div style={{
                  width: `${homePct}%`,
                  background: homeWon ? BRAND.indigo : drew ? BRAND.indigoMid : BRAND.indigoMid,
                  position: 'relative',
                }}>
                  {/* yellow leading-tip when home wins this stat */}
                  {homeWon && (
                    <span style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, background: BRAND.yellow }} />
                  )}
                </div>
                <div style={{ width: 1, background: BRAND.sand }} />
                <div style={{
                  width: `${awayPct}%`,
                  background: !homeWon && !drew ? BRAND.indigo : BRAND.indigoMute,
                  position: 'relative',
                }}>
                  {!homeWon && !drew && (
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: BRAND.yellow }} />
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
      className="v3-row"
      onClick={() => onSelect(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}
      style={{
        animationDelay: `${100 + idx * 35}ms`,
        display: 'grid',
        gridTemplateColumns: ROSTER_GRID_DESKTOP,
        alignItems: 'center', gap: 16, padding: '14px 4px',
        borderBottom: `1px solid ${BRAND.line}`, cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div className="v3-num" style={{
          width: 36, height: 36, borderRadius: 8,
          background: exceptional ? BRAND.yellow : BRAND.paper,
          border: `1.5px solid ${exceptional ? BRAND.indigo : BRAND.line}`,
          color: BRAND.indigo, fontFamily: TYPE.display, fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{p.jerseyNumber}</div>
        {/* Fatigue dot — top-right of jersey badge. Coral when high,
         *  yellow when moderate, hidden when low (or no sample). */}
        {fatigueColor && fatigue !== 'low' && (
          <div
            title={`Fatigue: ${fatigue}`}
            style={{
              position: 'absolute', top: -2, right: -2,
              width: 10, height: 10, borderRadius: '50%',
              background: fatigueColor,
              border: `2px solid ${BRAND.sand}`,
            }}
          />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: TYPE.body, fontSize: 14, fontWeight: 600, color: BRAND.indigo, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {p.firstName} {p.lastName}
          {exceptional && <span style={{ fontSize: 10, color: BRAND.indigo, background: BRAND.yellow, padding: '1px 5px', borderRadius: 2, fontFamily: TYPE.mono, letterSpacing: '0.12em', fontWeight: 700 }}>★ MOTM</span>}
          {/* Inline event chips — moments without a dedicated column */}
          {uniqueChips.map((type, i) => {
            const m = eventMeta[type] || { letter: '·' }
            const isGoal = type === 'goal'
            return (
              <span key={i} title={m.label} style={{
                fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.12em', fontWeight: 700,
                padding: '2px 5px',
                background: isGoal ? BRAND.yellow : BRAND.indigoSoft,
                color: BRAND.indigo,
                borderRadius: 3,
              }}>{m.letter}</span>
            )
          })}
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.16em', color: BRAND.indigoMute, marginTop: 2 }}>
          {(p.position[0] || '').toUpperCase()}
        </div>
      </div>

      {/* Composite score */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: TYPE.display, fontSize: 22, color: c, letterSpacing: '-0.02em', lineHeight: 1 }}>{a.compositeScore}</div>
      </div>

      {/* Distance — universal stat */}
      <div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.16em', color: BRAND.indigoMute, fontWeight: 700 }}>DISTANCE</div>
        <div style={{ fontFamily: TYPE.display, fontSize: 17, color: BRAND.indigo, letterSpacing: '-0.01em', lineHeight: 1.1, marginTop: 2 }}>
          {a.distanceCovered.toFixed(1)} km
        </div>
      </div>

      {/* Key stat 1 — position-aware */}
      <div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.16em', color: BRAND.indigoMute, fontWeight: 700 }}>{ks1.label}</div>
        <div style={{ fontFamily: TYPE.display, fontSize: 17, color: BRAND.indigo, letterSpacing: '-0.01em', lineHeight: 1.1, marginTop: 2 }}>
          {ks1.value}{ks1.suffix}
        </div>
      </div>

      {/* Key stat 2 — position-aware */}
      <div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.16em', color: BRAND.indigoMute, fontWeight: 700 }}>{ks2.label}</div>
        <div style={{ fontFamily: TYPE.display, fontSize: 17, color: BRAND.indigo, letterSpacing: '-0.01em', lineHeight: 1.1, marginTop: 2 }}>
          {ks2.value}{ks2.suffix}
        </div>
      </div>

      <div className="v3-arrow" style={{ color: BRAND.indigo, fontSize: 16, fontFamily: TYPE.body }}>→</div>
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
      className="v3-row"
      onClick={() => onSelect(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}
      style={{
        animationDelay: `${100 + idx * 28}ms`,
        display: 'grid',
        gridTemplateColumns: '40px 1fr 60px 24px',
        alignItems: 'center', gap: 16, padding: '12px 4px',
        borderBottom: `1px solid ${BRAND.line}`, cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div className="v3-num" style={{
          width: 32, height: 32, borderRadius: 8,
          background: exceptional ? BRAND.yellow : BRAND.paper,
          border: `1.5px solid ${exceptional ? BRAND.indigo : BRAND.line}`,
          color: BRAND.indigo, fontFamily: TYPE.display, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{p.jerseyNumber}</div>
        {fatigueColor && fatigue !== 'low' && (
          <div
            title={`Fatigue: ${fatigue}`}
            style={{
              position: 'absolute', top: -2, right: -2,
              width: 9, height: 9, borderRadius: '50%',
              background: fatigueColor,
              border: `2px solid ${BRAND.sand}`,
            }}
          />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: TYPE.body, fontSize: 13.5, fontWeight: 600, color: BRAND.indigo, display: 'flex', alignItems: 'center', gap: 6 }}>
          {p.firstName} {p.lastName}
          {exceptional && <span style={{ fontSize: 9, color: BRAND.indigo, background: BRAND.yellow, padding: '1px 4px', borderRadius: 2, fontFamily: TYPE.mono, letterSpacing: '0.12em', fontWeight: 700 }}>★</span>}
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.16em', color: BRAND.indigoMute, marginTop: 2 }}>
          {(p.position[0] || '').toUpperCase()} · {row.events.length} {row.events.length === 1 ? 'MOMENT' : 'MOMENTS'}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: TYPE.display, fontSize: 22, color: c, letterSpacing: '-0.02em', lineHeight: 1 }}>{a.compositeScore}</div>
      </div>

      <div className="v3-arrow" style={{ color: BRAND.indigo, fontSize: 16, fontFamily: TYPE.body, opacity: 1, transform: 'translateX(0)' }}>→</div>
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
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '12px 4px 10px', gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {accentColor && (
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                background: accentColor,
                border: accent === 'B' ? `1.5px solid ${BRAND.indigo}` : 'none',
              }} aria-hidden />
            )}
            <span style={{ fontFamily: TYPE.display, fontSize: isMobile ? 20 : 24, color: BRAND.indigo, letterSpacing: '-0.01em' }}>{title}</span>
            <span style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.16em', color: BRAND.indigoMute, fontWeight: 700 }}>
              {rows.length} {rows.length === 1 ? 'PLAYER' : 'PLAYERS'}
            </span>
          </div>
          {typeof avg === 'number' && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.18em', color: BRAND.indigoMute, fontWeight: 700 }}>AVG</span>
              <span style={{ fontFamily: TYPE.display, fontSize: 22, color: scoreValueColor(avg), letterSpacing: '-0.02em' }}>{avg}</span>
            </div>
          )}
        </div>
      )}

      {/* column header — desktop has shared headers for # / NAME / SCORE only;
          stat cells self-label per row so they can vary by position. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '40px 1fr 60px 24px' : ROSTER_GRID_DESKTOP,
        gap: 16,
        padding: '8px 4px', borderBottom: `1px solid ${BRAND.line}`,
        fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.18em', color: BRAND.indigoMute,
      }}>
        {isMobile ? (
          <>
            <div>#</div><div>NAME · POS</div><div style={{ textAlign: 'right' }}>SCORE</div><div></div>
          </>
        ) : (
          <>
            <div>#</div><div>NAME · POS</div><div style={{ textAlign: 'right' }}>SCORE</div><div></div><div></div><div></div><div></div>
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
    <div style={{
      height: '100%',
      overflowY: 'auto',
      background: BRAND.sand,
      color: BRAND.indigo,
      fontFamily: TYPE.body,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 24px',
        background: BRAND.indigo, color: BRAND.sand,
        position: 'sticky', top: 0, zIndex: 2,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: BRAND.sand, color: BRAND.indigo,
          fontFamily: TYPE.display, fontSize: 18, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: exceptional ? `0 0 0 2px ${BRAND.yellow}` : 'none',
          flexShrink: 0,
        }}>{p.jerseyNumber}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TYPE.display, fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            {p.firstName} {p.lastName}
          </div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em', color: 'rgba(238,228,200,0.7)', marginTop: 4 }}>
            #{p.jerseyNumber} · {(p.position[0] || '').toUpperCase()} · {a.minutesPlayed ?? '-'}&apos;
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="v3-cta"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(238,228,200,0.10)', color: BRAND.sand,
            border: `1px solid rgba(238,228,200,0.2)`,
            fontSize: 16, cursor: 'pointer', flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* Composite score band */}
      <div style={{
        padding: '24px',
        display: 'flex', alignItems: 'center', gap: 18,
        borderBottom: `1px solid ${BRAND.line}`,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          border: `4px solid ${compositeColor}`,
          background: BRAND.paper,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: TYPE.display, fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', color: compositeColor }}>{a.compositeScore}</div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 8.5, letterSpacing: '0.2em', color: BRAND.indigoMute, marginTop: 4 }}>SCORE</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700 }}>SESSION SCORE</div>
          <div style={{ fontFamily: TYPE.display, fontSize: 24, marginTop: 4, letterSpacing: '-0.01em' }}>
            {a.compositeScore >= 85 ? 'Exceptional.' : a.compositeScore >= 75 ? 'Strong session.' : a.compositeScore >= 60 ? 'Solid.' : 'Room to grow.'}
          </div>
          {exceptional && (
            <div style={{
              display: 'inline-block',
              marginTop: 8,
              padding: '4px 10px',
              background: BRAND.yellow, color: BRAND.indigo,
              fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.18em', fontWeight: 700,
              borderRadius: 4,
            }}>★ MOTM</div>
          )}
        </div>
      </div>

      {/* Fatigue tile — sits below the composite band as a peer metric. */}
      <div style={{ padding: '0 24px 20px', borderBottom: `1px solid ${BRAND.line}` }}>
        <FatigueTile samples={fatigueSamples} size="wide" />
      </div>

      {/* Performance Radar */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 8 }}>PERFORMANCE RADAR</div>
        <div style={{ background: BRAND.paper, borderRadius: 12, padding: 12, border: `1px solid ${BRAND.line}` }}>
          <RadarChartDynamic data={radarData} height={isMobile ? 240 : 280} />
        </div>
      </div>

      {/* Category Grades */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 10 }}>CATEGORY GRADES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {grades.map(({ label, score }) => {
            const { grade, color } = getGrade(score)
            return (
              <div key={label} style={{
                background: BRAND.paper, border: `1px solid ${BRAND.line}`,
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: BRAND.indigoMute, fontFamily: TYPE.mono, letterSpacing: '0.12em' }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily: TYPE.display, fontSize: 22, color: BRAND.indigo, marginTop: 2, letterSpacing: '-0.01em' }}>{score}</div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
                }}>{grade}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Physical Details */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 10 }}>PHYSICAL</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Distance', value: `${a.distanceCovered.toFixed(1)} km` },
            { label: 'Top Speed', value: `${a.topSpeed.toFixed(1)} km/h` },
            { label: 'Sprints', value: `${a.sprintCount}` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 10,
              padding: '12px 8px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: TYPE.display, fontSize: 18, fontWeight: 700, color: BRAND.indigo, letterSpacing: '-0.01em' }}>{value}</div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.16em', color: BRAND.indigoMute, marginTop: 4 }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Welfare — flag injury button + list of any injury flags
       *  already logged for this player in this session. */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700 }}>
            INJURY MOMENTS
          </div>
          <button
            type="button"
            onClick={() => setInjurySheetOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              border: `1px solid ${BRAND.coral}`,
              borderRadius: 6,
              background: 'transparent',
              color: BRAND.coral,
              fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.16em',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            <AlertTriangle size={11} />
            FLAG INJURY
          </button>
        </div>
        {playerInjuries.length === 0 ? (
          <div style={{ fontFamily: TYPE.body, fontSize: 12.5, color: BRAND.indigoMute }}>
            No injury moments flagged this match.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {playerInjuries.map(inj => (
              <div
                key={inj.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px',
                  background: BRAND.paper,
                  border: `1px solid ${BRAND.line}`,
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.16em',
                    color: BRAND.coral, fontWeight: 700,
                  }}
                >
                  {inj.minute}&apos;
                </span>
                <span
                  style={{
                    fontFamily: TYPE.body, fontSize: 12.5,
                    color: BRAND.indigo, textTransform: 'capitalize',
                  }}
                >
                  {inj.type}
                </span>
                <span
                  style={{
                    fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.14em',
                    color: BRAND.indigoMute, fontWeight: 700,
                  }}
                >
                  SEV {inj.severity}
                </span>
                {inj.notes && (
                  <span
                    style={{
                      fontFamily: TYPE.body, fontSize: 12, color: BRAND.indigoMid,
                      flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
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
      <div style={{ padding: '20px 24px 32px' }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 8 }}>SESSION NOTES</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={`Add notes about ${p.firstName}...`}
          style={{
            width: '100%', minHeight: 90,
            border: `1px solid ${BRAND.line}`, background: BRAND.paper,
            borderRadius: 10, padding: 12,
            fontSize: 14, color: BRAND.indigo,
            resize: 'vertical', fontFamily: TYPE.body, boxSizing: 'border-box',
          }}
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
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(11,8,40,0.45)',
          zIndex: 90,
          animation: 'v3-backdrop-in 180ms ease-out both',
        }}
      />
      {/* panel: takeover on mobile, slide-in 460px on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? '100vw' : 460,
          background: BRAND.sand,
          boxShadow: '-8px 0 32px rgba(11,8,40,0.18)',
          zIndex: 100,
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
      <div style={{ background: BRAND.sand, minHeight: '100vh', padding: 40, color: BRAND.indigo, fontFamily: TYPE.body }}>
        <style dangerouslySetInnerHTML={{ __html: v3Motion }} />
        <div style={{ fontFamily: TYPE.display, fontSize: 32 }}>Session not found</div>
        <button onClick={() => router.back()} style={{ marginTop: 20 }}>Go back</button>
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
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: BRAND.sand,
      color: BRAND.indigo,
      fontFamily: TYPE.body,
      display: 'flex',
      flexDirection: 'column',
    }}>
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

      <V3MatchStats stats={gameTeamStats[sessionId]} homeName={homeName} awayName={awayName} />

      {/* Roster — both layouts share it; on mobile it falls below the reel */}
      <div style={{ background: BRAND.sand, padding: isMobile ? '20px 18px 32px' : '24px 28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: TYPE.mono, fontSize: 11, letterSpacing: '0.22em', color: BRAND.indigoMute, fontWeight: 700 }}>
              {isTeamSplit
                ? `TRAINING MATCH · ${playerRows.length} PLAYERS`
                : `SQUAD · ${playerRows.length} PLAYERS`}
            </div>
            <div style={{ fontFamily: TYPE.display, fontSize: isMobile ? 22 : 32, color: BRAND.indigo, marginTop: 2, letterSpacing: '-0.01em' }}>
              {isTeamSplit ? 'Who lined up where.' : 'Who did what at a glance.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ROSTER_SORT_DEFS.map(({ key, label }) => {
              const active = rosterSort === key
              return (
                <button
                  key={key}
                  onClick={() => setRosterSort(key)}
                  className={active ? '' : 'v3-pill'}
                  style={{
                    background: active ? BRAND.indigo : 'transparent',
                    color: active ? BRAND.sand : BRAND.indigo,
                    border: `1px solid ${active ? BRAND.indigo : BRAND.line}`,
                    padding: '6px 11px', borderRadius: 999,
                    fontFamily: TYPE.body, fontSize: 11.5, fontWeight: active ? 600 : 500,
                    cursor: 'pointer', transition: 'all 160ms ease',
                  }}
                >{label}</button>
              )
            })}
          </div>
        </div>

        <div data-tour-id="match-drillin-roster">
          {isTeamSplit ? (
            <>
              <V3RosterSection title="Team A" rows={teamARows} avg={teamAvg(teamARows)} accent="A" isMobile={isMobile} onSelect={setSelectedPlayerId} />
              <div style={{ height: 18 }} />
              <V3RosterSection title="Team B" rows={teamBRows} avg={teamAvg(teamBRows)} accent="B" isMobile={isMobile} onSelect={setSelectedPlayerId} />
            </>
          ) : (
            <V3RosterSection rows={sortedPlayerRows} isMobile={isMobile} onSelect={setSelectedPlayerId} />
          )}
        </div>
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
