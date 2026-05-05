'use client'

export const RADAR_CATEGORIES = [
  'Physical',
  'Positional',
  'Passing',
  'Dribbling',
  'Control',
  'Defending',
] as const
export type RadarCategory = (typeof RADAR_CATEGORIES)[number]

export interface RadarSeries {
  /** Per-category 0-100 score. */
  values: Record<RadarCategory, number>
  /** Stroke + fill colour. Use a CSS variable or hex. */
  color: string
  /** Fill alpha. Default 0.18. */
  fillOpacity?: number
  /** Stroke width. Default 2. */
  strokeWidth?: number
  /** Pass `'6 4'` for dashed match overlays. */
  strokeDasharray?: string
  /** Render filled vertex dots. Default true. */
  dots?: boolean
  /** Optional contrasting border on the dots (used for the yellow overlay so
   *  the dots remain visible against indigo grid). */
  dotStroke?: string
}

export interface PolyRadarProps {
  series: RadarSeries[]
  /** Currently-selected axis. The label gets a pill highlight. */
  selected?: RadarCategory
  /** Click handler on an axis label. */
  onSelect?: (c: RadarCategory) => void
  size: number
  /** Hide the concentric grid + spokes. Useful for dense compare overlays. */
  bare?: boolean
}

/**
 * Generic 6-axis radar drawn from scratch (no Recharts). Accepts any number
 * of series so it can render a single solo player profile, a profile vs match
 * overlay, or up to N players on the compare page.
 *
 * Each series controls its own colour, dashing, and fill — the host decides
 * how to read the picture.
 */
export function PolyRadar({
  series,
  selected,
  onSelect,
  size,
  bare = false,
}: PolyRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 36
  const cats = RADAR_CATEGORIES
  const ang = (i: number) => (Math.PI * 2 * i) / cats.length - Math.PI / 2
  const point = (i: number, value: number): [number, number] => {
    const v = Math.max(0, Math.min(100, value)) / 100
    return [cx + Math.cos(ang(i)) * r * v, cy + Math.sin(ang(i)) * r * v]
  }
  const polygon = (vals: number[]) => vals.map((v, i) => point(i, v).join(',')).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {!bare && (
        <>
          {[20, 40, 60, 80, 100].map((v, i) => (
            <polygon
              key={v}
              points={polygon(cats.map(() => v))}
              fill="none"
              stroke="var(--brand-line)"
              strokeWidth={1}
              strokeDasharray={i === 4 ? '' : '2 3'}
            />
          ))}
          {cats.map((c, i) => {
            const [x, y] = point(i, 100)
            return (
              <line
                key={c}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="var(--brand-line)"
                strokeWidth={1}
              />
            )
          })}
        </>
      )}
      {/* Series polygons (back-to-front order — first series renders at the
          back, last on top). */}
      {series.map((s, idx) => {
        const vals = cats.map(c => s.values[c])
        const pts = vals.map((v, i) => point(i, v))
        return (
          <g key={idx}>
            <polygon
              points={polygon(vals)}
              fill={s.color}
              fillOpacity={s.fillOpacity ?? 0.18}
              stroke={s.color}
              strokeWidth={s.strokeWidth ?? 2}
              strokeDasharray={s.strokeDasharray}
              strokeLinejoin="round"
            />
            {(s.dots ?? true) &&
              pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r={3}
                  fill={s.color}
                  stroke={s.dotStroke}
                  strokeWidth={s.dotStroke ? 1 : 0}
                />
              ))}
          </g>
        )
      })}
      {/* Axis labels — clickable when onSelect is supplied. */}
      {cats.map((c, i) => {
        const [x, y] = point(i, 130)
        const isSelected = !!selected && c === selected
        const labelW = c.length * 7.5 + 18
        const handle = onSelect ? () => onSelect(c) : undefined
        return (
          <g key={c} cursor={handle ? 'pointer' : undefined} onClick={handle}>
            {isSelected && (
              <rect
                x={x - labelW / 2}
                y={y - 11}
                width={labelW}
                height={22}
                rx={11}
                fill="var(--brand-indigo)"
              />
            )}
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={11}
              fontWeight={isSelected ? 700 : 600}
              fill={isSelected ? 'var(--brand-sand)' : 'var(--brand-indigo)'}
              style={{ letterSpacing: '0.04em', userSelect: 'none' }}
            >
              {c}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
