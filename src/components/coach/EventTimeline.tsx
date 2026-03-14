'use client'

import { useState, useRef, useEffect } from 'react'
import type { TimelineEvent } from '@/lib/types'
import { COLORS } from '@/lib/constants'

interface EventTimelineProps {
  events: TimelineEvent[]
  durationMinutes: number
  players: Array<{ id: string; firstName: string; lastName: string; position: string[] }>
  onEventClick?: (event: TimelineEvent) => void
}

function getEventBadge(eventType: string) {
  switch (eventType) {
    case 'goal': return { bg: '#22c55e20', color: '#16a34a', label: 'Goal' }
    case 'key_pass': return { bg: '#4A4AFF20', color: '#4A4AFF', label: 'Key Pass' }
    case 'sprint_recovery': return { bg: '#9333ea20', color: '#9333ea', label: 'Sprint' }
    case 'tackle': return { bg: '#f5920020', color: '#d97706', label: 'Tackle' }
    case 'save': return { bg: '#06b6d420', color: '#0891b2', label: 'Save' }
    default: return { bg: '#6b728020', color: '#6b7280', label: eventType }
  }
}

const EVENT_TYPES = ['goal', 'key_pass', 'sprint_recovery', 'tackle', 'save'] as const

export default function EventTimeline({ events, durationMinutes, players, onEventClick }: EventTimelineProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [activePlayer, setActivePlayer] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; top: boolean }>({ x: 0, top: true })
  const timelineRef = useRef<HTMLDivElement>(null)

  // Close tooltip on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (timelineRef.current && !timelineRef.current.contains(e.target as Node)) {
        setSelectedEvent(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const totalSeconds = durationMinutes * 60

  // Filter events
  const filteredEvents = events.filter(e => {
    if (activeFilters.size > 0 && !activeFilters.has(e.eventType)) return false
    if (activePlayer && e.playerId !== activePlayer) return false
    return true
  })

  function toggleFilter(type: string) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function handleMarkerClick(event: TimelineEvent, pct: number) {
    if (selectedEvent?.highlightId === event.highlightId) {
      setSelectedEvent(null)
      return
    }
    setSelectedEvent(event)
    setTooltipPos({ x: pct, top: true })
    onEventClick?.(event)
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}'${secs.toString().padStart(2, '0')}"`
  }

  function getPlayerName(playerId: string): string {
    const player = players.find(p => p.id === playerId)
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown'
  }

  const showHalf = durationMinutes >= 70

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 20,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        <button
          onClick={() => setActiveFilters(new Set())}
          style={{
            padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600,
            border: activeFilters.size === 0 ? `2px solid ${COLORS.navy}` : '2px solid #E5E7EB',
            background: activeFilters.size === 0 ? COLORS.navy : '#fff',
            color: activeFilters.size === 0 ? '#fff' : COLORS.muted,
            cursor: 'pointer',
          }}
        >
          All ({events.length})
        </button>
        {EVENT_TYPES.map(type => {
          const badge = getEventBadge(type)
          const count = events.filter(e => e.eventType === type).length
          if (count === 0) return null
          const isActive = activeFilters.has(type)
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              style={{
                padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600,
                border: isActive ? `2px solid ${badge.color}` : '2px solid #E5E7EB',
                background: isActive ? badge.bg : '#fff',
                color: isActive ? badge.color : COLORS.muted,
                cursor: 'pointer',
              }}
            >
              {badge.label} ({count})
            </button>
          )
        })}

        {/* Player filter */}
        <select
          value={activePlayer}
          onChange={e => setActivePlayer(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '5px 8px', borderRadius: 8,
            border: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.navy,
            background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="">All Players</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} style={{ position: 'relative', padding: '40px 0 24px' }}>
        {/* Time labels */}
        <div style={{ position: 'absolute', top: 24, left: 0 }}>
          <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>0&apos;</span>
        </div>
        {showHalf && (
          <div style={{ position: 'absolute', top: 24, left: `${(45 / durationMinutes) * 100}%`, transform: 'translateX(-50%)' }}>
            <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>45&apos;</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 24, right: 0 }}>
          <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>{durationMinutes}&apos;</span>
        </div>

        {/* Bar */}
        <div style={{
          height: 6, borderRadius: 3, background: '#E2E8F0',
          position: 'relative', marginTop: 16,
        }}>
          {/* Half-time marker */}
          {showHalf && (
            <div style={{
              position: 'absolute', top: -8, bottom: -8,
              left: `${(45 / durationMinutes) * 100}%`,
              width: 1, background: '#94A3B8',
              borderLeft: '1px dashed #94A3B8',
            }} />
          )}

          {/* Event markers */}
          {filteredEvents.map(event => {
            const pct = Math.min(Math.max((event.timestampSeconds / totalSeconds) * 100, 1), 99)
            const badge = getEventBadge(event.eventType)
            const isSelected = selectedEvent?.highlightId === event.highlightId
            return (
              <div
                key={event.highlightId}
                onClick={(e) => { e.stopPropagation(); handleMarkerClick(event, pct) }}
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isSelected ? 16 : 12,
                  height: isSelected ? 16 : 12,
                  borderRadius: '50%',
                  background: badge.bg,
                  border: `2px solid ${badge.color}`,
                  cursor: 'pointer',
                  zIndex: isSelected ? 10 : 5,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 0 0 4px ${badge.color}30` : 'none',
                }}
              />
            )
          })}
        </div>

        {/* Tooltip */}
        {selectedEvent && (() => {
          const pct = (selectedEvent.timestampSeconds / totalSeconds) * 100
          const badge = getEventBadge(selectedEvent.eventType)
          const clampedLeft = Math.min(Math.max(pct, 15), 85)
          return (
            <div style={{
              position: 'absolute',
              left: `${clampedLeft}%`,
              bottom: 40,
              transform: 'translateX(-50%)',
              background: '#fff',
              borderRadius: 10,
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: `1px solid ${COLORS.border}`,
              zIndex: 20,
              minWidth: 160,
              whiteSpace: 'nowrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: badge.color,
                  background: badge.bg, padding: '2px 6px', borderRadius: 4,
                }}>{badge.label}</span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>@ {formatTime(selectedEvent.timestampSeconds)}</span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, margin: '2px 0' }}>
                {getPlayerName(selectedEvent.playerId)}
              </p>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>
                Confidence: {Math.round(selectedEvent.confidence * 100)}%
              </p>
              {/* Arrow */}
              <div style={{
                position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                width: 10, height: 10, background: '#fff',
                borderRight: `1px solid ${COLORS.border}`,
                borderBottom: `1px solid ${COLORS.border}`,
              }} />
            </div>
          )
        })()}
      </div>

      {/* Event count summary */}
      <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>
        {EVENT_TYPES.map(type => {
          const count = filteredEvents.filter(e => e.eventType === type).length
          if (count === 0) return null
          const badge = getEventBadge(type)
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: badge.color }} />
              <span style={{ fontSize: 11, color: COLORS.muted }}>{count} {badge.label}{count > 1 ? 's' : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
