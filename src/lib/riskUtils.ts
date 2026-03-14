import type { PlayerWorkload, RiskLevel } from '@/lib/types'

// ─── Risk Level Colors ───────────────────────────────────────
export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#27AE60',
  moderate: '#F39C12',
  high: '#E74C3C',
  critical: '#8B0000',
}

export const RISK_BG: Record<RiskLevel, string> = {
  low: 'rgba(39,174,96,0.10)',
  moderate: 'rgba(243,156,18,0.10)',
  high: 'rgba(231,76,60,0.10)',
  critical: 'rgba(139,0,0,0.12)',
}

// ─── ACWR Calculation ────────────────────────────────────────
export function calculateACWR(weeklyLoads: number[]): number {
  if (weeklyLoads.length < 8) return 1.0
  const acute = weeklyLoads[7]
  const chronicSlice = weeklyLoads.slice(4, 8)
  const chronic = chronicSlice.reduce((sum, v) => sum + v, 0) / chronicSlice.length
  if (chronic === 0) return 0
  return acute / chronic
}

export function getRiskLevel(acwr: number): RiskLevel {
  if (acwr > 2.0) return 'critical'
  if (acwr > 1.5) return 'high'
  if (acwr > 1.3) return 'moderate'
  return 'low'
}

export function getRiskLabel(acwr: number): string {
  if (acwr > 2.0) return 'Critical'
  if (acwr > 1.5) return 'High'
  if (acwr > 1.3) return 'Moderate'
  if (acwr >= 0.8) return 'Optimal'
  return 'Undertraining'
}

// ─── Fatigue Flags ───────────────────────────────────────────
export interface FatigueFlag {
  icon: string
  label: string
}

export function getFatigueFlags(workload: PlayerWorkload, strain: 'low' | 'moderate' | 'high'): FatigueFlag[] {
  const flags: FatigueFlag[] = []
  if (workload.restDaysLast7 < 2) flags.push({ icon: '\u26A0\uFE0F', label: 'Low rest' })
  if (workload.intensityAvg > 8) flags.push({ icon: '\u26A0\uFE0F', label: 'High intensity' })
  if (strain === 'high') flags.push({ icon: '\u26A0\uFE0F', label: 'High strain' })
  return flags
}

// ─── Recommendations ─────────────────────────────────────────
export function getRecommendations(acwr: number, workload: PlayerWorkload, strain: 'low' | 'moderate' | 'high'): string[] {
  const recs: string[] = []
  const risk = getRiskLevel(acwr)

  if (risk === 'critical') {
    recs.push('Immediate load reduction required. Consider rest day or active recovery only.')
    recs.push('Monitor for signs of overtraining syndrome: persistent fatigue, mood changes, decreased performance.')
  }
  if (risk === 'high') {
    recs.push('Reduce training volume by 20-30% this week to bring ACWR into safe range.')
  }
  if (risk === 'moderate') {
    recs.push('Monitor closely. Maintain current load but avoid further increases this week.')
  }
  if (acwr < 0.8) {
    recs.push('Player is undertraining. Gradually increase load to avoid detraining and spike risk on return.')
  }
  if (workload.restDaysLast7 < 2) {
    recs.push('Insufficient rest days. Schedule at least 2 rest days per week.')
  }
  if (workload.intensityAvg > 8) {
    recs.push('Average intensity is very high. Include low-intensity technical sessions to manage fatigue.')
  }
  if (strain === 'high') {
    recs.push('Strain levels elevated. Consider reducing match minutes and prioritising recovery protocols.')
  }
  if (workload.injuryHistory.length > 0) {
    const latestInjury = workload.injuryHistory[workload.injuryHistory.length - 1]
    recs.push(`Recent injury history (${latestInjury.type}). Apply graded return-to-play protocol.`)
  }
  if (recs.length === 0) {
    recs.push('Player is in good condition. Continue current training plan.')
  }
  return recs
}
