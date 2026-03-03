'use client'

import { COLORS } from '@/lib/constants'

interface ScoreArcProps {
  score: number
  size?: number
  strokeWidth?: number
  color?: string
  dark?: boolean
}

export default function ScoreArc({ score, size = 100, strokeWidth = 5, color = COLORS.primary, dark = true }: ScoreArcProps) {
  const r = (size - strokeWidth * 2) / 2 - 2
  const C = 2 * Math.PI * r
  const dashOffset = C * (1 - score / 100)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle
        className="score-arc-animate"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${size / 2}px ${size / 2}px`,
          strokeDasharray: C,
          strokeDashoffset: dashOffset,
        }}
      />
    </svg>
  )
}
