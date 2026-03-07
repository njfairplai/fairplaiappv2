'use client'

import { playerKeyMetrics } from '@/lib/mockData'
import ScoreArc from '@/components/charts/ScoreArc'
import { COLORS } from '@/lib/constants'

interface KeyMetricsBlockProps {
  playerId: string
  dark?: boolean
}

export default function KeyMetricsBlock({ playerId, dark = true }: KeyMetricsBlockProps) {
  const metrics = playerKeyMetrics[playerId]
  if (!metrics) return null

  const strainConfig = {
    low: { label: 'Low', color: COLORS.success, bg: dark ? 'rgba(39,174,96,0.15)' : `${COLORS.success}1A` },
    moderate: { label: 'Moderate', color: COLORS.warning, bg: dark ? 'rgba(243,156,18,0.15)' : `${COLORS.warning}1A` },
    high: { label: 'High', color: COLORS.error, bg: dark ? 'rgba(231,76,60,0.15)' : `${COLORS.error}1A` },
  }

  const strain = strainConfig[metrics.strain]

  const cardStyle: React.CSSProperties = {
    flex: 1,
    background: dark ? 'rgba(255,255,255,0.06)' : '#F5F6FC',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: dark ? '#F5F6FC' : COLORS.navy,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: 9,
    color: dark ? 'rgba(157,162,179,0.8)' : COLORS.muted,
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.3,
  }

  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
      {/* Technical Score */}
      <div style={cardStyle}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <ScoreArc score={metrics.technical} size={48} strokeWidth={3} dark={dark} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: dark ? '#F5F6FC' : COLORS.navy }}>{metrics.technical}</span>
          </div>
        </div>
        <p style={labelStyle}>Technical</p>
        <p style={subtitleStyle}>Performance vs. your baseline</p>
      </div>

      {/* Temperament Score */}
      <div style={cardStyle}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <ScoreArc score={metrics.temperament} size={48} strokeWidth={3} color="#9333ea" dark={dark} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: dark ? '#F5F6FC' : COLORS.navy }}>{metrics.temperament}</span>
          </div>
        </div>
        <p style={labelStyle}>Temperament</p>
        <p style={subtitleStyle}>Attitude & coachability</p>
      </div>

      {/* Strain */}
      <div style={cardStyle}>
        <div style={{
          height: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: strain.color, lineHeight: 1 }}>{strain.label}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: strain.color,
            background: strain.bg, padding: '2px 6px', borderRadius: 6,
          }}>Est.</span>
        </div>
        <p style={labelStyle}>Strain</p>
        <p style={subtitleStyle}>Estimated physical load</p>
      </div>
    </div>
  )
}
