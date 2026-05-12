'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SendClipSheet } from '@/components/coach/player-profile/SendClipSheet'
import {
  SESSIONS,
  MATCH_CENTER_HIGHLIGHTS,
  type MatchCenterHighlight,
  type MatchCenterSession,
} from '@/lib/match-center'
import {
  readFlaggedClips,
  toggleFlaggedClip,
} from '@/lib/match-center-state'
import { MEyebrow, MDisplay } from '@/components/coach/match-center/atoms'
import { HighlightCard } from '@/components/coach/match-center/HighlightCard'
import { ClipModal } from '@/components/coach/match-center/ClipModal'
import { ShareSheet } from '@/components/coach/match-center/ShareSheet'
import { Toast } from '@/components/coach/match-center/Toast'

/* Coach Highlights — season-wide reel browser.
 *
 * The first version mirrored the Match Center calendar primitive on this
 * surface; the duplication read as redundant in user-testing. The coach's
 * primary Highlights task is finding clips ACROSS matches — a goal Saeed
 * scored three weeks ago, all the tackles from this season — not picking
 * a single date.
 *
 * Layout:
 *   - Event-type filter pills (ALL / GOALS / KEY / TACKLES / SAVES / SPRINTS)
 *   - Player filter chip strip (ALL · player chips per player who has clips)
 *   - Match groups (5 per page, newest first), each header shows date +
 *     opponent + score badge, then a horizontal row of HighlightCards.
 *
 * The calendar primitive stays scoped to Match Center where it belongs.
 */
/**
 * Filter pills cover the five tagged event types plus "ALL".
 * Pills wrap on tight viewports — multi-word labels like "KEY PASSES"
 * read clearer than truncated single words like "PASSES".
 */
const EVENT_FILTERS = ['ALL', 'GOALS', 'SHOTS', 'KEY PASSES', 'KEY DEFENCE', 'SAVES'] as const
type EventFilter = (typeof EVENT_FILTERS)[number]

const PAGE_SIZE = 5

export default function CoachHighlightsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [eventFilter, setEventFilter] = useState<EventFilter>('ALL')
  const [playerFilter, setPlayerFilter] = useState<string>('ALL')
  const [page, setPage] = useState(0)

  // Toast + modal state mirrors Match Center page.
  const [toast, setToast] = useState<string | null>(null)
  const [sendClipOpen, setSendClipOpen] = useState(false)
  const [clipQueue, setClipQueue] = useState<MatchCenterHighlight[] | null>(null)
  const [clipQueueTitle, setClipQueueTitle] = useState<string | undefined>(undefined)
  const [clipSharing, setClipSharing] = useState<MatchCenterHighlight | null>(null)

  const [clientReady, setClientReady] = useState(false)
  const [flagTick, setFlagTick] = useState(0)
  useEffect(() => {
    setClientReady(true)
  }, [])
  const flaggedClips = useMemo(() => {
    if (!clientReady) return new Set<string>()
    return new Set(readFlaggedClips())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientReady, flagTick])

  // Stable list of players with at least one clip. Stable order = first
  // appearance order in the highlights array (which is already grouped
  // and chronological per match).
  const playerOptions = useMemo(() => {
    const seen = new Set<string>()
    const players: string[] = []
    for (const h of MATCH_CENTER_HIGHLIGHTS) {
      if (!seen.has(h.player)) {
        seen.add(h.player)
        players.push(h.player)
      }
    }
    return ['ALL', ...players]
  }, [])

  // Filter clips by event + player, then group by sessionDay.
  const filteredClips = useMemo(() => {
    return MATCH_CENTER_HIGHLIGHTS.filter(h => {
      if (eventFilter !== 'ALL' && !matchesEventFilter(h.ev, eventFilter)) return false
      if (playerFilter !== 'ALL' && h.player !== playerFilter) return false
      return true
    })
  }, [eventFilter, playerFilter])

  // Group by match (year + month + day composite). Order = newest
  // first by date. Clips without `sessionMonth` default to Feb 2026
  // for backward compat with existing data.
  const groups = useMemo(() => {
    const byKey = new Map<string, MatchCenterHighlight[]>()
    for (const h of filteredClips) {
      const month = h.sessionMonth ?? 2
      const key = `2026-${String(month).padStart(2, '0')}-${String(h.sessionDay).padStart(2, '0')}`
      const list = byKey.get(key) ?? []
      list.push(h)
      byKey.set(key, list)
    }
    // Sort keys descending so newest matches show first.
    const sortedKeys = Array.from(byKey.keys()).sort((a, b) => (a > b ? -1 : 1))
    return sortedKeys.map(key => {
      const [yearStr, monthStr, dayStr] = key.split('-')
      const year = parseInt(yearStr!, 10)
      const month = parseInt(monthStr!, 10)
      const day = parseInt(dayStr!, 10)
      const session = SESSIONS.find(s => s.day === day && s.month === month && s.year === year)
      return {
        key,
        day,
        month,
        year,
        session: session ?? null,
        clips: byKey.get(key)!,
      }
    })
  }, [filteredClips])

  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE))
  const pagedGroups = groups.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // When filters change, snap back to page 0 so a user filtering down to
  // 1 match doesn't see an empty page 2.
  useEffect(() => {
    setPage(0)
  }, [eventFilter, playerFilter])

  const handleClipFlagToggle = useCallback((clip: MatchCenterHighlight) => {
    const isNowFlagged = toggleFlaggedClip(clip.id)
    setFlagTick(t => t + 1)
    setToast(isNowFlagged ? 'Flagged for follow-up' : 'Unflagged')
  }, [])

  return (
    <div
      className={cn(
        'min-h-full bg-brand-sand text-brand-indigo',
        isMobile ? 'px-3.5 py-5' : 'px-9 py-8',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <MEyebrow>SPRING 2026 SEASON</MEyebrow>
          <MDisplay size={isMobile ? 36 : 64} style={{ marginTop: 6 }}>
            Highlights
          </MDisplay>
          <div className="mt-1 font-satoshi text-sm text-brand-indigo-mid">
            Every clip we&apos;ve tagged this season. Filter by event, narrow to a player.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSendClipOpen(true)}
          className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-brand-indigo bg-brand-indigo px-4 py-2.5 font-satoshi text-[13px] font-bold text-brand-sand shadow-[0_4px_14px_rgba(11,8,40,0.18)]"
        >
          <Camera size={14} />
          + Coach Cam
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <div className="rounded-md border border-brand-line bg-brand-paper px-[18px] py-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <MEyebrow>EVENT</MEyebrow>
            <div className="flex flex-wrap gap-1">
              {EVENT_FILTERS.map(f => {
                const active = f === eventFilter
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setEventFilter(f)}
                    className={cn(
                      'cursor-pointer rounded-[3px] px-2.5 py-1.5 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em]',
                      active
                        ? 'border-none bg-brand-indigo text-brand-sand'
                        : 'border border-brand-line bg-transparent text-brand-indigo',
                    )}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 border-t border-brand-line-soft pt-2.5">
            <MEyebrow>PLAYER</MEyebrow>
            <div className="flex flex-wrap gap-1">
              {playerOptions.map(name => {
                const active = name === playerFilter
                const label = name === 'ALL' ? 'ALL' : abbreviatePlayerName(name)
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPlayerFilter(name)}
                    className={cn(
                      'cursor-pointer rounded-[3px] px-2.5 py-1.5 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em]',
                      active
                        ? 'border-none bg-brand-indigo text-brand-sand'
                        : 'border border-brand-line bg-transparent text-brand-indigo',
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Match groups */}
      <div className="mt-5">
        {groups.length === 0 ? (
          <div className="rounded-md border border-brand-line bg-brand-paper px-8 py-12 text-center">
            <MEyebrow>NO CLIPS</MEyebrow>
            <div className="mt-2.5 font-satoshi text-sm leading-[1.5] text-brand-indigo-mid">
              No clips for this filter. Try widening to ALL events or ALL players.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {pagedGroups.map(group => (
              <MatchGroup
                key={group.key}
                day={group.day}
                month={group.month}
                session={group.session}
                clips={group.clips}
                flaggedClips={flaggedClips}
                onPlay={clip => {
                  setClipQueue([clip])
                  setClipQueueTitle(undefined)
                }}
                onShare={setClipSharing}
                onFlagToggle={handleClipFlagToggle}
                /* Open match deep-links to the canonical mockData
                 *  sessionId carried on the MatchCenterSession.
                 *  Sessions without a real ID (drills, prep before a
                 *  mockData session exists) hide the button via
                 *  the conditional in <MatchGroup>. */
                openMatchHref={
                  group.session?.id ? `/coach/web/match/${group.session.id}` : undefined
                }
                onPlayReel={() => {
                  if (group.clips.length === 0) return
                  setClipQueue(group.clips)
                  const opp = group.session?.opponent ?? 'Match'
                  setClipQueueTitle(`vs ${opp} · ${group.clips.length} clips`)
                }}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className={cn(
                'rounded border border-brand-indigo bg-transparent px-3.5 py-2 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo',
                page === 0 ? 'cursor-default opacity-40' : 'cursor-pointer opacity-100',
              )}
            >
              ← Prev
            </button>
            <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
              PAGE {page + 1} OF {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={cn(
                'rounded border border-brand-indigo bg-transparent px-3.5 py-2 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo',
                page >= totalPages - 1
                  ? 'cursor-default opacity-40'
                  : 'cursor-pointer opacity-100',
              )}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modals + toast */}
      <ClipModal
        queue={clipQueue}
        title={clipQueueTitle}
        onClose={() => {
          setClipQueue(null)
          setClipQueueTitle(undefined)
        }}
        onShare={clip => {
          setClipSharing(clip)
          setClipQueue(null)
          setClipQueueTitle(undefined)
        }}
        onFlagChange={(_, isNowFlagged) => {
          setFlagTick(t => t + 1)
          setToast(isNowFlagged ? 'Flagged for follow-up' : 'Unflagged')
        }}
      />
      <ShareSheet
        clip={clipSharing}
        onClose={() => setClipSharing(null)}
        onAction={msg => setToast(msg)}
      />
      <Toast message={toast} onDismiss={() => setToast(null)} />
      <SendClipSheet
        open={sendClipOpen}
        onClose={() => setSendClipOpen(false)}
        onSent={parentName => setToast(parentName ? `Sent to ${parentName}` : 'Coach Cam clip uploaded')}
      />
    </div>
  )
}

/**
 * Default visible clip count per match group. Long rows past 6 are
 * collapsed behind a "+N more" expand affordance — the row scrolls
 * horizontally to 6 and an inline button reveals the rest in a
 * vertical wrap grid below.
 */
const CLIPS_VISIBLE_BEFORE_EXPAND = 6

const MONTH_SHORT_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

interface MatchGroupProps {
  day: number
  /** 1-indexed month (1=Jan). Drives the date eyebrow label. */
  month: number
  session: MatchCenterSession | null
  clips: MatchCenterHighlight[]
  flaggedClips: Set<string>
  onPlay: (clip: MatchCenterHighlight) => void
  onShare: (clip: MatchCenterHighlight) => void
  onFlagToggle: (clip: MatchCenterHighlight) => void
  /** When provided, the "Open match →" button renders and routes
   *  here. Omitted = button is hidden (e.g. for sessions without a
   *  canonical mockData ID — usually drill or pre-match-data days). */
  openMatchHref?: string
  onPlayReel: () => void
}

function MatchGroup({
  day,
  month,
  session,
  clips,
  flaggedClips,
  onPlay,
  onShare,
  onFlagToggle,
  openMatchHref,
  onPlayReel,
}: MatchGroupProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const overflow = clips.length - CLIPS_VISIBLE_BEFORE_EXPAND
  const visible = expanded ? clips : clips.slice(0, CLIPS_VISIBLE_BEFORE_EXPAND)
  const showCollapseControls = clips.length > CLIPS_VISIBLE_BEFORE_EXPAND

  return (
    /* White card body (overriding the default paper) with a soft
     * elevation shadow so each match group lifts off the sand page
     * background — paper-on-sand was too low contrast and made the
     * surface read as one beige blur. The header band keeps its
     * yellow-soft for analysed matches as a "this is played" signal. */
    <div className="rounded-md border border-brand-line bg-white shadow-[0_2px_6px_rgba(11,8,40,0.06)]">
      <div
        className={cn(
          'flex flex-wrap items-center gap-3.5 border-b border-brand-line px-5 py-3.5',
          session?.status === 'ready' ? 'bg-brand-yellow-soft' : 'bg-brand-sand',
        )}
      >
        <div className="min-w-[240px] flex-1">
          <div className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
            {MONTH_SHORT_LABELS[month - 1]} {String(day).padStart(2, '0')} ·{' '}
            {session?.kind === 'training' ? 'TRAINING' : 'MATCH'} · {clips.length}{' '}
            {clips.length === 1 ? 'CLIP' : 'CLIPS'}
          </div>
          <div className="mt-1 font-clash text-2xl tracking-[-0.01em] text-brand-indigo">
            {session?.kind === 'training'
              ? 'Internal training'
              : session?.opponent
              ? `vs ${session.opponent}`
              : 'Match'}
          </div>
        </div>
        {/* Composite score chip (indigo "82") removed — the eyebrow's
         *  date+kind+clip count and the headline's opponent already
         *  carry the match identity. The chip was visual noise. */}
        <button
          type="button"
          className="cursor-pointer rounded border border-brand-yellow bg-brand-yellow px-3.5 py-2 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo"
          onClick={onPlayReel}
          aria-label="Play match reel"
        >
          ▶ Play match reel
        </button>
        {openMatchHref && (
          <button
            type="button"
            className="cursor-pointer rounded border border-brand-indigo bg-transparent px-3.5 py-2 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo"
            onClick={() => router.push(openMatchHref)}
          >
            Open match →
          </button>
        )}
      </div>

      {/* Clip row (or wrap grid when expanded) */}
      <div
        className={cn(
          'gap-2.5 px-5 py-3.5',
          expanded ? 'grid overflow-x-visible' : 'flex overflow-x-auto',
        )}
        style={
          expanded
            ? { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }
            : undefined
        }
      >
        {visible.map(h => (
          <HighlightCard
            key={h.id}
            h={h}
            flagged={flaggedClips.has(h.id)}
            onPlay={() => onPlay(h)}
            onShare={() => onShare(h)}
            onFlagToggle={() => onFlagToggle(h)}
          />
        ))}
      </div>

      {showCollapseControls && (
        <div className="flex justify-start px-5 pb-3.5">
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? '↑ Show fewer' : `+${overflow} more clips ↓`}
          </button>
        </div>
      )}
    </div>
  )
}

function matchesEventFilter(ev: string, filter: EventFilter): boolean {
  switch (filter) {
    case 'GOALS':       return ev === 'GOAL'
    case 'SHOTS':       return ev === 'SHOT'
    case 'KEY PASSES':  return ev === 'KEY'
    case 'KEY DEFENCE': return ev === 'DEF'
    case 'SAVES':       return ev === 'SAVE'
    default:            return true
  }
}

/** "Saeed Khalifa" → "SAEED K." for chip strip compactness. */
function abbreviatePlayerName(name: string): string {
  const [first, ...rest] = name.split(' ')
  if (!rest.length) return first.toUpperCase()
  return `${first.toUpperCase()} ${rest[0]![0]!.toUpperCase()}.`
}
