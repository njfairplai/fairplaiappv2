/**
 * Demo runner. Recreates the two players from the tech team's worked
 * example (Player A and Player B) and pushes them through our algorithm so
 * we can compare side-by-side what the new scoring spits out.
 *
 * Run with:
 *   npx tsx scoring/example.ts
 *
 * Note on the input data: the tech team's example sheet only listed a
 * subset of raw stats. Missing fields (e.g. progressive_carries,
 * pressures_applied) we set to 0 here — they'll just contribute neutral /
 * low values until the CV pipeline starts emitting them.
 */

import { scorePlayer, type RawPlayerStats } from './algorithm'

// Tech team's example: U12-ish, ~30-minute match snippet.
// We don't know minutes_played from the doc — assume 30 min based on the
// distance (0.61 km ÷ ~70 m/min benchmark ≈ ~8.7 min reported, but more
// plausibly a short clip; we use 15 min to give the rates a fair shot).
const MINUTES = 15

// Player A — "fast and dribbles a lot"
const playerA: RawPlayerStats = {
  age_group: 'U12',
  position: 'W',                          // winger fits the profile
  match_type: 'competitive',
  minutes_played: MINUTES,

  distance_m: 610,
  top_speed_kmh: 42.97,                   // FLAGGED — likely tracking artifact
  sprint_count: 14,
  high_intensity_runs: 14,                // assume same as sprints (no separate count given)

  passes_completed: 3,                    // 33% of 9
  passes_attempted: 9,
  progressive_passes: 1,                  // assumed
  passes_under_pressure_completed: 1,
  passes_under_pressure_attempted: 3,

  dribbles_completed: 1,                  // 25% of 4
  dribbles_attempted: 4,
  progressive_carries: 0,                 // not in spec
  final_third_takeons: 2,                 // half their dribbles, assumed

  tackles_won: 0,
  tackles_attempted: 0,
  interceptions: 5,
  ball_recoveries: 0,                     // not in spec
  pressures_applied: 0,                   // not in spec

  touches_in_final_third: 6,              // ~40% of 16, assumed
  aerials_won: 0,
  aerials_attempted: 0,
  dispossessions: 2,                      // assumed

  goals: 0,
  assists: 0,
  shots: 2,
  shots_on_target: 0,                     // assumed
  key_passes: 0,
}

// Player B — "barely moved but won the ball back constantly"
const playerB: RawPlayerStats = {
  age_group: 'U12',
  position: 'CB',                         // defender fits the profile
  match_type: 'competitive',
  minutes_played: MINUTES,

  distance_m: 500,
  top_speed_kmh: 22.58,
  sprint_count: 1,
  high_intensity_runs: 1,

  passes_completed: 4,                    // 67% of 6
  passes_attempted: 6,
  progressive_passes: 1,
  passes_under_pressure_completed: 2,
  passes_under_pressure_attempted: 3,

  dribbles_completed: 0,                  // 0% of 1
  dribbles_attempted: 1,
  progressive_carries: 0,
  final_third_takeons: 0,

  tackles_won: 3,
  tackles_attempted: 4,                   // assumed
  interceptions: 7,
  ball_recoveries: 0,
  pressures_applied: 0,

  touches_in_final_third: 2,
  aerials_won: 0,
  aerials_attempted: 0,
  dispossessions: 0,

  goals: 0,
  assists: 0,
  shots: 1,
  shots_on_target: 0,
  key_passes: 0,
}

function dump(label: string, raw: RawPlayerStats) {
  const out = scorePlayer(raw)
  // eslint-disable-next-line no-console
  console.log(`\n=== ${label} ===`)
  // eslint-disable-next-line no-console
  console.log(`Overall: ${out.overall.toFixed(2)} → ${out.grade}   (${raw.position}, ${raw.match_type}, ${raw.minutes_played} min${out.context.insufficient_sample ? ', INSUFFICIENT SAMPLE' : ''})`)
  for (const cat of Object.values(out.categories)) {
    // eslint-disable-next-line no-console
    console.log(`  ${cat.category.padEnd(10)} ${cat.score.toFixed(1).padStart(5)} → ${grade(cat.score)}`)
  }
}

function grade(s: number): string {
  if (s >= 80) return 'A'
  if (s >= 65) return 'B'
  if (s >= 50) return 'C'
  if (s >= 35) return 'D'
  if (s >= 20) return 'E'
  return 'F'
}

dump('Player A (W)', playerA)
dump('Player B (CB)', playerB)
