# Player Scoring Formula

## The Problem

Raw stats aren't comparable. 70% pass completion and 70% dribble success look the same but mean very different things. 5 tackles per game means something different for a U10 than a U14. We need a way to put every metric on the same scale.

## The Method

### Step 1: Normalize each raw stat

For every metric, we have a benchmark: the average and spread (standard deviation) for that age group.

**Formula:**

```
z = (player_value - age_group_average) / age_group_standard_deviation
score = 50 + (z × 15)    [clamped between 0 and 100]
```

**Example:**

| | Pass Completion | Dribble Success |
|---|---|---|
| Player's raw value | 70% | 70% |
| U12 average | 65% | 45% |
| U12 std deviation | 8% | 10% |
| z-score | +0.63 | +2.50 |
| **Normalized score** | **59** | **88** |

Same raw number, completely different scores. Because 70% passing is slightly above average for U12s, while 70% dribbling is exceptional.

A normalized score of 50 always means "average for your age." 65 means well above. 80 means elite. Regardless of which metric.

### Step 2: Aggregate within each category

Each category (e.g. Passing) has ~3 metrics. We take a weighted average. Weights vary by position.

```
category_score = (metric1_score × weight1) + (metric2_score × weight2) + (metric3_score × weight3)
```

### Step 3: Aggregate across categories

6 category scores averaged into one composite. Weights vary by position (defending weighted higher for defenders, shooting higher for strikers).

```
composite_score = weighted average of 6 category scores
```

## Data Inputs Required

1. **Raw stats per player** ... pending confirmation from AI tech team on which data points they can extract
2. **Benchmark mean and std deviation per metric per age group** ... will hardcode initial estimates from research, improve over time with our own data
3. **Weight tables per position** ... to be defined once categories and metrics are confirmed
