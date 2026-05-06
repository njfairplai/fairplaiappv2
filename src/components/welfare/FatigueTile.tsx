'use client'

import { Footprints, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { BRAND, TYPE } from '@/lib/constants'
import { fatigueTier, type FatigueTier } from '@/lib/parent-portal'
import type { FatigueSample } from '@/lib/types'

/**
 * FatigueTile — single "fatigue level" tile used on:
 *   - Coach match drill-in V3PlayerDetail panel (next to composite arc)
 *   - Coach player profile WorkloadSection (replaces line chart)
 *   - Parent /development WelfareCards (replaces line chart)
 *
 * Composition:
 *   - Big number (the load 0–100, display type)
 *   - Tier label (LOW / MOD / HIGH, mono caps)
 *   - Trend chip (↑ / ↓ / —) vs the prior sample
 *
 * No chart. The number IS the metric — that's the user's locked direction.
 *
 * `samples` should be sorted oldest → newest. Pass at least 2 entries to
 * get a trend; with 0 samples the tile renders a "—" placeholder.
 */

export type FatigueTileSize = 'compact' | 'tile' | 'wide'

interface FatigueTileProps {
  /** Sorted oldest → newest. Last item is the current sample. */
  samples: FatigueSample[]
  size?: FatigueTileSize
}

export function FatigueTile({ samples, size = 'tile' }: FatigueTileProps) {
  const latest = samples[samples.length - 1]
  const prior = samples.length >= 2 ? samples[samples.length - 2] : null

  if (!latest) return <FatigueTilePlaceholder size={size} />

  const tier = fatigueTier(latest.load)
  const delta = prior ? latest.load - prior.load : 0
  const color = tierColor(tier)

  const numberSize = size === 'compact' ? 28 : size === 'wide' ? 48 : 38
  const padding = size === 'compact' ? '10px 12px' : '14px 16px'
  const minHeight = size === 'compact' ? 'auto' : 96

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: size === 'wide' ? 'row' : 'column',
        alignItems: size === 'wide' ? 'center' : 'flex-start',
        gap: size === 'wide' ? 14 : 4,
        padding,
        minHeight,
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        fontFamily: TYPE.body,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Footprints size={size === 'wide' ? 14 : 12} color={BRAND.indigoMute} />
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9.5,
            letterSpacing: '0.22em',
            color: BRAND.indigoMute,
            fontWeight: 700,
          }}
        >
          FATIGUE
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginTop: size === 'wide' ? 0 : 2,
          flex: size === 'wide' ? 1 : undefined,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: TYPE.display,
            fontSize: numberSize,
            color,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {latest.load}
        </span>
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: size === 'compact' ? 9.5 : 10.5,
            letterSpacing: '0.22em',
            color,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {tierLabel(tier)}
        </span>
        {prior && (
          <TrendChip delta={delta} color={color} compact={size === 'compact'} />
        )}
      </div>
    </div>
  )
}

function FatigueTilePlaceholder({ size }: { size: FatigueTileSize }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: size === 'compact' ? '10px 12px' : '14px 16px',
        minHeight: size === 'compact' ? 'auto' : 96,
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 10,
        fontFamily: TYPE.body,
      }}
    >
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9.5,
          letterSpacing: '0.22em',
          color: BRAND.indigoMute,
          fontWeight: 700,
        }}
      >
        FATIGUE
      </span>
      <span
        style={{
          fontFamily: TYPE.body,
          fontSize: 12.5,
          color: BRAND.indigoMute,
        }}
      >
        No samples yet.
      </span>
    </div>
  )
}

function TrendChip({ delta, color, compact }: { delta: number; color: string; compact: boolean }) {
  const isFlat = Math.abs(delta) < 3
  const Icon = isFlat ? Minus : delta > 0 ? ArrowUp : ArrowDown
  const sign = delta > 0 ? '+' : ''
  const text = isFlat ? 'STEADY' : `${sign}${Math.round(delta)} VS LAST`
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        marginLeft: 4,
        padding: '2px 6px',
        background: `${color}1A`,
        border: `1px solid ${color}55`,
        borderRadius: 4,
      }}
    >
      <Icon size={compact ? 9 : 10} color={color} />
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: compact ? 8.5 : 9.5,
          letterSpacing: '0.14em',
          color,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </span>
  )
}

function tierColor(tier: FatigueTier): string {
  if (tier === 'high') return BRAND.coral
  if (tier === 'moderate') return '#E89A45' // amber
  return BRAND.indigo
}

function tierLabel(tier: FatigueTier): string {
  if (tier === 'high') return 'HIGH'
  if (tier === 'moderate') return 'MOD'
  return 'LOW'
}
