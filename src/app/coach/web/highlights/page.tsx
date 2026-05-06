'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
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
import { MEyebrow, MDisplay, Card, mcButtons } from '@/components/coach/match-center/atoms'
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

  // Group by match. Order = newest match first (descending day).
  const groups = useMemo(() => {
    const byDay = new Map<number, MatchCenterHighlight[]>()
    for (const h of filteredClips) {
      const list = byDay.get(h.sessionDay) ?? []
      list.push(h)
      byDay.set(h.sessionDay, list)
    }
    const days = Array.from(byDay.keys()).sort((a, b) => b - a)
    return days.map(day => {
      const session = SESSIONS.find(s => s.day === day && s.month === 2 && s.year === 2026)
      return {
        day,
        session: session ?? null,
        clips: byDay.get(day)!,
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
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        padding: isMobile ? '20px 14px' : '32px 36px',
        color: BRAND.indigo,
      }}
    >
      <div>
        <MEyebrow>SPRING 2026 SEASON</MEyebrow>
        <MDisplay size={isMobile ? 36 : 64} style={{ marginTop: 6 }}>
          Highlights
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 14,
            color: BRAND.indigoMid,
            marginTop: 4,
          }}
        >
          Every clip we&apos;ve tagged this season. Filter by event, narrow to a player.
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginTop: 24 }}>
        <Card style={{ padding: '14px 18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <MEyebrow>EVENT</MEyebrow>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {EVENT_FILTERS.map(f => {
                const active = f === eventFilter
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setEventFilter(f)}
                    style={{
                      padding: '6px 10px',
                      border: active ? 'none' : `1px solid ${BRAND.line}`,
                      background: active ? BRAND.indigo : 'transparent',
                      color: active ? BRAND.sand : BRAND.indigo,
                      fontFamily: TYPE.mono,
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      borderRadius: 3,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${BRAND.lineSoft}`,
            }}
          >
            <MEyebrow>PLAYER</MEyebrow>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {playerOptions.map(name => {
                const active = name === playerFilter
                const label = name === 'ALL' ? 'ALL' : abbreviatePlayerName(name)
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPlayerFilter(name)}
                    style={{
                      padding: '6px 10px',
                      border: active ? 'none' : `1px solid ${BRAND.line}`,
                      background: active ? BRAND.indigo : 'transparent',
                      color: active ? BRAND.sand : BRAND.indigo,
                      fontFamily: TYPE.mono,
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      borderRadius: 3,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Match groups */}
      <div style={{ marginTop: 20 }}>
        {groups.length === 0 ? (
          <Card style={{ padding: '48px 32px', textAlign: 'center' }}>
            <MEyebrow>NO CLIPS</MEyebrow>
            <div
              style={{
                fontFamily: TYPE.body,
                fontSize: 14,
                color: BRAND.indigoMid,
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              No clips for this filter. Try widening to ALL events or ALL players.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pagedGroups.map(group => (
              <MatchGroup
                key={group.day}
                day={group.day}
                session={group.session}
                clips={group.clips}
                flaggedClips={flaggedClips}
                onPlay={clip => {
                  setClipQueue([clip])
                  setClipQueueTitle(undefined)
                }}
                onShare={setClipSharing}
                onFlagToggle={handleClipFlagToggle}
                onOpenMatch={() => router.push('/coach/web/match-center?session=feb' + group.day)}
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
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                ...mcButtons.ghost,
                opacity: page === 0 ? 0.4 : 1,
                cursor: page === 0 ? 'default' : 'pointer',
              }}
            >
              ← Prev
            </button>
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: BRAND.indigoMute,
              }}
            >
              PAGE {page + 1} OF {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                ...mcButtons.ghost,
                opacity: page >= totalPages - 1 ? 0.4 : 1,
                cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              }}
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

interface MatchGroupProps {
  day: number
  session: MatchCenterSession | null
  clips: MatchCenterHighlight[]
  flaggedClips: Set<string>
  onPlay: (clip: MatchCenterHighlight) => void
  onShare: (clip: MatchCenterHighlight) => void
  onFlagToggle: (clip: MatchCenterHighlight) => void
  onOpenMatch: () => void
  onPlayReel: () => void
}

function MatchGroup({
  day,
  session,
  clips,
  flaggedClips,
  onPlay,
  onShare,
  onFlagToggle,
  onOpenMatch,
  onPlayReel,
}: MatchGroupProps) {
  const [expanded, setExpanded] = useState(false)
  const overflow = clips.length - CLIPS_VISIBLE_BEFORE_EXPAND
  const visible = expanded ? clips : clips.slice(0, CLIPS_VISIBLE_BEFORE_EXPAND)
  const showCollapseControls = clips.length > CLIPS_VISIBLE_BEFORE_EXPAND

  return (
    <Card style={{ padding: 0 }}>
      <div
        style={{
          padding: '14px 20px',
          background: session?.status === 'ready' ? BRAND.yellowSoft : BRAND.sand,
          borderBottom: `1px solid ${BRAND.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10,
              letterSpacing: '0.22em',
              color: BRAND.indigoMute,
              fontWeight: 700,
            }}
          >
            FEB {String(day).padStart(2, '0')} ·{' '}
            {session?.kind === 'training' ? 'TRAINING' : 'MATCH'} · {clips.length}{' '}
            {clips.length === 1 ? 'CLIP' : 'CLIPS'}
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 24,
              letterSpacing: '-0.01em',
              color: BRAND.indigo,
              marginTop: 4,
            }}
          >
            {session?.kind === 'training'
              ? 'Internal training'
              : session?.opponent
              ? `vs ${session.opponent}`
              : 'Match'}
          </div>
        </div>
        {session?.status === 'ready' && session.score != null && (
          <span
            style={{
              background: BRAND.indigo,
              color: BRAND.sand,
              fontFamily: TYPE.display,
              fontSize: 22,
              padding: '4px 10px',
              borderRadius: 3,
              letterSpacing: '-0.01em',
            }}
          >
            {session.score}
          </span>
        )}
        <button
          type="button"
          style={{ ...mcButtons.ghost, background: BRAND.yellow, borderColor: BRAND.yellow }}
          onClick={onPlayReel}
          aria-label="Play match reel"
        >
          ▶ Play match reel
        </button>
        <button type="button" style={mcButtons.ghost} onClick={onOpenMatch}>
          Open match →
        </button>
      </div>

      {/* Clip row (or wrap grid when expanded) */}
      <div
        style={{
          padding: '14px 20px',
          display: expanded ? 'grid' : 'flex',
          gridTemplateColumns: expanded ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
          gap: 10,
          overflowX: expanded ? 'visible' : 'auto',
        }}
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
        <div
          style={{
            padding: '0 20px 14px',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <button
            type="button"
            style={mcButtons.text}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? '↑ Show fewer' : `+${overflow} more clips ↓`}
          </button>
        </div>
      )}
    </Card>
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
