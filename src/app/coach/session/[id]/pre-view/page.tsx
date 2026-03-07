'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { sessions, players, pitches, rosters } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import { SHADOWS, COLORS } from '@/lib/constants'
import { ChevronLeft, UserCheck, ListChecks, Video, RefreshCw, Sparkles } from 'lucide-react'

export default function SessionPreViewPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const session = sessions.find(s => s.id === sessionId)
  const [toast, setToast] = useState<string | null>(null)

  if (!session) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#F5F6FC' }}>
        <p>Session not found</p>
      </div>
    )
  }

  const pitch = pitches.find(p => p.id === session.pitchId)
  const roster = rosters.find(r => r.id === session.rosterId)
  const squadPlayers = players.filter(p => session.participatingPlayerIds.includes(p.id))

  function formatSessionDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const quickActions = [
    { icon: UserCheck, label: 'Attendance', color: '#27AE60', action: () => router.push(`/coach/session/${sessionId}/attendance`) },
    { icon: ListChecks, label: 'Drills', color: '#F39C12', action: () => showToast('Coming soon') },
    { icon: Video, label: 'Record', color: '#E74C3C', action: () => showToast('Coming soon') },
    { icon: RefreshCw, label: 'Session Type', color: '#4A4AFF', action: () => showToast('Coming soon') },
  ]

  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#0D1020', paddingBottom: 100 }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => router.push('/coach/hub')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={20} color={COLORS.primary} />
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary }}>Coach Hub</span>
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Session Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1B1650 0%, #282689 100%)',
          borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: SHADOWS.elevated,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
              background: session.type === 'match' ? 'rgba(74,74,255,0.25)' : 'rgba(39,174,96,0.25)',
              color: session.type === 'match' ? '#757FFF' : '#27AE60',
            }}>
              {session.type === 'match' ? 'Match' : 'Training'}
            </span>
            {roster && (
              <span style={{ fontSize: 11, color: 'rgba(245,246,252,0.4)' }}>{roster.name}</span>
            )}
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#F5F6FC', letterSpacing: '-0.5px', margin: 0 }}>
            {session.type === 'match' ? `vs ${session.opponent}` : 'Training Session'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.5)', marginTop: 6 }}>
            {formatSessionDate(session.date)}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.5)', marginTop: 2 }}>
            {session.startTime} – {session.endTime} · {pitch?.name || session.pitchId}
          </p>
          {session.competition && (
            <p style={{ fontSize: 12, color: 'rgba(245,246,252,0.35)', marginTop: 4 }}>{session.competition}</p>
          )}
        </div>

        {/* Quick Actions */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,246,252,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Quick Actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {quickActions.map(qa => {
            const Icon = qa.icon
            return (
              <button
                key={qa.label}
                onClick={qa.action}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${qa.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color={qa.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F6FC' }}>{qa.label}</span>
              </button>
            )
          })}
        </div>

        {/* Squad List */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,246,252,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Squad ({squadPlayers.length})
        </p>
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
          {squadPlayers.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderBottom: i < squadPlayers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <PlayerAvatar player={p} size="sm" showJersey />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#F5F6FC', margin: 0 }}>
                  {p.firstName} {p.lastName}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px',
                background: 'rgba(255,255,255,0.08)', color: 'rgba(245,246,252,0.5)',
              }}>
                {p.position[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Coach Mikel AI Nudge */}
        <div style={{
          background: 'linear-gradient(135deg, #1B1650, #3025AE)',
          borderRadius: 16, padding: 20, marginTop: 20,
          border: '1px solid rgba(74,74,255,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color="#F39C12" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F5F6FC' }}>Coach Mikel AI</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.7)', lineHeight: 1.6, margin: 0 }}>
            Based on recent sessions, consider focusing on transition play today. Ahmed and Saeed have shown improvement in counter-attacking runs — this could be a good session to build on that progress.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#1B1650', color: '#F5F6FC', padding: '10px 20px',
          borderRadius: 12, fontSize: 14, fontWeight: 600,
          boxShadow: SHADOWS.elevated, zIndex: 100,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
