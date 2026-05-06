'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Play } from 'lucide-react'
import { getInjuryFlagsForSession } from '@/lib/parent-portal'
import type { InjuryFlag } from '@/lib/types'
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

/* Locked event vocabulary across the app: goal · shot · key (key_pass)
 * · def · save. Legacy aliases (tackle, sprint_recovery, key) carried
 * here so older fixture rows don't break the lookup. */
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

/* TODO: design-refinement-target — Pack 3 polishes the visual.
 * Per-match drill-in for parent + player. Composes existing brand-aligned
 * components: PortalTopBar, StatsRadarSection, ShareMenu, MatchNoteEditor
 * (read-only). */
export default function ParentMatchDetailPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()
  const sessionId = params.sessionId
  const focusInjuryId = searchParams?.get('focusInjury') ?? null
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

  // Welfare — injury flags for THIS player + session.
  const [playerInjuries, setPlayerInjuries] = useState<InjuryFlag[]>([])
  useEffect(() => {
    if (typeof window === 'undefined') return
    setPlayerInjuries(
      getInjuryFlagsForSession(sessionId).filter(i => i.playerId === PLAYER_ID),
    )
  }, [sessionId])

  // Scroll-to + visual highlight on focusInjury deep-link.
  const injuryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  useEffect(() => {
    if (!focusInjuryId) return
    const el = injuryRefs.current[focusInjuryId]
    if (el) {
      // Wait one tick so the section is mounted before we scroll.
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
  }, [focusInjuryId, playerInjuries])

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

      {/* Moments to know — injury flags the coach logged for this player.
       *  When a parent lands here from a `?focusInjury=<id>` notification
       *  link, the matched row scrolls into view + flashes briefly. */}
      {playerInjuries.length > 0 && (
        <section style={{ padding: '20px 16px 0' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            MOMENTS TO KNOW
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {playerInjuries.map(inj => {
              const focused = inj.id === focusInjuryId
              return (
                <div
                  key={inj.id}
                  ref={el => {
                    injuryRefs.current[inj.id] = el
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    background: focused ? 'var(--brand-paper-hi)' : 'var(--brand-paper)',
                    border: `1px solid ${focused ? 'var(--brand-coral)' : 'var(--brand-line)'}`,
                    borderRadius: 10,
                    transition: 'all 200ms ease',
                  }}
                >
                  <AlertTriangle size={14} color="var(--brand-coral)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--brand-indigo)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {inj.type} at {inj.minute}&apos;
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9.5,
                          letterSpacing: '0.16em',
                          color: 'var(--brand-indigo-mute)',
                          fontWeight: 700,
                          marginLeft: 8,
                          textTransform: 'uppercase',
                        }}
                      >
                        SEV {inj.severity}
                      </span>
                    </div>
                    {inj.notes && (
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 12.5,
                          color: 'var(--brand-indigo-mute)',
                          marginTop: 4,
                        }}
                      >
                        {inj.notes}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

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
