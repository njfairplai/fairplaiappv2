'use client'

import type { CSSProperties, ReactNode } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterStatus } from '@/lib/match-center'
import { cn } from '@/lib/cn'

/* Shared atoms for the Match Center surface. Kept in one file so the
 * design vocabulary (eyebrow → display → status pill → card) is
 * legible at a glance and doesn't fragment across micro-files. */

export function MEyebrow({
  children,
  color,
  style,
  className,
}: {
  children: ReactNode
  /** Override the default `text-brand-indigo-mute` color. Pass any CSS colour string. */
  color?: string
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      style={color ? { color, ...style } : style}
      className={cn(
        'font-fragment text-[10.5px] font-bold uppercase tracking-[0.22em]',
        !color && 'text-brand-indigo-mute',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function MDisplay({
  children,
  size = 44,
  color,
  style,
  className,
}: {
  children: ReactNode
  size?: number
  /** Override the default `text-brand-indigo` color. */
  color?: string
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      style={{ fontSize: size, ...(color ? { color } : {}), ...style }}
      className={cn(
        'font-clash leading-[0.94] tracking-[-0.02em]',
        !color && 'text-brand-indigo',
        className,
      )}
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
      // Status-dependent colours stay inline because they're computed per
      // status from the STATUS_TOKENS map (palette-independent semantic
      // tokens — prep is always coral, drills always sand-deep, etc).
      style={{ background: s.bg, color: s.color }}
      className={cn(
        'inline-flex items-center gap-[5px] rounded-[3px] px-[7px] py-[3px]',
        'font-fragment text-[9px] font-bold tracking-[0.18em]',
        status === 'upcoming' && 'border border-dashed border-brand-line',
      )}
    >
      {animated && (
        <span
          // Color follows the parent text color via currentColor; size + animation
          // are the only fixed visual aspects.
          style={{ background: s.color }}
          className="block h-1.5 w-1.5 rounded-full [animation:mcPulse_1.4s_ease-in-out_infinite]"
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
        className={cn(
          'bg-brand-yellow text-brand-indigo',
          'rounded-[2px] px-[5px] py-0.5',
          'font-fragment text-[8.5px] font-bold tracking-[0.18em]',
        )}
      >
        TRAINING
      </span>
    )
  }
  return (
    <span
      className={cn(
        'bg-transparent text-brand-indigo-mute border border-brand-line',
        'rounded-[2px] px-[5px] py-0.5',
        'font-fragment text-[8.5px] font-bold tracking-[0.18em]',
      )}
    >
      DRILLS
    </span>
  )
}

export function Card({
  children,
  style,
  className,
}: {
  children: ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      style={style}
      className={cn(
        'bg-brand-paper border border-brand-line rounded-md',
        className,
      )}
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
      // Height is a caller-supplied numeric value, and the diagonal-stripe
      // background pattern uses a fixed repeating gradient — both kept
      // inline because Tailwind has no clean equivalent.
      style={{
        height,
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 24px)',
      }}
      className="relative w-full overflow-hidden rounded-md flex items-center justify-center bg-[#0F0A36]"
    >
      {playable && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
          <span className="ml-1 font-clash text-[22px] text-brand-indigo">▶</span>
        </div>
      )}
      <div
        className={cn(
          'absolute top-3 left-3.5',
          'font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-sand/55',
        )}
      >
        {label}
      </div>
      {sub && (
        <div
          className={cn(
            'absolute bottom-3 left-3.5',
            'font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-sand/55',
          )}
        >
          {sub}
        </div>
      )}
      <div
        className={cn(
          'absolute bottom-3 right-3.5',
          'font-fragment text-[10px] tracking-[0.18em] text-brand-sand/55',
        )}
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
    <div className="relative" style={{ width: size, height: size }}>
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
          // Transform + stroke-dash values are computed from size/value — kept inline.
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: `${size / 2}px ${size / 2}px`,
            strokeDasharray: C,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div
        // fontSize scales with `size` prop — kept inline.
        style={{ fontSize: size * 0.42, color: textColor }}
        className="absolute inset-0 flex items-center justify-center font-clash leading-none tracking-[-0.02em]"
      >
        {value}
      </div>
    </div>
  )
}

export function MiniAvatar({ num }: { num: number }) {
  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
        'bg-brand-indigo text-brand-sand',
        'font-fragment text-[10px] font-bold tracking-[0.04em]',
      )}
    >
      {num}
    </div>
  )
}

/** Shared button styles used across Match Center states.
 *
 * Kept as `CSSProperties` objects (not class strings) because every
 * consumer spreads them via `<button style={mcButtons.primary}>` rather
 * than composing via className. Converting to class strings would
 * require touching every caller — out of scope for this pass. */
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
