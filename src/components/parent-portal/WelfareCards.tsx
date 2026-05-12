'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  getFatigueSamplesForPlayer,
  getOpenPPEFlagsForPlayer,
} from '@/lib/parent-portal'
import type { FatigueSample, PPEFlag } from '@/lib/types'
import { BRAND } from '@/lib/constants'
import { FatigueTile } from '@/components/welfare/FatigueTile'

/**
 * Welfare cards for the parent /development page.
 *
 *   - Workload (fatigue trend) — small line chart with the latest tier pill
 *   - Gear notes               — open PPE flag list with a "What this means"
 *                                helper
 *
 * Both cards auto-hide if there's no relevant data, so the page collapses
 * gracefully when a kid has nothing flagged.
 */

interface WelfareCardsProps {
  playerId: string
  /** Anchor for the Gear card so /parent/hub?#gear scrolls into view
   *  when a parent taps a PPE notification (system update item). */
  gearAnchor?: string
}

export function WelfareCards({ playerId, gearAnchor = 'gear' }: WelfareCardsProps) {
  const [samples, setSamples] = useState<FatigueSample[]>([])
  const [openPpe, setOpenPpe] = useState<PPEFlag[]>([])

  useEffect(() => {
    setSamples(getFatigueSamplesForPlayer(playerId))
    setOpenPpe(getOpenPPEFlagsForPlayer(playerId))
  }, [playerId])

  const sortedSamples = [...samples].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sortedSamples[sortedSamples.length - 1]

  if (!latest && openPpe.length === 0) return null

  return (
    <>
      {latest && (
        <section className="px-4 pt-5">
          <ParentCard label="WORKLOAD">
            <FatigueTile samples={sortedSamples} size="wide" />
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Stat label="Top sprint" value={`${latest.topSprintKmh.toFixed(1)} km/h`} />
              <Stat label="Sprints" value={`${latest.sprintCount}`} />
              <Stat label="Dist / min" value={`${Math.round(latest.distancePerMinute)} m`} />
            </div>
          </ParentCard>
        </section>
      )}
      {openPpe.length > 0 && (
        <section id={gearAnchor} className="px-4 pt-5">
          <ParentCard label="GEAR NOTES">
            <div className="flex flex-col gap-2">
              {openPpe.map(flag => (
                <div
                  key={flag.id}
                  className="flex gap-2.5 items-start p-2.5 bg-brand-sand border border-brand-line rounded-lg"
                >
                  <AlertTriangle size={14} color={BRAND.coral} className="shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-satoshi text-[13px] font-semibold text-brand-indigo capitalize">
                      {flag.gearType.replace('_', ' ')}
                    </div>
                    <div className="font-satoshi text-[12.5px] text-brand-indigo-mid mt-0.5">
                      {flag.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ParentCard>
        </section>
      )}
    </>
  )
}

function ParentCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-brand-paper border border-brand-line rounded-xl px-3.5 pt-3.5 pb-4">
      <div className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold mb-2.5">
        {label}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-sand border border-brand-line rounded-lg p-2 text-center">
      <div className="font-clash text-[15px] font-bold text-brand-indigo tracking-[-0.01em]">
        {value}
      </div>
      <div className="font-fragment text-[9px] tracking-[0.16em] text-brand-indigo-mute mt-1 font-bold">
        {label.toUpperCase()}
      </div>
    </div>
  )
}

