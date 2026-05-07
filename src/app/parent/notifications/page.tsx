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

/* TODO: design-refinement-target — Pack 3 will refine.
 * Plain list of notifications with type-pill, title, body, date.
 * Tappable rows mark-as-read and navigate to the source surface. */
export default function ParentNotificationsPage() {
  const router = useRouter()
  const PARENT_ID = 'parent_001'
  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const activeKid = useMemo(() => getDefaultKid(PARENT_ID), [])

  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [clientNotifs, setClientNotifs] = useState<PortalNotification[]>([])

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

      {/* Legend — small dot+label rail so the inbox dots are decodable.
       *  Kinds that don't surface for this kid still render so the user
       *  has a stable mental model. Scrolls horizontally on narrow widths. */}
      <div
        data-tour-id="parent-notifications-legend"
        style={{
          padding: '10px 16px',
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: '1px solid var(--brand-line)',
        }}
      >
        {NOTIFICATION_KINDS.map(k => (
          <div
            key={k}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: dotColorForKind(k),
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.16em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {legendLabelForKind(k)}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '14px 16px',
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
          {all.length} TOTAL · {all.filter(n => !readIds.has(n.id)).length} UNREAD
        </span>
        {all.length > 0 && (
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

      {all.length === 0 ? (
        <div
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--brand-indigo-mute)',
          }}
        >
          No notifications yet. New clips, coach notes, and updates will land here.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {all.map(n => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => open(n)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 14,
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
                    {labelForKind(n.kind)} · {n.shortDate.toUpperCase()}
                  </div>
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
        marginTop: 4,
      }}
    />
  )
}

/* Each NotificationKind gets a distinct dot colour so the inbox at-a-glance
 * tells you what's new without reading. Mostly brand tokens; a couple of
 * functional accents (amber, teal, purple) for kinds that would otherwise
 * collide. The NOTIFICATION_LEGEND below mirrors this map — keep them in
 * sync. */
function dotColorForKind(kind: PortalNotification['kind']): string {
  switch (kind) {
    case 'clips':                 return 'var(--brand-indigo)'         // deep indigo
    case 'shared_clip':           return '#7C3AED'                     // purple
    case 'coach_cam':             return '#14B8A6'                     // teal
    case 'coach_note':            return 'var(--brand-yellow)'         // yellow
    case 'idp_update':            return 'var(--brand-indigo-mid)'     // mid indigo
    case 'attendance_milestone':  return 'var(--brand-yellow-soft)'    // pale yellow
    case 'session_scheduled':     return 'var(--brand-indigo-mute)'    // gray-purple
    case 'injury':                return 'var(--brand-coral)'          // coral
    case 'ppe':                   return '#E89A45'                     // amber
    default:                      return 'var(--brand-indigo-mute)'
  }
}

/** Kinds that ever surface in the inbox today, in display order for the legend. */
const NOTIFICATION_KINDS: PortalNotification['kind'][] = [
  'clips',
  'shared_clip',
  'coach_cam',
  'coach_note',
  'idp_update',
  'attendance_milestone',
  'session_scheduled',
  'injury',
  'ppe',
]

function labelForKind(kind: PortalNotification['kind']): string {
  switch (kind) {
    case 'clips':
      return 'CLIPS'
    case 'coach_note':
      return 'COACH NOTE'
    case 'idp_update':
      return 'PROGRESS PLAN'
    case 'attendance_milestone':
      return 'MILESTONE'
    case 'session_scheduled':
      return 'SCHEDULE'
    case 'shared_clip':
      return 'SHARED CLIP'
    case 'coach_cam':
      return 'COACH CAM'
    case 'injury':
      return 'INJURY · WELFARE'
    case 'ppe':
      return 'GEAR · WELFARE'
    default:
      return 'UPDATE'
  }
}

/** Legend uses tighter labels (no "WELFARE" suffix) so the chip rail
 *  fits on narrower mobile viewports. */
function legendLabelForKind(kind: PortalNotification['kind']): string {
  switch (kind) {
    case 'clips':                 return 'CLIPS'
    case 'shared_clip':           return 'SHARED'
    case 'coach_cam':             return 'COACH CAM'
    case 'coach_note':            return 'NOTE'
    case 'idp_update':            return 'IDP'
    case 'attendance_milestone':  return 'MILESTONE'
    case 'session_scheduled':     return 'SCHEDULE'
    case 'injury':                return 'INJURY'
    case 'ppe':                   return 'GEAR'
    default:                      return 'UPDATE'
  }
}
