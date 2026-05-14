'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Link2, Download, Share2, Copy } from 'lucide-react'
import {
  getPlayerBySlug,
  getSlugForPlayer,
  getFifaConnectId,
} from '@/lib/player-public'
import {
  matchAnalyses,
  highlights as allHighlights,
  sessions,
  squadScores,
} from '@/lib/mockData'
import { parentScoreColor } from '@/lib/parent-score-color'
import { cn } from '@/lib/cn'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'
import { Toast } from '@/components/coach/match-center/Toast'

const ScoreArcDynamic = dynamic(
  () => import('@/components/charts/ScoreArc'),
  { ssr: false, loading: () => <div className="h-[140px] w-[140px]" /> },
)

/* Public Player CV — /p/[slug]
 *
 * The kid's owned, shareable profile. Reachable without auth. The
 * surface that gets posted to TikTok, WhatsApp'd to grandparents,
 * shared with scouts and clubs.
 *
 * Visual direction: Instagram-profile-feel rather than the coach/parent
 * product UI. Centered. Big headlines. Prominent share affordance.
 * Brand stays (sand surface, indigo structure, yellow accent) but the
 * chrome reads as a SHAREABLE artifact, not a logged-in dashboard.
 *
 * Read-only for the prototype. Authoring tools (edit bio, pin clips,
 * privacy controls) land in the next slice. */

export default function PublicPlayerCVPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const player = slug ? getPlayerBySlug(slug) : null
  const [toast, setToast] = useState<string | null>(null)

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

  const age = useMemo(() => {
    if (!player) return null
    const dob = new Date(`${player.dateOfBirth}T00:00:00`)
    const now = new Date('2026-05-14T00:00:00')
    let years = now.getFullYear() - dob.getFullYear()
    const monthDiff = now.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) years--
    return years
  }, [player])

  const topStats = useMemo(() => {
    if (!player || playerAnalyses.length === 0) return null
    const goals = playerHighlights.filter(h => h.eventType === 'goal').length
    const assists = playerHighlights.filter(h => h.eventType === 'key' || h.eventType === 'key_pass').length
    const avgPassCompletion = Math.round(
      playerAnalyses.reduce((s, a) => s + a.passCompletion, 0) / playerAnalyses.length,
    )
    const topSpeed = Math.max(...playerAnalyses.map(a => a.topSpeed)).toFixed(1)
    const totalDistance = playerAnalyses.reduce((s, a) => s + a.distanceCovered, 0).toFixed(1)
    return { goals, assists, avgPassCompletion, topSpeed, totalDistance }
  }, [player, playerAnalyses, playerHighlights])

  const recentMatchHighlights = useMemo(() => {
    if (!playerHighlights.length) return []
    // Sort by session date, take the most recent 6 clips
    const withDates = playerHighlights
      .map(h => {
        const s = sessions.find(ss => ss.id === h.sessionId)
        return s ? { clip: h, date: s.date, opponent: s.opponent } : null
      })
      .filter((x): x is { clip: typeof playerHighlights[0]; date: string; opponent: string | undefined } => x !== null)
    return withDates.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [playerHighlights])

  if (!player) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-brand-sand px-6 text-brand-indigo">
        <div className="text-center">
          <div className="font-fragment text-[10px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
            Not found
          </div>
          <div className="mt-2 font-clash text-[28px] leading-[1.1] tracking-[-0.02em]">
            This player CV doesn&apos;t exist.
          </div>
          <div className="mt-3 font-satoshi text-[13.5px] text-brand-indigo-mid">
            Check the link or ask the player to send it again.
          </div>
        </div>
      </div>
    )
  }

  const positionDisplay = player.position[0] ?? 'Player'
  const displayName = `${player.firstName} ${player.lastName}`
  const profileUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://demo.fairpl.ai/p/${slug ?? ''}`
  const scoreColor = parentScoreColor(compositeScore)

  function handleCopyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl).catch(() => {})
    }
    setToast('Link copied')
  }

  function handleWhatsApp() {
    const text = `${displayName} on Fairplai — composite ${compositeScore}, ${playerAnalyses.length} matches this season. ${profileUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    if (typeof window !== 'undefined') window.open(url, '_blank')
  }

  function handlePDF() {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <div className="min-h-[100dvh] bg-brand-sand text-brand-indigo">
      {/* Slim header — brand mark + a single demo affordance to flip to
       *  the scout side. Tap "Scouts" → /scout. Reads as a soft cross-
       *  link, not a primary nav. */}
      <header className="flex items-center justify-between border-b border-brand-line px-4 py-3">
        <span className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.32em] text-brand-indigo">
          fairplai
        </span>
        <a
          href="/scout"
          className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-brand-paper px-3 py-1 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em] text-brand-indigo no-underline"
        >
          Scouts →
        </a>
      </header>

      {/* Hero — centered Instagram-profile style. */}
      <section className="px-5 pb-6 pt-8 text-center md:pt-12">
        <div className="mx-auto flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="rounded-full"
              style={{ boxShadow: `0 0 0 4px ${scoreColor}, 0 12px 32px rgba(11,8,40,0.18)` }}
            >
              <PlayerGlyph
                size={120}
                jerseyNumber={player.jerseyNumber}
                name={displayName}
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
              {positionDisplay} · #{player.jerseyNumber} · AGE {age ?? '—'}
            </div>
            <h1 className="m-0 mt-1.5 font-clash text-[36px] leading-[1.05] tracking-[-0.02em] text-brand-indigo md:text-[48px]">
              {displayName}
            </h1>
            <div className="mt-1.5 font-satoshi text-[14px] text-brand-indigo-mid">
              MAK Academy U13 Lions · UAE
            </div>
            {fifaConnectId && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-paper px-3 py-1 font-fragment text-[10px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute">
                FIFA Connect <span className="text-brand-indigo">{fifaConnectId}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Composite score — the hero number. ScoreArc renders the
       *  outer ring only; we overlay the score value in the center via
       *  absolute positioning so the visual reads as "score sits inside
       *  the trajectory ring". */}
      <section className="flex flex-col items-center gap-2 pb-7">
        <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
          Composite score · season
        </div>
        <div className="relative inline-flex items-center justify-center">
          <ScoreArcDynamic
            score={compositeScore}
            size={140}
            strokeWidth={10}
            color={scoreColor}
            dark={false}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-clash text-[44px] leading-none tracking-[-0.03em]"
              style={{ color: scoreColor }}
            >
              {compositeScore}
            </span>
            <span className="mt-1 font-fragment text-[8.5px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute">
              / 100
            </span>
          </div>
        </div>
        <div className="max-w-[300px] text-center font-satoshi text-[12.5px] leading-[1.5] text-brand-indigo-mid">
          AI-verified across {playerAnalyses.length} matches this season. Higher is better.
        </div>
      </section>

      {/* Share row — prominent, brand-yellow primary, sticky on mobile. */}
      <section className="sticky top-0 z-10 border-y border-brand-line bg-brand-paper px-5 py-3 backdrop-blur md:static md:bg-transparent md:py-4">
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

      {/* Top stats — 4-up tile row. */}
      {topStats && (
        <section className="mx-auto max-w-[480px] px-5 pt-6">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Goals" value={String(topStats.goals)} />
            <StatTile label="Key passes" value={String(topStats.assists)} />
            <StatTile label="Top speed" value={`${topStats.topSpeed} km/h`} />
            <StatTile label="Pass acc" value={`${topStats.avgPassCompletion}%`} />
          </div>
        </section>
      )}

      {/* Highlight reel grid — most recent first. */}
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

      {/* Coach endorsement — single pull quote. Hardcoded for prototype;
       *  in real product this comes from coach IDP / freeform notes. */}
      <section className="mx-auto mt-7 max-w-[480px] px-5">
        <div className="rounded-xl border-l-[3px] border-brand-yellow bg-brand-paper px-4 py-4">
          <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
            Coach&apos;s note
          </div>
          <p className="m-0 mt-1.5 font-satoshi text-[14px] leading-[1.55] text-brand-indigo">
            &ldquo;Reads the game two passes ahead of everyone else on the pitch. The
            kind of player who makes others around them better.&rdquo;
          </p>
          <div className="mt-2 font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-indigo-mute">
            COACH SARA · MAK ACADEMY · APR 2026
          </div>
        </div>
      </section>

      {/* Footer */}
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
    <div className="flex flex-col rounded-xl border border-brand-line bg-brand-paper px-4 py-3.5">
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
  const m = meta[eventType] ?? { label: eventType.toUpperCase(), color: 'bg-brand-indigo-mute text-brand-sand' }
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

// Suppress unused warning for slug-helper exports that other surfaces
// (scout discovery) will consume in a follow-up slice.
void getSlugForPlayer
