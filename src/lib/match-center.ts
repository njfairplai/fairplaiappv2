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
  /** Reference to the canonical `Session` in `src/lib/mockData.ts` for
   *  sessions that have one. The `Open match` CTA on Highlights and the
   *  `Open full match analysis →` CTA on State 5 Ready use this to deep-
   *  link to `/coach/web/match/[sessionId]`. When omitted, the surface
   *  hides the deep-link affordance — match-center.ts is the source of
   *  truth for what the coach sees in the calendar; mockData sessions
   *  inherit those dates/opponents/scores. */
  id?: string
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
  // The four analysed February sessions reference real mockData IDs
  // so deep-link CTAs (Open match, Open full analysis →) land on the
  // correct match drill-in. mockData session_001/_005/_006/_007/_008/_010
  // were rewritten to match these dates and opponents — see
  // src/lib/mockData.ts for the aligned entries.
  { date: '2026-02-03', day: 3,  month: 2, year: 2026, kind: 'training', status: 'ready',         opponent: 'Team A vs Team B', score: 74, motm: 'Saeed K.', id: 'session_001' },
  { date: '2026-02-05', day: 5,  month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-08', day: 8,  month: 2, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Shabab FC',         score: 71, motm: 'Kiyan M.', id: 'session_005' },
  { date: '2026-02-10', day: 10, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-12', day: 12, month: 2, year: 2026, kind: 'match',    status: 'uncategorised', opponent: '— Pitch 2',         score: null },
  { date: '2026-02-14', day: 14, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-17', day: 17, month: 2, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Stratford E.',      score: 78, motm: 'Saeed K.', id: 'session_006' },
  { date: '2026-02-19', day: 19, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-22', day: 22, month: 2, year: 2026, kind: 'training', status: 'processing',    opponent: 'Team A vs Team B', id: 'session_010' },
  { date: '2026-02-24', day: 24, month: 2, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Al Wasl Academy',   score: 82, motm: 'Saeed K.', id: 'session_007' },
  { date: '2026-02-25', day: 25, month: 2, year: 2026, kind: 'training', status: 'prep',          opponent: 'Team A vs Team B' },
  { date: '2026-02-26', day: 26, month: 2, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-02-28', day: 28, month: 2, year: 2026, kind: 'match',    status: 'prep',          opponent: 'Al Wasl Academy', id: 'session_008' },

  // ── March 2026 ────────────────────────────────────────────────
  // Demo today is March 21 — March 5/8/15 are in the past relative
  // to that, so they land as `ready` (analysed). March 22+ are
  // genuine future fixtures.
  { date: '2026-03-03', day: 3,  month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-05', day: 5,  month: 3, year: 2026, kind: 'training', status: 'ready',         opponent: 'Team A vs Team B', score: 76, motm: 'Saeed K.', id: 'session_053' },
  { date: '2026-03-08', day: 8,  month: 3, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Al Nasr Cubs',     score: 79, motm: 'Kiyan M.', id: 'session_054' },
  { date: '2026-03-10', day: 10, month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-12', day: 12, month: 3, year: 2026, kind: 'training', status: 'ready',         opponent: 'Team A vs Team B', score: 73, motm: 'Saeed K.', id: 'session_055' },
  { date: '2026-03-15', day: 15, month: 3, year: 2026, kind: 'match',    status: 'ready',         opponent: 'Hatta Academy',    score: 81, motm: 'Saeed K.', id: 'session_056' },
  { date: '2026-03-17', day: 17, month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-22', day: 22, month: 3, year: 2026, kind: 'match',    status: 'prep',      opponent: 'Sharjah Cubs' },
  { date: '2026-03-24', day: 24, month: 3, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-03-29', day: 29, month: 3, year: 2026, kind: 'match',    status: 'prep',      opponent: 'Al Wahda U13' },

  // ── April 2026 ────────────────────────────────────────────────
  { date: '2026-04-02', day: 2,  month: 4, year: 2026, kind: 'training', status: 'prep',      opponent: 'Team A vs Team B' },
  { date: '2026-04-05', day: 5,  month: 4, year: 2026, kind: 'match',    status: 'prep',      opponent: 'Dubai Stars' },
  { date: '2026-04-09', day: 9,  month: 4, year: 2026, kind: 'drills',   status: 'drills',        opponent: null },
  { date: '2026-04-12', day: 12, month: 4, year: 2026, kind: 'match',    status: 'prep',      opponent: 'Bani Yas U13' },
  { date: '2026-04-19', day: 19, month: 4, year: 2026, kind: 'match',    status: 'prep',      opponent: 'Cup semi · TBD' },
  { date: '2026-04-26', day: 26, month: 4, year: 2026, kind: 'match',    status: 'prep',      opponent: 'Cup final · TBD' },
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

/**
 * Five highlight event categories — the only event types the system
 * tags. Locked down deliberately so the coach gets a small, scannable
 * filter set on the Highlights surface and the State 5 row.
 *
 *   GOAL  — ball in the back of the net
 *   SHOT  — attempt on goal that isn't a goal (saved, missed, blocked)
 *   KEY   — key pass / line-breaking pass (creates a chance)
 *   DEF   — key defence (block, last-ditch tackle, ball recovery)
 *   SAVE  — goalkeeper save
 *
 * Sprints, dribbles, generic tackles etc. are not tagged. The
 * categories above cover the actionable moments a coach builds reels
 * around.
 */
export type HighlightEvent = 'GOAL' | 'SHOT' | 'KEY' | 'DEF' | 'SAVE'

export interface MatchCenterHighlight {
  id: string
  /** Day-of-month the clip belongs to. Pair with `sessionMonth` to
   *  disambiguate (Feb 5 vs Mar 5). */
  sessionDay: number
  /** 1-indexed month the clip belongs to. Lets Highlights group clips
   *  cross-month without sessionDay collisions. Optional for backwards
   *  compatibility — clips without it default to February 2026. */
  sessionMonth?: number
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
 * Tagged clips across the four analysed sessions in February. Used by
 * State 5's horizontal row (filtered to the selected day) and by the
 * coach Highlights surface (grouped by match, season-wide reel browser).
 *
 * Only five event types are tagged: GOAL · SHOT · KEY (key pass) ·
 * DEF (key defence) · SAVE. Sprints, dribbles, generic tackles etc.
 * are not surfaced — those moments don't drive a coach's reel.
 *
 * Feb 24 carries 20 clips so the Highlights "+N more clips" expand UI
 * has something to demo against. Other matches stay tighter.
 */
export const MATCH_CENTER_HIGHLIGHTS: MatchCenterHighlight[] = [
  // ── Feb 24 · vs Al Wasl Academy · 3-1 W (the populated reference match)
  { id: 'h-24-1',  sessionDay: 24, ev: 'GOAL', player: 'Saeed Khalifa',     num: 7,  minute: 4,  dur: 32, headline: 'Opener inside 5 minutes' },
  { id: 'h-24-2',  sessionDay: 24, ev: 'KEY',  player: 'Kiyan Makkawi',     num: 6,  minute: 8,  dur: 18, headline: 'Through-ball off the kickoff' },
  { id: 'h-24-3',  sessionDay: 24, ev: 'DEF',  player: 'Khalid Al-Naqbi',   num: 4,  minute: 11, dur: 11, headline: 'Block on the edge, ball recovered' },
  { id: 'h-24-4',  sessionDay: 24, ev: 'GOAL', player: 'Saeed Khalifa',     num: 7,  minute: 14, dur: 38, headline: 'Right-foot driven · 1-0' },
  { id: 'h-24-5',  sessionDay: 24, ev: 'SAVE', player: 'Omar Al-Sayed',     num: 1,  minute: 19, dur: 12, headline: 'Reflex stop, near post' },
  { id: 'h-24-6',  sessionDay: 24, ev: 'KEY',  player: 'Hamad Al-Mansoori', num: 10, minute: 23, dur: 16, headline: 'Switch to the far flank' },
  { id: 'h-24-7',  sessionDay: 24, ev: 'SHOT', player: 'Saeed Khalifa',     num: 7,  minute: 26, dur: 10, headline: 'Curler off the post' },
  { id: 'h-24-8',  sessionDay: 24, ev: 'KEY',  player: 'Kiyan Makkawi',     num: 6,  minute: 28, dur: 22, headline: 'Press-break carry, then split' },
  { id: 'h-24-9',  sessionDay: 24, ev: 'DEF',  player: 'Rashid Al-Marri',   num: 3,  minute: 33, dur: 9,  headline: 'Block on the half-turn' },
  { id: 'h-24-10', sessionDay: 24, ev: 'GOAL', player: 'Saeed Khalifa',     num: 7,  minute: 38, dur: 28, headline: 'Volley from the cutback · 2-0' },
  { id: 'h-24-11', sessionDay: 24, ev: 'SAVE', player: 'Omar Al-Sayed',     num: 1,  minute: 42, dur: 14, headline: 'Tipped over the bar' },
  { id: 'h-24-12', sessionDay: 24, ev: 'GOAL', player: 'Saeed Khalifa',     num: 7,  minute: 47, dur: 42, headline: 'Late-arrival finish · 2-1' },
  { id: 'h-24-13', sessionDay: 24, ev: 'KEY',  player: 'Yousef Al-Zaabi',   num: 8,  minute: 51, dur: 17, headline: 'Line-breaking carry' },
  { id: 'h-24-14', sessionDay: 24, ev: 'DEF',  player: 'Khalid Al-Naqbi',   num: 4,  minute: 56, dur: 12, headline: 'Last-ditch block on edge' },
  { id: 'h-24-15', sessionDay: 24, ev: 'SHOT', player: 'Ahmed Hassan',      num: 9,  minute: 60, dur: 11, headline: 'Header straight at the keeper' },
  { id: 'h-24-16', sessionDay: 24, ev: 'KEY',  player: 'Kiyan Makkawi',     num: 6,  minute: 65, dur: 19, headline: 'No-look pass, knife-edge' },
  { id: 'h-24-17', sessionDay: 24, ev: 'SAVE', player: 'Omar Al-Sayed',     num: 1,  minute: 68, dur: 8,  headline: 'Smothered at feet' },
  { id: 'h-24-18', sessionDay: 24, ev: 'GOAL', player: 'Kiyan Makkawi',     num: 6,  minute: 71, dur: 36, headline: 'Box arrival · 3-1' },
  { id: 'h-24-19', sessionDay: 24, ev: 'DEF',  player: 'Faisal Mansour',    num: 2,  minute: 75, dur: 10, headline: 'Recovery on the touchline' },
  { id: 'h-24-20', sessionDay: 24, ev: 'SHOT', player: 'Saeed Khalifa',     num: 7,  minute: 78, dur: 14, headline: 'Drive saved by the keeper' },

  // ── Feb 17 · vs Stratford E. · composite 78
  { id: 'h-17-1', sessionDay: 17, ev: 'GOAL', player: 'Saeed Khalifa',     num: 7,  minute: 14, dur: 32, headline: 'Header from the corner' },
  { id: 'h-17-2', sessionDay: 17, ev: 'KEY',  player: 'Hamad Al-Mansoori', num: 10, minute: 31, dur: 18, headline: 'Through-ball between CBs' },
  { id: 'h-17-3', sessionDay: 17, ev: 'SAVE', player: 'Omar Al-Sayed',     num: 1,  minute: 38, dur: 9,  headline: 'Reflex stop at near post' },
  { id: 'h-17-4', sessionDay: 17, ev: 'GOAL', player: 'Ahmed Hassan',      num: 9,  minute: 64, dur: 28, headline: 'Composed finish · 2-0' },
  { id: 'h-17-5', sessionDay: 17, ev: 'DEF',  player: 'Rashid Al-Marri',   num: 3,  minute: 72, dur: 11, headline: 'Block on the break' },
  { id: 'h-17-6', sessionDay: 17, ev: 'SHOT', player: 'Kiyan Makkawi',     num: 6,  minute: 81, dur: 13, headline: 'Long range, just wide' },

  // ── Feb 08 · vs Shabab FC · composite 71
  { id: 'h-08-1', sessionDay: 8, ev: 'GOAL', player: 'Kiyan Makkawi',     num: 6,  minute: 22, dur: 30, headline: 'Free-kick whipped in · 1-0' },
  { id: 'h-08-2', sessionDay: 8, ev: 'SAVE', player: 'Omar Al-Sayed',     num: 1,  minute: 35, dur: 12, headline: 'Tipped over the bar' },
  { id: 'h-08-3', sessionDay: 8, ev: 'KEY',  player: 'Saeed Khalifa',     num: 7,  minute: 51, dur: 16, headline: 'Cut-back to the penalty spot' },
  { id: 'h-08-4', sessionDay: 8, ev: 'DEF',  player: 'Khalid Al-Naqbi',   num: 4,  minute: 67, dur: 10, headline: 'Block on the edge of the box' },
  { id: 'h-08-5', sessionDay: 8, ev: 'SHOT', player: 'Ahmed Hassan',      num: 9,  minute: 78, dur: 9,  headline: 'Volley over the bar' },

  // ── Feb 03 · training match · composite 74 (internal A-vs-B)
  { id: 'h-03-1', sessionDay: 3, ev: 'GOAL', player: 'Saeed Khalifa',     num: 7,  minute: 9,  dur: 24, headline: 'Volley after a switch' },
  { id: 'h-03-2', sessionDay: 3, ev: 'SHOT', player: 'Salem Al-Dhaheri',  num: 11, minute: 17, dur: 13, headline: 'Drive forced wide by keeper' },
  { id: 'h-03-3', sessionDay: 3, ev: 'KEY',  player: 'Yousef Al-Zaabi',   num: 8,  minute: 26, dur: 19, headline: 'Line-breaker into the half-space' },
  { id: 'h-03-4', sessionDay: 3, ev: 'GOAL', player: 'Mansoor Al-Falasi', num: 17, minute: 41, dur: 26, headline: 'Far-post tap-in' },
  { id: 'h-03-5', sessionDay: 3, ev: 'DEF',  player: 'Tariq Al-Shamsi',   num: 14, minute: 52, dur: 8,  headline: 'Tracking back to clear' },

  // ── Mar 05 · training match · composite 76
  { id: 'h-m05-1', sessionDay: 5,  sessionMonth: 3, ev: 'GOAL', player: 'Saeed Khalifa',    num: 7,  minute: 8,  dur: 26, headline: 'Half-volley first-time finish' },
  { id: 'h-m05-2', sessionDay: 5,  sessionMonth: 3, ev: 'KEY',  player: 'Hamad Al-Mansoori',num: 10, minute: 19, dur: 14, headline: 'Reverse pass through the lines' },
  { id: 'h-m05-3', sessionDay: 5,  sessionMonth: 3, ev: 'DEF',  player: 'Khalid Al-Naqbi',  num: 4,  minute: 31, dur: 9,  headline: 'Recovery on the counter' },
  { id: 'h-m05-4', sessionDay: 5,  sessionMonth: 3, ev: 'GOAL', player: 'Ahmed Hassan',     num: 9,  minute: 44, dur: 30, headline: 'Header from a near-post cross' },

  // ── Mar 08 · vs Al Nasr Cubs · composite 79
  { id: 'h-m08-1', sessionDay: 8,  sessionMonth: 3, ev: 'GOAL', player: 'Saeed Khalifa',    num: 7,  minute: 12, dur: 32, headline: 'Cut inside, drilled low and hard' },
  { id: 'h-m08-2', sessionDay: 8,  sessionMonth: 3, ev: 'KEY',  player: 'Kiyan Makkawi',    num: 6,  minute: 24, dur: 19, headline: 'Switch to the overlapping RB' },
  { id: 'h-m08-3', sessionDay: 8,  sessionMonth: 3, ev: 'SHOT', player: 'Ahmed Hassan',     num: 9,  minute: 33, dur: 11, headline: 'Strike forced over the bar' },
  { id: 'h-m08-4', sessionDay: 8,  sessionMonth: 3, ev: 'GOAL', player: 'Kiyan Makkawi',    num: 6,  minute: 51, dur: 28, headline: 'Late-arrival finish · 2-1' },
  { id: 'h-m08-5', sessionDay: 8,  sessionMonth: 3, ev: 'SAVE', player: 'Omar Al-Sayed',    num: 1,  minute: 67, dur: 10, headline: 'One-on-one, smothered' },
  { id: 'h-m08-6', sessionDay: 8,  sessionMonth: 3, ev: 'DEF',  player: 'Rashid Al-Marri',  num: 3,  minute: 76, dur: 9,  headline: 'Block on the edge of the box' },

  // ── Mar 12 · training match · composite 73
  { id: 'h-m12-1', sessionDay: 12, sessionMonth: 3, ev: 'GOAL', player: 'Mansoor Al-Falasi',num: 17, minute: 11, dur: 24, headline: 'Tap-in from the cutback' },
  { id: 'h-m12-2', sessionDay: 12, sessionMonth: 3, ev: 'KEY',  player: 'Hassan Al-Suwaidi',num: 16, minute: 27, dur: 16, headline: 'Switch to free runner on the right' },
  { id: 'h-m12-3', sessionDay: 12, sessionMonth: 3, ev: 'DEF',  player: 'Tariq Al-Shamsi',  num: 14, minute: 38, dur: 8,  headline: 'Recovery tackle on the wing' },

  // ── Mar 15 · vs Hatta Academy · composite 81
  { id: 'h-m15-1', sessionDay: 15, sessionMonth: 3, ev: 'GOAL', player: 'Saeed Khalifa',    num: 7,  minute: 6,  dur: 30, headline: 'Direct from the kickoff press' },
  { id: 'h-m15-2', sessionDay: 15, sessionMonth: 3, ev: 'KEY',  player: 'Yousef Al-Zaabi',  num: 8,  minute: 18, dur: 17, headline: 'Disguised pass into the half-space' },
  { id: 'h-m15-3', sessionDay: 15, sessionMonth: 3, ev: 'GOAL', player: 'Saeed Khalifa',    num: 7,  minute: 33, dur: 38, headline: 'Brace · 2-0 — solo run from halfway' },
  { id: 'h-m15-4', sessionDay: 15, sessionMonth: 3, ev: 'DEF',  player: 'Khalid Al-Naqbi',  num: 4,  minute: 42, dur: 10, headline: 'Sliding block on the angle' },
  { id: 'h-m15-5', sessionDay: 15, sessionMonth: 3, ev: 'SHOT', player: 'Salem Al-Dhaheri', num: 11, minute: 58, dur: 9,  headline: 'Curler off the inside of the post' },
  { id: 'h-m15-6', sessionDay: 15, sessionMonth: 3, ev: 'SAVE', player: 'Omar Al-Sayed',    num: 1,  minute: 71, dur: 12, headline: 'Reaction stop from a deflection' },
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

// ─── WELFARE PRODUCER HELPERS ────────────────────────────
// Coach-side writers for the welfare features. All write to localStorage
// via parent-portal.ts arrays; the parent inbox picks them up through
// `readClientNotifications()`. Real backend wiring replaces these later.

import {
  appendToWelfareStore,
  LS_INJURY_FLAGS,
  LS_PPE_FLAGS,
  LS_COACH_CAM,
  LS_SHARED_CLIPS,
  LS_FATIGUE,
  type SharedClipRecord,
} from '@/lib/welfare-store'
import type {
  InjuryFlag,
  InjuryType,
  InjurySeverity,
  PPEFlag,
  PPEGearType,
  CoachCamClip,
  CoachCamTag,
  FatigueSample,
} from '@/lib/types'

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function flagInjury(input: {
  sessionId: string
  playerId: string
  minute: number
  type: InjuryType
  severity: InjurySeverity
  notes?: string
  clipId?: string
}): InjuryFlag {
  const flag: InjuryFlag = {
    id: genId('inj'),
    createdAt: new Date().toISOString(),
    ...input,
  }
  appendToWelfareStore<InjuryFlag>(LS_INJURY_FLAGS, flag)
  return flag
}

export function flagPPE(input: {
  playerId: string
  gearType: PPEGearType
  notes: string
}): PPEFlag {
  const flag: PPEFlag = {
    id: genId('ppe'),
    status: 'open',
    createdAt: new Date().toISOString(),
    ...input,
  }
  appendToWelfareStore<PPEFlag>(LS_PPE_FLAGS, flag)
  return flag
}

export function uploadCoachCam(input: {
  playerId: string
  coachId: string
  caption?: string
  tag?: CoachCamTag
  thumbnailUrl: string
  videoUrl: string
  durationSeconds: number
}): CoachCamClip {
  const clip: CoachCamClip = {
    id: genId('cc'),
    uploadedAt: new Date().toISOString(),
    source: 'phone_upload',
    ...input,
  }
  appendToWelfareStore<CoachCamClip>(LS_COACH_CAM, clip)
  return clip
}

export function sendClipToParent(input: {
  highlightId: string
  playerId: string
  parentId: string
  coachId: string
  message?: string
}): SharedClipRecord {
  const rec: SharedClipRecord = {
    id: genId('shc'),
    sentAt: new Date().toISOString(),
    ...input,
  }
  appendToWelfareStore<SharedClipRecord>(LS_SHARED_CLIPS, rec)
  return rec
}

/** Used by mockData seeder + (future) AI-fed sample writers. */
export function recordFatigueSample(input: FatigueSample): void {
  appendToWelfareStore<FatigueSample>(LS_FATIGUE, input)
}
