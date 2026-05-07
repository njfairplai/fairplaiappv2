'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  getKidsForParent,
  getDefaultKid,
  getNotificationsForKid,
  readClientNotifications,
  mergeNotifications,
  type PortalNotification,
} from '@/lib/parent-portal'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'

const READ_KEY = 'fairplai_parent_notifications_read'

/* Inbox surface for the parent portal. Composition (top→bottom):
 *   1. Filter chip rail — All · Clips · Updates · Health · Schedule.
 *      Chips bundle the 9 underlying NotificationKind values into 4
 *      meaningful buckets so the parent isn't decoding a colour legend.
 *   2. Counts row + Mark all read
 *   3. Notification rows with a small kind dot, title/body, and a
 *      right-aligned relative date so dates are scannable, not buried.
 */
export default function ParentNotificationsPage() {
  const router = useRouter()
  const PARENT_ID = 'parent_001'
  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const activeKid = useMemo(() => getDefaultKid(PARENT_ID), [])

  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [clientNotifs, setClientNotifs] = useState<PortalNotification[]>([])
  const [filter, setFilter] = useState<FilterId>('all')

  useEffect(() => {
    if (typeof window === 'undefined' || !activeKid) return
    setClientNotifs(readClientNotifications(activeKid.id))
    try {
      const raw = localStorage.getItem(READ_KEY)
      if (raw) setReadIds(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore */
    }
  }, [activeKid])

  const baseNotifs = useMemo(
    () => (activeKid ? getNotificationsForKid(activeKid.id) : []),
    [activeKid],
  )
  const all = useMemo(
    () => mergeNotifications(baseNotifs, clientNotifs),
    [baseNotifs, clientNotifs],
  )
  const filtered = useMemo(() => {
    if (filter === 'all') return all
    return all.filter(n => filterFor(n.kind) === filter)
  }, [all, filter])

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = {
      all: all.length,
      clips: 0,
      updates: 0,
      health: 0,
      schedule: 0,
    }
    for (const n of all) {
      const f = filterFor(n.kind)
      if (f) c[f]++
    }
    return c
  }, [all])

  const markAllRead = () => {
    const ids = new Set(all.map(n => n.id))
    setReadIds(ids)
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...ids]))
    } catch {
      /* ignore */
    }
  }

  const open = (n: PortalNotification) => {
    const next = new Set(readIds)
    next.add(n.id)
    setReadIds(next)
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...next]))
    } catch {
      /* ignore */
    }
    router.push(n.href)
  }

  const unreadCount = filtered.filter(n => !readIds.has(n.id)).length

  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        minHeight: '100dvh',
        color: 'var(--brand-indigo)',
        paddingBottom: 80,
      }}
    >
      <PortalTopBar title="Notifications" showBack />

      {/* Filter chip rail — bundles fine-grained kinds into 4 buckets so
       *  parents focus by topic, not by decoding a colour legend. */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: '1px solid var(--brand-line)',
        }}
      >
        {FILTER_DEFS.map(f => {
          const isActive = filter === f.id
          const count = counts[f.id]
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={isActive}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 13px',
                borderRadius: 999,
                border: isActive ? '1px solid var(--brand-indigo)' : '1px solid var(--brand-line)',
                background: isActive ? 'var(--brand-indigo)' : 'transparent',
                color: isActive ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {f.id !== 'all' && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isActive ? 'var(--brand-yellow)' : f.dot,
                  }}
                />
              )}
              {f.label}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  opacity: 0.7,
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--brand-line)',
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
          {unreadCount} UNREAD
        </span>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--brand-indigo)',
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--brand-indigo-mute)',
          }}
        >
          {filter === 'all'
            ? 'No notifications yet. New clips, coach notes, and updates will land here.'
            : `Nothing in ${FILTER_DEFS.find(f => f.id === filter)?.label.toLowerCase()} this week.`}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filtered.map(n => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => open(n)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  alignItems: 'flex-start',
                  gap: 12,
                  width: '100%',
                  background: readIds.has(n.id) ? 'transparent' : 'var(--brand-paper)',
                  border: 'none',
                  borderBottom: '1px solid var(--brand-line)',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <NotificationDot kind={n.kind} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: readIds.has(n.id) ? 500 : 700,
                      color: 'var(--brand-indigo)',
                    }}
                  >
                    {n.title}
                  </div>
                  {n.body && (
                    <div
                      style={{
                        fontSize: 12.5,
                        color: 'var(--brand-indigo-mute)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {n.body}
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9.5,
                      letterSpacing: '0.18em',
                      color: 'var(--brand-indigo-mute)',
                      fontWeight: 700,
                      marginTop: 4,
                    }}
                  >
                    {labelForKind(n.kind)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 2,
                    minWidth: 78,
                    paddingTop: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--brand-indigo)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {relativeDate(n.date)}
                  </span>
                </div>
                <ChevronRight size={16} color="var(--brand-indigo-mute)" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NotificationDot({ kind }: { kind: PortalNotification['kind'] }) {
  const color = dotColorForKind(kind)
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        marginTop: 6,
      }}
    />
  )
}

// ─── Filter buckets ──────────────────────────────────────
type FilterId = 'all' | 'clips' | 'updates' | 'health' | 'schedule'

const FILTER_DEFS: { id: FilterId; label: string; dot: string }[] = [
  { id: 'all',      label: 'All',      dot: 'var(--brand-indigo)' },
  { id: 'clips',    label: 'Clips',    dot: '#7C3AED' },
  { id: 'updates',  label: 'Updates',  dot: 'var(--brand-yellow)' },
  { id: 'health',   label: 'Health',   dot: 'var(--brand-coral)' },
  { id: 'schedule', label: 'Schedule', dot: 'var(--brand-indigo-mute)' },
]

/** Maps the fine-grained NotificationKind to one of the 5 inbox filter
 *  buckets. Keep in sync with FILTER_DEFS. */
function filterFor(kind: PortalNotification['kind']): Exclude<FilterId, 'all'> {
  switch (kind) {
    case 'clips':
    case 'shared_clip':
    case 'coach_cam':
      return 'clips'
    case 'coach_note':
    case 'idp_update':
    case 'attendance_milestone':
      return 'updates'
    case 'injury':
    case 'ppe':
      return 'health'
    case 'session_scheduled':
      return 'schedule'
    default:
      return 'updates'
  }
}

function dotColorForKind(kind: PortalNotification['kind']): string {
  switch (kind) {
    case 'clips':                 return 'var(--brand-indigo)'
    case 'shared_clip':           return '#7C3AED'
    case 'coach_cam':             return '#14B8A6'
    case 'coach_note':            return 'var(--brand-yellow)'
    case 'idp_update':            return 'var(--brand-indigo-mid)'
    case 'attendance_milestone':  return 'var(--brand-yellow-soft)'
    case 'session_scheduled':     return 'var(--brand-indigo-mute)'
    case 'injury':                return 'var(--brand-coral)'
    case 'ppe':                   return '#E89A45'
    default:                      return 'var(--brand-indigo-mute)'
  }
}

function labelForKind(kind: PortalNotification['kind']): string {
  switch (kind) {
    case 'clips':                 return 'CLIPS'
    case 'coach_note':            return 'COACH NOTE'
    case 'idp_update':            return 'PROGRESS PLAN'
    case 'attendance_milestone':  return 'MILESTONE'
    case 'session_scheduled':     return 'SCHEDULE'
    case 'shared_clip':           return 'SHARED CLIP'
    case 'coach_cam':             return 'COACH CAM'
    case 'injury':                return 'INJURY'
    case 'ppe':                   return 'GEAR'
    default:                      return 'UPDATE'
  }
}

// ─── Relative date formatter ─────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Today / Yesterday / N days ago / "Apr 28" — switches to calendar
 *  date once we pass a week. Tighter than the old mono-caps "TUE MAY 5"
 *  format and easier to scan. */
function relativeDate(iso: string): string {
  // Some entries are 'Recently' literal — pass through.
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso
  const d = new Date(`${iso}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  // Older than a week → calendar date "Apr 28"
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}
