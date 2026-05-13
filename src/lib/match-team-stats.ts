/**
 * Single source of truth for per-match "team in numbers" stats —
 * possession, pass accuracy, shots on target, tackles, intercepts.
 *
 * Two paths feed the same numbers:
 *
 *   - Match Center calendar drill-in (State5Ready) at /coach/web/match-center
 *   - Deep-link match page at /coach/web/match/[sessionId]
 *
 * Before this lib lived, each surface had its own table; the drill-in
 * had no table at all so analysed matches there rendered with no stats.
 * Centralising avoids drift and lets every analysed match show stats —
 * hand-authored for the 6 mockData-canonical sessions, hash-seeded
 * deterministic fallback for the rest.
 */

export type TeamStat = {
  possession: number
  passAccuracy: number
  shotsOnTarget: number
  tackles: number
  intercepts: number
}

const gameTeamStats: Record<string, { home: TeamStat; away: TeamStat }> = {
  session_005: { home: { possession: 58, passAccuracy: 81, shotsOnTarget: 6, tackles: 15, intercepts: 22 }, away: { possession: 42, passAccuracy: 68, shotsOnTarget: 3, tackles: 12, intercepts: 18 } },
  session_006: { home: { possession: 48, passAccuracy: 72, shotsOnTarget: 5, tackles: 16, intercepts: 24 }, away: { possession: 52, passAccuracy: 75, shotsOnTarget: 7, tackles: 19, intercepts: 28 } },
  session_007: { home: { possession: 54, passAccuracy: 78, shotsOnTarget: 8, tackles: 18, intercepts: 26 }, away: { possession: 46, passAccuracy: 65, shotsOnTarget: 4, tackles: 14, intercepts: 19 } },
  session_010: { home: { possession: 51, passAccuracy: 74, shotsOnTarget: 4, tackles: 20, intercepts: 25 }, away: { possession: 49, passAccuracy: 71, shotsOnTarget: 3, tackles: 17, intercepts: 22 } },
  session_013: { home: { possession: 62, passAccuracy: 84, shotsOnTarget: 9, tackles: 14, intercepts: 30 }, away: { possession: 38, passAccuracy: 62, shotsOnTarget: 2, tackles: 11, intercepts: 16 } },
  session_014: { home: { possession: 55, passAccuracy: 77, shotsOnTarget: 10, tackles: 16, intercepts: 27 }, away: { possession: 45, passAccuracy: 70, shotsOnTarget: 7, tackles: 18, intercepts: 23 } },
}

/**
 * Returns hand-authored stats when present, otherwise a deterministic
 * hash-seeded synthesis so the same sessionId always renders the same
 * numbers. Possession sums to 100; the rest sit in plausible per-match
 * ranges (pass accuracy 60–85%, shots on target 2–12, tackles 10–24,
 * intercepts 14–32). Demo-only; production hydrates from the AI run.
 */
export function getMatchTeamStats(sessionId: string): { home: TeamStat; away: TeamStat } {
  const known = gameTeamStats[sessionId]
  if (known) return known
  let seed = 0
  for (let i = 0; i < sessionId.length; i++) seed = (seed * 31 + sessionId.charCodeAt(i)) >>> 0
  const rng = (n: number, range: number, base: number) =>
    base + (((seed >>> (n * 3)) & 0xff) % range)
  const homePoss = rng(0, 21, 44)
  return {
    home: {
      possession: homePoss,
      passAccuracy: rng(1, 22, 64),
      shotsOnTarget: rng(2, 10, 3),
      tackles: rng(3, 12, 12),
      intercepts: rng(4, 16, 16),
    },
    away: {
      possession: 100 - homePoss,
      passAccuracy: rng(5, 22, 60),
      shotsOnTarget: rng(6, 9, 2),
      tackles: rng(7, 12, 10),
      intercepts: rng(8, 14, 14),
    },
  }
}
