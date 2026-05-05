import { matchAnalyses, sessions, highlights } from '@/lib/mockData'
import type { MatchAnalysis, Session, Highlight } from '@/lib/types'

/**
 * One match-frame in a player's season. Drives the filmstrip + per-match
 * detail panel on the player profile.
 */
export interface ProgressionFrame {
  md: number               // matchday index (1-based, season-relative)
  sessionId: string
  date: string             // YYYY-MM-DD (raw session.date)
  shortDate: string        // "Mar 15" formatted for display
  opp: string              // opponent name or "Training"
  score: number            // composite score for this match
  result: 'W' | 'L' | 'D' | '·'
  motm: boolean
  poor: boolean
  dnp: boolean
  upcoming: boolean
  kind: 'comp' | 'training'
  g: number                // goal count from highlights
  a: number                // assist proxy — goals + key_pass count for this player in this session (no real assist field)
  note?: string
}

/** Hardcoded match scores — mirrors the match page so opponent W/L matches. */
const GAME_SCORES: Record<string, { homeGoals: number; awayGoals: number }> = {
  session_005: { homeGoals: 2, awayGoals: 1 },
  session_006: { homeGoals: 1, awayGoals: 2 },
  session_007: { homeGoals: 3, awayGoals: 1 },
  session_010: { homeGoals: 0, awayGoals: 0 },
  session_013: { homeGoals: 2, awayGoals: 0 },
  session_014: { homeGoals: 3, awayGoals: 2 },
  session_021: { homeGoals: 2, awayGoals: 1 },
  session_022: { homeGoals: 1, awayGoals: 1 },
}

/** Format a YYYY-MM-DD date as "MMM DD". */
function formatShortDate(iso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [, m, d] = iso.split('-').map(Number) as [number, number, number]
  return `${months[(m ?? 1) - 1]} ${String(d).padStart(2, '0')}`
}

/** Derive W/L/D for the home roster based on session.opponent + GAME_SCORES. */
function deriveResult(s: Session): 'W' | 'L' | 'D' | '·' {
  const sc = GAME_SCORES[s.id]
  if (!sc) return '·'
  if (sc.homeGoals > sc.awayGoals) return 'W'
  if (sc.homeGoals < sc.awayGoals) return 'L'
  return 'D'
}

/**
 * Build a player's full season progression from sessions + MatchAnalysis records.
 *
 * Includes BOTH competitive matches AND training matches. Both get scored,
 * tracked, and clipped — they only differ visually in the filmstrip
 * (training frames have a darker bg + a "T" sprocket marker + a TRAINING
 * footer instead of a W/L result dot). Sorted chronologically.
 */
export function getPlayerProgression(playerId: string): ProgressionFrame[] {
  const matchSessions = sessions
    .filter(
      s =>
        (s.type === 'match' || s.type === 'training_match') &&
        s.participatingPlayerIds.includes(playerId) &&
        // Skip future-scheduled and processing sessions — no data yet.
        (s.status === 'analysed' || s.status === 'complete'),
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  // Determine MOTM by finding the per-session top compositeScore.
  const sessionMaxScore = new Map<string, number>()
  for (const a of matchAnalyses) {
    sessionMaxScore.set(
      a.sessionId,
      Math.max(sessionMaxScore.get(a.sessionId) ?? 0, a.compositeScore),
    )
  }

  return matchSessions.map((session, i) => {
    const isTraining = session.type === 'training_match'
    const a = matchAnalyses.find(x => x.playerId === playerId && x.sessionId === session.id)
    const goals = highlights.filter(
      h => h.playerId === playerId && h.sessionId === session.id && h.eventType === 'goal',
    ).length
    const keyPasses = highlights.filter(
      h => h.playerId === playerId && h.sessionId === session.id && h.eventType === 'key_pass',
    ).length
    const score = a?.compositeScore ?? 0
    // MOTM only awarded for competitive matches (training "best player" is a
    // less meaningful badge in coach culture).
    const isMotm = !isTraining && score === sessionMaxScore.get(session.id) && score >= 80
    return {
      md: i + 1,
      sessionId: session.id,
      date: session.date,
      shortDate: formatShortDate(session.date),
      opp: session.opponent ?? (isTraining ? 'Training' : 'Match'),
      score,
      // Training matches don't have a competitive W/L; show a neutral dot.
      result: isTraining ? '·' : deriveResult(session),
      motm: isMotm,
      poor: score > 0 && score < 60,
      dnp: false,
      upcoming: false,
      kind: isTraining ? 'training' : 'comp',
      g: goals,
      a: keyPasses,
    }
  })
}

/** Return the highest-md frame, or null if no progression. */
export function getLatestFrame(progression: ProgressionFrame[]): ProgressionFrame | null {
  if (progression.length === 0) return null
  return progression[progression.length - 1]
}

/** Compute season summary numbers from a progression list. */
export function getSeasonNumbers(progression: ProgressionFrame[]): {
  matches: number
  goals: number
  assists: number
  motms: number
  trend: number  // current score vs first played score
} {
  const played = progression.filter(d => !d.dnp && !d.upcoming)
  const matches = played.length
  const goals = played.reduce((s, d) => s + d.g, 0)
  const assists = played.reduce((s, d) => s + d.a, 0)
  const motms = played.filter(d => d.motm).length
  const trend = played.length >= 2 ? played[played.length - 1].score - played[0].score : 0
  return { matches, goals, assists, motms, trend }
}

/** Pull the highlights for a single match-frame (or every match if no md). */
export function getFrameHighlights(playerId: string, sessionId?: string): Highlight[] {
  return highlights.filter(
    h => h.playerId === playerId && (!sessionId || h.sessionId === sessionId),
  )
}
