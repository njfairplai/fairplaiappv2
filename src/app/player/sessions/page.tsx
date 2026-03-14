'use client'

import { useState, useMemo } from 'react'
import { sessions, sessionPreps, coachFeedbackHistory, highlights } from '@/lib/mockData'
import { playerTokens } from '@/styles/player-tokens'
import { NAV_HEIGHT } from '@/lib/constants'
import SessionPrepCard from '@/components/player/SessionPrepCard'
import CoachFeedbackCard from '@/components/player/CoachFeedbackCard'
import { ChevronDown, ChevronUp, Play, Check } from 'lucide-react'

const PLAYER_ID = 'player_001'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`
}

function getScoreColor(score: number) {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

// Fixed scores per session for demo
const sessionScores: Record<string, number> = {
  session_007: 81, session_006: 78, session_005: 75,
  session_004: 74, session_003: 72, session_002: 70, session_001: 68,
  session_009: 71, session_008: 68,
}

export default function PlayerSessionsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(s => s.status === 'scheduled' && s.participatingPlayerIds.includes(PLAYER_ID))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  const pastSessions = useMemo(() => {
    return sessions
      .filter(s =>
        (s.status === 'analysed' || s.status === 'playback_ready' || s.status === 'complete')
        && s.participatingPlayerIds.includes(PLAYER_ID)
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [])

  return (
    <div style={{ paddingBottom: NAV_HEIGHT + 16 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Sessions</h1>
      </div>

      {/* Upcoming */}
      {upcomingSessions.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: playerTokens.primary,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
          }}>
            Upcoming
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingSessions.map(session => {
              const prep = sessionPreps[session.id] || null
              const isExpanded = expandedId === session.id

              return (
                <div key={session.id}>
                  {isExpanded ? (
                    <div>
                      <button
                        onClick={() => setExpandedId(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 13, fontWeight: 600, color: playerTokens.primary,
                          padding: '0 0 10px', marginLeft: 0,
                        }}
                      >
                        <ChevronUp size={14} /> Hide details
                      </button>
                      <SessionPrepCard
                        session={session}
                        prep={prep}
                        playerId={PLAYER_ID}
                      />
                    </div>
                  ) : (
                    <SessionPrepCard
                      session={session}
                      prep={prep}
                      playerId={PLAYER_ID}
                      compact
                      onTap={() => setExpandedId(session.id)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
        }}>
          Completed
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pastSessions.map(session => {
            const score = sessionScores[session.id] ?? null
            const sessionHighlights = highlights.filter(h => h.sessionId === session.id && h.playerId === PLAYER_ID && h.privacy === 'parent_visible')
            const feedback = coachFeedbackHistory.find(f => f.playerId === PLAYER_ID)
            const isExpanded = expandedId === session.id
            const isMatch = session.type === 'match'
            const prep = sessionPreps[session.id] || null

            return (
              <div key={session.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    background: '#fff',
                    borderRadius: isExpanded ? '14px 14px 0 0' : 14,
                    border: '1px solid #E2E8F0',
                    borderBottom: isExpanded ? 'none' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Score circle */}
                  {score !== null ? (
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: `${getScoreColor(score)}12`,
                      border: `2px solid ${getScoreColor(score)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: getScoreColor(score) }}>{score}</span>
                    </div>
                  ) : (
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: '#F1F5F9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={18} color="#94A3B8" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                      {isMatch ? `vs ${session.opponent}` : 'Training'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {formatDate(session.date)} · {session.startTime}
                    </div>
                  </div>

                  {sessionHighlights.length > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      fontSize: 11, fontWeight: 600, color: '#8B5CF6',
                    }}>
                      <Play size={11} /> {sessionHighlights.length}
                    </div>
                  )}

                  {isExpanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                </button>

                {isExpanded && (
                  <div style={{
                    background: '#fff',
                    borderRadius: '0 0 14px 14px',
                    border: '1px solid #E2E8F0',
                    borderTop: '1px solid #F1F5F9',
                    padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    {/* Prep recap */}
                    {prep?.formationId && (
                      <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                          Your Game Plan
                        </div>
                        <SessionPrepCard session={session} prep={prep} playerId={PLAYER_ID} compact />
                      </div>
                    )}

                    {/* Highlights link */}
                    {sessionHighlights.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', background: '#F5F3FF', borderRadius: 10,
                      }}>
                        <Play size={14} color="#8B5CF6" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>
                          {sessionHighlights.length} highlight{sessionHighlights.length > 1 ? 's' : ''} from this session
                        </span>
                      </div>
                    )}

                    {/* Coach feedback */}
                    {feedback && <CoachFeedbackCard feedback={feedback} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
