'use client'

import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'
import { sessions, rosters, pitches } from '@/lib/mockData'
import type { Session } from '@/lib/types'

function statusBadge(status: Session['status']) {
  const map: Record<Session['status'], { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
    scheduled: { variant: 'neutral', label: 'Scheduled' },
    in_progress: { variant: 'warning', label: 'In Progress' },
    processing: { variant: 'info', label: 'Processing' },
    complete: { variant: 'info', label: 'Complete' },
    analysed: { variant: 'success', label: 'Analysed' },
    playback_ready: { variant: 'success', label: 'Playback Ready' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export default function SessionList() {
  const academySessions = sessions.filter((s) => s.academyId === 'academy_001')

  return (
    <div>
      {academySessions.map((s) => {
        const roster = rosters.find((r) => r.id === s.rosterId)
        const pitch = pitches.find((p) => p.id === s.pitchId)
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${COLORS.border}` }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, margin: 0 }}>
                {s.date} · {s.startTime}–{s.endTime}
              </p>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: '2px 0 0' }}>
                {roster?.name} · {pitch?.name} · {s.type === 'match' ? `vs ${s.opponent}` : 'Training'}
              </p>
            </div>
            {statusBadge(s.status)}
          </div>
        )
      })}
    </div>
  )
}
