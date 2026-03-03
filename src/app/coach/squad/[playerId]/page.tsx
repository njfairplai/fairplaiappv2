'use client'
import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Film } from 'lucide-react'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import { COLORS } from '@/lib/constants'
import { players, rosters, squadScores, highlights, sessions, pitches, matchAnalyses } from '@/lib/mockData'
import type { Highlight } from '@/lib/types'
import dynamic from 'next/dynamic'

const RadarChartSection = dynamic(
  () => import('recharts').then(mod => {
    const { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } = mod

    function RadarChartComponent({ data }: { data: { category: string; player: number; avg: number }[] }) {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#E8EAED" />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#9DA2B3' }} />
            <Radar name="This Session" dataKey="player" stroke="#4A4AFF" strokeWidth={2} fill="#4A4AFF" fillOpacity={0.2} />
            <Radar name="Season Avg" dataKey="avg" stroke="#9DA2B3" strokeWidth={1} fill="none" fillOpacity={0} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      )
    }

    return RadarChartComponent
  }),
  { ssr: false }
)

const SeasonProgressChart = dynamic(
  () => import('recharts').then(mod => {
    const { LineChart, Line, XAxis, YAxis, Area, ResponsiveContainer } = mod

    function SeasonProgressComponent({ data }: { data: { match: string; score: number }[] }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="match" tick={{ fontSize: 11, fill: '#9DA2B3' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Area type="monotone" dataKey="score" fill="#4A4AFF" fillOpacity={0.1} stroke="none" />
            <Line type="monotone" dataKey="score" stroke="#4A4AFF" strokeWidth={3} dot={{ fill: '#FFFFFF', stroke: '#4A4AFF', strokeWidth: 2, r: 4 }} activeDot={{ fill: '#4A4AFF', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    return SeasonProgressComponent
  }),
  { ssr: false }
)

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#F39C12'
  if (['CB', 'LB', 'RB'].includes(position)) return '#27AE60'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return '#4A4AFF'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#E74C3C'
  return COLORS.muted
}

function getPositionGradient(position: string): string {
  if (position === 'GK') return 'linear-gradient(135deg, #F39C12, #E67E22)'
  if (['CB', 'LB', 'RB'].includes(position)) return 'linear-gradient(135deg, #27AE60, #1E8449)'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return 'linear-gradient(135deg, #4A4AFF, #3025AE)'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return 'linear-gradient(135deg, #E74C3C, #C0392B)'
  return 'linear-gradient(135deg, #6E7180, #40424D)'
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#27AE60'
  if (score >= 60) return '#F39C12'
  return '#E74C3C'
}

function getPlayerRosterName(playerId: string): string {
  for (const [rosterId, playerIds] of Object.entries(rosterPlayerMap)) {
    if (playerIds.includes(playerId)) {
      const roster = rosters.find(r => r.id === rosterId)
      return roster?.name ?? ''
    }
  }
  return ''
}

function getEventBadge(eventType: string): { bg: string; color: string; label: string } {
  switch (eventType) {
    case 'goal':
      return { bg: '#FEF3C7', color: '#92400E', label: '\u26BD Goal' }
    case 'key_pass':
      return { bg: '#EFF6FF', color: '#1E40AF', label: '\uD83C\uDFAF Key Pass' }
    case 'sprint_recovery':
      return { bg: '#DCFCE7', color: '#166534', label: '\u26A1 Sprint' }
    case 'tackle':
      return { bg: '#F3E8FF', color: '#6B21A8', label: '\uD83D\uDEE1 Tackle' }
    case 'save':
      return { bg: '#FEF3C7', color: '#92400E', label: '\uD83E\uDDE4 Save' }
    default:
      return { bg: '#F5F6FC', color: '#6E7180', label: eventType }
  }
}

const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function formatSessionDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayAbbr[d.getDay()]}, ${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function formatDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

type TabKey = 'stats' | 'highlights' | 'footage' | 'notes'

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#27AE60'
  if (grade.startsWith('B')) return '#4A4AFF'
  if (grade.startsWith('C')) return '#F39C12'
  return '#E74C3C'
}

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [activeTab, setActiveTab] = useState<TabKey>('stats')
  const [flagSheetPlayerId, setFlagSheetPlayerId] = useState<string | null>(null)
  const [flagNote, setFlagNote] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [heroImgError, setHeroImgError] = useState(false)
  const [barsAnimated, setBarsAnimated] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'ai' | 'coach'>('all')

  const player = players.find(p => p.id === playerId)
  const score = squadScores[playerId]
  const compositeScore = score?.compositeScore ?? 0
  const position = player?.position[0] || 'CM'
  const initials = player ? (player.firstName[0] || '') + (player.lastName[0] || '') : '??'
  const rosterName = getPlayerRosterName(playerId)
  const diff = compositeScore - (score?.avgScore ?? 0)

  // Match analysis for this player
  const analysis = useMemo(
    () => matchAnalyses.find(a => a.playerId === playerId),
    [playerId]
  )

  // Highlights for this player
  const playerHighlights = useMemo(
    () => highlights.filter(h => h.playerId === playerId),
    [playerId]
  )

  // Footage sessions: drill + (playback_ready or complete) + participatingPlayerIds includes playerId
  const footageSessions = useMemo(
    () =>
      sessions.filter(
        s =>
          s.participatingPlayerIds.includes(playerId) &&
          s.type === 'drill' &&
          (s.status === 'playback_ready' || s.status === 'complete')
      ),
    [playerId]
  )

  // Auto-clear toast
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [toastVisible])

  // Animate percentile bars on mount
  useEffect(() => {
    const timer = setTimeout(() => setBarsAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Load notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`fairplai_notes_${playerId}`)
      if (saved) setNoteText(saved)
    }
  }, [playerId])

  // Debounced auto-save for notes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const timer = setTimeout(() => {
      if (noteText) {
        localStorage.setItem(`fairplai_notes_${playerId}`, noteText)
        const now = new Date()
        setLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [noteText, playerId])

  // Physical stats from analysis or hardcoded defaults
  const distanceCovered = analysis?.distanceCovered ?? 7.4
  const topSpeed = analysis?.topSpeed ?? 27.3
  const sprintCount = analysis?.sprintCount ?? 14

  // Radar chart data
  const radarData = useMemo(() => {
    const playerScores = analysis
      ? [analysis.physicalScore, analysis.positionalScore, analysis.passingScore, analysis.dribblingScore, analysis.controlScore, analysis.defendingScore]
      : [82, 74, 68, 71, 65, 70]
    const avgScores = [76, 70, 65, 68, 62, 67]
    const categories = ['Physical', 'Positional', 'Passing', 'Dribbling', 'Control', 'Defending']
    return categories.map((cat, i) => ({ category: cat, player: playerScores[i], avg: avgScores[i] }))
  }, [analysis])

  // Category grades
  const categoryGrades = [
    { category: 'Physical', grade: 'A', label: 'Elite', score: 82, subMetrics: ['7.4km', '27.3 top', '14 sprints'] },
    { category: 'Passing', grade: 'B', label: 'Good', score: 68, subMetrics: ['73% completion', '4 key passes'] },
    { category: 'Dribbling', grade: 'B', label: 'Good', score: 71, subMetrics: ['68% success', '12 attempts'] },
    { category: 'Control', grade: 'B-', label: 'Above Average', score: 65, subMetrics: ['71% retention'] },
    { category: 'Defending', grade: 'B', label: 'Good', score: 70, subMetrics: ['6 duels', '3 interceptions'] },
    { category: 'Impact', grade: 'A-', label: 'Excellent', score: 87, subMetrics: ['1 goal', '2 assists'] },
  ]

  // Season progression data
  const seasonProgressData = [
    { match: 'Jan 6', score: 65 },
    { match: 'Jan 13', score: 69 },
    { match: 'Jan 20', score: 72 },
    { match: 'Jan 27', score: 68 },
    { match: 'Feb 7', score: 75 },
    { match: 'Feb 14', score: 71 },
    { match: 'Feb 24', score: 78 },
    { match: 'Feb 28', score: 81 },
  ]

  // Percentile bars
  const percentileItems = [
    { metric: 'Sprint Speed', percentile: 84, topPct: 'Top 16%' },
    { metric: 'Distance', percentile: 79, topPct: 'Top 21%' },
    { metric: 'Pass Completion', percentile: 61, topPct: 'Top 39%' },
    { metric: 'Dribble Success', percentile: 67, topPct: 'Top 33%' },
    { metric: 'Defensive Actions', percentile: 55, topPct: 'Top 45%' },
    { metric: 'Goals + Assists', percentile: 88, topPct: 'Top 12%' },
  ]

  if (!player) {
    return (
      <div style={{ background: COLORS.lightBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: COLORS.muted, fontSize: 16 }}>Player not found</p>
      </div>
    )
  }

  function handleSendFlag() {
    setFlagSheetPlayerId(null)
    setFlagNote('')
    setToastVisible(true)
  }

  function getPercentileColor(percentile: number): string {
    if (percentile > 60) return '#27AE60'
    if (percentile >= 40) return '#F39C12'
    return '#E74C3C'
  }

  return (
    <div style={{ background: COLORS.lightBg, minHeight: '100vh' }}>
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ken-burns { from { transform: scale(1.06); } to { transform: scale(1); } }
        @keyframes arc-fill { from { stroke-dashoffset: 201; } }
        @keyframes shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
      ` }} />

      {/* CINEMATIC HERO */}
      <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
        {/* Player photo background */}
        {player.photo && !heroImgError ? (
          <Image
            src={player.photo}
            alt={`${player.firstName} ${player.lastName}`}
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'top center',
              animation: 'ken-burns 2s ease-out forwards',
            }}
            onError={() => setHeroImgError(true)}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: getPositionGradient(position),
          }} />
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,16,32,0.2) 0%, rgba(13,16,32,0.4) 40%, rgba(13,16,32,0.98) 100%)',
          zIndex: 1,
        }} />

        {/* Top bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}>
          <div onClick={() => router.back()} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={24} color="#fff" />
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 20,
            padding: '4px 12px',
          }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>MAK Academy</span>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#4A4AFF', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' as const }}>
              {position === 'CM' ? 'CENTRAL MIDFIELDER' : position === 'ST' ? 'STRIKER' : position === 'CB' ? 'CENTER BACK' : position === 'GK' ? 'GOALKEEPER' : position === 'RW' ? 'RIGHT WINGER' : position === 'LB' ? 'LEFT BACK' : position === 'RB' ? 'RIGHT BACK' : position === 'LW' ? 'LEFT WINGER' : position} · #{player.jerseyNumber}
            </div>
            <div style={{
              color: '#fff',
              fontSize: 28,
              fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginTop: 2,
            }}>
              {player.firstName} {player.lastName}
            </div>
            {/* Stats strip */}
            <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
              <div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{compositeScore}</div>
                <div style={{ color: '#9DA2B3', fontSize: 11 }}>Score</div>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{distanceCovered}km</div>
                <div style={{ color: '#9DA2B3', fontSize: 11 }}>Distance</div>
              </div>
              <div>
                <div style={{ color: diff > 0 ? '#27AE60' : diff < 0 ? '#E74C3C' : '#9DA2B3', fontSize: 16, fontWeight: 700 }}>
                  {diff > 0 ? `\u2191+${diff}` : diff < 0 ? `\u2193${diff}` : '\u2192'}
                </div>
                <div style={{ color: '#9DA2B3', fontSize: 11 }}>vs Avg</div>
              </div>
            </div>
          </div>

          {/* Score arc SVG */}
          <svg width={68} height={68} viewBox="0 0 68 68">
            <circle cx={34} cy={34} r={32} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
            <circle
              cx={34} cy={34} r={32}
              fill="none"
              stroke="#4A4AFF"
              strokeWidth={4}
              strokeDasharray={201}
              strokeDashoffset={201 - (201 * compositeScore / 100)}
              strokeLinecap="round"
              transform="rotate(-90 34 34)"
              style={{ animation: 'arc-fill 1.5s ease-out forwards' }}
            />
            <text x={34} y={38} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={700}>
              {compositeScore}
            </text>
          </svg>
        </div>
      </div>

      {/* TAB BAR */}
      <div
        style={{
          background: '#1B1650',
          padding: '0 16px',
          height: 44,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {(['stats', 'highlights', 'footage', 'notes'] as TabKey[]).map(tab => {
          const isActive = activeTab === tab
          const labels: Record<TabKey, string> = { stats: 'Stats', highlights: 'Highlights', footage: 'Footage', notes: 'Notes' }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                textAlign: 'center',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                padding: '12px 0',
                color: isActive ? '#FFFFFF' : '#9DA2B3',
                fontWeight: isActive ? 700 : 400,
                fontSize: 14,
              }}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* ═══ STATS TAB ═══ */}
      {activeTab === 'stats' && (
        <div style={{ background: '#F5F6FC', padding: 16 }}>
          {/* 1) Physical Stats Cards Row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
            {[
              { value: `${distanceCovered} km`, trend: '(+9% vs avg)', label: 'Distance' },
              { value: `${topSpeed} km/h`, trend: '(+8%)', label: 'Top Speed' },
              { value: `${sprintCount}`, trend: '(+27%)', label: 'Sprints' },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 14,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy }}>{card.value}</div>
                <div style={{ fontSize: 12, color: '#27AE60', marginTop: 2 }}>{card.trend}</div>
                <div style={{ fontSize: 11, color: '#9DA2B3', marginTop: 2 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* 2) Radar Chart */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginTop: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
              Performance Radar
            </div>
            <RadarChartSection data={radarData} />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A4AFF' }} />
                <span style={{ fontSize: 11, color: '#9DA2B3' }}>This Session</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9DA2B3' }} />
                <span style={{ fontSize: 11, color: '#9DA2B3' }}>Season Avg</span>
              </div>
            </div>
          </div>

          {/* 3) Category Grades Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginTop: 12,
            }}
          >
            {categoryGrades.map((cg, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{cg.category}</div>
                    <div style={{ fontSize: 12, color: '#9DA2B3', marginTop: 2 }}>{cg.label}</div>
                    <div style={{ fontSize: 11, color: '#9DA2B3', marginTop: 2 }}>{cg.score}/100</div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: getGradeColor(cg.grade) }}>
                    {cg.grade}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {cg.subMetrics.map((sm, j) => (
                    <span
                      key={j}
                      style={{
                        background: '#F5F6FC',
                        color: '#6E7180',
                        fontSize: 11,
                        borderRadius: 8,
                        padding: '2px 8px',
                      }}
                    >
                      {sm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 4) Season Progression Chart */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginTop: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
              Season Progression
            </div>
            <SeasonProgressChart data={seasonProgressData} />
          </div>

          {/* 5) Percentile Bars */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginTop: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Peer Comparison</div>
            <div style={{ fontSize: 12, color: '#9DA2B3', marginTop: 2, marginBottom: 16 }}>vs U12 Midfielders</div>

            {percentileItems.map((item, i) => (
              <div key={i} style={{ marginBottom: i < percentileItems.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: COLORS.navy }}>{item.metric}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{item.percentile}th</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#F5F6FC', position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: getPercentileColor(item.percentile),
                      width: barsAnimated ? `${item.percentile}%` : '0%',
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: '#9DA2B3' }}>{item.topPct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ HIGHLIGHTS TAB ═══ */}
      {activeTab === 'highlights' && (() => {
        const filteredHighlights = playerHighlights.filter(h => {
          if (highlightFilter === 'coach') return h.flaggedByCoach
          if (highlightFilter === 'ai') return !h.flaggedByCoach
          return true
        })
        return (
        <div style={{ padding: 16 }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['all', 'ai', 'coach'] as const).map(f => {
              const labels = { all: 'All', ai: 'AI Detected', coach: 'Coach Picks' }
              const isActive = highlightFilter === f
              return (
                <button key={f} onClick={() => setHighlightFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: isActive ? '#4A4AFF' : '#F5F6FC',
                  color: isActive ? '#fff' : '#6E7180',
                  border: 'none',
                }}>
                  {labels[f]}
                </button>
              )
            })}
          </div>

          {filteredHighlights.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Film size={48} color="#9DA2B3" />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginTop: 12 }}>
                No highlights yet for {player.firstName}
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4, textAlign: 'center' }}>
                Highlights are generated automatically after each session analysis.
              </div>
            </div>
          ) : (
            filteredHighlights.map(h => {
              const badge = getEventBadge(h.eventType)
              const session = sessions.find(s => s.id === h.sessionId)
              const sessionLabel = session?.opponent
                ? `vs ${session.opponent}`
                : 'Training'
              const sessionDate = session ? formatSessionDate(session.date) : ''
              const minute = Math.floor(h.timestampSeconds / 60)

              return (
                <div
                  key={h.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Left side: badge + context */}
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 10,
                          background: badge.bg,
                          color: badge.color,
                          display: 'inline-block',
                        }}
                      >
                        {badge.label}
                      </span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginTop: 6 }}>
                        {sessionLabel} &middot; {sessionDate}
                      </div>
                      <div style={{ fontSize: 12, color: '#9DA2B3', marginTop: 2 }}>
                        {minute}th min &middot; {h.durationSeconds}s
                      </div>
                    </div>

                    {/* Thumbnail placeholder */}
                    <div
                      style={{
                        width: 80,
                        height: 56,
                        background: COLORS.navy,
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                        marginLeft: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Play button */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid #4A4AFF',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            marginLeft: 2,
                          }}
                        />
                      </div>
                      {/* Coach Pick badge */}
                      {h.flaggedByCoach && (
                        <div style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 20,
                          padding: '3px 8px',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {'\uD83C\uDFC6'} Coach Pick
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => {
                        setFlagSheetPlayerId(playerId)
                        setFlagNote('')
                      }}
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.navy,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {'\uD83D\uDCCC'} Flag for Player
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          'https://wa.me/?text=Coach flagged a highlight for you: fairpl.ai/clip/demo'
                        )
                      }
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.navy,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {'\uD83D\uDCAC'} WhatsApp
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
        )
      })()}

      {/* ═══ FOOTAGE TAB ═══ */}
      {activeTab === 'footage' && (
        <div style={{ padding: 16 }}>
          {/* Label */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>Training Sessions</span>
            <span
              style={{
                background: COLORS.lightBg,
                color: COLORS.muted,
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 10,
                marginLeft: 8,
              }}
            >
              {footageSessions.length}
            </span>
          </div>

          {/* Note card */}
          <div
            style={{
              background: COLORS.lightBg,
              borderRadius: 8,
              padding: '10px 14px',
              margin: '12px 0',
            }}
          >
            <span style={{ fontSize: 12, color: COLORS.muted, fontStyle: 'italic' }}>
              Training footage is only visible to coaches and is never shared with parents.
            </span>
          </div>

          {footageSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Film size={48} color="#9DA2B3" />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginTop: 12 }}>
                No training footage available yet.
              </div>
            </div>
          ) : (
            footageSessions.map(s => {
              const pitch = pitches.find(p => p.id === s.pitchId)
              return (
                <div
                  key={s.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 8,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: COLORS.navy, fontWeight: 600 }}>
                      {formatSessionDateFull(s.date)}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                      {formatDuration(s.startTime, s.endTime)} &middot; {pitch?.name ?? ''}
                    </div>
                  </div>
                  <button
                    style={{
                      background: COLORS.primary,
                      color: '#FFFFFF',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Watch
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ═══ NOTES TAB ═══ */}
      {activeTab === 'notes' && (
        <div style={{ padding: 16 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginTop: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Private Coach Notes</div>
            <div style={{ fontSize: 12, color: '#9DA2B3', marginTop: 2, marginBottom: 12 }}>Only visible to you</div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add notes about this player's development, areas to focus on..."
              style={{
                width: '100%',
                minHeight: 120,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {lastSaved && (
              <div style={{ fontSize: 11, color: '#9DA2B3', marginTop: 4 }}>Last saved: {lastSaved}</div>
            )}
          </div>
        </div>
      )}

      {/* FLAG BOTTOM SHEET */}
      {flagSheetPlayerId && (
        <div
          onClick={() => setFlagSheetPlayerId(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px 16px 0 0',
              padding: 20,
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                width: 36,
                height: 4,
                background: COLORS.border,
                borderRadius: 2,
                margin: '0 auto 16px',
              }}
            />

            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>
              Send to {player.firstName} &amp; Parent
            </div>

            <textarea
              value={flagNote}
              onChange={e => setFlagNote(e.target.value)}
              placeholder="Add a note for the player..."
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: 12,
                width: '100%',
                height: 80,
                marginTop: 12,
                fontSize: 14,
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />

            <button
              onClick={handleSendFlag}
              style={{
                background: COLORS.primary,
                color: '#FFFFFF',
                width: '100%',
                height: 44,
                borderRadius: 8,
                marginTop: 12,
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: COLORS.navy,
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            zIndex: 1001,
          }}
        >
          Sent &#10003;
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: 24 }} />
    </div>
  )
}
