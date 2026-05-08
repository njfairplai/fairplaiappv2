'use client'

import { useEffect, useMemo, useState } from 'react'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getKidsForParent,
  getDefaultKid,
  getNotificationsForKid,
  readClientNotifications,
  mergeNotifications,
  type PortalNotification,
  type NotificationKind,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'

/* Hub is now the single feed for parent comms + system events.
 * /parent/notifications was deleted; the bell icon routes here.
 *
 * Four item kinds:
 *   - coach        (1:1 from a coach)
 *   - announcement (academy broadcast)
 *   - community    (parent-to-parent, opt-in)
 *   - system       (auto-generated: clips ready, schedule changes,
 *                   welfare flags, IDP updates, attendance milestones,
 *                   etc — converted from PortalNotification)
 *
 * Filter chip rail above the feed lets the parent narrow to one kind
 * (the merged feed gets crowded fast). */

type HubItemKind = 'coach' | 'announcement' | 'community' | 'system'

type FilterId = HubItemKind | 'all'

interface HubItem {
  id: string
  kind: HubItemKind
  author: string
  body: string
  /** ISO date for sort. */
  date: string
  shortDate: string
  /** Optional href — system items inherit the notification's deep link. */
  href?: string
}

/** Map a notification kind → a human "author" label that appears next
 *  to the SYSTEM pill. Keeps the row scannable without inventing a
 *  per-kind icon set. */
function systemAuthorFor(kind: NotificationKind): string {
  switch (kind) {
    case 'clips':                return 'New highlights'
    case 'coach_note':           return 'Coach note'
    case 'idp_update':           return 'Development plan'
    case 'attendance_milestone': return 'Attendance'
    case 'session_scheduled':    return 'Schedule'
    case 'shared_clip':          return 'Coach shared'
    case 'coach_cam':            return 'Coach Cam'
    case 'injury':               return 'Welfare alert'
    case 'ppe':                  return 'Gear note'
    default:                     return 'Update'
  }
}

function notificationToHubItem(n: PortalNotification): HubItem {
  const d = new Date(`${n.date}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return {
    id: n.id,
    kind: 'system',
    author: systemAuthorFor(n.kind),
    body: n.body ?? n.title,
    date: n.date,
    shortDate: `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`,
    href: n.href,
  }
}

const HUB_DEMO: HubItem[] = [
  {
    id: 'a01',
    kind: 'announcement',
    author: 'MAK Academy',
    body: 'Pitch 1 closed for resurfacing this Sunday. Sunday session moves to Pitch 3 — same time. Confirmation by SMS Friday.',
    date: '2026-04-30',
    shortDate: 'Thu Apr 30',
  },
  {
    id: 'c01',
    kind: 'coach',
    author: 'Coach Sara',
    body: "Saeed had a tough first half on Sat — kept overcommitting on the press. We'll do positional drills on Tuesday.",
    date: '2026-04-28',
    shortDate: 'Tue Apr 28',
  },
  {
    id: 'cm01',
    kind: 'community',
    author: 'Tariq Makkawi',
    body: 'Anyone driving from Jumeirah to the away match Sunday? Happy to share with one or two families.',
    date: '2026-04-27',
    shortDate: 'Mon Apr 27',
  },
  {
    id: 'a02',
    kind: 'announcement',
    author: 'MAK Academy',
    body: 'Spring cup brackets are out — kick-off times confirmed. Check the Schedule on Stats for your child\'s matches.',
    date: '2026-04-22',
    shortDate: 'Wed Apr 22',
  },
  {
    id: 'c02',
    kind: 'coach',
    author: 'Coach Sara',
    body: "Loved Saeed's run on the right at minute 23 last match. We'll build on that pattern in training this week.",
    date: '2026-04-18',
    shortDate: 'Sat Apr 18',
  },
  {
    id: 'cm02',
    kind: 'community',
    author: 'Sara Hassan',
    body: 'Group order for new kit going in tomorrow — drop a comment if your child needs a size.',
    date: '2026-04-15',
    shortDate: 'Wed Apr 15',
  },
]

export default function ParentHubPage() {
  const router = useRouter()
  const PARENT_ID = 'parent_001'
  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)
  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<FilterId>('all')

  // Notifications for bell badge AND for inline merge into the feed.
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

  // Unified feed: HUB_DEMO items + system items from notifications,
  // sorted newest first. Filter narrows to one kind.
  const allItems: HubItem[] = useMemo(() => {
    const systemItems = allNotifications.map(notificationToHubItem)
    const merged = [...HUB_DEMO, ...systemItems]
    return merged.sort((a, b) => b.date.localeCompare(a.date))
  }, [allNotifications])

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = { all: allItems.length, coach: 0, announcement: 0, community: 0, system: 0 }
    for (const it of allItems) c[it.kind]++
    return c
  }, [allItems])

  const filteredItems = useMemo(
    () => (filter === 'all' ? allItems : allItems.filter(it => it.kind === filter)),
    [allItems, filter],
  )

  function markRead(id: string) {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem('fairplai_parent_notifications_read', JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function onItemClick(item: HubItem) {
    if (item.kind === 'system') markRead(item.id)
    if (item.href) router.push(item.href)
  }

  // Composer only makes sense for coach communication. Hide it when
  // the user is filtering to system/announcement/community feeds.
  const showComposer = filter === 'all' || filter === 'coach'

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

      {/* Eyebrow */}
      <section style={{ padding: '20px 16px 0' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          HUB
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
            margin: '4px 0 0',
            lineHeight: 1.1,
          }}
        >
          Everything in one place.
        </h1>
      </section>

      {/* Filter chip rail — narrows the merged feed. Counts on each
          chip so the parent sees what's there before filtering. */}
      <section
        style={{
          padding: '14px 16px 0',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {(['all', 'coach', 'announcement', 'community', 'system'] as FilterId[]).map(f => {
          const active = filter === f
          const label = f === 'all' ? 'All' : f === 'coach' ? 'Coach' : f === 'announcement' ? 'Academy' : f === 'community' ? 'Community' : 'Updates'
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 11px',
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--brand-indigo)' : 'var(--brand-line)'}`,
                background: active ? 'var(--brand-indigo)' : 'transparent',
                color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                fontFamily: 'var(--font-body)',
                fontSize: 11.5,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
            >
              {label} <span style={{ opacity: 0.7, marginLeft: 2 }}>{counts[f]}</span>
            </button>
          )
        })}
      </section>

      {/* Feed */}
      <section
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        {filteredItems.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            Nothing in this view yet.
          </div>
        ) : (
          filteredItems.map(item => (
            <FeedCard
              key={item.id}
              item={item}
              unread={item.kind === 'system' && !readIds.has(item.id)}
              onClick={() => onItemClick(item)}
            />
          ))
        )}
      </section>

      {/* Send-coach composer — only when the feed shows coach items,
          otherwise the input feels disconnected from what's on screen. */}
      {showComposer && (
        <section
          style={{
            padding: '12px 12px 16px',
            background: 'var(--brand-paper)',
            borderTop: '1px solid var(--brand-line)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Send Coach Sara a message…"
            style={{
              flex: 1,
              background: 'var(--brand-sand)',
              border: '1px solid var(--brand-line)',
              borderRadius: 999,
              padding: '10px 14px',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setDraft('')}
            disabled={draft.trim().length === 0}
            aria-label="Send"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: draft.trim() ? 'var(--brand-indigo)' : 'var(--brand-line-soft)',
              color: draft.trim() ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
              border: 'none',
              cursor: draft.trim() ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </section>
      )}
    </div>
  )
}

function FeedCard({
  item,
  unread = false,
  onClick,
}: {
  item: HubItem
  unread?: boolean
  onClick?: () => void
}) {
  const tone = pillTone(item.kind)
  const interactive = !!item.href
  return (
    <article
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        // Subtle yellow left rule for unread system items so they
        // visually stand out without being noisy.
        borderLeft: unread ? '3px solid var(--brand-yellow)' : '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8.5,
              letterSpacing: '0.18em',
              fontWeight: 800,
              color: tone.color,
              background: tone.bg,
              padding: '2px 6px',
              borderRadius: 3,
              lineHeight: 1,
            }}
          >
            {tone.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              color: 'var(--brand-indigo)',
              fontWeight: 700,
            }}
          >
            {item.author}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {item.shortDate.toUpperCase()}
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          color: 'var(--brand-indigo)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {item.body}
      </p>
    </article>
  )
}

function pillTone(kind: HubItemKind): { label: string; color: string; bg: string } {
  switch (kind) {
    case 'coach':
      return { label: 'COACH', color: 'var(--brand-indigo)', bg: 'var(--brand-yellow)' }
    case 'announcement':
      return {
        label: 'ACADEMY',
        color: 'var(--brand-sand)',
        bg: 'var(--brand-indigo)',
      }
    case 'community':
      return {
        label: 'COMMUNITY',
        color: 'var(--brand-indigo)',
        bg: 'var(--brand-line-soft)',
      }
    case 'system':
      // Coral so system events read as "from the platform" rather than
      // from a person — clearly different from coach/academy/community.
      return {
        label: 'UPDATE',
        color: 'var(--brand-sand)',
        bg: 'var(--brand-coral)',
      }
  }
}
