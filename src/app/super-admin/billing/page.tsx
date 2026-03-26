'use client'

import { DollarSign, CreditCard, Zap, TrendingUp } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { billingData, platformStats } from '@/lib/mockData'

export default function BillingPage() {
  const totalRevenue = billingData.reduce((sum, b) => sum + b.monthlyFee, 0)
  const totalCreditsIssued = billingData.reduce((sum, b) => sum + b.creditsIncluded, 0)

  const summaryStats = [
    { label: 'Total Monthly Revenue', value: `${totalRevenue.toLocaleString()} AED`, icon: DollarSign, color: COLORS.success },
    { label: 'Active Subscriptions', value: platformStats.activeSubscriptions, icon: CreditCard, color: COLORS.primary },
    { label: 'Total Credits Issued', value: totalCreditsIssued.toLocaleString(), icon: Zap, color: '#9333EA' },
    { label: 'Credits Consumed', value: platformStats.creditsConsumed.toLocaleString(), icon: TrendingUp, color: COLORS.warning },
  ]

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 24px' }}>Billing & Subscriptions</h1>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {summaryStats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: RADIUS.card, padding: 20, boxShadow: SHADOWS.card, display: 'flex', flexDirection: 'column' }}>
              <Icon size={22} color={s.color} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 28, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Per-Academy Billing Table */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Academy', 'Tier', 'Monthly Fee', 'Credits Included', 'Credits Used', 'Last Payment', 'Next Payment', 'Status'].map((h) => (
                <th key={h} style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {billingData.map((b) => (
              <tr key={b.academyId}>
                <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{b.name}</td>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                    background: b.tier === 'Professional' ? `${COLORS.primary}15` : `${COLORS.success}15`,
                    color: b.tier === 'Professional' ? COLORS.primary : COLORS.success,
                  }}>{b.tier}</span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{b.monthlyFee.toLocaleString()} {b.currency}</td>
                <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{b.creditsIncluded}</td>
                <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{b.creditsUsed}</span>
                    <div style={{ flex: 1, maxWidth: 80, height: 6, borderRadius: 3, background: COLORS.border }}>
                      <div style={{ width: `${(b.creditsUsed / b.creditsIncluded) * 100}%`, height: '100%', borderRadius: 3, background: (b.creditsUsed / b.creditsIncluded) > 0.8 ? COLORS.error : COLORS.primary }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{b.lastPayment}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{b.nextPayment}</td>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                    background: `${COLORS.success}15`, color: COLORS.success, textTransform: 'capitalize',
                  }}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
