'use client'

import type { CoachFeedback } from '@/lib/types'
import { playerTokens } from '@/styles/player-tokens'

function StarRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ fontSize: 14, color: i <= value ? '#F59E0B' : '#E2E8F0' }}>
            {i <= value ? '\u2605' : '\u2606'}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CoachFeedbackCard({ feedback }: { feedback: CoachFeedback }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
    }}>
      {/* Speech bubble header */}
      <div style={{
        background: playerTokens.bgSubtle,
        padding: '14px 16px',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: playerTokens.primaryGlow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14 }}>{'\uD83D\uDDE3\uFE0F'}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Coach Says</span>
        </div>
        <p style={{
          fontSize: 14, color: '#334155', lineHeight: 1.5, margin: 0,
          fontStyle: 'italic',
        }}>
          &ldquo;{feedback.summary}&rdquo;
        </p>
      </div>

      {/* Star ratings */}
      <div style={{ padding: '12px 16px' }}>
        <StarRow label="Attitude" value={feedback.attitude} />
        <StarRow label="Effort" value={feedback.effort} />
        <StarRow label="Coachability" value={feedback.coachability} />
        <StarRow label="Sportsmanship" value={feedback.sportsmanship} />
      </div>
    </div>
  )
}
