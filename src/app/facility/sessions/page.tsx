'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, Share2, Copy, Check, MessageCircle } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { sessions, pitches, academies, rosters } from '@/lib/mockData'
import Modal from '@/components/ui/Modal'
import type { Session } from '@/lib/types'

const FACILITY_ID = 'facility_001'
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

function formatListDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${DAY_NAMES_FULL[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
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

function getStatusBadge(status: Session['status']): { bg: string; color: string; label: string } {
  switch (status) {
    case 'scheduled': return { bg: '#F5F6FC', color: COLORS.muted, label: 'Scheduled' }
    case 'in_progress': return { bg: `${COLORS.primary}22`, color: COLORS.primary, label: 'In Progress' }
    case 'complete': return { bg: `${COLORS.success}22`, color: COLORS.success, label: 'Complete' }
    case 'analysed': return { bg: '#9333ea22', color: '#9333ea', label: 'Analysed' }
    case 'playback_ready': return { bg: `${COLORS.success}22`, color: COLORS.success, label: 'Playback Ready' }
    default: return { bg: '#F5F6FC', color: COLORS.muted, label: status }
  }
}

function getGuestLink(sessionId: string): string {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/guest/demo-${sessionId}`
}

export default function SessionsPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)

  // Add session form state
  const [addPitchId, setAddPitchId] = useState('')
  const [addAcademyId, setAddAcademyId] = useState('')
  const [addDate, setAddDate] = useState('')
  const [addStartTime, setAddStartTime] = useState('17:00')
  const [addDuration, setAddDuration] = useState(90)
  const [addType, setAddType] = useState<'match' | 'drill'>('drill')
  const [addOpponent, setAddOpponent] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  const facilitySessions = useMemo(() => sessions.filter(s => s.facilityId === FACILITY_ID), [])
  const facilityPitches = useMemo(() => pitches.filter(p => p.facilityId === FACILITY_ID), [])

  // Calendar dates
  const todayMonday = getMonday(new Date())
  const calMonday = new Date(todayMonday)
  calMonday.setDate(calMonday.getDate() + weekOffset * 7)
  const calDates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(calMonday)
    d.setDate(d.getDate() + i)
    calDates.push(d)
  }
  const calDateStrs = calDates.map(toDateStr)

  // List view: sessions sorted by date descending
  const sortedSessions = useMemo(() => {
    return [...facilitySessions].sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
  }, [facilitySessions])

  const popoverSession = selectedSession
  const popoverAcademy = popoverSession ? academies.find(a => a.id === popoverSession.academyId) : null
  const popoverRoster = popoverSession ? rosters.find(r => r.id === popoverSession.rosterId) : null
  const popoverPitch = popoverSession ? pitches.find(p => p.id === popoverSession.pitchId) : null

  function handleAddSubmit() {
    setAddSuccess(true)
    setTimeout(() => {
      setShowAddPanel(false)
      setAddSuccess(false)
      setAddPitchId('')
      setAddAcademyId('')
      setAddDate('')
      setAddStartTime('17:00')
      setAddDuration(90)
      setAddType('drill')
      setAddOpponent('')
    }, 2000)
  }

  return (
    <div style={{ padding: 32, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Sessions</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: '#F5F6FC', borderRadius: RADIUS.pill, padding: 3 }}>
            <button onClick={() => setView('calendar')} style={{ padding: '6px 16px', borderRadius: RADIUS.pill, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: view === 'calendar' ? COLORS.primary : 'transparent', color: view === 'calendar' ? '#fff' : COLORS.muted }}>Calendar</button>
            <button onClick={() => setView('list')} style={{ padding: '6px 16px', borderRadius: RADIUS.pill, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: view === 'list' ? COLORS.primary : 'transparent', color: view === 'list' ? '#fff' : COLORS.muted }}>List</button>
          </div>
          <button onClick={() => setShowAddPanel(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} /> Add Ad Hoc Session
          </button>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div style={{ background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.card }}>
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
                    <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{pitch.name.split(' — ')[0]}</td>
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
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div style={{ background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F6FC' }}>
                {['Date', 'Time', 'Pitch', 'Academy', 'Roster', 'Type', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map(s => {
                const academy = academies.find(a => a.id === s.academyId)
                const roster = rosters.find(r => r.id === s.rosterId)
                const pitch = pitches.find(p => p.id === s.pitchId)
                const statusBadge = getStatusBadge(s.status)
                const isMatch = s.type === 'match'
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedSession(s)}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: COLORS.navy, fontWeight: 500 }}>{formatListDate(s.date)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: COLORS.navy }}>{s.startTime} – {s.endTime}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: COLORS.navy }}>{pitch?.name.split(' — ')[0]}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: COLORS.navy }}>{academy?.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: COLORS.navy }}>{roster?.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: RADIUS.pill,
                        background: isMatch ? `${COLORS.primary}22` : `${COLORS.success}22`,
                        color: isMatch ? COLORS.primary : COLORS.success,
                      }}>
                        {isMatch ? 'Match' : 'Training'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: RADIUS.pill,
                        background: statusBadge.bg,
                        color: statusBadge.color,
                      }}>
                        {statusBadge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SESSION POPOVER */}
      {selectedSession && (
        <>
          <div onClick={() => { setSelectedSession(null); setShareModalOpen(false); setShareCopied(false) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 99 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.elevated, zIndex: 100, width: 380, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
                {popoverAcademy?.name}{popoverRoster ? ` \u00B7 ${popoverRoster.name}` : ''}
              </h3>
              <button onClick={() => { setSelectedSession(null); setShareModalOpen(false); setShareCopied(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color={COLORS.muted} /></button>
            </div>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 12px' }}>{popoverPitch?.name}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                background: selectedSession.type === 'match' ? `${COLORS.primary}22` : `${COLORS.success}22`,
                color: selectedSession.type === 'match' ? COLORS.primary : COLORS.success,
              }}>
                {selectedSession.type === 'match' ? 'Match' : 'Training'}
              </span>
              {(() => {
                const sb = getStatusBadge(selectedSession.status)
                return <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill, background: sb.bg, color: sb.color }}>{sb.label}</span>
              })()}
            </div>
            <p style={{ fontSize: 14, color: COLORS.navy, margin: '0 0 8px' }}><strong>Date:</strong> {selectedSession.date}</p>
            <p style={{ fontSize: 14, color: COLORS.navy, margin: '0 0 8px' }}><strong>Time:</strong> {selectedSession.startTime} – {selectedSession.endTime}</p>
            {selectedSession.type === 'match' && selectedSession.opponent && (
              <p style={{ fontSize: 14, color: COLORS.navy, margin: '0 0 8px' }}><strong>Opponent:</strong> {selectedSession.opponent}</p>
            )}
            {(selectedSession.status === 'analysed' || selectedSession.status === 'playback_ready') && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
                <button
                  onClick={() => setShareModalOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '10px 0',
                    background: COLORS.primary, color: '#fff', border: 'none',
                    borderRadius: RADIUS.input, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Share2 size={16} />
                  Share Footage
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* SHARE FOOTAGE MODAL */}
      <Modal
        open={shareModalOpen}
        onClose={() => { setShareModalOpen(false); setShareCopied(false) }}
        title="Share Footage"
        maxWidth={440}
      >
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 16px' }}>
          Share a guest link so anyone can view the match footage.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F5F6FC', borderRadius: RADIUS.input, padding: '10px 12px', marginBottom: 16,
        }}>
          <input
            readOnly
            value={selectedSession ? getGuestLink(selectedSession.id) : ''}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 13, color: COLORS.navy, outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            onClick={() => {
              if (selectedSession) {
                navigator.clipboard.writeText(getGuestLink(selectedSession.id))
                setShareCopied(true)
                setTimeout(() => setShareCopied(false), 2000)
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: RADIUS.pill, border: 'none',
              background: shareCopied ? COLORS.success : COLORS.primary,
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.2s ease', whiteSpace: 'nowrap',
            }}
          >
            {shareCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <button
          onClick={() => {
            if (selectedSession) {
              const link = getGuestLink(selectedSession.id)
              const text = encodeURIComponent(`Your match footage is ready! Watch it here: ${link}`)
              window.open(`https://wa.me/?text=${text}`, '_blank')
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 0', borderRadius: RADIUS.input, border: 'none',
            background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <MessageCircle size={16} />
          Send via WhatsApp
        </button>
        <p style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 16, marginBottom: 0, fontStyle: 'italic' }}>
          Link expires in 7 days
        </p>
      </Modal>

      {/* ADD AD HOC SESSION SLIDE-IN PANEL */}
      {showAddPanel && (
        <>
          <div onClick={() => { setShowAddPanel(false); setAddSuccess(false) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Add Ad Hoc Session</h2>
              <button onClick={() => { setShowAddPanel(false); setAddSuccess(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {addSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>Session created successfully.</p>
                </div>
              ) : (
                <>
                  {/* Pitch selector */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Pitch</label>
                    <select value={addPitchId} onChange={e => setAddPitchId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Select pitch...</option>
                      {facilityPitches.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  {/* Academy selector */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Academy</label>
                    <select value={addAcademyId} onChange={e => setAddAcademyId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Select academy...</option>
                      {academies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  {/* Date */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Date</label>
                    <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Start time */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Start Time</label>
                    <input type="time" value={addStartTime} onChange={e => setAddStartTime(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Duration radio */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Duration</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[60, 90, 120].map(d => (
                        <button key={d} onClick={() => setAddDuration(d)} style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: addDuration === d ? COLORS.primary : '#fff',
                          color: addDuration === d ? '#fff' : COLORS.navy,
                          border: `1px solid ${addDuration === d ? COLORS.primary : COLORS.border}`,
                        }}>
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Session type radio */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Session Type</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['drill', 'match'] as const).map(t => (
                        <button key={t} onClick={() => setAddType(t)} style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: addType === t ? (t === 'match' ? COLORS.primary : COLORS.success) : '#fff',
                          color: addType === t ? '#fff' : COLORS.navy,
                          border: `1px solid ${addType === t ? (t === 'match' ? COLORS.primary : COLORS.success) : COLORS.border}`,
                        }}>
                          {t === 'match' ? 'Match' : 'Training'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opponent (only if match) */}
                  {addType === 'match' && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Opponent Name</label>
                      <input type="text" value={addOpponent} onChange={e => setAddOpponent(e.target.value)} placeholder="e.g., Al Ain FC" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: COLORS.muted, fontStyle: 'italic', margin: '0 0 24px' }}>Ad hoc sessions are single bookings outside of existing contracts.</p>

                  <button onClick={handleAddSubmit} style={{ width: '100%', padding: '12px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Create Session
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
