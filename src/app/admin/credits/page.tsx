'use client'

import { useState, useEffect } from 'react'
import { academies, creditTransactions } from '@/lib/mockData'
import { COLORS, SHADOWS } from '@/lib/constants'
import { AlertTriangle, X } from 'lucide-react'

const PLAN_TOTAL = 120
const BALANCE = 47

export default function CreditsPage() {
  const academy = academies[0]
  const balance = academy.creditBalance
  const used = PLAN_TOTAL - balance

  const [warningDismissed, setWarningDismissed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [gaugeAnimated, setGaugeAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setGaugeAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  /* Gauge math — full circle */
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const usedPct = used / PLAN_TOTAL
  const dashOffset = circumference * (1 - usedPct)

  /* Average minutes per session for projection */
  const avgMinutes = creditTransactions.length > 0
    ? creditTransactions.reduce((sum, t) => sum + t.minutesAnalysed, 0) / creditTransactions.length
    : 40
  const projected = (balance / avgMinutes).toFixed(1)

  /* Roster name helper */
  function rosterForSession(sessionName: string): string {
    if (sessionName.includes('U12 Red')) return 'MAK U12 Red'
    if (sessionName.includes('U14 Blue')) return 'MAK U14 Blue'
    return 'MAK Academy'
  }

  const tiers = [
    { name: 'Development', minutes: '20 min/month', price: '500 AED/month', features: ['Basic analytics'], current: false },
    { name: 'Competitive', minutes: '120 min/month', price: '2,000 AED/month', features: ['Full match analysis', 'Highlight generation'], current: true },
    { name: 'Elite', minutes: 'Unlimited', price: '5,000 AED/month', features: ['Priority processing', 'Custom reports', 'API access'], current: false },
  ]

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 24px' }}>Analysis Minutes</h1>

      {/* Main balance card */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, boxShadow: SHADOWS.card,
        textAlign: 'center', marginBottom: 24,
      }}>
        <p style={{ fontSize: 48, fontWeight: 900, color: COLORS.primary, margin: 0, lineHeight: 1 }}>{balance}</p>
        <p style={{ fontSize: 16, color: COLORS.muted, margin: '8px 0 24px', fontWeight: 500 }}>minutes remaining</p>

        {/* SVG circular gauge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <svg width={160} height={160} viewBox={`0 0 ${160} ${160}`}>
            {/* Track */}
            <circle
              cx={80} cy={80} r={radius}
              fill="none"
              stroke={COLORS.border}
              strokeWidth={8}
            />
            {/* Fill arc */}
            <circle
              cx={80} cy={80} r={radius}
              fill="none"
              stroke={COLORS.primary}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={gaugeAnimated ? dashOffset : circumference}
              transform={`rotate(-90 80 80)`}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
            {/* Center text */}
            <text x={80} y={78} textAnchor="middle" fontSize={14} fill={COLORS.muted} fontWeight={600}>
              {balance} / {PLAN_TOTAL}
            </text>
            <text x={80} y={94} textAnchor="middle" fontSize={11} fill={COLORS.muted}>
              minutes
            </text>
          </svg>
        </div>

        <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>
          Competitive Plan &middot; {PLAN_TOTAL} minutes/month included
        </p>
      </div>

      {/* Low balance warning (show when < 50 for demo) */}
      {balance < 50 && !warningDismissed && (
        <div style={{
          background: '#FEF3C7', borderRadius: 12, padding: 16, marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <AlertTriangle size={20} color="#92400E" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: '#92400E', margin: 0, flex: 1, lineHeight: 1.5 }}>
            Running low on analysis time. Your next match session (~90 min) may exceed your remaining balance. Request a top-up or upgrade your plan.
          </p>
          <button
            onClick={() => setWarningDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          >
            <X size={18} color="#92400E" />
          </button>
        </div>
      )}

      {/* Transaction ledger */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card, marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Recent Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                {['Date', 'Session', 'Squad', 'Minutes Analysed', 'Balance After'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontWeight: 700,
                    color: COLORS.muted, fontSize: 12, textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creditTransactions.slice(0, 10).map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '10px 14px', color: COLORS.muted, whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: COLORS.navy }}>{t.session}</td>
                  <td style={{ padding: '10px 14px', color: COLORS.muted }}>{rosterForSession(t.session)}</td>
                  <td style={{ padding: '10px 14px', color: COLORS.primary, fontWeight: 700 }}>-{t.minutesAnalysed} min</td>
                  <td style={{ padding: '10px 14px', color: COLORS.navy, fontWeight: 600 }}>{t.balanceAfter} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projected usage */}
      <div style={{
        background: '#F5F6FC', borderRadius: 12, padding: 16, marginTop: 16, marginBottom: 24,
      }}>
        <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, lineHeight: 1.6 }}>
          At current rate, your balance covers approximately <strong>{projected} more match sessions</strong> this month.
        </p>
      </div>


      {/* Plans & Pricing */}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Plans & Pricing</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{
            background: '#fff', borderRadius: 12, padding: 24, boxShadow: SHADOWS.card,
            border: tier.current ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{tier.name}</h4>
              {tier.current && (
                <span style={{
                  background: `${COLORS.primary}1A`, color: COLORS.primary,
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                }}>
                  Current Plan
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, margin: '0 0 4px' }}>{tier.minutes}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: COLORS.navy, margin: '0 0 16px' }}>{tier.price}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tier.features.map((f) => (
                <li key={f} style={{
                  fontSize: 13, color: COLORS.muted, padding: '4px 0',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ color: COLORS.success, fontWeight: 700 }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  )
}
