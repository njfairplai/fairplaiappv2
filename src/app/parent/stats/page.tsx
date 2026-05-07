'use client'

import { useEffect, useMemo, useState } from 'react'
import { matchAnalyses, highlights } from '@/lib/mockData'
import {
  getKidsForParent,
  getDefaultKid,
  getMatchListForKid,
  getNotificationsForKid,
  readClientNotifications,
  mergeNotifications,
  type PortalNotification,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { MatchFilmstripCard } from '@/components/parent-portal/MatchFilmstripCard'
import { StatsRadarSection } from '@/components/parent-portal/StatsRadarSection'
import { parentScoreColor } from '@/lib/parent-score-color'

/**
 * Parent Stats — split-screen: horizontal filmstrip top, radar bottom.
 * Tap a card → radar updates in place. Both visible at once, no separate
 * page, no scroll-to-top jump.
 *
 * The per-match detail route (`/parent/match/[id]`) still exists as a
 * deep-link target (notifications, share links) but isn't reached from
 * Stats anymore.
 */
export default function ParentStatsPage() {
  const PARENT_ID = 'parent_001'

  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)
  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const matchList = useMemo(
    () => (activeKid ? getMatchListForKid(activeKid.id) : []),
    [activeKid],
  )
  // Newest first (filmstrip reads right-to-left in chronological terms).
  const sortedList = useMemo(() => [...matchList].reverse(), [matchList])

  // Selected match defaults to most-recent ANALYSED.
  const initialSelectedSessionId = useMemo(() => {
    if (!activeKid) return null
    const today = new Date().toISOString().slice(0, 10)
    for (const s of sortedList) {
      if (
        s.date <= today &&
        (s.status === 'analysed' || s.status === 'playback_ready')
      )
        return s.id
    }
    return null
  }, [sortedList, activeKid])

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    initialSelectedSessionId,
  )
  useEffect(() => {
    setSelectedSessionId(initialSelectedSessionId)
  }, [initialSelectedSessionId])

  const selectedMatch = sortedList.find(s => s.id === selectedSessionId) ?? null
  const selectedAnalysis = useMemo(() => {
    if (!activeKid || !selectedSessionId) return null
    return (
      matchAnalyses.find(
        a => a.playerId === activeKid.id && a.sessionId === selectedSessionId,
      ) ?? null
    )
  }, [activeKid, selectedSessionId])
  const selectedMatchLabel = useMemo(() => {
    if (!selectedMatch) return ''
    if (selectedMatch.type === 'training_match') return 'Training match'
    return selectedMatch.opponent ? `vs ${selectedMatch.opponent}` : 'Match'
  }, [selectedMatch])

  // Notifications for bell badge.
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

  if (!activeKid) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-indigo-mute)' }}>
          No players linked to this account yet.
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
        paddingBottom: 80,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PortalTopBar unreadCount={unreadCount} />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Top half: horizontal filmstrip of matches */}
      <section
        style={{
          padding: '14px 16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
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
            SEASON · {sortedList.length} {sortedList.length === 1 ? 'MATCH' : 'MATCHES'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.16em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 600,
            }}
          >
            TAP A MATCH
          </span>
        </div>
        {sortedList.length === 0 ? (
          <div
            style={{
              padding: '32px 8px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            No matches recorded yet.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 6,
              scrollbarWidth: 'thin',
              scrollSnapType: 'x mandatory',
            }}
          >
            {sortedList.map(s => {
              const analysis = matchAnalyses.find(
                a => a.playerId === activeKid.id && a.sessionId === s.id,
              ) ?? null
              const today = new Date().toISOString().slice(0, 10)
              const upcoming = s.date > today
              const motm = !!analysis && analysis.compositeScore >= 80
              return (
                <div key={s.id} style={{ scrollSnapAlign: 'start' }}>
                  <MatchFilmstripCard
                    session={s}
                    analysis={analysis}
                    selected={s.id === selectedSessionId}
                    upcoming={upcoming}
                    motm={motm}
                    onClick={() => {
                      if (upcoming) return
                      if (
                        s.status !== 'analysed' &&
                        s.status !== 'playback_ready'
                      )
                        return
                      setSelectedSessionId(s.id)
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Bottom half: radar for the selected match */}
      <section
        style={{
          padding: '8px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
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
            {selectedMatchLabel ? selectedMatchLabel.toUpperCase() : 'NO MATCH SELECTED'}
          </span>
          {selectedAnalysis && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.16em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 600,
              }}
            >
              COMPOSITE{' '}
              <span style={{ color: parentScoreColor(selectedAnalysis.compositeScore), fontWeight: 700 }}>
                {selectedAnalysis.compositeScore}
              </span>
            </span>
          )}
        </div>
        {selectedAnalysis ? (
          <StatsRadarSection
            playerId={activeKid.id}
            records={[selectedAnalysis]}
            scope="match"
            isMobile
          />
        ) : (
          <div
            style={{
              background: 'var(--brand-paper)',
              border: '1px solid var(--brand-line)',
              borderRadius: 12,
              padding: '40px 16px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            Tap an analysed match above to see the radar.
          </div>
        )}
      </section>
    </div>
  )
}

// `highlights` import retained for downstream additions (per-match-clip
// preview line if we add it). Currently unused — silence the linter.
void highlights
