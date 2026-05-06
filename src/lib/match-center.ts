/**
 * Match Center mock data + state helpers.
 *
 * The Match Center is a calendar-first surface where the coach picks a session
 * (month grid by default, week filmstrip when scrubbing tight). The pane below
 * morphs into one of five contextual states:
 *
 *   1. Prep         — upcoming match, attendance/lineup/confirm tabs
 *   2. Categorise   — past session, AI couldn't tell match vs drill
 *   3. Drills       — drills only, no analysis
 *   4. Processing   — match analysed in the background, ETA shown
 *   5. Ready        — analysis complete, headlines + highlights row + CTA
 *
 * The full per-match drill-in (`/coach/web/match/[id]`) stays as the existing
 * route, reachable via "Open full match analysis →" from State 5.
 *
 * Mock data is scoped to February 2026 so the design pack's reference month
 * lights up as expected. Real wiring (selected via session metadata) comes in
 * a later slice when the API layer lands.
 */

export type MatchCenterStatus =
  | 'prep'
  | 'processing'
  | 'ready'
  | 'drills'
  | 'upcoming'
  | 'uncategorised'

export type MatchCenterKind = 'match' | 'training' | 'drills'

export interface MatchCenterSession {
  /** ISO date e.g. 2026-02-24 */
  date: string
  /** Day-of-month for the active month (Feb 2026 in this mock) */
  day: number
  kind: MatchCenterKind
  status: MatchCenterStatus
  opponent: string | null
  score?: number | null
  motm?: string
  /** When the date isn't a member of the active month (trailing cells in grid) */
  trailing?: boolean
}

/**
 * February 2026 — 28 days. Feb 1 2026 is a Sunday so the grid starts on
 * column 0. Sessions cluster around training days (Tue/Thu) and matches
 * (Sat/Sun). Day 24 is the selected match by default (vs Al Wasl).
 */
export const FEB_2026_SESSIONS: MatchCenterSession[] = [
  { date: '2026-02-03', day: 3,  kind: 'training', status: 'ready',         opponent: 'Team A vs Team B', score: 74, motm: 'Saeed K.' },
  { date: '2026-02-05', day: 5,  kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-08', day: 8,  kind: 'match',    status: 'ready',         opponent: 'Shabab FC',         score: 71, motm: 'Kiyan M.' },
  { date: '2026-02-10', day: 10, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-12', day: 12, kind: 'match',    status: 'uncategorised', opponent: '— Pitch 2',         score: null },
  { date: '2026-02-14', day: 14, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-17', day: 17, kind: 'match',    status: 'ready',         opponent: 'Stratford E.',      score: 78, motm: 'Saeed K.' },
  { date: '2026-02-19', day: 19, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-22', day: 22, kind: 'training', status: 'processing',    opponent: 'Team A vs Team B' },
  { date: '2026-02-24', day: 24, kind: 'match',    status: 'ready',         opponent: 'Al Wasl Academy',   score: 82, motm: 'Saeed K.' },
  { date: '2026-02-26', day: 26, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-28', day: 28, kind: 'match',    status: 'prep',          opponent: 'Al Wasl Academy' },
]

export const SESSIONS_BY_DAY: Record<number, MatchCenterSession> = Object.fromEntries(
  FEB_2026_SESSIONS.map(s => [s.day, s]),
)

export interface RosterEntry {
  num: number
  name: string
  pos: string
  present: boolean
  composite: number
  motm?: boolean
}

/**
 * 16-player roster used by the prep wizard (Attendance / Lineup / Confirm).
 * 14 present (default) + 2 out for the upcoming Al Wasl match.
 */
export const MATCH_CENTER_ROSTER: RosterEntry[] = [
  { num: 1,  name: 'Omar Al-Sayed',     pos: 'GK',  present: true,  composite: 72 },
  { num: 2,  name: 'Faisal Mansour',    pos: 'RB',  present: true,  composite: 70 },
  { num: 3,  name: 'Rashid Al-Marri',   pos: 'CB',  present: true,  composite: 73 },
  { num: 4,  name: 'Khalid Al-Naqbi',   pos: 'CB',  present: true,  composite: 75 },
  { num: 5,  name: 'Nasser Al-Hammadi', pos: 'LB',  present: true,  composite: 71 },
  { num: 6,  name: 'Kiyan Makkawi',     pos: 'CM',  present: true,  composite: 79 },
  { num: 7,  name: 'Saeed Khalifa',     pos: 'RW',  present: true,  composite: 82, motm: true },
  { num: 8,  name: 'Yousef Al-Zaabi',   pos: 'CM',  present: true,  composite: 74 },
  { num: 9,  name: 'Ahmed Hassan',      pos: 'ST',  present: true,  composite: 76 },
  { num: 10, name: 'Hamad Al-Mansoori', pos: 'CAM', present: true,  composite: 75 },
  { num: 11, name: 'Salem Al-Dhaheri',  pos: 'LW',  present: true,  composite: 73 },
  { num: 12, name: 'Mohammed Al-Ali',   pos: 'GK',  present: false, composite: 68 },
  { num: 14, name: 'Tariq Al-Shamsi',   pos: 'CB',  present: true,  composite: 70 },
  { num: 16, name: 'Hassan Al-Suwaidi', pos: 'CM',  present: true,  composite: 72 },
  { num: 17, name: 'Mansoor Al-Falasi', pos: 'ST',  present: true,  composite: 71 },
  { num: 19, name: 'Zayed Al-Maktoum',  pos: 'RB',  present: false, composite: 67 },
]

export type HighlightEvent = 'GOAL' | 'KEY' | 'TACKLE' | 'SAVE' | 'SPRINT'

export interface MatchCenterHighlight {
  id: string
  ev: HighlightEvent
  player: string
  num: number
  /** Minute of the match (e.g. 47) */
  minute: number
  /** Clip duration in seconds */
  dur: number
  headline: string
}

/**
 * Six tagged clips for the Feb 24 match (vs Al Wasl Academy · 3-1 W).
 * Used by the State 5 horizontal row + the Highlights surface's clip list.
 */
export const MATCH_CENTER_HIGHLIGHTS: MatchCenterHighlight[] = [
  { id: 'h1', ev: 'GOAL',   player: 'Saeed Khalifa',    num: 7, minute: 11, dur: 38, headline: 'Right-foot driven · 1-0' },
  { id: 'h2', ev: 'KEY',    player: 'Kiyan Makkawi',    num: 6, minute: 28, dur: 22, headline: 'Press-break carry, then split' },
  { id: 'h3', ev: 'GOAL',   player: 'Saeed Khalifa',    num: 7, minute: 47, dur: 42, headline: 'Late-arrival finish · 2-1' },
  { id: 'h4', ev: 'TACKLE', player: 'Khalid Al-Naqbi',  num: 4, minute: 56, dur: 12, headline: 'Last-ditch tackle on edge' },
  { id: 'h5', ev: 'GOAL',   player: 'Kiyan Makkawi',    num: 6, minute: 71, dur: 36, headline: 'Box arrival · 3-1' },
  { id: 'h6', ev: 'SPRINT', player: 'Saeed Khalifa',    num: 7, minute: 78, dur: 14, headline: '7.4 m/s recovery' },
]

/** Default selected day on first render (the populated Ready state). */
export const DEFAULT_SELECTED_DAY = 24

export type MatchCenterState = '1' | '2' | '3' | '4' | '5' | null

/**
 * Map a session row to one of the five contextual states. `null` means the
 * day is empty and the pane should show a placeholder.
 */
export function getStateForSession(s: MatchCenterSession | undefined | null): MatchCenterState {
  if (!s) return null
  switch (s.status) {
    case 'prep':
    case 'upcoming':
      return '1'
    case 'uncategorised':
      return '2'
    case 'drills':
      return '3'
    case 'processing':
      return '4'
    case 'ready':
      return '5'
    default:
      return null
  }
}
