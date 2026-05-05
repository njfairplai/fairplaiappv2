import { scoreColor } from '@/lib/squad-season-score'

interface ScoreArcProps {
  value: number
  size?: number
  stroke?: number
  /** Override the band-driven colour. Pass `--brand-yellow` for MOTM, etc. */
  color?: string
  /** Override the unfilled ring colour. */
  ring?: string
  textColor?: string
  /** Render a small mono label below the value (e.g. "MD9", "SEASON"). */
  sub?: string
}

/**
 * Circular score arc — value 0–100, sweeps clockwise from 12 o'clock.
 * Default colour follows the score band (red/yellow/green) via scoreColor().
 * Used inline anywhere the page needs a compact score visual.
 */
export function ScoreArc({
  value,
  size = 120,
  stroke = 10,
  color,
  ring,
  textColor,
  sub,
}: ScoreArcProps) {
  const r = size / 2 - stroke
  const circ = 2 * Math.PI * r
  const off = circ - (circ * Math.max(0, Math.min(100, value))) / 100
  const arcColor = color ?? scoreColor(value)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ring ?? 'var(--brand-indigo-soft)'}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={arcColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        fontFamily="var(--font-display)"
        fontSize={size * 0.36}
        fill={textColor ?? 'var(--brand-indigo)'}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ letterSpacing: '-0.02em' }}
      >
        {value || '—'}
      </text>
      {sub && (
        <text
          x={size / 2}
          y={size / 2 + size * 0.24}
          fontFamily="var(--font-mono)"
          fontSize={size * 0.085}
          fill="var(--brand-indigo-mute)"
          textAnchor="middle"
          style={{ letterSpacing: '0.18em' }}
        >
          {sub}
        </text>
      )}
    </svg>
  )
}
