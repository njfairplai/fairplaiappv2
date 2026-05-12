'use client'

import { Footprints, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { BRAND } from '@/lib/constants'
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
  const isWide = size === 'wide'
  const isCompact = size === 'compact'

  return (
    <div
      className={`flex bg-brand-paper border border-brand-line rounded-[10px] font-satoshi ${
        isWide ? 'flex-row items-center gap-3.5' : 'flex-col items-start gap-1'
      } ${isCompact ? 'px-3 py-2.5' : 'px-4 py-3.5'} ${isCompact ? '' : 'min-h-24'}`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="inline-flex items-center gap-1.5">
        <Footprints size={isWide ? 14 : 12} color={BRAND.indigoMute} />
        <span className="font-fragment text-[9.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
          FATIGUE
        </span>
      </div>
      <div
        className={`flex items-baseline gap-2 min-w-0 ${isWide ? 'mt-0 flex-1' : 'mt-0.5'}`}
      >
        <span
          className="font-clash tracking-[-0.02em] leading-none"
          style={{ fontSize: numberSize, color }}
        >
          {latest.load}
        </span>
        <span
          className={`font-fragment tracking-[0.22em] font-bold uppercase ${
            isCompact ? 'text-[9.5px]' : 'text-[10.5px]'
          }`}
          style={{ color }}
        >
          {tierLabel(tier)}
        </span>
        {prior && (
          <TrendChip delta={delta} color={color} compact={isCompact} />
        )}
      </div>
    </div>
  )
}

function FatigueTilePlaceholder({ size }: { size: FatigueTileSize }) {
  const isCompact = size === 'compact'
  return (
    <div
      className={`flex flex-col gap-1 bg-brand-paper border border-brand-line rounded-[10px] font-satoshi ${
        isCompact ? 'px-3 py-2.5' : 'px-4 py-3.5 min-h-24'
      }`}
    >
      <span className="font-fragment text-[9.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
        FATIGUE
      </span>
      <span className="font-satoshi text-[12.5px] text-brand-indigo-mute">
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
      className="inline-flex items-center gap-[3px] ml-1 px-1.5 py-[2px] rounded"
      style={{
        background: `${color}1A`,
        border: `1px solid ${color}55`,
      }}
    >
      <Icon size={compact ? 9 : 10} color={color} />
      <span
        className={`font-fragment tracking-[0.14em] font-bold whitespace-nowrap ${
          compact ? 'text-[8.5px]' : 'text-[9.5px]'
        }`}
        style={{ color }}
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
