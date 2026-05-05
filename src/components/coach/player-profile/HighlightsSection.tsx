'use client'

import { useState, useMemo } from 'react'
import { Play, Flag } from 'lucide-react'
import { highlights, sessions } from '@/lib/mockData'
import type { Player, Highlight } from '@/lib/types'
import { ShareMenu } from './ShareMenu'

type EventFilter = 'all' | 'goal' | 'key_pass' | 'tackle' | 'save' | 'sprint_recovery'

const EVENT_BADGES: Record<Highlight['eventType'], { label: string; color: string }> = {
  goal:            { label: 'GOAL',   color: 'var(--brand-yellow)' },
  key_pass:        { label: 'KEY',    color: 'var(--brand-indigo)' },
  tackle:          { label: 'TACKLE', color: 'var(--brand-coral)' },
  save:            { label: 'SAVE',   color: 'var(--brand-indigo)' },
  sprint_recovery: { label: 'SPRINT', color: 'var(--brand-indigo-mid)' },
}

const FILTER_LABELS: Record<EventFilter, string> = {
  all: 'All',
  goal: 'Goals',
  key_pass: 'Key passes',
  tackle: 'Tackles',
  save: 'Saves',
  sprint_recovery: 'Sprints',
}

const VISIBLE_CAP = 7

interface HighlightsSectionProps {
  player: Player
  /** Current playhead session — drives the "This match" reel hero. */
  currentSessionId?: string | null
  isMobile?: boolean
}

/**
 * Highlights feed.
 *
 * Layout (top to bottom):
 *   1. Two reel hero cards: "This match" reel (only when scrubbed onto a real
 *      match) + "Season reel" — both have a single Share affordance.
 *   2. Filter chips (All / Goals / Key passes / Tackles / Saves / Sprints).
 *   3. Grid of clip cards. 3 cols on wide desktop, 2 on mid, 1 on mobile.
 *      Each card: play icon, event badge, session label, minute, duration,
 *      inline Share + Flag actions. No thumbnails.
 *      Capped at 7 visible per filter; "See more (N)" expands.
 *
 * Empty state per filter when no clips match.
 */
export function HighlightsSection({ player, currentSessionId, isMobile }: HighlightsSectionProps) {
  const [filter, setFilter] = useState<EventFilter>('all')
  const [showAll, setShowAll] = useState(false)

  const playerHighlights = useMemo(
    () =>
      highlights
        .filter(h => h.playerId === player.id)
        .sort((a, b) => b.sessionId.localeCompare(a.sessionId)),
    [player.id],
  )

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? playerHighlights
        : playerHighlights.filter(h => h.eventType === filter),
    [filter, playerHighlights],
  )

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

  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_CAP)
  const hidden = filtered.length - visible.length

  // Per-match reel — clips for the playhead session. Hidden if no playhead
  // or the playhead has no clips for this player.
  const matchClips = useMemo(
    () =>
      currentSessionId
        ? playerHighlights.filter(h => h.sessionId === currentSessionId)
        : [],
    [playerHighlights, currentSessionId],
  )
  const matchSession = currentSessionId ? sessions.find(s => s.id === currentSessionId) : null
  const matchReelDuration = matchClips.reduce((s, h) => s + h.durationSeconds, 0)

  // Season reel — every clip
  const seasonReelDuration = playerHighlights.reduce((s, h) => s + h.durationSeconds, 0)
  const playerName = `${player.firstName} ${player.lastName}`

  return (
    <section
      style={{
        background: 'var(--brand-sand)',
        padding: isMobile ? '24px 16px' : '32px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '180px 1fr',
          gap: isMobile ? 12 : 32,
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            borderTop: '2px solid var(--brand-indigo)',
            paddingTop: 8,
          }}
        >
          HIGHLIGHTS
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 22 : 28,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
          }}
        >
          The moments that mattered.
        </div>
      </div>

      {/* Reel heroes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : matchClips.length > 0
            ? '1fr 1fr'
            : '1fr',
          gap: 12,
          marginBottom: 18,
        }}
      >
        {matchClips.length > 0 && matchSession && (
          <ReelHero
            kind="this-match"
            title={`This match · vs ${matchSession.opponent ?? 'Match'}`}
            clipCount={matchClips.length}
            durationSec={matchReelDuration}
            shareTitle={`${playerName} · ${matchClips.length} clips vs ${matchSession.opponent ?? 'Match'}`}
            shareUrl={`https://fairpl.ai/m/${currentSessionId}/p/${player.id}`}
          />
        )}
        <ReelHero
          kind="season"
          title="Season reel"
          clipCount={playerHighlights.length}
          durationSec={seasonReelDuration}
          shareTitle={`${playerName} · season highlights`}
          shareUrl={`https://fairpl.ai/p/${player.id}/season`}
        />
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          gap: 6,
          marginBottom: 14,
          paddingBottom: isMobile ? 4 : 0,
        }}
      >
        {(Object.keys(FILTER_LABELS) as EventFilter[]).map(f => {
          const active = filter === f
          const count = counts[f]
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f)
                setShowAll(false)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                border: active ? '1px solid var(--brand-indigo)' : '1px solid var(--brand-line)',
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
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Clip grid OR empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--brand-indigo-mute)',
          }}
        >
          {filter === 'all'
            ? 'No highlights this season yet.'
            : `No ${FILTER_LABELS[filter].toLowerCase()} this season yet.`}
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 10,
            }}
          >
            {visible.map(h => (
              <ClipCard key={h.id} clip={h} playerName={playerName} />
            ))}
          </div>
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              style={{
                marginTop: 14,
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--brand-line)',
                color: 'var(--brand-indigo)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                padding: '10px 18px',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              See more ({hidden})
            </button>
          )}
        </>
      )}
    </section>
  )
}

function ReelHero({
  kind,
  title,
  clipCount,
  durationSec,
  shareTitle,
  shareUrl,
}: {
  kind: 'this-match' | 'season'
  title: string
  clipCount: number
  durationSec: number
  shareTitle: string
  shareUrl: string
}) {
  const isThisMatch = kind === 'this-match'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 12,
        background: isThisMatch ? 'var(--brand-indigo)' : 'var(--brand-paper)',
        color: isThisMatch ? 'var(--brand-sand)' : 'var(--brand-indigo)',
        border: isThisMatch ? 'none' : '1px solid var(--brand-line)',
      }}
    >
      <button
        type="button"
        aria-label={`Play ${title}`}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--brand-yellow)',
          color: 'var(--brand-indigo)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <Play size={16} fill="currentColor" />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.22em',
            color: isThisMatch ? 'var(--brand-yellow)' : 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {isThisMatch ? 'THIS MATCH REEL' : 'SEASON REEL'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            letterSpacing: '-0.01em',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: isThisMatch ? 'rgba(238, 228, 200, 0.7)' : 'var(--brand-indigo-mute)',
            fontWeight: 600,
            marginTop: 3,
          }}
        >
          {clipCount} CLIPS · {formatDuration(durationSec)}
        </div>
      </div>
      <ShareMenu mode="pill" title={shareTitle} url={shareUrl} />
    </div>
  )
}

function ClipCard({ clip, playerName }: { clip: Highlight; playerName: string }) {
  const session = sessions.find(s => s.id === clip.sessionId)
  const sessionLabel = session?.opponent ?? 'Match'
  const date = session?.date ? formatShortDate(session.date) : ''
  const minute = Math.floor(clip.timestampSeconds / 60)
  const meta = EVENT_BADGES[clip.eventType] ?? { label: clip.eventType.toUpperCase(), color: 'var(--brand-indigo-mid)' }

  return (
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 8,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <button
        type="button"
        aria-label="Play clip"
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'var(--brand-indigo)',
          color: 'var(--brand-sand)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <Play size={11} fill="currentColor" />
      </button>
      <span
        style={{
          background: meta.color,
          color: meta.color === 'var(--brand-yellow)' ? 'var(--brand-indigo)' : 'var(--brand-sand)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.16em',
          padding: '2px 5px',
          borderRadius: 3,
          flexShrink: 0,
        }}
      >
        {meta.label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--brand-indigo)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          vs {sessionLabel}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          {date.toUpperCase()} · {minute}' · {clip.durationSeconds}S
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <ShareMenu
          title={`${playerName} · ${meta.label.toLowerCase()} vs ${sessionLabel}`}
          url={`https://fairpl.ai/h/${clip.id}`}
        />
        <button
          type="button"
          aria-label="Flag for review"
          title="Flag for review"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'transparent',
            border: '1px solid var(--brand-line)',
            color: clip.flaggedByCoach ? 'var(--brand-coral)' : 'var(--brand-indigo)',
            cursor: 'pointer',
          }}
        >
          <Flag size={12} fill={clip.flaggedByCoach ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}

function formatShortDate(iso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [, m, d] = iso.split('-').map(Number) as [number, number, number]
  return `${months[(m ?? 1) - 1]} ${String(d).padStart(2, '0')}`
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}
