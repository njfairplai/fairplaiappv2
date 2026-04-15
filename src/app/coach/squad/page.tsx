'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { GitCompare, ArrowUpDown, Filter } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { useCoachTheme } from '@/contexts/CoachThemeContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { COLORS } from '@/lib/constants'
import { players, rosters, squadScores, playerStandoutMetrics, playerWorkloads, playerKeyMetrics } from '@/lib/mockData'
import { calculateACWR, getRiskLevel, getRiskLabel, RISK_COLORS } from '@/lib/riskUtils'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import { motion } from 'framer-motion'
import type { Player } from '@/lib/types'

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

type SortKey = 'score' | 'name' | 'position' | 'jersey'
type PositionFilter = 'all' | 'GK' | 'DEF' | 'MID' | 'FWD'

const POSITION_FILTERS: { key: PositionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'GK', label: 'GK' },
  { key: 'DEF', label: 'DEF' },
  { key: 'MID', label: 'MID' },
  { key: 'FWD', label: 'FWD' },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: 'Score' },
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Position' },
  { key: 'jersey', label: 'Jersey #' },
]

function matchesPositionFilter(player: Player, filter: PositionFilter): boolean {
  if (filter === 'all') return true
  const pos = player.position[0] || ''
  if (filter === 'GK') return pos === 'GK'
  if (filter === 'DEF') return ['CB', 'LB', 'RB'].includes(pos)
  if (filter === 'MID') return ['CM', 'AM', 'DM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos)
  if (filter === 'FWD') return ['ST', 'CF', 'LW', 'RW'].includes(pos)
  return true
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#D97706'
  if (['CB', 'LB', 'RB'].includes(position)) return '#059669'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return '#4A4AFF'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#DC2626'
  return '#64748B'
}

function getPositionGradient(position: string): string {
  if (position === 'GK') return 'linear-gradient(160deg, #D97706 0%, #B45309 100%)'
  if (['CB', 'LB', 'RB'].includes(position)) return 'linear-gradient(160deg, #059669 0%, #047857 100%)'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return 'linear-gradient(160deg, #4A4AFF 0%, #3025AE 100%)'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return 'linear-gradient(160deg, #DC2626 0%, #B91C1C 100%)'
  return 'linear-gradient(160deg, #6E7180 0%, #40424D 100%)'
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

export default function SquadPage() {
  const router = useRouter()
  const pathname = usePathname()
  const isWeb = pathname.startsWith('/coach/web')
  const { selectedRosterId, setSelectedRosterId, availableRosters } = useTeam()
  const { colors: themeColors, mode: themeMode } = useCoachTheme()
  const isMobile = useIsMobile()
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const [posFilter, setPosFilter] = useState<PositionFilter>('all')
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const handleImgError = useCallback((playerId: string) => {
    setImgErrors(prev => ({ ...prev, [playerId]: true }))
  }, [])
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({})

  const effectiveRosterId = selectedRosterId === 'all' ? rosters[0]?.id : selectedRosterId
  const selectedRoster = rosters.find(r => r.id === effectiveRosterId) || rosters[0]

  const rosterPlayers = useMemo(() => {
    if (selectedRosterId === 'all') {
      const allIds = Object.values(rosterPlayerMap).flat()
      return players.filter(p => allIds.includes(p.id))
    }
    const ids = rosterPlayerMap[selectedRosterId] || []
    return players.filter(p => ids.includes(p.id))
  }, [selectedRosterId])

  const filteredPlayers = useMemo(() => {
    return rosterPlayers.filter(p => matchesPositionFilter(p, posFilter))
  }, [rosterPlayers, posFilter])

  const sortedPlayers = useMemo(() => {
    const arr = [...filteredPlayers]
    switch (sortBy) {
      case 'score':
        return arr.sort((a, b) => (squadScores[b.id]?.compositeScore ?? 0) - (squadScores[a.id]?.compositeScore ?? 0))
      case 'name':
        return arr.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
      case 'position': {
        const posOrder: Record<string, number> = { GK: 0, CB: 1, LB: 1, RB: 1, CDM: 2, CM: 2, DM: 2, AM: 3, CAM: 3, LM: 3, RM: 3, LW: 4, RW: 4, ST: 4, CF: 4 }
        return arr.sort((a, b) => (posOrder[a.position[0]] ?? 5) - (posOrder[b.position[0]] ?? 5))
      }
      case 'jersey':
        return arr.sort((a, b) => a.jerseyNumber - b.jerseyNumber)
      default:
        return arr
    }
  }, [filteredPlayers, sortBy])

  const playerRiskMap = useMemo(() => {
    const map: Record<string, { acwr: number; riskLevel: string; riskLabel: string; strain: string }> = {}
    for (const p of rosterPlayers) {
      const workload = playerWorkloads.find(w => w.playerId === p.id)
      if (!workload) continue
      const acwr = calculateACWR(workload.weeklyLoads)
      const riskLevel = getRiskLevel(acwr)
      const riskLabel = getRiskLabel(acwr)
      const strain = playerKeyMetrics[p.id]?.strain ?? 'low'
      map[p.id] = { acwr, riskLevel, riskLabel, strain }
    }
    return map
  }, [rosterPlayers])

  useEffect(() => {
    const targets: Record<string, number> = {}
    for (const p of sortedPlayers) {
      targets[p.id] = squadScores[p.id]?.compositeScore ?? 0
    }
    const duration = 600
    let start: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      const current: Record<string, number> = {}
      for (const id in targets) {
        current[id] = eased * targets[id]
      }
      setAnimatedScores(current)

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [sortedPlayers])


  return (
    <div style={{ background: isWeb ? themeColors.pageBg : '#F8F9FC', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot { 0%,100% { transform: scale(1); } 50% { transform: scale(1.4); } }
        .squad-card-tap { transition: transform 100ms ease; }
        .squad-card-tap:active { transform: scale(0.97); }
      ` }} />

      {/* HEADER */}
      <div style={{
        background: isWeb ? themeColors.cardBg : '#0A0E1A',
        padding: isWeb ? (isMobile ? '14px 12px' : '20px 20px') : '48px 20px 20px',
        borderBottom: isWeb ? `1px solid ${themeColors.cardBorder}` : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: isWeb && isMobile ? 22 : 28, fontWeight: 800, color: isWeb ? themeColors.textPrimary : '#FFFFFF' }}>Squad</h1>
            <p style={{ margin: '2px 0 0', fontSize: isWeb && isMobile ? 12 : 14, color: isWeb ? themeColors.textMuted : 'rgba(255,255,255,0.5)' }}>{selectedRosterId === 'all' ? 'All Teams' : selectedRoster.name}</p>
          </div>
          <button
            onClick={() => router.push(isWeb ? '/coach/web/squad/compare' : '/coach/squad/compare')}
            title="Compare players"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isWeb ? `${COLORS.primary}08` : 'rgba(255,255,255,0.1)',
              border: `1px solid ${isWeb ? `${COLORS.primary}20` : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 8,
              padding: isWeb && isMobile ? '6px 10px' : '8px 14px',
              cursor: 'pointer',
              color: isWeb ? COLORS.primary : '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}
          >
            <GitCompare size={14} /> {!(isWeb && isMobile) && 'Compare'}
          </button>
        </div>
      </div>

      {/* SORT & FILTER BAR */}
      <div style={{ padding: isWeb && isMobile ? '10px 12px 4px' : '12px 16px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Position filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="#94a3b8" />
          <div style={{ display: 'flex', gap: 4 }}>
            {POSITION_FILTERS.map(f => {
              const isActive = f.key === posFilter
              return (
                <button
                  key={f.key}
                  onClick={() => setPosFilter(f.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: isActive ? COLORS.primary : '#E8EAF0',
                    color: isActive ? '#fff' : '#64748B',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={14} color="#94a3b8" />
          <div style={{ display: 'flex', gap: 4 }}>
            {SORT_OPTIONS.map(s => {
              const isActive = s.key === sortBy
              return (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: isActive ? '#1E293B' : '#E8EAF0',
                    color: isActive ? '#fff' : '#64748B',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* SQUAD GRID */}
      <div
        key={selectedRosterId}
        style={{
          display: 'grid',
          gridTemplateColumns: isWeb
            ? (isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(180px, 1fr))')
            : '1fr 1fr',
          gap: isWeb && isMobile ? 8 : 10,
          padding: isWeb && isMobile ? 12 : 16,
        }}
      >
        {sortedPlayers.map((player, index) => {
          const score = squadScores[player.id]
          const compositeScore = score?.compositeScore ?? 0
          const avgScore = score?.avgScore ?? 0
          const diff = compositeScore - avgScore
          const position = player.position[0] || 'CM'
          const initials = (player.firstName[0] || '') + (player.lastName[0] || '')
          const isFlagged = score && (score.avgScore - score.compositeScore > 15)
          const scoreColor = getScoreColor(compositeScore)

          let trendColor = '#9DA2B3'
          let trendText = '\u2192'
          if (diff > 3) {
            trendColor = '#10B981'
            trendText = `\u2191+${diff}`
          } else if (diff < -3) {
            trendColor = '#EF4444'
            trendText = `\u2193${diff}`
          }

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
            >
            <div
              className="squad-card-tap"
              onClick={() => router.push(isWeb ? `/coach/web/player/${player.id}` : `/coach/squad/${player.id}`)}
              style={{
                height: 230,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* PHOTO LAYER */}
              {player.photo && !imgErrors[player.id] ? (
                <Image
                  src={player.photo}
                  alt={`${player.firstName} ${player.lastName}`}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  onError={() => handleImgError(player.id)}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: getPositionGradient(position),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {initials}
                  </span>
                </div>
              )}

              {/* GRADIENT OVERLAY */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(160deg, rgba(10,14,26,0.0) 0%, rgba(10,14,26,0.1) 35%, rgba(10,14,26,0.7) 65%, rgba(10,14,26,0.96) 100%)',
                }}
              />

              {/* JERSEY BADGE */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 2,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(10,14,26,0.75)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {player.jerseyNumber}
              </div>

              {/* POSITION ACCENT */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 2,
                  background: `${getPositionColor(position)}D9`,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 10,
                  padding: '3px 7px',
                  borderRadius: 20,
                }}
              >
                {position}
              </div>

              {/* ALERT DOT (performance) */}
              {isFlagged && (
                <div
                  style={{
                    position: 'absolute',
                    top: 36,
                    left: 10,
                    zIndex: 2,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#EF4444',
                    animation: 'pulse-dot 1.5s infinite',
                  }}
                />
              )}

              {/* RISK DOT */}
              {playerRiskMap[player.id] && playerRiskMap[player.id].riskLevel !== 'low' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 36,
                    left: 10,
                    zIndex: 3,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: RISK_COLORS[playerRiskMap[player.id].riskLevel as keyof typeof RISK_COLORS],
                  }}
                />
              )}

              {/* BOTTOM CONTENT */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 14px',
                  zIndex: 2,
                }}
              >
                {/* Player name */}
                <div
                  style={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 15,
                    textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {player.firstName} {player.lastName}
                </div>

                {/* Score row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  {/* Composite score */}
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: scoreColor,
                      textShadow: `0 0 8px ${scoreColor}66`,
                    }}
                  >
                    {Math.round(animatedScores[player.id] ?? 0)}
                  </span>

                  {/* Trend arrow + delta */}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: trendColor,
                    }}
                  >
                    {trendText}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                  Avg: {avgScore}
                </div>
                {playerStandoutMetrics[player.id] && (
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 3 }}>
                    {playerStandoutMetrics[player.id]}
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
