'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  getFatigueSamplesForPlayer,
  getOpenPPEFlagsForPlayer,
} from '@/lib/parent-portal'
import type { FatigueSample, PPEFlag } from '@/lib/types'
import { BRAND, TYPE } from '@/lib/constants'
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
        <section style={{ padding: '20px 16px 0' }}>
          <ParentCard label="WORKLOAD">
            <FatigueTile samples={sortedSamples} size="wide" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
                marginTop: 12,
              }}
            >
              <Stat label="Top sprint" value={`${latest.topSprintKmh.toFixed(1)} km/h`} />
              <Stat label="Sprints" value={`${latest.sprintCount}`} />
              <Stat label="Dist / min" value={`${Math.round(latest.distancePerMinute)} m`} />
            </div>
          </ParentCard>
        </section>
      )}
      {openPpe.length > 0 && (
        <section id={gearAnchor} style={{ padding: '20px 16px 0' }}>
          <ParentCard label="GEAR NOTES">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openPpe.map(flag => (
                <div
                  key={flag.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: 10,
                    background: 'var(--brand-sand)',
                    border: `1px solid var(--brand-line)`,
                    borderRadius: 8,
                  }}
                >
                  <AlertTriangle size={14} color={BRAND.coral} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: TYPE.body,
                        fontSize: 13,
                        fontWeight: 600,
                        color: BRAND.indigo,
                        textTransform: 'capitalize',
                      }}
                    >
                      {flag.gearType.replace('_', ' ')}
                    </div>
                    <div
                      style={{
                        fontFamily: TYPE.body,
                        fontSize: 12.5,
                        color: BRAND.indigoMid,
                        marginTop: 2,
                      }}
                    >
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
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: '14px 14px 16px',
      }}
    >
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: BRAND.indigoMute,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        border: '1px solid var(--brand-line)',
        borderRadius: 8,
        padding: '8px 8px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: TYPE.display, fontSize: 15, fontWeight: 700, color: BRAND.indigo, letterSpacing: '-0.01em' }}>
        {value}
      </div>
      <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.16em', color: BRAND.indigoMute, marginTop: 4, fontWeight: 700 }}>
        {label.toUpperCase()}
      </div>
    </div>
  )
}

