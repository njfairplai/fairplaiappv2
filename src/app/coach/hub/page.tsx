'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTeam } from '@/contexts/TeamContext'
import { sessions, players, rosters, pitches, playerFeedbackStatus, sessionsNeedingAttendance } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import EmptyState from '@/components/ui/EmptyState'
import { SHADOWS, COLORS } from '@/lib/constants'
import { Calendar, CheckCircle, MessageSquare } from 'lucide-react'

type HubTab = 'sessions' | 'attendance' | 'feedback'

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,246,252,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>
      {text}
    </p>
  )
}

export default function CoachHubPage() {
  const router = useRouter()
  const { selectedRosterId } = useTeam()
  const [activeTab, setActiveTab] = useState<HubTab>('sessions')
  const [attendanceMarked, setAttendanceMarked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check localStorage for already-marked attendance
    const marked: Record<string, boolean> = {}
    sessionsNeedingAttendance.forEach(sid => {
      const stored = localStorage.getItem(`fairplai_attendance_${sid}`)
      if (stored) marked[sid] = true
    })
    setAttendanceMarked(marked)
  }, [])

  const roster = rosters.find(r => r.id === selectedRosterId)
  const rosterSessions = sessions.filter(s => s.rosterId === selectedRosterId)

  // Sessions tab: upcoming + recent sessions
  const upcomingSessions = rosterSessions
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date))

  const recentSessions = rosterSessions
    .filter(s => s.status !== 'scheduled')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  // Attendance tab: sessions needing attendance
  const attendanceSessions = rosterSessions
    .filter(s => sessionsNeedingAttendance.includes(s.id))

  // Feedback tab: players with 10+ sessions since last feedback
  const rosterPlayers = players.filter(p =>
    rosterSessions.some(s => s.participatingPlayerIds.includes(p.id))
  )
  const feedbackDuePlayers = rosterPlayers.filter(p => {
    const status = playerFeedbackStatus[p.id]
    return status && status.sessionsSinceLastFeedback >= 10
  })

  const tabs: { key: HubTab; label: string }[] = [
    { key: 'sessions', label: 'Sessions' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'feedback', label: 'Feedback' },
  ]

  function formatSessionDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
  }

  function getPitchName(pitchId: string) {
    return pitches.find(p => p.id === pitchId)?.name || pitchId
  }

  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#0D1020', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 4px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F5F6FC', letterSpacing: '-0.4px', margin: 0 }}>Coach Hub</h1>
        {roster && <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.4)', marginTop: 4 }}>{roster.name}</p>}
      </div>

      {/* Tab Toggle */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 3 }}>
          {tabs.map(tab => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : 'rgba(245,246,252,0.45)',
                  background: active ? '#4A4AFF' : 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        {activeTab === 'sessions' && (
          <>
            {upcomingSessions.length > 0 && (
              <>
                <SectionLabel text="Upcoming" />
                {upcomingSessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/coach/session/${s.id}/pre-view`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '14px 16px', marginBottom: 10, width: '100%',
                      textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: s.type === 'match' ? 'rgba(74,74,255,0.15)' : 'rgba(39,174,96,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 18 }}>{s.type === 'match' ? '⚽' : '🏃'}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#F5F6FC', margin: 0 }}>
                          {s.type === 'match' ? `vs ${s.opponent}` : 'Training Session'}
                        </p>
                        <span style={{
                          fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px',
                          background: s.type === 'match' ? 'rgba(74,74,255,0.2)' : 'rgba(39,174,96,0.2)',
                          color: s.type === 'match' ? '#757FFF' : '#27AE60',
                        }}>
                          {s.type === 'match' ? 'Match' : 'Training'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(245,246,252,0.4)', marginTop: 3 }}>
                        {formatSessionDate(s.date)} · {s.startTime} – {s.endTime}
                      </p>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(245,246,252,0.3)', textAlign: 'right', flexShrink: 0, maxWidth: 90 }}>
                      {getPitchName(s.pitchId)}
                    </p>
                  </button>
                ))}
              </>
            )}

            {recentSessions.length > 0 && (
              <>
                <SectionLabel text="Recent" />
                {recentSessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/coach/session/${s.id}/pre-view`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14, padding: '14px 16px', marginBottom: 10, width: '100%',
                      textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 18 }}>{s.type === 'match' ? '⚽' : '🏃'}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#F5F6FC', margin: 0 }}>
                        {s.type === 'match' ? `vs ${s.opponent}` : 'Training Session'}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(245,246,252,0.4)', marginTop: 3 }}>
                        {formatSessionDate(s.date)} · {s.startTime} – {s.endTime}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 8px',
                      background: s.status === 'analysed' ? 'rgba(74,74,255,0.15)' : 'rgba(255,255,255,0.08)',
                      color: s.status === 'analysed' ? '#757FFF' : 'rgba(245,246,252,0.4)',
                    }}>
                      {s.status === 'analysed' ? 'Analysed' : s.status === 'playback_ready' ? 'Ready' : 'Complete'}
                    </span>
                  </button>
                ))}
              </>
            )}

            {upcomingSessions.length === 0 && recentSessions.length === 0 && (
              <div style={{ marginTop: 40 }}>
                <EmptyState
                  icon={<Calendar size={48} color="rgba(245,246,252,0.3)" />}
                  title="No sessions yet"
                  description="Sessions will appear here once scheduled"
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            <SectionLabel text="Needs Attendance" />
            {attendanceSessions.length > 0 ? (
              attendanceSessions.map(s => {
                const done = attendanceMarked[s.id]
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '14px 16px', marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#F5F6FC', margin: 0 }}>
                        {s.type === 'match' ? `vs ${s.opponent}` : 'Training Session'}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(245,246,252,0.4)', marginTop: 3 }}>
                        {formatSessionDate(s.date)} · {s.startTime}
                      </p>
                    </div>
                    {done ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={14} /> Done
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(`/coach/session/${s.id}/attendance`)}
                        style={{
                          fontSize: 12, fontWeight: 700, color: '#fff',
                          background: '#4A4AFF', border: 'none', borderRadius: 10,
                          padding: '7px 14px', cursor: 'pointer',
                        }}
                      >
                        Mark Attendance →
                      </button>
                    )}
                  </div>
                )
              })
            ) : (
              <div style={{ marginTop: 40 }}>
                <EmptyState
                  icon={<CheckCircle size={48} color="rgba(245,246,252,0.3)" />}
                  title="You're all caught up"
                  description="No sessions need attendance right now"
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'feedback' && (
          <>
            <SectionLabel text="Feedback Due" />
            {feedbackDuePlayers.length > 0 ? (
              feedbackDuePlayers.map(p => {
                const status = playerFeedbackStatus[p.id]
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '14px 16px', marginBottom: 10,
                    }}
                  >
                    <PlayerAvatar player={p} size="md" showJersey />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#F5F6FC', margin: 0 }}>
                        {p.firstName} {p.lastName}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(245,246,252,0.4)', marginTop: 2 }}>
                        {roster?.name} · {p.position[0]}
                      </p>
                      <p style={{ fontSize: 11, color: COLORS.warning, fontWeight: 600, marginTop: 2 }}>
                        {status?.sessionsSinceLastFeedback} sessions since last feedback
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/coach/player/${p.id}/feedback`)}
                      style={{
                        fontSize: 12, fontWeight: 700, color: '#fff',
                        background: '#4A4AFF', border: 'none', borderRadius: 10,
                        padding: '7px 14px', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      Give Feedback →
                    </button>
                  </div>
                )
              })
            ) : (
              <div style={{ marginTop: 40 }}>
                <EmptyState
                  icon={<MessageSquare size={48} color="rgba(245,246,252,0.3)" />}
                  title="You're all caught up"
                  description="All players have recent feedback"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
