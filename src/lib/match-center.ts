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
  /** Day-of-month within `month`. */
  day: number
  /** 1-indexed month (1=Jan, 2=Feb, …). */
  month: number
  /** Calendar year. */
  year: number
  kind: MatchCenterKind
  status: MatchCenterStatus
  opponent: string | null
  score?: number | null
  motm?: string
  /** When the date isn't a member of the active month (trailing cells in grid) */
  trailing?: boolean
}

/**
 * Sessions across Feb / Mar / Apr 2026. Mixed types so the calendar
 * walks the full vocabulary of states + kinds:
 *
 *   - Multiple training matches (some analysed, one in-progress, one in prep)
 *   - Multiple competitive matches (analysed, in-progress, prep)
 *   - Drills sprinkled
 *   - One uncategorised pending session
 *
 * The Match Center page renders one month at a time and the prev/next
 * buttons in the Calendar header navigate across months.
 */
export const SESSIONS: MatchCenterSession[] = [
  // ── February 2026 ──────────────────────────────────────────────
  { date: '2026-02-03', day: 3,  month: 2, year: 2026, kind: 'training', status: 'ready',         opponent: 'Team A vs Team B', score: 74, motm: 'Saeed K.' },
  { date: '2026-02-05', day: 5,  month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-08', day: 8,  month: 2, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Shabab FC',         score: 71, motm: 'Kiyan M.' },
  { date: '2026-02-10', day: 10, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-12', day: 12, month: 2, year: 2026, kind: 'match',    status: 'uncategorised', opponent: '— Pitch 2',         score: null },
  { date: '2026-02-14', day: 14, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-17', day: 17, month: 2, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Stratford E.',      score: 78, motm: 'Saeed K.' },
  { date: '2026-02-19', day: 19, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-22', day: 22, month: 2, year: 2026, kind: 'training', status: 'processing',    opponent: 'Team A vs Team B' },
  { date: '2026-02-24', day: 24, month: 2, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Al Wasl Academy',   score: 82, motm: 'Saeed K.' },
  { date: '2026-02-25', day: 25, month: 2, year: 2026, kind: 'training', status: 'prep',          opponent: 'Team A vs Team B' },
  { date: '2026-02-26', day: 26, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-28', day: 28, month: 2, year: 2026, kind: 'match',    status: 'prep',          opponent: 'Al Wasl Academy' },

  // ── March 2026 ────────────────────────────────────────────────
  { date: '2026-03-03', day: 3,  month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-05', day: 5,  month: 3, year: 2026, kind: 'training', status: 'prep',          opponent: 'Team A vs Team B' },
  { date: '2026-03-08', day: 8,  month: 3, year: 2026, kind: 'match',    status: 'prep',          opponent: 'Al Nasr Cubs' },
  { date: '2026-03-10', day: 10, month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-12', day: 12, month: 3, year: 2026, kind: 'training', status: 'upcoming',      opponent: 'Team A vs Team B' },
  { date: '2026-03-15', day: 15, month: 3, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Hatta Academy' },
  { date: '2026-03-17', day: 17, month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-22', day: 22, month: 3, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Sharjah Cubs' },
  { date: '2026-03-24', day: 24, month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-29', day: 29, month: 3, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Al Wahda U13' },

  // ── April 2026 ────────────────────────────────────────────────
  { date: '2026-04-02', day: 2,  month: 4, year: 2026, kind: 'training', status: 'upcoming',      opponent: 'Team A vs Team B' },
  { date: '2026-04-05', day: 5,  month: 4, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Dubai Stars' },
  { date: '2026-04-09', day: 9,  month: 4, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-04-12', day: 12, month: 4, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Bani Yas U13' },
  { date: '2026-04-19', day: 19, month: 4, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Cup semi · TBD' },
  { date: '2026-04-26', day: 26, month: 4, year: 2026, kind: 'match',    status: 'upcoming',      opponent: 'Cup final · TBD' },
]

/** Backwards-compat alias — was named after the only month that
 *  existed in the first cut. Kept so other call sites keep working. */
export const FEB_2026_SESSIONS = SESSIONS.filter(s => s.month === 2)

/** All sessions for a given (year, month), keyed by day-of-month. */
export function getSessionsForMonth(
  year: number,
  month: number,
): Record<number, MatchCenterSession> {
  return Object.fromEntries(
    SESSIONS.filter(s => s.year === year && s.month === month).map(s => [s.day, s]),
  )
}

/** Backwards-compat alias for the original Feb 2026 lookup. */
export const SESSIONS_BY_DAY: Record<number, MatchCenterSession> = getSessionsForMonth(
  2026,
  2,
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
  /** February day-of-month the clip belongs to. Lets the Highlights page
   *  group clips by match without a separate join. */
  sessionDay: number
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
 * Tagged clips across the four analysed matches in February. Used by
 * State 5's horizontal row (filtered to the selected day) and by the
 * coach Highlights surface (grouped by match, season-wide reel browser).
 */
export const MATCH_CENTER_HIGHLIGHTS: MatchCenterHighlight[] = [
  // ── Feb 24 · vs Al Wasl Academy · 3-1 W (the populated reference match)
  { id: 'h-24-1', sessionDay: 24, ev: 'GOAL',   player: 'Saeed Khalifa',    num: 7, minute: 11, dur: 38, headline: 'Right-foot driven · 1-0' },
  { id: 'h-24-2', sessionDay: 24, ev: 'KEY',    player: 'Kiyan Makkawi',    num: 6, minute: 28, dur: 22, headline: 'Press-break carry, then split' },
  { id: 'h-24-3', sessionDay: 24, ev: 'GOAL',   player: 'Saeed Khalifa',    num: 7, minute: 47, dur: 42, headline: 'Late-arrival finish · 2-1' },
  { id: 'h-24-4', sessionDay: 24, ev: 'TACKLE', player: 'Khalid Al-Naqbi',  num: 4, minute: 56, dur: 12, headline: 'Last-ditch tackle on edge' },
  { id: 'h-24-5', sessionDay: 24, ev: 'GOAL',   player: 'Kiyan Makkawi',    num: 6, minute: 71, dur: 36, headline: 'Box arrival · 3-1' },
  { id: 'h-24-6', sessionDay: 24, ev: 'SPRINT', player: 'Saeed Khalifa',    num: 7, minute: 78, dur: 14, headline: '7.4 m/s recovery' },

  // ── Feb 17 · vs Stratford E. · composite 78
  { id: 'h-17-1', sessionDay: 17, ev: 'GOAL',   player: 'Saeed Khalifa',    num: 7, minute: 14, dur: 32, headline: 'Header from the corner' },
  { id: 'h-17-2', sessionDay: 17, ev: 'KEY',    player: 'Hamad Al-Mansoori',num: 10, minute: 31, dur: 18, headline: 'Through-ball between CBs' },
  { id: 'h-17-3', sessionDay: 17, ev: 'SAVE',   player: 'Omar Al-Sayed',    num: 1, minute: 38, dur: 9,  headline: 'Reflex stop at near post' },
  { id: 'h-17-4', sessionDay: 17, ev: 'GOAL',   player: 'Ahmed Hassan',     num: 9, minute: 64, dur: 28, headline: 'Composed finish · 2-0' },
  { id: 'h-17-5', sessionDay: 17, ev: 'TACKLE', player: 'Rashid Al-Marri',  num: 3, minute: 72, dur: 11, headline: 'Slide tackle on the break' },

  // ── Feb 08 · vs Shabab FC · composite 71
  { id: 'h-08-1', sessionDay: 8, ev: 'GOAL',   player: 'Kiyan Makkawi',    num: 6, minute: 22, dur: 30, headline: 'Free-kick whipped in · 1-0' },
  { id: 'h-08-2', sessionDay: 8, ev: 'SAVE',   player: 'Omar Al-Sayed',    num: 1, minute: 35, dur: 12, headline: 'Tipped over the bar' },
  { id: 'h-08-3', sessionDay: 8, ev: 'KEY',    player: 'Saeed Khalifa',    num: 7, minute: 51, dur: 16, headline: 'Cut-back to the penalty spot' },
  { id: 'h-08-4', sessionDay: 8, ev: 'TACKLE', player: 'Khalid Al-Naqbi',  num: 4, minute: 67, dur: 10, headline: 'Block on the edge of the box' },

  // ── Feb 03 · training match · composite 74 (internal A-vs-B)
  { id: 'h-03-1', sessionDay: 3, ev: 'GOAL',   player: 'Saeed Khalifa',    num: 7, minute: 9,  dur: 24, headline: 'Volley after a switch' },
  { id: 'h-03-2', sessionDay: 3, ev: 'SPRINT', player: 'Salem Al-Dhaheri', num: 11, minute: 17, dur: 13, headline: '6.9 m/s wing chase' },
  { id: 'h-03-3', sessionDay: 3, ev: 'KEY',    player: 'Yousef Al-Zaabi',  num: 8, minute: 26, dur: 19, headline: 'Line-breaker into the half-space' },
  { id: 'h-03-4', sessionDay: 3, ev: 'GOAL',   player: 'Mansoor Al-Falasi',num: 17, minute: 41, dur: 26, headline: 'Far-post tap-in' },
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
