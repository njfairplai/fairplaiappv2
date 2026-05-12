import type { ReactNode } from 'react'

interface PitchProps {
  children?: ReactNode
  /** Override the inherent aspect — defaults to vertical 2:3. */
  aspect?: number
  /** Show the AI-generated cluster heat zones underneath the tokens. */
  showZones?: boolean
}

/**
 * Vertical pitch surface, attacking up. Uses CSS variables so palette changes
 * (e.g. `data-theme="touchline"`) recolour the chrome lines without
 * code edits. The grass green stays constant — it's the pitch, not the brand.
 */
export function Pitch({ children, aspect = 2 / 3, showZones = false }: PitchProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
      style={{
        aspectRatio: `${aspect}`,
        background: 'linear-gradient(180deg, #14422E 0%, #0E2A22 100%)',
      }}
    >
      {/* mowed stripes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-[12.5%]"
          style={{
            top: `${i * 12.5}%`,
            background: i % 2 ? 'rgba(255,255,255,0.025)' : 'transparent',
          }}
        />
      ))}
      {/* outer line */}
      <div
        className="absolute rounded-[2px] border-[1.5px] border-white/35"
        style={{ inset: '3% 4%' }}
      />
      {/* halfway */}
      <div
        className="absolute left-[4%] right-[4%] top-1/2 h-px bg-white/35"
      />
      {/* centre circle */}
      <div
        className="absolute left-1/2 top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white/35"
      />
      <div
        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
      />
      {/* top penalty box (away goal — attacking direction) */}
      <div
        className="absolute left-[22%] right-[22%] top-[3%] h-[14%] border-b-[1.5px] border-l-[1.5px] border-r-[1.5px] border-white/35"
      />
      <div
        className="absolute left-[34%] right-[34%] top-[3%] h-[7%] border-b-[1.5px] border-l-[1.5px] border-r-[1.5px] border-white/35"
      />
      {/* bottom penalty box (own goal) */}
      <div
        className="absolute bottom-[3%] left-[22%] right-[22%] h-[14%] border-l-[1.5px] border-r-[1.5px] border-t-[1.5px] border-white/35"
      />
      <div
        className="absolute bottom-[3%] left-[34%] right-[34%] h-[7%] border-l-[1.5px] border-r-[1.5px] border-t-[1.5px] border-white/35"
      />
      {showZones && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 92%, rgba(255,255,255,0.06), transparent 25%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), transparent 30%), radial-gradient(circle at 50% 8%, rgba(255,255,255,0.04), transparent 25%)',
          }}
        />
      )}
      {children}
    </div>
  )
}
