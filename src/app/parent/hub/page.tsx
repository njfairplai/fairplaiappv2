'use client'

import { useEffect, useMemo, useState } from 'react'
import { Send } from 'lucide-react'
import {
  getKidsForParent,
  getDefaultKid,
  getNotificationsForKid,
  readClientNotifications,
  mergeNotifications,
  type PortalNotification,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'

/* TODO: design-refinement-target — Pack 3 polishes the visual.
 * Single mixed feed (coach 1:1 + announcements + community). Type pill
 * on each item differentiates source. Send-message composer at the bottom. */

type HubItemKind = 'coach' | 'announcement' | 'community'

interface HubItem {
  id: string
  kind: HubItemKind
  author: string
  body: string
  /** ISO date for sort. */
  date: string
  shortDate: string
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
  const PARENT_ID = 'parent_001'
  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)
  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const [draft, setDraft] = useState('')

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
          Coach, academy, community.
        </h1>
      </section>

      {/* Feed */}
      <section
        style={{
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        {HUB_DEMO.map(item => (
          <FeedCard key={item.id} item={item} />
        ))}
      </section>

      {/* Send-coach composer (sticky to bottom of content area, above
          bottom nav) */}
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
    </div>
  )
}

function FeedCard({ item }: { item: HubItem }) {
  const tone = pillTone(item.kind)
  return (
    <article
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: '14px 16px',
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
        label: 'ANNOUNCEMENT',
        color: 'var(--brand-sand)',
        bg: 'var(--brand-indigo)',
      }
    case 'community':
      return {
        label: 'COMMUNITY',
        color: 'var(--brand-indigo)',
        bg: 'var(--brand-line-soft)',
      }
  }
}
