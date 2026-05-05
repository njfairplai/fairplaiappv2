'use client'

import { useMemo } from 'react'
import { playerHeatmaps } from '@/lib/mockData'
import type { Player, PlayerHeatmapData, HeatmapPoint } from '@/lib/types'

interface HeatmapSectionProps {
  player: Player
  /** Current playhead session — drives the heat data in match scope. */
  currentSessionId?: string | null
  /** When the playhead lands on a training match, signal that here so the
   *  heatmap renders an empty state instead of pretending data exists. */
  isTraining?: boolean
  /** Page scope from the profile-level toggle. Match: this match's heat.
   *  Season: aggregate across the whole season. The old in-section dropdown
   *  was removed because the page-level toggle controls this now. */
  scope: 'match' | 'season'
  isMobile?: boolean
}

/**
 * Horizontal pitch + heat overlay.
 *
 * In match scope: this match's heat (jittered from the season base using the
 * session id as a seed, since the mock doesn't store per-session points).
 * In season scope: the raw season aggregate.
 *
 * Data source: `playerHeatmaps` mock keyed by `${playerId}`. Falls back to a
 * procedurally generated cluster centered on the player's position group
 * when no real heatmap exists.
 */
export function HeatmapSection({
  player,
  currentSessionId,
  isTraining,
  scope,
  isMobile,
}: HeatmapSectionProps) {
  const points = useMemo(() => {
    if (scope === 'match' && isTraining) return null
    const data: PlayerHeatmapData | undefined = playerHeatmaps[player.id]
    if (!data) return generateFallback(player.position[0] ?? 'CM')
    if (scope === 'season') return data.points
    // Match scope — jitter the season points using the session id as a seed
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
  // ~20% smaller than the original 720×480 / 320×220. Radar takes the more
  // prominent spot above; heatmap is the supporting evidence below.
  const w = isMobile ? 256 : 576
  const h = isMobile ? 176 : 384

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
          gridTemplateColumns: isMobile ? '1fr' : '180px 1fr',
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
          {scope === 'season' && (
            <span style={{ marginLeft: 8, opacity: 0.7 }}>· SEASON AGGREGATE</span>
          )}
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
      </div>

      {scope === 'match' && isTraining ? (
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
