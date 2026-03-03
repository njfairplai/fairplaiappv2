'use client'

import { useState, useRef, useMemo } from 'react'
import { FileText, Calendar, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { sessions, leaseContracts, pitches, academies, rosters } from '@/lib/mockData'
import type { Session, LeaseContract } from '@/lib/types'

const FACILITY_ID = 'facility_001'
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateShort(d: Date): string {
  return `${DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()}`
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getAcademyShort(academyId: string): string {
  const a = academies.find(ac => ac.id === academyId)
  if (!a) return '?'
  if (a.name.includes('MAK')) return 'MAK'
  if (a.name.includes('Desert')) return 'DE'
  return a.name.slice(0, 3).toUpperCase()
}

function sessionDurationMinutes(s: Session): number {
  const [sh, sm] = s.startTime.split(':').map(Number)
  const [eh, em] = s.endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

export default function FacilityDashboard() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [renewContract, setRenewContract] = useState<LeaseContract | null>(null)
  const [renewEndDate, setRenewEndDate] = useState('')
  const [renewRate, setRenewRate] = useState('')
  const [renewSuccess, setRenewSuccess] = useState(false)

  const expiringRef = useRef<HTMLDivElement>(null)

  const facilitySessions = useMemo(() => sessions.filter(s => s.facilityId === FACILITY_ID), [])
  const facilityContracts = useMemo(() => leaseContracts.filter(c => c.facilityId === FACILITY_ID), [])
  const facilityPitches = useMemo(() => pitches.filter(p => p.facilityId === FACILITY_ID), [])

  const activeAndExpiring = facilityContracts.filter(c => c.status === 'active' || c.status === 'expiring_soon')
  const expiringContracts = facilityContracts.filter(c => c.status === 'expiring_soon')

  // Current week sessions count (based on weekOffset=0 always for stats)
  const todayMonday = getMonday(new Date())
  const weekDates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(todayMonday)
    d.setDate(d.getDate() + i)
    weekDates.push(d)
  }
  const weekDateStrs = weekDates.map(toDateStr)
  const sessionsThisWeek = facilitySessions.filter(s => weekDateStrs.includes(s.date))

  // Calendar week dates based on offset
  const calMonday = new Date(todayMonday)
  calMonday.setDate(calMonday.getDate() + weekOffset * 7)
  const calDates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(calMonday)
    d.setDate(d.getDate() + i)
    calDates.push(d)
  }
  const calDateStrs = calDates.map(toDateStr)

  function handleScrollToExpiring() {
    expiringRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleRenewOpen(c: LeaseContract) {
    setRenewContract(c)
    setRenewEndDate('')
    setRenewRate(String(c.ratePerSession))
    setRenewSuccess(false)
  }

  function handleRenewSubmit() {
    setRenewSuccess(true)
    setTimeout(() => {
      setRenewContract(null)
      setRenewSuccess(false)
    }, 3000)
  }

  const popoverSession = selectedSession
  const popoverAcademy = popoverSession ? academies.find(a => a.id === popoverSession.academyId) : null
  const popoverRoster = popoverSession ? rosters.find(r => r.id === popoverSession.rosterId) : null
  const popoverPitch = popoverSession ? pitches.find(p => p.id === popoverSession.pitchId) : null

  return (
    <div style={{ padding: 32, position: 'relative' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 24px' }}>Dashboard</h1>

      {/* TOP STATS ROW */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {/* Active Contracts */}
        <div style={{ flex: 1, background: '#fff', borderRadius: RADIUS.card, padding: 20, boxShadow: SHADOWS.card, display: 'flex', flexDirection: 'column' }}>
          <FileText size={22} color={COLORS.primary} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 32, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{activeAndExpiring.length}</p>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Active Contracts</p>
        </div>

        {/* Sessions This Week */}
        <div style={{ flex: 1, background: '#fff', borderRadius: RADIUS.card, padding: 20, boxShadow: SHADOWS.card, display: 'flex', flexDirection: 'column' }}>
          <Calendar size={22} color={COLORS.primary} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 32, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{sessionsThisWeek.length}</p>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Sessions This Week</p>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={handleScrollToExpiring}
          style={{ flex: 1, background: '#FEF3C7', borderRadius: RADIUS.card, padding: 20, boxShadow: SHADOWS.card, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        >
          <AlertTriangle size={22} color="#92400E" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 32, fontWeight: 900, color: '#92400E', margin: 0 }}>{expiringContracts.length}</p>
          <p style={{ fontSize: 13, color: '#92400E', marginTop: 4 }}>Expiring Soon</p>
        </div>
      </div>

      {/* WEEKLY CALENDAR */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.card, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>This Week</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} color={COLORS.muted} /></button>
            <button onClick={() => setWeekOffset(0)} style={{ background: weekOffset === 0 ? COLORS.primary : '#fff', color: weekOffset === 0 ? '#fff' : COLORS.navy, border: `1px solid ${weekOffset === 0 ? COLORS.primary : COLORS.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Today</button>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronRight size={16} color={COLORS.muted} /></button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: 120, padding: '8px 12px', fontSize: 12, color: COLORS.muted, fontWeight: 600, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}></th>
                {calDates.map((d, i) => {
                  const isToday = toDateStr(d) === toDateStr(new Date())
                  return (
                    <th key={i} style={{ padding: '8px 4px', fontSize: 12, fontWeight: 600, color: isToday ? COLORS.primary : COLORS.muted, textAlign: 'center', borderBottom: `1px solid ${COLORS.border}`, background: isToday ? `${COLORS.primary}08` : 'transparent' }}>
                      {formatDateShort(d)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {facilityPitches.map(pitch => (
                <tr key={pitch.id}>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{pitch.name.split(' — ')[0]}{pitch.name.includes('—') ? '' : ''}</td>
                  {calDateStrs.map((dateStr, di) => {
                    const isToday = dateStr === toDateStr(new Date())
                    const cellSessions = facilitySessions.filter(s => s.date === dateStr && s.pitchId === pitch.id)
                    return (
                      <td key={di} style={{ padding: 4, borderBottom: `1px solid ${COLORS.border}`, verticalAlign: 'top', background: isToday ? `${COLORS.primary}08` : cellSessions.length === 0 ? '#F5F6FC' : '#fff', minHeight: 60, border: cellSessions.length === 0 ? '1px dashed transparent' : `1px solid ${COLORS.border}` }}
                        onMouseEnter={(e) => { if (cellSessions.length === 0) (e.currentTarget as HTMLElement).style.border = `1px dashed ${COLORS.border}` }}
                        onMouseLeave={(e) => { if (cellSessions.length === 0) (e.currentTarget as HTMLElement).style.border = '1px dashed transparent' }}
                      >
                        {cellSessions.map(s => {
                          const isMatch = s.type === 'match'
                          const color = isMatch ? COLORS.primary : COLORS.success
                          const dur = sessionDurationMinutes(s)
                          const blockH = dur === 60 ? 32 : dur === 90 ? 48 : dur === 120 ? 64 : Math.round(dur * 0.53)
                          return (
                            <div
                              key={s.id}
                              onClick={() => setSelectedSession(s)}
                              style={{
                                background: `${color}1A`,
                                borderLeft: `3px solid ${color}`,
                                borderRadius: 4,
                                padding: '4px 6px',
                                marginBottom: 2,
                                cursor: 'pointer',
                                minHeight: blockH,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}
                            >
                              <span style={{ fontSize: 11, fontWeight: 700, color, lineHeight: '14px' }}>{getAcademyShort(s.academyId)}</span>
                              <span style={{ fontSize: 11, color: COLORS.muted, lineHeight: '14px' }}>{s.startTime}–{s.endTime}</span>
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SESSION POPOVER */}
      {selectedSession && (
        <>
          <div onClick={() => setSelectedSession(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 99 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.elevated, zIndex: 100, width: 380, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
                {popoverAcademy?.name}{popoverRoster ? ` \u00B7 ${popoverRoster.name}` : ''}
              </h3>
              <button onClick={() => setSelectedSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color={COLORS.muted} /></button>
            </div>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 12px' }}>{popoverPitch?.name}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                display: 'inline-block',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: RADIUS.pill,
                background: selectedSession.type === 'match' ? `${COLORS.primary}22` : `${COLORS.success}22`,
                color: selectedSession.type === 'match' ? COLORS.primary : COLORS.success,
              }}>
                {selectedSession.type === 'match' ? 'Match' : 'Training'}
              </span>
              <span style={{
                display: 'inline-block',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: RADIUS.pill,
                background: selectedSession.status === 'scheduled' ? '#F5F6FC'
                  : selectedSession.status === 'in_progress' ? `${COLORS.primary}22`
                  : selectedSession.status === 'complete' ? `${COLORS.success}22`
                  : selectedSession.status === 'analysed' ? '#9333ea22'
                  : `${COLORS.success}22`,
                color: selectedSession.status === 'scheduled' ? COLORS.muted
                  : selectedSession.status === 'in_progress' ? COLORS.primary
                  : selectedSession.status === 'complete' ? COLORS.success
                  : selectedSession.status === 'analysed' ? '#9333ea'
                  : COLORS.success,
              }}>
                {selectedSession.status === 'playback_ready' ? 'Playback Ready' : selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1).replace('_', ' ')}
              </span>
            </div>
            <p style={{ fontSize: 14, color: COLORS.navy, margin: '0 0 8px' }}>
              <strong>Date:</strong> {selectedSession.date}
            </p>
            <p style={{ fontSize: 14, color: COLORS.navy, margin: '0 0 8px' }}>
              <strong>Time:</strong> {selectedSession.startTime} – {selectedSession.endTime}
            </p>
            {selectedSession.type === 'match' && selectedSession.opponent && (
              <p style={{ fontSize: 14, color: COLORS.navy, margin: '0 0 8px' }}>
                <strong>Opponent:</strong> {selectedSession.opponent}
              </p>
            )}
          </div>
        </>
      )}

      {/* EXPIRING CONTRACTS SECTION */}
      {expiringContracts.length > 0 && (
        <div ref={expiringRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={18} color="#92400E" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#92400E', margin: 0 }}>Contracts Requiring Attention</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {expiringContracts.map(c => {
              const academy = academies.find(a => a.id === c.academyId)
              const pitch = pitches.find(p => p.id === c.pitchId)
              const days = daysUntil(c.endDate)
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              const schedule = c.dayOfWeek.map(d => dayNames[d]).join(', ') + ` ${c.startTime}–${c.endTime}`
              return (
                <div key={c.id} style={{ background: '#fff', borderRadius: RADIUS.card, padding: 16, boxShadow: SHADOWS.card, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{academy?.name}</p>
                    <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{pitch?.name} · {schedule}</p>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 140 }}>
                    <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 4px' }}>Ends {c.endDate}</p>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: RADIUS.pill,
                      background: days <= 7 ? `${COLORS.error}22` : '#FEF3C7',
                      color: days <= 7 ? COLORS.error : '#92400E',
                    }}>
                      Expires in {days} days
                    </span>
                  </div>
                  <button
                    onClick={() => handleRenewOpen(c)}
                    style={{ background: '#fff', border: `2px solid ${COLORS.primary}`, color: COLORS.primary, borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Renew
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* RENEWAL SLIDE-IN PANEL */}
      {renewContract && (
        <>
          <div onClick={() => setRenewContract(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Renew Contract</h2>
              <button onClick={() => setRenewContract(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {renewSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>Contract renewed. 24 additional sessions generated.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Academy</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{academies.find(a => a.id === renewContract.academyId)?.name}</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Pitch</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{pitches.find(p => p.id === renewContract.pitchId)?.name}</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Schedule</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>
                      {renewContract.dayOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')} · {renewContract.startTime}–{renewContract.endTime}
                    </p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Current Rate</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{renewContract.ratePerSession} {renewContract.currency}/session</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>New End Date</label>
                    <input type="date" value={renewEndDate} onChange={e => setRenewEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>New Rate per Session</label>
                    <input type="number" value={renewRate} onChange={e => setRenewRate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={handleRenewSubmit} style={{ width: '100%', padding: '12px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Renew Contract
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
