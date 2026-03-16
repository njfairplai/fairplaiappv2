'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  categoryGrades, percentileData, coachFeedbackHistory, highlights,
  players, playerRadarData, seasonProgressData, squadScores, playerSeasonStats,
} from '@/lib/mockData'
import CategoryGrade from '@/components/parent/CategoryGrade'
import BenchmarkComparison from '@/components/parent/BenchmarkComparison'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import { SHADOWS, COLORS, NAV_HEIGHT } from '@/lib/constants'
import { playerTokens } from '@/styles/player-tokens'
import type { RadarDataItem } from '@/lib/types'

const LineChartDynamic = dynamic(() => import('@/components/charts/LineChart'), { ssr: false })

const PLAYER_ID = 'player_001'

/* ── Section label ── */
function SectionLabel({ text, sub }: { text: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: playerTokens.primary, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{text}</p>
      {sub && <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 2, margin: 0 }}>{sub}</p>}
    </div>
  )
}

/* ── Coach feedback (Attitude / Effort / Coachability / Sportsmanship) ── */
function CoachFeedbackSection() {
  const feedback = coachFeedbackHistory.find(f => f.playerId === PLAYER_ID)
  if (!feedback) {
    return (
      <>
        <SectionLabel text="Coach Feedback" />
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: SHADOWS.card, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0 }}>No feedback submitted yet this term.</p>
        </div>
      </>
    )
  }

  const attributes = [
    { label: 'Attitude', value: feedback.attitude, emoji: '🧠' },
    { label: 'Effort', value: feedback.effort, emoji: '💪' },
    { label: 'Coachability', value: feedback.coachability, emoji: '📋' },
    { label: 'Sportsmanship', value: feedback.sportsmanship, emoji: '🤝' },
  ]

  return (
    <>
      <SectionLabel text="Coach Feedback" />
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: SHADOWS.card }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {attributes.map(attr => (
            <div key={attr.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{attr.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{attr.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: playerTokens.primary }}>{attr.value}/5</span>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(attr.value / 5) * 100}%`,
                    background: `linear-gradient(90deg, ${playerTokens.primary}, ${playerTokens.primaryLight})`,
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {feedback.summary && (
          <div style={{ background: playerTokens.bgSubtle, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#0F172A', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
              &ldquo;{feedback.summary}&rdquo;
            </p>
            <p style={{ fontSize: 11, color: '#64748B', margin: '6px 0 0' }}>
              Coach Marcus · {feedback.date}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

/* ── AI Coach Analysis ── */
function CoachAnalysisCard() {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/coach-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: PLAYER_ID }) })
      .then(r => r.json())
      .then(d => { setMessage(d.message); setLoading(false) })
      .catch(() => { setMessage(null); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ background: `linear-gradient(135deg, ${playerTokens.bgDeep} 0%, ${playerTokens.bgCardDark} 100%)`, borderRadius: 16, padding: 20, boxShadow: SHADOWS.card }}>
        <SkeletonLoader width="90%" height={16} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="40%" height={12} style={{ marginLeft: 'auto' }} />
      </div>
    )
  }

  if (!message) {
    return (
      <div style={{ background: '#F0FAF8', border: `1px solid ${playerTokens.primary}33`, borderRadius: 16, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#9DA2B3' }}>Coach message unavailable right now</p>
      </div>
    )
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${playerTokens.bgDeep} 0%, ${playerTokens.bgCardDark} 100%)`,
      borderRadius: 16, padding: 20, position: 'relative',
      boxShadow: '0 8px 32px rgba(0,201,167,0.15)',
    }}>
      <p style={{ fontSize: 15, color: '#F8FAFC', fontStyle: 'italic', lineHeight: 1.65, margin: 0, paddingBottom: 28 }}>
        &ldquo;{message}&rdquo;
      </p>
      <div style={{ position: 'absolute', bottom: 14, right: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 11, color: 'rgba(248,250,252,0.5)', fontWeight: 600 }}>AI Coach · Powered by FairplAI</span>
      </div>
    </div>
  )
}

/* ── Mini Radar Chart ── */
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
  const rings = [0.25, 0.5, 0.75, 1.0]

  const playerPoints = data.map((d, i) => {
    const p = polarToXY(i * angleStep, (d.score / 100) * r)
    return `${p.x},${p.y}`
  }).join(' ')

  const avgPoints = data.map((d, i) => {
    const p = polarToXY(i * angleStep, (d.avg / 100) * r)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
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
      {data.map((_, i) => {
        const p = polarToXY(i * angleStep, r)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth={1} />
      })}
      <polygon points={avgPoints} fill="rgba(148,163,184,0.15)" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 2" />
      <polygon points={playerPoints} fill={`${playerTokens.primary}25`} stroke={playerTokens.primary} strokeWidth={2} />
      {data.map((d, i) => {
        const p = polarToXY(i * angleStep, r + 22)
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={600} fill="#64748B">
            {d.category.slice(0, 4)}
          </text>
        )
      })}
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
      {[min, (min + max) / 2, max].map(v => {
        const y = padY + chartH - ((v - min) / (max - min)) * chartH
        return (
          <g key={v}>
            <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="#F1F5F9" strokeWidth={1} />
            <text x={padX - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#94A3B8">{Math.round(v)}</text>
          </g>
        )
      })}
      <path d={pathD} fill="none" stroke={playerTokens.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${pathD} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`} fill={`${playerTokens.primary}15`} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={playerTokens.primary} stroke="#fff" strokeWidth={1.5} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={h - 2} textAnchor="middle" fontSize={8} fill="#94A3B8">{d.match.split(' ')[0]}</text>
      ))}
    </svg>
  )
}

function getScoreColor(score: number) {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

/* ── Main Page ── */
export default function PlayerDevelopmentPage() {
  const player = players.find(p => p.id === PLAYER_ID)!
  const radar = playerRadarData[PLAYER_ID] || []
  const score = squadScores[PLAYER_ID]?.compositeScore ?? 0
  const avgScore = squadScores[PLAYER_ID]?.avgScore ?? 0
  const stats = playerSeasonStats.find(s => s.playerId === PLAYER_ID)
  const peakScore = Math.max(...seasonProgressData.map(d => d.score))

  return (
    <div className="tab-fade" style={{ minHeight: `calc(100dvh - ${NAV_HEIGHT}px)`, background: '#F5F6FC', paddingBottom: NAV_HEIGHT + 16 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', margin: 0 }}>My Progress</h1>
        <Image src="/logos/mak-academy.jpeg" alt="MAK Academy" width={56} height={28} style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Overall Score */}
        <div style={{
          background: '#fff', borderRadius: 16, marginTop: 16,
          border: '1px solid #E2E8F0', padding: '16px', textAlign: 'center',
          boxShadow: SHADOWS.card,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Season Average
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: getScoreColor(avgScore), lineHeight: 1.1, marginTop: 4 }}>
            {avgScore}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            Peak: <span style={{ fontWeight: 700, color: getScoreColor(peakScore) }}>{peakScore}</span> · Last: <span style={{ fontWeight: 700, color: getScoreColor(score) }}>{score}</span>
          </div>
        </div>

        {/* Coach Feedback */}
        <CoachFeedbackSection />

        {/* AI Coach Analysis */}
        <SectionLabel text="Coach's Analysis" />
        <CoachAnalysisCard />

        {/* Radar / Skill Profile */}
        {radar.length > 0 && (
          <>
            <SectionLabel text="Skill Profile" />
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '16px', boxShadow: SHADOWS.card }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                {radar.map(r => (
                  <div key={r.category} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: r.score >= r.avg ? playerTokens.primary : '#F59E0B' }}>{r.score}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{r.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Category Grades */}
        <SectionLabel text="How I Played" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categoryGrades.map(g => <CategoryGrade key={g.category} item={g} />)}
        </div>

        {/* Season Progress */}
        <SectionLabel text="My Season" />
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 4px 12px', boxShadow: SHADOWS.card }}>
          <SeasonChart data={seasonProgressData} />
          <p style={{ fontSize: 12, color: '#9DA2B3', textAlign: 'center', marginTop: 6 }}>#8 in U12 · Top 35% this season</p>
        </div>

        {/* Season Stats */}
        {stats && (
          <>
            <SectionLabel text="Season Stats" />
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '16px', boxShadow: SHADOWS.card }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {stats.stats.map(stat => (
                  <div key={stat.label} style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Benchmarks */}
        <BenchmarkComparison />
      </div>
    </div>
  )
}
