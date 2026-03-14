'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, ChevronLeft, Clock, Users as UsersIcon,
  Dumbbell, X, Play, Plus, Check, MapPin, TrendingDown, TrendingUp,
  AlertTriangle, Target, Zap,
} from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import {
  sessions, players, rosters, pitches,
  squadScores, attendanceData,
} from '@/lib/mockData'
import MatchPrepFlow from '@/components/coach/MatchPrepFlow'

/* ── helpers ── */
const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayAbbr[d.getDay()]}, ${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

/* ── Drill library ── */
const drillLibrary = [
  {
    id: 'drill_001', name: 'Rondo 4v2', category: 'Passing', duration: '10 min', difficulty: 'Easy',
    players: '6', setup: '15×15m grid',
    description: 'Four players keep possession against two defenders in a tight space. Develops quick passing, movement off the ball, and pressing when defending.',
    coachingPoints: ['First touch away from pressure', 'Body shape open to receive', 'Defenders work as a pair to cut passing lanes', 'Rotate defenders every 2 minutes'],
    variations: ['Increase to 5v2 for easier possession', 'Shrink grid to 12×12m for more pressure', 'Add "two-touch only" constraint'],
    targetSkills: ['passing', 'control'],
  },
  {
    id: 'drill_002', name: '1v1 Wing Play', category: 'Dribbling', duration: '15 min', difficulty: 'Medium',
    players: '2 per station', setup: 'Sideline channel 10×30m',
    description: 'Attacker receives on the wing and must beat the defender 1v1 to deliver a cross. Develops confidence on the ball, change of direction, and crossing under pressure.',
    coachingPoints: ['Attack the defender at pace', 'Use feints before committing to a direction', 'Cross early if defender drops off', 'Defender: stay on feet, show inside'],
    variations: ['Add a second attacker for overlap', 'Timed rounds — 30 seconds per attempt', 'Defender starts 5m back for head start'],
    targetSkills: ['dribbling', 'crossing'],
  },
  {
    id: 'drill_003', name: 'Pressing Triggers', category: 'Tactical', duration: '20 min', difficulty: 'Hard',
    players: '11 vs 6', setup: 'Half pitch',
    description: 'Team of 11 practices coordinated pressing against 6 opposition players. Focus on identifying pressing triggers and compressing space as a unit.',
    coachingPoints: ['Press as a unit — not individually', 'First player sets the press angle', 'Cut off the easy pass before engaging', 'Transition immediately on turnover'],
    variations: ['Add a time limit — must win ball in 8 seconds', 'Opposition scores by passing through pressing line', 'Vary starting position of the ball'],
    targetSkills: ['defending', 'positional'],
  },
  {
    id: 'drill_004', name: 'Finishing Circuit', category: 'Shooting', duration: '15 min', difficulty: 'Medium',
    players: '4-6', setup: 'Penalty area + 2 goals',
    description: 'Rotating stations around the box for different finishing scenarios: volleys from crosses, 1v1 with keeper, cutbacks, and first-time finishes.',
    coachingPoints: ['Hit the target — power comes second', 'Approach the ball at an angle for side-foot finish', 'Stay composed — take an extra touch if needed', 'Follow up every shot for rebounds'],
    variations: ['Add time pressure — finish within 3 seconds', 'Defender closes in from behind', 'Weak foot only station'],
    targetSkills: ['shooting', 'composure'],
  },
  {
    id: 'drill_005', name: 'Defensive Shape', category: 'Tactical', duration: '20 min', difficulty: 'Medium',
    players: '8 vs 4', setup: 'Half pitch',
    description: 'Back four plus two midfielders maintain defensive shape against four attackers playing free-form. Focus on sliding as a unit and maintaining distances.',
    coachingPoints: ['Slide together — keep distances tight', 'CB talks and organises the line', 'No one gets drawn out of position', 'Spring the offside trap on coach signal'],
    variations: ['Add a striker to test depth', 'Play from goal kicks to test shape from restarts', 'Allow attackers to switch play — test recovery runs'],
    targetSkills: ['defending', 'positional'],
  },
  {
    id: 'drill_006', name: 'GK Distribution', category: 'Goalkeeping', duration: '10 min', difficulty: 'Easy',
    players: '1 GK + 3 targets', setup: 'Full pitch length',
    description: 'Goalkeeper practices distribution to three target players at varying distances. Includes goal kicks, throws, and short passes under pressure.',
    coachingPoints: ['Pick the pass before receiving', 'Goal kicks: strike through the ball, follow through', 'Short distribution: play to the safer foot', 'Communication with centre-backs'],
    variations: ['Add a pressing player on the GK', 'Time limit — must distribute within 4 seconds', 'Vary target positions each round'],
    targetSkills: ['passing', 'composure'],
  },
  {
    id: 'drill_007', name: 'Counter-Attack 3v2', category: 'Tactical', duration: '15 min', difficulty: 'Hard',
    players: '5 (3 attackers + 2 defenders)', setup: 'Half pitch',
    description: 'Three attackers break against two defenders from the halfway line. Develops speed in transition, decision-making, and finishing in overload situations.',
    coachingPoints: ['Carry the ball fast — don\'t over-pass', 'Wide players stay wide to stretch the defence', 'Ball carrier makes the decision early', 'If shot is blocked, attack the rebound'],
    variations: ['Add a third defender who starts 10m behind', 'Must score within 10 seconds', 'Start from a turnover scenario'],
    targetSkills: ['dribbling', 'shooting', 'positional'],
  },
  {
    id: 'drill_008', name: 'Ball Control Circuit', category: 'Technical', duration: '10 min', difficulty: 'Easy',
    players: '1 per station', setup: '6 stations in a circle',
    description: 'Individual technical circuit with stations for juggling, wall passes, cone dribbling, aerial control, sole rolls, and quick feet ladders.',
    coachingPoints: ['Soft touch on first contact', 'Keep the ball close during dribbling stations', 'Use both feet at every station', 'Focus on quality over speed'],
    variations: ['Race format — complete circuit fastest', 'Add partner passing between stations', 'Weak foot only challenge'],
    targetSkills: ['control', 'dribbling'],
  },
]

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    Passing: '#4A4AFF', Dribbling: '#8B5CF6', Tactical: '#EC4899',
    Shooting: '#EF4444', Goalkeeping: '#F59E0B', Technical: '#10B981',
  }
  return colors[cat] || '#64748B'
}

function getDifficultyColor(diff: string) {
  if (diff === 'Easy') return '#10B981'
  if (diff === 'Medium') return '#F59E0B'
  return '#EF4444'
}

/* ── Mock prep status (which sessions already prepped) ── */
const preppedSessions = new Set<string>(['session_012']) // One session already prepped for demo

/* ── Skill weakness mapping from scores ── */
function getWeakAreas(playerIds: string[]): { skill: string; count: number; playerNames: string[] }[] {
  const weakMap: Record<string, string[]> = {}

  playerIds.forEach(pid => {
    const score = squadScores[pid]
    const player = players.find(p => p.id === pid)
    if (!score || !player) return
    const name = player.firstName

    // Flag areas where composite is below 70 or trending down
    if (score.compositeScore < 65) {
      ;['passing', 'control', 'shooting'].forEach(s => {
        if (!weakMap[s]) weakMap[s] = []
        if (!weakMap[s].includes(name)) weakMap[s].push(name)
      })
    }
    if (score.compositeScore - score.avgScore < -10) {
      ;['composure', 'positional'].forEach(s => {
        if (!weakMap[s]) weakMap[s] = []
        if (!weakMap[s].includes(name)) weakMap[s].push(name)
      })
    }
    if (score.compositeScore < 72) {
      ;['dribbling', 'defending'].forEach(s => {
        if (!weakMap[s]) weakMap[s] = []
        if (!weakMap[s].includes(name)) weakMap[s].push(name)
      })
    }
  })

  return Object.entries(weakMap)
    .map(([skill, names]) => ({ skill, count: names.length, playerNames: names }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
}


type PrepStep = 'landing' | 'insights' | 'drills' | 'plan'

export default function PrepPage() {
  const router = useRouter()
  const { availableRosters } = useTeam()
  const todayStr = new Date().toISOString().slice(0, 10)

  const [step, setStep] = useState<PrepStep>('landing')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [matchPrepSessionId, setMatchPrepSessionId] = useState<string | null>(null)
  const [sessionPlan, setSessionPlan] = useState<string[]>([])
  const [openDrillId, setOpenDrillId] = useState<string | null>(null)
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set(preppedSessions))

  /* ── Upcoming sessions ── */
  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(s => s.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  }, [])

  const selectedSession = sessions.find(s => s.id === selectedSessionId)
  const selectedRoster = selectedSession ? rosters.find(r => r.id === selectedSession.rosterId) : null
  const selectedPitch = selectedSession ? pitches.find(p => p.id === selectedSession.pitchId) : null

  /* ── Players for selected session's roster ── */
  const sessionPlayerIds = selectedSession ? (rosterPlayerMap[selectedSession.rosterId] || []) : []
  const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id))

  /* ── Squad insights for this session ── */
  const playerInsights = useMemo(() => {
    return sessionPlayers
      .map(p => {
        const score = squadScores[p.id]
        if (!score) return null
        const diff = score.compositeScore - score.avgScore
        return { ...p, compositeScore: score.compositeScore, avgScore: score.avgScore, diff }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.diff - b.diff)
  }, [sessionPlayers])

  const playingTime = useMemo(() => {
    if (!selectedSession) return []
    const data = attendanceData[selectedSession.rosterId] || []
    return data
      .map(d => {
        const player = players.find(p => p.id === d.playerId)
        if (!player) return null
        const pct = d.totalSessions > 0 ? Math.round((d.sessionsAttended / d.totalSessions) * 100) : 0
        return { ...d, firstName: player.firstName, lastName: player.lastName, jerseyNumber: player.jerseyNumber, pct }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .sort((a, b) => a.pct - b.pct)
  }, [selectedSession])

  const weakAreas = useMemo(() => getWeakAreas(sessionPlayerIds), [sessionPlayerIds])

  /* ── Recommended drills based on weak areas ── */
  const recommendedDrills = useMemo(() => {
    const weakSkills = new Set(weakAreas.map(w => w.skill))
    const scored = drillLibrary.map(d => {
      const matchCount = d.targetSkills.filter(s => weakSkills.has(s)).length
      return { ...d, relevance: matchCount }
    })
    return scored.filter(d => d.relevance > 0).sort((a, b) => b.relevance - a.relevance)
  }, [weakAreas])

  /* ── Drill actions ── */
  const addToPlan = (drillId: string) => {
    setSessionPlan(prev => prev.includes(drillId) ? prev : [...prev, drillId])
  }
  const removeFromPlan = (drillId: string) => {
    setSessionPlan(prev => prev.filter(id => id !== drillId))
  }
  const totalPlanTime = drillLibrary
    .filter(d => sessionPlan.includes(d.id))
    .reduce((sum, d) => sum + parseInt(d.duration), 0)

  const openDrill = drillLibrary.find(d => d.id === openDrillId)

  /* ── Start prep for a session ── */
  const startPrep = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session && (session.type === 'match' || session.type === 'training_match')) {
      setMatchPrepSessionId(sessionId)
    } else {
      setSelectedSessionId(sessionId)
      setSessionPlan([])
      setStep('insights')
    }
  }

  const savePlan = () => {
    if (selectedSessionId) {
      setSavedPlans(prev => new Set([...prev, selectedSessionId]))
    }
    setStep('landing')
    setSelectedSessionId(null)
    setSessionPlan([])
  }


  /* ═══════════════════════════════════════════════
     MATCH PREP — Full-screen flow for match/training_match
     ═══════════════════════════════════════════════ */
  if (matchPrepSessionId) {
    const matchSession = sessions.find(s => s.id === matchPrepSessionId)!
    const matchRoster = rosters.find(r => r.id === matchSession.rosterId)
    const matchPlayerIds = rosterPlayerMap[matchSession.rosterId] || []
    const matchPlayers = players.filter(p => matchPlayerIds.includes(p.id))
    return (
      <MatchPrepFlow
        session={matchSession}
        players={matchPlayers}
        roster={matchRoster}
        onBack={() => setMatchPrepSessionId(null)}
        onSave={() => {
          setSavedPlans(prev => new Set([...prev, matchPrepSessionId]))
          setMatchPrepSessionId(null)
        }}
      />
    )
  }

  /* ═══════════════════════════════════════════════
     STEP: LANDING — Session list
     ═══════════════════════════════════════════════ */
  if (step === 'landing') {
    return (
      <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>
        <div style={{ background: '#0A0E1A', padding: '48px 20px 20px' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>Prep</h1>
          <p style={{ margin: '2px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Plan your upcoming sessions
          </p>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Upcoming Sessions
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {upcomingSessions.map(session => {
              const isMatch = session.type === 'match'
              const accentColor = isMatch ? '#4A4AFF' : '#10B981'
              const pitch = pitches.find(p => p.id === session.pitchId)
              const roster = rosters.find(r => r.id === session.rosterId)
              const daysUntil = daysBetween(todayStr, session.date)
              const daysLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`
              const isPrepped = savedPlans.has(session.id)

              return (
                <button
                  key={session.id}
                  onClick={() => startPrep(session.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#fff', borderRadius: 14,
                    borderLeft: `4px solid ${accentColor}`,
                    padding: '16px 14px', border: 'none', cursor: 'pointer',
                    textAlign: 'left', width: '100%',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: accentColor,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={12} /> {formatDate(session.date)} · {session.startTime}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: daysUntil <= 1 ? '#F59E0B' : '#94a3b8' }}>
                        {daysLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                      {isMatch ? `vs ${session.opponent}` : 'Training Session'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 12,
                        background: isMatch ? '#EFF6FF' : '#ECFDF5',
                        color: isMatch ? '#4A4AFF' : '#059669',
                      }}>
                        {isMatch ? 'Match' : 'Training'}
                      </span>
                      {roster && <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{roster.name}</span>}
                      {pitch && (
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <MapPin size={10} /> {pitch.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prep status badge */}
                  {isPrepped ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 10px', borderRadius: 20,
                      background: '#ECFDF5',
                    }}>
                      <Check size={14} color="#10B981" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>Prepped</span>
                    </div>
                  ) : (
                    <ChevronRight size={18} color="#CBD5E1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>
    )
  }


  /* ═══════════════════════════════════════════════
     STEP: INSIGHTS — Squad overview for session
     ═══════════════════════════════════════════════ */
  if (step === 'insights' && selectedSession) {
    const isMatch = selectedSession.type === 'match'

    return (
      <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: '#0A0E1A', padding: '48px 20px 16px' }}>
          <button
            onClick={() => { setStep('landing'); setSelectedSessionId(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Step 1 of 3
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>Squad Insights</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            {isMatch ? `vs ${selectedSession.opponent}` : 'Training'} · {formatDate(selectedSession.date)} · {selectedRoster?.name}
          </p>
        </div>

        {/* Players to Watch */}
        <div style={{ padding: '16px 16px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Players to Watch
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {playerInsights.filter(p => Math.abs(p.diff) > 3).map(player => {
              const isDecline = player.diff < 0
              const trendColor = isDecline ? '#EF4444' : '#10B981'
              const trendBg = isDecline ? '#FEF2F2' : '#ECFDF5'
              const TrendIcon = isDecline ? TrendingDown : TrendingUp

              return (
                <div key={player.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fff', borderRadius: 12, padding: '12px 14px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: trendColor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{player.firstName} {player.lastName}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{player.position[0]} · #{player.jerseyNumber}</div>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(player.compositeScore) }}>{player.compositeScore}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 12, background: trendBg }}>
                    <TrendIcon size={11} color={trendColor} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: trendColor }}>{isDecline ? '' : '+'}{player.diff}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <div style={{ padding: '20px 16px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Areas to Focus On
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {weakAreas.map(area => (
                <div key={area.skill} style={{
                  background: '#fff', borderRadius: 12, padding: '10px 14px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: 140,
                  flex: '1 1 calc(50% - 4px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={13} color="#F59E0B" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{area.skill}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {area.count} player{area.count > 1 ? 's' : ''}: {area.playerNames.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playing Time */}
        <div style={{ padding: '20px 16px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Playing Time
          </span>
          <div style={{
            background: '#fff', borderRadius: 14, marginTop: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {playingTime.slice(0, 4).map((p, idx) => {
              const barColor = p.pct >= 80 ? '#10B981' : p.pct >= 60 ? '#F59E0B' : '#EF4444'
              return (
                <div key={p.playerId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: idx < 3 ? '1px solid #F1F5F9' : 'none',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#64748B', flexShrink: 0,
                  }}>{p.jerseyNumber}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{p.firstName} {p.lastName}</div>
                    <div style={{ height: 5, borderRadius: 3, background: '#F1F5F9', marginTop: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: barColor, width: `${p.pct}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: barColor, minWidth: 36, textAlign: 'right' }}>{p.pct}%</span>
                </div>
              )
            })}
          </div>
          {playingTime.length > 4 && (
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>
              + {playingTime.length - 4} more players
            </div>
          )}
        </div>

        {/* Next button */}
        <div style={{ padding: '24px 16px 100px' }}>
          <button
            onClick={() => setStep('drills')}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 14,
              background: '#4A4AFF', color: '#fff',
              fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Plan Drills <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )
  }


  /* ═══════════════════════════════════════════════
     STEP: DRILLS — Recommended + browse
     ═══════════════════════════════════════════════ */
  if (step === 'drills' && selectedSession) {
    return (
      <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>
        <div style={{ background: '#0A0E1A', padding: '48px 20px 16px' }}>
          <button
            onClick={() => setStep('insights')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Step 2 of 3
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>Plan Drills</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            {selectedSession.type === 'match' ? `vs ${selectedSession.opponent}` : 'Training'} · {formatDate(selectedSession.date)}
          </p>
        </div>

        {/* Recommended drills */}
        {recommendedDrills.length > 0 && (
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Zap size={14} color="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recommended for Your Squad
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recommendedDrills.slice(0, 4).map(drill => {
                const catColor = getCategoryColor(drill.category)
                const isInPlan = sessionPlan.includes(drill.id)

                return (
                  <div
                    key={drill.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: isInPlan ? '#EEF2FF' : '#fff', borderRadius: 12,
                      padding: '12px 14px',
                      border: isInPlan ? '1.5px solid #4A4AFF' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOpenDrillId(drill.id)}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${catColor}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Dumbbell size={18} color={catColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{drill.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${catColor}15`, color: catColor }}>{drill.category}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{drill.duration}</span>
                      </div>
                    </div>
                    {isInPlan ? (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4A4AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} color="#fff" />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); addToPlan(drill.id) }}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: '#F1F5F9',
                          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Plus size={14} color="#64748B" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All drills */}
        <div style={{ padding: '20px 16px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            All Drills
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {drillLibrary.map(drill => {
              const catColor = getCategoryColor(drill.category)
              const isInPlan = sessionPlan.includes(drill.id)

              return (
                <div
                  key={drill.id}
                  onClick={() => setOpenDrillId(drill.id)}
                  style={{
                    background: '#fff', borderRadius: 14, padding: '14px 12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
                    border: isInPlan ? '2px solid #4A4AFF' : '2px solid transparent',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${catColor}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                  }}>
                    <Dumbbell size={18} color={catColor} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{drill.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${catColor}15`, color: catColor }}>{drill.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 2 }}><Clock size={10} /> {drill.duration}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: getDifficultyColor(drill.difficulty) }}>{drill.difficulty}</span>
                  </div>
                  {isInPlan && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 18, height: 18, borderRadius: '50%', background: '#4A4AFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={10} color="#fff" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sticky next button */}
        <div style={{ padding: '24px 16px 100px' }}>
          <button
            onClick={() => setStep('plan')}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 14,
              background: sessionPlan.length > 0 ? '#4A4AFF' : '#CBD5E1',
              color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {sessionPlan.length > 0
              ? `Review Plan (${sessionPlan.length} drills · ${totalPlanTime} min)`
              : 'Skip to Summary'
            } <ChevronRight size={18} />
          </button>
        </div>


        {/* ═══════════ DRILL DETAIL OVERLAY ═══════════ */}
        {openDrill && (
          <>
            <div onClick={() => setOpenDrillId(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
              background: '#fff', borderRadius: '20px 20px 0 0',
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} />
              </div>

              <div style={{ padding: '12px 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{openDrill.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: `${getCategoryColor(openDrill.category)}15`, color: getCategoryColor(openDrill.category) }}>{openDrill.category}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: getDifficultyColor(openDrill.difficulty) }}>{openDrill.difficulty}</span>
                    </div>
                  </div>
                  <button onClick={() => setOpenDrillId(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={18} color="#64748B" />
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 0, margin: '16px 20px', background: '#F8F9FC', borderRadius: 12, overflow: 'hidden' }}>
                {[
                  { label: 'Duration', value: openDrill.duration, icon: Clock },
                  { label: 'Players', value: openDrill.players, icon: UsersIcon },
                  { label: 'Setup', value: openDrill.setup, icon: Dumbbell },
                ].map((stat, i) => (
                  <div key={stat.label} style={{ flex: 1, padding: '12px 10px', textAlign: 'center', borderRight: i < 2 ? '1px solid #E2E8F0' : 'none' }}>
                    <stat.icon size={14} color="#94a3b8" style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{stat.value}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Animation placeholder */}
              <div style={{
                margin: '0 20px', height: 160, borderRadius: 14,
                background: 'linear-gradient(135deg, #0A0E1A 0%, #1E293B 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}>
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: '100%', background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(74,74,255,0.2)', border: '2px solid rgba(74,74,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={20} color="#4A4AFF" fill="#4A4AFF" />
                </div>
                <div style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Drill Animation</div>
              </div>

              {/* Description */}
              <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description</div>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>{openDrill.description}</p>
              </div>

              {/* Coaching Points */}
              <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Coaching Points</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {openDrill.coachingPoints.map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EEF2FF', color: '#4A4AFF', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                      <span style={{ fontSize: 14, color: '#334155', lineHeight: 1.5 }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variations */}
              <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Variations</div>
                {openDrill.variations.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>•</span>
                    <span style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Add/Remove button */}
              <div style={{ padding: '20px 20px 32px' }}>
                {sessionPlan.includes(openDrill.id) ? (
                  <button
                    onClick={() => { removeFromPlan(openDrill.id); setOpenDrillId(null) }}
                    style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: '#FEF2F2', color: '#EF4444', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  >
                    Remove from Plan
                  </button>
                ) : (
                  <button
                    onClick={() => { addToPlan(openDrill.id); setOpenDrillId(null) }}
                    style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: '#4A4AFF', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Plus size={18} /> Add to Session Plan
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }


  /* ═══════════════════════════════════════════════
     STEP: PLAN — Review and save
     ═══════════════════════════════════════════════ */
  if (step === 'plan' && selectedSession) {
    return (
      <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>
        <div style={{ background: '#0A0E1A', padding: '48px 20px 16px' }}>
          <button
            onClick={() => setStep('drills')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Step 3 of 3
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>Session Plan</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            {selectedSession.type === 'match' ? `vs ${selectedSession.opponent}` : 'Training'} · {formatDate(selectedSession.date)} · {selectedRoster?.name}
          </p>
        </div>

        {/* Plan overview */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                {sessionPlan.length} Drill{sessionPlan.length !== 1 ? 's' : ''} Planned
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#4A4AFF' }}>
                {totalPlanTime} min
              </span>
            </div>

            {sessionPlan.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sessionPlan.map((drillId, idx) => {
                  const drill = drillLibrary.find(d => d.id === drillId)
                  if (!drill) return null
                  const catColor = getCategoryColor(drill.category)
                  return (
                    <div key={drillId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 0',
                      borderBottom: idx < sessionPlan.length - 1 ? '1px solid #F1F5F9' : 'none',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: '#4A4AFF',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                      }}>{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{drill.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${catColor}15`, color: catColor }}>{drill.category}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{drill.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromPlan(drillId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        <X size={16} color="#94a3b8" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>No drills added yet</p>
                <button
                  onClick={() => setStep('drills')}
                  style={{
                    background: 'none', border: 'none', color: '#4A4AFF',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8,
                  }}
                >
                  ← Go back and add drills
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Session details */}
        <div style={{ padding: '20px 16px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Session Details
          </span>
          <div style={{
            background: '#fff', borderRadius: 14, marginTop: 8, padding: '14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {[
              { label: 'Date', value: formatDate(selectedSession.date) },
              { label: 'Time', value: `${selectedSession.startTime} – ${selectedSession.endTime}` },
              { label: 'Pitch', value: selectedPitch?.name || '—' },
              { label: 'Team', value: selectedRoster?.name || '—' },
              { label: 'Players', value: `${sessionPlayers.length} players` },
            ].map((item, i) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: i < 4 ? '1px solid #F8F9FC' : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div style={{ padding: '24px 16px 100px' }}>
          <button
            onClick={savePlan}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 14,
              background: '#10B981', color: '#fff',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Check size={20} /> Save Session Plan
          </button>
        </div>
      </div>
    )
  }


  return null
}
