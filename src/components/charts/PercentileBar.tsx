'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { PercentileItem } from '@/lib/types'
import { percentileColor } from '@/lib/utils'
import { COLORS } from '@/lib/constants'

export default function PercentileBar({ item }: { item: PercentileItem }) {
  const barRef = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)

  const startAnimation = useCallback(() => setAnimated(true), [])

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { startAnimation(); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [startAnimation])

  const pct = item.percentile
  const barColor = percentileColor(pct)
  const numColor = percentileColor(pct)

  return (
    <div ref={barRef} style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>{item.metric}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: numColor }}>{pct}th</span>
      </div>
      <div style={{ height: 8, background: COLORS.cloud, borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            background: barColor,
            width: animated ? `${pct}%` : '0%',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: '#9DA2B3', textAlign: 'right', marginTop: 3, fontWeight: 600 }}>{item.topPct}</p>
    </div>
  )
}
