'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { players, pitches } from '@/lib/mockData'
import {
  Card,
  MEyebrow,
  MDisplay,
  MiniAvatar,
  mcButtons,
} from '@/components/coach/match-center/atoms'
import { Toast } from '@/components/coach/match-center/Toast'

/* Record session — brand chrome rebuild.
 *
 * Replaces the legacy 1,159-line page (`COLORS.primary`, white cards,
 * legacy fonts) with a slim brand-chrome flow that mirrors the State 1
 * Prep visual vocabulary so the transition from Match Center calendar's
 * "+ RECORD SESSION" feels continuous.
 *
 * Steps
 *   01 · Setup       — session type, opponent, date, time, pitch
 *   02 · Attendance  — roster + jersey overrides
 *   03 · (Training only) Split teams — A/B assignment
 *   03/04 · Confirm  — summary + go-to-pitch
 *
 * Upload UI dropped: per the design brief, recording happens at the
 * pitch via the camera integration; web-side is scheduling only.
 *
 * localStorage key `fairplai_session_drafts` is preserved so existing
 * drafts continue to load after the rewrite. The `SessionDraft` shape
 * is kept compatible with the legacy page where possible.
 */

type SessionType = 'match' | 'training' | 'drills'
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

function readDrafts(): SessionDraft[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DRAFTS_KEY)
    return raw ? (JSON.parse(raw) as SessionDraft[]) : []
  } catch {
    return []
  }
}
function writeDrafts(drafts: SessionDraft[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch {
    /* ignore */
  }
}

const ACADEMY_PLAYERS = players
  .filter(p => p.academyId === 'academy_001')
  .slice(0, 16)

export default function CoachRecordPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [opponentName, setOpponentName] = useState('')
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]!,
  )
  const [sessionTime, setSessionTime] = useState(
    new Date().toTimeString().slice(0, 5),
  )
  const [selectedPitch, setSelectedPitch] = useState(pitches[0]?.id ?? '')
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>(() =>
    Object.fromEntries(
      ACADEMY_PLAYERS.map(p => [
        p.id,
        { present: true, jerseyNumber: p.jerseyNumber },
      ]),
    ),
  )
  const [teamAssignments, setTeamAssignments] = useState<Record<string, TeamAssignment>>(
    {},
  )
  const [currentStep, setCurrentStep] = useState(1)
  const [draftId] = useState(() => `draft_${Date.now()}`)
  const [toast, setToast] = useState<string | null>(null)

  const stepLabels = useMemo(() => {
    if (sessionType === 'training') return ['Setup', 'Attendance', 'Split teams', 'Confirm']
    return ['Setup', 'Attendance', 'Confirm']
  }, [sessionType])
  const totalSteps = stepLabels.length

  function saveDraft() {
    const draft: SessionDraft = {
      id: draftId,
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
    const others = readDrafts().filter(d => d.id !== draftId)
    writeDrafts([draft, ...others])
    setToast('Draft saved')
  }

  function confirmAndGo() {
    saveDraft()
    setToast('Session ready — see you at the pitch')
    setTimeout(() => router.push('/coach/web/match-center'), 700)
  }

  const canAdvance = useMemo(() => {
    if (currentStep === 1) {
      if (!sessionType) return false
      if (sessionType === 'match' && !opponentName.trim()) return false
      if (!selectedPitch) return false
      return true
    }
    return true
  }, [currentStep, sessionType, opponentName, selectedPitch])

  return (
    <div
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        padding: isMobile ? '20px 14px' : '32px 36px',
        color: BRAND.indigo,
      }}
    >
      <div>
        <MEyebrow>NEW SESSION</MEyebrow>
        <MDisplay size={isMobile ? 32 : 56} style={{ marginTop: 6 }}>
          Set up your session
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 14,
            color: BRAND.indigoMid,
            marginTop: 4,
          }}
        >
          Pick a session type, confirm attendance, and we&apos;ll have it ready for the pitch.
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card style={{ padding: 0 }}>
          {/* Steps tab row */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              borderBottom: `1px solid ${BRAND.line}`,
              background: BRAND.sand,
              padding: '0 26px',
              flexWrap: 'wrap',
            }}
          >
            {stepLabels.map((label, i) => {
              const stepNum = i + 1
              const active = stepNum === currentStep
              const complete = stepNum < currentStep
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (stepNum <= currentStep) setCurrentStep(stepNum)
                  }}
                  disabled={stepNum > currentStep}
                  style={{
                    padding: '12px 18px',
                    border: 'none',
                    background: 'transparent',
                    cursor: stepNum > currentStep ? 'default' : 'pointer',
                    position: 'relative',
                    fontFamily: TYPE.mono,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: active
                      ? BRAND.indigo
                      : complete
                      ? BRAND.indigoMid
                      : BRAND.indigoMute,
                    textTransform: 'uppercase',
                  }}
                >
                  {String(stepNum).padStart(2, '0')} · {label}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: BRAND.indigo,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Step body */}
          <div style={{ padding: '24px 26px', minHeight: 380 }}>
            {currentStep === 1 && (
              <SetupStep
                sessionType={sessionType}
                onSessionTypeChange={setSessionType}
                opponentName={opponentName}
                onOpponentChange={setOpponentName}
                sessionDate={sessionDate}
                onDateChange={setSessionDate}
                sessionTime={sessionTime}
                onTimeChange={setSessionTime}
                selectedPitch={selectedPitch}
                onPitchChange={setSelectedPitch}
              />
            )}
            {currentStep === 2 && (
              <AttendanceStep attendance={attendance} onChange={setAttendance} />
            )}
            {currentStep === 3 && sessionType === 'training' && (
              <SplitTeamsStep
                teamAssignments={teamAssignments}
                onChange={setTeamAssignments}
                attendance={attendance}
              />
            )}
            {((currentStep === 3 && sessionType !== 'training') ||
              (currentStep === 4 && sessionType === 'training')) && (
              <ConfirmStep
                sessionType={sessionType}
                opponentName={opponentName}
                sessionDate={sessionDate}
                sessionTime={sessionTime}
                selectedPitch={selectedPitch}
                attendance={attendance}
              />
            )}
          </div>

          {/* Footer CTA bar */}
          <div
            style={{
              padding: '14px 26px',
              borderTop: `1px solid ${BRAND.line}`,
              background: BRAND.sand,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              style={mcButtons.text}
              onClick={() => router.push('/coach/web/match-center')}
            >
              Cancel ↗
            </button>
            <span style={{ flex: 1 }} />
            <button type="button" style={mcButtons.ghost} onClick={saveDraft}>
              Save draft
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                style={mcButtons.ghost}
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              >
                ← Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                style={{
                  ...mcButtons.primary,
                  opacity: canAdvance ? 1 : 0.5,
                  cursor: canAdvance ? 'pointer' : 'default',
                }}
                onClick={() => canAdvance && setCurrentStep(s => s + 1)}
                disabled={!canAdvance}
              >
                Next →
              </button>
            ) : (
              <button type="button" style={mcButtons.primary} onClick={confirmAndGo}>
                Confirm &amp; record →
              </button>
            )}
          </div>
        </Card>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

// ── Step 1 · Setup ────────────────────────────────────────────────────

interface SetupStepProps {
  sessionType: SessionType | null
  onSessionTypeChange: (t: SessionType) => void
  opponentName: string
  onOpponentChange: (v: string) => void
  sessionDate: string
  onDateChange: (v: string) => void
  sessionTime: string
  onTimeChange: (v: string) => void
  selectedPitch: string
  onPitchChange: (v: string) => void
}

const SESSION_TYPE_OPTIONS: { id: SessionType; title: string; desc: string }[] = [
  { id: 'match',    title: 'Match',          desc: 'Competitive match against another team.' },
  { id: 'training', title: 'Training match', desc: 'Internal A vs B with bibs.' },
  { id: 'drills',   title: 'Drills',         desc: 'Skills session, no analysis.' },
]

function SetupStep({
  sessionType,
  onSessionTypeChange,
  opponentName,
  onOpponentChange,
  sessionDate,
  onDateChange,
  sessionTime,
  onTimeChange,
  selectedPitch,
  onPitchChange,
}: SetupStepProps) {
  const isMobile = useIsMobile()
  return (
    <div>
      <MEyebrow>SESSION TYPE</MEyebrow>
      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {SESSION_TYPE_OPTIONS.map(opt => {
          const active = opt.id === sessionType
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSessionTypeChange(opt.id)}
              style={{
                padding: '16px 18px',
                background: active ? BRAND.yellow : BRAND.paper,
                border: `1px solid ${active ? BRAND.indigo : BRAND.line}`,
                borderRadius: 6,
                textAlign: 'left',
                cursor: 'pointer',
                color: BRAND.indigo,
              }}
            >
              <div
                style={{
                  fontFamily: TYPE.display,
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                }}
              >
                {opt.title}
              </div>
              <div
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 12.5,
                  color: BRAND.indigoMid,
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                {opt.desc}
              </div>
            </button>
          )
        })}
      </div>

      {sessionType === 'match' && (
        <div style={{ marginTop: 22 }}>
          <MEyebrow>OPPONENT</MEyebrow>
          <input
            value={opponentName}
            onChange={e => onOpponentChange(e.target.value)}
            placeholder="e.g. Al Wasl Academy"
            style={inputStyle}
          />
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <MEyebrow>DATE</MEyebrow>
          <input
            type="date"
            value={sessionDate}
            onChange={e => onDateChange(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <MEyebrow>TIME</MEyebrow>
          <input
            type="time"
            value={sessionTime}
            onChange={e => onTimeChange(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <MEyebrow>PITCH</MEyebrow>
        <div
          style={{
            marginTop: 10,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 8,
          }}
        >
          {pitches.map(p => {
            const active = p.id === selectedPitch
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPitchChange(p.id)}
                style={{
                  padding: '10px 14px',
                  background: active ? BRAND.indigo : BRAND.paper,
                  color: active ? BRAND.sand : BRAND.indigo,
                  border: `1px solid ${active ? BRAND.indigo : BRAND.line}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontFamily: TYPE.body,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 9.5,
                    letterSpacing: '0.18em',
                    color: active ? 'rgba(238,228,200,0.7)' : BRAND.indigoMute,
                    marginTop: 2,
                    fontWeight: 700,
                  }}
                >
                  {p.type.toUpperCase()} ·{' '}
                  {p.cameraStatus === 'active'
                    ? 'CAMERA READY'
                    : p.cameraStatus === 'calibrating'
                    ? 'CAMERA CALIBRATING'
                    : 'CAMERA OFFLINE'}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  marginTop: 10,
  width: '100%',
  padding: '10px 14px',
  fontFamily: TYPE.body,
  fontSize: 14,
  color: BRAND.indigo,
  background: BRAND.paper,
  border: `1px solid ${BRAND.line}`,
  borderRadius: 4,
  outline: 'none',
}

// ── Step 2 · Attendance ───────────────────────────────────────────────

interface AttendanceStepProps {
  attendance: Record<string, AttendanceEntry>
  onChange: (next: Record<string, AttendanceEntry>) => void
}

function AttendanceStep({ attendance, onChange }: AttendanceStepProps) {
  const isMobile = useIsMobile()
  function setPresence(playerId: string, present: boolean) {
    const cur = attendance[playerId] ?? { present: false, jerseyNumber: 0 }
    onChange({ ...attendance, [playerId]: { ...cur, present } })
  }
  function setJersey(playerId: string, jerseyNumber: number) {
    const cur = attendance[playerId] ?? { present: false, jerseyNumber: 0 }
    onChange({ ...attendance, [playerId]: { ...cur, jerseyNumber } })
  }
  const presentCount = Object.values(attendance).filter(a => a.present).length

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MEyebrow>ROSTER · {ACADEMY_PLAYERS.length} PLAYERS</MEyebrow>
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10,
            letterSpacing: '0.18em',
            fontWeight: 700,
            color: BRAND.indigoMute,
          }}
        >
          {presentCount} PRESENT · {ACADEMY_PLAYERS.length - presentCount} OUT
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '0 24px',
          border: `1px solid ${BRAND.line}`,
          borderRadius: 4,
          background: '#fff',
        }}
      >
        {ACADEMY_PLAYERS.map((p, i) => {
          const entry =
            attendance[p.id] ?? { present: false, jerseyNumber: p.jerseyNumber }
          return (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 38px 60px 28px',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderBottom:
                  i < ACADEMY_PLAYERS.length - 2 ? `1px solid ${BRAND.line}` : 'none',
              }}
            >
              <MiniAvatar num={p.jerseyNumber} />
              <div
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: BRAND.indigo,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.firstName} {p.lastName}
              </div>
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: BRAND.indigoMute,
                  border: `1px solid ${BRAND.line}`,
                  padding: '2px 4px',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                {p.position[0]}
              </span>
              <input
                key={`${p.id}-${entry.jerseyNumber}`}
                defaultValue={entry.jerseyNumber}
                onBlur={e => {
                  const v = parseInt(e.currentTarget.value, 10)
                  if (Number.isFinite(v) && v > 0) setJersey(p.id, v)
                  else e.currentTarget.value = String(entry.jerseyNumber)
                }}
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: BRAND.indigo,
                  border: `1px solid ${BRAND.line}`,
                  borderRadius: 3,
                  padding: '3px 6px',
                  width: 50,
                  textAlign: 'center',
                  background: BRAND.paper,
                }}
              />
              <button
                type="button"
                onClick={() => setPresence(p.id, !entry.present)}
                aria-pressed={entry.present}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  border: `1.5px solid ${
                    entry.present ? BRAND.indigo : BRAND.line
                  }`,
                  background: entry.present ? BRAND.indigo : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.sand,
                  fontSize: 12,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {entry.present && '✓'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3 (training only) · Split Teams ──────────────────────────────

interface SplitTeamsStepProps {
  teamAssignments: Record<string, TeamAssignment>
  onChange: (next: Record<string, TeamAssignment>) => void
  attendance: Record<string, AttendanceEntry>
}

function SplitTeamsStep({
  teamAssignments,
  onChange,
  attendance,
}: SplitTeamsStepProps) {
  const isMobile = useIsMobile()
  const presentPlayers = ACADEMY_PLAYERS.filter(p => attendance[p.id]?.present)
  function assign(playerId: string, team: TeamAssignment) {
    onChange({ ...teamAssignments, [playerId]: team })
  }
  function autoSplit() {
    const next: Record<string, TeamAssignment> = {}
    presentPlayers.forEach((p, i) => {
      next[p.id] = i % 2 === 0 ? 'teamA' : 'teamB'
    })
    onChange(next)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MEyebrow>SPLIT INTO TEAM A / TEAM B · {presentPlayers.length} PRESENT</MEyebrow>
        <button type="button" style={mcButtons.text} onClick={autoSplit}>
          Auto split →
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        {presentPlayers.map(p => {
          const team = teamAssignments[p.id] ?? 'unassigned'
          return (
            <div
              key={p.id}
              style={{
                padding: '10px 12px',
                background: '#fff',
                border: `1px solid ${BRAND.line}`,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <MiniAvatar num={p.jerseyNumber} />
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: TYPE.body,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: BRAND.indigo,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.firstName} {p.lastName}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {(['teamA', 'teamB'] as const).map(t => {
                  const active = team === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => assign(p.id, t)}
                      style={{
                        padding: '3px 7px',
                        border: active ? 'none' : `1px solid ${BRAND.line}`,
                        background: active
                          ? t === 'teamA'
                            ? BRAND.indigo
                            : BRAND.coral
                          : 'transparent',
                        color: active ? BRAND.sand : BRAND.indigo,
                        fontFamily: TYPE.mono,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      {t === 'teamA' ? 'A' : 'B'}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Confirm step ──────────────────────────────────────────────────────

interface ConfirmStepProps {
  sessionType: SessionType | null
  opponentName: string
  sessionDate: string
  sessionTime: string
  selectedPitch: string
  attendance: Record<string, AttendanceEntry>
}

function ConfirmStep({
  sessionType,
  opponentName,
  sessionDate,
  sessionTime,
  selectedPitch,
  attendance,
}: ConfirmStepProps) {
  const isMobile = useIsMobile()
  const presentCount = Object.values(attendance).filter(a => a.present).length
  const pitch = pitches.find(p => p.id === selectedPitch)

  const rows: [string, string][] = [
    [
      'Type',
      sessionType === 'match'
        ? 'Match'
        : sessionType === 'training'
        ? 'Training match'
        : sessionType === 'drills'
        ? 'Drills'
        : '—',
    ],
    ...(sessionType === 'match'
      ? ([['Opponent', opponentName || '—']] as [string, string][])
      : []),
    ['Date', sessionDate],
    ['Time', sessionTime],
    ['Pitch', pitch?.name ?? '—'],
    ['Attendees', `${presentCount} of ${ACADEMY_PLAYERS.length} present`],
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 18 : 24 }}>
      <div>
        <MEyebrow>SUMMARY</MEyebrow>
        <div
          style={{
            marginTop: 12,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 4,
            background: '#fff',
          }}
        >
          {rows.map(([k, v], i) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: i < rows.length - 1 ? `1px solid ${BRAND.line}` : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 10.5,
                  color: BRAND.indigoMute,
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                }}
              >
                {k.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 13,
                  color: BRAND.indigo,
                  fontWeight: 600,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <MEyebrow>NEXT</MEyebrow>
        <div
          style={{
            marginTop: 12,
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            lineHeight: 1.55,
          }}
        >
          When you confirm, this session is created on the calendar. Record on the day
          using the camera; footage uploads to MAK Academy when you&apos;re back on Wi-Fi.
          Match analysis takes ~2 hours.
        </div>
        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: BRAND.yellowSoft,
            borderRadius: 4,
          }}
        >
          <MEyebrow color={BRAND.indigo}>★ TIP</MEyebrow>
          <div
            style={{
              fontFamily: TYPE.body,
              fontSize: 12.5,
              marginTop: 6,
              color: BRAND.indigo,
              lineHeight: 1.5,
            }}
          >
            Saved drafts persist on this device. Pick one up from the Match Center
            calendar by clicking its day.
          </div>
        </div>
      </div>
    </div>
  )
}
