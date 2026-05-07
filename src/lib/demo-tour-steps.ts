/**
 * Demo tour step lists — page-level narrator.
 *
 * The tour is no longer a spotlight overlay; it's a floating top-right
 * "narrator" card that explains what the surface in front of you DOES.
 * The user is free to click around the page while reading. Each stop
 * corresponds to one whole product surface, not an element.
 *
 * Three personas:
 *   coach  → coach 5 + parent 5 = 10 stops (transition card between)
 *   parent → parent 5 only
 *   misc   → same as coach (stakeholders need to see both portals)
 *
 * Adding/removing/reordering: just edit the arrays. The progress dots,
 * tooltip header (`STOP n / N`), and route navigation all derive from
 * step order. Step `id` should stay stable so analytics can track them
 * even as content changes.
 */

export type TourPersona = 'coach' | 'parent' | 'misc'

export type TourStep = {
  id: string
  /** Route the surface lives on. The TourProvider auto-navigates here. */
  route: string
  /** ≤8 words. */
  headline: string
  /** ≤40 words. Frame the surface as a feature with a story; nudge the
   *  user toward what to click while they read. */
  body: string
  /** Optional inline call-to-try-this cue, shown smaller below the body
   *  in mono caps. e.g. "Try clicking a suggestion chip." */
  tryThis?: string
  /** What the Next button does:
   *   `next`       — advance to the next step
   *   `transition` — show an interstitial card before advancing (used
   *                  between coach + parent tours for coach/misc personas)
   *   `finish`     — set demo_completed and route to /demo/end */
  cta: 'next' | 'transition' | 'finish'
}

// ─── COACH TOUR (5 stops) ────────────────────────────────
const COACH_STOPS: TourStep[] = [
  {
    id: 'coach-1-hub',
    route: '/coach/web',
    headline: 'Mikel — your AI assistant.',
    body: "Ask anything about your squad, last week's match, who needs prep, what drill to run. Mikel reads your team data and replies in coach voice. The whole season starts as a conversation.",
    tryThis: 'Try a suggestion chip.',
    cta: 'next',
  },
  {
    id: 'coach-2-match-center',
    route: '/coach/web/match-center',
    headline: 'Match Center — every session in one calendar.',
    body: 'Days light up as matches move from PREP → READY. Drills, training matches, fixtures — all here. Tap a green ready cell to drill into the analysis.',
    tryThis: 'Click any analysed day cell.',
    cta: 'next',
  },
  {
    id: 'coach-3-match-drillin',
    route: '/coach/web/match/session_007',
    headline: 'Match drill-in — performance + welfare per player.',
    body: 'Composite scores, radar shape, key stats. Click any roster row to open a player detail with their fatigue tile, injury moments, and one-tap "send a clip to the parent."',
    tryThis: 'Click a roster row to open a player.',
    cta: 'next',
  },
  {
    id: 'coach-4-squad',
    route: '/coach/web/squad',
    headline: 'Squad as pitch — formation + welfare overlays.',
    body: 'Your team in their positions, scored. Filter for high fatigue, IDP-stale, recent injuries — non-matching players dim out so flags surface fast.',
    tryThis: 'Try the High fatigue or Injuries filter.',
    cta: 'next',
  },
  {
    id: 'coach-5-player-profile',
    route: '/coach/web/player/player_001',
    headline: 'Player profile — one page, season-deep.',
    body: 'Filmstrip of every match, performance radar, workload trend, gear flags, IDP. Send a clip directly to the parent from the welfare section.',
    tryThis: 'Scroll to the WORKLOAD & GEAR section.',
    cta: 'transition',
  },
]

// ─── COACH→PARENT TRANSITION ─────────────────────────────
// Rendered as a full-screen interstitial between the coach tour and the
// parent tour, ONLY when persona === 'coach' or 'misc' (asymmetric rule
// — parents don't see the coach side).
export const COACH_TO_PARENT_TRANSITION = {
  headline: 'Now — what the parent sees.',
  body: "You've seen the coach side. Same player, same season. Here's how it lands for the parent.",
  cta: 'Continue →',
}

// ─── PARENT TOUR (5 stops) ───────────────────────────────
const PARENT_STOPS: TourStep[] = [
  {
    id: 'parent-1-home',
    route: '/parent/home',
    headline: 'Home — your kid at a glance.',
    body: "Most-recent match clip + season radar shape. The 'how's my kid doing?' answer in two seconds. Fresh notifications stack underneath.",
    cta: 'next',
  },
  {
    id: 'parent-2-notifications',
    route: '/parent/notifications',
    headline: 'One inbox for everything from the coach.',
    body: 'Clips, notes, IDP refreshes, injury alerts, gear flags — all in one stream. Filter chips at the top let you focus on what you care about.',
    tryThis: 'Tap a filter chip to focus the inbox.',
    cta: 'next',
  },
  {
    id: 'parent-3-highlights',
    route: '/parent/highlights',
    headline: "Highlights — coach-picked clips at the top.",
    body: 'Clips the coach forwarded or filmed on their phone sit above the AI-tagged season grid. Each clip is source-tagged so you know if it was hand-picked.',
    tryThis: 'Open a clip from the FROM YOUR COACH row.',
    cta: 'next',
  },
  {
    id: 'parent-4-match',
    route: '/parent/match/session_054',
    headline: 'Match detail — stats + welfare in context.',
    body: "Your kid's composite + key clips, plus a 'moments to know' section if the coach flagged anything during the match. Welfare lives next to performance.",
    cta: 'next',
  },
  {
    id: 'parent-5-development',
    route: '/parent/development',
    headline: 'Development — workload + gear + IDP.',
    body: "Fatigue trend so you know if your kid is overloaded. Gear flags from the coach. The full development plan one tap away.",
    cta: 'finish',
  },
]

// ─── ASSEMBLE PER-PERSONA STEPS ──────────────────────────
/** Coach + Misc both get the full 10-stop coach + parent tour (with the
 *  transition card between). Parent gets just the 5 parent stops.
 *  Asymmetric persona rule from the demo brief. */
export function stepsForPersona(persona: TourPersona): TourStep[] {
  if (persona === 'coach' || persona === 'misc') {
    return [...COACH_STOPS, ...PARENT_STOPS]
  }
  return PARENT_STOPS
}

/** Total stops count (excluding the interstitial card). */
export function totalSteps(persona: TourPersona): number {
  return stepsForPersona(persona).length
}
