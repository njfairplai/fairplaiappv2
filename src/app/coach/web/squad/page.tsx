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
      style={{
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        minHeight: 'calc(100vh - 108px)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* squad header */}
      <div
        style={{
          padding: isMobile ? '20px 16px 8px' : '28px 28px 14px',
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              textTransform: 'uppercase',
            }}
          >
            SQUAD
          </div>
          {/* Match-Center / Highlights title vocabulary: TYPE.display at
           *  64 (desktop) / 40 (mobile), no fontWeight, lineHeight 0.94,
           *  letterSpacing -0.02em. Aligns the squad header with the
           *  rest of the brand surfaces so the title font reads as one
           *  family across tabs. */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 40 : 64,
              letterSpacing: '-0.02em',
              lineHeight: 0.94,
              color: 'var(--brand-indigo)',
              marginTop: 6,
            }}
          >
            {roster?.name ?? 'All squads'}
          </div>
          {roster && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                color: 'var(--brand-indigo-mute)',
                marginTop: 6,
              }}
            >
              {roster.ageGroup.toUpperCase()} · {roster.type.toUpperCase()} · {rosterPlayers.length} PLAYERS
            </div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
          <SquadStat label="Squad avg" value={squadAvg(seasonScores)} />
          <SquadStat label="Top form" value={topForm?.score ?? 0} />
          <button
            type="button"
            onClick={() => router.push('/coach/web/compare')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.01em',
              alignSelf: 'flex-end',
              whiteSpace: 'nowrap',
            }}
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
        data-tour-id="squad-filter-row"
        style={{
          padding: isMobile ? '0 16px' : '0 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                border: isActive ? '1px solid var(--brand-indigo)' : '1px solid var(--brand-line)',
                background: isActive ? 'var(--brand-indigo)' : 'transparent',
                color: isActive ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {pill.id !== 'all' && (
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isActive ? 'var(--brand-yellow)' : pill.dot,
                    display: 'inline-block',
                  }}
                />
              )}
              {pill.label}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  opacity: 0.7,
                }}
              >
                {pill.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* pitch — full-width on every breakpoint; the player panel pops out
          as an overlay rather than stealing column space. */}
      <div
        style={{
          position: 'relative',
          padding: isMobile ? '8px 12px 16px' : '8px 28px 28px',
        }}
      >
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
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
    <div style={{ textAlign: 'right' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: value ? c : 'var(--brand-indigo-mute)',
          lineHeight: 1,
          marginTop: 2,
        }}
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
