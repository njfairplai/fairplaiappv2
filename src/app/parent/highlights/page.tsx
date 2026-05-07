'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, ChevronLeft, ChevronRight, Camera, Send } from 'lucide-react'
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
import { MATCH_CENTER_HIGHLIGHTS } from '@/lib/match-center'
import {
  getSharedClipsForPlayer,
  getCoachCamClipsForPlayer,
  type SharedClipRecord,
} from '@/lib/parent-portal'
import type { CoachCamClip } from '@/lib/types'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { ShareMenu } from '@/components/coach/player-profile/ShareMenu'
import type { Highlight } from '@/lib/types'

const PAGE_SIZE = 5

/** Shared + Coach-Cam clips drop out of the parent's view this many ms
 *  after the coach pushed them. The underlying records stay in
 *  localStorage so we have a real backend swap-in path; the UI just
 *  filters them out. 15 days per product brief. */
const COACH_CLIP_EXPIRY_MS = 15 * 24 * 60 * 60 * 1000

/** Discriminated union for the "From your coach" group rows. */
type CoachTouchedRow =
  | {
      kind: 'shared'
      clip: Highlight
      record: SharedClipRecord
      headline: string
    }
  | {
      kind: 'coach_cam'
      cam: CoachCamClip
    }

type EventFilter = 'all' | 'goal' | 'shot' | 'key_pass' | 'def' | 'save'

const FILTER_LABELS: Record<EventFilter, string> = {
  all: 'All',
  goal: 'Goals',
  shot: 'Shots',
  key_pass: 'Key passes',
  def: 'Key defence',
  save: 'Saves',
}

/* Event badge colour pairs — locked vocabulary across the app:
 *   goal · shot · key_pass (key) · def · save
 * `tackle`, `sprint_recovery`, and `key` are accepted as legacy aliases
 * (the union still includes them via the Highlight type) so older
 * fixture rows don't break this lookup. */
const EVENT_BADGES: Record<Highlight['eventType'], { label: string; color: string }> = {
  goal:            { label: 'GOAL',   color: 'var(--brand-yellow)' },
  shot:            { label: 'SHOT',   color: 'var(--brand-indigo-mid)' },
  key:             { label: 'KEY',    color: 'var(--brand-indigo)' },
  key_pass:        { label: 'KEY',    color: 'var(--brand-indigo)' },
  def:             { label: 'DEF',    color: 'var(--brand-coral)' },
  tackle:          { label: 'DEF',    color: 'var(--brand-coral)' },
  save:            { label: 'SAVE',   color: 'var(--brand-indigo)' },
  sprint_recovery: { label: 'SPRINT', color: 'var(--brand-indigo-mid)' },
  injury:          { label: 'INJURY', color: 'var(--brand-coral)' },
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

  // Coach-touched clips — clips the coach forwarded via Share Clip OR
  // uploaded via Coach Cam. Both surface at the TOP of the highlights
  // grid as a single "From your coach" group, with a per-clip badge
  // distinguishing source. Records older than 15 days drop off.
  const [coachTouched, setCoachTouched] = useState<CoachTouchedRow[]>([])
  useEffect(() => {
    if (!activeKid) return
    const cutoff = Date.now() - COACH_CLIP_EXPIRY_MS
    const rows: CoachTouchedRow[] = []

    for (const rec of getSharedClipsForPlayer(activeKid.id)) {
      if (new Date(rec.sentAt).getTime() < cutoff) continue
      const clip = allHighlights.find(h => h.id === rec.highlightId)
      if (!clip) continue
      const mc = MATCH_CENTER_HIGHLIGHTS.find(m => m.id === rec.highlightId)
      rows.push({
        kind: 'shared',
        clip,
        record: rec,
        headline: mc?.headline ?? rec.message ?? 'Coach shared this clip',
      })
    }
    for (const cam of getCoachCamClipsForPlayer(activeKid.id)) {
      if (new Date(cam.uploadedAt).getTime() < cutoff) continue
      rows.push({ kind: 'coach_cam', cam })
    }
    rows.sort((a, b) => {
      const aDate = a.kind === 'shared' ? a.record.sentAt : a.cam.uploadedAt
      const bDate = b.kind === 'shared' ? b.record.sentAt : b.cam.uploadedAt
      return bDate.localeCompare(aDate)
    })
    setCoachTouched(rows)
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
      shot: 0,
      key_pass: 0,
      def: 0,
      save: 0,
    }
    // Map legacy event types to the EventFilter keys so older fixture
    // rows still feed the counters (tackle→def, key→key_pass, etc.)
    for (const h of playerHighlights) {
      const key: EventFilter | null =
        h.eventType === 'goal' ? 'goal' :
        h.eventType === 'shot' ? 'shot' :
        h.eventType === 'key_pass' || h.eventType === 'key' ? 'key_pass' :
        h.eventType === 'def' || h.eventType === 'tackle' ? 'def' :
        h.eventType === 'save' ? 'save' :
        null
      if (key) out[key]++
    }
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
        {/* "From your coach" group — promoted to the top of the grid
         *  when the coach has shared clips or uploaded Coach Cam clips
         *  in the last 15 days. Only shows when the filter is `all` so
         *  the AI event filters apply only to the AI grid below. */}
        {filter === 'all' && coachTouched.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              data-tour-id="parent-highlights-coach-group"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                FROM YOUR COACH
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
                {coachTouched.length} {coachTouched.length === 1 ? 'CLIP' : 'CLIPS'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {coachTouched.map((row, idx) => (
                <div
                  key={row.kind === 'shared' ? row.record.id : row.cam.id}
                  data-tour-id={idx === 0 ? 'parent-highlights-coach-row' : undefined}
                >
                  <CoachTouchedClipRow
                    row={row}
                    onOpen={() => {
                      const id = row.kind === 'shared' ? row.clip.id : row.cam.id
                      router.push(`/parent/clips/${id}?source=${row.kind}`)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

/**
 * Card row for a coach-touched clip (Share Clip OR Coach Cam). Same row
 * height as ClipRow so the "From your coach" group reads as part of the
 * highlights grid, just with a source badge that distinguishes it from
 * AI clips. Tap routes through to /parent/clips/[clipId].
 */
function CoachTouchedClipRow({
  row,
  onOpen,
}: {
  row: CoachTouchedRow
  onOpen: () => void
}) {
  const isShared = row.kind === 'shared'
  const sourceColor = isShared ? '#7C3AED' : '#14B8A6'
  const sourceLabel = isShared ? 'SHARED' : 'COACH CAM'
  const SourceIcon = isShared ? Send : Camera
  const title = isShared ? row.headline : row.cam.caption ?? 'Coach Cam clip'
  const meta = isShared
    ? `${row.clip.eventType.toUpperCase()} · ${row.clip.durationSeconds}S`
    : `${(row.cam.tag ?? 'moment').toUpperCase()} · ${row.cam.durationSeconds}S`
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 10,
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderLeft: `3px solid ${sourceColor}`,
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--brand-indigo)',
          color: 'var(--brand-sand)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Play size={14} fill="currentColor" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              borderRadius: 3,
              background: `${sourceColor}1A`,
              color: sourceColor,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.16em',
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            <SourceIcon size={9} />
            {sourceLabel}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {meta}
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--brand-indigo-mute)',
        }}
      >
        →
      </span>
    </button>
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
