import type { MatchAnalysis, PositionGroup } from '@/lib/types'

/**
 * Map a raw `Player.position[0]` string (e.g. "CB", "LWB", "ST") to one of
 * four broad position groups used throughout the coach product. Mirrors the
 * grouping on the match analysis page so the key-stat picks stay consistent.
 */
export function getPositionGroup(pos: string): PositionGroup {
  if (pos === 'GK') return 'goalkeeper'
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'SW'].includes(pos)) return 'defender'
  if (['ST', 'CF', 'LW', 'RW'].includes(pos)) return 'forward'
  return 'midfielder'
}

export interface KeyStat {
  label: string
  value: number
  suffix: string
}

/**
 * Position-aware key stats — pick the 2 numbers a coach actually cares about
 * for the player's role. Counts are derived from per-category scores (mock
 * data) until the AI pipeline ships real per-event totals (saves, tackles,
 * interceptions, goals, etc.).
 *
 * Mirrors the implementation on the match page so the squad pop-out and the
 * match-row stat cells read the same way for the same player.
 */
export function getKeyStats(pos: string, a: MatchAnalysis): [KeyStat, KeyStat] {
  const group = getPositionGroup(pos)
  if (group === 'goalkeeper') {
    return [
      { label: 'SAVES', value: Math.round(a.defendingScore / 10), suffix: '' },
      { label: 'PASS', value: a.passCompletion, suffix: '%' },
    ]
  }
  if (group === 'defender') {
    return [
      { label: 'TACKLES', value: Math.round(a.defendingScore / 10), suffix: '' },
      { label: 'INTS', value: Math.round(a.positionalScore / 8), suffix: '' },
    ]
  }
  if (group === 'forward') {
    return [
      { label: 'GOALS', value: Math.max(0, Math.round((a.dribblingScore - 50) / 30)), suffix: '' },
      { label: 'DRIB', value: a.dribbleSuccess, suffix: '%' },
    ]
  }
  // midfielder
  return [
    { label: 'KEY PASS', value: Math.round(a.passingScore / 20), suffix: '' },
    { label: 'PASS', value: a.passCompletion, suffix: '%' },
  ]
}

/**
 * Average a numeric field across a set of MatchAnalysis records.
 * Returns 0 if the array is empty.
 */
function avg(records: MatchAnalysis[], pick: (r: MatchAnalysis) => number): number {
  if (records.length === 0) return 0
  return records.reduce((acc, r) => acc + pick(r), 0) / records.length
}

/**
 * Aggregate a synthetic "season" MatchAnalysis from many records — used by
 * `getKeyStats` when the panel is in Whole-season scope rather than a single
 * match. Only the fields the key-stat formulas actually read are populated;
 * the rest are zeros (the function ignores them).
 */
export function aggregateSeasonAnalysis(records: MatchAnalysis[]): MatchAnalysis {
  return {
    id: 'season-aggregate',
    sessionId: 'season-aggregate',
    playerId: records[0]?.playerId ?? '',
    compositeScore:   Math.round(avg(records, r => r.compositeScore)),
    physicalScore:    Math.round(avg(records, r => r.physicalScore)),
    positionalScore:  Math.round(avg(records, r => r.positionalScore)),
    passingScore:     Math.round(avg(records, r => r.passingScore)),
    dribblingScore:   Math.round(avg(records, r => r.dribblingScore)),
    controlScore:     Math.round(avg(records, r => r.controlScore)),
    defendingScore:   Math.round(avg(records, r => r.defendingScore)),
    distanceCovered:  Math.round(avg(records, r => r.distanceCovered) * 10) / 10,
    topSpeed:         Math.round(avg(records, r => r.topSpeed) * 10) / 10,
    sprintCount:      Math.round(avg(records, r => r.sprintCount)),
    passCompletion:   Math.round(avg(records, r => r.passCompletion)),
    dribbleSuccess:   Math.round(avg(records, r => r.dribbleSuccess)),
    minutesPlayed:    Math.round(avg(records, r => r.minutesPlayed ?? 0)),
    highlights: [],
  }
}
