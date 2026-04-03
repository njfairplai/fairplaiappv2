'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Star, Send, Download, Save, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { useCoachTheme } from '@/contexts/CoachThemeContext'
import { COLORS } from '@/lib/constants'
import {
  players, rosters, squadScores, seasonReviews, playerSeasonStats,
  playerRadarData, developmentReportData, coachFeedbackHistory, attendanceData, highlights,
} from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

interface IDPDraft {
  attitude: number
  effort: number
  coachability: number
  sportsmanship: number
  observation: string
  goals: string[]
  savedAt: number
}

type IDPStatus = 'due' | 'draft' | 'sent'

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#D97706'
  if (['CB', 'LB', 'RB'].includes(position)) return '#059669'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return '#4A4AFF'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#DC2626'
  return '#64748B'
}

// Star rating component
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Star
            size={20}
            color={n <= value ? '#F59E0B' : '#D1D5DB'}
            fill={n <= value ? '#F59E0B' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

// Mini radar chart (SVG)
function MiniRadar({ data }: { data: Array<{ category: string; value: number; average: number }> }) {
  const cx = 80, cy = 80, r = 60
  const n = data.length
  if (n === 0) return null

  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep
    const dist = (value / 100) * r
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const playerPoints = data.map((d, i) => getPoint(i, d.value))
  const avgPoints = data.map((d, i) => getPoint(i, d.average))

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon
          key={scale}
          points={data.map((_, i) => {
            const p = getPoint(i, scale * 100)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth={0.5}
        />
      ))}
      {/* Axes */}
      {data.map((_, i) => {
        const p = getPoint(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(148,163,184,0.1)" strokeWidth={0.5} />
      })}
      {/* Average polygon */}
      <polygon
        points={avgPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(148,163,184,0.1)" stroke="rgba(148,163,184,0.3)" strokeWidth={1}
      />
      {/* Player polygon */}
      <polygon
        points={playerPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(74,74,255,0.15)" stroke="#4A4AFF" strokeWidth={1.5}
      />
      {/* Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, 120)
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 8, fill: '#94a3b8', fontWeight: 600 }}>
            {d.category.slice(0, 4)}
          </text>
        )
      })}
    </svg>
  )
}

export default function IDPsPage() {
  const { selectedRosterId } = useTeam()
  const { colors: themeColors } = useCoachTheme()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, IDPDraft>>({})
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [sendingId, setSendingId] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const d = localStorage.getItem('fairplai_idp_drafts')
      if (d) setDrafts(JSON.parse(d))
      const s = localStorage.getItem('fairplai_idp_sent')
      if (s) setSentIds(new Set(JSON.parse(s)))
    }
  }, [])

  const rosterPlayers = useMemo(() => {
    if (selectedRosterId === 'all') {
      const allIds = Object.values(rosterPlayerMap).flat()
      return players.filter(p => allIds.includes(p.id))
    }
    const ids = rosterPlayerMap[selectedRosterId] || []
    return players.filter(p => ids.includes(p.id))
  }, [selectedRosterId])

  const selectedRoster = rosters.find(r => r.id === (selectedRosterId === 'all' ? rosters[0]?.id : selectedRosterId))

  const getStatus = (playerId: string): IDPStatus => {
    if (sentIds.has(playerId)) return 'sent'
    if (drafts[playerId]) return 'draft'
    return 'due'
  }

  const statusConfig: Record<IDPStatus, { label: string; color: string; bg: string }> = {
    due: { label: 'Due', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    draft: { label: 'Draft', color: '#4A4AFF', bg: 'rgba(74,74,255,0.12)' },
    sent: { label: 'Sent', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  }

  // ── EDITOR VIEW ──
  if (selectedPlayerId) {
    const player = players.find(p => p.id === selectedPlayerId)
    if (!player) return null

    const score = squadScores[selectedPlayerId]
    const review = seasonReviews.find(r => r.playerId === selectedPlayerId)
    const stats = playerSeasonStats.find(s => s.playerId === selectedPlayerId)
    const radar = playerRadarData[selectedPlayerId] || []
    const devData = developmentReportData[selectedPlayerId]
    const attendance = selectedRosterId === 'all'
      ? Object.values(attendanceData).flat().find(a => a.playerId === selectedPlayerId)
      : attendanceData[selectedRosterId]?.find(a => a.playerId === selectedPlayerId)
    const playerHighlights = highlights.filter(h => h.playerId === selectedPlayerId)
    const latestFeedback = coachFeedbackHistory.filter(f => f.playerId === selectedPlayerId).sort((a, b) => b.date.localeCompare(a.date))[0]

    const draft = drafts[selectedPlayerId] || {
      attitude: latestFeedback?.attitude || 3,
      effort: latestFeedback?.effort || 3,
      coachability: latestFeedback?.coachability || 3,
      sportsmanship: latestFeedback?.sportsmanship || 3,
      observation: devData?.coachNotes || '',
      goals: ['', '', ''],
      savedAt: 0,
    }

    const updateDraft = (partial: Partial<IDPDraft>) => {
      const updated = { ...draft, ...partial, savedAt: Date.now() }
      const newDrafts = { ...drafts, [selectedPlayerId]: updated }
      setDrafts(newDrafts)
      localStorage.setItem('fairplai_idp_drafts', JSON.stringify(newDrafts))
    }

    const handleSend = () => {
      setSendingId(selectedPlayerId)
      setTimeout(() => {
        const newSent = new Set(sentIds).add(selectedPlayerId)
        setSentIds(newSent)
        localStorage.setItem('fairplai_idp_sent', JSON.stringify([...newSent]))
        setSendingId(null)
      }, 1500)
    }

    const compositeScore = score?.compositeScore ?? 0
    const avgScore = score?.avgScore ?? 0
    const diff = compositeScore - avgScore
    const radarData = radar.map(r => ({ category: r.category, value: r.score, average: r.avg }))
    const position = player.position[0] || 'CM'

    return (
      <div style={{ background: themeColors.pageBg, minHeight: '100%' }}>
        {/* Editor Header */}
        <div style={{ background: themeColors.cardBg, padding: '20px 24px', borderBottom: `1px solid ${themeColors.cardBorder}` }}>
          <button
            onClick={() => setSelectedPlayerId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#4A4AFF', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12 }}
          >
            <ArrowLeft size={16} /> Back to list
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PlayerAvatar player={player} size="md" />
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: themeColors.textPrimary }}>{player.firstName} {player.lastName}</h2>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${getPositionColor(position)}30`, color: getPositionColor(position) }}>{position}</span>
                <span style={{ fontSize: 11, color: themeColors.textMuted }}>#{player.jerseyNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 24 }}>
          {/* LEFT: Auto-populated */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Score + Trend */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: getScoreColor(compositeScore) }}>{compositeScore}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {diff > 3 ? <TrendingUp size={14} color="#10B981" /> : diff < -3 ? <TrendingDown size={14} color="#EF4444" /> : null}
                    <span style={{ fontSize: 13, fontWeight: 600, color: diff > 3 ? '#10B981' : diff < -3 ? '#EF4444' : '#9DA2B3' }}>
                      {diff > 0 ? '+' : ''}{diff} vs avg
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Season avg: {avgScore}</span>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            {radarData.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skill Profile</h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <MiniRadar data={radarData} />
                </div>
              </div>
            )}

            {/* Key Stats */}
            {stats && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Stats</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {stats.stats.map((stat) => (
                    <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{stat.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Development */}
            {review && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analysis</h4>
                {review.strengthAreas.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#10B981', margin: '0 0 6px' }}>Strengths</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {review.strengthAreas.map(s => (
                        <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {review.improvementAreas.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', margin: '0 0 6px' }}>Areas for Development</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {review.improvementAreas.map(s => (
                        <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Attendance</span>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                      {attendance ? `${attendance.sessionsAttended}/${attendance.totalSessions}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Highlights</span>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{playerHighlights.length}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Matches</span>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{review.matchesPlayed}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Coach Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Temperament & Attitude */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Temperament & Attitude</h4>
              {[
                { key: 'attitude' as const, label: 'Attitude' },
                { key: 'effort' as const, label: 'Effort' },
                { key: 'coachability' as const, label: 'Coachability' },
                { key: 'sportsmanship' as const, label: 'Sportsmanship' },
              ].map(attr => (
                <div key={attr.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{attr.label}</span>
                  <StarRating value={draft[attr.key]} onChange={v => updateDraft({ [attr.key]: v })} />
                </div>
              ))}

              {/* Soft skills from data */}
              {devData && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px' }}>Data-backed soft skills</p>
                  {devData.softSkills.map(ss => (
                    <div key={ss.category} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#64748B', width: 90 }}>{ss.category}</span>
                      <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${ss.score}%`, height: '100%', background: ss.score >= ss.avg ? '#10B981' : '#F59E0B', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', width: 28, textAlign: 'right' }}>{ss.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coach Observation */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Coach&apos;s Observation</h4>
              <textarea
                value={draft.observation}
                onChange={e => updateDraft({ observation: e.target.value.slice(0, 280) })}
                placeholder="Share your observations about this player..."
                style={{
                  width: '100%', minHeight: 100, padding: 12, borderRadius: 8,
                  border: '1px solid #E2E8F0', fontSize: 13, color: '#1E293B',
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>{draft.observation.length}/280</p>
            </div>

            {/* Goals */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Goals for Next Period</h4>
              {draft.goals.map((goal, i) => (
                <input
                  key={i}
                  value={goal}
                  onChange={e => {
                    const newGoals = [...draft.goals]
                    newGoals[i] = e.target.value
                    updateDraft({ goals: newGoals })
                  }}
                  placeholder={`Goal ${i + 1}`}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #E2E8F0', fontSize: 13, color: '#1E293B',
                    marginBottom: 8, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: '#F8F9FC', padding: '12px 0' }}>
              <button
                onClick={() => updateDraft({})}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0',
                  background: '#fff', color: '#1E293B', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Save size={14} /> Save Draft
              </button>
              <button
                onClick={handleSend}
                disabled={sendingId === selectedPlayerId}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: sendingId === selectedPlayerId ? '#94a3b8' : COLORS.primary,
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: sendingId === selectedPlayerId ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Send size={14} /> {sendingId === selectedPlayerId ? 'Sending...' : 'Send to Parent'}
              </button>
              <button
                style={{
                  padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0',
                  background: '#fff', color: '#64748B', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──
  const dueCount = rosterPlayers.filter(p => getStatus(p.id) === 'due').length

  return (
    <div style={{ background: themeColors.pageBg, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: themeColors.cardBg, padding: '20px 24px', borderBottom: `1px solid ${themeColors.cardBorder}` }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: themeColors.textPrimary }}>Individual Development Plans</h1>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: themeColors.textMuted }}>{selectedRoster?.name}</span>
          <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
            {dueCount > 0 ? `${dueCount} report${dueCount > 1 ? 's' : ''} due` : 'All up to date'}
          </span>
        </div>
      </div>

      {/* Player list */}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rosterPlayers.map(player => {
            const score = squadScores[player.id]
            const compositeScore = score?.compositeScore ?? 0
            const status = getStatus(player.id)
            const cfg = statusConfig[status]
            const position = player.position[0] || 'CM'

            return (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                  background: '#fff', borderRadius: 12, border: '1px solid #E8EAED',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.boxShadow = `0 0 0 1px ${COLORS.primary}30` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAED'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <PlayerAvatar player={player} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{player.firstName} {player.lastName}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${getPositionColor(position)}15`, color: getPositionColor(position) }}>{position}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>#{player.jerseyNumber}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(compositeScore) }}>{compositeScore}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                <ChevronRight size={16} color="#94a3b8" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
