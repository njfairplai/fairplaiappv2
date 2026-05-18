'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link2, Download, Share2 } from 'lucide-react'
import {
  getPlayerBySlug,
  getFifaConnectId,
} from '@/lib/player-public'
import {
  matchAnalyses,
  highlights as allHighlights,
  sessions,
  squadScores,
} from '@/lib/mockData'
import { cn } from '@/lib/cn'
import { Toast } from '@/components/coach/match-center/Toast'
import { BibCard, computeBibRadar } from '@/components/coach/player-profile/BibCard'

/* Public Player CV — /p/[slug]
 *
 * v2 rebuild. The hero is the existing BibCard (the same component
 * that powers the coach Share modal) in 'square' format, scaled
 * responsively for web embedding. The bib carries identity (name +
 * jersey + position + foot dominance), the season score, the 6-stat
 * radar, matches/mins/trend, FAIRPL.AI watermark, and the season
 * label — so the page above it stays minimal.
 *
 * Below the bib: magazine-editorial body — FIFA Connect ID, share
 * row, additional stats, highlight grid, coach quote, footer.
 *
 * Distinctly FairplAI. Not borrowed from FUT. */

const BIB_NATIVE_W = 1080
const BIB_NATIVE_H = 1080
const BIB_DESKTOP_MAX_W = 520

function useResponsiveBibScale(): number {
  const [scale, setScale] = useState(0.4)
  useEffect(() => {
    function compute() {
      const w = typeof window !== 'undefined' ? window.innerWidth : 375
      const targetW = Math.min(w - 32, BIB_DESKTOP_MAX_W)
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setScale(targetW / BIB_NATIVE_W)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])
  return scale
}

export default function PublicPlayerCVPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const player = slug ? getPlayerBySlug(slug) : null
  const [toast, setToast] = useState<string | null>(null)
  const bibScale = useResponsiveBibScale()

  const playerAnalyses = useMemo(
    () => (player ? matchAnalyses.filter(a => a.playerId === player.id) : []),
    [player],
  )
  const playerHighlights = useMemo(
    () => (player ? allHighlights.filter(h => h.playerId === player.id) : []),
    [player],
  )
  const squadScore = player ? squadScores[player.id] : null
  const compositeScore = squadScore?.compositeScore ?? 0
  const fifaConnectId = player ? getFifaConnectId(player.id) : null
  const radar = useMemo(() => computeBibRadar(playerAnalyses), [playerAnalyses])

  const minutesPlayed = useMemo(
    () => playerAnalyses.reduce((s, a) => s + (a.minutesPlayed ?? 0), 0),
    [playerAnalyses],
  )
  const matchesPlayed = playerAnalyses.length

  // Trend = latest score minus the average of the prior 3 matches'
  // compositeScore. Same shape as the coach Share modal.
  const trend = useMemo(() => {
    if (playerAnalyses.length < 2) return 0
    const sorted = [...playerAnalyses].sort((a, b) =>
      (sessions.find(s => s.id === a.sessionId)?.date ?? '').localeCompare(
        sessions.find(s => s.id === b.sessionId)?.date ?? '',
      ),
    )
    const recent = sorted[sorted.length - 1].compositeScore
    const slice = sorted.slice(-4, -1)
    if (slice.length === 0) return 0
    const baseline = Math.round(
      slice.reduce((s, a) => s + a.compositeScore, 0) / slice.length,
    )
    return recent - baseline
  }, [playerAnalyses])

  const topStats = useMemo(() => {
    if (!player || playerAnalyses.length === 0) return null
    const goals = playerHighlights.filter(h => h.eventType === 'goal').length
    const assists = playerHighlights.filter(
      h => h.eventType === 'key' || h.eventType === 'key_pass',
    ).length
    const avgPassCompletion = Math.round(
      playerAnalyses.reduce((s, a) => s + a.passCompletion, 0) / playerAnalyses.length,
    )
    const topSpeed = Math.max(...playerAnalyses.map(a => a.topSpeed)).toFixed(1)
    return { goals, assists, avgPassCompletion, topSpeed }
  }, [player, playerAnalyses, playerHighlights])

  const recentMatchHighlights = useMemo(() => {
    if (!playerHighlights.length) return []
    const withDates = playerHighlights
      .map(h => {
        const s = sessions.find(ss => ss.id === h.sessionId)
        return s
          ? { clip: h, date: s.date, opponent: s.opponent }
          : null
      })
      .filter(
        (x): x is {
          clip: (typeof playerHighlights)[0]
          date: string
          opponent: string | undefined
        } => x !== null,
      )
    return withDates.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [playerHighlights])

  if (!player) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-brand-paper px-6 text-brand-indigo">
        <div className="text-center">
          <div className="font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
            Not found
          </div>
          <div className="mt-2 font-clash text-[28px] leading-[1.1] tracking-[-0.02em]">
            This player CV doesn&apos;t exist.
          </div>
        </div>
      </div>
    )
  }

  const displayName = `${player.firstName} ${player.lastName}`
  const profileUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://demo.fairpl.ai/p/${slug ?? ''}`

  function handleCopyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl).catch(() => {})
    }
    setToast('Link copied')
  }

  function handleWhatsApp() {
    const text = `${displayName} on Fairplai — composite ${compositeScore}, ${matchesPlayed} matches this season. ${profileUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    if (typeof window !== 'undefined') window.open(url, '_blank')
  }

  function handlePDF() {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <div className="min-h-[100dvh] bg-brand-paper text-brand-indigo">
      {/* Minimal header — just the cross-nav to scouts. Brand mark
       *  lives inside the bib (FAIRPL.AI · PLAYER CARD), so we don't
       *  repeat it on the page. */}
      <header className="flex items-center justify-end border-b border-brand-line px-4 py-2.5">
        <a
          href="/scout"
          className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-brand-paper px-3 py-1 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em] text-brand-indigo no-underline"
        >
          Scouts →
        </a>
      </header>

      {/* Hero — the bib. Sized responsively, centred. */}
      <section className="flex justify-center px-4 pt-5 pb-1 md:pt-8">
        <BibCard
          player={player}
          radar={radar}
          seasonScore={compositeScore}
          matchesPlayed={matchesPlayed}
          minutesPlayed={minutesPlayed}
          trend={trend}
          rosterName="MAK Academy U13 Lions"
          format="square"
          scale={bibScale}
        />
      </section>

      {/* FIFA Connect ID — a small badge under the bib, before the
       *  share row. Sits in the page surface (paper), not on the bib. */}
      {fifaConnectId && (
        <section className="flex justify-center pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-sand px-3 py-1 font-fragment text-[10px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute">
            FIFA Connect <span className="text-brand-indigo">{fifaConnectId}</span>
          </span>
        </section>
      )}

      {/* Share row — sticky on mobile so it follows the scroll. */}
      <section className="sticky top-0 z-10 border-y border-brand-line bg-brand-paper px-5 py-3 mt-5 backdrop-blur md:static md:bg-transparent md:py-4">
        <div className="mx-auto flex max-w-[480px] items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-brand-yellow px-4 py-2.5 font-satoshi text-[13px] font-bold text-brand-indigo"
          >
            <Share2 size={16} />
            Share to WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy link"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-line bg-brand-sand text-brand-indigo"
          >
            <Link2 size={16} />
          </button>
          <button
            type="button"
            onClick={handlePDF}
            aria-label="Download PDF"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-line bg-brand-sand text-brand-indigo"
          >
            <Download size={16} />
          </button>
        </div>
      </section>

      {/* Magazine-editorial body — additional context that doesn't fit
       *  on the bib. The bib already carries the 6-stat radar; below
       *  is the event-flavoured stat row (goals, key passes, top
       *  speed, pass accuracy) + highlight grid + coach quote. */}

      {topStats && (
        <section className="mx-auto max-w-[480px] px-5 pt-6">
          <div className="mb-3 font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
            Season at a glance
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Goals" value={String(topStats.goals)} />
            <StatTile label="Key passes" value={String(topStats.assists)} />
            <StatTile label="Top speed" value={`${topStats.topSpeed} km/h`} />
            <StatTile label="Pass acc" value={`${topStats.avgPassCompletion}%`} />
          </div>
        </section>
      )}

      {recentMatchHighlights.length > 0 && (
        <section className="mx-auto mt-7 max-w-[480px] px-5">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
              Recent highlights · {playerHighlights.length} clips
            </div>
            <span className="font-fragment text-[10px] tracking-[0.18em] text-brand-indigo-mute">
              SEASON
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {recentMatchHighlights.map(({ clip, date, opponent }) => (
              <HighlightTile
                key={clip.id}
                eventType={clip.eventType}
                date={date}
                opponent={opponent ?? null}
                minute={Math.floor(clip.timestampSeconds / 60)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-7 max-w-[480px] px-5">
        <div className="rounded-xl border-l-[3px] border-brand-yellow bg-brand-sand px-4 py-4">
          <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
            Coach&apos;s note
          </div>
          <p className="m-0 mt-1.5 font-satoshi text-[14px] leading-[1.55] text-brand-indigo">
            &ldquo;Reads the game two passes ahead of everyone else on the
            pitch. The kind of player who makes others around them
            better.&rdquo;
          </p>
          <div className="mt-2 font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-indigo-mute">
            COACH SARA · MAK ACADEMY · APR 2026
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-10 max-w-[480px] px-5 pb-10 pt-8 text-center">
        <div className="font-fragment text-[9px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
          fairplai · {displayName.toUpperCase()} · UAE
        </div>
        <div className="mt-2 font-satoshi text-[11px] leading-[1.5] text-brand-indigo-mute">
          Data verified by Fairplai AI from match footage.
          <br />
          Scouts and clubs can request contact via the player&apos;s guardian.
        </div>
      </footer>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-brand-line bg-brand-sand px-4 py-3.5">
      <span className="font-clash text-[24px] leading-none tracking-[-0.02em] text-brand-indigo">
        {value}
      </span>
      <span className="mt-1 font-fragment text-[10px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute">
        {label}
      </span>
    </div>
  )
}

function HighlightTile({
  eventType,
  date,
  opponent,
  minute,
}: {
  eventType: string
  date: string
  opponent: string | null
  minute: number
}) {
  const meta: Record<string, { label: string; color: string }> = {
    goal:     { label: 'GOAL',  color: 'bg-brand-yellow text-brand-indigo' },
    shot:     { label: 'SHOT',  color: 'bg-brand-indigo text-brand-sand' },
    key:      { label: 'KEY',   color: 'bg-brand-indigo text-brand-sand' },
    key_pass: { label: 'KEY',   color: 'bg-brand-indigo text-brand-sand' },
    def:      { label: 'DEF',   color: 'bg-brand-coral text-brand-sand' },
    save:     { label: 'SAVE',  color: 'bg-brand-indigo text-brand-sand' },
  }
  const m = meta[eventType] ?? {
    label: eventType.toUpperCase(),
    color: 'bg-brand-indigo-mute text-brand-sand',
  }
  return (
    <div className="flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-xl bg-brand-indigo p-3 text-brand-sand">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-block rounded-[3px] px-1.5 py-0.5 font-fragment text-[9px] font-extrabold tracking-[0.18em]',
            m.color,
          )}
        >
          {m.label}
        </span>
        <span className="font-fragment text-[10px] tracking-[0.16em] text-brand-sand/70">
          {minute}&apos;
        </span>
      </div>
      <div>
        <div className="font-clash text-[14px] leading-[1.1] tracking-[-0.01em] text-brand-sand">
          vs {opponent ?? 'Match'}
        </div>
        <div className="mt-0.5 font-fragment text-[9.5px] tracking-[0.16em] text-brand-sand/65">
          {formatDate(date)}
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[d.getMonth()]} ${d.getDate()} ${String(d.getFullYear()).slice(-2)}`
}
