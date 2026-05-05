'use client'

import { useState, useMemo } from 'react'
import { playerHeatmaps } from '@/lib/mockData'
import type { Player, PlayerHeatmapData, HeatmapPoint } from '@/lib/types'

type Scope = 'session' | 'season'

interface HeatmapSectionProps {
  player: Player
  /** Current playhead session — heatmap defaults to this match's data. */
  currentSessionId?: string | null
  /** When the playhead lands on a training match, signal that here so the
   *  heatmap renders an empty state instead of pretending data exists. */
  isTraining?: boolean
  isMobile?: boolean
}

/**
 * Vertical pitch + heat overlay. Session-scoped by default (follows the
 * playhead); toggle pill switches to "Season aggregate" which merges every
 * match's heat points for this player.
 *
 * Data source: `playerHeatmaps` mock keyed by `${playerId}_${sessionId}` or
 * `${playerId}` for season aggregates. Falls back to a procedurally
 * generated cluster centered on the player's position group when no real
 * heatmap exists for the active scope.
 */
export function HeatmapSection({
  player,
  currentSessionId,
  isTraining,
  isMobile,
}: HeatmapSectionProps) {
  const [scope, setScope] = useState<Scope>('session')

  const points = useMemo(() => {
    if (isTraining) return null
    // Look up by playerId — current mock keys heatmaps by player only,
    // not per-session. We synthesize per-session variations from the same
    // base by jittering the points slightly using the session id as a seed.
    const data: PlayerHeatmapData | undefined = playerHeatmaps[player.id]
    if (!data) return generateFallback(player.position[0] ?? 'CM')
    if (scope === 'season') return data.points
    // Per-match: jitter the season points using the session id as a seed
    if (!currentSessionId) return data.points
    const seed = sessionSeed(currentSessionId)
    return data.points.map((p, i) => ({
      ...p,
      x: clamp01(p.x + jitter(seed + i, 0.07)),
      y: clamp01(p.y + jitter(seed + i + 1, 0.07)),
    }))
  }, [player.id, player.position, currentSessionId, scope, isTraining])

  // Horizontal pitch: own goal on the LEFT, attacking RIGHT — matches the
  // match analysis page convention. Aspect ratio ~3:2.
  const w = isMobile ? 320 : 720
  const h = isMobile ? 220 : 480

  return (
    <section
      style={{
        background: 'var(--brand-paper)',
        padding: isMobile ? '24px 16px' : '32px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '180px 1fr auto',
          gap: isMobile ? 12 : 32,
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            borderTop: '2px solid var(--brand-indigo)',
            paddingTop: 8,
          }}
        >
          HEATMAP
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 22 : 28,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
          }}
        >
          Where {player.firstName} played.
        </div>
        {!isTraining && (
          <div
            role="tablist"
            style={{
              display: 'inline-flex',
              background: 'var(--brand-sand)',
              border: '1px solid var(--brand-line)',
              borderRadius: 999,
              padding: 3,
              alignSelf: isMobile ? 'flex-start' : 'center',
            }}
          >
            <ScopeBtn active={scope === 'session'} onClick={() => setScope('session')}>
              This match
            </ScopeBtn>
            <ScopeBtn active={scope === 'season'} onClick={() => setScope('season')}>
              Season aggregate
            </ScopeBtn>
          </div>
        )}
      </div>

      {isTraining ? (
        <div
          style={{
            background: 'var(--brand-sand)',
            border: '1px solid var(--brand-line)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--brand-indigo-mute)',
          }}
        >
          No tracking data for training sessions.
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PitchHeatmap points={points ?? []} width={w} height={h} />
        </div>
      )}
    </section>
  )
}

/**
 * Horizontal pitch SVG with radial-gradient heat discs.
 *
 * Coordinate convention:
 *   - Pitch is rendered horizontal: width = goal-to-goal length, height = sideline.
 *   - Own goal on the LEFT; team attacks RIGHT.
 *   - Source `points` are still in 0..1 normalised coords (x = left-right,
 *     y = own-goal to opponent-goal). We map y → screen X (attack direction)
 *     and x → screen Y (sideline) so the same data renders correctly on a
 *     horizontal pitch.
 */
function PitchHeatmap({
  points,
  width,
  height,
}: {
  points: HeatmapPoint[]
  width: number
  height: number
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
      aria-hidden
    >
      <defs>
        <radialGradient id="fp-heat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--brand-yellow)" stopOpacity="0.85" />
          <stop offset="60%" stopColor="var(--brand-yellow)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--brand-yellow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Grass surface */}
      <rect x={0} y={0} width={width} height={height} fill="#14422E" />
      {/* Vertical mowed stripes (since the pitch is now horizontal) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={(width / 12) * i}
          y={0}
          width={width / 12}
          height={height}
          fill={i % 2 ? 'rgba(255,255,255,0.025)' : 'transparent'}
        />
      ))}
      {/* Pitch markings — rotated mental model: vertical halfway line, side boxes */}
      <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2}>
        <rect x={6} y={6} width={width - 12} height={height - 12} rx={2} />
        {/* halfway */}
        <line x1={width / 2} y1={6} x2={width / 2} y2={height - 6} />
        {/* centre circle */}
        <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 6} />
        {/* left penalty box (own goal) */}
        <rect x={6} y={height * 0.22} width={width * 0.16} height={height * 0.56} />
        <rect x={6} y={height * 0.36} width={width * 0.07} height={height * 0.28} />
        {/* right penalty box (attacking) */}
        <rect x={width * 0.84 - 6} y={height * 0.22} width={width * 0.16} height={height * 0.56} />
        <rect x={width * 0.93 - 6} y={height * 0.36} width={width * 0.07} height={height * 0.28} />
      </g>
      {/* Heat — translate (x:0..1 sideline, y:0..1 attack-direction) →
          (screen X = y * width, screen Y = (1-x) * height) so attack-up data
          renders attack-right. */}
      {points.map((p, i) => {
        const cx = p.y * (width - 12) + 6
        const cy = (1 - p.x) * (height - 12) + 6
        const rr = 28 + p.intensity * 26
        return <circle key={i} cx={cx} cy={cy} r={rr} fill="url(#fp-heat)" />
      })}
    </svg>
  )
}

function ScopeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: active ? 'var(--brand-indigo)' : 'transparent',
        color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
        border: 'none',
        borderRadius: 999,
        padding: '6px 14px',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </button>
  )
}

/** Generate a fallback heat cluster around the player's position group. */
function generateFallback(position: string): HeatmapPoint[] {
  const cx =
    position === 'GK' ? 0.5 :
    position === 'LB' || position === 'LWB' || position === 'LW' || position === 'LM' ? 0.25 :
    position === 'RB' || position === 'RWB' || position === 'RW' || position === 'RM' ? 0.75 :
    0.5
  const cy =
    position === 'GK' ? 0.08 :
    ['CB', 'LB', 'RB', 'LWB', 'RWB', 'SW'].includes(position) ? 0.28 :
    ['ST', 'CF', 'LW', 'RW', 'FW'].includes(position) ? 0.78 :
    0.5
  // 8 points clustered around (cx, cy) with mild spread
  return Array.from({ length: 8 }).map((_, i) => ({
    x: clamp01(cx + Math.sin(i * 1.3) * 0.12),
    y: clamp01(cy + Math.cos(i * 1.1) * 0.14),
    intensity: 0.3 + (Math.abs(Math.sin(i)) * 0.6),
  }))
}

function sessionSeed(sessionId: string): number {
  let h = 0
  for (let i = 0; i < sessionId.length; i++) h = (h * 31 + sessionId.charCodeAt(i)) % 1000
  return h
}

function jitter(seed: number, range: number): number {
  return (Math.sin(seed * 12.9898) * 43758.5453 % 1) * range - range / 2
}

function clamp01(v: number): number {
  return Math.max(0.05, Math.min(0.95, v))
}
