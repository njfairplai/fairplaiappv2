'use client'

import { players, playerRadarData, seasonProgressData, squadScores, playerSeasonStats } from '@/lib/mockData'
import { playerTokens } from '@/styles/player-tokens'
import { NAV_HEIGHT } from '@/lib/constants'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import Image from 'next/image'
import type { RadarDataItem } from '@/lib/types'

const PLAYER_ID = 'player_001'

function getScoreColor(score: number) {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

/* ── Mini Radar Chart (SVG) ── */
function RadarChart({ data }: { data: RadarDataItem[] }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const r = 80

  function polarToXY(angleDeg: number, radius: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) }
  }

  const angleStep = 360 / data.length

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0]

  // Player polygon
  const playerPoints = data.map((d, i) => {
    const p = polarToXY(i * angleStep, (d.score / 100) * r)
    return `${p.x},${p.y}`
  }).join(' ')

  // Avg polygon
  const avgPoints = data.map((d, i) => {
    const p = polarToXY(i * angleStep, (d.avg / 100) * r)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid */}
      {rings.map(ring => (
        <polygon
          key={ring}
          points={data.map((_, i) => {
            const p = polarToXY(i * angleStep, ring * r)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none" stroke="#E2E8F0" strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {data.map((_, i) => {
        const p = polarToXY(i * angleStep, r)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth={1} />
      })}

      {/* Avg polygon */}
      <polygon points={avgPoints} fill="rgba(148,163,184,0.15)" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 2" />

      {/* Player polygon */}
      <polygon points={playerPoints} fill={`${playerTokens.primary}25`} stroke={playerTokens.primary} strokeWidth={2} />

      {/* Labels */}
      {data.map((d, i) => {
        const p = polarToXY(i * angleStep, r + 22)
        return (
          <text
            key={i}
            x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight={600} fill="#64748B"
          >
            {d.category.slice(0, 4)}
          </text>
        )
      })}

      {/* Score dots */}
      {data.map((d, i) => {
        const p = polarToXY(i * angleStep, (d.score / 100) * r)
        return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={playerTokens.primary} stroke="#fff" strokeWidth={1.5} />
      })}
    </svg>
  )
}

/* ── Season Progress (mini line chart) ── */
function SeasonChart({ data }: { data: { match: string; score: number }[] }) {
  const w = 320
  const h = 100
  const padX = 30
  const padY = 10
  const chartW = w - padX * 2
  const chartH = h - padY * 2
  const min = Math.min(...data.map(d => d.score)) - 5
  const max = Math.max(...data.map(d => d.score)) + 5

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((d.score - min) / (max - min)) * chartH,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {/* Grid lines */}
      {[min, (min + max) / 2, max].map(v => {
        const y = padY + chartH - ((v - min) / (max - min)) * chartH
        return (
          <g key={v}>
            <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="#F1F5F9" strokeWidth={1} />
            <text x={padX - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#94A3B8">
              {Math.round(v)}
            </text>
          </g>
        )
      })}

      {/* Line */}
      <path d={pathD} fill="none" stroke={playerTokens.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Area */}
      <path
        d={`${pathD} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`}
        fill={`${playerTokens.primary}15`}
      />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={playerTokens.primary} stroke="#fff" strokeWidth={1.5} />
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={points[i].x} y={h - 2}
          textAnchor="middle" fontSize={8} fill="#94A3B8"
        >
          {d.match.split(' ')[0]}
        </text>
      ))}
    </svg>
  )
}

export default function PlayerProfilePage() {
  const player = players.find(p => p.id === PLAYER_ID)!
  const radar = playerRadarData[PLAYER_ID] || []
  const score = squadScores[PLAYER_ID]?.compositeScore ?? 0
  const avgScore = squadScores[PLAYER_ID]?.avgScore ?? 0
  const stats = playerSeasonStats.find(s => s.playerId === PLAYER_ID)

  // Personal bests
  const peakScore = Math.max(...seasonProgressData.map(d => d.score))

  return (
    <div style={{ paddingBottom: NAV_HEIGHT + 16 }}>
      {/* Hero header */}
      <div style={{
        background: playerTokens.gradient,
        padding: '28px 20px 24px',
        borderRadius: '0 0 24px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <PlayerAvatar player={player} size="xl" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
          {player.firstName} {player.lastName}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 6,
        }}>
          <span style={{
            fontSize: 24, fontWeight: 900, color: '#fff',
            background: 'rgba(255,255,255,0.15)', padding: '2px 12px', borderRadius: 8,
          }}>
            #{player.jerseyNumber}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#fff',
            background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 6,
          }}>
            {player.position}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
          MAK U12 Red · MAK Academy
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Overall Score */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Season Average
          </div>
          <div style={{
            fontSize: 48, fontWeight: 900, color: getScoreColor(avgScore),
            lineHeight: 1.1, marginTop: 4,
          }}>
            {avgScore}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            Peak: <span style={{ fontWeight: 700, color: getScoreColor(peakScore) }}>{peakScore}</span> · Last: <span style={{ fontWeight: 700, color: getScoreColor(score) }}>{score}</span>
          </div>
        </div>

        {/* Radar */}
        {radar.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #E2E8F0', padding: '16px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              Skill Profile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 3, background: playerTokens.primary, borderRadius: 2 }} />
                <span style={{ fontSize: 10, color: '#64748B' }}>You</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 3, background: '#94A3B8', borderRadius: 2, borderBottom: '1px dashed #94A3B8' }} />
                <span style={{ fontSize: 10, color: '#64748B' }}>Team Avg</span>
              </div>
            </div>
            <RadarChart data={radar} />

            {/* Score breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
              {radar.map(r => (
                <div key={r.category} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.score >= r.avg ? playerTokens.primary : '#F59E0B' }}>
                    {r.score}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{r.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Season Stats */}
        {stats && (
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #E2E8F0', padding: '16px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
              Season Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {stats.stats.map(stat => (
                <div key={stat.label} style={{
                  background: '#F8FAFC', borderRadius: 10, padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Season Progress */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #E2E8F0', padding: '16px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
            Season Progress
          </div>
          <SeasonChart data={seasonProgressData} />
        </div>
      </div>
    </div>
  )
}
