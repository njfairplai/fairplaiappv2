'use client'

import { Building2, Users, Calendar, Zap } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { platformStats, academyStats, recentActivity } from '@/lib/mockData'

const activityColors: Record<string, string> = {
  session_analysed: '#9333EA',
  user_login: COLORS.primary,
  credits_consumed: COLORS.warning,
  player_added: COLORS.success,
  booking_renewed: '#6366F1',
  program_created: COLORS.primary,
  session_recorded: COLORS.success,
  highlights_released: '#EC4899',
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Yesterday'
  return `${diffD} days ago`
}

export default function SuperAdminDashboard() {
  const stats = [
    { label: 'Total Academies', value: platformStats.totalAcademies, icon: Building2, color: COLORS.primary },
    { label: 'Total Users', value: platformStats.totalUsers, icon: Users, color: COLORS.success },
    { label: 'Sessions This Month', value: platformStats.totalSessionsThisMonth, icon: Calendar, color: '#9333EA' },
    { label: 'Credits Consumed', value: platformStats.creditsConsumed, icon: Zap, color: COLORS.warning },
  ]

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 24px' }}>Platform Overview</h1>

      {/* Top Stats Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: RADIUS.card, padding: 20, boxShadow: SHADOWS.card, display: 'flex', flexDirection: 'column' }}>
              <Icon size={22} color={s.color} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 32, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{s.value.toLocaleString()}</p>
              <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Academy Performance */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.card, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Academy Performance</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Academy', 'Players', 'Coaches', 'Sessions (Month)', 'Credits Used', 'Credits Remaining', 'Tier', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {academyStats.map((a) => (
                <tr key={a.academyId}>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{a.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{a.players}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{a.coaches}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{a.sessionsThisMonth}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{a.creditsUsed}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{a.creditsRemaining}</td>
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                      background: a.subscriptionTier === 'professional' ? `${COLORS.primary}15` : `${COLORS.success}15`,
                      color: a.subscriptionTier === 'professional' ? COLORS.primary : COLORS.success,
                      textTransform: 'capitalize',
                    }}>{a.subscriptionTier}</span>
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                      background: `${COLORS.success}15`, color: COLORS.success, textTransform: 'capitalize',
                    }}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.card }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Recent Activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {recentActivity.map((act) => (
            <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                background: activityColors[act.type] || COLORS.muted,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: COLORS.navy, margin: 0 }}>{act.description}</p>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: '2px 0 0' }}>{act.academy}</p>
              </div>
              <span style={{ fontSize: 12, color: COLORS.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatTimestamp(act.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
