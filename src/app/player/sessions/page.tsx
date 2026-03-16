'use client'

import { useState, useMemo } from 'react'
import { sessions, sessionPreps } from '@/lib/mockData'
import { playerTokens } from '@/styles/player-tokens'
import { NAV_HEIGHT } from '@/lib/constants'
import SessionPrepCard from '@/components/player/SessionPrepCard'
import { ChevronUp } from 'lucide-react'

const PLAYER_ID = 'player_001'


export default function PlayerSessionsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(s => s.status === 'scheduled' && s.participatingPlayerIds.includes(PLAYER_ID))
      .sort((a, b) => a.date.localeCompare(b.date))
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

      {/* Empty state when no upcoming sessions */}
      {upcomingSessions.length === 0 && (
        <div style={{ padding: '40px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>No upcoming sessions</p>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Your next training or match will appear here</p>
        </div>
      )}
    </div>
  )
}
