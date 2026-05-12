'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { matchAnalyses, squadScores } from '@/lib/mockData'
import { parentScoreColor } from '@/lib/parent-score-color'
import { cn } from '@/lib/cn'
import {
  getKidsForParent,
  getDefaultKid,
  getLatestAnalysedMatch,
  getNextUpcomingSession,
  getBestClipFromMatch,
  getNotificationsForKid,
  readClientNotifications,
  mergeNotifications,
  type PortalNotification,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { HomeHero } from '@/components/parent-portal/HomeHero'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'

/**
 * Parent Home — restructured. Hybrid hero (clip + radar) + thin event
 * feed + next-session footer. Mobile-first; the parent layout already
 * caps width at 480px.
 */
export default function ParentHomePage() {
  const router = useRouter()
  // In real auth this comes from session. For now: parent_001 — a multi-kid
  // family per the parent-portal lib's MULTI_KID_OVERRIDE.
  const PARENT_ID = 'parent_001'

  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)

  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const latestMatch = useMemo(
    () => (activeKid ? getLatestAnalysedMatch(activeKid.id) : null),
    [activeKid],
  )
  const matchAnalysis = useMemo(() => {
    if (!activeKid || !latestMatch) return null
    return matchAnalyses.find(
      a => a.sessionId === latestMatch.id && a.playerId === activeKid.id,
    ) ?? null
  }, [activeKid, latestMatch])
  const seasonAnalyses = useMemo(
    () => (activeKid ? matchAnalyses.filter(a => a.playerId === activeKid.id) : []),
    [activeKid],
  )
  const bestClip = useMemo(() => {
    if (!activeKid || !latestMatch) return null
    return getBestClipFromMatch(activeKid.id, latestMatch.id)
  }, [activeKid, latestMatch])
  const baseNotifications = useMemo(
    () => (activeKid ? getNotificationsForKid(activeKid.id) : []),
    [activeKid],
  )
  const [clientNotifications, setClientNotifications] = useState<PortalNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined' || !activeKid) return
    setClientNotifications(readClientNotifications(activeKid.id))
    try {
      const raw = localStorage.getItem('fairplai_parent_notifications_read')
      if (raw) setReadIds(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore */
    }
  }, [activeKid])

  const allNotifications = useMemo(
    () => mergeNotifications(baseNotifications, clientNotifications),
    [baseNotifications, clientNotifications],
  )
  const unreadCount = allNotifications.filter(n => !readIds.has(n.id)).length
  const lately = allNotifications.slice(0, 5)

  const nextSession = useMemo(
    () => (activeKid ? getNextUpcomingSession(activeKid.id) : null),
    [activeKid],
  )

  if (!activeKid) {
    return (
      <div className="p-6 text-center">
        <p className="font-satoshi text-brand-indigo-mute">
          No players linked to this parent account yet.
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-[100dvh] bg-brand-sand pb-20 text-brand-indigo"
    >
      <PortalTopBar unreadCount={unreadCount} />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      <HomeHero
        player={activeKid}
        match={latestMatch}
        matchAnalysis={matchAnalysis}
        bestClip={bestClip}
        seasonAnalyses={seasonAnalyses}
        role="parent"
      />

      {/* Season composite — promoted from /parent/development. Headline
       *  number for the parent. Auto-hides if no squadScore exists. */}
      {(() => {
        const score = activeKid ? squadScores[activeKid.id] : null
        if (!score) return null
        const color = parentScoreColor(score.compositeScore)
        return (
          <section className="px-4 pt-3.5">
            <div className="flex items-baseline gap-3.5 rounded-xl border border-brand-line bg-brand-paper px-4 py-3.5">
              <span className="shrink-0 font-fragment text-[10.5px] font-bold tracking-[0.22em] text-brand-indigo-mute">
                SEASON
              </span>
              <span
                className="font-clash text-[44px] leading-none tracking-[-0.02em]"
                style={{ color }}
              >
                {score.compositeScore}
              </span>
              <span className="ml-auto text-right font-satoshi text-[12.5px] text-brand-indigo-mute">
                Composite score across<br />all matches this season.
              </span>
            </div>
          </section>
        )
      })()}

      {/* Lately — preview of the top notifications. Full list now lives
          at /parent/hub (system events merged into the unified feed). */}
      {lately.length > 0 && (
        <section className="flex flex-col gap-1 border-t border-brand-line px-4 py-3.5">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
              LATELY
            </span>
            <button
              type="button"
              onClick={() => router.push('/parent/hub')}
              className="cursor-pointer border-none bg-transparent p-0 font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo"
            >
              SEE ALL
            </button>
          </div>
          {lately.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => router.push(n.href)}
              className="grid cursor-pointer items-center gap-3 border-0 border-b border-solid border-brand-line bg-transparent px-1 py-2.5 text-left font-satoshi [grid-template-columns:auto_1fr_auto]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    n.kind === 'clips'
                      ? 'var(--brand-indigo)'
                      : n.kind === 'coach_note'
                      ? 'var(--brand-yellow)'
                      : n.kind === 'idp_update'
                      ? 'var(--brand-coral)'
                      : n.kind === 'attendance_milestone'
                      ? 'var(--brand-yellow)'
                      : 'var(--brand-indigo-mute)',
                }}
              />
              <span
                className={cn(
                  'overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] text-brand-indigo',
                  readIds.has(n.id) ? 'font-medium' : 'font-semibold',
                )}
              >
                {n.title}
              </span>
              <span className="whitespace-nowrap font-fragment text-[10px] font-semibold tracking-[0.14em] text-brand-indigo-mute">
                {n.shortDate.toUpperCase()}
              </span>
            </button>
          ))}
        </section>
      )}

      {/* Next session footer card */}
      {nextSession && (
        <section className="px-4 pb-5 pt-3.5">
          <button
            type="button"
            onClick={() => router.push('/parent/stats')}
            className="grid w-full cursor-pointer items-center gap-3 rounded-xl border border-brand-line bg-brand-paper px-4 py-3.5 text-left font-satoshi [grid-template-columns:auto_1fr_auto]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow text-brand-indigo">
              <CalendarIcon size={18} />
            </span>
            <div className="min-w-0">
              <div className="font-fragment text-[9.5px] font-bold tracking-[0.22em] text-brand-indigo-mute">
                NEXT UP
              </div>
              <div className="mt-0.5 text-sm font-semibold text-brand-indigo">
                {nextSession.type === 'match'
                  ? `vs ${nextSession.opponent ?? 'Match'}`
                  : nextSession.type === 'training_match'
                  ? 'Training match'
                  : 'Training session'}
              </div>
              <div className="mt-0.5 font-fragment text-[10.5px] font-semibold tracking-[0.14em] text-brand-indigo-mute">
                {formatNextDate(nextSession.date)} · {nextSession.startTime}
              </div>
            </div>
            <ChevronRight size={18} color="var(--brand-indigo-mute)" />
          </button>
        </section>
      )}
    </div>
  )
}

function formatNextDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
