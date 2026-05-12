# Critique of the tech team's scoring formula (May 2026)

A response to the May 2026 scoring spec, structured as: (1) what's broken with evidence, (2) clarification questions for the tech team, (3) where we propose to land, (4) the runnable reference algorithm.

The tech team's draft is in `FairPlai-Scoring.docx`. Our existing target spec is [`SCORING_FORMULA_BRIEF.md`](SCORING_FORMULA_BRIEF.md). The runnable counter-proposal lives in [`scoring/`](scoring/).

---

## 1. What's broken

### 1.1 The formula rewards volume over quality — the worked example proves it

Reverse-engineering Player A's Dribbling category score (81) with the tech team's weights:

| Metric | Weight | Player A raw | Implied normalized score |
|---|---|---|---|
| Dribble success rate | 40% | 25% (1 of 4) | ~70 |
| Total defenders beaten | 25% | (not stated, ≤ attempts) | ~80 |
| Dribble attempts | 20% | 4 | ~90+ |
| Dribbles in final third | 15% | not stated | ~95 |

`0.40 × 70 + 0.25 × 80 + 0.20 × 90 + 0.15 × 95 ≈ 80.25` → matches the 81 in the doc.

**A player who failed 3 of 4 dribbles scores Grade B in Dribbling**. A hypothetical player with 10 attempts at 0% success would score *higher* than one with 1 attempt at 100% success. That's broken.

Same pattern in Passing (Total passes 20% as additive volume) and Defending (Tackles won 30% as raw count alongside Tackle success rate 30%).

### 1.2 Overlapping metrics counted twice

| Pair | Overlap |
|---|---|
| **Progressive pass** (25%) vs **Key pass** (20%) | Per StatsBomb: progressive = ≥10 m toward goal; key = pass that directly leads to a shot. Different definitions but correlated ~0.7. Combined 45% of Passing weight is one underlying axis. |
| **Dribble success rate** (40%) vs **Total defenders beaten** (25%) | Defenders beaten ≈ successful dribbles × defenders per dribble. ~65% of Dribbling on one axis. |
| **Tackles won** (30%) vs **Tackle success rate** (30%) | Near-identical. Success rate = won / attempted. 60% of Defending on one signal. |
| **Pass completion** in Passing (35%) AND Control (25%) | Same metric in two categories. Double-counted. |
| **Dribble success rate** in Dribbling (40%) AND Control (20%) | Same problem. |

### 1.3 No age/position normalization — your own brief explicitly requires it

[`SCORING_FORMULA_BRIEF.md`](SCORING_FORMULA_BRIEF.md) specifies z-score normalization against age-group benchmarks. The tech team's doc never references this. "33% pass completion → 50.2 Passing score" has no traceable derivation.

### 1.4 Flat category weights ignore position

The tech team uses **the same 21/18/17/16/14/14 split for every player**. A centre-back gets Impact at 21% — meaning Goals (40% of Impact) is worth 8.4% of their overall score. A CB with zero goals is structurally penalised. The brief specifies position-aware weights. Not implemented.

### 1.5 Data quality red flags in the example

- **Top speed 42.97 km/h** on a youth player. Elite *adult* sprint speed is ~44 km/h. Likely a CV tracking artifact (briefly assigning a flying ball to a player).
- **Distance 0.61 km** in a match. Real youth full-match distances are 4–8 km. Suggests the data is a clip, not a full match — which is why we need **per-minute** normalization, not per-match totals.

### 1.6 The "floor of 20"

Player B's Physical floored at 20 because of low movement. The floor hides a data quality issue. Better: flag "insufficient sample" when minutes_played is small, rather than silently clamp a raw zero.

---

## 2. Clarification questions for the tech team

Copy-paste ready. Numbered so they can address each in their reply.

> Thanks for the formula draft. Before we sign off, we need clarity on the items below — most are definitions, a few are arithmetic.
>
> **Definitions** — please give the exact unambiguous definition for each of:
> 1. **Progressive pass** — distance threshold? Only toward opponent goal? (StatsBomb: ≥10 m toward goal.)
> 2. **Key pass** — pass that directly precedes a shot, or also one-pass-removed?
> 3. **Total defenders beaten** — distinct from "successful dribbles"? Can one dribble beat multiple defenders?
> 4. **Tackles won** — possession retained by tackler's team after the tackle, or any tackle that dispossessed the opponent?
> 5. **Pressure resistance** — pass accuracy when within X metres of a defender? What's X?
> 6. **Dribbles in final third** — by start location or end location?
>
> **Arithmetic — show the working** for at least one player going from raw → category score:
>
> 7. Player A's Dribbling = 81. Inputs: 4 attempts, 25% success rate, defenders beaten ≤ 4, final-third dribbles unstated. Walk us through how each of those four numbers becomes a 0–100 normalized value, then how those four combine into 81.
>
> **Normalization**
>
> 8. Are raw values z-scored against an age-group benchmark per the brief? If yes, where does the benchmark dataset live and how are means/std-devs sourced? If no, what's the normalization function for "33% pass completion → 50.2 Passing score"?
> 9. Per-minute, per-90, or raw match total? Player A had 0.61 km distance — short clip or full match?
>
> **Overlaps**
>
> 10. **Tackles won (30%) + Tackle success rate (30%)** = 60% of Defending on overlapping signals. Suggest replacing "Tackles won" with "Tackles attempted" so we have both volume and quality, OR dropping one.
> 11. **Pass completion** in both Passing (35%) and Control (25%). Same metric, two categories — intentional?
> 12. **Dribble success rate** same problem (Dribbling 40% + Control 20%).
> 13. **Progressive pass vs key pass** — please confirm the definitions don't collapse on the same event. If correlated, the 25% + 20% combined weight is misleading.
> 14. **Dribble attempts** at 20% — a player attempting more low-success dribbles currently scores higher than one with fewer high-success ones. Intended?
>
> **Position weights**
>
> 15. Category weights (Impact 21%, Control 18%, …) appear identical for every player. The brief specifies position-aware weights. Planned for v2 or has it been dropped?
>
> **Sample size & data quality**
>
> 16. The "floor of 20" silently rescues a player with very low touches. What's the trigger threshold (minutes? events? touches?) and can we surface "insufficient data" as a UI signal instead of a number?
> 17. Top speed 42.97 km/h on a youth player is anomalous (adult elite sprint is ~44 km/h). Units check, or filtering of tracking outliers (briefly-assigned ball flight)?
>
> **Missing pieces from the StatsBomb audit**
>
> 18. The StatsBomb audit (Apr 2026) flagged pressures, ball recoveries, and progressive carries as CV-feasible additions that would meaningfully strengthen Defending and Dribbling. In scope for v2?

---

## 3. Where we propose to land

Three changes to the spec, in priority order.

### 3.1 Per-minute normalization (replaces per-match totals)

Youth football matches vary from 20-minute small-sided games to 80-minute U16 fixtures. Per-match totals aren't comparable. **All counts get converted to per-minute** before z-scoring. Success-rate metrics (pass completion, dribble success, tackle success, etc.) stay as percentages — those are already comparable across match lengths.

Sample-size flag: if `minutes_played < 10` the score still computes but a flag tells the UI to de-emphasise. No silent floor.

**On age benchmarking**: agreed that this is genuinely tricky for youth football — match lengths vary, training vs competitive intensity differs, opposition strength varies. The plan is:

1. **Phase 1 (now)**: ship hand-tuned benchmarks anchored to coaching literature. Every metric has a `{mean, std, source}` triple with `source: 'estimate'` so we know what's empirical and what's a guess.
2. **Phase 2 (≥50 player-matches per age/match-type bucket)**: replace each `{mean, std}` with the empirical value computed from FairplAI's own database.
3. **Phase 3**: revisit opposition-strength adjustment ("5 goals vs a weak side ≠ 5 goals vs a strong side"). Out of scope for v1 — too noisy with limited data.

**Training vs competitive get separate benchmark tables.** Training intensity is typically 75–85% of competitive. We score against the right table based on `match_type` and *don't average them together*.

**Recalibration scope when benchmarks update.** Term-scoped hybrid recompute. When benchmarks refresh, we recompute every match **in the current term only** against the new numbers — previous terms stay sealed at their original benchmarks. Each refresh is announced as an event so coaches and parents understand why in-term scores moved. Cross-term trends may show step-changes at term boundaries; UI labels this rather than hides it. (A term = 10–12 weeks; a season = up to 3 terms. Full design in `scoring/RECALIBRATION.md`.)

### 3.2 Redesigned categories — no overlaps, quality over volume

Each category has 3–4 **independent** metrics. Weights reflect quality > volume.

| Category | Metrics & weights | Dropped from tech team's draft |
|---|---|---|
| **Passing** | Pass completion 40% · Progressive passes/min 30% · Pass under pressure 30% | "Total passes" (volume-only). Key passes **moved to Impact**. |
| **Dribbling** | Dribble success rate 50% · Progressive carries/min 30% · Final-third take-ons/min 20% | "Total defenders beaten" (collapses into success rate × attempts). "Dribble attempts" (volume-only). |
| **Defending** | Tackle success rate 30% · Interceptions/min 25% · Ball recoveries/min 25% · Pressures/min 20% | "Tackles won" (overlaps success rate). Plus: **ball recoveries + pressures added** per StatsBomb audit. |
| **Physical** | Distance/min 30% · High-intensity runs/min 30% · Top speed 20% · Sprints/min 20% | None (already clean). |
| **Control** | Final-third touches/min 40% · Aerials won % 30% · Dispossessions/min (inverse) 30% | Pass completion (lives in Passing). Dribble success (lives in Dribbling). Total touches (replaced with final-third touches). |
| **Impact** | Goals/min 35% · Assists/min 25% · Shot conversion % 20% · **Key passes/min 20%** | Raw shot count (replaced with conversion). Key passes moved here so Passing has no creativity overlap. |

**Reconciling progressive pass vs key pass** (your specific concern): both stay in the spec but in *different* categories. Progressive lives in Passing (territory-gain measurement, can be anywhere on pitch). Key passes live in Impact (creative end-product — a pass that directly leads to a shot). Inside any single category, neither metric appears alongside the other. This both honors the genuine StatsBomb distinction *and* fixes the perception that they double-count.

### 3.3 Position-aware category weights

Rows sum to 100. Starting point — tunable.

| Pos | Phys | Pass | Drib | Def | Ctrl | Impact |
|---|---|---|---|---|---|---|
| **CB** | 14 | 14 |  6 | **40** | 14 | 12 |
| **FB** | 16 | 14 | 10 | **30** | 14 | 16 |
| **DM** | 16 | 24 | 10 | **30** | 12 |  8 |
| **CM** | 16 | **24** | 14 | 14 | 18 | 14 |
| **AM** | 14 | 22 | 20 |  8 | 18 | 18 |
| **W**  | 16 | 12 | **32** |  8 | 12 | 20 |
| **ST** | 12 |  8 | 14 |  8 | 18 | **40** |

Specialists get the bump: CB at 40% Defending, ST at 40% Impact, W at 32% Dribbling. DM lands on 30% Defending with Passing held at 24% (the two jobs of a screening midfielder). FB also at 30% Defending. CM stays as the b2b generalist. A CB's overall is now 40% Defending + 14% Impact (so Goals counts for ~4.2% of total — they're not penalised for not scoring). A striker's overall is 40% Impact (Goals worth ~14% of total — that's what should drive their score).

---

## 4. Reference algorithm

A runnable TypeScript implementation of the proposal lives in [`scoring/algorithm.ts`](scoring/algorithm.ts), with a demo runner in [`scoring/example.ts`](scoring/example.ts). Run:

```bash
npx tsx scoring/example.ts
```

Output: per-player overall + grade + per-category breakdown. The tech team can either:

1. Port to Python and integrate into their pipeline (~200 lines, half a day), OR
2. Use this as the spec and reimplement in their preferred stack, OR
3. Push back on specific choices (benchmark values, position weights, category structure) before we lock anything.

When the same two players from their worked example are pushed through this algorithm:

| Category | Tech team Player A | New algo Player A | Tech team Player B | New algo Player B |
|---|---|---|---|---|
| Physical | 57.3 | 74.0 | 20.0 (floored) | 24.2 |
| Passing | 50.2 | 27.3 | 59.2 | 54.0 |
| Dribbling | **81.0** | **35.4** | 38.8 | 20.0 |
| Defending | 55.1 | 40.1 | **76.8** | 53.1 |
| Control | 59.3 | 53.7 | 56.1 | 51.7 |
| Impact | 55.4 | 38.5 | 47.2 | 38.5 |
| **Overall** | **59.05 → C** | **44.87 → D** | **49.46 → D** | **43.70 → D** |

Headline differences:

- Player A's Dribbling drops **81 → 35.4** because 25% success rate IS below the U12 benchmark. Volume of attempts no longer rescues low quality.
- Player A's Physical rises **57 → 74** because their per-minute distance + sprints actually beat the benchmark.
- Player B's Defending drops **77 → 53** mostly because our spec expects ball recoveries + pressures, which the CV pipeline doesn't yet emit. That's a *required inputs* gap, not a formula flaw.
