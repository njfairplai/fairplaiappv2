'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { COLORS } from '@/lib/constants'
import { players, rosters, squadScores, playerStandoutMetrics } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import { motion } from 'framer-motion'
import type { Player } from '@/lib/types'

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

type Timeframe = 'last_session' | 'last_5' | 'season'
type SortKey = 'score' | 'distance' | 'sprints' | 'position'

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
  const { selectedRosterId } = useTeam()
  const [timeframe, setTimeframe] = useState<Timeframe>('last_session')
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const handleImgError = useCallback((playerId: string) => {
    setImgErrors(prev => ({ ...prev, [playerId]: true }))
  }, [])
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({})

  const selectedRoster = rosters.find(r => r.id === selectedRosterId) || rosters[0]

  const rosterPlayers = useMemo(() => {
    const ids = rosterPlayerMap[selectedRosterId] || []
    return players.filter(p => ids.includes(p.id))
  }, [selectedRosterId])

  const sortedPlayers = useMemo(() => {
    const arr = [...rosterPlayers]
    switch (sortBy) {
      case 'score':
        return arr.sort((a, b) => (squadScores[b.id]?.compositeScore ?? 0) - (squadScores[a.id]?.compositeScore ?? 0))
      case 'distance':
        return arr.sort((a, b) => (squadScores[b.id]?.compositeScore ?? 0) - (squadScores[a.id]?.compositeScore ?? 0))
      case 'sprints':
        return arr.sort((a, b) => (squadScores[b.id]?.compositeScore ?? 0) - (squadScores[a.id]?.compositeScore ?? 0))
      case 'position':
        return arr.sort((a, b) => (a.position[0] || '').localeCompare(b.position[0] || ''))
      default:
        return arr
    }
  }, [rosterPlayers, sortBy])

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
  }, [timeframe, sortedPlayers])

  // Find flagged player (avgScore - compositeScore > 15)
  const flaggedPlayer = useMemo(() => {
    for (const p of rosterPlayers) {
      const s = squadScores[p.id]
      if (s && s.avgScore - s.compositeScore > 15) return p
    }
    return null
  }, [rosterPlayers])

  const flaggedDiff = flaggedPlayer
    ? (squadScores[flaggedPlayer.id]?.avgScore ?? 0) - (squadScores[flaggedPlayer.id]?.compositeScore ?? 0)
    : 0

  const timeframes: { key: Timeframe; label: string }[] = [
    { key: 'last_session', label: 'Last Session' },
    { key: 'last_5', label: 'Last 5' },
    { key: 'season', label: 'Season' },
  ]

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'score', label: 'Score' },
    { key: 'distance', label: 'Distance' },
    { key: 'sprints', label: 'Sprints' },
    { key: 'position', label: 'Position' },
  ]

  return (
    <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot { 0%,100% { transform: scale(1); } 50% { transform: scale(1.4); } }
        .squad-card-tap { transition: transform 100ms ease; }
        .squad-card-tap:active { transform: scale(0.97); }
      ` }} />

      {/* HEADER */}
      <div style={{ background: '#0A0E1A', padding: '48px 20px 20px' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>Squad</h1>
        <p style={{ margin: '2px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{selectedRoster.name}</p>

        {/* TOGGLE ROW */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 16 }}>
          {timeframes.map(tf => {
            const isActive = tf.key === timeframe
            return (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  background: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#0A0E1A' : 'rgba(255,255,255,0.5)',
                }}
              >
                {tf.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ALERT STRIP */}
      {flaggedPlayer && !alertDismissed && (
        <div
          style={{
            background: '#FFFBEB',
            borderLeft: '4px solid #F59E0B',
            borderRadius: 0,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={16} color="#92400E" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 14, color: '#92400E', flex: 1 }}>
            {flaggedPlayer.firstName} {flaggedPlayer.lastName} — performance down {flaggedDiff}% vs average. Review recommended.
          </span>
          <button
            onClick={() => setAlertDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#92400E',
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* SORT ROW */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <span style={{ fontSize: 12, color: '#64748B' }}>Sort by</span>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
          {sortOptions.map(opt => {
            const isActive = opt.key === sortBy
            return (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? '#4A4AFF' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* SQUAD GRID */}
      <div
        key={timeframe}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          padding: 16,
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
              onClick={() => router.push(`/coach/squad/${player.id}`)}
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

              {/* ALERT DOT */}
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
