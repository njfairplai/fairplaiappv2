'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import {
  sessions,
  matchAnalyses,
  highlights as allHighlights,
  players,
} from '@/lib/mockData'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { StatsRadarSection } from '@/components/parent-portal/StatsRadarSection'
import { ShareMenu } from '@/components/coach/player-profile/ShareMenu'
import type { Highlight } from '@/lib/types'

const EVENT_BADGES: Record<Highlight['eventType'], { label: string; color: string }> = {
  goal: { label: 'GOAL', color: 'var(--brand-yellow)' },
  key_pass: { label: 'KEY', color: 'var(--brand-indigo)' },
  tackle: { label: 'TACKLE', color: 'var(--brand-coral)' },
  save: { label: 'SAVE', color: 'var(--brand-indigo)' },
  sprint_recovery: { label: 'SPRINT', color: 'var(--brand-indigo-mid)' },
}

/* TODO: design-refinement-target — Pack 3 polishes the visual.
 * Per-match drill-in for parent + player. Composes existing brand-aligned
 * components: PortalTopBar, StatsRadarSection, ShareMenu, MatchNoteEditor
 * (read-only). */
export default function ParentMatchDetailPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId
  // For mock: assume parent_001's first kid is the player whose lens we view.
  // In real auth this comes from session + active kid switcher.
  const PLAYER_ID = 'player_001'

  const session = sessions.find(s => s.id === sessionId) ?? null
  const analysis = useMemo(
    () =>
      matchAnalyses.find(
        a => a.playerId === PLAYER_ID && a.sessionId === sessionId,
      ) ?? null,
    [sessionId],
  )
  const player = players.find(p => p.id === PLAYER_ID) ?? null
  const sessionHighlights = useMemo(
    () =>
      allHighlights.filter(
        h => h.playerId === PLAYER_ID && h.sessionId === sessionId,
      ),
    [sessionId],
  )

  // Mark the corresponding session-scheduled / clips notification as read
  // when the user lands here (best-effort UX).
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('fairplai_parent_notifications_read')
      const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : [])
      set.add(`clips_${sessionId}`)
      localStorage.setItem('fairplai_parent_notifications_read', JSON.stringify([...set]))
    } catch {
      /* ignore */
    }
  }, [sessionId])

  if (!session || !player) {
    return (
      <div
        style={{
          background: 'var(--brand-sand)',
          minHeight: '100dvh',
          color: 'var(--brand-indigo)',
          padding: '40px 16px',
          textAlign: 'center',
        }}
      >
        <PortalTopBar title="Match" showBack />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--brand-indigo-mute)',
            marginTop: 24,
          }}
        >
          Match not found.
        </p>
      </div>
    )
  }

  const matchTitle =
    session.type === 'training_match'
      ? 'Training match'
      : session.opponent
      ? `vs ${session.opponent}`
      : 'Match'

  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        minHeight: '100dvh',
        color: 'var(--brand-indigo)',
        paddingBottom: 80,
      }}
    >
      <PortalTopBar title="Match" showBack />

      {/* Match header */}
      <section style={{ padding: '20px 16px 0' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {formatShortDate(session.date).toUpperCase()}
        </div>
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
          {matchTitle}
        </h1>
        {analysis && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
              marginTop: 6,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span>Composite {analysis.compositeScore}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
            <span>{analysis.minutesPlayed ?? '—'} mins</span>
          </div>
        )}
      </section>

      {/* Highlights row */}
      {sessionHighlights.length > 0 && (
        <section style={{ padding: '20px 16px 0' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              display: 'block',
              marginBottom: 8,
            }}
          >
            HIGHLIGHTS · {sessionHighlights.length} CLIPS
          </span>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'thin',
            }}
          >
            {sessionHighlights.map(h => (
              <ClipCard key={h.id} clip={h} />
            ))}
          </div>
        </section>
      )}

      {/* Per-match radar with click-to-drill */}
      {analysis && (
        <section style={{ padding: '20px 16px 0' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              display: 'block',
              marginBottom: 8,
            }}
          >
            MATCH SHAPE · TAP A CATEGORY
          </span>
          <StatsRadarSection
            playerId={PLAYER_ID}
            records={[analysis]}
            scope="match"
            isMobile
          />
        </section>
      )}

      {/* Coach note (read-only for parent / player) */}
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
          FROM COACH SARA
        </span>
        <div
          style={{
            marginTop: 8,
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          {/* Read-only render — for parent/player we never let them edit
              the coach's note. The MatchNoteEditor's "saved" state shows
              read-only when there's a saved note. If no note, blank state. */}
          <ReadOnlyNoteRenderer playerId={PLAYER_ID} sessionId={sessionId} />
        </div>
      </section>

      {/* If processing or upcoming, show a thin status card. */}
      {!analysis && (
        <section style={{ padding: '20px 16px 0' }}>
          <div
            style={{
              background: 'var(--brand-paper)',
              border: '1px solid var(--brand-line)',
              borderRadius: 10,
              padding: '14px 16px',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
              textAlign: 'center',
            }}
          >
            {session.status === 'processing'
              ? 'Analysis in progress · usually ~2 hours.'
              : session.date > new Date().toISOString().slice(0, 10)
              ? "Hasn't been played yet."
              : 'No analysis available for this match.'}
          </div>
        </section>
      )}
    </div>
  )
}

function ClipCard({ clip }: { clip: Highlight }) {
  const meta = EVENT_BADGES[clip.eventType]
  const player = players.find(p => p.id === clip.playerId)
  const minute = Math.floor(clip.timestampSeconds / 60)
  return (
    <div
      style={{
        flexShrink: 0,
        width: 180,
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          aspectRatio: '16 / 9',
          background: 'var(--brand-indigo)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <button
          type="button"
          aria-label="Play clip"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--brand-yellow)',
            color: 'var(--brand-indigo)',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Play size={14} fill="currentColor" />
        </button>
        <span
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.16em',
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
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--brand-indigo)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player ? `${player.firstName} ${player.lastName[0]}.` : 'Player'}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.14em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            {minute}m · {clip.durationSeconds}S
          </span>
          <ShareMenu
            mode="icon"
            title={`${player?.firstName ?? 'Player'} · ${meta.label}`}
            url={`https://fairpl.ai/c/${clip.id}`}
          />
        </div>
      </div>
    </div>
  )
}

function ReadOnlyNoteRenderer({
  playerId,
  sessionId,
}: {
  playerId: string
  sessionId: string
}) {
  const [note, setNote] = useState<{ text: string; savedAt: number; author: string } | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('fairplai_match_notes')
      if (!raw) return
      const all = JSON.parse(raw) as Record<string, { text: string; savedAt: number; author: string }>
      const key = `${playerId}__${sessionId}`
      setNote(all[key] ?? null)
    } catch {
      /* ignore */
    }
  }, [playerId, sessionId])

  if (!note) {
    return (
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--brand-indigo-mute)',
          fontStyle: 'italic',
        }}
      >
        No note for this match.
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          color: 'var(--brand-indigo)',
          lineHeight: 1.55,
        }}
      >
        “{note.text}”
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        {note.author.toUpperCase()} · {relative(note.savedAt).toUpperCase()}
      </div>
    </>
  )
}

function relative(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
