import Image from 'next/image'

interface LogoProps {
  /** Rendered logo height in px. Width auto-scales by aspect ratio. */
  height?: number
  /** Override the default theme-driven inversion. Use 'light' to force the
      black wordmark, 'dark' to force the inverted (white) wordmark. */
  variant?: 'auto' | 'light' | 'dark'
  className?: string
  style?: React.CSSProperties
}

/**
 * Brand wordmark (horizontal). Single black-on-transparent PNG that
 * inverts to white via the per-theme `--logo-invert` CSS var. Pass
 * `variant="light"` or `"dark"` to override on surfaces that don't
 * match the active theme (e.g. a navy hero on Almanac).
 */
export function Logo({ height = 24, variant = 'auto', className, style }: LogoProps) {
  const filter =
    variant === 'light' ? 'none' :
    variant === 'dark'  ? 'invert(1)' :
    'var(--logo-invert, none)'

  return (
    <Image
      src="/logo-black.png"
      alt="Fairplai"
      width={2054}
      height={515}
      priority
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        filter,
        ...style,
      }}
      className={className}
    />
  )
}
