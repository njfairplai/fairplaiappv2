'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { matchAnalyses, squadScores } from '@/lib/mockData'
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
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-indigo-mute)' }}>
          No players linked to this parent account yet.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        minHeight: '100dvh',
        color: 'var(--brand-indigo)',
        paddingBottom: 80, // bottom-nav clearance
      }}
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
        const color =
          score.compositeScore >= 75
            ? 'var(--brand-yellow)'
            : score.compositeScore >= 60
            ? 'var(--brand-indigo)'
            : 'var(--brand-coral)'
        return (
          <section style={{ padding: '14px 16px 0' }}>
            <div
              style={{
                background: 'var(--brand-paper)',
                border: '1px solid var(--brand-line)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                SEASON
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 44,
                  color,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {score.compositeScore}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  color: 'var(--brand-indigo-mute)',
                  marginLeft: 'auto',
                  textAlign: 'right',
                }}
              >
                Composite score across<br />all matches this season.
              </span>
            </div>
          </section>
        )
      })()}

      {/* Lately — preview of the top notifications. Full list lives at
          /parent/notifications via the bell icon. */}
      {lately.length > 0 && (
        <section
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--brand-line)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              LATELY
            </span>
            <button
              type="button"
              onClick={() => router.push('/parent/notifications')}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.18em',
                color: 'var(--brand-indigo)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              SEE ALL
            </button>
          </div>
          {lately.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => router.push(n.href)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '10px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--brand-line)',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
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
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13.5,
                  color: 'var(--brand-indigo)',
                  fontWeight: readIds.has(n.id) ? 500 : 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {n.title}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {n.shortDate.toUpperCase()}
              </span>
            </button>
          ))}
        </section>
      )}

      {/* Next session footer card */}
      {nextSession && (
        <section style={{ padding: '14px 16px 20px' }}>
          <button
            type="button"
            onClick={() => router.push('/parent/stats')}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: 'var(--brand-paper)',
              border: '1px solid var(--brand-line)',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--brand-yellow)',
                color: 'var(--brand-indigo)',
              }}
            >
              <CalendarIcon size={18} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                NEXT UP
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--brand-indigo)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {nextSession.type === 'match'
                  ? `vs ${nextSession.opponent ?? 'Match'}`
                  : nextSession.type === 'training_match'
                  ? 'Training match'
                  : 'Training session'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
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
