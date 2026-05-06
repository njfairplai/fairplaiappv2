'use client'

import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterHighlight } from '@/lib/match-center'
import { mcButtons } from './atoms'

/* Single tagged-clip card. Used in two places:
 *   - State 5 ready pane: horizontal scrolling row, fixed 280px width
 *   - Highlights surface: compact full-width column
 *
 * All three controls (play / share / flag) emit callbacks; the parent
 * owns the modal + share-menu state so multiple cards can share one
 * modal instance and the flagged state stays consistent. */

const EVENT_TOKENS: Record<
  MatchCenterHighlight['ev'],
  { bg: string; ink: string }
> = {
  GOAL:   { bg: BRAND.yellow,             ink: BRAND.indigo },
  KEY:    { bg: BRAND.indigo,             ink: BRAND.sand   },
  TACKLE: { bg: BRAND.coral,              ink: BRAND.sand   },
  SAVE:   { bg: BRAND.indigoMid,          ink: BRAND.sand   },
  SPRINT: { bg: 'rgba(27,21,80,0.7)',     ink: BRAND.sand   },
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
      style={{
        width: compact ? '100%' : 280,
        minWidth: compact ? 0 : 280,
        background: '#fff',
        border: `1px solid ${BRAND.line}`,
        borderRadius: 4,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play clip · ${h.ev} · ${h.player}`}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          flexShrink: 0,
          background: BRAND.indigo,
          color: BRAND.sand,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          paddingLeft: 2,
        }}
      >
        ▶
      </button>
      <span
        style={{
          background: tokens.bg,
          color: tokens.ink,
          fontFamily: TYPE.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.18em',
          padding: '3px 5px',
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        {h.ev}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 12,
            fontWeight: 600,
            color: BRAND.indigo,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {h.player}{' '}
          <span style={{ color: BRAND.indigoMute, fontWeight: 500 }}>#{h.num}</span>
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            letterSpacing: '0.16em',
            color: BRAND.indigoMute,
            fontWeight: 700,
            marginTop: 1,
          }}
        >
          {h.minute}&apos; · {h.dur}S
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
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
