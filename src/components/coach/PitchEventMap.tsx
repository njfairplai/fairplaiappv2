'use client'

import { useState } from 'react'
import type { TimelineEvent } from '@/lib/types'
import { COLORS } from '@/lib/constants'

interface PitchEventMapProps {
  events: TimelineEvent[]
  players: Array<{ id: string; firstName: string; lastName: string; position: string[] }>
}

function getEventBadge(eventType: string) {
  switch (eventType) {
    case 'goal': return { bg: '#22c55e', color: '#fff', label: 'Goal', emoji: '⚽' }
    case 'key_pass': return { bg: '#4A4AFF', color: '#fff', label: 'Key Pass', emoji: '🎯' }
    case 'sprint_recovery': return { bg: '#9333ea', color: '#fff', label: 'Sprint', emoji: '🏃' }
    case 'tackle': return { bg: '#d97706', color: '#fff', label: 'Tackle', emoji: '🦶' }
    case 'save': return { bg: '#0891b2', color: '#fff', label: 'Save', emoji: '🧤' }
    default: return { bg: '#6b7280', color: '#fff', label: eventType, emoji: '•' }
  }
}

export default function PitchEventMap({ events, players }: PitchEventMapProps) {
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null)

  const eventsWithLocation = events.filter(e => e.pitchX !== undefined && e.pitchY !== undefined)

  function getPlayerName(playerId: string): string {
    const player = players.find(p => p.id === playerId)
    return player ? `${player.firstName} ${player.lastName[0]}.` : 'Unknown'
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    return `${mins}'`
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '3 / 2',
      background: '#2E7D32',
      borderRadius: 10,
      overflow: 'hidden',
      border: '2px solid #1B5E20',
    }}>
      {/* Pitch markings */}
      <div style={{ position: 'absolute', inset: '4%', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '4%', bottom: '4%', left: '50%', width: 2, background: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '18%', height: '27%', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', transform: 'translate(-50%, -50%)' }} />
      <div style={{ position: 'absolute', top: '22%', left: '4%', width: '16%', height: '56%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 'none', borderRadius: '0 2px 2px 0' }} />
      <div style={{ position: 'absolute', top: '35%', left: '4%', width: '8%', height: '30%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 'none', borderRadius: '0 2px 2px 0' }} />
      <div style={{ position: 'absolute', top: '22%', right: '4%', width: '16%', height: '56%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 'none', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', top: '35%', right: '4%', width: '8%', height: '30%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 'none', borderRadius: '2px 0 0 2px' }} />

      {/* Direction arrow */}
      <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
        Attack →
      </div>

      {/* Event markers */}
      {eventsWithLocation.map(event => {
        const badge = getEventBadge(event.eventType)
        const isHovered = hoveredEvent?.highlightId === event.highlightId
        return (
          <div
            key={event.highlightId}
            onMouseEnter={() => setHoveredEvent(event)}
            onMouseLeave={() => setHoveredEvent(null)}
            style={{
              position: 'absolute',
              left: `${event.pitchX}%`,
              top: `${event.pitchY}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isHovered ? 20 : 10,
              cursor: 'pointer',
            }}
          >
            {/* Marker */}
            <div style={{
              width: isHovered ? 28 : 22,
              height: isHovered ? 28 : 22,
              borderRadius: '50%',
              background: badge.bg,
              border: '2px solid rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isHovered ? 14 : 11,
              boxShadow: isHovered ? '0 0 12px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.15s ease',
            }}>
              {badge.emoji}
            </div>

            {/* Tooltip */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: 6,
                background: 'rgba(0,0,0,0.85)',
                borderRadius: 8,
                padding: '6px 10px',
                whiteSpace: 'nowrap',
                zIndex: 30,
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0 }}>
                  {badge.label} · {formatTime(event.timestampSeconds)}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  {getPlayerName(event.playerId)}
                </p>
              </div>
            )}
          </div>
        )
      })}

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        display: 'flex', flexWrap: 'wrap', gap: 4,
      }}>
        {(['goal', 'key_pass', 'tackle', 'save', 'sprint_recovery'] as const).map(type => {
          const count = eventsWithLocation.filter(e => e.eventType === type).length
          if (count === 0) return null
          const badge = getEventBadge(type)
          return (
            <div key={type} style={{
              background: 'rgba(0,0,0,0.5)', borderRadius: 4,
              padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <span style={{ fontSize: 10 }}>{badge.emoji}</span>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
