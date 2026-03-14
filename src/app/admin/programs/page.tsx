'use client'

import { useState, useEffect } from 'react'
import { rosters, programs } from '@/lib/mockData'
import { COLORS, SHADOWS } from '@/lib/constants'
import {
  Info,
  Calendar,
  CalendarDays,
  X,
  Plus,
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function formatDaysOfWeek(days: number[]): string {
  const names = days.map((d) => DAY_NAMES[d])
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' & ')
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
}

function countSessionsBetween(days: number[], start: string, end: string): number {
  if (!start || !end || days.length === 0) return 0
  let count = 0
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  const d = new Date(startDate)
  while (d <= endDate) {
    if (days.includes(d.getDay())) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

/* ─── component ───────────────────────────────────────────── */
export default function ProgramsPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [customPrograms, setCustomPrograms] = useState<any[]>([])

  /* ── Create Program form state ── */
  const [formName, setFormName] = useState('')
  const [formRoster, setFormRoster] = useState('')
  const [formDays, setFormDays] = useState<number[]>([])
  const [formStartTimes, setFormStartTimes] = useState<Record<number, string>>({})
  const [formLength, setFormLength] = useState<number>(90)
  const [formCustomLength, setFormCustomLength] = useState('')
  const [formTermStart, setFormTermStart] = useState('')
  const [formTermEnd, setFormTermEnd] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const academyRosters = rosters.filter((r) => r.academyId === 'academy_001')
  const academyPrograms = programs.filter((p) => p.academyId === 'academy_001')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fairplai_custom_programs')
      if (stored) setCustomPrograms(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const allPrograms = [...academyPrograms, ...customPrograms]

  /* program preview count */
  const previewCount = countSessionsBetween(formDays, formTermStart, formTermEnd)

  /* auto-suggest name when roster selected */
  useEffect(() => {
    if (formRoster) {
      const r = rosters.find((r) => r.id === formRoster)
      if (r) setFormName(`${r.name} — Program`)
    }
  }, [formRoster])

  function toggleDay(day: number) {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  function handleStartTimeChange(day: number, time: string) {
    setFormStartTimes((prev) => ({ ...prev, [day]: time }))
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Programs</h1>
      </div>

      {/* Info card */}
      <div style={{
        background: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 20,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Info size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
          Programs define your recurring schedule. Sessions are automatically generated from your programs and your facility contracts.
        </p>
      </div>

      {/* Program cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {allPrograms.map((prog) => {
          const roster = rosters.find((r) => r.id === prog.rosterId)
          const endTime = addMinutesToTime(prog.startTime, prog.sessionLengthMinutes)
          return (
            <div key={prog.id} style={{
              background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card,
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{prog.name}</span>
                <span style={{
                  background: `${COLORS.primary}1A`, color: COLORS.primary,
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  {roster?.name}
                </span>
              </div>
              {/* Schedule row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Calendar size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  {formatDaysOfWeek(prog.daysOfWeek)} &middot; {prog.startTime}&ndash;{endTime} &middot; {prog.sessionLengthMinutes} min
                </span>
              </div>
              {/* Term row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <CalendarDays size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  {formatDate(prog.termStart)} &ndash; {formatDate(prog.termEnd)}
                </span>
              </div>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span style={{
                  background: `${COLORS.success}1A`, color: COLORS.success,
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  {prog.sessionsGenerated} sessions generated
                </span>
                <span style={{
                  background: `${COLORS.warning}1A`, color: '#92400E',
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  0 conflicts
                </span>
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 16 }}>
                <button style={{
                  background: 'none', border: 'none', color: COLORS.primary,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
                }}>
                  Edit
                </button>
                <button style={{
                  background: 'none', border: 'none', color: COLORS.primary,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
                }}>
                  View Sessions
                </button>
              </div>
            </div>
          )
        })}
        {allPrograms.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.muted, fontSize: 14 }}>
            No programs yet. Create one to generate your training schedule.
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: COLORS.navy, color: '#fff', padding: '14px 28px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, boxShadow: SHADOWS.elevated, zIndex: 1000,
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

    </div>
  )
}
