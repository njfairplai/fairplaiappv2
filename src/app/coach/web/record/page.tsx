'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/hooks/useIsMobile'
import { players, pitches } from '@/lib/mockData'
import {
  Card,
  MEyebrow,
  MDisplay,
  MiniAvatar,
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

const INPUT_CLASS =
  'mt-2.5 w-full px-3.5 py-2.5 font-satoshi text-sm text-brand-indigo bg-brand-paper border border-brand-line rounded-sm outline-none'

const BTN_TEXT =
  'cursor-pointer border-none bg-transparent font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute'
const BTN_GHOST =
  'cursor-pointer rounded-sm border border-brand-indigo bg-transparent px-3.5 py-2 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo'
const BTN_PRIMARY =
  'cursor-pointer rounded-sm border-none bg-brand-indigo px-[18px] py-[9px] font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-sand'

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
    <div className="min-h-full bg-brand-sand text-brand-indigo px-3.5 py-5 md:px-9 md:py-8">
      <div>
        <MEyebrow>NEW SESSION</MEyebrow>
        <MDisplay size={isMobile ? 32 : 56} style={{ marginTop: 6 }}>
          Set up your session
        </MDisplay>
        <div className="mt-1 font-satoshi text-sm text-brand-indigo-mid">
          Pick a session type, confirm attendance, and we&apos;ll have it ready for the pitch.
        </div>
      </div>

      <div className="mt-6">
        <Card style={{ padding: 0 }}>
          {/* Steps tab row */}
          <div className="flex flex-wrap gap-0 border-b border-brand-line bg-brand-sand px-6">
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
                  className={cn(
                    'relative border-none bg-transparent px-4 py-3 font-fragment text-[10.5px] font-bold uppercase tracking-[0.18em]',
                    stepNum > currentStep ? 'cursor-default' : 'cursor-pointer',
                    active
                      ? 'text-brand-indigo'
                      : complete
                      ? 'text-brand-indigo-mid'
                      : 'text-brand-indigo-mute',
                  )}
                >
                  {String(stepNum).padStart(2, '0')} · {label}
                  {active && (
                    <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-indigo" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Step body */}
          <div className="min-h-[380px] px-6 py-6">
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
          <div className="flex flex-wrap items-center gap-2.5 border-t border-brand-line bg-brand-sand px-6 py-3.5">
            <button
              type="button"
              className={BTN_TEXT}
              onClick={() => router.push('/coach/web/match-center')}
            >
              Cancel ↗
            </button>
            <span className="flex-1" />
            <button type="button" className={BTN_GHOST} onClick={saveDraft}>
              Save draft
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                className={BTN_GHOST}
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              >
                ← Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                className={cn(
                  BTN_PRIMARY,
                  !canAdvance && 'cursor-default opacity-50',
                )}
                onClick={() => canAdvance && setCurrentStep(s => s + 1)}
                disabled={!canAdvance}
              >
                Next →
              </button>
            ) : (
              <button type="button" className={BTN_PRIMARY} onClick={confirmAndGo}>
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
  return (
    <div>
      <MEyebrow>SESSION TYPE</MEyebrow>
      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {SESSION_TYPE_OPTIONS.map(opt => {
          const active = opt.id === sessionType
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSessionTypeChange(opt.id)}
              className={cn(
                'cursor-pointer rounded-md px-4 py-4 text-left text-brand-indigo border',
                active
                  ? 'bg-brand-yellow border-brand-indigo'
                  : 'bg-brand-paper border-brand-line',
              )}
            >
              <div className="font-clash text-[22px] leading-[1.05] tracking-[-0.01em]">
                {opt.title}
              </div>
              <div className="mt-1.5 font-satoshi text-[12.5px] leading-[1.45] text-brand-indigo-mid">
                {opt.desc}
              </div>
            </button>
          )
        })}
      </div>

      {sessionType === 'match' && (
        <div className="mt-[22px]">
          <MEyebrow>OPPONENT</MEyebrow>
          <input
            value={opponentName}
            onChange={e => onOpponentChange(e.target.value)}
            placeholder="e.g. Al Wasl Academy"
            className={INPUT_CLASS}
          />
        </div>
      )}

      <div className="mt-[22px] grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <MEyebrow>DATE</MEyebrow>
          <input
            type="date"
            value={sessionDate}
            onChange={e => onDateChange(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <MEyebrow>TIME</MEyebrow>
          <input
            type="time"
            value={sessionTime}
            onChange={e => onTimeChange(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="mt-[22px]">
        <MEyebrow>PITCH</MEyebrow>
        <div className="mt-2.5 grid grid-cols-1 gap-2 md:grid-cols-2">
          {pitches.map(p => {
            const active = p.id === selectedPitch
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPitchChange(p.id)}
                className={cn(
                  'cursor-pointer rounded-sm px-3.5 py-2.5 text-left border',
                  active
                    ? 'bg-brand-indigo text-brand-sand border-brand-indigo'
                    : 'bg-brand-paper text-brand-indigo border-brand-line',
                )}
              >
                <div className="font-satoshi text-[13px] font-semibold">
                  {p.name}
                </div>
                <div
                  className={cn(
                    'mt-0.5 font-fragment text-[9.5px] font-bold tracking-[0.18em]',
                    active ? 'text-brand-sand/70' : 'text-brand-indigo-mute',
                  )}
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

// ── Step 2 · Attendance ───────────────────────────────────────────────

interface AttendanceStepProps {
  attendance: Record<string, AttendanceEntry>
  onChange: (next: Record<string, AttendanceEntry>) => void
}

function AttendanceStep({ attendance, onChange }: AttendanceStepProps) {
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
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <MEyebrow>ROSTER · {ACADEMY_PLAYERS.length} PLAYERS</MEyebrow>
        <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
          {presentCount} PRESENT · {ACADEMY_PLAYERS.length - presentCount} OUT
        </span>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-0 rounded-sm border border-brand-line bg-white md:grid-cols-2">
        {ACADEMY_PLAYERS.map((p, i) => {
          const entry =
            attendance[p.id] ?? { present: false, jerseyNumber: p.jerseyNumber }
          return (
            <div
              key={p.id}
              className={cn(
                'grid items-center gap-2.5 px-3 py-2',
                i < ACADEMY_PLAYERS.length - 2 && 'border-b border-brand-line',
              )}
              style={{ gridTemplateColumns: '28px 1fr 38px 60px 28px' }}
            >
              <MiniAvatar num={p.jerseyNumber} />
              <div className="overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-[12.5px] font-semibold text-brand-indigo">
                {p.firstName} {p.lastName}
              </div>
              <span className="rounded-[2px] border border-brand-line px-1 py-0.5 text-center font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">
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
                className="w-[50px] rounded-[3px] border border-brand-line bg-brand-paper px-1.5 py-[3px] text-center font-fragment text-[11px] font-bold text-brand-indigo"
              />
              <button
                type="button"
                onClick={() => setPresence(p.id, !entry.present)}
                aria-pressed={entry.present}
                className={cn(
                  'flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-[3px] p-0 text-xs leading-none text-brand-sand',
                  entry.present
                    ? 'border-[1.5px] border-brand-indigo bg-brand-indigo'
                    : 'border-[1.5px] border-brand-line bg-transparent',
                )}
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <MEyebrow>SPLIT INTO TEAM A / TEAM B · {presentPlayers.length} PRESENT</MEyebrow>
        <button type="button" className={BTN_TEXT} onClick={autoSplit}>
          Auto split →
        </button>
      </div>
      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-3">
        {presentPlayers.map(p => {
          const team = teamAssignments[p.id] ?? 'unassigned'
          return (
            <div
              key={p.id}
              className="flex items-center gap-2.5 rounded-sm border border-brand-line bg-white px-3 py-2.5"
            >
              <MiniAvatar num={p.jerseyNumber} />
              <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-[12.5px] font-semibold text-brand-indigo">
                {p.firstName} {p.lastName}
              </div>
              <div className="flex gap-0.5">
                {(['teamA', 'teamB'] as const).map(t => {
                  const active = team === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => assign(p.id, t)}
                      className={cn(
                        'cursor-pointer rounded-[3px] px-1.5 py-[3px] font-fragment text-[9px] font-bold tracking-[0.16em]',
                        active
                          ? cn(
                              'border-none text-brand-sand',
                              t === 'teamA' ? 'bg-brand-indigo' : 'bg-brand-coral',
                            )
                          : 'border border-brand-line bg-transparent text-brand-indigo',
                      )}
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
    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 md:gap-6">
      <div>
        <MEyebrow>SUMMARY</MEyebrow>
        <div className="mt-3 rounded-sm border border-brand-line bg-white">
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className={cn(
                'flex justify-between px-3.5 py-2.5',
                i < rows.length - 1 && 'border-b border-brand-line',
              )}
            >
              <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                {k.toUpperCase()}
              </span>
              <span className="font-satoshi text-[13px] font-semibold text-brand-indigo">
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <MEyebrow>NEXT</MEyebrow>
        <div className="mt-3 font-satoshi text-[13px] leading-[1.55] text-brand-indigo-mid">
          When you confirm, this session is created on the calendar. Record on the day
          using the camera; footage uploads to MAK Academy when you&apos;re back on Wi-Fi.
          Match analysis takes ~2 hours.
        </div>
        <div className="mt-3.5 rounded-sm bg-brand-yellow-soft p-3.5">
          <MEyebrow color={BRAND.indigo}>★ TIP</MEyebrow>
          <div className="mt-1.5 font-satoshi text-[12.5px] leading-[1.5] text-brand-indigo">
            Saved drafts persist on this device. Pick one up from the Match Center
            calendar by clicking its day.
          </div>
        </div>
      </div>
    </div>
  )
}
