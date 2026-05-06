'use client'

import type { CSSProperties, ReactNode } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterStatus } from '@/lib/match-center'

/* Shared atoms for the Match Center surface. Kept in one file so the
 * design vocabulary (eyebrow → display → status pill → card) is
 * legible at a glance and doesn't fragment across micro-files. */

export function MEyebrow({
  children,
  color = BRAND.indigoMute,
  style = {},
}: {
  children: ReactNode
  color?: string
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        fontFamily: TYPE.mono,
        fontSize: 10.5,
        letterSpacing: '0.22em',
        color,
        fontWeight: 700,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function MDisplay({
  children,
  size = 44,
  color = BRAND.indigo,
  style = {},
}: {
  children: ReactNode
  size?: number
  color?: string
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        fontFamily: TYPE.display,
        fontSize: size,
        lineHeight: 0.94,
        letterSpacing: '-0.02em',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

const STATUS_TOKENS: Record<
  MatchCenterStatus,
  { color: string; bg: string; label: string }
> = {
  prep:          { color: BRAND.coral,      bg: 'rgba(235,77,109,0.14)', label: 'PREP NEEDED'  },
  processing:    { color: BRAND.indigoMute, bg: BRAND.lineSoft,          label: 'PROCESSING'   },
  ready:         { color: BRAND.indigo,     bg: BRAND.yellowSoft,        label: 'READY'        },
  drills:        { color: BRAND.indigo,     bg: BRAND.sandDeep,          label: 'DRILLS'       },
  upcoming:      { color: BRAND.indigoMute, bg: 'transparent',           label: 'UPCOMING'     },
  uncategorised: { color: BRAND.coral,      bg: 'rgba(235,77,109,0.14)', label: 'CATEGORISE'   },
}

export function MStatusPill({
  status,
  animated = false,
}: {
  status: MatchCenterStatus
  animated?: boolean
}) {
  const s = STATUS_TOKENS[status]
  if (!s) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: s.bg,
        color: s.color,
        fontFamily: TYPE.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.18em',
        padding: '3px 7px',
        borderRadius: 3,
        border: status === 'upcoming' ? `1px dashed ${BRAND.line}` : 'none',
      }}
    >
      {animated && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: s.color,
            animation: 'mcPulse 1.4s ease-in-out infinite',
          }}
        />
      )}
      {s.label}
    </span>
  )
}

export function MKindChip({ kind }: { kind: 'training' | 'drills' }) {
  if (kind === 'training') {
    return (
      <span
        style={{
          background: BRAND.yellow,
          color: BRAND.indigo,
          fontFamily: TYPE.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.18em',
          padding: '2px 5px',
          borderRadius: 2,
        }}
      >
        TRAINING
      </span>
    )
  }
  return (
    <span
      style={{
        background: 'transparent',
        color: BRAND.indigoMute,
        border: `1px solid ${BRAND.line}`,
        fontFamily: TYPE.mono,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: '0.18em',
        padding: '2px 5px',
        borderRadius: 2,
      }}
    >
      DRILLS
    </span>
  )
}

export function Card({
  children,
  style = {},
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 6,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * 16:9 indigo "video footage" placeholder used across categorise / drills /
 * processing / ready states. The play button is visible only when the clip
 * is actually playable (no play-button on processing / categorise).
 */
export function VideoBlock({
  height = 360,
  label = 'MATCH FOOTAGE',
  sub = '',
  playable = true,
}: {
  height?: number
  label?: string
  sub?: string
  playable?: boolean
}) {
  return (
    <div
      style={{
        width: '100%',
        height,
        background: '#0F0A36',
        position: 'relative',
        borderRadius: 6,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 24px)',
      }}
    >
      {playable && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: BRAND.yellow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          <span
            style={{
              fontFamily: TYPE.display,
              fontSize: 22,
              color: BRAND.indigo,
              marginLeft: 4,
            }}
          >
            ▶
          </span>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: 'rgba(238,228,200,0.55)',
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            fontFamily: TYPE.mono,
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'rgba(238,228,200,0.55)',
            fontWeight: 700,
          }}
        >
          {sub}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 14,
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'rgba(238,228,200,0.55)',
        }}
      >
        16:9
      </div>
    </div>
  )
}

/**
 * Compact circular score arc with the value rendered in the centre. Used
 * inside SessionFrame's body. The existing `<ScoreArc>` in /components/charts
 * doesn't render text; this is a Match-Center-flavoured variant.
 */
export function MatchCenterScoreArc({
  value,
  size = 50,
  stroke = 4.5,
  color = BRAND.indigo,
  ring = BRAND.lineSoft,
  textColor = BRAND.indigo,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  ring?: string
  textColor?: string
}) {
  const r = (size - stroke * 2) / 2 - 1
  const C = 2 * Math.PI * r
  const offset = C * (1 - Math.min(100, Math.max(0, value)) / 100)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ring}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: `${size / 2}px ${size / 2}px`,
            strokeDasharray: C,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: TYPE.display,
          fontSize: size * 0.42,
          letterSpacing: '-0.02em',
          color: textColor,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export function MiniAvatar({ num }: { num: number }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: BRAND.indigo,
        color: BRAND.sand,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: TYPE.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
        flexShrink: 0,
      }}
    >
      {num}
    </div>
  )
}

/** Shared button styles used across Match Center states. */
export const mcButtons = {
  text: {
    background: 'transparent',
    border: 'none',
    color: BRAND.indigoMute,
    fontFamily: TYPE.mono,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.16em',
    cursor: 'pointer',
    textTransform: 'uppercase',
  } as CSSProperties,
  ghost: {
    background: 'transparent',
    border: `1px solid ${BRAND.indigo}`,
    color: BRAND.indigo,
    padding: '8px 14px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: TYPE.mono,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  } as CSSProperties,
  primary: {
    background: BRAND.indigo,
    color: BRAND.sand,
    border: 'none',
    padding: '9px 18px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: TYPE.mono,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  } as CSSProperties,
  iconGhost: {
    width: 24,
    height: 24,
    padding: 0,
    background: 'transparent',
    border: `1px solid ${BRAND.line}`,
    color: BRAND.indigoMute,
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 11,
    lineHeight: 1,
  } as CSSProperties,
}
