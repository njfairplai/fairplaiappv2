'use client'

import Badge from '@/components/ui/Badge'
import { COLORS, SHADOWS } from '@/lib/constants'
import type { Pitch } from '@/lib/types'
import { sessions } from '@/lib/mockData'

export default function PitchCard({ pitch }: { pitch: Pitch }) {
  const todaySessions = sessions.filter((s) => s.pitchId === pitch.id && s.date === '2026-02-24')
  const cameraVariant = pitch.cameraStatus === 'active' ? 'success' : pitch.cameraStatus === 'calibrating' ? 'warning' : 'neutral'

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{pitch.name}</p>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{pitch.type}</p>
        </div>
        <Badge variant={cameraVariant}>{pitch.cameraStatus}</Badge>
      </div>
      {todaySessions.length > 0 ? (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 6 }}>Today</p>
          {todaySessions.map((s) => (
            <p key={s.id} style={{ fontSize: 13, color: COLORS.navy, margin: '4px 0' }}>
              {s.startTime}–{s.endTime} · {s.type === 'match' ? `Match: ${s.opponent}` : 'Training'}
            </p>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: COLORS.muted }}>No sessions today</p>
      )}
    </div>
  )
}
