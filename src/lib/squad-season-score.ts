import { matchAnalyses, sessions } from '@/lib/mockData'
import type { MatchAnalysis } from '@/lib/types'

export interface SeasonScore {
  /** Mean composite across every match in scope. 0 if no matches. */
  avg: number
  /** Number of matches included in the average. */
  matches: number
  /** Last-N (default 5) average — for trend / recent form. */
  recent: number
  /** avg minus the season mean over all OTHER players (used for ▲▼ trend). */
  trendVsLast?: number
}

/** Filter MatchAnalysis records to "match-type" sessions (drops drill-only sessions). */
function matchTypeSessionIds(): Set<string> {
  return new Set(
    sessions
      .filter(s => s.type === 'match' || s.type === 'training_match')
      .map(s => s.id),
  )
}

/** Aggregate a single player's season score from every match they played in.
 *  V1 just averages the composite across all matches. Minutes-weighted later. */
export function getSeasonScore(playerId: string, recentN = 5): SeasonScore {
  const matchIds = matchTypeSessionIds()
  const records: MatchAnalysis[] = matchAnalyses
    .filter(a => a.playerId === playerId && matchIds.has(a.sessionId))
  if (records.length === 0) {
    return { avg: 0, matches: 0, recent: 0 }
  }
  const sum = records.reduce((acc, r) => acc + r.compositeScore, 0)
  const avg = Math.round(sum / records.length)
  // "Recent" = last N records by sessionId (sessions are id-ordered chronologically
  // in the mock data; sort defensively just in case).
  const sorted = [...records].sort((a, b) => a.sessionId.localeCompare(b.sessionId))
  const tail = sorted.slice(-recentN)
  const recent = Math.round(tail.reduce((acc, r) => acc + r.compositeScore, 0) / tail.length)
  return { avg, matches: records.length, recent, trendVsLast: recent - avg }
}

/** Map of playerId → SeasonScore. Compute once per render in the page. */
export function getSeasonScoresFor(playerIds: string[]): Record<string, SeasonScore> {
  const out: Record<string, SeasonScore> = {}
  for (const id of playerIds) out[id] = getSeasonScore(id)
  return out
}

/** Standard score-band colour. Matches the existing mobile squad page thresholds. */
export function scoreColor(score: number): string {
  if (score >= 75) return '#10B981' // green
  if (score >= 60) return '#F59E0B' // amber
  return '#EF4444' // red
}
