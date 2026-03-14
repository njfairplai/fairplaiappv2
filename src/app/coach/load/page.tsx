'use client'

import { useState, useMemo } from 'react'
import { players, playerWorkloads, playerKeyMetrics, attendanceData } from '@/lib/mockData'
import { useTeam } from '@/contexts/TeamContext'
import { COLORS } from '@/lib/constants'
import { AlertTriangle, Shield, Activity, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import type { PlayerWorkload, RiskLevel } from '@/lib/types'

// ─── Squad-Player Map ────────────────────────────────────────
const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

// ─── Risk Level Colors ───────────────────────────────────────
const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#27AE60',
  moderate: '#F39C12',
  high: '#E74C3C',
  critical: '#8B0000',
}

const RISK_BG: Record<RiskLevel, string> = {
  low: 'rgba(39,174,96,0.10)',
  moderate: 'rgba(243,156,18,0.10)',
  high: 'rgba(231,76,60,0.10)',
  critical: 'rgba(139,0,0,0.12)',
}

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
}

// ─── ACWR Calculation ────────────────────────────────────────
function calculateACWR(weeklyLoads: number[]): number {
  if (weeklyLoads.length < 8) return 1.0
  const acute = weeklyLoads[7] // Last week (index 7)
  const chronicSlice = weeklyLoads.slice(4, 8) // Weeks 4-7
  const chronic = chronicSlice.reduce((sum, v) => sum + v, 0) / chronicSlice.length
  if (chronic === 0) return 0
  return acute / chronic
}

function getRiskLevel(acwr: number): RiskLevel {
  if (acwr > 2.0) return 'critical'
  if (acwr > 1.5) return 'high'
  if (acwr > 1.3) return 'moderate'
  return 'low'
}

function getRiskLabel(acwr: number): string {
  if (acwr > 2.0) return 'Critical'
  if (acwr > 1.5) return 'High'
  if (acwr > 1.3) return 'Moderate'
  if (acwr >= 0.8) return 'Optimal'
  return 'Undertraining'
}

// ─── Fatigue Flags ───────────────────────────────────────────
interface FatigueFlag {
  icon: string
  label: string
}

function getFatigueFlags(workload: PlayerWorkload, strain: 'low' | 'moderate' | 'high'): FatigueFlag[] {
  const flags: FatigueFlag[] = []
  if (workload.restDaysLast7 < 2) flags.push({ icon: '\u26A0\uFE0F', label: 'Low rest' })
  if (workload.intensityAvg > 8) flags.push({ icon: '\u26A0\uFE0F', label: 'High intensity' })
  if (strain === 'high') flags.push({ icon: '\u26A0\uFE0F', label: 'High strain' })
  return flags
}

// ─── Recommendations ─────────────────────────────────────────
function getRecommendations(acwr: number, workload: PlayerWorkload, strain: 'low' | 'moderate' | 'high'): string[] {
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

// ─── Player Risk Data ────────────────────────────────────────
interface PlayerRiskData {
  player: typeof players[0]
  workload: PlayerWorkload
  acwr: number
  riskLevel: RiskLevel
  riskLabel: string
  strain: 'low' | 'moderate' | 'high'
  fatigueFlags: FatigueFlag[]
  recommendations: string[]
}

// ─── Component ───────────────────────────────────────────────
export default function LoadDashboardPage() {
  const { selectedRosterId, availableRosters } = useTeam()
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null)

  const selectedRoster = availableRosters.find(r => r.id === selectedRosterId)

  // Build player risk data for the selected roster
  const playerRiskData: PlayerRiskData[] = useMemo(() => {
    const ids = rosterPlayerMap[selectedRosterId] || []
    const data: PlayerRiskData[] = []

    for (const pid of ids) {
      const player = players.find(p => p.id === pid)
      const workload = playerWorkloads.find(w => w.playerId === pid)
      if (!player || !workload) continue

      const acwr = calculateACWR(workload.weeklyLoads)
      const riskLevel = getRiskLevel(acwr)
      const riskLabel = getRiskLabel(acwr)
      const metrics = playerKeyMetrics[pid]
      const strain: 'low' | 'moderate' | 'high' = metrics?.strain ?? 'low'
      const fatigueFlags = getFatigueFlags(workload, strain)
      const recommendations = getRecommendations(acwr, workload, strain)

      data.push({ player, workload, acwr, riskLevel, riskLabel, strain, fatigueFlags, recommendations })
    }

    // Sort by risk level (critical first)
    data.sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel])

    return data
  }, [selectedRosterId])

  // Risk summary counts
  const riskCounts = useMemo(() => {
    const counts: Record<RiskLevel, number> = { critical: 0, high: 0, moderate: 0, low: 0 }
    for (const d of playerRiskData) {
      counts[d.riskLevel]++
    }
    return counts
  }, [playerRiskData])

  // Max weekly load for bar scaling
  const maxLoad = useMemo(() => {
    let max = 0
    for (const d of playerRiskData) {
      for (const v of d.workload.weeklyLoads) {
        if (v > max) max = v
      }
    }
    return max || 1
  }, [playerRiskData])

  function toggleExpand(playerId: string) {
    setExpandedPlayerId(prev => (prev === playerId ? null : playerId))
  }

  // ─── Styles ──────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: '#F8F9FC',
    paddingBottom: 100,
  }

  const headerStyle: React.CSSProperties = {
    padding: '28px 24px 20px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 800,
    color: COLORS.navy,
    letterSpacing: '-0.4px',
    margin: 0,
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  }

  const summaryGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    padding: '0 24px 20px',
  }

  const tableWrapperStyle: React.CSSProperties = {
    padding: '0 24px',
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.muted,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: 12,
    marginTop: 4,
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Load & Injury Risk</h1>
        <p style={subtitleStyle}>
          {selectedRoster ? selectedRoster.name : 'Select a squad'}
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div style={summaryGridStyle}>
        <RiskSummaryCard label="Critical Risk" count={riskCounts.critical} color="#8B0000" bgColor="rgba(139,0,0,0.10)" icon={<AlertTriangle size={18} color="#8B0000" />} />
        <RiskSummaryCard label="High Risk" count={riskCounts.high} color={COLORS.error} bgColor="rgba(231,76,60,0.10)" icon={<Activity size={18} color={COLORS.error} />} />
        <RiskSummaryCard label="Moderate" count={riskCounts.moderate} color={COLORS.warning} bgColor="rgba(243,156,18,0.10)" icon={<TrendingUp size={18} color={COLORS.warning} />} />
        <RiskSummaryCard label="Low Risk" count={riskCounts.low} color={COLORS.success} bgColor="rgba(39,174,96,0.10)" icon={<Shield size={18} color={COLORS.success} />} />
      </div>

      {/* Player Risk Table */}
      <div style={tableWrapperStyle}>
        <p style={sectionLabelStyle}>Player Risk Overview</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {playerRiskData.map(data => (
            <PlayerRiskRow
              key={data.player.id}
              data={data}
              expanded={expandedPlayerId === data.player.id}
              onToggle={() => toggleExpand(data.player.id)}
              maxLoad={maxLoad}
            />
          ))}
          {playerRiskData.length === 0 && (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: COLORS.muted,
              fontSize: 14,
              background: '#fff',
              borderRadius: 12,
            }}>
              No player workload data available for this squad.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Risk Summary Card ───────────────────────────────────────
function RiskSummaryCard({
  label,
  count,
  color,
  bgColor,
  icon,
}: {
  label: string
  count: number
  color: string
  bgColor: string
  icon: React.ReactNode
}) {
  const cardStyle: React.CSSProperties = {
    background: bgColor,
    borderRadius: 12,
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    border: `1px solid ${color}20`,
  }

  const countStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    color,
    lineHeight: 1,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color,
    textAlign: 'center',
    lineHeight: 1.2,
  }

  return (
    <div style={cardStyle}>
      {icon}
      <span style={countStyle}>{count}</span>
      <span style={labelStyle}>{label}</span>
    </div>
  )
}

// ─── Player Risk Row ─────────────────────────────────────────
function PlayerRiskRow({
  data,
  expanded,
  onToggle,
  maxLoad,
}: {
  data: PlayerRiskData
  expanded: boolean
  onToggle: () => void
  maxLoad: number
}) {
  const { player, workload, acwr, riskLevel, riskLabel, strain, fatigueFlags, recommendations } = data

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s ease',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    cursor: 'pointer',
    gap: 12,
    userSelect: 'none',
  }

  const nameColStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  }

  const nameStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.navy,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const posStyle: React.CSSProperties = {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  }

  const acwrStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 800,
    color: RISK_COLORS[riskLevel],
    minWidth: 50,
    textAlign: 'center',
  }

  const badgeStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: RISK_COLORS[riskLevel],
    background: RISK_BG[riskLevel],
    borderRadius: 20,
    padding: '3px 8px',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  }

  const flagsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 2,
    minWidth: 40,
    justifyContent: 'center',
  }

  const strainDotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: strain === 'high' ? COLORS.error : strain === 'moderate' ? COLORS.warning : COLORS.success,
  }

  const chevronStyle: React.CSSProperties = {
    color: COLORS.muted,
    flexShrink: 0,
  }

  // Expanded detail section
  const detailStyle: React.CSSProperties = {
    maxHeight: expanded ? 600 : 0,
    opacity: expanded ? 1 : 0,
    overflow: 'hidden',
    transition: 'max-height 0.35s ease, opacity 0.25s ease',
  }

  const detailInnerStyle: React.CSSProperties = {
    padding: '0 16px 16px',
    borderTop: `1px solid ${COLORS.border}`,
  }

  const weekLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8']

  return (
    <div style={cardStyle}>
      {/* Main Row */}
      <div style={rowStyle} onClick={onToggle}>
        {/* Player Info */}
        <div style={nameColStyle}>
          <p style={nameStyle}>{player.firstName} {player.lastName}</p>
          <p style={posStyle}>{player.position.join(', ')} &middot; #{player.jerseyNumber}</p>
        </div>

        {/* ACWR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: COLORS.muted, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>ACWR</span>
          <span style={acwrStyle}>{acwr.toFixed(2)}</span>
        </div>

        {/* Risk Badge */}
        <span style={badgeStyle}>{riskLabel}</span>

        {/* Fatigue Flags */}
        <div style={flagsStyle}>
          {fatigueFlags.length > 0 ? (
            <span style={{ fontSize: 14 }} title={fatigueFlags.map(f => f.label).join(', ')}>
              {fatigueFlags.map((_, i) => '\u26A0\uFE0F').join('')}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: COLORS.success }}>&#10003;</span>
          )}
        </div>

        {/* Strain Dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 50 }}>
          <div style={strainDotStyle} />
          <span style={{ fontSize: 10, color: COLORS.muted, textTransform: 'capitalize' as const }}>{strain}</span>
        </div>

        {/* Chevron */}
        <div style={chevronStyle}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Detail */}
      <div style={detailStyle}>
        <div style={detailInnerStyle}>
          {/* Weekly Load Trend */}
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, marginBottom: 10 }}>Weekly Load Trend</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {workload.weeklyLoads.map((load, idx) => {
                const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0
                const isLatest = idx === 7
                const barColor = isLatest ? RISK_COLORS[riskLevel] : COLORS.primary
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.muted, width: 34, textAlign: 'right' }}>
                      {weekLabels[idx]}
                    </span>
                    <div style={{ flex: 1, height: 16, background: COLORS.cloud, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: barColor,
                          borderRadius: 8,
                          opacity: isLatest ? 1 : 0.6,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isLatest ? RISK_COLORS[riskLevel] : COLORS.navy, width: 34, textAlign: 'right' }}>
                      {load}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Minutes Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <div style={{
              background: COLORS.cloud,
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                Last 7 Days
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, margin: 0 }}>
                {workload.minutesLast7}<span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}> min</span>
              </p>
            </div>
            <div style={{
              background: COLORS.cloud,
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                Last 28 Days
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, margin: 0 }}>
                {workload.minutesLast28}<span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}> min</span>
              </p>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
            <div style={{ background: COLORS.cloud, borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: COLORS.muted, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                Intensity Avg
              </p>
              <p style={{
                fontSize: 18,
                fontWeight: 800,
                color: workload.intensityAvg > 8 ? COLORS.error : workload.intensityAvg > 7 ? COLORS.warning : COLORS.navy,
                margin: 0,
              }}>
                {workload.intensityAvg.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted }}>/10</span>
              </p>
            </div>
            <div style={{ background: COLORS.cloud, borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: COLORS.muted, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                Rest Days
              </p>
              <p style={{
                fontSize: 18,
                fontWeight: 800,
                color: workload.restDaysLast7 < 2 ? COLORS.error : COLORS.navy,
                margin: 0,
              }}>
                {workload.restDaysLast7}<span style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted }}>/7</span>
              </p>
            </div>
            <div style={{ background: COLORS.cloud, borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: COLORS.muted, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                Strain
              </p>
              <p style={{
                fontSize: 18,
                fontWeight: 800,
                color: strain === 'high' ? COLORS.error : strain === 'moderate' ? COLORS.warning : COLORS.success,
                margin: 0,
                textTransform: 'capitalize' as const,
              }}>
                {strain}
              </p>
            </div>
          </div>

          {/* Injury History */}
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>Injury History</p>
            {workload.injuryHistory.length === 0 ? (
              <div style={{
                fontSize: 12,
                color: COLORS.success,
                background: 'rgba(39,174,96,0.08)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Shield size={13} color={COLORS.success} />
                No injury history on record
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {workload.injuryHistory.map((injury, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(231,76,60,0.06)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    borderLeft: `3px solid ${COLORS.error}`,
                  }}>
                    <AlertTriangle size={13} color={COLORS.error} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{injury.type}</span>
                      <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 8 }}>
                        {formatInjuryDate(injury.date)} &middot; {injury.daysOut} days out
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>Recommendations</p>
            <div style={{
              background: RISK_BG[riskLevel],
              borderRadius: 10,
              padding: '12px 14px',
              borderLeft: `3px solid ${RISK_COLORS[riskLevel]}`,
            }}>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: idx < recommendations.length - 1 ? 8 : 0,
                }}>
                  <span style={{ fontSize: 10, color: RISK_COLORS[riskLevel], marginTop: 2, flexShrink: 0 }}>{'\u25CF'}</span>
                  <span style={{ fontSize: 12, color: COLORS.navy, lineHeight: 1.5 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────
function formatInjuryDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
