import Image from 'next/image'

interface LogoProps {
  /** Rendered logo height in px. Width auto-scales by aspect ratio. */
  height?: number
  /** Force a colour treatment.
   *   'auto'  — use the indigo wordmark (default; correct for almost all
   *             pages, which run on light surfaces).
   *   'light' — same as 'auto', kept for caller compatibility.
   *   'dark'  — sand wordmark, for use on dark surfaces (indigo hero bands,
   *             coach hub dark mode, etc). */
  variant?: 'auto' | 'light' | 'dark'
  className?: string
  style?: React.CSSProperties
}

/**
 * Brand wordmark (horizontal). Two PNGs ship in /public:
 *
 *   /logo-black.png — indigo wordmark, for light surfaces (the default).
 *   /logo-white.png — sand wordmark, for dark surfaces.
 *
 * No CSS filter inversion (we used to invert(1) a single black PNG into
 * white — that produced a flat white that lost the brand colour and
 * anti-aliased oddly at small sizes). Now we ship both proper artworks
 * and pick by variant.
 */
export function Logo({ height = 24, variant = 'auto', className, style }: LogoProps) {
  const src = variant === 'dark' ? '/logo-white.png' : '/logo-black.png'

  return (
    <Image
      src={src}
      alt="Fairplai"
      width={2054}
      height={515}
      priority
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        ...style,
      }}
      className={className}
    />
  )
}
