'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock, MapPin, Trophy, BarChart3,
  TrendingUp, Target, ArrowUpDown, Shirt,
} from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { useTeam } from '@/contexts/TeamContext'
import { sessions, matchAnalyses, rosters, players } from '@/lib/mockData'

// ─── GAME SCORE LOOKUP (hardcoded per session) ─────────────
const gameScores: Record<string, { score: string; result: 'W' | 'L' | 'D' }> = {
  session_005: { score: '2-1', result: 'W' },
  session_006: { score: '1-2', result: 'L' },
  session_007: { score: '3-1', result: 'W' },
  session_010: { score: '0-0', result: 'D' },
  session_013: { score: '2-0', result: 'W' },
  session_014: { score: '3-2', result: 'W' },
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function AnalysisPage() {
  const router = useRouter()
  const { selectedRosterId } = useTeam()

  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const [filterType, setFilterType] = useState<'all' | 'training' | 'competitive'>('all')
  const [tableView, setTableView] = useState<'history' | 'upcoming'>('history')

  // Derive display type from session type
  const getDisplayType = (type: string) =>
    type === 'match' ? 'competitive' : 'training'

  // Compute average composite score per session from matchAnalyses
  const sessionScores = useMemo(() => {
    const map: Record<string, number> = {}
    const grouped: Record<string, number[]> = {}
    for (const a of matchAnalyses) {
      if (!grouped[a.sessionId]) grouped[a.sessionId] = []
      grouped[a.sessionId].push(a.compositeScore)
    }
    for (const [sid, scores] of Object.entries(grouped)) {
      map[sid] = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    }
    return map
  }, [])

  // Find top player per session from matchAnalyses
  const sessionTopPlayers = useMemo(() => {
    const map: Record<string, { name: string; score: number }> = {}
    const best: Record<string, { playerId: string; score: number }> = {}
    for (const a of matchAnalyses) {
      if (!best[a.sessionId] || a.compositeScore > best[a.sessionId].score) {
        best[a.sessionId] = { playerId: a.playerId, score: a.compositeScore }
      }
    }
    for (const [sid, info] of Object.entries(best)) {
      const player = players.find(p => p.id === info.playerId)
      if (player) {
        map[sid] = { name: `${player.firstName} ${player.lastName}`, score: info.score }
      }
    }
    return map
  }, [])

  // Get pitch name from pitchId (simple lookup)
  const getPitchName = (pitchId: string) => {
    const pitchNames: Record<string, string> = {
      pitch_001: 'Pitch 1',
      pitch_002: 'Pitch 2',
      pitch_003: 'Pitch 3',
      pitch_004: 'Pitch 4',
    }
    return pitchNames[pitchId] || pitchId
  }

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      // Global team filter from header
      if (selectedRosterId !== 'all' && s.rosterId !== selectedRosterId) return false
      // Type filter
      const displayType = getDisplayType(s.type)
      if (filterType !== 'all' && displayType !== filterType) return false
      return true
    })
  }, [selectedRosterId, filterType])

  const historySessions = useMemo(() => {
    const hist = filtered
      .filter(s => s.status === 'analysed' || s.status === 'playback_ready' || s.status === 'complete' || s.status === 'processing')
      .sort((a, b) => b.date.localeCompare(a.date))
    if (sortBy === 'score') {
      return [...hist].sort((a, b) => (sessionScores[b.id] || 0) - (sessionScores[a.id] || 0))
    }
    return hist
  }, [filtered, sortBy, sessionScores])

  const upcomingSessions = useMemo(() => {
    return filtered
      .filter(s => s.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filtered])

  const analysed = historySessions.filter(s => s.status === 'analysed')
  const avgScore = analysed.length > 0
    ? Math.round(analysed.reduce((sum, s) => sum + (sessionScores[s.id] || 0), 0) / analysed.length)
    : 0
  const totalSessions = historySessions.length

  // Next session (first upcoming)
  const nextSession = upcomingSessions[0]
  const nextSessionRoster = nextSession ? rosters.find(r => r.id === nextSession.rosterId) : null
  const nextDisplayType = nextSession ? getDisplayType(nextSession.type) : 'training'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0E1A', minHeight: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', width: '100%', boxSizing: 'border-box' }}>

        {/* ── STAT CARDS (3) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: '#0F1629', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Target size={18} color={COLORS.primary} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC' }}>{totalSessions}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Sessions This Month</div>
            </div>
          </div>

          <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: '#0F1629', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={18} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC' }}>{avgScore}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Avg Squad Score</div>
            </div>
          </div>

          <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: '#0F1629', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={18} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC' }}>+3.2</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Score Trend (30d)</div>
            </div>
          </div>
        </div>

        {/* ── HERO: NEXT SESSION ── */}
        {nextSession && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0F1629 50%, #1a1230 100%)',
            borderRadius: 16, padding: '24px 24px', marginBottom: 28,
            border: `1px solid ${nextDisplayType === 'competitive' ? `${COLORS.primary}20` : 'rgba(16,185,129,0.15)'}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 160, height: 160,
              borderRadius: '50%', background: nextDisplayType === 'competitive' ? `${COLORS.primary}06` : 'rgba(16,185,129,0.04)',
              filter: 'blur(50px)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: nextDisplayType === 'competitive' ? `${COLORS.primary}20` : 'rgba(16,185,129,0.12)',
                  color: nextDisplayType === 'competitive' ? COLORS.primary : '#10B981',
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {nextDisplayType === 'competitive' ? 'Competitive Match' : 'Training Match'}
                </span>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  Next session — {formatDate(nextSession.date)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px' }}>
                    {nextDisplayType === 'competitive'
                      ? `vs ${nextSession.opponent}`
                      : `${nextSessionRoster?.name || 'Team'} — Training Match`
                    }
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {formatTime(nextSession.startTime)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {getPitchName(nextSession.pitchId)}
                    </span>
                    {nextDisplayType === 'training' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Shirt size={13} /> Team A vs Team B
                      </span>
                    )}
                    {nextDisplayType === 'competitive' && nextSession.competition && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trophy size={13} /> {nextSession.competition}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => router.push('/coach/web/record')}
                  style={{
                    padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: nextDisplayType === 'competitive' ? COLORS.primary : '#10B981',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    boxShadow: `0 4px 16px ${nextDisplayType === 'competitive' ? COLORS.primary : '#10B981'}30`,
                  }}
                >
                  Prep & Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS TABLE ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          {/* History / Upcoming Toggle (left) */}
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
            {[
              { id: 'history' as const, label: 'History', count: historySessions.length },
              { id: 'upcoming' as const, label: 'Upcoming', count: upcomingSessions.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTableView(tab.id)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: tableView === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: tableView === tab.id ? '#F8FAFC' : '#64748B',
                  fontSize: 12, fontWeight: tableView === tab.id ? 700 : 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {tab.label}
                <span style={{
                  padding: '1px 6px', borderRadius: 10,
                  background: tableView === tab.id ? `${COLORS.primary}30` : 'rgba(255,255,255,0.06)',
                  color: tableView === tab.id ? COLORS.primary : '#475569',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filter / Sort Bar (right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Type Filter */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 2 }}>
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'training' as const, label: 'Training' },
                { id: 'competitive' as const, label: 'Competitive' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  style={{
                    padding: '5px 10px', borderRadius: 4, border: 'none',
                    background: filterType === f.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: filterType === f.id ? '#F8FAFC' : '#64748B',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort (history only) */}
            {tableView === 'history' && (
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none',
                  background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <ArrowUpDown size={11} /> {sortBy === 'date' ? 'By date' : 'By score'}
              </button>
            )}
          </div>
        </div>

        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: tableView === 'history' ? '62px 72px 1fr 80px 48px 100px' : '62px 72px 1fr 80px 100px',
            minWidth: 0,
            padding: '10px 16px', background: 'rgba(255,255,255,0.03)',
            fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span>Date</span>
            <span>Type</span>
            <span>Session</span>
            {tableView === 'history' ? (
              <>
                <span style={{ textAlign: 'center' }}>Status</span>
                <span style={{ textAlign: 'center' }}>Score</span>
                <span style={{ textAlign: 'right' }}>Top Player</span>
              </>
            ) : (
              <>
                <span style={{ textAlign: 'center' }}>Time</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </>
            )}
          </div>

          {/* HISTORY ROWS */}
          {tableView === 'history' && historySessions.map((s, i) => {
            const displayType = getDisplayType(s.type)
            const rosterName = rosters.find(r => r.id === s.rosterId)?.name || 'Team'
            const score = sessionScores[s.id]
            const topPlayer = sessionTopPlayers[s.id]
            const game = gameScores[s.id]

            return (
              <div key={s.id} onClick={() => {
                if (s.status === 'analysed') router.push(`/coach/web/match/${s.id}`)
              }} style={{
                display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 60px 70px',
                padding: '12px 16px', alignItems: 'center',
                background: i % 2 === 0 ? '#0F1629' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                cursor: s.status === 'analysed' ? 'pointer' : 'default',
              }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{formatDate(s.date)}</span>
                <div>
                  <span style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: displayType === 'competitive' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)',
                    color: displayType === 'competitive' ? '#EF4444' : '#10B981',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {displayType === 'competitive' ? 'Match' : 'Training'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                    {displayType === 'competitive' ? `vs ${s.opponent}` : `${rosterName} — Team A vs Team B`}
                  </span>
                  {displayType === 'competitive' && s.competition && (
                    <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>{s.competition}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {s.status === 'analysed' && <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Analysed</span>}
                  {s.status === 'processing' && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Processing</span>}
                  {(s.status === 'complete' || s.status === 'playback_ready') && (
                    <span onClick={(e) => { e.stopPropagation(); router.push('/coach/web/record?mode=analyse') }} style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Analyse</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {displayType === 'competitive' && game ? (
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: game.result === 'W' ? '#10B981' : game.result === 'L' ? '#EF4444' : '#F59E0B' }}>
                        {game.score}
                      </span>
                      <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600 }}>
                        {game.result === 'W' ? 'Won' : game.result === 'L' ? 'Lost' : 'Draw'}
                      </div>
                    </div>
                  ) : score ? (
                    <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(score) }}>{score}</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#334155' }}>--</span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {topPlayer ? (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topPlayer.name}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>{topPlayer.score}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#334155' }}>--</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* UPCOMING ROWS */}
          {tableView === 'upcoming' && upcomingSessions.map((s, i) => {
            const displayType = getDisplayType(s.type)
            const rosterName = rosters.find(r => r.id === s.rosterId)?.name || 'Team'

            return (
              <div key={s.id} style={{
                display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 100px',
                padding: '12px 16px', alignItems: 'center',
                background: i % 2 === 0 ? '#0F1629' : 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{formatDate(s.date)}</span>
                <div>
                  <span style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: displayType === 'competitive' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)',
                    color: displayType === 'competitive' ? '#EF4444' : '#10B981',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {displayType === 'competitive' ? 'Match' : 'Training'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                    {displayType === 'competitive' ? `vs ${s.opponent}` : `${rosterName} — Training Match`}
                  </span>
                  {displayType === 'competitive' && s.competition && (
                    <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>{s.competition}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                  {formatTime(s.startTime)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => router.push('/coach/web/record')}
                    style={{
                      padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: displayType === 'competitive' ? `${COLORS.primary}15` : 'rgba(16,185,129,0.1)',
                      color: displayType === 'competitive' ? COLORS.primary : '#10B981',
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    Prep & Record
                  </button>
                </div>
              </div>
            )
          })}

          {/* Empty states */}
          {tableView === 'history' && historySessions.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
              No sessions match your filters
            </div>
          )}
          {tableView === 'upcoming' && upcomingSessions.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
              No upcoming sessions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
