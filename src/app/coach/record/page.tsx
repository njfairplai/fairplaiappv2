'use client'

import React, { useState, useEffect, useRef } from 'react'
import { COLORS, RADIUS } from '@/lib/constants'
import { sessions, rosters, players, pitches } from '@/lib/mockData'
import { Circle, StopCircle, Video, Plus, ChevronRight, MapPin, Clock, Users, Loader, ArrowLeft, Check, X } from 'lucide-react'
import ProcessingStatusPanel from '@/components/coach/ProcessingStatusPanel'
import { useTeam } from '@/contexts/TeamContext'

const ACADEMY_ID = 'academy_001'
const STORAGE_KEY = 'fairplai_active_recording'
const PAGE_SIZE = 5

interface ActiveRecording {
  sessionId: string
  startedAt: number
  rosterId: string
  type: string
  opponent?: string
  location?: string
}

interface AttendanceEntry {
  present: boolean
  jerseyNumber: number
}

type FlowStep = 'idle' | 'attendance' | 'confirm'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const sessionTypeLabels: Record<string, string> = { match: 'Match', drill: 'Training', training_match: 'Friendly' }

function SessionTypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = { match: '#EF4444', drill: '#10B981', training_match: '#F59E0B' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
      background: `${colors[type] || '#94a3b8'}15`, color: colors[type] || '#94a3b8',
    }}>
      {sessionTypeLabels[type] || type}
    </span>
  )
}

export default function RecordPage() {
  const { selectedRosterId } = useTeam()
  const [activeRecording, setActiveRecording] = useState<ActiveRecording | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [step, setStep] = useState<FlowStep>('idle')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null)
  const [showProcessing, setShowProcessing] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Attendance state
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({})

  // Form state
  const academyRosters = rosters.filter(r => r.academyId === ACADEMY_ID)
  const [form, setForm] = useState({
    rosterId: selectedRosterId || academyRosters[0]?.id || '',
    type: 'training_match' as string,
    opponent: '',
    location: pitches[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().slice(0, 5),
  })

  // Load active recording from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const rec = JSON.parse(saved) as ActiveRecording
        setActiveRecording(rec)
      }
    } catch { /* ignore */ }
  }, [])

  // Timer for active recording
  useEffect(() => {
    if (activeRecording) {
      const update = () => setElapsed(Math.floor((Date.now() - activeRecording.startedAt) / 1000))
      update()
      timerRef.current = setInterval(update, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    } else {
      setElapsed(0)
    }
  }, [activeRecording])

  // Pre-fill form + attendance when selecting a scheduled session
  useEffect(() => {
    if (selectedSession) {
      const s = sessions.find(ss => ss.id === selectedSession)
      if (s) {
        setForm({
          rosterId: s.rosterId,
          type: s.type,
          opponent: s.opponent || '',
          location: pitches.find(p => p.id === s.pitchId)?.name || '',
          date: s.date,
          startTime: s.startTime,
        })
        // Build attendance from participating players
        const sessionPlayers = players.filter(p =>
          p.academyId === ACADEMY_ID && s.participatingPlayerIds.includes(p.id)
        )
        const att: Record<string, AttendanceEntry> = {}
        sessionPlayers.forEach(p => {
          att[p.id] = { present: true, jerseyNumber: p.jerseyNumber }
        })
        setAttendanceData(att)
      }
    }
  }, [selectedSession])

  // Build attendance for new recording when roster changes
  useEffect(() => {
    if (!selectedSession && step !== 'idle') {
      const rosterPlayers = players.filter(p => p.academyId === ACADEMY_ID)
      const att: Record<string, AttendanceEntry> = {}
      rosterPlayers.forEach(p => {
        att[p.id] = { present: true, jerseyNumber: p.jerseyNumber }
      })
      setAttendanceData(att)
    }
  }, [form.rosterId, selectedSession, step])

  // Only show scheduled sessions
  const upcomingSessions = sessions.filter(s =>
    s.academyId === ACADEMY_ID && s.status === 'scheduled'
  ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const visibleSessions = upcomingSessions.slice(0, visibleCount)
  const hasMore = upcomingSessions.length > visibleCount

  function beginFlow(sessionId: string | null) {
    setSelectedSession(sessionId)
    if (!sessionId) {
      // New recording — build attendance from all academy players
      const rosterPlayers = players.filter(p => p.academyId === ACADEMY_ID)
      const att: Record<string, AttendanceEntry> = {}
      rosterPlayers.forEach(p => {
        att[p.id] = { present: true, jerseyNumber: p.jerseyNumber }
      })
      setAttendanceData(att)
    }
    setStep('attendance')
  }

  function cancelFlow() {
    setStep('idle')
    setSelectedSession(null)
    setAttendanceData({})
  }

  function confirmAttendance() {
    setStep('confirm')
  }

  function startRecording() {
    // Save attendance to localStorage
    const sessionId = selectedSession || `rec_${Date.now()}`
    try {
      localStorage.setItem(`fairplai_attendance_${sessionId}`, JSON.stringify(attendanceData))
    } catch { /* ignore */ }

    const rec: ActiveRecording = {
      sessionId,
      startedAt: Date.now(),
      rosterId: form.rosterId,
      type: form.type,
      opponent: form.opponent,
      location: form.location,
    }
    setActiveRecording(rec)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rec))
    setStep('idle')
    setSelectedSession(null)
    setAttendanceData({})
  }

  function stopRecording() {
    if (activeRecording) {
      setProcessingSessionId(activeRecording.sessionId)
      setShowProcessing(true)
    }
    setActiveRecording(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  function togglePresence(playerId: string) {
    setAttendanceData(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], present: !prev[playerId].present },
    }))
  }

  function updateJersey(playerId: string, value: string) {
    const num = parseInt(value) || 0
    setAttendanceData(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], jerseyNumber: num },
    }))
  }

  const rosterPlayers = players.filter(p => p.academyId === ACADEMY_ID)
  const attendancePlayers = Object.keys(attendanceData).length > 0
    ? players.filter(p => attendanceData[p.id])
    : rosterPlayers

  const presentCount = Object.values(attendanceData).filter(a => a.present).length
  const totalCount = Object.keys(attendanceData).length

  // Get session info for display during flow
  const flowSession = selectedSession ? sessions.find(s => s.id === selectedSession) : null
  const flowRoster = rosters.find(r => r.id === (flowSession?.rosterId || form.rosterId))

  return (
    <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: COLORS.darkBg, padding: '48px 20px 20px', color: '#fff',
        borderRadius: '0 0 20px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Record</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>Start or manage session recordings</p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${COLORS.primary}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Video size={20} color={COLORS.primary} />
          </div>
        </div>


        {/* Active recording banner */}
        {activeRecording && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', borderRadius: 14, padding: 16,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#EF4444',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>Recording in Progress</span>
              </div>
              <SessionTypeIcon type={activeRecording.type} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 8 }}>
              {formatDuration(elapsed)}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
              {rosters.find(r => r.id === activeRecording.rosterId)?.name}
              {activeRecording.opponent && ` vs ${activeRecording.opponent}`}
              {activeRecording.location && ` · ${activeRecording.location}`}
            </div>
            <button
              onClick={stopRecording}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: '#EF4444', color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <StopCircle size={18} /> Stop Recording
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px' }}>

        {/* ─── STEP 1: TAKE ATTENDANCE ─── */}
        {step === 'attendance' && !activeRecording && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 20, marginBottom: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
                Take Attendance
              </h3>
              <button onClick={cancelFlow}
                style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            </div>

            {/* Session context */}
            <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 16px' }}>
              {flowRoster?.name}{flowSession?.opponent ? ` vs ${flowSession.opponent}` : ''}
              {flowSession ? ` · ${flowSession.date} at ${flowSession.startTime}` : ` · ${form.date}`}
            </p>

            {/* Summary */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              padding: '10px 14px', borderRadius: 10,
              background: `${COLORS.primary}06`, border: `1px solid ${COLORS.primary}15`,
            }}>
              <Users size={16} color={COLORS.primary} />
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>
                {presentCount} of {totalCount} present
              </span>
            </div>

            {/* Player list */}
            <div style={{
              maxHeight: 380, overflowY: 'auto', borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
            }}>
              {attendancePlayers.map((p, idx) => {
                const entry = attendanceData[p.id]
                if (!entry) return null
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderBottom: idx < attendancePlayers.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  }}>
                    {/* Player info */}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>
                        {p.firstName} {p.lastName}
                      </span>
                      <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 6 }}>
                        {(p.position || []).join(', ')}
                      </span>
                    </div>

                    {/* Jersey number — editable */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11, color: COLORS.muted }}>#</span>
                      <input
                        type="number"
                        value={entry.jerseyNumber || ''}
                        onChange={e => updateJersey(p.id, e.target.value)}
                        style={{
                          width: 40, padding: '4px 6px', borderRadius: 6,
                          border: `1px solid ${COLORS.border}`, fontSize: 13,
                          textAlign: 'center', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Present / Absent toggle */}
                    <button
                      onClick={() => togglePresence(p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 12px', borderRadius: 8, border: 'none',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        background: entry.present ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: entry.present ? '#10B981' : '#EF4444',
                        transition: 'all 0.15s ease',
                        minWidth: 80, justifyContent: 'center',
                      }}
                    >
                      {entry.present ? <Check size={14} /> : <X size={14} />}
                      {entry.present ? 'Present' : 'Absent'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Confirm attendance button */}
            <button
              onClick={confirmAttendance}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, marginTop: 16,
                background: COLORS.primary, color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 16px ${COLORS.primary}30`,
              }}
            >
              Confirm Attendance <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: CONFIRM SESSION DETAILS ─── */}
        {step === 'confirm' && !activeRecording && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 20, marginBottom: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setStep('attendance')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <ArrowLeft size={18} color={COLORS.navy} />
                </button>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
                  Confirm Session Details
                </h3>
              </div>
              <button onClick={cancelFlow}
                style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            </div>

            {/* Attendance summary chip */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20, marginBottom: 16,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Users size={14} color="#10B981" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>
                {presentCount} players present
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Team */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Team</label>
                <select value={form.rosterId} onChange={e => setForm(f => ({ ...f, rosterId: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: RADIUS.input,
                    border: `1px solid ${COLORS.border}`, fontSize: 13, cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}>
                  {academyRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Session type */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Session Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['drill', 'match', 'training_match'].map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: RADIUS.input,
                        border: `1.5px solid ${form.type === t ? COLORS.primary : COLORS.border}`,
                        background: form.type === t ? `${COLORS.primary}08` : '#fff',
                        color: form.type === t ? COLORS.primary : COLORS.muted,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {sessionTypeLabels[t] || t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opponent */}
              {(form.type === 'match' || form.type === 'training_match') && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Opponent</label>
                  <input value={form.opponent} onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
                    placeholder="e.g. Al Ain FC"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: RADIUS.input,
                      border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }} />
                </div>
              )}

              {/* Location */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Pitch / Location</label>
                <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: RADIUS.input,
                    border: `1px solid ${COLORS.border}`, fontSize: 13, cursor: 'pointer', boxSizing: 'border-box',
                  }}>
                  {pitches.map(p => <option key={p.id} value={p.name}>{p.name} ({p.type})</option>)}
                </select>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: RADIUS.input,
                      border: `1px solid ${COLORS.border}`, fontSize: 13, boxSizing: 'border-box',
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Start Time</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: RADIUS.input,
                      border: `1px solid ${COLORS.border}`, fontSize: 13, boxSizing: 'border-box',
                    }} />
                </div>
              </div>

              {/* Start Recording button */}
              <button onClick={startRecording}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: '#EF4444', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(239,68,68,0.25)',
                }}
              >
                <Circle size={16} fill="#fff" /> Start Recording
              </button>
            </div>
          </div>
        )}

        {/* ─── IDLE VIEW: New Recording button + Upcoming Sessions ─── */}
        {step === 'idle' && !activeRecording && (
          <>
            {/* New Recording button */}
            <button
              onClick={() => beginFlow(null)}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: COLORS.primary, color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 20, boxShadow: `0 4px 16px ${COLORS.primary}30`,
              }}
            >
              <Plus size={18} /> New Recording
            </button>

            {/* Upcoming Sessions */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: '0 0 12px' }}>
                Upcoming Sessions
              </h3>
              {upcomingSessions.length === 0 ? (
                <div style={{
                  padding: 24, textAlign: 'center', borderRadius: 14,
                  background: '#fff', border: `1px solid ${COLORS.border}`,
                }}>
                  <Clock size={24} color={COLORS.muted} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>No upcoming sessions scheduled</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {visibleSessions.map(s => {
                    const roster = rosters.find(r => r.id === s.rosterId)
                    const pitch = pitches.find(p => p.id === s.pitchId)

                    return (
                      <div key={s.id} style={{
                        background: '#fff', borderRadius: 14, padding: 14,
                        border: `1px solid ${COLORS.border}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                              {roster?.name}
                              {s.opponent && ` vs ${s.opponent}`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: COLORS.muted }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={12} /> {s.date} · {s.startTime}
                            </span>
                            {pitch && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={12} /> {pitch.name}
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <SessionTypeIcon type={s.type} />
                          </div>
                        </div>

                        <button
                          onClick={() => beginFlow(s.id)}
                          style={{
                            padding: '8px 14px', borderRadius: 10,
                            background: '#EF4444', color: '#fff', border: 'none',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Circle size={12} fill="#fff" /> Record
                        </button>
                      </div>
                    )
                  })}

                  {/* See more button */}
                  {hasMore && (
                    <button
                      onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 12,
                        background: '#fff', border: `1px solid ${COLORS.border}`,
                        fontSize: 13, fontWeight: 600, color: COLORS.primary,
                        cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      See more ({upcomingSessions.length - visibleCount} remaining)
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Processing panel */}
      <ProcessingStatusPanel
        open={showProcessing}
        onClose={() => setShowProcessing(false)}
        sessionId={processingSessionId}
      />

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
