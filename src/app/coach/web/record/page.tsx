'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { COLORS, SHADOWS } from '@/lib/constants'
import { players, pitches } from '@/lib/mockData'
import {
  Trophy, Users, ChevronRight, ChevronLeft, MapPin, Calendar,
  Clock, Upload, CheckCircle, Video, Shuffle, FileVideo,
  Link2, ArrowLeft, Save, Trash2, Play,
} from 'lucide-react'

const ACADEMY_ID = 'academy_001'

const JERSEY_COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'White', hex: '#94A3B8' },
  { name: 'Black', hex: '#1E293B' },
]

type SessionType = 'match' | 'training'
type TeamAssignment = 'unassigned' | 'teamA' | 'teamB'

interface AttendanceEntry {
  present: boolean
  jerseyNumber: number
}

interface SessionDraft {
  id: string
  sessionType: SessionType | null
  opponentName: string
  sessionDate: string
  sessionTime: string
  selectedPitch: string
  attendance: Record<string, AttendanceEntry>
  teamAssignments: Record<string, TeamAssignment>
  currentStep: number
  createdAt: string
}

const DRAFTS_KEY = 'fairplai_session_drafts'

function getDraftStatus(draft: SessionDraft): string {
  if (draft.currentStep >= 3 && draft.sessionType === 'training') return 'Teams assigned'
  if (draft.currentStep >= 2) return 'Attendance & jerseys completed'
  return 'Setup only'
}

const STEP_LABELS_MATCH = ['Session Setup', 'Attendance & Jerseys', 'Confirm']
const STEP_LABELS_TRAINING = ['Session Setup', 'Attendance & Jerseys', 'Split Teams', 'Confirm']

function getStepNumbers(sessionType: SessionType): number[] {
  if (sessionType === 'match') return [1, 2, 4]
  return [1, 2, 3, 4]
}

function getStepLabel(stepNum: number, sessionType: SessionType | null): string {
  const labels = sessionType === 'training' ? STEP_LABELS_TRAINING : STEP_LABELS_MATCH
  const steps = sessionType ? getStepNumbers(sessionType) : [1]
  const idx = steps.indexOf(stepNum)
  return labels[idx] || ''
}

export default function WebRecordPage() {
  const searchParams = useSearchParams()
  const isAnalyseMode = searchParams.get('mode') === 'analyse'
  const [currentStep, setCurrentStep] = useState(1)
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [opponentName, setOpponentName] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionTime, setSessionTime] = useState(new Date().toTimeString().slice(0, 5))
  const [selectedPitch, setSelectedPitch] = useState(pitches[0]?.id || '')
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({})
  const [teamAssignments, setTeamAssignments] = useState<Record<string, TeamAssignment>>({})
  const [teamAColor, setTeamAColor] = useState('Red')
  const [teamBColor, setTeamBColor] = useState('Blue')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Draft state
  const [drafts, setDrafts] = useState<SessionDraft[]>([])
  const [showDraftToast, setShowDraftToast] = useState(false)

  // Load drafts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFTS_KEY)
      if (stored) setDrafts(JSON.parse(stored))
    } catch { /* ignore parse errors */ }
  }, [])

  function saveDraftsToStorage(updated: SessionDraft[]) {
    setDrafts(updated)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated))
  }

  function saveDraft() {
    const draft: SessionDraft = {
      id: Date.now().toString(),
      sessionType,
      opponentName,
      sessionDate,
      sessionTime,
      selectedPitch,
      attendance,
      teamAssignments,
      currentStep,
      createdAt: new Date().toISOString(),
    }
    const updated = [draft, ...drafts]
    saveDraftsToStorage(updated)
    setShowDraftToast(true)
    setTimeout(() => setShowDraftToast(false), 2000)
  }

  function deleteDraft(draftId: string) {
    const updated = drafts.filter(d => d.id !== draftId)
    saveDraftsToStorage(updated)
  }

  function resumeDraft(draft: SessionDraft) {
    setSessionType(draft.sessionType)
    setOpponentName(draft.opponentName)
    setSessionDate(draft.sessionDate)
    setSessionTime(draft.sessionTime)
    setSelectedPitch(draft.selectedPitch)
    setAttendance(draft.attendance)
    setTeamAssignments(draft.teamAssignments)
    setCurrentStep(draft.currentStep)
    // Remove this draft from the list
    const updated = drafts.filter(d => d.id !== draft.id)
    saveDraftsToStorage(updated)
  }

  // localStorage role check
  useEffect(() => {
    const role = localStorage.getItem('fairplai_role')
    if (!role) localStorage.setItem('fairplai_role', 'coach')
  }, [])

  // Initialize attendance from academy players
  const academyPlayers = players.filter(p => p.academyId === ACADEMY_ID && p.status === 'active')

  useEffect(() => {
    const att: Record<string, AttendanceEntry> = {}
    academyPlayers.forEach(p => {
      att[p.id] = { present: true, jerseyNumber: p.jerseyNumber }
    })
    setAttendance(att)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const presentPlayers = academyPlayers.filter(p => attendance[p.id]?.present)
  const presentCount = presentPlayers.length
  const totalCount = academyPlayers.length

  const steps = sessionType ? getStepNumbers(sessionType) : [1]
  const currentStepIndex = steps.indexOf(currentStep)
  const totalSteps = steps.length
  const isLastStep = currentStepIndex === totalSteps - 1

  function goNext() {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
    }
  }

  function goBack() {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  function toggleAttendance(playerId: string) {
    setAttendance(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], present: !prev[playerId]?.present },
    }))
  }

  function cycleTeamAssignment(playerId: string) {
    setTeamAssignments(prev => {
      const current = prev[playerId] || 'unassigned'
      const next: TeamAssignment = current === 'unassigned' ? 'teamA' : current === 'teamA' ? 'teamB' : 'unassigned'
      return { ...prev, [playerId]: next }
    })
  }

  function autoSplit() {
    const shuffled = [...presentPlayers].sort(() => Math.random() - 0.5)
    const newAssignments: Record<string, TeamAssignment> = {}
    shuffled.forEach((p, i) => {
      newAssignments[p.id] = i % 2 === 0 ? 'teamA' : 'teamB'
    })
    setTeamAssignments(newAssignments)
  }

  function updateJersey(playerId: string, value: string) {
    const num = parseInt(value) || 0
    setAttendance(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], jerseyNumber: num },
    }))
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  function handleSubmit() {
    setIsUploading(true)
    setUploadProgress(0)
    uploadTimerRef.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          if (uploadTimerRef.current) clearInterval(uploadTimerRef.current)
          setIsUploading(false)
          setSubmitted(true)
          return 100
        }
        return prev + 2
      })
    }, 60)
  }

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current)
    }
  }, [])

  const teamAPlayers = presentPlayers.filter(p => teamAssignments[p.id] === 'teamA')
  const teamBPlayers = presentPlayers.filter(p => teamAssignments[p.id] === 'teamB')
  const unassignedPlayers = presentPlayers.filter(p => !teamAssignments[p.id] || teamAssignments[p.id] === 'unassigned')

  const pitchName = pitches.find(p => p.id === selectedPitch)?.name || ''

  // ─── Styles ───────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    padding: '32px 40px',
    maxWidth: 900,
    margin: '0 auto',
  }

  const cardStyle: React.CSSProperties = {
    background: COLORS.cardBg,
    borderRadius: 16,
    padding: 28,
    boxShadow: SHADOWS.card,
    border: `1px solid ${COLORS.border}`,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 800,
    color: COLORS.navy,
    margin: '0 0 4px',
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: 14,
    color: COLORS.muted,
    margin: '0 0 24px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.navy,
    display: 'block',
    marginBottom: 6,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  }

  const buttonPrimaryStyle: React.CSSProperties = {
    padding: '12px 28px',
    borderRadius: 10,
    background: COLORS.primary,
    color: '#fff',
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: `0 4px 16px ${COLORS.primary}30`,
  }

  const buttonSecondaryStyle: React.CSSProperties = {
    padding: '12px 28px',
    borderRadius: 10,
    background: 'transparent',
    color: COLORS.muted,
    border: `1px solid ${COLORS.border}`,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }

  const buttonDraftStyle: React.CSSProperties = {
    padding: '12px 20px',
    borderRadius: 10,
    background: 'transparent',
    color: COLORS.muted,
    border: `1px dashed ${COLORS.border}`,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.15s ease',
  }

  // ─── Step Indicator ───────────────────────────────────────
  function renderStepIndicator() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
        {steps.map((stepNum, idx) => {
          const isCompleted = idx < currentStepIndex
          const isCurrent = idx === currentStepIndex
          return (
            <React.Fragment key={stepNum}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted ? COLORS.primary : isCurrent ? COLORS.primary : COLORS.cloud,
                  color: isCompleted || isCurrent ? '#fff' : COLORS.muted,
                  fontSize: 14, fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}>
                  {isCompleted ? <CheckCircle size={18} /> : (idx + 1)}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? COLORS.navy : COLORS.muted,
                  whiteSpace: 'nowrap',
                }}>
                  {getStepLabel(stepNum, sessionType)}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  width: 60, height: 2,
                  background: idx < currentStepIndex ? COLORS.primary : COLORS.cloud,
                  margin: '0 8px',
                  marginBottom: 22,
                  borderRadius: 1,
                  transition: 'background 0.2s ease',
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  // ─── Navigation Buttons ───────────────────────────────────
  function renderNavButtons(nextDisabled?: boolean) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        {currentStepIndex > 0 ? (
          <button onClick={goBack} style={buttonSecondaryStyle}>
            <ChevronLeft size={16} /> Back
          </button>
        ) : <div />}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={saveDraft} style={buttonDraftStyle}>
            <Save size={15} /> Save as Draft
          </button>
          {!isLastStep && (
            <button
              onClick={goNext}
              disabled={nextDisabled}
              style={{
                ...buttonPrimaryStyle,
                opacity: nextDisabled ? 0.5 : 1,
                cursor: nextDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── STEP 1: Session Setup ────────────────────────────────
  function renderStep1() {
    return (
      <div style={cardStyle}>
        <h2 style={titleStyle}>New Session</h2>
        <p style={subtitleStyle}>Set up your session details to get started</p>

        {/* Session Type Cards */}
        <label style={labelStyle}>Session Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Match Card */}
          <button
            onClick={() => setSessionType('match')}
            style={{
              padding: 24,
              borderRadius: 14,
              border: `2px solid ${sessionType === 'match' ? COLORS.primary : COLORS.border}`,
              background: sessionType === 'match' ? `${COLORS.primary}06` : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: sessionType === 'match' ? `${COLORS.primary}15` : COLORS.cloud,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Trophy size={22} color={sessionType === 'match' ? COLORS.primary : COLORS.muted} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>Match</div>
            <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.4 }}>Competitive match against another team</div>
          </button>

          {/* Training Match Card */}
          <button
            onClick={() => setSessionType('training')}
            style={{
              padding: 24,
              borderRadius: 14,
              border: `2px solid ${sessionType === 'training' ? COLORS.primary : COLORS.border}`,
              background: sessionType === 'training' ? `${COLORS.primary}06` : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: sessionType === 'training' ? `${COLORS.primary}15` : COLORS.cloud,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Users size={22} color={sessionType === 'training' ? COLORS.primary : COLORS.muted} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>Training Match</div>
            <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.4 }}>Internal training session</div>
          </button>
        </div>

        {/* Opponent Name (Match only) */}
        {sessionType === 'match' && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Opponent</label>
            <input
              value={opponentName}
              onChange={e => setOpponentName(e.target.value)}
              placeholder="e.g. Al Ahly U12"
              style={inputStyle}
            />
          </div>
        )}

        {/* Date & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>
              <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              <Clock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Time
            </label>
            <input
              type="time"
              value={sessionTime}
              onChange={e => setSessionTime(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Pitch Selector */}
        <div style={{ marginBottom: 4 }}>
          <label style={labelStyle}>
            <MapPin size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Location / Pitch
          </label>
          <select
            value={selectedPitch}
            onChange={e => setSelectedPitch(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {pitches.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
          {sessionType && (
            <button onClick={saveDraft} style={buttonDraftStyle}>
              <Save size={15} /> Save as Draft
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!sessionType}
            style={{
              ...buttonPrimaryStyle,
              opacity: !sessionType ? 0.5 : 1,
              cursor: !sessionType ? 'not-allowed' : 'pointer',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ─── STEP 2: Attendance & Jerseys (Combined) ────────────
  function renderStep2() {
    return (
      <div style={cardStyle}>
        <h2 style={titleStyle}>Take Attendance</h2>
        <p style={subtitleStyle}>Confirm attendance and verify jersey numbers for this session</p>

        {/* Summary Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 10,
          background: `${COLORS.primary}06`, border: `1px solid ${COLORS.primary}15`,
          marginBottom: 16,
        }}>
          <Users size={18} color={COLORS.primary} />
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>
            {presentCount} of {totalCount} present
          </span>
        </div>

        {/* Player List with Attendance Toggle + Jersey Input */}
        <div style={{
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
        }}>
          {academyPlayers.map((p, idx) => {
            const entry = attendance[p.id]
            const isPresent = entry?.present ?? true
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderBottom: idx < academyPlayers.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  background: isPresent ? '#fff' : 'rgba(0,0,0,0.02)',
                  opacity: isPresent ? 1 : 0.5,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Player Name & Position */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>
                    {p.firstName} {p.lastName}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 6 }}>
                    {p.position.join(', ')}
                  </span>
                </div>

                {/* Jersey Number Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>#</span>
                  <input
                    type="number"
                    value={attendance[p.id]?.jerseyNumber ?? p.jerseyNumber}
                    onChange={e => updateJersey(p.id, e.target.value)}
                    style={{
                      width: 48, padding: '5px 6px', borderRadius: 8,
                      border: `1px solid ${COLORS.border}`, fontSize: 14,
                      textAlign: 'center', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Attendance Toggle */}
                <button
                  onClick={() => toggleAttendance(p.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: isPresent ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                    color: isPresent ? '#10B981' : '#EF4444',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s ease',
                    minWidth: 80,
                    justifyContent: 'center',
                  }}
                >
                  {isPresent ? <><CheckCircle size={13} /> Present</> : 'Absent'}
                </button>
              </div>
            )
          })}
        </div>

        {renderNavButtons(presentCount === 0)}
      </div>
    )
  }

  // ─── STEP 3: Team Assignment (Training only) ──────────────
  function renderStep3() {
    return (
      <div style={cardStyle}>
        <h2 style={titleStyle}>Split Teams</h2>
        <p style={subtitleStyle}>Click a player to cycle: Unassigned → Team A → Team B → Unassigned</p>

        {/* Auto Split Button */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={autoSplit} style={{
            ...buttonSecondaryStyle,
            background: `${COLORS.primary}06`,
            border: `1px solid ${COLORS.primary}25`,
            color: COLORS.primary,
          }}>
            <Shuffle size={16} /> Auto Split
          </button>
        </div>

        {/* Unassigned Pool */}
        {unassignedPlayers.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: COLORS.muted,
              marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              Unassigned ({unassignedPlayers.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {unassignedPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => cycleTeamAssignment(p.id)}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    background: '#fff', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: COLORS.navy,
                    transition: 'all 0.1s ease',
                  }}
                >
                  #{attendance[p.id]?.jerseyNumber} {p.firstName} {p.lastName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Team A */}
          <div>
            <div style={{
              padding: '10px 16px', borderRadius: '10px 10px 0 0',
              background: JERSEY_COLORS.find(c => c.name === teamAColor)?.hex || '#EF4444', color: '#fff',
              fontSize: 14, fontWeight: 700,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Team A</span>
                <select
                  value={teamAColor}
                  onChange={e => setTeamAColor(e.target.value)}
                  style={{
                    padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {JERSEY_COLORS.map(c => (
                    <option key={c.name} value={c.name} style={{ background: c.hex, color: '#fff' }}>{c.name}</option>
                  ))}
                </select>
              </div>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{teamAPlayers.length} players</span>
            </div>
            <div style={{
              border: `1px solid ${COLORS.border}`, borderTop: 'none',
              borderRadius: '0 0 10px 10px', minHeight: 100,
              padding: 8,
            }}>
              {teamAPlayers.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
                  Click players to assign
                </div>
              )}
              {teamAPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => cycleTeamAssignment(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: 'none', background: 'rgba(239,68,68,0.06)',
                    cursor: 'pointer', marginBottom: 4,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: JERSEY_COLORS.find(c => c.name === teamAColor)?.hex || '#EF4444' }}>#{attendance[p.id]?.jerseyNumber}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{p.firstName} {p.lastName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Team B */}
          <div>
            <div style={{
              padding: '10px 16px', borderRadius: '10px 10px 0 0',
              background: JERSEY_COLORS.find(c => c.name === teamBColor)?.hex || '#3B82F6', color: '#fff',
              fontSize: 14, fontWeight: 700,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Team B</span>
                <select
                  value={teamBColor}
                  onChange={e => setTeamBColor(e.target.value)}
                  style={{
                    padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {JERSEY_COLORS.map(c => (
                    <option key={c.name} value={c.name} style={{ background: c.hex, color: '#fff' }}>{c.name}</option>
                  ))}
                </select>
              </div>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{teamBPlayers.length} players</span>
            </div>
            <div style={{
              border: `1px solid ${COLORS.border}`, borderTop: 'none',
              borderRadius: '0 0 10px 10px', minHeight: 100,
              padding: 8,
            }}>
              {teamBPlayers.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
                  Click players to assign
                </div>
              )}
              {teamBPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => cycleTeamAssignment(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: 'none', background: 'rgba(59,130,246,0.06)',
                    cursor: 'pointer', marginBottom: 4,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6' }}>#{attendance[p.id]?.jerseyNumber}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{p.firstName} {p.lastName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderNavButtons()}
      </div>
    )
  }

  // ─── STEP 4: Confirm & Upload ─────────────────────────────
  function renderStep4() {
    if (submitted) {
      return (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 28px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={32} color="#10B981" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, margin: '0 0 8px' }}>
            {isAnalyseMode ? 'Analysis Submitted' : 'Session Submitted'}
          </h2>
          <p style={{ fontSize: 14, color: COLORS.muted, margin: '0 0 28px', lineHeight: 1.5 }}>
            Processing will take approximately 15 minutes.<br />
            You will be notified when analysis is ready.
          </p>
          <a
            href={isAnalyseMode ? '/coach/web/analysis' : '/coach/web/video'}
            style={{
              ...buttonPrimaryStyle,
              textDecoration: 'none',
              display: 'inline-flex',
            }}
          >
            <ArrowLeft size={16} /> {isAnalyseMode ? 'Go to Analysis' : 'Go to Video'}
          </a>
        </div>
      )
    }

    return (
      <div style={cardStyle}>
        <h2 style={titleStyle}>Confirm Session</h2>
        <p style={subtitleStyle}>Review details and upload your video</p>

        {/* Summary Card */}
        <div style={{
          padding: 20, borderRadius: 12,
          background: COLORS.lightBg, border: `1px solid ${COLORS.border}`,
          marginBottom: 24,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Session Type</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                {sessionType === 'match' ? 'Match' : 'Training Match'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
                {sessionType === 'match' ? 'Opponent' : 'Teams'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                {sessionType === 'match'
                  ? (opponentName || 'Not specified')
                  : `Team A (${teamAPlayers.length}) vs Team B (${teamBPlayers.length})`
                }
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Date & Time</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                {sessionDate} at {sessionTime}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Location</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>{pitchName}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Players Present</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>{presentCount} players</div>
            </div>
            {sessionType === 'training' && (
              <div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Team Split</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                  <span style={{ color: '#EF4444' }}>Red: {teamAPlayers.length}</span>
                  {' / '}
                  <span style={{ color: '#3B82F6' }}>Blue: {teamBPlayers.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            <Upload size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Session Video
          </label>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: selectedFile ? '20px' : '40px 20px',
              borderRadius: 12,
              border: `2px dashed ${selectedFile ? COLORS.primary : COLORS.border}`,
              background: selectedFile ? `${COLORS.primary}04` : '#FAFBFF',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <FileVideo size={24} color={COLORS.primary} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{selectedFile.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Upload size={28} color={COLORS.muted} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>
                  Drag and drop session video or click to browse
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>MP4, MOV, or AVI up to 10 GB</div>
              </>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>Uploading...</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{uploadProgress}%</span>
            </div>
            <div style={{
              width: '100%', height: 6, borderRadius: 3,
              background: COLORS.cloud, overflow: 'hidden',
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: COLORS.primary,
                borderRadius: 3,
                transition: 'width 0.1s linear',
              }} />
            </div>
          </div>
        )}

        {/* Link Camera Feed (placeholder) */}
        <button style={{
          ...buttonSecondaryStyle,
          width: '100%',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Link2 size={16} /> Link Camera Feed
        </button>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={goBack} style={buttonSecondaryStyle}>
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            style={{
              ...buttonPrimaryStyle,
              background: '#10B981',
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              opacity: isUploading ? 0.6 : 1,
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            <Video size={16} /> Submit for Processing
          </button>
        </div>
      </div>
    )
  }

  // ─── Drafts Section ──────────────────────────────────────
  function renderDrafts() {
    if (drafts.length === 0) return null
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: '0 0 12px' }}>Saved Drafts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {drafts.map(draft => (
            <div
              key={draft.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 12,
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.card,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: draft.sessionType === 'match' ? `${COLORS.primary}10` : 'rgba(16,185,129,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {draft.sessionType === 'match'
                    ? <Trophy size={18} color={COLORS.primary} />
                    : <Users size={18} color="#10B981" />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>
                    {draft.sessionType === 'match' ? 'Match' : draft.sessionType === 'training' ? 'Training Match' : 'Session'}
                    {draft.opponentName ? ` vs ${draft.opponentName}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    {new Date(draft.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' \u2022 '}
                    {getDraftStatus(draft)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => resumeDraft(draft)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: `${COLORS.primary}08`,
                    border: `1px solid ${COLORS.primary}25`,
                    color: COLORS.primary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Play size={13} /> Resume
                </button>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.muted,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title="Delete draft"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div style={containerStyle}>
      {/* Draft Saved Toast */}
      {showDraftToast && (
        <div style={{
          position: 'fixed',
          top: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: 10,
          background: COLORS.success,
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 4px 20px rgba(39,174,96,0.35)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}>
          Draft saved
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.navy, margin: '0 0 4px' }}>{isAnalyseMode ? 'Analyse Session' : 'Record Session'}</h1>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>
          Set up and record a new match or training session
        </p>
      </div>

      {/* Saved Drafts */}
      {renderDrafts()}

      {/* Step Indicator */}
      {sessionType && renderStepIndicator()}

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && sessionType === 'training' && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  )
}
