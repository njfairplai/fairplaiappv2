'use client'

import { useState, useEffect } from 'react'
import { X, Bell, CheckCheck } from 'lucide-react'
import { COLORS } from '@/lib/constants'

// Import notifications from mockData - if it doesn't exist, use defaults
let mockNotifications: Array<{ id: string; userId: string; type: string; title: string; body: string; read: boolean; createdAt: string; channel: string }> = []
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require('@/lib/mockData')
  if (data.notifications) mockNotifications = data.notifications
} catch { /* use defaults */ }

if (mockNotifications.length === 0) {
  mockNotifications = [
    { id: 'n1', userId: 'coach_001', type: 'match_analysed', title: 'Match Analysis Complete', body: 'U12 Red vs Al Wasl Academy analysis is ready', read: false, createdAt: '2026-03-07T14:30:00Z', channel: 'in_app' },
    { id: 'n2', userId: 'coach_001', type: 'session_reminder', title: 'Session Tomorrow', body: 'U12 Red training at Pitch 2 — 17:00', read: false, createdAt: '2026-03-07T10:00:00Z', channel: 'in_app' },
    { id: 'n3', userId: 'coach_001', type: 'highlights_ready', title: 'Highlights Ready', body: '4 new highlight clips from the latest match', read: true, createdAt: '2026-03-06T18:00:00Z', channel: 'in_app' },
    { id: 'n4', userId: 'parent_001', type: 'match_analysed', title: 'New Match Report', body: 'Kiyan\'s latest match stats are ready to view', read: false, createdAt: '2026-03-07T14:30:00Z', channel: 'in_app' },
    { id: 'n5', userId: 'parent_001', type: 'highlights_ready', title: 'New Highlights', body: '2 new highlight clips featuring Kiyan', read: false, createdAt: '2026-03-07T12:00:00Z', channel: 'in_app' },
    { id: 'n6', userId: 'parent_001', type: 'weekly_summary', title: 'Weekly Summary', body: 'Kiyan\'s performance this week: Top 22% in distance', read: true, createdAt: '2026-03-05T09:00:00Z', channel: 'in_app' },
    { id: 'n7', userId: 'coach_001', type: 'credit_low', title: 'Credits Running Low', body: 'MAK Academy has 5 credits remaining', read: false, createdAt: '2026-03-04T16:00:00Z', channel: 'in_app' },
  ]
}

interface NotificationCentreProps {
  open: boolean
  onClose: () => void
  role: string
}

const TYPE_COLORS: Record<string, string> = {
  match_analysed: '#4A4AFF',
  highlights_ready: '#27AE60',
  weekly_summary: '#F39C12',
  credit_low: '#E74C3C',
  session_reminder: '#6E7180',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationCentre({ open, onClose, role }: NotificationCentreProps) {
  const [readState, setReadState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fairplai_notification_overrides')
      if (stored) {
        const parsed = JSON.parse(stored)
        const mapped: Record<string, boolean> = {}
        Object.entries(parsed).forEach(([k, v]) => { mapped[k] = (v as { read: boolean }).read })
        setReadState(mapped)
      }
    } catch { /* ignore */ }
  }, [])

  if (!open) return null

  const filtered = mockNotifications.filter(n => {
    if (role === 'coach') return n.userId.includes('coach')
    if (role === 'parent') return n.userId.includes('parent')
    return true
  })

  function isRead(id: string, defaultRead: boolean): boolean {
    return readState[id] !== undefined ? readState[id] : defaultRead
  }

  function markRead(id: string) {
    const newState = { ...readState, [id]: true }
    setReadState(newState)
    const stored: Record<string, { read: boolean }> = {}
    Object.entries(newState).forEach(([k, v]) => { stored[k] = { read: v } })
    localStorage.setItem('fairplai_notification_overrides', JSON.stringify(stored))
  }

  function markAllRead() {
    const newState = { ...readState }
    filtered.forEach(n => { newState[n.id] = true })
    setReadState(newState)
    const stored: Record<string, { read: boolean }> = {}
    Object.entries(newState).forEach(([k, v]) => { stored[k] = { read: v } })
    localStorage.setItem('fairplai_notification_overrides', JSON.stringify(stored))
  }

  const unreadCount = filtered.filter(n => !isRead(n.id, n.read)).length

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, background: '#fff', zIndex: 200, boxShadow: '0 8px 32px rgba(27,22,80,0.25)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: COLORS.primary, borderRadius: 10, padding: '2px 8px' }}>{unreadCount}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <Bell size={32} color={COLORS.border} />
              <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 12 }}>No notifications</p>
            </div>
          ) : (
            filtered.map(n => {
              const read = isRead(n.id, n.read)
              return (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ display: 'flex', gap: 12, padding: '14px 24px', cursor: 'pointer', background: read ? '#fff' : '#F8F9FC', borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.15s' }}>
                  {/* Unread dot */}
                  <div style={{ width: 6, minWidth: 6, marginTop: 6 }}>
                    {!read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.primary }} />}
                  </div>
                  {/* Icon */}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${TYPE_COLORS[n.type] || COLORS.muted}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={16} color={TYPE_COLORS[n.type] || COLORS.muted} />
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: read ? 500 : 600, color: '#0F172A', margin: 0 }}>{n.title}</p>
                    <p style={{ fontSize: 13, color: COLORS.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>
                  </div>
                  {/* Time */}
                  <span style={{ fontSize: 12, color: '#9DA2B3', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
