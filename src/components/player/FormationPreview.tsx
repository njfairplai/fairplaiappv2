'use client'

import { FORMATIONS } from '@/lib/formations'
import { players } from '@/lib/mockData'
import { playerTokens } from '@/styles/player-tokens'

interface FormationPreviewProps {
  formationId: string
  lineup: Record<number, string>
  highlightPlayerId: string
  compact?: boolean
}

export default function FormationPreview({ formationId, lineup, highlightPlayerId, compact }: FormationPreviewProps) {
  // Find formation across all squad sizes
  const allFormations = Object.values(FORMATIONS).flat()
  const formation = allFormations.find(f => f.id === formationId)
  if (!formation) return null

  const positions = formation.positions
  const highlightIdx = Object.entries(lineup).find(([, pid]) => pid === highlightPlayerId)?.[0]
  const highlightPos = highlightIdx !== undefined ? positions[Number(highlightIdx)] : null

  return (
    <div>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: compact ? '3 / 2' : '2 / 3',
        background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 30%, #388E3C 50%, #2E7D32 70%, #1B5E20 100%)',
        borderRadius: compact ? 10 : 14,
        overflow: 'hidden',
        border: '2px solid #1B5E20',
      }}>
        {/* Pitch markings */}
        <div style={{ position: 'absolute', inset: '3%', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: '3%', right: '3%', top: '50%', height: 2, background: 'rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '22%', aspectRatio: '1', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', transform: 'translate(-50%,-50%)' }} />
        {!compact && (
          <>
            <div style={{ position: 'absolute', bottom: '3%', left: '25%', right: '25%', height: '14%', border: '2px solid rgba(255,255,255,0.3)', borderBottom: 'none' }} />
            <div style={{ position: 'absolute', top: '3%', left: '25%', right: '25%', height: '14%', border: '2px solid rgba(255,255,255,0.3)', borderTop: 'none' }} />
          </>
        )}

        {/* Grass stripes */}
        {[20, 40, 60, 80].map(y => (
          <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: '10%', background: 'rgba(255,255,255,0.03)' }} />
        ))}

        {/* Position markers */}
        {positions.map((pos, idx) => {
          const playerId = lineup[idx]
          const player = playerId ? players.find(p => p.id === playerId) : null
          const isHighlighted = playerId === highlightPlayerId
          const dotSize = compact ? (isHighlighted ? 32 : 24) : (isHighlighted ? 44 : 36)

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${100 - pos.y}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: compact ? 0 : 2,
                zIndex: isHighlighted ? 10 : 1,
              }}
            >
              <div style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                background: isHighlighted ? playerTokens.primary : player ? '#fff' : 'rgba(255,255,255,0.2)',
                border: `2px solid ${isHighlighted ? playerTokens.primary : player ? '#fff' : 'rgba(255,255,255,0.5)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isHighlighted
                  ? `0 0 0 4px rgba(0,201,167,0.4), ${playerTokens.shadowGlow}`
                  : '0 2px 6px rgba(0,0,0,0.3)',
                animation: isHighlighted ? 'playerPulse 2s ease-in-out infinite' : undefined,
              }}>
                {player ? (
                  <span style={{
                    fontSize: compact ? (isHighlighted ? 11 : 9) : (isHighlighted ? 16 : 14),
                    fontWeight: 800,
                    color: isHighlighted ? '#fff' : '#1B1650',
                  }}>
                    {player.jerseyNumber}
                  </span>
                ) : (
                  <span style={{ fontSize: compact ? 7 : 10, fontWeight: 700, color: '#fff' }}>{pos.role}</span>
                )}
              </div>
              {!compact && (
                <span style={{
                  fontSize: isHighlighted ? 10 : 8,
                  fontWeight: isHighlighted ? 800 : 700,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  maxWidth: 70,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {player ? player.firstName : pos.role}
                </span>
              )}
            </div>
          )
        })}

        {/* Pulse animation */}
        <style>{`
          @keyframes playerPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.08); }
          }
        `}</style>
      </div>

      {/* Position callout */}
      {highlightPos && (
        <div style={{
          marginTop: compact ? 6 : 10,
          textAlign: 'center',
          fontSize: compact ? 12 : 14,
          fontWeight: 700,
          color: playerTokens.primary,
        }}>
          You&apos;re playing <span style={{ fontWeight: 800 }}>{highlightPos.role}</span>
        </div>
      )}
    </div>
  )
}
