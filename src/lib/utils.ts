import { COLORS } from './constants'

export function scoreColor(score: number): string {
  if (score >= 75) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}

export function scoreTier(score: number): 'green' | 'amber' | 'red' {
  if (score >= 75) return 'green'
  if (score >= 60) return 'amber'
  return 'red'
}

export function trendArrow(current: number, average: number): { symbol: string; color: string } {
  const diff = current - average
  if (diff > 3) return { symbol: '↑', color: COLORS.success }
  if (diff < -3) return { symbol: '↓', color: COLORS.error }
  return { symbol: '→', color: COLORS.muted }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function playerFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

export function percentileColor(pct: number): string {
  if (pct > 60) return COLORS.success
  if (pct >= 40) return COLORS.warning
  return COLORS.error
}

export function gradeFromScore(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  return 'D'
}
