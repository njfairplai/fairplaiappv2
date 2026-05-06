'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { highlights as allHighlights, sessions } from '@/lib/mockData'
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
import { ShareMenu } from '@/components/coach/player-profile/ShareMenu'
import type { Highlight } from '@/lib/types'

const PAGE_SIZE = 5

type EventFilter = 'all' | 'goal' | 'key_pass' | 'tackle' | 'save' | 'sprint_recovery'

const FILTER_LABELS: Record<EventFilter, string> = {
  all: 'All',
  goal: 'Goals',
  key_pass: 'Key passes',
  tackle: 'Tackles',
  save: 'Saves',
  sprint_recovery: 'Sprints',
}

const EVENT_BADGES: Record<Highlight['eventType'], { label: string; color: string }> = {
  goal: { label: 'GOAL', color: 'var(--brand-yellow)' },
  key_pass: { label: 'KEY', color: 'var(--brand-indigo)' },
  tackle: { label: 'TACKLE', color: 'var(--brand-coral)' },
  save: { label: 'SAVE', color: 'var(--brand-indigo)' },
  sprint_recovery: { label: 'SPRINT', color: 'var(--brand-indigo-mid)' },
}

/**
 * Parent Highlights — clip browser bundled by match. Mobile-tuned: a
 * "Season reel" hero card at the top + filter chips + grouped clips per
 * match below, paginated by 7 matches per page.
 */
export default function ParentHighlightsPage() {
  const router = useRouter()
  const PARENT_ID = 'parent_001'

  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)
  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const [filter, setFilter] = useState<EventFilter>('all')

  // All clips for the kid, scoped to their roster sessions.
  const playerHighlights = useMemo(() => {
    if (!activeKid) return []
    const sessionIds = new Set(getMatchListForKid(activeKid.id).map(s => s.id))
    return allHighlights
      .filter(h => h.playerId === activeKid.id && sessionIds.has(h.sessionId))
      .sort((a, b) => {
        const ad = sessions.find(s => s.id === a.sessionId)?.date ?? ''
        const bd = sessions.find(s => s.id === b.sessionId)?.date ?? ''
        return bd.localeCompare(ad)
      })
  }, [activeKid])

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? playerHighlights
        : playerHighlights.filter(h => h.eventType === filter),
    [filter, playerHighlights],
  )

  // Group filtered clips by sessionId, preserve newest-first order.
  const grouped = useMemo(() => {
    const map = new Map<string, Highlight[]>()
    for (const h of filtered) {
      if (!map.has(h.sessionId)) map.set(h.sessionId, [])
      map.get(h.sessionId)!.push(h)
    }
    return [...map.entries()]
  }, [filtered])

  // Pagination over MATCHES (not clips) — 7 matches per page.
  const [page, setPage] = useState(0)
  useEffect(() => {
    setPage(0)
  }, [activeKidId, filter])
  const totalPages = Math.max(1, Math.ceil(grouped.length / PAGE_SIZE))
  const pagedGroups = grouped.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const counts = useMemo(() => {
    const out: Record<EventFilter, number> = {
      all: playerHighlights.length,
      goal: 0,
      key_pass: 0,
      tackle: 0,
      save: 0,
      sprint_recovery: 0,
    }
    for (const h of playerHighlights) out[h.eventType as EventFilter]++
    return out
  }, [playerHighlights])

  const totalDuration = playerHighlights.reduce(
    (s, h) => s + h.durationSeconds,
    0,
  )

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
    return null
  }

  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        minHeight: '100dvh',
        color: 'var(--brand-indigo)',
        paddingBottom: 80,
      }}
    >
      <PortalTopBar unreadCount={unreadCount} />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Season reel hero */}
      {playerHighlights.length > 0 && (
        <section style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              borderRadius: 12,
              padding: '20px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <button
              type="button"
              aria-label="Watch season reel"
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--brand-yellow)',
                color: 'var(--brand-indigo)',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(252, 215, 24, 0.32)',
              }}
            >
              <Play size={22} fill="currentColor" />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-yellow)',
                  fontWeight: 700,
                }}
              >
                SEASON REEL
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  color: 'var(--brand-sand)',
                  letterSpacing: '-0.02em',
                  marginTop: 2,
                  lineHeight: 1.1,
                }}
              >
                {playerHighlights.length} clips · {Math.floor(totalDuration / 60)}m
              </div>
            </div>
            <ShareMenu
              mode="icon"
              title={`${activeKid.firstName} · season highlights`}
              url={`https://fairpl.ai/p/${activeKid.id}/season`}
            />
          </div>
        </section>
      )}

      {/* Filter chips */}
      <section
        style={{
          padding: '14px 16px 0',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {(Object.keys(FILTER_LABELS) as EventFilter[]).map(f => {
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 999,
                border: active
                  ? '1px solid var(--brand-indigo)'
                  : '1px solid var(--brand-line)',
                background: active ? 'var(--brand-indigo)' : 'transparent',
                color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {FILTER_LABELS[f]}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  opacity: 0.7,
                }}
              >
                {counts[f]}
              </span>
            </button>
          )
        })}
      </section>

      {/* Grouped clips per match */}
      <section
        style={{
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {grouped.length === 0 ? (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            {filter === 'all'
              ? 'No clips yet. They land here once matches are analysed.'
              : `No ${FILTER_LABELS[filter].toLowerCase()} this season.`}
          </div>
        ) : (
          <>
            {pagedGroups.map(([sessionId, clips]) => {
              const session = sessions.find(s => s.id === sessionId)
              const matchTitle =
                session?.type === 'training_match'
                  ? 'Training match'
                  : session?.opponent
                  ? `vs ${session.opponent}`
                  : 'Match'
              return (
                <div
                  key={sessionId}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/parent/match/${sessionId}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 8,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9.5,
                          letterSpacing: '0.18em',
                          color: 'var(--brand-indigo-mute)',
                          fontWeight: 700,
                        }}
                      >
                        {session ? formatShortDate(session.date).toUpperCase() : '—'}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 18,
                          color: 'var(--brand-indigo)',
                          letterSpacing: '-0.02em',
                          marginTop: 2,
                          lineHeight: 1.1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {matchTitle}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        color: 'var(--brand-indigo)',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {clips.length} {clips.length === 1 ? 'CLIP' : 'CLIPS'} →
                    </span>
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {clips.map(c => (
                      <ClipRow key={c.id} clip={c} />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  paddingTop: 12,
                  borderTop: '1px solid var(--brand-line)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={paginationBtnStyle(page === 0)}
                >
                  <ChevronLeft size={14} />
                  Newer
                </button>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    color: 'var(--brand-indigo-mute)',
                    fontWeight: 700,
                  }}
                >
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  style={paginationBtnStyle(page === totalPages - 1)}
                >
                  Older
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function ClipRow({ clip }: { clip: Highlight }) {
  const meta = EVENT_BADGES[clip.eventType]
  const minute = Math.floor(clip.timestampSeconds / 60)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 10,
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 8,
        padding: '10px 12px',
      }}
    >
      <button
        type="button"
        aria-label="Play clip"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--brand-indigo)',
          color: 'var(--brand-sand)',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Play size={14} fill="currentColor" />
      </button>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.18em',
              fontWeight: 800,
              color: 'var(--brand-indigo)',
              background: meta.color,
              padding: '2px 5px',
              borderRadius: 3,
              lineHeight: 1,
            }}
          >
            {meta.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.16em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            {minute}m · {clip.durationSeconds}S
          </span>
        </div>
      </div>
      <ShareMenu
        mode="icon"
        title={`${meta.label} clip`}
        url={`https://fairpl.ai/c/${clip.id}`}
      />
    </div>
  )
}

function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid var(--brand-line)',
    borderRadius: 999,
    fontFamily: 'var(--font-body)',
    fontSize: 12.5,
    fontWeight: 600,
    color: 'var(--brand-indigo)',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
  }
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
