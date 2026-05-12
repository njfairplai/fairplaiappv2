# Recalibration policy — how match scores handle benchmark updates

The scoring algorithm depends on age-group + match-type benchmarks (`{mean, std}` pairs in `algorithm.ts`). These benchmarks are not static — they refresh over time as our dataset grows. This document covers what happens to *already-scored* matches when the benchmarks underneath them change.

## The problem

If we recompute every match every time benchmarks update, scores users have already seen will shift even though the player did nothing differently. That destroys trust.

If we never recompute, trend lines over time become dishonest — a player's score appearing to improve might just be the benchmark getting harsher (or softer).

## The policy

**Hybrid, scoped to the current term.**

A **term** is 10–12 weeks of football activity. A **season** is up to three terms. (Memory: `project_terms_and_seasons.md`.)

When benchmarks refresh:

1. **Recompute every match in the current term** against the new benchmarks. Their stored score is overwritten with the new value.
2. **Past terms are sealed.** Matches from previous terms keep the score they had at the moment they were originally computed; they are NEVER recomputed.
3. **Each stored score carries the benchmark version that produced it** so the audit trail is intact.
4. **Recalibration is announced as an event.** "We refreshed the scoring benchmarks today; this term's scores have been recalibrated." Without the announcement, the in-term shift looks arbitrary.

## Why this works

- **Within a term**, all scores use the same benchmark → trends within a term are honest.
- **Past terms** are immutable → the historical record users have already seen never changes.
- **Cross-term trend lines** may show step-changes at term boundaries due to benchmark version shifts. UI should label this rather than hide it (a small "v2 → v3 benchmarks" marker between term cards is enough).
- **The Phase 1 → Phase 2 cliff** (hand-tuned → empirical) gets the loudest announcement because it's the largest shift. Subsequent monthly refreshes drift by single digits and are visually unobtrusive.

## Where this lives in the code

**Not in `algorithm.ts`.** The algorithm is a pure function: raw stats + age + position + match_type → score, given a specific benchmark table. It doesn't know about terms or versioning.

The recalibration logic lives one level up in the **orchestration / pipeline layer** the tech team will build:

- A `benchmark_versions` table that stores each set of `{age_group → metric → mean, std}` with a version id and an effective date.
- A `match_scores` table where each row references the benchmark_version it was scored against.
- A scheduled job (or manual trigger) that:
  1. Detects a benchmark refresh.
  2. Determines the current term.
  3. Re-scores every match in that term against the new benchmark version.
  4. Surfaces a UI event ("scores recalibrated") to coaches/parents.

## Open question for the tech team

- Backend schema: do `term_id` and `season_id` exist on the match record yet? Per the May 11 2026 discussion, this is still on their backlog. We need this before the recalibration job can be scoped correctly.
