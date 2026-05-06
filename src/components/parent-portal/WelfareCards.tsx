'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Footprints } from 'lucide-react'
import {
  getFatigueSamplesForPlayer,
  getOpenPPEFlagsForPlayer,
  fatigueTier,
  type FatigueTier,
} from '@/lib/parent-portal'
import type { FatigueSample, PPEFlag } from '@/lib/types'
import { BRAND, TYPE } from '@/lib/constants'

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
  /** Anchor for the Gear card so /parent/notifications?#gear scrolls into
   *  view when a parent taps a PPE notification. */
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
  const tier: FatigueTier | null = latest ? fatigueTier(latest.load) : null

  if (!latest && openPpe.length === 0) return null

  return (
    <>
      {latest && (
        <section style={{ padding: '20px 16px 0' }}>
          <ParentCard label="WORKLOAD">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <FatiguePill tier={tier!} value={latest.load} />
              <span
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 12.5,
                  color: BRAND.indigoMute,
                }}
              >
                {tier === 'high'
                  ? 'High load — coach is monitoring.'
                  : tier === 'moderate'
                  ? 'Steady, manageable load.'
                  : 'Comfortable load this week.'}
              </span>
            </div>
            <FatigueLine samples={sortedSamples} />
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

function FatiguePill({ tier, value }: { tier: FatigueTier; value: number }) {
  const color = tier === 'high' ? BRAND.coral : tier === 'moderate' ? BRAND.yellow : BRAND.indigo
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: tier === 'low' ? BRAND.indigoSoft : `${color}22`,
        border: `1px solid ${color}`,
        borderRadius: 999,
      }}
    >
      <Footprints size={12} color={tier === 'low' ? BRAND.indigo : color} />
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: '0.16em',
          color: tier === 'low' ? BRAND.indigo : color,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {tier} · {value}
      </span>
    </span>
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

function FatigueLine({ samples }: { samples: FatigueSample[] }) {
  const W = 320
  const H = 64
  const padX = 8
  const padY = 8
  if (samples.length === 0) return null
  const pts = samples.map((s, i) => {
    const x = padX + (i / Math.max(1, samples.length - 1)) * (W - 2 * padX)
    const y = H - padY - (s.load / 100) * (H - 2 * padY)
    return { x, y }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const fillPath = `${path} L ${pts[pts.length - 1].x.toFixed(1)} ${(H - padY).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(H - padY).toFixed(1)} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <path d={fillPath} fill="var(--brand-indigo)" opacity={0.10} />
      <path d={path} stroke="var(--brand-indigo)" strokeWidth={1.6} fill="none" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill="var(--brand-indigo)" />
      ))}
    </svg>
  )
}
