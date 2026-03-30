'use client'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Film, Share2 } from 'lucide-react'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import KeyMetricsBlock from '@/components/shared/KeyMetricsBlock'
import PlayerCardShareModal from '@/components/shared/PlayerCardShareModal'
import { COLORS } from '@/lib/constants'
import { players, rosters, squadScores, highlights, sessions, pitches, matchAnalyses, benchmarkData } from '@/lib/mockData'
import type { BenchmarkGroup, BenchmarkAverage } from '@/lib/types'
import dynamic from 'next/dynamic'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 300 }} /> })

const SeasonProgressChart = dynamic(
  () => import('recharts').then(mod => {
    const { LineChart, Line, XAxis, YAxis, Area, ResponsiveContainer } = mod

    function SeasonProgressComponent({ data }: { data: { match: string; score: number }[] }) {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="match" tick={{ fontSize: 11, fill: '#9DA2B3' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Area type="monotone" dataKey="score" fill="#4A4AFF" fillOpacity={0.1} stroke="none" />
            <Line type="monotone" dataKey="score" stroke="#4A4AFF" strokeWidth={2.5} dot={{ fill: '#FFFFFF', stroke: '#4A4AFF', strokeWidth: 2, r: 4 }} activeDot={{ fill: '#4A4AFF', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }} />
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
      return { bg: '#FEF3C7', color: '#92400E', label: '⚽ Goal' }
    case 'key_pass':
      return { bg: '#EFF6FF', color: '#1E40AF', label: '🎯 Key Pass' }
    case 'sprint_recovery':
      return { bg: '#DCFCE7', color: '#166534', label: '⚡ Sprint' }
    case 'tackle':
      return { bg: '#F3E8FF', color: '#6B21A8', label: '🛡 Tackle' }
    case 'save':
      return { bg: '#FEF3C7', color: '#92400E', label: '🧤 Save' }
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

type TabKey = 'stats' | 'highlights' | 'notes'
type PerformanceCategory = 'Physical' | 'Positional' | 'Passing' | 'Dribbling' | 'Control' | 'Defending'

interface CategoryStat {
  label: string
  value: string
  avg: string
  pct: string
  positive: boolean
}

const categoryStatsMap: Record<PerformanceCategory, CategoryStat[]> = {
  Physical: [
    { label: 'Distance', value: '7.4 km', avg: '6.8 km', pct: '+9%', positive: true },
    { label: 'Top Speed', value: '27.3 km/h', avg: '25.1 km/h', pct: '+8%', positive: true },
    { label: 'Sprints', value: '14', avg: '11', pct: '+27%', positive: true },
  ],
  Positional: [
    { label: 'Heat Map', value: '68%', avg: '62%', pct: '+10%', positive: true },
    { label: 'Avg Position', value: 'Advanced', avg: 'Normal', pct: '+1', positive: true },
    { label: 'Zone Entries', value: '12', avg: '9', pct: '+33%', positive: true },
  ],
  Passing: [
    { label: 'Completion', value: '73%', avg: '69%', pct: '+6%', positive: true },
    { label: 'Key Passes', value: '4', avg: '3', pct: '+33%', positive: true },
    { label: 'Long Balls', value: '6', avg: '4', pct: '+50%', positive: true },
  ],
  Dribbling: [
    { label: 'Completed', value: '5', avg: '4', pct: '+25%', positive: true },
    { label: 'Success Rate', value: '71%', avg: '68%', pct: '+4%', positive: true },
    { label: 'Chances', value: '3', avg: '2', pct: '+50%', positive: true },
  ],
  Control: [
    { label: 'Touches', value: '48', avg: '42', pct: '+14%', positive: true },
    { label: 'Retention', value: '82%', avg: '78%', pct: '+5%', positive: true },
    { label: '1st Touch', value: 'Good', avg: 'Avg', pct: '+1', positive: true },
  ],
  Defending: [
    { label: 'Tackles', value: '4', avg: '3', pct: '+33%', positive: true },
    { label: 'Intercepts', value: '3', avg: '2', pct: '+50%', positive: true },
    { label: 'Duels Won', value: '67%', avg: '61%', pct: '+10%', positive: true },
  ],
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginTop: 24,
  marginBottom: 12,
}

/* ── Benchmark Bar Row ── */
function ArrowUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 3V11M7 11L3.5 7.5M7 11L10.5 7.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BarRow({ item, animate, playerName }: { item: BenchmarkAverage; animate: boolean; playerName: string }) {
  const diff = item.playerValue - item.groupAverage
  const isAbove = diff > 0
  const isBelow = diff < 0
  const playerWidth = animate ? `${item.playerValue}%` : '0%'
  const groupWidth = animate ? `${item.groupAverage}%` : '0%'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{item.metric}</span>
        {isAbove && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#10B98114', borderRadius: 8, padding: '1px 6px' }}>
            <ArrowUp />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>+{diff}</span>
          </div>
        )}
        {isBelow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#EF444414', borderRadius: 8, padding: '1px 6px' }}>
            <ArrowDown />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444' }}>{diff}</span>
          </div>
        )}
      </div>
      {/* Player bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ height: 22, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: playerWidth,
            background: 'linear-gradient(90deg, #4A4AFF, #757FFF)',
            borderRadius: 6, transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
            minWidth: animate && item.playerValue > 0 ? 60 : 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
              {playerName}: {item.playerValue}th
            </span>
          </div>
        </div>
      </div>
      {/* Group average bar */}
      <div>
        <div style={{ height: 22, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: groupWidth,
            background: '#C5C8D4', borderRadius: 6,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
            minWidth: animate && item.groupAverage > 0 ? 60 : 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
              {item.groupLabel}: {item.groupAverage}th
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const comparisonOptions: { key: BenchmarkGroup; label: string }[] = [
  { key: 'academy', label: 'Academy' },
  { key: 'position', label: 'Position' },
  { key: 'age_group', label: 'Age Group' },
]

/* ── Main Component ── */
export default function WebPlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [activeTab, setActiveTab] = useState<TabKey>('stats')
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory>('Physical')
  const [tileOpacity, setTileOpacity] = useState(1)
  const [displayedCategory, setDisplayedCategory] = useState<PerformanceCategory>('Physical')
  const [flagSheetPlayerId, setFlagSheetPlayerId] = useState<string | null>(null)
  const [flagNote, setFlagNote] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [heroImgError, setHeroImgError] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'ai' | 'coach'>('all')
  const [shareOpen, setShareOpen] = useState(false)
  const [highlightPrivacy, setHighlightPrivacy] = useState<Record<string, string>>({})
  const [highlightWatermarks, setHighlightWatermarks] = useState<Record<string, boolean>>({})
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({})
  const [sessionNotesLastSaved, setSessionNotesLastSaved] = useState<string | null>(null)

  // Benchmark state
  const [benchmarkGroup, setBenchmarkGroup] = useState<BenchmarkGroup>('academy')
  const [benchmarkAnimate, setBenchmarkAnimate] = useState(false)
  const benchmarkRef = useRef<HTMLDivElement>(null)
  const benchmarkHasAnimated = useRef(false)

  const player = players.find(p => p.id === playerId)
  const score = squadScores[playerId]
  const compositeScore = score?.compositeScore ?? 0
  const position = player?.position[0] || 'CM'
  const rosterName = getPlayerRosterName(playerId)
  const diff = compositeScore - (score?.avgScore ?? 0)

  const analysis = useMemo(
    () => matchAnalyses.find(a => a.playerId === playerId),
    [playerId]
  )

  const playerHighlights = useMemo(
    () => highlights.filter(h => h.playerId === playerId),
    [playerId]
  )

  const matchFootageSessions = useMemo(
    () =>
      sessions.filter(
        s =>
          s.participatingPlayerIds.includes(playerId) &&
          s.type === 'match' &&
          (s.status === 'analysed' || s.status === 'complete')
      ).sort((a, b) => b.date.localeCompare(a.date)),
    [playerId]
  )

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

  // Load notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`fairplai_notes_${playerId}`)
      if (saved) setNoteText(saved)
      const privData = localStorage.getItem('fairplai_highlight_privacy')
      if (privData) setHighlightPrivacy(JSON.parse(privData))
      const wmData = localStorage.getItem('fairplai_highlight_watermarks')
      if (wmData) setHighlightWatermarks(JSON.parse(wmData))
      const snData = localStorage.getItem(`fairplai_session_notes_${playerId}`)
      if (snData) setSessionNotes(JSON.parse(snData))
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

  // Fade transition for category stat tiles
  useEffect(() => {
    if (selectedCategory !== displayedCategory) {
      setTileOpacity(0)
      const timer = setTimeout(() => {
        setDisplayedCategory(selectedCategory)
        setTileOpacity(1)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [selectedCategory, displayedCategory])

  // Benchmark intersection observer
  const onBenchmarkIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting && !benchmarkHasAnimated.current) {
      benchmarkHasAnimated.current = true
      setBenchmarkAnimate(true)
    }
  }, [])

  useEffect(() => {
    const node = benchmarkRef.current
    if (!node) return
    const observer = new IntersectionObserver(onBenchmarkIntersect, { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [onBenchmarkIntersect])

  const handleBenchmarkGroupChange = (group: BenchmarkGroup) => {
    setBenchmarkGroup(group)
    setBenchmarkAnimate(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBenchmarkAnimate(true)
      })
    })
  }

  const benchmarkMetrics = benchmarkData[benchmarkGroup] ?? []

  const distanceCovered = analysis?.distanceCovered ?? 7.4
  const topSpeed = analysis?.topSpeed ?? 27.3

  const radarData = useMemo(() => {
    const playerScores = analysis
      ? [analysis.physicalScore, analysis.positionalScore, analysis.passingScore, analysis.dribblingScore, analysis.controlScore, analysis.defendingScore]
      : [82, 74, 68, 71, 65, 70]
    const avgScores = [76, 70, 65, 68, 62, 67]
    const categories = ['Physical', 'Positional', 'Passing', 'Dribbling', 'Control', 'Defending']
    return categories.map((cat, i) => ({ category: cat, score: playerScores[i], avg: avgScores[i] }))
  }, [analysis])

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

  if (!player) {
    return (
      <div style={{ background: '#F5F6FC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: 16 }}>Player not found</p>
      </div>
    )
  }

  function handleSendFlag() {
    setFlagSheetPlayerId(null)
    setFlagNote('')
    setToastVisible(true)
  }

  // Score arc calculations
  const arcRadius = 38
  const arcCircumference = 2 * Math.PI * arcRadius
  const arcOffset = arcCircumference - (arcCircumference * compositeScore / 100)

  const positionFullName = position === 'CM' ? 'CENTRAL MIDFIELDER' : position === 'ST' ? 'STRIKER' : position === 'CB' ? 'CENTER BACK' : position === 'GK' ? 'GOALKEEPER' : position === 'RW' ? 'RIGHT WINGER' : position === 'LB' ? 'LEFT BACK' : position === 'RB' ? 'RIGHT BACK' : position === 'LW' ? 'LEFT WINGER' : position

  return (
    <div style={{ background: '#F5F6FC', minHeight: '100vh' }}>
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ken-burns { from { transform: scale(1.06); } to { transform: scale(1); } }
        @keyframes arc-fill { from { stroke-dashoffset: ${arcCircumference}; } }
        @keyframes shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
      ` }} />

      {/* CINEMATIC HERO */}
      <div style={{ height: 320, position: 'relative', overflow: 'hidden' }}>
        {player.photo && !heroImgError ? (
          <Image
            src={player.photo}
            alt={`${player.firstName} ${player.lastName}`}
            fill
            style={{ objectFit: 'cover', objectPosition: 'top center', animation: 'ken-burns 2.5s ease-out forwards' }}
            onError={() => setHeroImgError(true)}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: getPositionGradient(position) }} />
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,14,26,0.15), rgba(10,14,26,0.98))', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,14,26,0.3), transparent 70%)', zIndex: 1 }} />

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <div
            onClick={() => router.push('/coach/web/squad')}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} color="#fff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShareOpen(true)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Share2 size={18} color="#fff" />
            </button>
            <div style={{ background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px' }}>
              <span style={{ color: '#fff', fontSize: 12 }}>MAK Academy</span>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 32px', zIndex: 2, maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#4A4AFF', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
              {positionFullName} · #{player.jerseyNumber}
            </div>
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, textShadow: '0 2px 12px rgba(0,0,0,0.5)', marginTop: 4 }}>
              {player.firstName} {player.lastName}
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 14 }}>
              <div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{compositeScore}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Score</div>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{distanceCovered}km</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Distance</div>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{topSpeed} km/h</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Top Speed</div>
              </div>
              <div>
                <div style={{ color: diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : 'rgba(255,255,255,0.5)', fontSize: 20, fontWeight: 700 }}>
                  {diff > 0 ? `↑+${diff}` : diff < 0 ? `↓${diff}` : '→'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>vs Last</div>
              </div>
            </div>
          </div>

          {/* Score Arc */}
          <div>
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx={48} cy={48} r={arcRadius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={5} />
              <circle cx={48} cy={48} r={arcRadius} fill="none" stroke="#4A4AFF" strokeWidth={5}
                strokeDasharray={arcCircumference} strokeDashoffset={arcOffset}
                strokeLinecap="round" transform="rotate(-90 48 48)"
                style={{ animation: 'arc-fill 1s ease-out forwards' }}
              />
              <text x={48} y={52} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={700}>{compositeScore}</text>
            </svg>
          </div>
        </div>
      </div>

      {/* KEY METRICS */}
      <div style={{ background: '#111827', padding: '16px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <KeyMetricsBlock playerId={playerId} dark={true} />
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 48, display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 8 }}>
          {(['stats', 'highlights', 'notes'] as TabKey[]).map(tab => {
            const isActive = activeTab === tab
            const labels: Record<TabKey, string> = { stats: 'Stats', highlights: 'Highlights', notes: 'Notes' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 20px', textAlign: 'center', cursor: 'pointer', background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #4A4AFF' : '2px solid transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  fontWeight: isActive ? 600 : 400, fontSize: 14, whiteSpace: 'nowrap' as const,
                }}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div style={{ padding: '24px 0 32px' }}>

            {/* Radar Chart — full width */}
            <div style={sectionLabel}>PERFORMANCE</div>
            <div style={{ ...cardStyle, padding: '16px 0 8px', maxWidth: 600 }}>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '0 20px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4A4AFF', opacity: 0.7 }} />
                  <span style={{ fontSize: 11, color: '#6E7180', fontWeight: 600 }}>This Session</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#d1d5db' }} />
                  <span style={{ fontSize: 11, color: '#6E7180', fontWeight: 600 }}>Season Avg</span>
                </div>
              </div>
              <RadarChartDynamic
                data={radarData}
                selectedCategory={selectedCategory}
                onCategoryClick={(cat: string) => setSelectedCategory(cat as PerformanceCategory)}
              />
              <div style={{ textAlign: 'center', padding: '4px 20px 12px', fontSize: 12, color: '#9DA2B3' }}>
                Click a category on the radar to explore
              </div>
            </div>

            {/* Category Sub-Metrics (3 tiles below radar) */}
            <div style={{ maxWidth: 600, marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                {displayedCategory} Stats
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
                opacity: tileOpacity, transition: 'opacity 150ms ease',
              }}>
                {categoryStatsMap[displayedCategory].map(({ label, value, avg, pct, positive }) => {
                  const pctColor = positive ? '#10B981' : '#EF4444'
                  return (
                    <div key={label} style={{ ...cardStyle, padding: '16px 12px', textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1, margin: 0 }}>{value}</p>
                      <p style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginTop: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 10, color: '#9DA2B3', marginTop: 2, margin: '2px 0 0' }}>{avg}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: pctColor, marginTop: 2, margin: '2px 0 0' }}>{pct}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Row: Season Progression + Benchmarking side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8 }}>

              {/* Left: Season Progression */}
              <div>
                <div style={sectionLabel}>SEASON</div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Season Progression</div>
                  <SeasonProgressChart data={seasonProgressData} />
                </div>
              </div>

              {/* Right: Benchmarking (parent-style) */}
              <div>
                <div style={sectionLabel}>BENCHMARKING</div>
                <div style={{ ...cardStyle, padding: '16px 16px 4px' }}>
                  <div style={{ fontSize: 13, color: '#9DA2B3', marginBottom: 12 }}>
                    How {player.firstName} compares
                  </div>

                  {/* Toggle pills */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F1F5F9', borderRadius: 12, padding: 4 }}>
                    {comparisonOptions.map(opt => {
                      const isActive = opt.key === benchmarkGroup
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleBenchmarkGroupChange(opt.key)}
                          style={{
                            flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 700,
                            color: isActive ? '#fff' : '#64748B',
                            background: isActive ? '#4A4AFF' : 'transparent',
                            border: 'none', borderRadius: 10, cursor: 'pointer',
                            transition: 'all 0.25s ease',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Bar rows */}
                  <div ref={benchmarkRef}>
                    {benchmarkMetrics.map(item => (
                      <BarRow key={item.metric} item={item} animate={benchmarkAnimate} playerName={player.firstName} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* HIGHLIGHTS TAB */}
        {activeTab === 'highlights' && (() => {
          const filteredHighlights = playerHighlights.filter(h => {
            if (highlightFilter === 'coach') return h.flaggedByCoach
            if (highlightFilter === 'ai') return !h.flaggedByCoach
            return true
          })
          return (
            <div style={{ padding: '24px 0 32px' }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['all', 'ai', 'coach'] as const).map(f => {
                  const labels = { all: 'All', ai: 'AI Detected', coach: 'Coach Picks' }
                  const isActive = highlightFilter === f
                  return (
                    <button key={f} onClick={() => setHighlightFilter(f)} style={{
                      padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: isActive ? '#4A4AFF' : '#FFFFFF',
                      color: isActive ? '#fff' : '#64748B',
                      border: isActive ? 'none' : '1px solid #E8EAED',
                    }}>
                      {labels[f]}
                    </button>
                  )
                })}
              </div>

              {filteredHighlights.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Film size={48} color="#64748B" />
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 12 }}>
                    No highlights yet for {player.firstName}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
                    Highlights are generated automatically after each session analysis.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {filteredHighlights.map(h => {
                    const badge = getEventBadge(h.eventType)
                    const session = sessions.find(s => s.id === h.sessionId)
                    const sessionLabel = session?.opponent ? `vs ${session.opponent}` : 'Training'
                    const sessionDate = session ? formatSessionDate(session.date) : ''
                    const minute = Math.floor(h.timestampSeconds / 60)

                    return (
                      <div key={h.id} style={cardStyle}>
                        {/* Thumbnail */}
                        <div style={{
                          width: '100%', height: 140, background: '#0F172A', borderRadius: 10,
                          overflow: 'hidden', position: 'relative',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                        }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{
                              width: 0, height: 0,
                              borderLeft: '14px solid #4A4AFF', borderTop: '8px solid transparent', borderBottom: '8px solid transparent',
                              marginLeft: 3,
                            }} />
                          </div>
                          {h.flaggedByCoach && (
                            <div style={{
                              position: 'absolute', top: 8, right: 8,
                              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                              backgroundSize: '200% 100%', animation: 'shimmer 2s infinite',
                              color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '4px 10px',
                              whiteSpace: 'nowrap' as const,
                            }}>
                              🏆 Coach Pick
                            </div>
                          )}
                        </div>

                        {/* Badge + context */}
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10,
                          background: badge.bg, color: badge.color, display: 'inline-block',
                        }}>
                          {badge.label}
                        </span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>
                          {sessionLabel} · {sessionDate}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          {minute}th min · {h.durationSeconds}s
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 12 }}>
                          <button
                            onClick={() => { setFlagSheetPlayerId(playerId); setFlagNote('') }}
                            style={{
                              flex: 1, background: '#FFFFFF', border: '1px solid #E8EAED', color: '#0F172A',
                              padding: '8px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', textAlign: 'center',
                            }}
                          >
                            📌 Flag
                          </button>
                          <button
                            onClick={() => window.open('https://wa.me/?text=Coach flagged a highlight for you: fairpl.ai/clip/demo')}
                            style={{
                              flex: 1, background: '#FFFFFF', border: '1px solid #E8EAED', color: '#0F172A',
                              padding: '8px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', textAlign: 'center',
                            }}
                          >
                            💬 Share
                          </button>
                        </div>

                        {/* Privacy controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginRight: 4 }}>Visibility:</span>
                          {(['parent_visible', 'team_only', 'private'] as const).map(p => {
                            const currentPrivacy = highlightPrivacy[h.id] || h.privacy || 'parent_visible'
                            const isActive = currentPrivacy === p
                            const labels = { parent_visible: 'Parent/Player', team_only: 'Team', private: 'Private' }
                            const colors = { parent_visible: '#27AE60', team_only: '#4A4AFF', private: '#6E7180' }
                            return (
                              <button
                                key={p}
                                onClick={() => {
                                  const newPrivacy = { ...highlightPrivacy, [h.id]: p }
                                  setHighlightPrivacy(newPrivacy)
                                  localStorage.setItem('fairplai_highlight_privacy', JSON.stringify(newPrivacy))
                                }}
                                style={{
                                  padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                  background: isActive ? `${colors[p]}1A` : '#F8F9FC',
                                  color: isActive ? colors[p] : '#9DA2B3',
                                  border: isActive ? `1px solid ${colors[p]}40` : '1px solid transparent',
                                }}
                              >
                                {labels[p]}
                              </button>
                            )
                          })}
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={highlightWatermarks[h.id] ?? h.watermarkEnabled ?? false}
                              onChange={(e) => {
                                const newWm = { ...highlightWatermarks, [h.id]: e.target.checked }
                                setHighlightWatermarks(newWm)
                                localStorage.setItem('fairplai_highlight_watermarks', JSON.stringify(newWm))
                              }}
                              style={{ width: 14, height: 14, accentColor: '#4A4AFF' }}
                            />
                            <span style={{ fontSize: 11, color: '#64748B' }}>Watermark</span>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div style={{ padding: '24px 0 32px', maxWidth: 800 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Private Coach Notes</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 14 }}>Only visible to you</div>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add notes about this player's development, areas to focus on..."
                style={{
                  width: '100%', minHeight: 180, border: '1px solid #E8EAED', borderRadius: 8,
                  padding: 14, fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box', lineHeight: 1.6,
                }}
              />
              {lastSaved && (
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>Last saved: {lastSaved}</div>
              )}
            </div>

            <div style={sectionLabel}>SESSION NOTES</div>
            {matchFootageSessions.length === 0 && footageSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748B', fontSize: 13 }}>No sessions to add notes for yet.</div>
            ) : (
              [...matchFootageSessions, ...footageSessions].map(s => {
                const sessionLabel = s.opponent ? `vs ${s.opponent}` : 'Training'
                const hasNote = !!sessionNotes[s.id]
                return (
                  <div key={s.id} style={{ ...cardStyle, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      {hasNote && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27AE60' }} />}
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{sessionLabel}</span>
                      <span style={{ fontSize: 13, color: '#64748B' }}>{formatSessionDateFull(s.date)}</span>
                    </div>
                    <textarea
                      value={sessionNotes[s.id] || ''}
                      onChange={e => {
                        const newNotes = { ...sessionNotes, [s.id]: e.target.value }
                        setSessionNotes(newNotes)
                        clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)[`_snTimer_${s.id}`])
                        ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>)[`_snTimer_${s.id}`] = setTimeout(() => {
                          localStorage.setItem(`fairplai_session_notes_${playerId}`, JSON.stringify(newNotes))
                          setSessionNotesLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                        }, 1500)
                      }}
                      placeholder={`Notes for ${sessionLabel}...`}
                      style={{
                        width: '100%', minHeight: 80, border: '1px solid #E8EAED', borderRadius: 8,
                        padding: 12, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                )
              })
            )}
            {sessionNotesLastSaved && (
              <div style={{ fontSize: 11, color: '#64748B', textAlign: 'right' }}>Session notes saved: {sessionNotesLastSaved}</div>
            )}
          </div>
        )}
      </div>

      {/* FLAG BOTTOM SHEET */}
      {flagSheetPlayerId && (
        <div
          onClick={() => setFlagSheetPlayerId(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Flag for Parent</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 }}>This clip will be highlighted in the parent portal</div>
            <textarea
              value={flagNote}
              onChange={e => setFlagNote(e.target.value)}
              placeholder="Add an optional note for the parent..."
              style={{ width: '100%', minHeight: 100, border: '1px solid #E8EAED', borderRadius: 8, padding: 12, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setFlagSheetPlayerId(null)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: '#F1F5F9', border: 'none', color: '#64748B', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSendFlag} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: '#4A4AFF', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Send to Parent</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 1001 }}>
          ✓ Sent to parent
        </div>
      )}

      {/* Share Modal */}
      {shareOpen && player && (
        <PlayerCardShareModal
          open={true}
          player={{
            name: `${player.firstName} ${player.lastName}`,
            position: position,
            jerseyNumber: player.jerseyNumber,
            team: rosterName,
            academy: 'MAK Academy',
            photo: player.photo,
          }}
          compositeScore={compositeScore}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
