interface PlayerGlyphProps {
  size?: number
  jerseyNumber: number
  name: string
  motm?: boolean
  className?: string
}

/**
 * Geometric placeholder avatar. Indigo gradient circle, sand initials,
 * yellow jersey-number eyebrow. MOTM adds a dashed yellow ring around the
 * outside. No real photo support — wire that in when player.photo lands.
 */
export function PlayerGlyph({
  size = 84,
  jerseyNumber,
  name,
  motm = false,
  className,
}: PlayerGlyphProps) {
  const initials = name
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const id = `glyph-grad-${jerseyNumber}`
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`shrink-0 ${className ?? ''}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-indigo-mid)" />
          <stop offset="100%" stopColor="var(--brand-indigo)" />
        </linearGradient>
      </defs>
      {motm && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="var(--brand-yellow)"
          strokeWidth={3}
          strokeDasharray="4 4"
        />
      )}
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 8} fill={`url(#${id})`} />
      <text
        x={size / 2}
        y={size / 2 - size * 0.06}
        // fontSize scales with `size` prop — kept inline.
        fontSize={size * 0.32}
        fill="var(--brand-sand)"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-clash tracking-[-0.02em]"
      >
        {initials}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.2}
        // fontSize scales with `size` prop — kept inline.
        fontSize={size * 0.1}
        fill="var(--brand-yellow)"
        textAnchor="middle"
        className="font-fragment tracking-[0.22em]"
      >
        #{jerseyNumber}
      </text>
    </svg>
  )
}
