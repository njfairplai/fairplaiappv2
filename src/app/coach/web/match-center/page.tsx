'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import {
  DEFAULT_SELECTED_DAY,
  SESSIONS_BY_DAY,
  getStateForSession,
  type MatchCenterHighlight,
  type MatchCenterStatus,
} from '@/lib/match-center'
import {
  readSessionClassify,
  readFlaggedClips,
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

  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedDay, setSelectedDay] = useState<number>(initialDay)

  // Classification overrides keyed by sessionId. We re-read from localStorage
  // on mount and bump a counter when a state component reclassifies so the
  // pane updates immediately without a page refresh.
  const [classifyTick, setClassifyTick] = useState(0)
  const [clientReady, setClientReady] = useState(false)
  useEffect(() => {
    setClientReady(true)
  }, [])

  // Toast + modal state.
  const [toast, setToast] = useState<string | null>(null)
  const [clipPlaying, setClipPlaying] = useState<MatchCenterHighlight | null>(null)
  const [clipSharing, setClipSharing] = useState<MatchCenterHighlight | null>(null)
  const [flagTick, setFlagTick] = useState(0)

  const flaggedClips = useMemo(() => {
    if (!clientReady) return new Set<string>()
    return new Set(readFlaggedClips())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientReady, flagTick])

  const session = SESSIONS_BY_DAY[selectedDay] ?? null
  const effectiveStatus = useMemo<MatchCenterStatus | null>(() => {
    if (!session) return null
    if (!clientReady) return session.status
    const override = readSessionClassify(sessionIdForDay(session.day))
    return override ?? session.status
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, clientReady, classifyTick])

  const state = useMemo(() => {
    if (!session) return null
    return getStateForSession({ ...session, status: effectiveStatus ?? session.status })
  }, [session, effectiveStatus])

  const sessionId = session ? sessionIdForDay(session.day) : ''

  const handleReclassify = useCallback(() => {
    setClassifyTick(t => t + 1)
  }, [])

  const handleClipFlagToggle = useCallback((clip: MatchCenterHighlight) => {
    const isNowFlagged = toggleFlaggedClip(clip.id)
    setFlagTick(t => t + 1)
    setToast(isNowFlagged ? 'Flagged for follow-up' : 'Unflagged')
  }, [])

  return (
    <div
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        padding: '32px 36px',
        color: BRAND.indigo,
      }}
    >
      {/* Page header */}
      <div>
        <MEyebrow>SPRING 2026 SEASON</MEyebrow>
        <MDisplay size={64} style={{ marginTop: 6 }}>
          Match Center
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 14,
            color: BRAND.indigoMid,
            marginTop: 4,
          }}
        >
          MAK Academy U13 Lions · 7 matches played, 5 scheduled, 1 needs prep.
        </div>
      </div>

      {/* Calendar primitive */}
      <div style={{ marginTop: 28 }}>
        <Calendar
          view={view}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          onViewChange={setView}
          onRecord={() => router.push('/coach/web/record')}
        />
      </div>

      {/* Contextual pane */}
      <div style={{ marginTop: 28 }}>
        {state === '1' && (
          <State1Prep
            sessionId={sessionId}
            onToast={setToast}
            onReclassify={() => handleReclassify()}
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
        {state === '5' && (
          <State5Ready
            sessionDay={selectedDay}
            flaggedClips={flaggedClips}
            onOpenFullAnalysis={() => router.push('/coach/web/match/session_010')}
            onClipPlay={setClipPlaying}
            onClipShare={setClipSharing}
            onClipFlagToggle={handleClipFlagToggle}
          />
        )}
        {state === null && <EmptyDayState />}
      </div>

      {/* Modals + toast */}
      <ClipModal
        clip={clipPlaying}
        onClose={() => setClipPlaying(null)}
        onShare={() => {
          setClipSharing(clipPlaying)
          setClipPlaying(null)
        }}
        onFlagToggle={isNowFlagged => {
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

function parseSessionParam(p: string | null): number | null {
  if (!p) return null
  const m = p.match(/feb(\d{1,2})/i)
  if (!m) return null
  const day = parseInt(m[1]!, 10)
  if (!Number.isFinite(day) || day < 1 || day > 28) return null
  return day
}
