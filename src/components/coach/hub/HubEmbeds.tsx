'use client'

import type { ReactNode } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
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
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 4,
        padding: '3px 8px 3px 4px',
        verticalAlign: 'middle',
        margin: '0 2px',
      }}
    >
      <span
        style={{
          width: big ? 28 : 22,
          height: big ? 28 : 22,
          borderRadius: '50%',
          background: color,
          color: ink,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: TYPE.display,
          fontSize: big ? 13 : 11,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: TYPE.body,
          fontSize: 12.5,
          fontWeight: 600,
          color: BRAND.indigo,
        }}
      >
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: motm ? BRAND.yellowSoft : BRAND.paper,
        border: `1px solid ${motm ? BRAND.yellow : BRAND.line}`,
        borderRadius: 4,
        padding: '2px 8px 2px 3px',
        verticalAlign: 'middle',
        margin: '0 2px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: accent,
          color: BRAND.sand,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: TYPE.mono,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: TYPE.body,
          fontSize: 12.5,
          fontWeight: 600,
          color: BRAND.indigo,
        }}
      >
        {motm && <span style={{ color: BRAND.indigo, marginRight: 3 }}>★</span>}
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#fff',
        border: `1px solid ${BRAND.line}`,
        borderRadius: 4,
        padding: '10px 12px',
        margin: '8px 0',
      }}
    >
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play clip · ${ev} · ${player}`}
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          flexShrink: 0,
          background: BRAND.indigo,
          color: BRAND.sand,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
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
        {ev}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 12.5,
            fontWeight: 600,
            color: BRAND.indigo,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9.5,
            letterSpacing: '0.16em',
            color: BRAND.indigoMute,
            fontWeight: 700,
            marginTop: 2,
          }}
        >
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
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: BRAND.indigo,
        color: BRAND.yellow,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: TYPE.mono,
        fontSize: size * 0.6,
        fontWeight: 700,
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
    <div
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: BRAND.indigo,
        fontFamily: TYPE.body,
      }}
    >
      {children}
    </div>
  )
}
