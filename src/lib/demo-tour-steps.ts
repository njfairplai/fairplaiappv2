/**
 * Demo tour step lists — tab-aligned narrator + substeps.
 *
 * The tour walks the user through each nav tab in order. Within a tab,
 * one or two substeps drill into specific surfaces (e.g. Stats →
 * Match detail). The current step's `tab` value drives which BottomNav
 * tab stays active; the others are greyed out so the user can't
 * jump-around the nav (within-page clicks still work — header bell,
 * player rows, share buttons, etc.).
 *
 * Three personas:
 *   coach  → coach 6 + parent 6 = 12 substeps (transition card between)
 *   parent → parent 6 only
 *   misc   → same as coach (stakeholders see both portals)
 *
 * Adding/reordering: edit the arrays. The progress counter, navigation,
 * and tab affiliation all derive from step order. Step `id` should stay
 * stable so analytics can track them even as content changes.
 */

export type TourPersona = 'coach' | 'parent' | 'misc'

/** Tab ids — must match the `id` field on `BottomNav.NavItem` for both
 *  the parent + coachWeb navs. The TourProvider exposes the current
 *  step's tab via context; nav components dim everything else. */
export type TourTab =
  // Parent tabs
  | 'home'
  | 'stats'
  | 'highlights'
  | 'development'
  | 'hub'
  // Coach tabs (note `hub` overlaps but the route prefix disambiguates
  // which portal we're in)
  | 'match-center'
  | 'players'

export type TourStep = {
  id: string
  /** Route the surface lives on. The TourProvider auto-navigates here
   *  on step CHANGE (not on every pathname tick). */
  route: string
  /** Which nav tab "owns" this step. Drives the active-tab highlight +
   *  the greyed-out treatment on every other tab. */
  tab: TourTab
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

// ─── COACH TOUR (4 stops · one per nav tab) ─────────────
// No auto-routed substeps. Each stop = a tab. Drill-ins (match detail,
// player profile) are mentioned in the body but the user does the
// clicking themselves — auto-routing them felt jarring in walkthrough.
const COACH_STOPS: TourStep[] = [
  {
    id: 'coach-hub',
    route: '/coach/web',
    tab: 'hub',
    headline: 'Mikel — your AI assistant.',
    body: "Ask anything about your squad, last week's match, who needs prep, what drill to run. Mikel reads your team data and replies in coach voice. The whole season starts as a conversation.",
    tryThis: 'Try a suggestion chip.',
    cta: 'next',
  },
  {
    id: 'coach-match-center',
    route: '/coach/web/match-center',
    tab: 'match-center',
    headline: 'Match Center — every session in one calendar.',
    body: 'Days light up as matches move from PREP → READY. Drills, training matches, fixtures — all here. Click any green READY cell to drill into the per-player analysis.',
    tryThis: 'Click a green READY cell.',
    cta: 'next',
  },
  {
    id: 'coach-squad',
    route: '/coach/web/squad',
    tab: 'players',
    headline: 'Squad as pitch — formation + welfare overlays.',
    body: 'Your team in their positions, scored. Filter for high fatigue, IDP-stale, recent injuries — non-matching players dim out so flags surface fast. Click any player token for their full profile.',
    tryThis: 'Try the High fatigue or Injuries filter.',
    cta: 'next',
  },
  {
    id: 'coach-highlights',
    route: '/coach/web/highlights',
    tab: 'highlights',
    headline: 'Highlights — share clips with parents.',
    body: 'Every AI-tagged moment across the season, grouped by match. Forward a clip to a parent in one tap — replaces WhatsApp side-channels. Use "+ Coach Cam" top-right to upload a phone clip.',
    tryThis: 'Try the ↗ share button on any clip.',
    cta: 'transition',
  },
]

// ─── COACH→PARENT TRANSITION ─────────────────────────────
export const COACH_TO_PARENT_TRANSITION = {
  headline: 'Now — what the parent sees.',
  body: "You've seen the coach side. Same player, same season. Here's how it lands for the parent.",
  cta: 'Continue →',
}

// ─── PARENT TOUR (5 stops · one per nav tab) ────────────
// No auto-routed substeps. Match detail (/parent/match/[id]) is only
// reachable via deep links from notifications by design — the tour
// shouldn't teleport users there.
const PARENT_STOPS: TourStep[] = [
  {
    id: 'parent-home',
    route: '/parent/home',
    tab: 'home',
    headline: 'Home — your kid at a glance.',
    body: "Most-recent match clip + season composite + season radar. The 'how's my kid doing?' answer in two seconds. Tap the bell at top to see your full inbox.",
    cta: 'next',
  },
  {
    id: 'parent-stats',
    route: '/parent/stats',
    tab: 'stats',
    headline: 'Stats — match-by-match performance.',
    body: "Filmstrip of every match + an interactive radar that updates per match. Tap any match card and the radar redraws to that match's shape — see how your kid's profile shifts game-to-game.",
    tryThis: 'Tap a match in the filmstrip.',
    cta: 'next',
  },
  {
    id: 'parent-highlights',
    route: '/parent/highlights',
    tab: 'highlights',
    headline: 'Highlights — coach-picked at the top.',
    body: 'Clips the coach forwarded or filmed on their phone sit above the AI-tagged season grid. Each clip is source-tagged so you know if it was hand-picked.',
    tryThis: 'Open a clip from the FROM YOUR COACH row.',
    cta: 'next',
  },
  {
    id: 'parent-development',
    route: '/parent/development',
    tab: 'development',
    headline: 'Progress — workload + gear + IDP.',
    body: "Fatigue trend so you know if your kid's overloaded. Gear flags from the coach. The full development plan opens in a tap — read it or download as PDF.",
    cta: 'next',
  },
  {
    id: 'parent-hub',
    route: '/parent/hub',
    tab: 'hub',
    headline: 'Hub — coach 1:1 + announcements.',
    body: "Direct messages with your kid's coach, plus team-wide announcements. The conversation thread that closes the loop on everything else.",
    cta: 'finish',
  },
]

// ─── ASSEMBLE PER-PERSONA STEPS ──────────────────────────
/** Coach + Misc both get the full 12-substep coach + parent tour (with
 *  the transition card between). Parent gets just the 6 parent stops.
 *  Asymmetric persona rule from the demo brief. */
export function stepsForPersona(persona: TourPersona): TourStep[] {
  if (persona === 'coach' || persona === 'misc') {
    return [...COACH_STOPS, ...PARENT_STOPS]
  }
  return PARENT_STOPS
}

/** Total substeps count (excluding the interstitial card). */
export function totalSteps(persona: TourPersona): number {
  return stepsForPersona(persona).length
}
