'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import {
  DEFAULT_SELECTED_DAY,
  SESSIONS_BY_DAY,
  getStateForSession,
} from '@/lib/match-center'
import { MEyebrow, MDisplay, Card } from '@/components/coach/match-center/atoms'
import { Calendar } from '@/components/coach/match-center/Calendar'
import { State1Prep } from '@/components/coach/match-center/states/State1Prep'
import { State2Categorise } from '@/components/coach/match-center/states/State2Categorise'
import { State3Drills } from '@/components/coach/match-center/states/State3Drills'
import { State4Processing } from '@/components/coach/match-center/states/State4Processing'
import { State5Ready } from '@/components/coach/match-center/states/State5Ready'

/**
 * Match Center — calendar-first front door for the coach.
 *
 * The page wires the calendar primitive (month/week toggle) to the
 * contextual pane below. State for the pane comes from
 * `getStateForSession(selected)`:
 *
 *   1 Prep  →  upcoming match, attendance/lineup/confirm tabs
 *   2 Categorise →  past, AI couldn't tell match vs drill
 *   3 Drills →  drills only, no analysis
 *   4 Processing →  analysis in-flight, ETA shown
 *   5 Ready →  full read-out + CTA into the existing match drill-in
 *
 * `/coach/web/match-center?session=feb24` deep-links to a specific day
 * (used by the drill-in's "Back to matches" round-trip).
 */
export default function CoachMatchCenterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session')
  const initialDay = useMemo(() => parseSessionParam(sessionParam) ?? DEFAULT_SELECTED_DAY, [sessionParam])

  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedDay, setSelectedDay] = useState<number>(initialDay)

  const session = SESSIONS_BY_DAY[selectedDay] ?? null
  const state = getStateForSession(session)

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
        {state === '1' && <State1Prep />}
        {state === '2' && <State2Categorise />}
        {state === '3' && <State3Drills />}
        {state === '4' && <State4Processing />}
        {state === '5' && (
          <State5Ready
            onOpenFullAnalysis={() => router.push(`/coach/web/match/session_010`)}
          />
        )}
        {state === null && <EmptyDayState />}
      </div>
    </div>
  )
}

/**
 * Lightweight stand-in when the user clicks an empty calendar cell. Kept
 * tiny so it doesn't dominate the page — the calendar above stays the
 * primary navigation surface.
 */
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

/**
 * The design pack uses URL params like `?session=feb24` to deep-link to
 * a specific day. Map these stubs back to a day number so the page
 * lights up correctly when the user lands.
 */
function parseSessionParam(p: string | null): number | null {
  if (!p) return null
  const m = p.match(/feb(\d{1,2})/i)
  if (!m) return null
  const day = parseInt(m[1]!, 10)
  if (!Number.isFinite(day) || day < 1 || day > 28) return null
  return day
}
