/**
 * FairplAI player scoring algorithm — v0.2 (May 2026, post-tech-team-critique).
 *
 * This is a runnable reference implementation that the AI tech team should
 * use as the target spec for their pipeline. The structure is intentionally
 * verbose so it ports straight to Python or any other language: pure
 * functions, hardcoded tables, no framework dependencies.
 *
 * Major decisions vs the tech team's draft:
 *   1. Per-MINUTE normalization (not per-90, not raw match totals). Youth
 *      matches vary 20–80 minutes; only a per-minute rate is comparable.
 *   2. Z-score against age-group + match-type benchmarks (separate tables
 *      for competitive vs training because intensity differs).
 *   3. Quality > volume: success rates carry the bulk of category weight;
 *      raw-count metrics are dropped where they overlap a rate metric.
 *   4. Position-aware category weights at the composite step.
 *   5. Sample-size handling: minutes_played < 10 → score returned but
 *      flagged "insufficient_sample"; UI should de-emphasise these.
 *
 * Caveats (call these out when sharing with the tech team):
 *   - The benchmark tables in this file are HAND-TUNED initial estimates
 *     sourced from youth-football coaching literature + reasoned defaults.
 *     They are NOT empirical yet. Plan: ship with these, replace each
 *     {mean, std} pair with empirical values from FairplAI's own data
 *     once we have ≥50 player-matches per age/match-type bucket.
 *   - Opposition strength is not factored in (5 goals vs a weak side ≠
 *     5 goals vs a strong side). Out of scope for v1.
 *   - Training vs competitive scores are scored against DIFFERENT
 *     benchmarks and should NOT be averaged together.
 */

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export type AgeGroup = 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18'
export type Position = 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST'
export type MatchType = 'competitive' | 'training'
export type CategoryKey = 'physical' | 'passing' | 'dribbling' | 'defending' | 'control' | 'impact'
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

/** Raw stats per player per match. All counts are TOTALS for the match
 *  (not per-90, not per-minute) — the algorithm computes per-minute rates
 *  internally using minutes_played. */
export interface RawPlayerStats {
  // Required context
  age_group: AgeGroup
  position: Position
  match_type: MatchType
  minutes_played: number                  // actual minutes on pitch this match

  // Physical
  distance_m: number                      // metres covered
  top_speed_kmh: number                   // peak speed reached, km/h
  sprint_count: number                    // sprints (>= 20 km/h burst)
  high_intensity_runs: number             // HIR (>= 15 km/h, < sprint threshold)

  // Passing
  passes_completed: number
  passes_attempted: number
  progressive_passes: number              // ≥10 m forward, anywhere on pitch
  passes_under_pressure_completed: number // pass attempts with defender within ~5 m
  passes_under_pressure_attempted: number

  // Dribbling
  dribbles_completed: number
  dribbles_attempted: number
  progressive_carries: number             // carry ≥10 m forward retaining possession
  final_third_takeons: number             // dribble attempts in opp third

  // Defending
  tackles_won: number
  tackles_attempted: number
  interceptions: number
  ball_recoveries: number                 // first to a loose ball
  pressures_applied: number               // ≥1 s within ~5 m of opposing ball carrier

  // Control
  touches_in_final_third: number
  aerials_won: number
  aerials_attempted: number
  dispossessions: number                  // tackled off the ball / lost possession

  // Impact
  goals: number
  assists: number
  shots: number
  shots_on_target: number
  key_passes: number                      // pass directly preceding a teammate's shot
}

interface Benchmark {
  /** Mean of the metric in this age/match-type benchmark population. */
  mean: number
  /** Standard deviation. Used in z = (x − mean) / std. */
  std: number
  /** Free-text source / provenance — coaching literature, FairplAI empirical, etc. */
  source: string
}

/** A normalized 0–100 score for one metric. */
export interface MetricScore {
  key: string
  raw: number | null                       // null if the metric was undefined (e.g. 0 attempted → success rate undefined)
  rate: number | null                      // the per-minute or % value used for z-score
  benchmark: Benchmark | null
  z: number | null
  score: number | null                     // 0–100, clamped
}

/** A category's component metric scores + the weighted category total. */
export interface CategoryScore {
  category: CategoryKey
  metrics: MetricScore[]
  score: number                            // 0–100, weighted by metric weights below
}

/** Full output of scorePlayer(). */
export interface PlayerScore {
  overall: number                          // 0–100, position-weighted average of category scores
  grade: Grade
  categories: Record<CategoryKey, CategoryScore>
  context: {
    age_group: AgeGroup
    position: Position
    match_type: MatchType
    minutes_played: number
    insufficient_sample: boolean           // true if minutes_played < 10
  }
}

// ──────────────────────────────────────────────────────────────────
// Metric definitions — single source of truth for what each category
// measures, in what units, with what weight, against what benchmark.
// ──────────────────────────────────────────────────────────────────

type MetricExtractor = (s: RawPlayerStats) => { value: number | null; rate: number | null }

interface MetricDef {
  key: string
  /** Returns both the raw number (e.g. 5 goals) and the rate used for z-scoring
   *  (e.g. 0.0625 goals/min). Returns null for either if undefined (e.g.
   *  dribble success rate when no attempts). */
  extract: MetricExtractor
  /** If true, lower raw values are better (inverted z). */
  inverse?: boolean
  weight: number                           // % weight within this metric's category
}

interface CategoryDef {
  key: CategoryKey
  metrics: MetricDef[]
}

const perMin = (s: RawPlayerStats, n: number): number =>
  s.minutes_played > 0 ? n / s.minutes_played : 0

const rate = (num: number, denom: number): number | null =>
  denom > 0 ? num / denom : null

const CATEGORIES: CategoryDef[] = [
  {
    key: 'physical',
    metrics: [
      {
        key: 'distance_per_min',
        weight: 30,
        extract: s => ({ value: s.distance_m, rate: perMin(s, s.distance_m) }),
      },
      {
        key: 'high_intensity_runs_per_min',
        weight: 30,
        extract: s => ({ value: s.high_intensity_runs, rate: perMin(s, s.high_intensity_runs) }),
      },
      {
        key: 'top_speed_kmh',
        weight: 20,
        extract: s => ({ value: s.top_speed_kmh, rate: s.top_speed_kmh }),
      },
      {
        key: 'sprints_per_min',
        weight: 20,
        extract: s => ({ value: s.sprint_count, rate: perMin(s, s.sprint_count) }),
      },
    ],
  },
  {
    key: 'passing',
    metrics: [
      // Pass completion: quality of distribution.
      {
        key: 'pass_completion_pct',
        weight: 40,
        extract: s => ({
          value: s.passes_completed,
          rate: rate(s.passes_completed, s.passes_attempted),
        }),
      },
      // Progressive passes per minute: territory gain.
      {
        key: 'progressive_passes_per_min',
        weight: 30,
        extract: s => ({ value: s.progressive_passes, rate: perMin(s, s.progressive_passes) }),
      },
      // Pass-under-pressure completion: composure.
      {
        key: 'pass_under_pressure_pct',
        weight: 30,
        extract: s => ({
          value: s.passes_under_pressure_completed,
          rate: rate(s.passes_under_pressure_completed, s.passes_under_pressure_attempted),
        }),
      },
      // NOTE: Key passes deliberately MOVED to Impact (creative end-product),
      // not duplicated here. See Impact category below.
    ],
  },
  {
    key: 'dribbling',
    metrics: [
      // Dribble success rate: the headline quality metric.
      {
        key: 'dribble_success_pct',
        weight: 50,
        extract: s => ({
          value: s.dribbles_completed,
          rate: rate(s.dribbles_completed, s.dribbles_attempted),
        }),
      },
      // Progressive carries: a DIFFERENT action from a dribble — running with the
      // ball into space without engaging a defender. Captures territory gain on
      // the ball.
      {
        key: 'progressive_carries_per_min',
        weight: 30,
        extract: s => ({ value: s.progressive_carries, rate: perMin(s, s.progressive_carries) }),
      },
      // Final-third take-ons: where dribbles matter most.
      {
        key: 'final_third_takeons_per_min',
        weight: 20,
        extract: s => ({ value: s.final_third_takeons, rate: perMin(s, s.final_third_takeons) }),
      },
    ],
  },
  {
    key: 'defending',
    metrics: [
      // Tackle success rate: defensive duel quality. (Drop "tackles won" as
      // standalone — it's the numerator already inside this rate.)
      {
        key: 'tackle_success_pct',
        weight: 30,
        extract: s => ({
          value: s.tackles_won,
          rate: rate(s.tackles_won, s.tackles_attempted),
        }),
      },
      // Interceptions per min: positional reading.
      {
        key: 'interceptions_per_min',
        weight: 25,
        extract: s => ({ value: s.interceptions, rate: perMin(s, s.interceptions) }),
      },
      // Ball recoveries per min: loose-ball reaction (CV-feasible per audit).
      {
        key: 'ball_recoveries_per_min',
        weight: 25,
        extract: s => ({ value: s.ball_recoveries, rate: perMin(s, s.ball_recoveries) }),
      },
      // Pressures applied per min: off-ball defending — our differentiator over
      // StatsBomb. CV-feasible because all 22 players are tracked every frame.
      {
        key: 'pressures_per_min',
        weight: 20,
        extract: s => ({ value: s.pressures_applied, rate: perMin(s, s.pressures_applied) }),
      },
    ],
  },
  {
    key: 'control',
    metrics: [
      // Touches in final third per min: ball-keeping in dangerous areas.
      {
        key: 'final_third_touches_per_min',
        weight: 40,
        extract: s => ({
          value: s.touches_in_final_third,
          rate: perMin(s, s.touches_in_final_third),
        }),
      },
      // Aerials won %: composure in air duels.
      {
        key: 'aerial_win_pct',
        weight: 30,
        extract: s => ({
          value: s.aerials_won,
          rate: rate(s.aerials_won, s.aerials_attempted),
        }),
      },
      // Dispossessions per min — INVERSE (lower is better).
      {
        key: 'dispossessions_per_min',
        weight: 30,
        inverse: true,
        extract: s => ({ value: s.dispossessions, rate: perMin(s, s.dispossessions) }),
      },
    ],
  },
  {
    key: 'impact',
    metrics: [
      // Goals per min.
      {
        key: 'goals_per_min',
        weight: 35,
        extract: s => ({ value: s.goals, rate: perMin(s, s.goals) }),
      },
      // Assists per min.
      {
        key: 'assists_per_min',
        weight: 25,
        extract: s => ({ value: s.assists, rate: perMin(s, s.assists) }),
      },
      // Shot conversion %: how lethal when shooting.
      {
        key: 'shot_conversion_pct',
        weight: 20,
        extract: s => ({ value: s.goals, rate: rate(s.goals, s.shots) }),
      },
      // Key passes per min: creative end-product that didn't (yet) result in an
      // assist. Moved here from Passing so the user concern about progressive
      // vs key pass overlap inside Passing is resolved.
      {
        key: 'key_passes_per_min',
        weight: 20,
        extract: s => ({ value: s.key_passes, rate: perMin(s, s.key_passes) }),
      },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────
// Position-aware category weights (rows sum to 100)
// ──────────────────────────────────────────────────────────────────

export const POSITION_WEIGHTS: Record<Position, Record<CategoryKey, number>> = {
  CB: { physical: 14, passing: 14, dribbling:  6, defending: 40, control: 14, impact: 12 },
  FB: { physical: 16, passing: 14, dribbling: 10, defending: 30, control: 14, impact: 16 },
  DM: { physical: 16, passing: 24, dribbling: 10, defending: 30, control: 12, impact:  8 },
  CM: { physical: 16, passing: 24, dribbling: 14, defending: 14, control: 18, impact: 14 },
  AM: { physical: 14, passing: 22, dribbling: 20, defending:  8, control: 18, impact: 18 },
  W:  { physical: 16, passing: 12, dribbling: 32, defending:  8, control: 12, impact: 20 },
  ST: { physical: 12, passing:  8, dribbling: 14, defending:  8, control: 18, impact: 40 },
}

// ──────────────────────────────────────────────────────────────────
// Benchmarks (HAND-TUNED — replace with empirical once we have data)
// ──────────────────────────────────────────────────────────────────

type BenchmarkTable = Record<MatchType, Record<string, Benchmark>>

/**
 * Sample benchmarks for U12 competitive. Replicate for other age groups.
 * Numbers are educated guesses anchored to:
 *   - StatsBomb pro benchmarks divided down (~0.3× to 0.5× for U12)
 *   - UEFA youth development reports
 *   - Coaching staff anecdotes — refine with each batch of real data
 *
 * Per-minute units throughout (e.g. distance_per_min = metres/min;
 * a U12 covering 70 m/min for 30 min = 2.1 km, plausible).
 */
const U12_BENCHMARKS: BenchmarkTable = {
  competitive: {
    // Physical
    distance_per_min:               { mean: 70,    std: 12,   source: 'estimate · youth football coaching lit' },
    high_intensity_runs_per_min:    { mean: 0.35,  std: 0.15, source: 'estimate' },
    top_speed_kmh:                  { mean: 22,    std: 3.5,  source: 'estimate · U12 sprint norms' },
    sprints_per_min:                { mean: 0.20,  std: 0.10, source: 'estimate' },
    // Passing
    pass_completion_pct:            { mean: 0.60,  std: 0.12, source: 'estimate · U12 grassroots' },
    progressive_passes_per_min:     { mean: 0.30,  std: 0.18, source: 'estimate' },
    pass_under_pressure_pct:        { mean: 0.45,  std: 0.15, source: 'estimate' },
    // Dribbling
    dribble_success_pct:            { mean: 0.45,  std: 0.18, source: 'estimate' },
    progressive_carries_per_min:    { mean: 0.20,  std: 0.12, source: 'estimate' },
    final_third_takeons_per_min:    { mean: 0.10,  std: 0.08, source: 'estimate' },
    // Defending
    tackle_success_pct:             { mean: 0.55,  std: 0.18, source: 'estimate' },
    interceptions_per_min:          { mean: 0.15,  std: 0.10, source: 'estimate' },
    ball_recoveries_per_min:        { mean: 0.25,  std: 0.12, source: 'estimate' },
    pressures_per_min:              { mean: 0.40,  std: 0.20, source: 'estimate · CV-derived' },
    // Control
    final_third_touches_per_min:    { mean: 0.30,  std: 0.18, source: 'estimate' },
    aerial_win_pct:                 { mean: 0.50,  std: 0.20, source: 'estimate' },
    dispossessions_per_min:         { mean: 0.12,  std: 0.08, source: 'estimate · INVERSE' },
    // Impact
    goals_per_min:                  { mean: 0.02,  std: 0.04, source: 'estimate · ~1 goal per 50 min' },
    assists_per_min:                { mean: 0.015, std: 0.03, source: 'estimate' },
    shot_conversion_pct:            { mean: 0.20,  std: 0.15, source: 'estimate' },
    key_passes_per_min:             { mean: 0.05,  std: 0.05, source: 'estimate' },
  },
  // Training intensity is typically ~75–85% of competitive. Adjust means
  // down but keep std similar. Pure placeholder until we have real data.
  training: {
    distance_per_min:               { mean: 55,    std: 12,   source: 'estimate · training intensity ~80% of comp' },
    high_intensity_runs_per_min:    { mean: 0.25,  std: 0.12, source: 'estimate' },
    top_speed_kmh:                  { mean: 19,    std: 3.5,  source: 'estimate' },
    sprints_per_min:                { mean: 0.14,  std: 0.08, source: 'estimate' },
    pass_completion_pct:            { mean: 0.65,  std: 0.12, source: 'estimate · less pressure in training' },
    progressive_passes_per_min:     { mean: 0.25,  std: 0.15, source: 'estimate' },
    pass_under_pressure_pct:        { mean: 0.50,  std: 0.15, source: 'estimate' },
    dribble_success_pct:            { mean: 0.50,  std: 0.18, source: 'estimate' },
    progressive_carries_per_min:    { mean: 0.18,  std: 0.10, source: 'estimate' },
    final_third_takeons_per_min:    { mean: 0.08,  std: 0.06, source: 'estimate' },
    tackle_success_pct:             { mean: 0.55,  std: 0.18, source: 'estimate' },
    interceptions_per_min:          { mean: 0.12,  std: 0.08, source: 'estimate' },
    ball_recoveries_per_min:        { mean: 0.22,  std: 0.10, source: 'estimate' },
    pressures_per_min:              { mean: 0.30,  std: 0.15, source: 'estimate' },
    final_third_touches_per_min:    { mean: 0.25,  std: 0.15, source: 'estimate' },
    aerial_win_pct:                 { mean: 0.50,  std: 0.20, source: 'estimate' },
    dispossessions_per_min:         { mean: 0.10,  std: 0.06, source: 'estimate · INVERSE' },
    goals_per_min:                  { mean: 0.025, std: 0.04, source: 'estimate · more goals scored in training' },
    assists_per_min:                { mean: 0.02,  std: 0.03, source: 'estimate' },
    shot_conversion_pct:            { mean: 0.22,  std: 0.15, source: 'estimate' },
    key_passes_per_min:             { mean: 0.05,  std: 0.05, source: 'estimate' },
  },
}

/** Lookup table by age group. Initially we duplicate U12 across the board —
 *  the tech team should populate other age groups from their own data. */
export const BENCHMARKS: Record<AgeGroup, BenchmarkTable> = {
  U8:  U12_BENCHMARKS,   // TODO: replace with U8-specific
  U10: U12_BENCHMARKS,   // TODO: replace with U10-specific
  U12: U12_BENCHMARKS,
  U14: U12_BENCHMARKS,   // TODO: replace with U14-specific
  U16: U12_BENCHMARKS,   // TODO: replace with U16-specific
  U18: U12_BENCHMARKS,   // TODO: replace with U18-specific
}

// ──────────────────────────────────────────────────────────────────
// Core math
// ──────────────────────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

/** z-score → 0–100 score (mean 50, ±1 std = ±15). */
function zToScore(z: number): number {
  return clamp(50 + z * 15, 0, 100)
}

/** Compute one metric's normalized score against its benchmark. Returns
 *  nulls if the metric was undefined (e.g. dribble success with 0 attempts). */
function scoreMetric(
  metric: MetricDef,
  stats: RawPlayerStats,
  benchmarks: Record<string, Benchmark>,
): MetricScore {
  const { value, rate: r } = metric.extract(stats)
  const benchmark = benchmarks[metric.key] ?? null

  if (r === null || benchmark === null) {
    return { key: metric.key, raw: value, rate: r, benchmark, z: null, score: null }
  }

  const z = (r - benchmark.mean) / benchmark.std
  const adjustedZ = metric.inverse ? -z : z
  return {
    key: metric.key,
    raw: value,
    rate: r,
    benchmark,
    z: adjustedZ,
    score: zToScore(adjustedZ),
  }
}

/** Weighted average over metric scores. Metrics returning null are skipped
 *  and remaining metrics' weights are renormalized — so a player with 0
 *  dribble attempts isn't penalised on dribble success, only on the volume
 *  metrics (progressive carries, take-ons), which IS correct. */
function aggregateCategory(metricScores: MetricScore[], defs: MetricDef[]): number {
  let weightedSum = 0
  let weightTotal = 0
  for (let i = 0; i < metricScores.length; i++) {
    const m = metricScores[i]
    const d = defs[i]
    if (m.score !== null) {
      weightedSum += m.score * d.weight
      weightTotal += d.weight
    }
  }
  if (weightTotal === 0) return 50 // no data at all → grant the player a neutral 50 for this category
  return weightedSum / weightTotal
}

/** A → F mapping (matches the tech team's existing grade bands). */
export function grade(score: number): Grade {
  if (score >= 80) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  if (score >= 35) return 'D'
  if (score >= 20) return 'E'
  return 'F'
}

// ──────────────────────────────────────────────────────────────────
// Public entrypoint
// ──────────────────────────────────────────────────────────────────

const MIN_MINUTES_FOR_CONFIDENT_SCORE = 10

export function scorePlayer(stats: RawPlayerStats): PlayerScore {
  const benchmarkTable = BENCHMARKS[stats.age_group][stats.match_type]
  const positionWeights = POSITION_WEIGHTS[stats.position]

  // Score each category
  const categories: Partial<Record<CategoryKey, CategoryScore>> = {}
  for (const cat of CATEGORIES) {
    const metricScores = cat.metrics.map(m => scoreMetric(m, stats, benchmarkTable))
    const catScore = aggregateCategory(metricScores, cat.metrics)
    categories[cat.key] = {
      category: cat.key,
      metrics: metricScores,
      score: catScore,
    }
  }

  // Position-weighted composite
  let composite = 0
  for (const cat of CATEGORIES) {
    composite += categories[cat.key]!.score * positionWeights[cat.key]
  }
  composite = composite / 100 // weights sum to 100

  return {
    overall: composite,
    grade: grade(composite),
    categories: categories as Record<CategoryKey, CategoryScore>,
    context: {
      age_group: stats.age_group,
      position: stats.position,
      match_type: stats.match_type,
      minutes_played: stats.minutes_played,
      insufficient_sample: stats.minutes_played < MIN_MINUTES_FOR_CONFIDENT_SCORE,
    },
  }
}
