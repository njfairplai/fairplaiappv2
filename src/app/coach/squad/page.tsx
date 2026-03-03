'use client'
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { COLORS } from '@/lib/constants'
import { players, rosters, squadScores } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import type { Player } from '@/lib/types'

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

type Timeframe = 'last_session' | 'last_5' | 'season'
type SortKey = 'score' | 'distance' | 'sprints' | 'position'

function getPositionColor(position: string): string {
  if (position === 'GK') return COLORS.warning
  if (['CB', 'LB', 'RB'].includes(position)) return COLORS.success
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return COLORS.primary
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return COLORS.error
  return COLORS.muted
}

function getPositionGradient(position: string): string {
  if (position === 'GK') return 'linear-gradient(160deg, #F39C12 0%, #E67E22 100%)'
  if (['CB', 'LB', 'RB'].includes(position)) return 'linear-gradient(160deg, #27AE60 0%, #1E8449 100%)'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return 'linear-gradient(160deg, #4A4AFF 0%, #3025AE 100%)'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return 'linear-gradient(160deg, #E74C3C 0%, #C0392B 100%)'
  return 'linear-gradient(160deg, #6E7180 0%, #40424D 100%)'
}

function getScoreColor(score: number): string {
  if (score >= 75) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
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
    <div style={{ background: COLORS.lightBg, minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
        .squad-card-tap { transition: transform 100ms ease; }
        .squad-card-tap:active { transform: scale(0.97); }
      ` }} />

      {/* HEADER */}
      <div style={{ padding: '20px 16px 0' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.navy }}>Squad</h1>
        <p style={{ margin: '2px 0 0', fontSize: 14, color: COLORS.muted }}>{selectedRoster.name}</p>
      </div>

      {/* TOGGLE ROW */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
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
                fontWeight: 600,
                cursor: 'pointer',
                border: isActive ? 'none' : `1px solid ${COLORS.primary}`,
                background: isActive ? COLORS.primary : '#FFFFFF',
                color: isActive ? '#FFFFFF' : COLORS.primary,
              }}
            >
              {tf.label}
            </button>
          )
        })}
      </div>

      {/* ALERT STRIP */}
      {flaggedPlayer && !alertDismissed && (
        <div
          style={{
            background: '#FFF3CD',
            border: '1px solid #FCD34D',
            borderRadius: 10,
            padding: '12px 16px',
            margin: '0 16px 12px',
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={16} color="#92400E" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13, color: '#92400E', flex: 1 }}>
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
          padding: '0 16px',
          marginBottom: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 12, color: COLORS.muted }}>Sort by</span>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
          {sortOptions.map(opt => {
            const isActive = opt.key === sortBy
            return (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? COLORS.primary : COLORS.lightBg,
                  color: isActive ? '#FFFFFF' : COLORS.muted,
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
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '0 16px',
          paddingBottom: 20,
        }}
      >
        {sortedPlayers.map(player => {
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
            trendColor = COLORS.success
            trendText = `\u2191+${diff}`
          } else if (diff < -3) {
            trendColor = COLORS.error
            trendText = `\u2193${diff}`
          }

          return (
            <div
              key={player.id}
              className="squad-card-tap"
              onClick={() => router.push(`/coach/squad/${player.id}`)}
              style={{
                height: 220,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {/* BACKGROUND LAYER */}
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
                    'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(13,16,32,0.6) 60%, rgba(13,16,32,0.95) 100%)',
                }}
              />

              {/* JERSEY NUMBER */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(13,16,32,0.7)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
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

              {/* ALERT DOT */}
              {isFlagged && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#F39C12',
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
                  padding: '10px 12px',
                  zIndex: 2,
                }}
              >
                {/* Player name */}
                <div
                  style={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {player.firstName} {player.lastName}
                </div>

                {/* Position */}
                <div style={{ color: '#9DA2B3', fontSize: 11, marginTop: 2 }}>
                  {position}
                </div>

                {/* Score row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginTop: 6,
                  }}
                >
                  {/* Composite score */}
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: scoreColor,
                      textShadow: `0 0 12px ${scoreColor}66`,
                    }}
                  >
                    {compositeScore}
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
