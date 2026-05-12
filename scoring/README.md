# Player scoring algorithm — reference implementation

What's here:

- [`algorithm.ts`](algorithm.ts) — the algorithm, types, benchmark tables, position weights, and category definitions. ~430 lines, pure functions, no framework dependencies.
- [`example.ts`](example.ts) — re-scores the tech team's two example players using this algorithm. Run it to see side-by-side output.

## Run it

```bash
npx tsx scoring/example.ts
```

Expected output: per-player overall + grade + per-category breakdown.

## Port to Python

The TypeScript here is intentionally framework-free. Direct port:

- `interface` → `dataclass` or `TypedDict`
- The benchmark tables and position-weight tables port verbatim (just `dict` instead of `Record`)
- `scorePlayer()` → `score_player()` — pure function, no closures or framework calls
- The `extract` functions inside metric defs become small lambdas

A first-pass port should be ≤200 lines of Python and reproduce identical numeric output. We can pair on it.

## What's hand-tuned vs empirical

Every benchmark `{mean, std}` pair in `algorithm.ts` is **hand-tuned from coaching literature + reasoned defaults**. They're explicitly labelled `source: 'estimate'`. The plan:

1. **Now**: ship with these so the system produces sensible scores from day one.
2. **As data accumulates**: replace each metric's `{mean, std}` with the empirical mean and std-dev computed from FairplAI's own player-match table.
3. **Threshold for empirical**: ≥50 player-matches per age/match-type bucket. Below that, stick with hand-tuned to avoid overfitting to early adopters.

## Key design choices (read these before you change anything)

1. **Per-minute, not per-90, not raw totals.** Youth matches are 20–80 minutes; only a per-minute rate is comparable across formats.
2. **Separate benchmarks for competitive vs training.** Training intensity is typically ~75–85% of competitive. Mixing them produces nonsense. Scores are computed against the correct table based on `match_type`.
3. **Insufficient-sample flag** when `minutes_played < 10`. Scores still compute but the flag tells the UI to de-emphasise.
4. **Position-weighted composite** at the final aggregation step. A CB's Defending is weighted 30% of overall; a striker's Impact is 38%. Drives the right behaviour for each role.
5. **Quality > volume in metric selection.** Success rates carry most category weight; raw counts only appear where they measure something distinct (e.g. progressive carries — different from dribbles).
6. **Metric overlap is removed.** Pass completion appears in exactly ONE category (Passing). Same for dribble success (Dribbling), pressure resistance (Passing), etc.
7. **Inverse metrics** (dispossessions) are flagged with `inverse: true` so the z-score sign flips automatically.
8. **Null-safe rate handling.** A player with 0 dribble attempts has `dribble_success_pct = null` and is dropped from the category aggregation with the remaining weights renormalized — they're not penalised for lacking attempts, only for lacking the *volume* metrics. This matches what's actually fair.

## Open issues to resolve with the tech team

- Empirical benchmarks per age group (currently all default to U12 hand-tuned values).
- Opposition strength adjustment — out of scope for v1; revisit when we have data.
- Confidence interval per score (not just the insufficient-sample flag) — once we have empirical std-devs.
- "Impact for defenders" — currently a CB with the position-weight at 14% × Impact is fine; we could later redefine Impact's metrics per-position (clearances + blocks for CBs) but it's a v2 concern.
