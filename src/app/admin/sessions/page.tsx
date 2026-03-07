'use client'

import { useState, useMemo, useEffect } from 'react'
import { sessions as baseSessions, rosters, pitches, programs, tournamentFixtures } from '@/lib/mockData'
import { COLORS, SHADOWS } from '@/lib/constants'
import type { Session, Program } from '@/lib/types'
import AdHocSessionForm from '@/components/academy-admin/AdHocSessionForm'
import {
  Info,
  Calendar,
  CalendarDays,
  ChevronRight,
  X,
  Plus,
  CheckCircle,
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
export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<'programs' | 'sessions'>('programs')
  const [panelOpen, setPanelOpen] = useState(false)
  const [adHocPanelOpen, setAdHocPanelOpen] = useState(false)
  const [adHocSessions, setAdHocSessions] = useState<Session[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  /* ── Create Program form state ── */
  const [formName, setFormName] = useState('')
  const [formRoster, setFormRoster] = useState('')
  const [formDays, setFormDays] = useState<number[]>([])
  const [formStartTimes, setFormStartTimes] = useState<Record<number, string>>({})
  const [formLength, setFormLength] = useState<number>(90)
  const [formCustomLength, setFormCustomLength] = useState('')
  const [formTermStart, setFormTermStart] = useState('')
  const [formTermEnd, setFormTermEnd] = useState('')

  /* ── Sessions filter state ── */
  const [filterRoster, setFilterRoster] = useState('all')
  const [filterType, setFilterType] = useState<'all' | 'match' | 'drill' | 'tournament'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | Session['status']>('all')

  const academyRosters = rosters.filter((r) => r.academyId === 'academy_001')
  const academyPrograms = programs.filter((p) => p.academyId === 'academy_001')
  const allSessions = [...baseSessions, ...adHocSessions]
  const academySessions = allSessions.filter((s) => s.academyId === 'academy_001')

  /* program preview count */
  const effectiveLength = formLength === 0 ? (parseInt(formCustomLength) || 0) : formLength
  const previewCount = countSessionsBetween(formDays, formTermStart, formTermEnd)

  /* sessions filtering */
  const filteredSessions = useMemo(() => {
    let list = [...academySessions]
    if (filterRoster !== 'all') list = list.filter((s) => s.rosterId === filterRoster)
    if (filterType !== 'all') {
      if (filterType === 'tournament') {
        list = list.filter((s) => !!s.tournamentFixtureId)
      } else if (filterType === 'match') {
        list = list.filter((s) => s.type === 'match' && !s.tournamentFixtureId)
      } else {
        list = list.filter((s) => s.type === 'drill' || s.type === 'training_match')
      }
    }
    if (filterStatus !== 'all') list = list.filter((s) => s.status === filterStatus)
    list.sort((a, b) => b.date.localeCompare(a.date))
    return list
  }, [filterRoster, filterType, filterStatus, academySessions])

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

  /* ── pill style helper ── */
  const pill = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    borderRadius: 20,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : COLORS.muted,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.border}`,
    transition: 'all 0.15s ease',
  })

  const smallPill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 16,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : COLORS.muted,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.border}`,
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Programs & Sessions</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Sub-tab pills */}
          <button onClick={() => setActiveTab('programs')} style={pill(activeTab === 'programs')}>Programs</button>
          <button onClick={() => setActiveTab('sessions')} style={pill(activeTab === 'sessions')}>Sessions</button>
          {activeTab === 'programs' && (
            <button
              onClick={() => setPanelOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 20, border: 'none',
                background: COLORS.primary, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', marginLeft: 8,
              }}
            >
              <Plus size={16} /> Create Program
            </button>
          )}
          {activeTab === 'sessions' && (
            <button
              onClick={() => setAdHocPanelOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 20, border: 'none',
                background: COLORS.primary, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', marginLeft: 8,
              }}
            >
              <Plus size={16} /> New Session
            </button>
          )}
        </div>
      </div>

      {/* ─── PROGRAMS TAB ──────────────────────────────────── */}
      {activeTab === 'programs' && (
        <div>
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
            {academyPrograms.map((prog) => {
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
                    <button
                      onClick={() => setActiveTab('sessions')}
                      style={{
                        background: 'none', border: 'none', color: COLORS.primary,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
                      }}
                    >
                      View Sessions
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── SESSIONS TAB ──────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <div>
          {/* Info card */}
          <div style={{
            background: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 20,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Info size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
              Sessions are automatically generated from your Programs and facility contracts. To change a recurring schedule, edit the Program or contact your facility admin.
            </p>
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Roster dropdown */}
            <select
              value={filterRoster}
              onChange={(e) => setFilterRoster(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
                fontSize: 13, color: COLORS.navy, outline: 'none', background: '#fff', cursor: 'pointer',
              }}
            >
              <option value="all">All Rosters</option>
              {academyRosters.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Date range display */}
            <span style={{
              padding: '8px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
              fontSize: 13, color: COLORS.muted, background: '#fff',
            }}>
              Jan 1 – Apr 30, 2026
            </span>

            {/* Type pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'match', 'drill', 'tournament'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as typeof filterType)}
                  style={smallPill(filterType === t)}
                >
                  {t === 'all' ? 'All' : t === 'match' ? 'Match' : t === 'drill' ? 'Training' : 'Tournament'}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'scheduled', 'analysed', 'complete', 'playback_ready'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as typeof filterStatus)}
                  style={smallPill(filterStatus === s)}
                >
                  {s === 'all' ? 'All' : s === 'playback_ready' ? 'Playback Ready' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Session list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredSessions.map((s) => {
              const roster = rosters.find((r) => r.id === s.rosterId)
              const pitch = pitches.find((p) => p.id === s.pitchId)
              const d = new Date(s.date + 'T00:00:00')
              const dayNum = d.getDate()
              const monthLabel = MONTH_NAMES[d.getMonth()]

              const statusColors: Record<Session['status'], { bg: string; color: string }> = {
                scheduled: { bg: '#F3F4F6', color: '#6B7280' },
                in_progress: { bg: `${COLORS.warning}1A`, color: COLORS.warning },
                analysed: { bg: '#7C3AED1A', color: '#7C3AED' },
                complete: { bg: `${COLORS.success}1A`, color: COLORS.success },
                playback_ready: { bg: `${COLORS.success}1A`, color: COLORS.success },
              }
              const sc = statusColors[s.status]

              const statusLabel: Record<Session['status'], string> = {
                scheduled: 'Scheduled',
                in_progress: 'In Progress',
                analysed: 'Analysed',
                complete: 'Complete',
                playback_ready: 'Playback Ready',
              }

              const needsClassification = s.aiMatchConfidence !== undefined && s.aiMatchConfidence < 85 && s.status === 'complete'

              return (
                <div key={s.id} style={{
                  background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: SHADOWS.card,
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  {/* Date block */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, background: '#F5F6FC',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{dayNum}</span>
                    <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{monthLabel}</span>
                  </div>

                  {/* Center */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                        {roster?.name}{s.opponent ? ` vs ${s.opponent}` : ''}
                      </span>
                      {/* Type badge */}
                      <span style={{
                        background: s.tournamentFixtureId ? `${COLORS.warning}1A` : s.type === 'match' ? `${COLORS.primary}1A` : `${COLORS.success}1A`,
                        color: s.tournamentFixtureId ? COLORS.warning : s.type === 'match' ? COLORS.primary : COLORS.success,
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {s.tournamentFixtureId ? 'Tournament' : s.type === 'match' ? 'Match' : s.type === 'training_match' ? 'Training Match' : 'Training'}
                      </span>
                      {/* Ad Hoc badge */}
                      {s.isAdHoc && (
                        <span style={{
                          background: '#F3F4F6', color: '#6B7280',
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                        }}>
                          Ad Hoc
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: COLORS.muted }}>
                      {pitch?.name} &middot; {s.startTime}&ndash;{s.endTime}
                    </span>
                    {/* Tournament fixture details */}
                    {s.tournamentFixtureId && (() => {
                      const fixture = tournamentFixtures.find(f => f.id === s.tournamentFixtureId)
                      return fixture ? (
                        <div style={{ fontSize: 12, color: COLORS.warning, fontWeight: 600, marginTop: 3 }}>
                          {fixture.tournamentName} &middot; {fixture.round} &middot; {fixture.venue}
                        </div>
                      ) : null
                    })()}
                  </div>

                  {/* Right badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{
                      background: sc.bg, color: sc.color,
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                    }}>
                      {statusLabel[s.status]}
                    </span>
                    {/* Parent notification indicator */}
                    {(s.type === 'match' || s.tournamentFixtureId) && (() => {
                      const isProcessing = s.status === 'scheduled' || s.status === 'in_progress'
                      const isSent = s.status === 'analysed' || s.status === 'playback_ready'
                      if (isProcessing) {
                        return (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: COLORS.muted,
                            padding: '3px 8px', borderRadius: 10, background: '#F3F4F6',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.warning, animation: 'pulse 1.5s ease-in-out infinite' }} />
                            Analysis processing…
                          </span>
                        )
                      }
                      if (isSent) {
                        return (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: COLORS.success,
                            padding: '3px 8px', borderRadius: 10, background: `${COLORS.success}1A`,
                          }}>
                            <CheckCircle size={12} />
                            Parent notification sent
                          </span>
                        )
                      }
                      return null
                    })()}
                    {s.status === 'analysed' && (
                      <button style={{
                        background: 'none', border: 'none', color: COLORS.primary,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0,
                      }}>
                        View Analysis
                      </button>
                    )}
                    {needsClassification && (
                      <span style={{
                        background: `${COLORS.warning}1A`, color: '#92400E',
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10,
                      }}>
                        Classification Needed
                      </span>
                    )}
                  </div>

                  {/* Chevron */}
                  <ChevronRight size={18} color={COLORS.muted} style={{ flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── AD HOC SESSION SLIDE-IN ──────────────────────── */}
      <AdHocSessionForm
        open={adHocPanelOpen}
        onClose={() => setAdHocPanelOpen(false)}
        onCreated={(session) => {
          setAdHocSessions(prev => [...prev, session])
          setToast('Session created ✓')
          setActiveTab('sessions')
        }}
      />

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* ─── CREATE PROGRAM SLIDE-IN PANEL ────────────────── */}
      {panelOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setPanelOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 199,
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
            background: '#fff', zIndex: 200, overflowY: 'auto',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', padding: 28,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Create Program</h2>
              <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color={COLORS.muted} />
              </button>
            </div>

            {/* Program name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Program Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={formRoster ? `${rosters.find((r) => r.id === formRoster)?.name} — Program` : 'Auto-suggested from roster'}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Roster selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Roster</label>
              <select
                value={formRoster}
                onChange={(e) => setFormRoster(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', cursor: 'pointer',
                }}
              >
                <option value="">Select a roster</option>
                {academyRosters.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Days of week */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 8 }}>Days of Week</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DAY_LETTERS.map((letter, idx) => {
                  const isActive = formDays.includes(idx)
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      style={{
                        width: 40, height: 40, borderRadius: '50%', border: isActive ? 'none' : `1.5px solid ${COLORS.border}`,
                        background: isActive ? COLORS.primary : '#fff', color: isActive ? '#fff' : COLORS.muted,
                        fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                      }}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Start time for each selected day */}
            {formDays.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 8 }}>Start Time by Day</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formDays.map((day) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, width: 40 }}>{DAY_NAMES[day]}</span>
                      <input
                        type="time"
                        value={formStartTimes[day] || '17:00'}
                        onChange={(e) => handleStartTimeChange(day, e.target.value)}
                        style={{
                          padding: '8px 12px', borderRadius: 8,
                          border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session length */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 8 }}>Session Length</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[60, 90, 120, 0].map((len) => {
                  const isActive = formLength === len
                  const label = len === 0 ? 'Custom' : `${len} min`
                  return (
                    <button
                      key={len}
                      onClick={() => setFormLength(len)}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: isActive ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                        background: isActive ? `${COLORS.primary}0D` : '#fff',
                        color: isActive ? COLORS.primary : COLORS.muted,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {formLength === 0 && (
                <input
                  type="number"
                  placeholder="Minutes"
                  value={formCustomLength}
                  onChange={(e) => setFormCustomLength(e.target.value)}
                  style={{
                    marginTop: 8, padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none', width: 120,
                  }}
                />
              )}
            </div>

            {/* Term dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Term Start</label>
                <input
                  type="date"
                  value={formTermStart}
                  onChange={(e) => setFormTermStart(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Term End</label>
                <input
                  type="date"
                  value={formTermEnd}
                  onChange={(e) => setFormTermEnd(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Live preview */}
            <div style={{
              background: '#F5F6FC', borderRadius: 8, padding: 16, marginTop: 16, marginBottom: 20,
            }}>
              <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, fontWeight: 600, lineHeight: 1.6 }}>
                {previewCount > 0
                  ? `This program will generate ${previewCount} sessions between ${formTermStart ? formatDate(formTermStart) : '...'} and ${formTermEnd ? formatDate(formTermEnd) : '...'}`
                  : 'Select days and term dates to see a preview'}
              </p>
              {previewCount > 0 && (
                <p style={{ fontSize: 13, color: COLORS.success, margin: '8px 0 0', fontWeight: 600 }}>
                  &#10003; No conflicts
                </p>
              )}
            </div>

            {/* Create button */}
            <button
              disabled={!formRoster}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: formRoster ? COLORS.primary : `${COLORS.primary}40`,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: formRoster ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                setPanelOpen(false)
                setFormName('')
                setFormRoster('')
                setFormDays([])
                setFormStartTimes({})
                setFormLength(90)
                setFormCustomLength('')
                setFormTermStart('')
                setFormTermEnd('')
              }}
            >
              Create Program
            </button>
          </div>
        </>
      )}
    </div>
  )
}
