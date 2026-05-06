'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  DEFAULT_SELECTED_DAY,
  MATCH_CENTER_HIGHLIGHTS,
  SESSIONS,
  getSessionsForMonth,
  getStateForSession,
  type MatchCenterHighlight,
  type MatchCenterStatus,
} from '@/lib/match-center'
import {
  readSessionClassify,
  readFlaggedClips,
  readPrepConfirmation,
  toggleFlaggedClip,
  sessionIdForDay,
} from '@/lib/match-center-state'
import { MEyebrow, MDisplay, Card } from '@/components/coach/match-center/atoms'
import { Calendar } from '@/components/coach/match-center/Calendar'
import { State1Prep } from '@/components/coach/match-center/states/State1Prep'
import { State2Categorise } from '@/components/coach/match-center/states/State2Categorise'
import { State3Drills } from '@/components/coach/match-center/states/State3Drills'
import { State4Processing } from '@/components/coach/match-center/states/State4Processing'
import { State5Ready } from '@/components/coach/match-center/states/State5Ready'
import { ClipModal } from '@/components/coach/match-center/ClipModal'
import { ShareSheet } from '@/components/coach/match-center/ShareSheet'
import { Toast } from '@/components/coach/match-center/Toast'

/**
 * Match Center — calendar-first front door for the coach.
 *
 * The page orchestrates four interleaving pieces of state:
 *   - selectedDay (which calendar cell is the playhead)
 *   - classifyOverrides (per-session reclassification persisted in localStorage)
 *   - clip modals (which clip is open in ClipModal / ShareSheet)
 *   - toast (transient feedback for every action)
 *
 * `getEffectiveStatus(day)` consults the override store before falling
 * back to the mock status, so reclassifying a session ("Mark as drills
 * only", "Actually it was a match") flips the contextual pane on the
 * next render and survives a refresh.
 */
export default function CoachMatchCenterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session')
  const initialDay = useMemo(
    () => parseSessionParam(sessionParam) ?? DEFAULT_SELECTED_DAY,
    [sessionParam],
  )

  const isMobile = useIsMobile()
  const [currentMonth, setCurrentMonth] = useState(2)
  const [currentYear, setCurrentYear] = useState(2026)
  const [selectedDay, setSelectedDay] = useState<number>(initialDay)

  // Classification overrides + prep confirmations keyed by sessionId.
  // We re-read from localStorage on mount and bump a counter when a
  // state component reclassifies / confirms so the pane and calendar
  // both update immediately without a page refresh.
  const [classifyTick, setClassifyTick] = useState(0)
  const [clientReady, setClientReady] = useState(false)
  useEffect(() => {
    setClientReady(true)
  }, [])

  // Build the confirmed-prep set whenever the classify tick bumps. The
  // calendar reads this to render PREPPED instead of PREP for cells the
  // coach has already walked through to confirmation.
  const confirmedSessions = useMemo(() => {
    if (!clientReady) return new Set<string>()
    const out = new Set<string>()
    for (const s of SESSIONS) {
      const id = sessionIdForDay(s.year, s.month, s.day)
      if (readPrepConfirmation(id)) out.add(id)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientReady, classifyTick])

  // Toast + modal state. Clip modal accepts a queue: a single clip
  // for ▶ on a card; the full match's clips for "Play match reel".
  const [toast, setToast] = useState<string | null>(null)
  const [clipQueue, setClipQueue] = useState<MatchCenterHighlight[] | null>(null)
  const [clipQueueTitle, setClipQueueTitle] = useState<string | undefined>(undefined)
  const [clipSharing, setClipSharing] = useState<MatchCenterHighlight | null>(null)
  const [flagTick, setFlagTick] = useState(0)

  const flaggedClips = useMemo(() => {
    if (!clientReady) return new Set<string>()
    return new Set(readFlaggedClips())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientReady, flagTick])

  const sessionsThisMonth = useMemo(
    () => getSessionsForMonth(currentYear, currentMonth),
    [currentYear, currentMonth],
  )
  const session = sessionsThisMonth[selectedDay] ?? null
  const effectiveStatus = useMemo<MatchCenterStatus | null>(() => {
    if (!session) return null
    if (!clientReady) return session.status
    const override = readSessionClassify(sessionIdForDay(session.year, session.month, session.day))
    return override ?? session.status
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, clientReady, classifyTick])

  const state = useMemo(() => {
    if (!session) return null
    return getStateForSession({ ...session, status: effectiveStatus ?? session.status })
  }, [session, effectiveStatus])

  const sessionId = session ? sessionIdForDay(session.year, session.month, session.day) : ''

  const handleReclassify = useCallback(() => {
    setClassifyTick(t => t + 1)
  }, [])

  const handleClipFlagToggle = useCallback((clip: MatchCenterHighlight) => {
    const isNowFlagged = toggleFlaggedClip(clip.id)
    setFlagTick(t => t + 1)
    setToast(isNowFlagged ? 'Flagged for follow-up' : 'Unflagged')
  }, [])

  // Pane content extracted for clarity. Renders inline below the
  // calendar across both breakpoints.
  const paneContent = (
    <>
      {state === '1' && session && (
        <State1Prep
          sessionId={sessionId}
          kind={session.kind}
          opponent={session.opponent}
          metaLine={formatSessionMeta(session.year, session.month, session.day)}
          onToast={setToast}
          onReclassify={() => handleReclassify()}
          onConfirmedChange={() => handleReclassify()}
        />
      )}
      {state === '2' && (
        <State2Categorise
          sessionId={sessionId}
          onToast={setToast}
          onReclassify={() => handleReclassify()}
        />
      )}
      {state === '3' && (
        <State3Drills
          sessionId={sessionId}
          onToast={setToast}
          onReclassify={() => handleReclassify()}
        />
      )}
      {state === '4' && <State4Processing />}
      {state === '5' && session && (
        <State5Ready
          session={session}
          flaggedClips={flaggedClips}
          onOpenFullAnalysis={
            session.id
              ? () => router.push(`/coach/web/match/${session.id}`)
              : undefined
          }
          onClipPlay={clip => {
            setClipQueue([clip])
            setClipQueueTitle(undefined)
          }}
          onClipShare={setClipSharing}
          onClipFlagToggle={handleClipFlagToggle}
          onPlayMatchReel={() => {
            const dayClips = MATCH_CENTER_HIGHLIGHTS.filter(
              h => h.sessionDay === selectedDay,
            )
            if (dayClips.length === 0) return
            setClipQueue(dayClips)
            setClipQueueTitle(
              `vs ${session?.opponent ?? 'Match'} · ${dayClips.length} clips`,
            )
          }}
        />
      )}
      {state === null && <EmptyDayState />}
    </>
  )

  return (
    <div
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        padding: isMobile ? '20px 14px' : '32px 36px',
        color: BRAND.indigo,
      }}
    >
      {/* Page header */}
      <div>
        <MEyebrow>SPRING 2026 SEASON</MEyebrow>
        <MDisplay size={isMobile ? 36 : 64} style={{ marginTop: 6 }}>
          Match Center
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: isMobile ? 12.5 : 14,
            color: BRAND.indigoMid,
            marginTop: 4,
          }}
        >
          MAK Academy U13 Lions · 7 matches played, 5 scheduled, 1 needs prep.
        </div>
      </div>

      {/* Calendar primitive — month grid on desktop, week filmstrip
       *  on mobile. Driven by viewport, not page state. */}
      <div style={{ marginTop: isMobile ? 18 : 28 }}>
        <Calendar
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedDay={selectedDay}
          confirmedSessions={confirmedSessions}
          onSelect={setSelectedDay}
          onMonthChange={(year, month) => {
            setCurrentYear(year)
            setCurrentMonth(month)
            const monthSessions = getSessionsForMonth(year, month)
            const firstDay = Object.keys(monthSessions)
              .map(Number)
              .sort((a, b) => a - b)[0]
            setSelectedDay(firstDay ?? 0)
          }}
          onWeekChange={(year, month, anchorDay) => {
            // Mobile prev/next bumps the week anchor. We update the
            // currentMonth/Year to track which month the new selectedDay
            // belongs to (might cross a boundary). The selected day is
            // the first session in the new week, or the anchor if none.
            // Look across all 7 cards in the new week for a session.
            let pickedYear = year
            let pickedMonth = month
            let pickedDay = anchorDay
            let foundSession = false
            for (let i = 0; i < 7; i++) {
              const t = new Date(year, month - 1, anchorDay + i)
              const dayMonth = t.getMonth() + 1
              const dayYear = t.getFullYear()
              const dayD = t.getDate()
              const monthSessions = getSessionsForMonth(dayYear, dayMonth)
              if (monthSessions[dayD]) {
                pickedYear = dayYear
                pickedMonth = dayMonth
                pickedDay = dayD
                foundSession = true
                break
              }
            }
            if (!foundSession) {
              pickedYear = year
              pickedMonth = month
              pickedDay = anchorDay
            }
            setCurrentYear(pickedYear)
            setCurrentMonth(pickedMonth)
            setSelectedDay(pickedDay)
          }}
          onToday={() => {
            setCurrentYear(DEMO_TODAY.year)
            setCurrentMonth(DEMO_TODAY.month)
            setSelectedDay(DEMO_TODAY.day)
          }}
          onRecord={() => router.push('/coach/web/record')}
        />
      </div>

      {/* Contextual pane — inline below the calendar on both platforms. */}
      <div style={{ marginTop: isMobile ? 18 : 28 }}>{paneContent}</div>

      {/* Modals + toast */}
      <ClipModal
        queue={clipQueue}
        title={clipQueueTitle}
        onClose={() => {
          setClipQueue(null)
          setClipQueueTitle(undefined)
        }}
        onShare={clip => {
          setClipSharing(clip)
          setClipQueue(null)
          setClipQueueTitle(undefined)
        }}
        onFlagChange={(_, isNowFlagged) => {
          setFlagTick(t => t + 1)
          setToast(isNowFlagged ? 'Flagged for follow-up' : 'Unflagged')
        }}
      />
      <ShareSheet
        clip={clipSharing}
        onClose={() => setClipSharing(null)}
        onAction={msg => setToast(msg)}
      />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

function EmptyDayState() {
  return (
    <Card style={{ padding: '40px 32px', textAlign: 'center' }}>
      <MEyebrow>NO SESSION</MEyebrow>
      <div
        style={{
          fontFamily: TYPE.body,
          fontSize: 14,
          color: BRAND.indigoMid,
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        Nothing scheduled this day. Pick another from the calendar above, or use{' '}
        <span style={{ color: BRAND.indigo, fontWeight: 700 }}>+ Record session</span> to
        start something new.
      </div>
    </Card>
  )
}

/** Demo "today" — used by the Calendar's Today button. Hardcoded
 *  inside the seeded data range (Feb–Apr 2026) so the button always
 *  lands somewhere with content. Bump when fixture data extends. */
const DEMO_TODAY = { year: 2026, month: 3, day: 21 }

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function formatSessionMeta(year: number, month: number, day: number): string {
  const dow = new Date(year, month - 1, day).toLocaleDateString('en-GB', { weekday: 'short' })
  return `${dow.toUpperCase()} ${day} ${MONTH_SHORT[month - 1]} · 15:00 · PITCH 1`
}

function parseSessionParam(p: string | null): number | null {
  if (!p) return null
  const m = p.match(/feb(\d{1,2})/i)
  if (!m) return null
  const day = parseInt(m[1]!, 10)
  if (!Number.isFinite(day) || day < 1 || day > 28) return null
  return day
}
