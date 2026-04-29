'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Pin, PinOff, X } from 'lucide-react'
import type { TimelineEvent } from '@/lib/types'

export type MinimapMode = 'docked' | 'floating' | 'hidden'

interface PitchMinimapProps {
  events: TimelineEvent[]
  currentSeconds: number
  mode: MinimapMode
  onModeChange: (mode: MinimapMode) => void
}

const POSITION_KEY = 'fairplai_minimap_position'
const ACTIVE_WINDOW_SECONDS = 8       // how long an event stays "active" on the map after it fires
const RECENT_TRAIL_SECONDS = 30       // how long ago events still show as a fading trail

function getEventBadge(eventType: string) {
  switch (eventType) {
    case 'goal':            return { color: '#22c55e', emoji: '⚽' }
    case 'key_pass':        return { color: '#4A4AFF', emoji: '🎯' }
    case 'sprint_recovery': return { color: '#9333ea', emoji: '🏃' }
    case 'tackle':          return { color: '#d97706', emoji: '🦶' }
    case 'save':            return { color: '#0891b2', emoji: '🧤' }
    default:                return { color: '#6b7280', emoji: '•' }
  }
}

function PitchSurface({ events, currentSeconds }: { events: TimelineEvent[]; currentSeconds: number }) {
  // Show events whose timestamp is within the recent trail window — fade by age.
  const visibleEvents = events.filter(e =>
    e.pitchX !== undefined &&
    e.pitchY !== undefined &&
    e.timestampSeconds <= currentSeconds &&
    currentSeconds - e.timestampSeconds <= RECENT_TRAIL_SECONDS
  )

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#2E7D32',
      borderRadius: 6,
      overflow: 'hidden',
      border: '1px solid #1B5E20',
    }}>
      {/* Pitch markings */}
      <div style={{ position: 'absolute', inset: '4%', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '4%', bottom: '4%', left: '50%', width: 1, background: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '14%', height: '22%', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      <div style={{ position: 'absolute', top: '22%', left: '4%', width: '14%', height: '56%', border: '1.5px solid rgba(255,255,255,0.4)', borderLeft: 'none' }} />
      <div style={{ position: 'absolute', top: '22%', right: '4%', width: '14%', height: '56%', border: '1.5px solid rgba(255,255,255,0.4)', borderRight: 'none' }} />

      {/* Event markers */}
      {visibleEvents.map(event => {
        const age = currentSeconds - event.timestampSeconds
        const isActive = age <= ACTIVE_WINDOW_SECONDS
        const opacity = isActive ? 1 : Math.max(0.25, 1 - (age - ACTIVE_WINDOW_SECONDS) / (RECENT_TRAIL_SECONDS - ACTIVE_WINDOW_SECONDS))
        const badge = getEventBadge(event.eventType)
        const size = isActive ? 14 : 10
        return (
          <div
            key={event.highlightId}
            style={{
              position: 'absolute',
              left: `${event.pitchX}%`,
              top: `${event.pitchY}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: badge.color,
              border: '1.5px solid rgba(255,255,255,0.9)',
              transform: 'translate(-50%, -50%)',
              opacity,
              boxShadow: isActive ? `0 0 8px ${badge.color}` : 'none',
              transition: 'opacity 0.2s ease, width 0.2s ease, height 0.2s ease',
              fontSize: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${event.eventType.replace('_', ' ')} · ${Math.floor(event.timestampSeconds / 60)}'`}
          >
            {isActive ? badge.emoji : ''}
          </div>
        )
      })}

      {/* Direction indicator */}
      <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: 0.3 }}>
        →
      </div>
    </div>
  )
}

function ChromeButton({ icon: Icon, onClick, title }: { icon: typeof X; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 22, height: 22, borderRadius: 4,
        background: 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
    >
      <Icon size={12} color="#fff" />
    </button>
  )
}

export default function PitchMinimap({ events, currentSeconds, mode, onModeChange }: PitchMinimapProps) {
  // Hydrate persisted floating position via lazy state init (no useEffect setState dance)
  const [floatPos, setFloatPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 24, y: 100 }
    try {
      const stored = window.localStorage.getItem(POSITION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed
        }
      }
    } catch { /* ignore */ }
    return { x: 24, y: 100 }
  })
  const [dragging, setDragging] = useState(false)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  // Mounted flag — false during SSR, true on the client. Used to guard the portal render.
  const [mounted, setMounted] = useState<boolean>(() => typeof document !== 'undefined')

  // Persist floating position (external system update — not a setState in effect)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem(POSITION_KEY, JSON.stringify(floatPos)) } catch { /* ignore */ }
  }, [floatPos])

  // Trigger re-render after hydration so portal can mount on the client
  useEffect(() => {
    if (!mounted) setMounted(true)
    // mounted is intentionally not in deps — only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Drag handlers (floating mode only)
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== 'floating') return
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    dragOffsetRef.current = { x: e.clientX - floatPos.x, y: e.clientY - floatPos.y }
    setDragging(true)
  }, [mode, floatPos])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const x = Math.max(8, Math.min(window.innerWidth - 220, e.clientX - dragOffsetRef.current.x))
    const y = Math.max(8, Math.min(window.innerHeight - 160, e.clientY - dragOffsetRef.current.y))
    setFloatPos({ x, y })
  }, [dragging])

  const onPointerUp = useCallback(() => setDragging(false), [])

  if (mode === 'hidden') return null

  // Shared body markup (chrome + pitch surface)
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chrome bar */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 6px',
          background: 'rgba(0,0,0,0.85)',
          cursor: mode === 'floating' ? (dragging ? 'grabbing' : 'grab') : 'default',
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Pitch map
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <ChromeButton
            icon={mode === 'floating' ? Pin : PinOff}
            onClick={() => onModeChange(mode === 'floating' ? 'docked' : 'floating')}
            title={mode === 'floating' ? 'Dock below video' : 'Pop out to floating'}
          />
          <ChromeButton icon={X} onClick={() => onModeChange('hidden')} title="Hide minimap" />
        </div>
      </div>

      {/* Pitch surface */}
      <div style={{ flex: 1, padding: 6, background: '#000' }}>
        <PitchSurface events={events} currentSeconds={currentSeconds} />
      </div>
    </div>
  )

  if (mode === 'docked') {
    return (
      <div style={{
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        height: 150,
      }}>
        {body}
      </div>
    )
  }

  // Floating mode — render via portal so it floats free of any containing chrome
  if (!mounted) return null
  return createPortal(
    <div style={{
      position: 'fixed',
      left: floatPos.x,
      top: floatPos.y,
      width: 220,
      height: 160,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
      zIndex: 1500,
      background: '#000',
    }}>
      {body}
    </div>,
    document.body,
  )
}
