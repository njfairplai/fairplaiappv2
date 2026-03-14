'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { COLORS } from '@/lib/constants'
import { benchmarkData, percentileData } from '@/lib/mockData'
import type { BenchmarkGroup, BenchmarkAverage } from '@/lib/types'

const SHADOWS = {
  card: '0 2px 12px rgba(0,0,0,0.06)',
}

const comparisonOptions: { key: BenchmarkGroup; label: string }[] = [
  { key: 'academy', label: 'Academy' },
  { key: 'position', label: 'Position' },
  { key: 'age_group', label: 'Age Group' },
]

function ArrowUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 3V11M7 11L3.5 7.5M7 11L10.5 7.5" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BarRow({
  item,
  animate,
}: {
  item: BenchmarkAverage
  animate: boolean
}) {
  const diff = item.playerValue - item.groupAverage
  const isAbove = diff > 0
  const isBelow = diff < 0

  const playerWidth = animate ? `${item.playerValue}%` : '0%'
  const groupWidth = animate ? `${item.groupAverage}%` : '0%'

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Metric label + indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{item.metric}</span>
        {isAbove && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: `${COLORS.success}14`,
            borderRadius: 8,
            padding: '1px 6px',
          }}>
            <ArrowUp />
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.success }}>+{diff}</span>
          </div>
        )}
        {isBelow && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: `${COLORS.error}14`,
            borderRadius: 8,
            padding: '1px 6px',
          }}>
            <ArrowDown />
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.error }}>{diff}</span>
          </div>
        )}
      </div>

      {/* Player bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{
          height: 22,
          background: COLORS.cloud,
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: playerWidth,
            background: `linear-gradient(90deg, ${COLORS.primary}, #757FFF)`,
            borderRadius: 6,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 8,
            minWidth: animate && item.playerValue > 0 ? 60 : 0,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
            }}>
              Kiyan: {item.playerValue}th
            </span>
          </div>
        </div>
      </div>

      {/* Group average bar */}
      <div>
        <div style={{
          height: 22,
          background: COLORS.cloud,
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: groupWidth,
            background: '#C5C8D4',
            borderRadius: 6,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 8,
            minWidth: animate && item.groupAverage > 0 ? 60 : 0,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
            }}>
              {item.groupLabel}: {item.groupAverage}th
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getPercentileColor(percentile: number): string {
  if (percentile > 60) return COLORS.success
  if (percentile >= 40) return COLORS.warning
  return COLORS.error
}

export default function BenchmarkComparison() {
  const [activeGroup, setActiveGroup] = useState<BenchmarkGroup>('academy')
  const [animate, setAnimate] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const metrics = benchmarkData[activeGroup] ?? []

  const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting && !hasAnimated.current) {
      hasAnimated.current = true
      setAnimate(true)
    }
  }, [])

  useEffect(() => {
    const node = chartRef.current
    if (!node) return

    const observer = new IntersectionObserver(onIntersect, {
      threshold: 0.2,
    })
    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [onIntersect])

  // Reset animation when toggling comparison group
  const handleGroupChange = (group: BenchmarkGroup) => {
    setActiveGroup(group)
    setAnimate(false)
    // Allow a frame for the bars to reset to 0 before re-animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true)
      })
    })
  }

  return (
    <div style={{ padding: '0 0 8px' }}>
      {/* Section Title */}
      <div style={{ marginBottom: 14, marginTop: 20 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.primary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Benchmarking
        </p>
        <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 2, margin: '2px 0 0' }}>
          How Kiyan compares
        </p>
      </div>

      {/* Card wrapper */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '16px 16px 4px',
        boxShadow: SHADOWS.card,
      }}>
        {/* Comparison Toggle Pills */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 20,
          background: COLORS.cloud,
          borderRadius: 12,
          padding: 4,
        }}>
          {comparisonOptions.map(opt => {
            const isActive = opt.key === activeGroup
            return (
              <button
                key={opt.key}
                onClick={() => handleGroupChange(opt.key)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? '#fff' : COLORS.muted,
                  background: isActive ? COLORS.primary : 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  letterSpacing: '0.01em',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Bar Chart */}
        <div ref={chartRef}>
          {metrics.map(item => (
            <BarRow key={`${activeGroup}-${item.metric}`} item={item} animate={animate} />
          ))}
        </div>
      </div>

      {/* Percentile Rankings Section */}
      <div style={{ marginBottom: 14, marginTop: 24 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.primary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Percentile Rankings
        </p>
        <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 2, margin: '2px 0 0' }}>
          vs U12 midfielders nationally
        </p>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        boxShadow: SHADOWS.card,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          {percentileData.map(item => {
            const color = getPercentileColor(item.percentile)
            return (
              <div
                key={item.metric}
                style={{
                  background: '#F5F6FC',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.navy,
                  lineHeight: 1.3,
                }}>
                  {item.metric}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color,
                    lineHeight: 1,
                  }}>
                    {item.percentile}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.muted,
                  }}>
                    / 100
                  </span>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                  letterSpacing: '0.02em',
                }}>
                  {item.topPct}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
