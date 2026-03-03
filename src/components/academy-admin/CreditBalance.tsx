'use client'

import { COLORS, SHADOWS } from '@/lib/constants'
import { academies } from '@/lib/mockData'

export default function CreditBalance() {
  const academy = academies[0]
  const maxCredits = 60
  const pct = (academy.creditBalance / maxCredits) * 100

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: SHADOWS.card, textAlign: 'center' }}>
      {/* Gauge */}
      <div style={{ position: 'relative', width: 160, height: 80, margin: '0 auto 16px', overflow: 'hidden' }}>
        <svg width="160" height="80" viewBox="0 0 160 80">
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={COLORS.cloud} strokeWidth="12" strokeLinecap="round" />
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={academy.creditBalance < 10 ? COLORS.warning : COLORS.primary}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.2} 220`}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: COLORS.navy, lineHeight: 1, margin: 0 }}>{academy.creditBalance}</p>
          <p style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, margin: 0 }}>Credits</p>
        </div>
      </div>

      {academy.creditBalance < 10 && (
        <div style={{ background: `${COLORS.warning}15`, border: `1px solid ${COLORS.warning}40`, borderRadius: 10, padding: '10px 14px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: COLORS.navy, margin: 0, fontWeight: 600 }}>Low balance warning — consider topping up</p>
        </div>
      )}
    </div>
  )
}
