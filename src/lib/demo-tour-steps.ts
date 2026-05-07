/**
 * Demo tour step lists.
 *
 * Three tours:
 *   coach  — 7 stops on coach surfaces, then transition to parent (+7)
 *   parent — 7 stops on parent surfaces only
 *   misc   — 3 marquee stops across both portals
 *
 * Each step is anchored to a `data-tour-id` attribute on the live UI.
 * The TourProvider navigates to the step's route, waits for the anchor
 * to mount, then positions the tooltip relative to it.
 *
 * Adding/removing/reordering: just edit the arrays. The progress dots,
 * tooltip header (`STOP n / N`), and route navigation all derive from
 * step order. Step `id` should stay stable so analytics can track them
 * even as content changes.
 */

export type TourPersona = 'coach' | 'parent' | 'misc'

export type TourStep = {
  id: string
  /** Route the user must be on for this step's anchor to exist. The
   *  TourProvider auto-navigates here if needed. */
  route: string
  /** CSS selector for the anchor element. Conventionally
   *  `[data-tour-id="..."]`; can be any selector. */
  anchor: string
  /** Where the tooltip card sits relative to the anchor. */
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** ≤6 words. */
  headline: string
  /** ≤32 words. */
  body: string
  /** What the next button does:
   *   `next`       — advance to the next step
   *   `transition` — show an interstitial card before advancing
   *   `finish`     — set demo_completed and route to /demo/end */
  cta: 'next' | 'transition' | 'finish'
}

// ─── COACH TOUR ──────────────────────────────────────────
// 7 stops on the coach surfaces. After step 7, a `transition` card
// hands off to the parent tour (which is appended below).
const COACH_STOPS: TourStep[] = [
  {
    id: 'coach-1-hub',
    route: '/coach/web',
    anchor: '[data-tour-id="coach-hub-input"]',
    position: 'top',
    headline: "Mikel — your AI assistant.",
    body: "Ask anything about your squad, a player, last week's match, tactics. Mikel reads your team data and replies in coach voice.",
    cta: 'next',
  },
  {
    id: 'coach-2-match-center',
    route: '/coach/web/match-center',
    anchor: '[data-tour-id="match-center-day-cell-ready"]',
    position: 'right',
    headline: "Match Center — where the season lives.",
    body: "Calendar of every session. Days light up as matches move from prep → ready. Tap a ready day to drill into the analysis.",
    cta: 'next',
  },
  {
    id: 'coach-3-match-composite',
    route: '/coach/web/match/session_007',
    anchor: '[data-tour-id="match-drillin-roster"]',
    position: 'top',
    headline: "Roster + composite scores.",
    body: "Every player who featured, ranked by composite score. Tap a row to drill into them — radar, key stats, fatigue.",
    cta: 'next',
  },
  {
    id: 'coach-4-fatigue',
    route: '/coach/web/match/session_007',
    anchor: '[data-tour-id="match-drillin-roster"]',
    position: 'left',
    headline: "Fatigue from footage.",
    body: "Sprint speed, sprint count, distance per minute fold into a single fatigue load 0–100. Surfaces on every player view.",
    cta: 'next',
  },
  {
    id: 'coach-5-share-clip',
    route: '/coach/web/highlights',
    anchor: '[data-tour-id="match-drillin-share-clip"]',
    position: 'bottom',
    headline: "Share a clip with the parent.",
    body: "Forward an AI-tagged moment to the kid's parent. Lands in their inbox with a 15-day expiry. Replaces the WhatsApp side-channel.",
    cta: 'next',
  },
  {
    id: 'coach-6-squad-filters',
    route: '/coach/web/squad',
    anchor: '[data-tour-id="squad-filter-row"]',
    position: 'bottom',
    headline: "Squad as pitch + filters.",
    body: "Team in formation. Filter for IDP-stale, high-fatigue, or recent injuries — non-matching players dim out so welfare flags surface fast.",
    cta: 'next',
  },
  {
    id: 'coach-7-player-workload',
    route: '/coach/web/player/player_001',
    anchor: '[data-tour-id="player-profile-workload"]',
    position: 'top',
    headline: "Workload + gear flags per player.",
    body: "Fatigue trend, top sprint, gear concerns the coach has flagged. Send-a-clip lives here too. Parents see a curated version.",
    cta: 'transition',
  },
]

// ─── COACH→PARENT TRANSITION ─────────────────────────────
// Rendered as a full-screen interstitial between the coach tour and the
// parent tour, ONLY when persona === 'coach' (so coaches see what their
// parents see). Parents don't get to see the coach side per the
// asymmetric persona rule.
export const COACH_TO_PARENT_TRANSITION = {
  headline: "Now — what the parent sees.",
  body: "You've seen the coach side. Same player, same match. Here's how it lands for Kiyan's parent.",
  cta: "Continue →",
}

// ─── PARENT TOUR ─────────────────────────────────────────
// Standalone for the parent persona; appended after coach tour for the
// coach persona.
const PARENT_STOPS: TourStep[] = [
  {
    id: 'parent-1-home',
    route: '/parent/home',
    anchor: '[data-tour-id="parent-home-clip"]',
    position: 'bottom',
    headline: "The home screen.",
    body: "One clip from the most recent match + the season radar. The parent's at-a-glance answer to 'how's my kid doing?'",
    cta: 'next',
  },
  {
    id: 'parent-2-notifications',
    route: '/parent/notifications',
    anchor: '[data-tour-id="parent-notifications-legend"]',
    position: 'bottom',
    headline: "One inbox for everything.",
    body: "Clips, coach notes, IDP updates, injury alerts, gear flags. Each kind has its own colour. No app switching, no missed messages.",
    cta: 'next',
  },
  {
    id: 'parent-3-coach-group',
    route: '/parent/highlights',
    anchor: '[data-tour-id="parent-highlights-coach-group"]',
    position: 'bottom',
    headline: "Clips the coach picked.",
    body: "Forwarded clips + Coach Cam uploads sit at the top of Highlights, distinct from AI-tagged clips below. Hand-picked moments first.",
    cta: 'next',
  },
  {
    id: 'parent-4-coach-row',
    route: '/parent/highlights',
    anchor: '[data-tour-id="parent-highlights-coach-row"]',
    position: 'bottom',
    headline: "Source-tagged clips.",
    body: "SHARED = an AI clip the coach forwarded. COACH CAM = a phone clip the coach shot themselves. Both expire after 15 days.",
    cta: 'next',
  },
  {
    id: 'parent-5-moments',
    route: '/parent/match/session_054',
    anchor: '[data-tour-id="parent-match-moments"]',
    position: 'top',
    headline: "Moments to know about.",
    body: "When the coach flags an injury during a match, the parent sees what happened, when, and how serious. No more 'they didn't tell me.'",
    cta: 'next',
  },
  {
    id: 'parent-6-development',
    route: '/parent/development',
    anchor: '[data-tour-id="parent-development-welfare"]',
    position: 'top',
    headline: "Workload + gear notes.",
    body: "Fatigue trend so the parent knows if the kid's overloaded. Gear flags ('boots are smoothing out') when the coach spots an issue.",
    cta: 'next',
  },
  {
    id: 'parent-7-match-score',
    route: '/parent/match/session_007',
    anchor: '[data-tour-id="parent-match-score"]',
    position: 'bottom',
    headline: "Match-level read.",
    body: "Composite score, radar, key clips, coach notes. Same data the coach saw — through a parent lens, not a tactical lens.",
    cta: 'finish',
  },
]

// ─── ASSEMBLE PER-PERSONA STEPS ──────────────────────────
/** Returns the ordered step list for a given persona.
 *
 *   coach  → coach 7 + parent 7 = 14 stops (transition card between)
 *   misc   → same as coach (stakeholders need to see both portals)
 *   parent → parent 7 only
 *
 * The standalone 3-stop misc tour was dropped after walkthrough feedback
 * — stakeholders watching the demo ARE doing it because they want to
 * understand the product in depth, so feeding them the same 14-stop
 * coach + parent tour is a better fit than a marketing-style highlight
 * reel. The persona label itself is preserved for analytics. */
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
