'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, ChevronLeft, ChevronRight, Camera, Send } from 'lucide-react'
import { highlights as allHighlights, sessions } from '@/lib/mockData'
import {
  getKidsForParent,
  getDefaultKid,
  getMatchListForKid,
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
import { VideoModal } from '@/components/video/VideoModal'
import { cn } from '@/lib/cn'
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

  if (!activeKid) {
    return null
  }

  return (
    <div className="min-h-[100dvh] bg-brand-sand pb-20 text-brand-indigo">
      <PortalTopBar />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Season reel hero */}
      {playerHighlights.length > 0 && (
        <section className="px-4 pt-4">
          <div className="flex items-center gap-3.5 rounded-xl bg-brand-indigo px-[18px] py-5 text-brand-sand">
            <button
              type="button"
              aria-label="Watch season reel"
              className="inline-flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-brand-yellow text-brand-indigo shadow-[0_4px_14px_rgba(252,215,24,0.32)]"
            >
              <Play size={22} fill="currentColor" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-fragment text-[9.5px] font-bold tracking-[0.22em] text-brand-yellow">
                SEASON REEL
              </div>
              <div className="mt-0.5 font-clash text-xl leading-[1.1] tracking-[-0.02em] text-brand-sand">
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
      <section className="flex gap-1.5 overflow-x-auto px-4 pt-3.5 [scrollbar-width:none]">
        {(Object.keys(FILTER_LABELS) as EventFilter[]).map(f => {
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-satoshi text-[12.5px] font-semibold tracking-[0.02em]',
                active
                  ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                  : 'border-brand-line bg-transparent text-brand-indigo',
              )}
            >
              {FILTER_LABELS[f]}
              <span className="font-fragment text-[10px] tracking-[0.12em] opacity-70">
                {counts[f]}
              </span>
            </button>
          )
        })}
      </section>

      {/* Grouped clips per match */}
      <section className="flex flex-col gap-[18px] px-4 py-5">
        {/* "From your coach" group — promoted to the top of the grid
         *  when the coach has shared clips or uploaded Coach Cam clips
         *  in the last 15 days. Only shows when the filter is `all` so
         *  the AI event filters apply only to the AI grid below. */}
        {filter === 'all' && coachTouched.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                FROM YOUR COACH
              </div>
              <span className="whitespace-nowrap font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo">
                {coachTouched.length} {coachTouched.length === 1 ? 'CLIP' : 'CLIPS'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {coachTouched.map(row => (
                <CoachTouchedClipRow
                  key={row.kind === 'shared' ? row.record.id : row.cam.id}
                  row={row}
                  onOpen={() => {
                    const id = row.kind === 'shared' ? row.clip.id : row.cam.id
                    router.push(`/parent/clips/${id}?source=${row.kind}`)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {grouped.length === 0 ? (
          <div className="px-4 py-10 text-center font-satoshi text-[13.5px] text-brand-indigo-mute">
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
                <div key={sessionId} className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => router.push(`/parent/match/${sessionId}`)}
                    className="flex cursor-pointer items-baseline justify-between gap-2 border-none bg-transparent p-0 text-left"
                  >
                    <div className="min-w-0">
                      <div className="font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                        {session ? formatShortDate(session.date).toUpperCase() : '—'}
                      </div>
                      <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap font-clash text-lg leading-[1.1] tracking-[-0.02em] text-brand-indigo">
                        {matchTitle}
                      </div>
                    </div>
                    <span className="whitespace-nowrap font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo">
                      {clips.length} {clips.length === 1 ? 'CLIP' : 'CLIPS'} →
                    </span>
                  </button>
                  <div className="flex flex-col gap-2">
                    {clips.map(c => (
                      <ClipRow key={c.id} clip={c} />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-2 flex items-center justify-between border-t border-brand-line pt-3">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={paginationBtnClass(page === 0)}
                >
                  <ChevronLeft size={14} />
                  Newer
                </button>
                <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className={paginationBtnClass(page === totalPages - 1)}
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
      className="grid cursor-pointer items-center gap-2.5 rounded-lg border border-brand-line bg-brand-paper px-3 py-2.5 text-left [grid-template-columns:auto_1fr_auto]"
      style={{ borderLeft: `3px solid ${sourceColor}` }}
    >
      <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-indigo text-brand-sand">
        <Play size={14} fill="currentColor" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 font-fragment text-[9px] font-extrabold leading-none tracking-[0.16em]"
            style={{ background: `${sourceColor}1A`, color: sourceColor }}
          >
            <SourceIcon size={9} />
            {sourceLabel}
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-[13px] font-semibold text-brand-indigo">
            {title}
          </span>
        </div>
        <div className="mt-1 font-fragment text-[9.5px] font-bold tracking-[0.16em] text-brand-indigo-mute">
          {meta}
        </div>
      </div>
      <span className="font-satoshi text-sm text-brand-indigo-mute">
        →
      </span>
    </button>
  )
}

function ClipRow({ clip }: { clip: Highlight }) {
  const meta = EVENT_BADGES[clip.eventType]
  const minute = Math.floor(clip.timestampSeconds / 60)
  // Local modal state — only meaningful when the clip carries a real
  // playable source (currently the session_017 demo highlights).
  const [open, setOpen] = useState(false)
  const canPlay = !!clip.clipUrl
  return (
    <div className="grid items-center gap-2.5 rounded-lg border border-brand-line bg-brand-paper px-3 py-2.5 [grid-template-columns:auto_1fr_auto]">
      <button
        type="button"
        aria-label="Play clip"
        onClick={canPlay ? () => setOpen(true) : undefined}
        disabled={!canPlay}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full border-none bg-brand-indigo text-brand-sand',
          canPlay ? 'cursor-pointer opacity-100' : 'cursor-default opacity-55',
        )}
      >
        <Play size={14} fill="currentColor" />
      </button>
      {clip.clipUrl && (
        <VideoModal
          open={open}
          onClose={() => setOpen(false)}
          src={clip.clipUrl}
          caption={`${meta.label} · ${minute}m`}
        />
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-[3px] px-[5px] py-0.5 font-fragment text-[9px] font-extrabold leading-none tracking-[0.18em] text-brand-indigo"
            style={{ background: meta.color }}
          >
            {meta.label}
          </span>
          <span className="font-fragment text-[9.5px] font-bold tracking-[0.16em] text-brand-indigo-mute">
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

function paginationBtnClass(disabled: boolean): string {
  return cn(
    'inline-flex items-center gap-1 rounded-full border border-brand-line bg-transparent px-3.5 py-2 font-satoshi text-[12.5px] font-semibold text-brand-indigo',
    disabled ? 'cursor-default opacity-30' : 'cursor-pointer opacity-100',
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
