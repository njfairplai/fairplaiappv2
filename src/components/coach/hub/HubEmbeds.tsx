'use client'

import type { ReactNode } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { HighlightEvent } from '@/lib/match-center'

/* Embedded primitives — used inline inside Mikel's response prose
 * on the Coach's Hub. Per the Claude Design handoff, the response
 * card is composed by Mikel from these chips: composite scores,
 * player references, and clip cards all embed naturally inside
 * sentence flow.
 *
 * MComposite — score-arc + label, fits inside a sentence
 * MPlayer    — small avatar + name + jersey, click target into
 *              the player profile
 * MClipEmbed — block-level clip card, sits between paragraphs */

interface MCompositeProps {
  value: number
  label: string
  /** Background colour of the score circle. Yellow for hero scores,
   *  indigo (default) for ordinary references. */
  color?: string
  big?: boolean
}

export function MComposite({
  value,
  label,
  color = BRAND.indigo,
  big = false,
}: MCompositeProps) {
  const ink = color === BRAND.yellow ? BRAND.indigo : BRAND.sand
  return (
    <span className="mx-0.5 inline-flex items-center gap-1.5 rounded-[4px] border border-brand-line bg-brand-paper py-[3px] pl-1 pr-2 align-middle">
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-clash font-bold leading-none tracking-[-0.02em]',
          big ? 'h-7 w-7 text-[13px]' : 'h-[22px] w-[22px] text-[11px]',
        )}
        style={{ background: color, color: ink }}
      >
        {value}
      </span>
      <span className="font-satoshi text-[12.5px] font-semibold text-brand-indigo">
        {label}
      </span>
    </span>
  )
}

interface MPlayerProps {
  num: number
  name: string
  motm?: boolean
  accent?: string
  onClick?: () => void
}

export function MPlayer({
  num,
  name,
  motm = false,
  accent = BRAND.indigo,
  onClick,
}: MPlayerProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'mx-0.5 inline-flex items-center gap-[5px] rounded-[4px] border py-0.5 pl-[3px] pr-2 align-middle',
        motm ? 'border-brand-yellow bg-brand-yellow-soft' : 'border-brand-line bg-brand-paper',
        onClick ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <span
        className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full font-fragment text-[9.5px] font-bold leading-none tracking-[0.02em] text-brand-sand"
        style={{ background: accent }}
      >
        {num}
      </span>
      <span className="font-satoshi text-[12.5px] font-semibold text-brand-indigo">
        {motm && <span className="mr-[3px] text-brand-indigo">★</span>}
        {name}
      </span>
    </span>
  )
}

/* Event badge tokens mirror the Highlights surface — same five tagged
 * categories. Defined here too rather than imported to avoid a circular
 * dependency on the HighlightCard which lives in match-center/. */
const EMBED_EVENT_TOKENS: Record<HighlightEvent, { bg: string; ink: string }> = {
  GOAL: { bg: BRAND.yellow, ink: BRAND.indigo },
  SHOT: { bg: 'rgba(27,21,80,0.7)', ink: BRAND.sand },
  KEY: { bg: BRAND.indigo, ink: BRAND.sand },
  DEF: { bg: BRAND.coral, ink: BRAND.sand },
  SAVE: { bg: BRAND.indigoMid, ink: BRAND.sand },
}

interface MClipEmbedProps {
  ev: HighlightEvent
  player: string
  num: number
  /** Minute of the match. */
  minute: number
  /** Clip duration in seconds. */
  dur: number
  headline: string
  /** Match attribution line, e.g. "VS AL WASL · 24 FEB" */
  opp: string
  onPlay?: () => void
}

export function MClipEmbed({
  ev,
  player,
  num,
  minute,
  dur,
  headline,
  opp,
  onPlay,
}: MClipEmbedProps) {
  const tokens = EMBED_EVENT_TOKENS[ev]
  return (
    <div className="my-2 flex items-center gap-2.5 rounded-[4px] border border-brand-line bg-white px-3 py-2.5">
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play clip · ${ev} · ${player}`}
        className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-brand-indigo pl-0.5 text-[11px] text-brand-sand"
      >
        ▶
      </button>
      <span
        className="shrink-0 rounded-[2px] px-[5px] py-[3px] font-fragment text-[8.5px] font-bold tracking-[0.18em]"
        style={{ background: tokens.bg, color: tokens.ink }}
      >
        {ev}
      </span>
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-satoshi text-[12.5px] font-semibold text-brand-indigo">
          {headline}
        </div>
        <div className="mt-0.5 font-fragment text-[9.5px] font-bold tracking-[0.16em] text-brand-indigo-mute">
          {player} #{num} · {minute}&apos; · {dur}S · {opp}
        </div>
      </div>
    </div>
  )
}

/** Mikel's avatar glyph — small indigo square with a yellow "M".
 *  Re-used in the greeting eyebrow and the response card byline.
 *  `pulse=true` adds a slow yellow-glow halo (hubMikelPulse keyframe)
 *  so the glyph reads as alive rather than static. */
export function MikelGlyph({
  size = 18,
  pulse = false,
}: {
  size?: number
  pulse?: boolean
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[4px] bg-brand-indigo font-fragment font-bold text-brand-yellow"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.6,
        animation: pulse ? 'hubMikelPulse 2.4s ease-in-out infinite' : undefined,
      }}
    >
      M
    </span>
  )
}

/** Brand-chrome ghost-button shared across hub buttons. */
export const hubGhostBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: BRAND.indigoMute,
  fontFamily: TYPE.mono,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.16em',
  cursor: 'pointer',
  textTransform: 'uppercase',
  padding: '4px 6px',
}

export const hubPrimaryBtnStyle: React.CSSProperties = {
  background: BRAND.indigo,
  color: BRAND.sand,
  border: 'none',
  padding: '7px 14px',
  borderRadius: 4,
  cursor: 'pointer',
  fontFamily: TYPE.mono,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.16em',
}

/** Wrapper for the hub's content so it can render scoped to the brand
 *  surface even when the page chrome doesn't (yet) opt into the
 *  branded route set. */
export function HubFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-brand-sand font-satoshi text-brand-indigo">
      {children}
    </div>
  )
}
