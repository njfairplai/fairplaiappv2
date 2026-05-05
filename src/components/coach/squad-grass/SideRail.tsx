'use client'

import { useState, useMemo, useEffect, type Dispatch, type SetStateAction } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronRight, X } from 'lucide-react'

import type { Player, MatchAnalysis, RadarDataItem } from '@/lib/types'
import { matchAnalyses, sessions } from '@/lib/mockData'
import { scoreColor, type SeasonScore } from '@/lib/squad-season-score'
import { getKeyStats, aggregateSeasonAnalysis } from '@/lib/squad-position-stats'

// Recharts is heavy + client-only — load on demand. Same component the
// match + player pages use so the radar reads identically across the app.
const RadarChartDynamic = dynamic(
  () => import('@/components/charts/RadarChart'),
  { ssr: false, loading: () => <div style={{ height: 240 }} /> },
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
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 30,
        }}
      />

      {/* panel */}
      <aside
        role="dialog"
        aria-label={player ? `${player.firstName} ${player.lastName} player profile` : 'Player profile'}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 92vw)',
          background: 'var(--brand-indigo)',
          borderLeft: '1px solid rgba(238, 228, 200, 0.08)',
          color: 'var(--brand-sand)',
          fontFamily: 'var(--font-body)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 240ms ease',
          zIndex: 31,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.35)',
          overflowY: 'auto',
        }}
      >
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 14px 14px 18px',
          borderBottom: '1px solid rgba(238, 228, 200, 0.08)',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(238, 228, 200, 0.08)',
            border: `2px solid ${c}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            color: 'var(--brand-sand)',
            flexShrink: 0,
          }}
        >
          {player.jerseyNumber}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              lineHeight: 1.05,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {player.firstName} {player.lastName}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'rgba(238, 228, 200, 0.6)',
              marginTop: 3,
            }}
          >
            {player.position.join(' · ')} · #{player.jerseyNumber}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player panel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid rgba(238, 228, 200, 0.15)',
            color: 'var(--brand-sand)',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* primary CTAs — pinned to the top of the body so the coach can deep-
          link to the profile or IDP without scrolling through the summary. */}
      <div style={{ padding: '14px 18px 0', display: 'flex', gap: 8 }}>
        <Link
          href={`/coach/web/player/${player.id}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: 12,
            background: 'var(--brand-yellow)',
            color: '#0B0828',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          View full profile <ChevronRight size={14} />
        </Link>
        <Link
          href={`/coach/web/idps?player=${player.id}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: 12,
            background: 'transparent',
            color: 'var(--brand-sand)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            border: '1px solid rgba(238, 228, 200, 0.25)',
            borderRadius: 8,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Open IDP <ChevronRight size={14} />
        </Link>
      </div>

      {/* Scope dropdown: drives the score, radar, and stats below. Defaults
          to Last session; coach can switch to Last 5 matches or Whole season. */}
      <div style={{ padding: '14px 18px 0' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(238, 228, 200, 0.06)',
            border: '1px solid rgba(238, 228, 200, 0.16)',
            borderRadius: 8,
            padding: '6px 10px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.18em',
              color: 'rgba(238, 228, 200, 0.6)',
              fontWeight: 700,
            }}
          >
            SCOPE
          </span>
          <select
            value={scope}
            onChange={e => setScope(e.target.value as StatScope)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--brand-sand)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              paddingRight: 14,
            }}
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
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* headline score + trend */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 88,
              lineHeight: 0.85,
              color: c,
              letterSpacing: '-0.02em',
            }}
          >
            {headlineScore || '—'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'rgba(238, 228, 200, 0.6)',
              letterSpacing: '0.12em',
            }}
          >
            {isLast ? 'LAST' : isLast5 ? 'LAST 5' : 'SEASON'}<br />SCORE
          </div>
          {(season.matches > 0 || last) && (
            <div
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: trend >= 0 ? '#9BD08A' : '#EB4D6D',
                fontWeight: 700,
                textAlign: 'right',
              }}
            >
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}<br />
              <span style={{ color: 'rgba(238, 228, 200, 0.5)', fontWeight: 400 }}>
                {isLast ? 'vs season avg' : isLast5 ? 'vs season avg' : 'vs recent'}
              </span>
            </div>
          )}
        </div>

        {/* fairplai read */}
        <div
          style={{
            padding: '14px 14px 14px 16px',
            background: 'rgba(252, 215, 24, 0.06)',
            borderLeft: '2px solid var(--brand-yellow)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: 1.55,
            color: 'rgba(238, 228, 200, 0.92)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'var(--brand-yellow)',
              marginBottom: 4,
            }}
          >
            FAIRPLAI READ
          </div>
          {readForPlayer(player, season, last, isLast)}
        </div>

        {/* radar — 6 categories, identical to the analysis page */}
        <div style={{ background: 'rgba(238, 228, 200, 0.04)', borderRadius: 12, padding: '8px 4px' }}>
          <RadarChartDynamic data={radarData} height={260} />
        </div>

        {/* stats */}
        <div>
          {stats.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(238, 228, 200, 0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  color: 'rgba(238, 228, 200, 0.6)',
                  textTransform: 'uppercase',
                }}
              >
                {k}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{v}</span>
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
