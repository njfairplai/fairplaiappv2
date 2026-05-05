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
 * (e.g. `data-theme="touchline-cards"`) recolour the chrome lines without
 * code edits. The grass green stays constant — it's the pitch, not the brand.
 */
export function Pitch({ children, aspect = 2 / 3, showZones = false }: PitchProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${aspect}`,
        background: 'linear-gradient(180deg, #14422E 0%, #0E2A22 100%)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* mowed stripes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${i * 12.5}%`,
            height: '12.5%',
            background: i % 2 ? 'rgba(255,255,255,0.025)' : 'transparent',
          }}
        />
      ))}
      {/* outer line */}
      <div
        style={{
          position: 'absolute',
          inset: '3% 4%',
          border: '1.5px solid rgba(255,255,255,0.35)',
          borderRadius: 2,
        }}
      />
      {/* halfway */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          right: '4%',
          top: '50%',
          height: 1,
          background: 'rgba(255,255,255,0.35)',
        }}
      />
      {/* centre circle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 90,
          height: 90,
          border: '1.5px solid rgba(255,255,255,0.35)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 6,
          height: 6,
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* top penalty box (away goal — attacking direction) */}
      <div
        style={{
          position: 'absolute',
          left: '22%',
          right: '22%',
          top: '3%',
          height: '14%',
          borderLeft: '1.5px solid rgba(255,255,255,0.35)',
          borderRight: '1.5px solid rgba(255,255,255,0.35)',
          borderBottom: '1.5px solid rgba(255,255,255,0.35)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '34%',
          right: '34%',
          top: '3%',
          height: '7%',
          borderLeft: '1.5px solid rgba(255,255,255,0.35)',
          borderRight: '1.5px solid rgba(255,255,255,0.35)',
          borderBottom: '1.5px solid rgba(255,255,255,0.35)',
        }}
      />
      {/* bottom penalty box (own goal) */}
      <div
        style={{
          position: 'absolute',
          left: '22%',
          right: '22%',
          bottom: '3%',
          height: '14%',
          borderLeft: '1.5px solid rgba(255,255,255,0.35)',
          borderRight: '1.5px solid rgba(255,255,255,0.35)',
          borderTop: '1.5px solid rgba(255,255,255,0.35)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '34%',
          right: '34%',
          bottom: '3%',
          height: '7%',
          borderLeft: '1.5px solid rgba(255,255,255,0.35)',
          borderRight: '1.5px solid rgba(255,255,255,0.35)',
          borderTop: '1.5px solid rgba(255,255,255,0.35)',
        }}
      />
      {showZones && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 92%, rgba(255,255,255,0.06), transparent 25%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), transparent 30%), radial-gradient(circle at 50% 8%, rgba(255,255,255,0.04), transparent 25%)',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  )
}
