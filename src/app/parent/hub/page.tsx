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
import { cn } from '@/lib/cn'

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
    <div className="flex min-h-[100dvh] flex-col bg-brand-sand pb-20 text-brand-indigo">
      <PortalTopBar unreadCount={unreadCount} />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Eyebrow */}
      <section className="px-4 pt-5">
        <span className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
          HUB
        </span>
        <h1 className="m-0 mt-1 font-clash text-[28px] leading-[1.1] tracking-[-0.02em] text-brand-indigo">
          Everything in one place.
        </h1>
      </section>

      {/* Filter chip rail — narrows the merged feed. Counts on each
          chip so the parent sees what's there before filtering. */}
      <section className="flex flex-wrap gap-1.5 px-4 pt-3.5">
        {(['all', 'coach', 'announcement', 'community', 'system'] as FilterId[]).map(f => {
          const active = filter === f
          const label = f === 'all' ? 'All' : f === 'coach' ? 'Coach' : f === 'announcement' ? 'Academy' : f === 'community' ? 'Community' : 'Updates'
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'cursor-pointer rounded-full border px-[11px] py-1.5 font-satoshi text-[11.5px] transition-all duration-150',
                active
                  ? 'border-brand-indigo bg-brand-indigo font-semibold text-brand-sand'
                  : 'border-brand-line bg-transparent font-medium text-brand-indigo',
              )}
            >
              {label} <span className="ml-0.5 opacity-70">{counts[f]}</span>
            </button>
          )
        })}
      </section>

      {/* Feed */}
      <section className="flex flex-1 flex-col gap-2.5 px-4 py-3.5">
        {filteredItems.length === 0 ? (
          <div className="px-5 py-10 text-center font-satoshi text-[13px] text-brand-indigo-mute">
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
        <section className="flex items-center gap-2 border-t border-brand-line bg-brand-paper px-3 pb-4 pt-3">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Send Coach Sara a message…"
            className="flex-1 rounded-full border border-brand-line bg-brand-sand px-3.5 py-2.5 font-satoshi text-[13px] text-brand-indigo outline-none"
          />
          <button
            type="button"
            onClick={() => setDraft('')}
            disabled={draft.trim().length === 0}
            aria-label="Send"
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none',
              draft.trim()
                ? 'cursor-pointer bg-brand-indigo text-brand-sand'
                : 'cursor-default bg-brand-line-soft text-brand-indigo-mute',
            )}
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
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-brand-line bg-brand-paper px-4 py-3.5',
        // Subtle yellow left rule for unread system items so they
        // visually stand out without being noisy.
        unread ? 'border-l-[3px] border-l-brand-yellow' : '',
        interactive ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-[3px] px-1.5 py-0.5 font-fragment text-[8.5px] font-extrabold leading-none tracking-[0.18em]',
              tone.className,
            )}
          >
            {tone.label}
          </span>
          <span className="font-satoshi text-[12.5px] font-bold text-brand-indigo">
            {item.author}
          </span>
        </div>
        <span className="font-fragment text-[9.5px] font-bold tracking-[0.16em] text-brand-indigo-mute">
          {item.shortDate.toUpperCase()}
        </span>
      </div>
      <p className="m-0 font-satoshi text-[13.5px] leading-[1.5] text-brand-indigo">
        {item.body}
      </p>
    </article>
  )
}

function pillTone(kind: HubItemKind): { label: string; className: string } {
  switch (kind) {
    case 'coach':
      return { label: 'COACH', className: 'bg-brand-yellow text-brand-indigo' }
    case 'announcement':
      return { label: 'ACADEMY', className: 'bg-brand-indigo text-brand-sand' }
    case 'community':
      return { label: 'COMMUNITY', className: 'bg-brand-line-soft text-brand-indigo' }
    case 'system':
      // Coral so system events read as "from the platform" rather than
      // from a person — clearly different from coach/academy/community.
      return { label: 'UPDATE', className: 'bg-brand-coral text-brand-sand' }
  }
}
