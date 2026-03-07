'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { sessions, players, rosters } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import { SHADOWS, COLORS } from '@/lib/constants'
import { ChevronLeft } from 'lucide-react'

export default function AttendancePage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const session = sessions.find(s => s.id === sessionId)
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    // Default everyone to present
    const initial: Record<string, boolean> = {}
    session.participatingPlayerIds.forEach(pid => { initial[pid] = true })
    // Check if already saved
    const stored = localStorage.getItem(`fairplai_attendance_${sessionId}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        Object.keys(parsed).forEach(pid => { initial[pid] = parsed[pid] })
      } catch { /* ignore */ }
    }
    setAttendance(initial)
  }, [session, sessionId])

  if (!session) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#F5F6FC' }}>
        <p>Session not found</p>
      </div>
    )
  }

  const roster = rosters.find(r => r.id === session.rosterId)
  const squadPlayers = players.filter(p => session.participatingPlayerIds.includes(p.id))

  function formatSessionDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  function toggleAttendance(playerId: string) {
    setAttendance(prev => ({ ...prev, [playerId]: !prev[playerId] }))
  }

  function handleSave() {
    localStorage.setItem(`fairplai_attendance_${sessionId}`, JSON.stringify(attendance))
    setToast('Attendance saved ✓')
    setTimeout(() => {
      setToast(null)
      router.back()
    }, 1500)
  }

  const presentCount = Object.values(attendance).filter(Boolean).length

  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#0D1020', paddingBottom: 120 }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={20} color={COLORS.primary} />
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary }}>Back</span>
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F6FC', letterSpacing: '-0.4px', margin: 0 }}>Attendance</h1>
          <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.4)', marginTop: 4 }}>
            {formatSessionDate(session.date)} · {roster?.name}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.35)', marginTop: 2 }}>
            {presentCount} of {squadPlayers.length} present
          </p>
        </div>

        {/* Player List */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
          {squadPlayers.map((p, i) => {
            const present = attendance[p.id] ?? true
            return (
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
                <button
                  onClick={() => toggleAttendance(p.id)}
                  style={{
                    fontSize: 12, fontWeight: 700,
                    color: present ? '#fff' : '#fff',
                    background: present ? COLORS.success : '#EF4444',
                    border: 'none', borderRadius: 20,
                    padding: '5px 14px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minWidth: 70, textAlign: 'center',
                  }}
                >
                  {present ? 'Present' : 'Absent'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', marginTop: 24, padding: '14px 0',
            background: '#4A4AFF', color: '#fff', border: 'none',
            borderRadius: 14, fontSize: 16, fontWeight: 700,
            cursor: 'pointer', boxShadow: SHADOWS.elevated,
          }}
        >
          Save Attendance
        </button>
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
