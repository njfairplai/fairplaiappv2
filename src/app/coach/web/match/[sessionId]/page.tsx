'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronDown, ChevronUp, X } from 'lucide-react'
import { sessions, players, matchAnalyses, squadScores, rosters, pitches } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import type { MatchAnalysis, Player } from '@/lib/types'
import dynamic from 'next/dynamic'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 260 }} /> })

/* ── colour constants ── */
const C = {
  primary: '#4A4AFF',
  navy: '#0F172A',
  darkBg: '#0A0E1A',
  muted: '#64748B',
  lightBg: '#F5F6FC',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

/* ── game scores (hardcoded) ── */
const gameScores: Record<string, { score: string; result: 'W' | 'L' | 'D'; homeGoals: number; awayGoals: number }> = {
  session_005: { score: '2-1', result: 'W', homeGoals: 2, awayGoals: 1 },
  session_006: { score: '1-2', result: 'L', homeGoals: 1, awayGoals: 2 },
  session_007: { score: '3-1', result: 'W', homeGoals: 3, awayGoals: 1 },
  session_010: { score: '0-0', result: 'D', homeGoals: 0, awayGoals: 0 },
  session_013: { score: '2-0', result: 'W', homeGoals: 2, awayGoals: 0 },
  session_014: { score: '3-2', result: 'W', homeGoals: 3, awayGoals: 2 },
}

/* ── team stats for competitive matches (hardcoded) ── */
const teamStats: Record<string, { home: Record<string, number>; away: Record<string, number> }> = {
  session_007: {
    home: { possession: 54, passAccuracy: 78, totalPasses: 347, shotsOnTarget: 8, tackles: 18, corners: 5 },
    away: { possession: 46, passAccuracy: 65, totalPasses: 289, shotsOnTarget: 4, tackles: 14, corners: 3 },
  },
  session_005: {
    home: { possession: 58, passAccuracy: 81, totalPasses: 372, shotsOnTarget: 6, tackles: 15, corners: 7 },
    away: { possession: 42, passAccuracy: 68, totalPasses: 264, shotsOnTarget: 3, tackles: 12, corners: 2 },
  },
  session_006: {
    home: { possession: 48, passAccuracy: 72, totalPasses: 310, shotsOnTarget: 5, tackles: 16, corners: 4 },
    away: { possession: 52, passAccuracy: 75, totalPasses: 338, shotsOnTarget: 7, tackles: 19, corners: 6 },
  },
  session_010: {
    home: { possession: 51, passAccuracy: 74, totalPasses: 320, shotsOnTarget: 4, tackles: 20, corners: 5 },
    away: { possession: 49, passAccuracy: 71, totalPasses: 305, shotsOnTarget: 3, tackles: 17, corners: 4 },
  },
  session_013: {
    home: { possession: 62, passAccuracy: 84, totalPasses: 410, shotsOnTarget: 9, tackles: 14, corners: 8 },
    away: { possession: 38, passAccuracy: 62, totalPasses: 245, shotsOnTarget: 2, tackles: 11, corners: 1 },
  },
  session_014: {
    home: { possession: 55, passAccuracy: 77, totalPasses: 355, shotsOnTarget: 10, tackles: 16, corners: 6 },
    away: { possession: 45, passAccuracy: 70, totalPasses: 290, shotsOnTarget: 7, tackles: 18, corners: 5 },
  },
}

/* ── helpers ── */
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()]}, ${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function calcDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function getScoreColor(score: number): string {
  if (score >= 75) return C.success
  if (score >= 60) return C.warning
  return C.error
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#D97706'
  if (['CB', 'LB', 'RB'].includes(position)) return '#059669'
  if (['CM', 'AM', 'DM', 'CDM', 'CAM'].includes(position)) return C.primary
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#DC2626'
  return C.muted
}

function getPositionGroup(pos: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (pos === 'GK') return 'GK'
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DEF'
  if (['CM', 'AM', 'DM', 'CDM', 'CAM'].includes(pos)) return 'MID'
  if (['ST', 'CF', 'LW', 'RW'].includes(pos)) return 'FWD'
  return 'MID'
}

function getKeyStat(pos: string, analysis: MatchAnalysis): string {
  if (pos === 'GK') return `${Math.round(analysis.defendingScore / 10)} saves`
  if (['CB', 'LB', 'RB'].includes(pos)) return `${Math.round(analysis.defendingScore / 10)} tackles`
  if (['CM', 'CDM', 'CAM', 'AM', 'DM'].includes(pos)) return `${Math.round(analysis.passingScore / 20)} key passes`
  if (['ST', 'CF', 'LW', 'RW'].includes(pos)) return `${Math.round(analysis.dribblingScore / 20)} dribbles`
  return `${Math.round(analysis.passingScore / 20)} key passes`
}

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 80) return { grade: 'A', color: '#10B981' }
  if (score >= 65) return { grade: 'B', color: '#4A4AFF' }
  if (score >= 50) return { grade: 'C', color: '#F59E0B' }
  return { grade: 'D', color: '#EF4444' }
}

type SortField = 'score' | 'distance' | 'sprints'
type SortDir = 'asc' | 'desc'

interface PlayerRow {
  player: Player
  analysis: MatchAnalysis
  pos: string
  seasonAvg: number
  trend: number
  posGroup: 'GK' | 'DEF' | 'MID' | 'FWD'
}

/* ── component ── */
export default function WebMatchAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const session = sessions.find(s => s.id === sessionId)

  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [posFilter, setPosFilter] = useState<'All' | 'GK' | 'DEF' | 'MID' | 'FWD'>('All')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [matchNote, setMatchNote] = useState('')
  const [matchNoteLastSaved, setMatchNoteLastSaved] = useState<string | null>(null)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [playerNotes, setPlayerNotes] = useState<Record<string, string>>({})
  const [playerNoteLastSaved, setPlayerNoteLastSaved] = useState<string | null>(null)

  // Load coach notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      const saved = localStorage.getItem(`fairplai_match_note_${sessionId}`)
      if (saved) { setMatchNote(saved); setNotesExpanded(true) }
    }
  }, [sessionId])

  // Auto-save coach notes
  useEffect(() => {
    if (typeof window === 'undefined' || !matchNote || !sessionId) return
    const timer = setTimeout(() => {
      localStorage.setItem(`fairplai_match_note_${sessionId}`, matchNote)
      const now = new Date()
      setMatchNoteLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }, 1500)
    return () => clearTimeout(timer)
  }, [matchNote, sessionId])

  // Load player session note when panel opens
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedPlayerId && sessionId) {
      const key = `fairplai_player_session_note_${sessionId}_${selectedPlayerId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        setPlayerNotes(prev => ({ ...prev, [selectedPlayerId]: saved }))
      }
    }
  }, [selectedPlayerId, sessionId])

  // Auto-save player session notes
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedPlayerId || !sessionId) return
    const note = playerNotes[selectedPlayerId]
    if (!note) return
    const timer = setTimeout(() => {
      localStorage.setItem(`fairplai_player_session_note_${sessionId}_${selectedPlayerId}`, note)
      const now = new Date()
      setPlayerNoteLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }, 1500)
    return () => clearTimeout(timer)
  }, [playerNotes, selectedPlayerId, sessionId])

  // Derive data
  const sessionAnalyses = useMemo(() => matchAnalyses.filter(a => a.sessionId === sessionId), [sessionId])

  const playerRows = useMemo((): PlayerRow[] => {
    return sessionAnalyses.map(analysis => {
      const player = players.find(p => p.id === analysis.playerId)
      if (!player) return null
      const pos = player.position[0] || 'CM'
      const seasonAvg = squadScores[player.id]?.compositeScore ?? 0
      const trend = analysis.compositeScore - seasonAvg
      return { player, analysis, pos, seasonAvg, trend, posGroup: getPositionGroup(pos) }
    }).filter(Boolean) as PlayerRow[]
  }, [sessionAnalyses])

  function sortAndFilter(rows: PlayerRow[]): PlayerRow[] {
    let filtered = posFilter === 'All' ? rows : rows.filter(r => r.posGroup === posFilter)
    filtered = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortField) {
        case 'score': aVal = a.analysis.compositeScore; bVal = b.analysis.compositeScore; break
        case 'distance': aVal = a.analysis.distanceCovered; bVal = b.analysis.distanceCovered; break
        case 'sprints': aVal = a.analysis.sprintCount; bVal = b.analysis.sprintCount; break
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return filtered
  }

  // For competitive: single filtered list
  const filteredRows = useMemo(() => sortAndFilter(playerRows), [playerRows, posFilter, sortField, sortDir])

  // For training: split by team
  const teamARows = useMemo(() => sortAndFilter(playerRows.filter(r => r.analysis.teamAssignment === 'A')), [playerRows, posFilter, sortField, sortDir])
  const teamBRows = useMemo(() => sortAndFilter(playerRows.filter(r => r.analysis.teamAssignment === 'B')), [playerRows, posFilter, sortField, sortDir])

  // Average squad score
  const avgScore = useMemo(() => {
    if (sessionAnalyses.length === 0) return 0
    return Math.round(sessionAnalyses.reduce((sum, a) => sum + a.compositeScore, 0) / sessionAnalyses.length)
  }, [sessionAnalyses])

  // Team averages for training
  const teamAAvg = useMemo(() => {
    const teamA = sessionAnalyses.filter(a => a.teamAssignment === 'A')
    if (teamA.length === 0) return 0
    return Math.round(teamA.reduce((sum, a) => sum + a.compositeScore, 0) / teamA.length)
  }, [sessionAnalyses])

  const teamBAvg = useMemo(() => {
    const teamB = sessionAnalyses.filter(a => a.teamAssignment === 'B')
    if (teamB.length === 0) return 0
    return Math.round(teamB.reduce((sum, a) => sum + a.compositeScore, 0) / teamB.length)
  }, [sessionAnalyses])

  if (!session) {
    return (
      <div style={{ background: C.lightBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.muted, fontSize: 16 }}>Session not found</p>
      </div>
    )
  }

  const isCompetitive = session.type === 'match'
  const durationMin = calcDurationMinutes(session.startTime, session.endTime)
  const roster = rosters.find(r => r.id === session.rosterId)
  const pitch = pitches.find(p => p.id === session.pitchId)
  const gameScore = gameScores[sessionId]
  const stats = teamStats[sessionId]

  // Arc calculations
  const arcRadius = 36
  const arcCircumference = 2 * Math.PI * arcRadius
  const arcOffset = arcCircumference - (arcCircumference * avgScore / 100)

  // Sort toggle handler
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function renderSortArrow(field: SortField) {
    if (sortField !== field) return null
    return sortDir === 'desc' ? ' ↓' : ' ↑'
  }

  // Selected player data for side panel
  const selectedRow = selectedPlayerId ? playerRows.find(r => r.player.id === selectedPlayerId) : null

  /* ── Shared table renderer ── */
  function renderPlayerTable(rows: PlayerRow[], showMinutes: boolean, showPassPct: boolean) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              <th style={{ textAlign: 'left' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' as const }}>#</th>
              <th style={{ textAlign: 'left' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12 }}>Player</th>
              <th style={{ textAlign: 'left' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12 }}>Pos</th>
              <th
                onClick={() => handleSort('score')}
                style={{ textAlign: 'center' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' as const, whiteSpace: 'nowrap' as const }}
              >
                Score{renderSortArrow('score')}
              </th>
              <th style={{ textAlign: 'center' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12 }}>Trend</th>
              {showMinutes && (
                <th style={{ textAlign: 'center' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12 }}>Min</th>
              )}
              {showPassPct && (
                <th style={{ textAlign: 'center' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12 }}>Pass%</th>
              )}
              <th
                onClick={() => handleSort('distance')}
                style={{ textAlign: 'center' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' as const, whiteSpace: 'nowrap' as const }}
              >
                Distance{renderSortArrow('distance')}
              </th>
              <th
                onClick={() => handleSort('sprints')}
                style={{ textAlign: 'center' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' as const, whiteSpace: 'nowrap' as const }}
              >
                Sprints{renderSortArrow('sprints')}
              </th>
              <th style={{ textAlign: 'right' as const, padding: '10px 8px', color: C.muted, fontWeight: 600, fontSize: 12 }}>Key Stat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ player, analysis, pos, trend }) => {
              const scoreColor = getScoreColor(analysis.compositeScore)
              const posColor = getPositionColor(pos)
              return (
                <tr
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  style={{
                    borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
                    background: selectedPlayerId === player.id ? '#F8F9FF' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedPlayerId !== player.id) (e.currentTarget as HTMLElement).style.background = '#FAFBFF' }}
                  onMouseLeave={e => { if (selectedPlayerId !== player.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: C.navy, fontSize: 13 }}>
                    {player.jerseyNumber}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <PlayerAvatar player={player} size="sm" />
                      <span style={{ fontWeight: 600, color: C.navy, fontSize: 13 }}>
                        {player.firstName} {player.lastName}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 600, borderRadius: 8,
                      padding: '2px 8px', background: `${posColor}1A`, color: posColor,
                    }}>
                      {pos}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' as const }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: scoreColor }}>
                      {analysis.compositeScore}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' as const }}>
                    {trend !== 0 && (
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: trend > 0 ? C.success : C.error,
                      }}>
                        {trend > 0 ? `↑+${trend}` : `↓${trend}`}
                      </span>
                    )}
                    {trend === 0 && <span style={{ fontSize: 12, color: C.muted }}>—</span>}
                  </td>
                  {showMinutes && (
                    <td style={{ padding: '12px 8px', textAlign: 'center' as const, fontWeight: 600, color: C.navy, fontSize: 13 }}>
                      {analysis.minutesPlayed ?? '–'}&apos;
                    </td>
                  )}
                  {showPassPct && (
                    <td style={{ padding: '12px 8px', textAlign: 'center' as const, fontWeight: 600, color: C.navy, fontSize: 13 }}>
                      {analysis.passCompletion}%
                    </td>
                  )}
                  <td style={{ padding: '12px 8px', textAlign: 'center' as const, fontWeight: 600, color: C.navy, fontSize: 13 }}>
                    {analysis.distanceCovered.toFixed(1)} km
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' as const, fontWeight: 600, color: C.navy, fontSize: 13 }}>
                    {analysis.sprintCount}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' as const, fontSize: 13, color: C.muted, fontWeight: 500 }}>
                    {getKeyStat(pos, analysis)}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={showMinutes && showPassPct ? 10 : 8} style={{ padding: 32, textAlign: 'center' as const, color: C.muted, fontSize: 14 }}>
                  No player data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  /* ── Comparison bar renderer ── */
  function renderComparisonBar(label: string, homeVal: number, awayVal: number, isPercentage: boolean = false) {
    const total = homeVal + awayVal
    const homePct = total > 0 ? (homeVal / total) * 100 : 50
    const awayPct = 100 - homePct
    const suffix = isPercentage ? '%' : ''
    return (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
        <div style={{ width: 50, textAlign: 'right' as const, fontWeight: 700, fontSize: 15, color: C.navy }}>
          {homeVal}{suffix}
        </div>
        <div style={{ flex: 1, display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: '#F1F5F9' }}>
          <div style={{ width: `${homePct}%`, background: C.primary, borderRadius: '4px 0 0 4px', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${awayPct}%`, background: '#94A3B8', borderRadius: '0 4px 4px 0', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ width: 50, textAlign: 'left' as const, fontWeight: 700, fontSize: 15, color: '#64748B' }}>
          {awayVal}{suffix}
        </div>
        <div style={{ width: 120, fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
      </div>
    )
  }

  return (
    <div style={{ background: C.lightBg, minHeight: '100%' }}>

      {/* ─── HEADER ─── */}
      {isCompetitive ? (
        /* ── COMPETITIVE: Broadcast Scoreboard Hero ── */
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <Image
            src="/players/teamphoto.jpg"
            alt="Team"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(10,14,26,0.95) 0%, rgba(15,23,42,0.92) 100%)',
            zIndex: 1,
          }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '24px 32px 0' }}>
            {/* Back button */}
            <div
              onClick={() => router.push('/coach/web/analysis')}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', marginBottom: 16, maxWidth: 1200, margin: '0 auto 16px',
              }}
            >
              <ChevronLeft size={18} color="#fff" />
            </div>

            {/* Scoreboard */}
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' as const, padding: '16px 0 32px' }}>
              {/* Competition badge */}
              {session.competition && (
                <div style={{
                  display: 'inline-block', background: 'rgba(74,74,255,0.2)', color: '#818CF8',
                  fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '4px 14px', marginBottom: 16,
                  letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                }}>
                  {session.competition}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 12 }}>
                {/* Home team */}
                <div style={{ flex: 1, textAlign: 'right' as const }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{roster?.name ?? 'Home'}</div>
                </div>

                {/* Score */}
                {gameScore && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      fontSize: 48, fontWeight: 900, color: '#FFFFFF', lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {gameScore.homeGoals}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 300, color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}>–</div>
                    <div style={{
                      fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.6)', lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {gameScore.awayGoals}
                    </div>
                  </div>
                )}

                {/* Away team */}
                <div style={{ flex: 1, textAlign: 'left' as const }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>{session.opponent ?? 'Away'}</div>
                </div>
              </div>

              {/* Result badge + date */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {gameScore && (
                  <div style={{
                    background: gameScore.result === 'W' ? 'rgba(16,185,129,0.2)' : gameScore.result === 'L' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    color: gameScore.result === 'W' ? '#10B981' : gameScore.result === 'L' ? '#EF4444' : '#F59E0B',
                    fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '3px 12px',
                  }}>
                    {gameScore.result === 'W' ? 'Won' : gameScore.result === 'L' ? 'Lost' : 'Draw'}
                  </div>
                )}
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  {formatDateFull(session.date)} · {session.startTime} – {session.endTime} · {pitch?.name ?? 'Unknown Pitch'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── TRAINING: Standard Header ── */
        <div style={{ position: 'relative', overflow: 'hidden', padding: '32px 0' }}>
          <Image
            src="/players/teamphoto.jpg"
            alt="Team"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,14,26,0.85) 0%, rgba(10,14,26,0.98) 100%)',
            zIndex: 1,
          }} />
          <div style={{
            position: 'relative', zIndex: 2,
            maxWidth: 1200, margin: '0 auto', padding: '0 32px',
          }}>
            {/* Back button */}
            <div
              onClick={() => router.push('/coach/web/analysis')}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', marginBottom: 16,
              }}
            >
              <ChevronLeft size={18} color="#fff" />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                {/* Training badge */}
                <div style={{
                  display: 'inline-block', background: 'rgba(16,185,129,0.15)', color: '#10B981',
                  fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', marginBottom: 8,
                }}>
                  TRAINING MATCH
                </div>

                {/* Title */}
                <div style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 800 }}>
                  {roster?.name ?? 'Squad'} — Team A vs Team B
                </div>

                {/* Subtitle */}
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>
                  {formatDateFull(session.date)} · {session.startTime} – {session.endTime} ({durationMin} min) · {pitch?.name ?? 'Unknown Pitch'}
                </div>
              </div>

              {/* Avg Squad Score Arc */}
              {avgScore > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width={84} height={84} viewBox="0 0 84 84">
                    <circle cx={42} cy={42} r={arcRadius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
                    <circle cx={42} cy={42} r={arcRadius} fill="none" stroke={C.primary} strokeWidth={4}
                      strokeDasharray={arcCircumference} strokeDashoffset={arcOffset}
                      strokeLinecap="round" transform="rotate(-90 42 42)" />
                    <text x={42} y={46} textAnchor="middle" fill={getScoreColor(avgScore)} fontSize={20} fontWeight={700}>
                      {avgScore}
                    </text>
                  </svg>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Avg Squad Score</div>
                    <div style={{ color: getScoreColor(avgScore), fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                      {avgScore >= 75 ? 'Strong Performance' : avgScore >= 60 ? 'Average Performance' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px 48px' }}>

        {/* ─── COMPETITIVE: Comparison Bars ─── */}
        {isCompetitive && stats && (
          <div style={{
            background: '#FFFFFF', borderRadius: 14, padding: '20px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Match Statistics</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>{roster?.name ?? 'Home'}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>{session.opponent ?? 'Away'}</span>
            </div>
            {renderComparisonBar('Possession', stats.home.possession, stats.away.possession, true)}
            {renderComparisonBar('Pass Accuracy', stats.home.passAccuracy, stats.away.passAccuracy, true)}
            {renderComparisonBar('Total Passes', stats.home.totalPasses, stats.away.totalPasses)}
            {renderComparisonBar('Shots on Target', stats.home.shotsOnTarget, stats.away.shotsOnTarget)}
            {renderComparisonBar('Tackles', stats.home.tackles, stats.away.tackles)}
            {renderComparisonBar('Corners', stats.home.corners, stats.away.corners)}
          </div>
        )}

        {/* ─── POSITION FILTER PILLS (shared for both layouts) ─── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['All', 'GK', 'DEF', 'MID', 'FWD'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setPosFilter(filter)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: posFilter === filter ? C.primary : '#F1F5F9',
                color: posFilter === filter ? '#fff' : C.muted,
                transition: 'all 0.15s ease',
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ─── TRAINING: Stacked Team Tables ─── */}
        {!isCompetitive && (
          <>
            {/* Team A */}
            <div style={{
              background: '#FFFFFF', borderRadius: 14, padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Team A</span>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>({teamARows.length} players)</span>
                </div>
                {teamAAvg > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Avg Score</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(teamAAvg) }}>{teamAAvg}</span>
                  </div>
                )}
              </div>
              {renderPlayerTable(teamARows, false, false)}
            </div>

            {/* Team B */}
            <div style={{
              background: '#FFFFFF', borderRadius: 14, padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3B82F6' }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Team B</span>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>({teamBRows.length} players)</span>
                </div>
                {teamBAvg > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Avg Score</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(teamBAvg) }}>{teamBAvg}</span>
                  </div>
                )}
              </div>
              {renderPlayerTable(teamBRows, false, false)}
            </div>
          </>
        )}

        {/* ─── COMPETITIVE: Single Player Table ─── */}
        {isCompetitive && (
          <div style={{
            background: '#FFFFFF', borderRadius: 14, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 16 }}>
              Player Performance
            </div>
            {renderPlayerTable(filteredRows, true, true)}
          </div>
        )}

        {/* ─── COACH NOTES ─── */}
        <div style={{
          background: '#FFFFFF', borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            style={{
              width: '100%', background: '#fff', padding: '14px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.navy,
            }}
          >
            Coach Notes
            {notesExpanded ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
          </button>
          {notesExpanded && (
            <div style={{ padding: '0 24px 20px' }}>
              <textarea
                value={matchNote}
                onChange={e => setMatchNote(e.target.value)}
                placeholder="Add notes about this session..."
                style={{
                  width: '100%', minHeight: 100, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: 12, fontSize: 14, resize: 'vertical',
                  fontFamily: 'inherit', boxSizing: 'border-box' as const,
                }}
              />
              {matchNoteLastSaved && (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Last saved: {matchNoteLastSaved}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── PLAYER SIDE PANEL ─── */}
      {selectedRow && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSelectedPlayerId(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 100, cursor: 'pointer',
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
            background: '#FFFFFF', zIndex: 101, overflowY: 'auto' as const,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.25s ease-out',
          }}>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}} />

            {/* Close button */}
            <div
              onClick={() => setSelectedPlayerId(null)}
              style={{
                position: 'absolute' as const, top: 16, right: 16,
                width: 32, height: 32, borderRadius: '50%',
                background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10,
              }}
            >
              <X size={16} color={C.muted} />
            </div>

            {/* Player header */}
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <PlayerAvatar player={selectedRow.player} size="lg" />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>
                    {selectedRow.player.firstName} {selectedRow.player.lastName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '2px 8px',
                      background: `${getPositionColor(selectedRow.pos)}1A`, color: getPositionColor(selectedRow.pos),
                    }}>
                      {selectedRow.pos}
                    </span>
                    <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>#{selectedRow.player.jerseyNumber}</span>
                    {/* Team badge for training */}
                    {!isCompetitive && selectedRow.analysis.teamAssignment && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '2px 8px',
                        background: selectedRow.analysis.teamAssignment === 'A' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                        color: selectedRow.analysis.teamAssignment === 'A' ? '#EF4444' : '#3B82F6',
                      }}>
                        Team {selectedRow.analysis.teamAssignment}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Session composite score arc */}
              {(() => {
                const s = selectedRow.analysis.compositeScore
                const r = 40
                const circ = 2 * Math.PI * r
                const off = circ - (circ * s / 100)
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '16px', background: '#F8F9FC', borderRadius: 12 }}>
                    <svg width={96} height={96} viewBox="0 0 96 96">
                      <circle cx={48} cy={48} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5} />
                      <circle cx={48} cy={48} r={r} fill="none" stroke={getScoreColor(s)} strokeWidth={5}
                        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 48 48)" />
                      <text x={48} y={52} textAnchor="middle" fill={getScoreColor(s)} fontSize={24} fontWeight={800}>
                        {s}
                      </text>
                    </svg>
                    <div>
                      <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>Session Score</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: getScoreColor(s), marginTop: 2 }}>
                        {s >= 75 ? 'Strong' : s >= 60 ? 'Average' : 'Needs Work'}
                      </div>
                      {selectedRow.trend !== 0 && (
                        <div style={{ fontSize: 12, color: selectedRow.trend > 0 ? C.success : C.error, marginTop: 2, fontWeight: 600 }}>
                          {selectedRow.trend > 0 ? `↑+${selectedRow.trend}` : `↓${selectedRow.trend}`} vs season avg
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Radar chart */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Performance Radar</div>
                <RadarChartDynamic
                  height={260}
                  data={[
                    { category: 'Physical', score: selectedRow.analysis.physicalScore, avg: squadScores[selectedRow.player.id]?.compositeScore ?? 70 },
                    { category: 'Positional', score: selectedRow.analysis.positionalScore, avg: squadScores[selectedRow.player.id]?.compositeScore ?? 70 },
                    { category: 'Passing', score: selectedRow.analysis.passingScore, avg: squadScores[selectedRow.player.id]?.compositeScore ?? 70 },
                    { category: 'Dribbling', score: selectedRow.analysis.dribblingScore, avg: squadScores[selectedRow.player.id]?.compositeScore ?? 70 },
                    { category: 'Control', score: selectedRow.analysis.controlScore, avg: squadScores[selectedRow.player.id]?.compositeScore ?? 70 },
                    { category: 'Defending', score: selectedRow.analysis.defendingScore, avg: squadScores[selectedRow.player.id]?.compositeScore ?? 70 },
                  ]}
                />
              </div>

              {/* Category grade cards */}
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Category Grades</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Physical', score: selectedRow.analysis.physicalScore },
                  { label: 'Passing', score: selectedRow.analysis.passingScore },
                  { label: 'Dribbling', score: selectedRow.analysis.dribblingScore },
                  { label: 'Control', score: selectedRow.analysis.controlScore },
                  { label: 'Defending', score: selectedRow.analysis.defendingScore },
                  { label: 'Positional', score: selectedRow.analysis.positionalScore },
                ].map(({ label, score }) => {
                  const { grade, color } = getGrade(score)
                  return (
                    <div key={label} style={{
                      background: '#F8F9FC', borderRadius: 10, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 2 }}>{score}</div>
                      </div>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 800,
                      }}>
                        {grade}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Physical detail row */}
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Physical Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Distance', value: `${selectedRow.analysis.distanceCovered.toFixed(1)} km` },
                  { label: 'Top Speed', value: `${selectedRow.analysis.topSpeed.toFixed(1)} km/h` },
                  { label: 'Sprints', value: `${selectedRow.analysis.sprintCount}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: '#F8F9FC', borderRadius: 10, padding: '12px',
                    textAlign: 'center' as const,
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{value}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Session notes */}
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Session Notes</div>
              <textarea
                value={playerNotes[selectedRow.player.id] ?? ''}
                onChange={e => setPlayerNotes(prev => ({ ...prev, [selectedRow.player.id]: e.target.value }))}
                placeholder={`Add notes about ${selectedRow.player.firstName}...`}
                style={{
                  width: '100%', minHeight: 80, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: 12, fontSize: 14, resize: 'vertical',
                  fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: 4,
                }}
              />
              {playerNoteLastSaved && selectedPlayerId === selectedRow.player.id && (
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 24 }}>Last saved: {playerNoteLastSaved}</div>
              )}
              <div style={{ height: 24 }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
