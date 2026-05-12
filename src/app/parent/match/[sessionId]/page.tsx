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
import { VideoModal } from '@/components/video/VideoModal'
import { parentScoreColor } from '@/lib/parent-score-color'
import { cn } from '@/lib/cn'
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
  // Tap-to-play full-match video. Only meaningful when the session
  // carries a playable URL (currently the demo-anchor session_007).
  const [fullMatchOpen, setFullMatchOpen] = useState(false)
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
      <div className="min-h-[100dvh] bg-brand-sand px-4 py-10 text-center text-brand-indigo">
        <PortalTopBar title="Match" showBack />
        <p className="mt-6 font-satoshi text-sm text-brand-indigo-mute">
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
    <div className="min-h-[100dvh] bg-brand-sand pb-20 text-brand-indigo">
      <PortalTopBar title="Match" showBack />

      {/* Match header */}
      <section className="px-4 pt-5">
        <div className="font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
          {formatShortDate(session.date).toUpperCase()}
        </div>
        <h1 className="m-0 mt-1 font-clash text-[28px] leading-[1.1] tracking-[-0.02em] text-brand-indigo">
          {matchTitle}
        </h1>
        {analysis && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 font-satoshi text-[13px] text-brand-indigo-mute">
            <span>
              Composite{' '}
              <span style={{ color: parentScoreColor(analysis.compositeScore), fontWeight: 700 }}>
                {analysis.compositeScore}
              </span>
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-brand-indigo-mute" />
            <span>{analysis.minutesPlayed ?? '—'} mins</span>
          </div>
        )}
      </section>

      {/* Watch full match — only renders when session carries video URL.
       *  Sits BEFORE highlights so the parent's first action is "watch
       *  the whole thing", with clips as the deep-dive after. Reached
       *  from the stats filmstrip → tap a match → here. */}
      {session.matchVideoUrl && (
        <section className="px-4 pt-5">
          <button
            type="button"
            onClick={() => setFullMatchOpen(true)}
            className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl border-none bg-brand-indigo px-4 py-3.5 text-left text-brand-sand shadow-[0_6px_18px_rgba(11,8,40,0.18)]"
          >
            <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-indigo">
              <Play size={18} fill="currentColor" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-fragment text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-brand-yellow">
                FULL MATCH
              </span>
              <span className="mt-0.5 block font-clash text-[17px] tracking-[-0.01em]">
                Watch the whole match
              </span>
              <span
                className="mt-0.5 block font-satoshi text-[11.5px]"
                style={{ color: 'rgba(238, 228, 200, 0.7)' }}
              >
                Camera-side feed · ~5 min
              </span>
            </span>
            <span className="font-satoshi text-lg text-brand-yellow">→</span>
          </button>
        </section>
      )}

      {/* Highlights row */}
      {sessionHighlights.length > 0 && (
        <section className="px-4 pt-5">
          <span className="mb-2 block font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
            HIGHLIGHTS · {sessionHighlights.length} CLIPS
          </span>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {sessionHighlights.map(h => (
              <ClipCard key={h.id} clip={h} />
            ))}
          </div>
        </section>
      )}

      {/* Per-match radar with click-to-drill */}
      {analysis && (
        <section className="px-4 pt-5">
          <span className="mb-2 block font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
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
      <section className="px-4 pt-5">
        <span className="font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
          FROM COACH SARA
        </span>
        <div className="mt-2 rounded-[10px] border border-brand-line bg-brand-paper px-3.5 py-3">
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
        <section className="px-4 pt-5">
          <div className="mb-2.5 font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
            MOMENTS TO KNOW
          </div>
          <div className="flex flex-col gap-2">
            {playerInjuries.map(inj => {
              const focused = inj.id === focusInjuryId
              return (
                <div
                  key={inj.id}
                  ref={el => {
                    injuryRefs.current[inj.id] = el
                  }}
                  className={cn(
                    'flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 transition-all duration-200',
                    focused
                      ? 'border-brand-coral bg-brand-paper-hi'
                      : 'border-brand-line bg-brand-paper',
                  )}
                >
                  <AlertTriangle size={14} color="var(--brand-coral)" className="mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-satoshi text-[13px] font-semibold capitalize text-brand-indigo">
                      {inj.type} at {inj.minute}&apos;
                      <span className="ml-2 font-fragment text-[9.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute">
                        SEV {inj.severity}
                      </span>
                    </div>
                    {inj.notes && (
                      <div className="mt-1 font-satoshi text-[12.5px] text-brand-indigo-mute">
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
        <section className="px-4 pt-5">
          <div className="rounded-[10px] border border-brand-line bg-brand-paper px-4 py-3.5 text-center font-satoshi text-[13px] text-brand-indigo-mute">
            {session.status === 'processing'
              ? 'Analysis in progress · usually ~2 hours.'
              : session.date > new Date().toISOString().slice(0, 10)
              ? "Hasn't been played yet."
              : 'No analysis available for this match.'}
          </div>
        </section>
      )}

      {session.matchVideoUrl && (
        <VideoModal
          open={fullMatchOpen}
          onClose={() => setFullMatchOpen(false)}
          src={session.matchVideoUrl}
          caption={session.opponent ? `FULL MATCH · vs ${session.opponent.toUpperCase()}` : 'FULL MATCH'}
        />
      )}
    </div>
  )
}

function ClipCard({ clip }: { clip: Highlight }) {
  const meta = EVENT_BADGES[clip.eventType]
  const player = players.find(p => p.id === clip.playerId)
  const minute = Math.floor(clip.timestampSeconds / 60)
  return (
    <div className="flex w-[180px] flex-shrink-0 flex-col gap-2 rounded-lg border border-brand-line bg-brand-paper p-3">
      <div className="relative flex aspect-video items-center justify-center rounded-md bg-brand-indigo">
        <button
          type="button"
          aria-label="Play clip"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none bg-brand-yellow text-brand-indigo"
        >
          <Play size={14} fill="currentColor" />
        </button>
        <span
          className="absolute left-1.5 top-1.5 rounded-[3px] px-[5px] py-[2px] font-fragment text-[8px] font-extrabold uppercase leading-none tracking-[0.16em] text-brand-indigo"
          style={{ background: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <div className="min-w-0">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-xs font-semibold text-brand-indigo">
          {player ? `${player.firstName} ${player.lastName[0]}.` : 'Player'}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <span className="font-fragment text-[9.5px] font-bold uppercase tracking-[0.14em] text-brand-indigo-mute">
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
      <div className="font-satoshi text-[13px] italic text-brand-indigo-mute">
        No note for this match.
      </div>
    )
  }

  return (
    <>
      <div className="font-satoshi text-[13.5px] leading-[1.55] text-brand-indigo">
        “{note.text}”
      </div>
      <div className="mt-2 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em] text-brand-indigo-mute">
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
