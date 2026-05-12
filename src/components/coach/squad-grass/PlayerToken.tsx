import type { Player } from '@/lib/types'
import { scoreColor } from '@/lib/squad-season-score'
import type { FatigueTier } from '@/lib/parent-portal'

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
  /** Most-recent fatigue tier — drives a small dot top-left of the token
   *  so high-load players are visible at a glance from the squad view.
   *  Undefined or 'low' = no dot. */
  fatigue?: FatigueTier
  onClick?: () => void
}

/**
 * Round token at (x, y) on the pitch. Jersey number in the centre, score
 * badge top-right, first name underneath. Border colour = score band.
 * On select: scales up + halo. On dim (filtered out): low opacity.
 */
export function PlayerToken({ player, score, x, y, selected, dimmed, fatigue, onClick }: PlayerTokenProps) {
  const c = scoreColor(score)
  const size = selected ? 56 : 44
  const firstName = player.firstName
  const fatigueColor =
    fatigue === 'high' ? 'var(--brand-coral)' :
    fatigue === 'moderate' ? 'var(--brand-yellow)' : null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${player.firstName} ${player.lastName}, jersey ${player.jerseyNumber}, score ${score}`}
      className="absolute -translate-x-1/2 translate-y-1/2 bg-transparent border-0 cursor-pointer p-0 transition-[opacity,filter] duration-200"
      style={{
        left: `${x}%`,
        bottom: `${y}%`,
        opacity: dimmed ? 0.35 : 1,
        filter: dimmed ? 'saturate(0.6)' : 'none',
        zIndex: selected ? 3 : 1,
      }}
    >
      {/* halo when selected */}
      {selected && (
        <div
          className="absolute -inset-[14px] rounded-full opacity-85 pointer-events-none"
          style={{ border: `1.5px solid ${c}` }}
        />
      )}
      {/* token circle */}
      <div
        className="rounded-full bg-[#1B1550] flex items-center justify-center text-brand-sand font-clash font-bold shadow-[0_6px_14px_rgba(0,0,0,0.35)] transition-all duration-150"
        style={{
          width: size,
          height: size,
          border: `2.5px solid ${c}`,
          fontSize: selected ? 22 : 18,
        }}
      >
        {player.jerseyNumber}
      </div>
      {/* first name underneath */}
      <div
        className="mt-1 text-center font-satoshi text-[11px] text-white font-semibold tracking-[0.02em] whitespace-nowrap"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
      >
        {firstName}
      </div>
      {/* score badge top-right */}
      <div
        className="absolute -top-1.5 -right-2.5 font-fragment text-[10px] font-bold px-[5px] py-[2px] rounded leading-none"
        style={{ background: c, color: '#0B0828' }}
      >
        {score}
      </div>
      {/* fatigue dot top-left — coral (high) or yellow (moderate) */}
      {fatigueColor && (
        <div
          title={`Fatigue: ${fatigue}`}
          className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-[#1B1550] leading-none"
          style={{ background: fatigueColor }}
        />
      )}
    </button>
  )
}
