/**
 * Traffic-light score coloring for parent-facing composite scores.
 *
 * Parents read scores quickly and want at-a-glance "is my kid doing
 * well?" — so we use functional green / amber / red rather than the
 * brand-token (yellow / indigo / coral) variant the coach side uses.
 *
 * Thresholds match the coach-side `scoreValueColor` in
 * `src/app/coach/web/match/[sessionId]/page.tsx` so the same number
 * reads the same colour across portals (just different palette tokens).
 *
 *   ≥ 80  → green   (success)
 *   ≥ 60  → amber   (warning)
 *   < 60  → red     (error)
 *
 * Sourced from `COLORS.success / warning / error` in `lib/constants.ts`
 * — the same legacy traffic-light values used elsewhere in the app.
 */

import { COLORS } from './constants'

export function parentScoreColor(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) return 'var(--brand-indigo-mute)'
  if (score >= 80) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}
