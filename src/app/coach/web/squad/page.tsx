'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitCompareArrows } from 'lucide-react'
import { players, rosters } from '@/lib/mockData'
import { useTeam } from '@/contexts/TeamContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CLUSTERS, getClusterForPlayer, layoutPlayersInCluster } from '@/lib/squad-clusters'
import { getSeasonScoresFor, scoreColor } from '@/lib/squad-season-score'
import { Pitch } from '@/components/coach/squad-grass/Pitch'
import { PlayerToken } from '@/components/coach/squad-grass/PlayerToken'
import { SideRail } from '@/components/coach/squad-grass/SideRail'
import { cn } from '@/lib/cn'
import {
  getAllInjuryFlags,
  getLatestFatigueByPlayer,
  fatigueTier,
} from '@/lib/parent-portal'

/** A player's IDP draft is "stale" if it was last saved more than this many
 *  days ago — or never started. Matches the heuristic the IDPs editor uses. */
const IDP_STALE_DAYS = 30

interface IdpDraftRecord {
  attitude: number
  effort: number
  coachability: number
  sportsmanship: number
  observation: string
  goals: string[]
  savedAt: number
}

// Mirrors mobile squad page mapping. (Will move into a shared util when we
// have a real roster→player join.)
const ROSTER_PLAYER_MAP: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

export default function CoachWebSquadPage() {
  const router = useRouter()
  const { selectedRosterId } = useTeam()
  const isMobile = useIsMobile()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Token-dimming filter. `all` is the default — no token gets dimmed.
  // The other three pills focus the squad on welfare slices: IDP stale,
  // high fatigue, recent injuries. Pills are mutually exclusive (toggle
  // back to 'all' by tapping the active pill).
  type SquadFilter = 'all' | 'idp_stale' | 'high_fatigue' | 'injuries'
  const [activeFilter, setActiveFilter] = useState<SquadFilter>('all')

  // Read IDP drafts from localStorage. Players whose draft is missing OR older
  // than IDP_STALE_DAYS surface as "needs review" when the filter is on.
  const [staleIds, setStaleIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fairplai_idp_drafts')
      const drafts = raw ? (JSON.parse(raw) as Record<string, IdpDraftRecord>) : {}
      const cutoff = Date.now() - IDP_STALE_DAYS * 24 * 60 * 60 * 1000
      const stale = new Set<string>()
      for (const p of players) {
        const draft = drafts[p.id]
        if (!draft || draft.savedAt < cutoff) stale.add(p.id)
      }
      setStaleIds(stale)
    } catch {
      // localStorage unavailable; treat everyone as "no draft" → all stale.
      setStaleIds(new Set(players.map(p => p.id)))
    }
  }, [])

  // Roster players — mirror mobile squad page logic.
  const rosterPlayers = useMemo(() => {
    if (selectedRosterId === 'all') {
      const allIds = Object.values(ROSTER_PLAYER_MAP).flat()
      return players.filter(p => allIds.includes(p.id))
    }
    const ids = ROSTER_PLAYER_MAP[selectedRosterId] ?? []
    return players.filter(p => ids.includes(p.id))
  }, [selectedRosterId])

  const seasonScores = useMemo(
    () => getSeasonScoresFor(rosterPlayers.map(p => p.id)),
    [rosterPlayers],
  )

  // Welfare overlay — most-recent fatigue sample per player + injury
  // flags from the last 30 days. Read post-mount so SSR is deterministic.
  const [fatigueByPlayer, setFatigueByPlayer] = useState<
    ReturnType<typeof getLatestFatigueByPlayer>
  >({})
  const [recentInjuryIds, setRecentInjuryIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    setFatigueByPlayer(getLatestFatigueByPlayer())
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    const ids = new Set<string>()
    for (const inj of getAllInjuryFlags()) {
      if (new Date(inj.createdAt).getTime() >= cutoff) ids.add(inj.playerId)
    }
    setRecentInjuryIds(ids)
  }, [])

  // Player-ID sets per filter. Computed inline so they re-react when the
  // dependent stores update.
  const highFatigueIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [pid, sample] of Object.entries(fatigueByPlayer)) {
      if (fatigueTier(sample.load) === 'high') ids.add(pid)
    }
    return ids
  }, [fatigueByPlayer])
  const filterMatchIds = useMemo<Set<string> | null>(() => {
    if (activeFilter === 'all') return null
    if (activeFilter === 'idp_stale') return staleIds
    if (activeFilter === 'high_fatigue') return highFatigueIds
    if (activeFilter === 'injuries') return recentInjuryIds
    return null
  }, [activeFilter, staleIds, highFatigueIds, recentInjuryIds])

  // Group every roster player into their cluster, then lay out positions.
  const positioned = useMemo(() => {
    const byCluster = new Map<string, typeof rosterPlayers>()
    for (const c of CLUSTERS) byCluster.set(c.id, [])
    for (const p of rosterPlayers) {
      const cid = getClusterForPlayer(p)
      byCluster.get(cid)!.push(p)
    }
    // Sort within cluster by jersey for stable arrangement.
    for (const c of CLUSTERS) {
      byCluster.get(c.id)!.sort((a, b) => a.jerseyNumber - b.jerseyNumber)
    }
    return CLUSTERS.flatMap(c => layoutPlayersInCluster(byCluster.get(c.id)!, c))
  }, [rosterPlayers])

  // Top performer (used for the SQUAD AVG / TOP FORM stats only — no longer
  // surfaced as a floating standout card).
  const topForm = useMemo(() => {
    const ranked = rosterPlayers
      .map(p => ({ player: p, score: seasonScores[p.id]?.avg ?? 0 }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
    return ranked[0] ?? null
  }, [rosterPlayers, seasonScores])

  const selectedPlayer = useMemo(
    () => rosterPlayers.find(p => p.id === selectedId) ?? null,
    [rosterPlayers, selectedId],
  )
  const selectedSeason = selectedId ? seasonScores[selectedId] ?? null : null

  const handleSelect = useCallback((id: string) => setSelectedId(id), [])

  // Roster meta — name + record.
  const roster = useMemo(() => {
    if (selectedRosterId === 'all') return null
    return rosters.find(r => r.id === selectedRosterId) ?? null
  }, [selectedRosterId])

  return (
    <div
      className="bg-brand-sand text-brand-indigo font-satoshi"
      style={{ minHeight: 'calc(100vh - 108px)' }}
    >
      {/* squad header */}
      <div
        className={cn(
          'flex items-baseline gap-4 flex-wrap',
          isMobile ? 'px-4 pt-5 pb-2' : 'px-7 pt-7 pb-3.5',
        )}
      >
        <div>
          <div className="font-fragment text-[10.5px] font-bold tracking-[0.22em] text-brand-indigo-mute uppercase">
            SQUAD
          </div>
          {/* Match-Center / Highlights title vocabulary: TYPE.display at
           *  64 (desktop) / 40 (mobile), no fontWeight, lineHeight 0.94,
           *  letterSpacing -0.02em. Aligns the squad header with the
           *  rest of the brand surfaces so the title font reads as one
           *  family across tabs. */}
          <div
            className={cn(
              'font-clash tracking-[-0.02em] text-brand-indigo mt-1.5',
              isMobile ? 'text-[40px]' : 'text-[64px]',
            )}
            style={{ lineHeight: 0.94 }}
          >
            {roster?.name ?? 'All squads'}
          </div>
          {roster && (
            <div className="font-fragment text-[11px] tracking-[0.12em] text-brand-indigo-mute mt-1.5">
              {roster.ageGroup.toUpperCase()} · {roster.type.toUpperCase()} · {rosterPlayers.length} PLAYERS
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-[18px]">
          <SquadStat label="Squad avg" value={squadAvg(seasonScores)} />
          <SquadStat label="Top form" value={topForm?.score ?? 0} />
          <button
            type="button"
            onClick={() => router.push('/coach/web/compare')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-indigo text-brand-sand border-0 font-satoshi text-[13px] font-bold cursor-pointer tracking-[0.01em] self-end whitespace-nowrap"
          >
            <GitCompareArrows size={14} />
            Compare players
          </button>
        </div>
      </div>

      {/* Squad filter pills — focus the pitch on a welfare slice. Tokens
       *  not matching the active filter dim out. Pills are mutually
       *  exclusive; tap the active pill again to return to "All". */}
      <div
        className={cn(
          'flex items-center gap-2 flex-wrap',
          isMobile ? 'px-4' : 'px-7',
        )}
      >
        {[
          { id: 'all' as const, label: 'All', count: rosterPlayers.length, dot: 'var(--brand-indigo)' },
          { id: 'idp_stale' as const, label: 'IDP stale', count: staleIds.size, dot: 'var(--brand-coral)' },
          { id: 'high_fatigue' as const, label: 'High fatigue', count: highFatigueIds.size, dot: 'var(--brand-coral)' },
          { id: 'injuries' as const, label: 'Injuries this month', count: recentInjuryIds.size, dot: '#E89A45' },
        ].map(pill => {
          const isActive = activeFilter === pill.id
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveFilter(isActive ? 'all' : pill.id)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-satoshi text-[12.5px] font-semibold cursor-pointer tracking-[0.02em] whitespace-nowrap border',
                isActive
                  ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                  : 'border-brand-line bg-transparent text-brand-indigo',
              )}
            >
              {pill.id !== 'all' && (
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: isActive ? 'var(--brand-yellow)' : pill.dot }}
                />
              )}
              {pill.label}
              <span className="font-fragment text-[10px] tracking-[0.12em] opacity-70">
                {pill.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* pitch — full-width on every breakpoint; the player panel pops out
          as an overlay rather than stealing column space. */}
      <div
        className={cn(
          'relative',
          isMobile ? 'px-3 pt-2 pb-4' : 'px-7 pt-2 pb-7',
        )}
      >
        <div className="relative max-w-[760px] mx-auto">
          <Pitch>
            {positioned.map(({ player, x, y }) => {
              const score = seasonScores[player.id]?.avg ?? 0
              const dimmed = filterMatchIds !== null && !filterMatchIds.has(player.id)
              const sample = fatigueByPlayer[player.id]
              const tier = sample ? fatigueTier(sample.load) : undefined
              return (
                <PlayerToken
                  key={player.id}
                  player={player}
                  score={score}
                  x={x}
                  y={y}
                  selected={selectedId === player.id}
                  dimmed={dimmed}
                  fatigue={tier}
                  onClick={() => handleSelect(player.id)}
                />
              )
            })}
          </Pitch>
        </div>
      </div>

      {/* Pop-out player panel — slides in from the right on every breakpoint.
          On narrow viewports the panel auto-sizes to ~92vw so it acts as a
          near-fullscreen overlay; on desktop it caps at 420px wide. */}
      <SideRail
        player={selectedPlayer}
        season={selectedSeason}
        open={!!selectedPlayer}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

function SquadStat({ label, value }: { label: string; value: number }) {
  const c = scoreColor(value || 0)
  return (
    <div className="text-right">
      <div className="font-fragment text-[10px] tracking-[0.18em] text-brand-indigo-mute">
        {label.toUpperCase()}
      </div>
      <div
        className="font-clash text-[28px] leading-none mt-0.5"
        style={{ color: value ? c : 'var(--brand-indigo-mute)' }}
      >
        {value || '—'}
      </div>
    </div>
  )
}

function squadAvg(scores: Record<string, { avg: number; matches: number }>): number {
  const vals = Object.values(scores).filter(s => s.matches > 0).map(s => s.avg)
  if (vals.length === 0) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}
