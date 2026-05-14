'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Star, Send } from 'lucide-react'
import { getAllPublicPlayers } from '@/lib/player-public'
import { squadScores } from '@/lib/mockData'
import { parentScoreColor } from '@/lib/parent-score-color'
import { cn } from '@/lib/cn'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'
import { Toast } from '@/components/coach/match-center/Toast'

/* Scout discovery prototype — /scout
 *
 * Free-to-use scout-facing surface. Discovery search + filter + grid
 * of available player CVs. Click a card to open the public CV in
 * scout context.
 *
 * Sign-up gate: anonymous scouts get a soft sign-up (name +
 * organisation), stored to localStorage. No real auth, no email
 * verification, no real backend — this is a prototype shaped to test
 * the scout's first 60 seconds of interaction with the platform.
 *
 * Shortlist + Express Interest both write to localStorage. Express
 * Interest fires a toast saying "Email sent to parent" — when the
 * real backend ships, that becomes a real email.
 *
 * The discovery list reads from the same `getAllPublicPlayers()` helper
 * the public CV route uses, so adding a new player surfaces them on
 * both sides automatically. */

interface ScoutProfile {
  name: string
  organisation: string
  region: string
}

interface FilterState {
  position: string // 'all' | 'GK' | 'DEF' | 'MID' | 'ATT'
  minScore: number
}

type RoleGroup = 'GK' | 'DEF' | 'MID' | 'ATT'

function positionToGroup(position: string): RoleGroup {
  if (position === 'GK') return 'GK'
  if (['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DEF'
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'MID'
  return 'ATT'
}

const STORAGE_PROFILE = 'fairplai_scout_profile'
const STORAGE_SHORTLIST = 'fairplai_scout_shortlist'
const STORAGE_INTEREST = 'fairplai_scout_interest_sent'

export default function ScoutHomePage() {
  const [profile, setProfile] = useState<ScoutProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [shortlist, setShortlist] = useState<Set<string>>(new Set())
  const [interestSent, setInterestSent] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterState>({ position: 'all', minScore: 0 })
  const [search, setSearch] = useState('')

  // Hydrate profile + shortlist + interest from localStorage on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = window.localStorage.getItem(STORAGE_PROFILE)
      if (raw) setProfile(JSON.parse(raw) as ScoutProfile)
    } catch {
      /* ignore */
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_SHORTLIST)
      if (raw) setShortlist(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore */
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_INTEREST)
      if (raw) setInterestSent(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore */
    }
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const players = useMemo(() => getAllPublicPlayers(), [])

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim()
    return players
      .map(({ player, slug }) => {
        const score = squadScores[player.id]?.compositeScore ?? 0
        const group = positionToGroup(player.position[0] ?? 'CM')
        return { player, slug, score, group }
      })
      .filter(p => {
        if (filter.position !== 'all' && p.group !== filter.position) return false
        if (p.score < filter.minScore) return false
        if (lowerSearch) {
          const full = `${p.player.firstName} ${p.player.lastName}`.toLowerCase()
          if (!full.includes(lowerSearch)) return false
        }
        return true
      })
      .sort((a, b) => b.score - a.score)
  }, [players, filter, search])

  function toggleShortlist(playerId: string) {
    const next = new Set(shortlist)
    if (next.has(playerId)) {
      next.delete(playerId)
      setToast('Removed from shortlist')
    } else {
      next.add(playerId)
      setToast('Added to shortlist')
    }
    setShortlist(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_SHORTLIST, JSON.stringify(Array.from(next)))
    }
  }

  function sendInterest(playerId: string, name: string) {
    const next = new Set(interestSent)
    next.add(playerId)
    setInterestSent(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_INTEREST, JSON.stringify(Array.from(next)))
    }
    setToast(`Email sent to ${name.split(' ')[0]}'s guardian`)
  }

  function saveProfile(p: ScoutProfile) {
    setProfile(p)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_PROFILE, JSON.stringify(p))
    }
    setToast(`Welcome, ${p.name.split(' ')[0]}`)
  }

  if (!hydrated) {
    return <div className="min-h-[100dvh] bg-brand-sand" />
  }

  if (!profile) {
    return <ScoutSignUp onSubmit={saveProfile} />
  }

  return (
    <div className="min-h-[100dvh] bg-brand-sand text-brand-indigo">
      {/* Slim sticky header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-line bg-brand-sand px-4 py-3 md:px-8">
        <span className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.32em] text-brand-indigo">
          fairplai · scouts
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden font-fragment text-[10px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute sm:inline">
            {profile.organisation}
          </span>
          <span className="font-satoshi text-[12.5px] font-semibold text-brand-indigo">
            {profile.name}
          </span>
        </div>
      </header>

      {/* Page anchor */}
      <section className="px-4 pb-2 pt-6 md:px-8 md:pt-8">
        <h1 className="m-0 font-clash text-[28px] leading-[1.1] tracking-[-0.02em] text-brand-indigo md:text-[40px]">
          Discover talent.
        </h1>
        <div className="mt-1 font-satoshi text-[13px] text-brand-indigo-mid md:text-sm">
          {players.length} verified player CVs · UAE youth football
        </div>
      </section>

      {/* Search + filters */}
      <section className="border-b border-brand-line bg-brand-paper px-4 py-3 md:px-8">
        <div className="mx-auto max-w-[760px] space-y-2.5">
          <div className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-sand px-3 py-2">
            <Search size={16} className="text-brand-indigo-mute" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="flex-1 border-none bg-transparent font-satoshi text-[13.5px] text-brand-indigo outline-none placeholder:text-brand-indigo-mute"
            />
          </div>
          <div
            className="flex gap-1.5 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: 'none', touchAction: 'pan-x' }}
          >
            {(['all', 'GK', 'DEF', 'MID', 'ATT'] as const).map(pos => {
              const active = filter.position === pos
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setFilter(f => ({ ...f, position: pos }))}
                  className={cn(
                    'shrink-0 cursor-pointer rounded-full border px-3 py-1 font-fragment text-[10px] font-bold uppercase tracking-[0.18em]',
                    active
                      ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                      : 'border-brand-line bg-transparent text-brand-indigo',
                  )}
                >
                  {pos === 'all' ? 'All positions' : pos}
                </button>
              )
            })}
            <span className="ml-2 shrink-0 self-center font-fragment text-[10px] font-bold uppercase tracking-[0.16em] text-brand-indigo-mute">
              Min score
            </span>
            {[0, 70, 75, 80].map(s => {
              const active = filter.minScore === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(f => ({ ...f, minScore: s }))}
                  className={cn(
                    'shrink-0 cursor-pointer rounded-full border px-3 py-1 font-fragment text-[10px] font-bold uppercase tracking-[0.18em]',
                    active
                      ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                      : 'border-brand-line bg-transparent text-brand-indigo',
                  )}
                >
                  {s === 0 ? 'Any' : `${s}+`}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Player grid */}
      <section className="mx-auto max-w-[760px] px-4 py-5 md:px-8 md:py-7">
        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-brand-line bg-brand-paper px-6 py-10 text-center font-satoshi text-[13.5px] text-brand-indigo-mute">
            No players match those filters. Try widening the search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map(({ player, slug, score }) => {
              const isShortlisted = shortlist.has(player.id)
              const hasInterest = interestSent.has(player.id)
              const color = parentScoreColor(score)
              const displayName = `${player.firstName} ${player.lastName}`
              const pos = player.position[0] ?? 'Player'
              return (
                <article
                  key={player.id}
                  className="flex flex-col gap-3 rounded-xl border border-brand-line bg-brand-paper p-4"
                >
                  <Link
                    href={`/p/${slug}`}
                    className="flex items-center gap-3 no-underline"
                  >
                    <div
                      className="rounded-full"
                      style={{ boxShadow: `0 0 0 2px ${color}` }}
                    >
                      <PlayerGlyph
                        size={52}
                        jerseyNumber={player.jerseyNumber}
                        name={displayName}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-clash text-[18px] leading-[1.1] tracking-[-0.01em] text-brand-indigo">
                        {displayName}
                      </div>
                      <div className="mt-0.5 font-fragment text-[10px] font-bold uppercase tracking-[0.18em] text-brand-indigo-mute">
                        {pos} · #{player.jerseyNumber}
                      </div>
                    </div>
                    <div
                      className="font-clash text-[28px] leading-none tracking-[-0.02em]"
                      style={{ color }}
                    >
                      {score}
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleShortlist(player.id)}
                      className={cn(
                        'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-2 font-satoshi text-[12px] font-semibold',
                        isShortlisted
                          ? 'border-brand-yellow bg-brand-yellow text-brand-indigo'
                          : 'border-brand-line bg-transparent text-brand-indigo',
                      )}
                    >
                      <Star size={13} fill={isShortlisted ? 'currentColor' : 'none'} />
                      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                    <button
                      type="button"
                      onClick={() => sendInterest(player.id, displayName)}
                      disabled={hasInterest}
                      className={cn(
                        'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-none px-3 py-2 font-satoshi text-[12px] font-bold',
                        hasInterest
                          ? 'bg-brand-line-soft text-brand-indigo-mute cursor-default'
                          : 'bg-brand-indigo text-brand-sand',
                      )}
                    >
                      <Send size={13} />
                      {hasInterest ? 'Interest sent' : 'Express interest'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        {shortlist.size > 0 && (
          <div className="mt-6 text-center font-fragment text-[10px] font-bold uppercase tracking-[0.18em] text-brand-indigo-mute">
            {shortlist.size} player{shortlist.size === 1 ? '' : 's'} on your shortlist
          </div>
        )}
      </section>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

function ScoutSignUp({ onSubmit }: { onSubmit: (p: ScoutProfile) => void }) {
  const [name, setName] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [region, setRegion] = useState('')

  const canSubmit = name.trim().length > 0 && organisation.trim().length > 0

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-brand-sand px-5 py-12 text-brand-indigo">
      <div className="w-full max-w-[400px]">
        <div className="text-center">
          <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.32em] text-brand-indigo-mute">
            fairplai · scouts
          </div>
          <h1 className="m-0 mt-3 font-clash text-[36px] leading-[1.05] tracking-[-0.02em]">
            Discover the next generation.
          </h1>
          <p className="mt-3 font-satoshi text-[14px] leading-[1.55] text-brand-indigo-mid">
            Free for verified scouts. Sign in and we&apos;ll surface
            AI-verified youth football talent across the region.
          </p>
        </div>

        <form
          className="mt-7 space-y-3"
          onSubmit={e => {
            e.preventDefault()
            if (!canSubmit) return
            onSubmit({ name: name.trim(), organisation: organisation.trim(), region: region.trim() })
          }}
        >
          <Field label="Your name">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sarah Mitchell"
              className="block w-full rounded-md border border-brand-line bg-brand-paper px-3 py-2.5 font-satoshi text-[14px] text-brand-indigo outline-none placeholder:text-brand-indigo-mute"
            />
          </Field>
          <Field label="Club or organisation">
            <input
              type="text"
              value={organisation}
              onChange={e => setOrganisation(e.target.value)}
              placeholder="Al Wasl Academy"
              className="block w-full rounded-md border border-brand-line bg-brand-paper px-3 py-2.5 font-satoshi text-[14px] text-brand-indigo outline-none placeholder:text-brand-indigo-mute"
            />
          </Field>
          <Field label="Region (optional)">
            <input
              type="text"
              value={region}
              onChange={e => setRegion(e.target.value)}
              placeholder="UAE"
              className="block w-full rounded-md border border-brand-line bg-brand-paper px-3 py-2.5 font-satoshi text-[14px] text-brand-indigo outline-none placeholder:text-brand-indigo-mute"
            />
          </Field>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'mt-3 block w-full cursor-pointer rounded-full border-none px-4 py-3 font-satoshi text-[14px] font-bold',
              canSubmit
                ? 'bg-brand-indigo text-brand-sand'
                : 'cursor-default bg-brand-line-soft text-brand-indigo-mute',
            )}
          >
            Start discovering
          </button>
        </form>

        <p className="mt-5 text-center font-satoshi text-[11.5px] leading-[1.5] text-brand-indigo-mute">
          We never charge scouts. We never share contact info publicly.
          All player contact runs through guardians.
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-fragment text-[10px] font-bold uppercase tracking-[0.18em] text-brand-indigo-mute">
        {label}
      </span>
      {children}
    </label>
  )
}
