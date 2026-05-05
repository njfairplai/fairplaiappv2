import type { Player } from '@/lib/types'
import { scoreColor } from '@/lib/squad-season-score'

interface PlayerTokenProps {
  player: Player
  /** Composite season score (0-100). Used for the colour band + badge. */
  score: number
  /** % from left of the parent pitch. */
  x: number
  /** % from BOTTOM of the parent pitch (matches CLUSTERS.cy convention). */
  y: number
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
}

/**
 * Round token at (x, y) on the pitch. Jersey number in the centre, score
 * badge top-right, first name underneath. Border colour = score band.
 * On select: scales up + halo. On dim (filtered out): low opacity.
 */
export function PlayerToken({ player, score, x, y, selected, dimmed, onClick }: PlayerTokenProps) {
  const c = scoreColor(score)
  const size = selected ? 56 : 44
  const firstName = player.firstName

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${player.firstName} ${player.lastName}, jersey ${player.jerseyNumber}, score ${score}`}
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: `${y}%`,
        transform: 'translate(-50%, 50%)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        opacity: dimmed ? 0.35 : 1,
        filter: dimmed ? 'saturate(0.6)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
        zIndex: selected ? 3 : 1,
      }}
    >
      {/* halo when selected */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: -14,
            borderRadius: '50%',
            border: `1.5px solid ${c}`,
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* token circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#1B1550',
          border: `2.5px solid ${c}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EEE4C8',
          fontFamily: 'var(--font-display)',
          fontSize: selected ? 22 : 18,
          fontWeight: 700,
          boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
          transition: 'all 160ms ease',
        }}
      >
        {player.jerseyNumber}
      </div>
      {/* first name underneath */}
      <div
        style={{
          marginTop: 4,
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: '#fff',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          whiteSpace: 'nowrap',
        }}
      >
        {firstName}
      </div>
      {/* score badge top-right */}
      <div
        style={{
          position: 'absolute',
          top: -6,
          right: -10,
          background: c,
          color: '#0B0828',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 5px',
          borderRadius: 4,
          lineHeight: 1,
        }}
      >
        {score}
      </div>
    </button>
  )
}
