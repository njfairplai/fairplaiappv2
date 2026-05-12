'use client'

import { BRAND } from '@/lib/constants'
import type { MatchCenterHighlight } from '@/lib/match-center'
import { cn } from '@/lib/cn'
import { mcButtons } from './atoms'

/* Single tagged-clip card. Used in two places:
 *   - State 5 ready pane: horizontal scrolling row, fixed 280px width
 *   - Highlights surface: compact full-width column
 *
 * All three controls (play / share / flag) emit callbacks; the parent
 * owns the modal + share-menu state so multiple cards can share one
 * modal instance and the flagged state stays consistent. */

/* Card badge colour pairs per event type. The five categories carry
 * distinct visual weight — GOAL is the celebratory yellow, DEF carries
 * coral urgency, the rest sit in the indigo family. Locked to the
 * five tagged event types. */
const EVENT_TOKENS: Record<
  MatchCenterHighlight['ev'],
  { bg: string; ink: string }
> = {
  GOAL: { bg: BRAND.yellow,         ink: BRAND.indigo },
  SHOT: { bg: 'rgba(27,21,80,0.7)', ink: BRAND.sand   },
  KEY:  { bg: BRAND.indigo,         ink: BRAND.sand   },
  DEF:  { bg: BRAND.coral,          ink: BRAND.sand   },
  SAVE: { bg: BRAND.indigoMid,      ink: BRAND.sand   },
}

interface HighlightCardProps {
  h: MatchCenterHighlight
  compact?: boolean
  flagged?: boolean
  onPlay?: () => void
  onShare?: () => void
  onFlagToggle?: () => void
}

export function HighlightCard({
  h,
  compact = false,
  flagged = false,
  onPlay,
  onShare,
  onFlagToggle,
}: HighlightCardProps) {
  const tokens = EVENT_TOKENS[h.ev]
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-[4px] border border-brand-line bg-white px-3 py-2.5',
        compact ? 'w-full min-w-0' : 'w-[280px] min-w-[280px]',
      )}
    >
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play clip · ${h.ev} · ${h.player}`}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-brand-indigo pl-0.5 text-xs text-brand-sand"
      >
        ▶
      </button>
      <span
        className="shrink-0 rounded-[2px] px-[5px] py-[3px] font-fragment text-[8.5px] font-bold tracking-[0.18em]"
        style={{ background: tokens.bg, color: tokens.ink }}
      >
        {h.ev}
      </span>
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-xs font-semibold text-brand-indigo">
          {h.player}{' '}
          <span className="font-medium text-brand-indigo-mute">#{h.num}</span>
        </div>
        <div className="mt-px font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">
          {h.minute}&apos; · {h.dur}S
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onShare}
          style={mcButtons.iconGhost}
          aria-label="Share clip"
        >
          ↗
        </button>
        <button
          type="button"
          onClick={onFlagToggle}
          aria-label={flagged ? 'Unflag clip' : 'Flag clip for follow-up'}
          aria-pressed={flagged}
          style={{
            ...mcButtons.iconGhost,
            background: flagged ? BRAND.indigo : 'transparent',
            color: flagged ? BRAND.sand : BRAND.indigoMute,
            borderColor: flagged ? BRAND.indigo : BRAND.line,
          }}
        >
          ⚑
        </button>
      </div>
    </div>
  )
}
