'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Star, Send, Download, Save, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { BRAND, TYPE } from '@/lib/constants'
import {
  players, rosters, squadScores, seasonReviews, playerSeasonStats,
  playerRadarData, developmentReportData, coachFeedbackHistory, attendanceData, highlights,
} from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import {
  Card,
  MEyebrow,
  MDisplay,
  MatchCenterScoreArc,
  mcButtons,
} from '@/components/coach/match-center/atoms'

/* IDP — Individual Development Plan editor.
 *
 * Brand-chrome reskin of the legacy editor. Same data model + flow:
 *   - List view (player rows with status + composite chip)
 *   - Editor view, 2-col on desktop / 1-col on mobile:
 *     LEFT  = auto-populated context (composite, radar, key stats,
 *             strengths / working-on, attendance)
 *     RIGHT = coach input (4 star ratings, observation textarea,
 *             3 goal inputs)
 *   - Footer CTA bar (sticky-bottom): Save draft · Send to parent → · PDF
 *
 * Existing localStorage keys preserved (`fairplai_idp_drafts`,
 * `fairplai_idp_sent`) so coach drafts roll forward cleanly. */

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

function scoreColorForBrand(score: number): string {
  if (score >= 75) return BRAND.indigo
  if (score >= 60) return BRAND.indigoMid
  return BRAND.coral
}

/** Yellow-filled stars on indigo when set, paper outline when empty.
 *  Mirrors the brand vocabulary (yellow = "this is the active signal"). */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} of 5`}
            aria-pressed={filled}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 0,
            }}
          >
            <Star
              size={20}
              color={filled ? BRAND.yellow : BRAND.line}
              fill={filled ? BRAND.yellow : 'none'}
              strokeWidth={2}
            />
          </button>
        )
      })}
    </div>
  )
}

/** Brand-coloured 6-axis mini radar — indigo polygon for the player,
 *  yellow-soft polygon for the squad average. */
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
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon
          key={scale}
          points={data.map((_, i) => {
            const p = getPoint(i, scale * 100)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none" stroke="rgba(27,21,80,0.10)" strokeWidth={0.5}
        />
      ))}
      {data.map((_, i) => {
        const p = getPoint(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(27,21,80,0.08)" strokeWidth={0.5} />
      })}
      <polygon
        points={avgPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(252,215,24,0.20)" stroke="rgba(27,21,80,0.30)" strokeWidth={1}
      />
      <polygon
        points={playerPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(27,21,80,0.18)" stroke="#1B1550" strokeWidth={1.5}
      />
      {data.map((d, i) => {
        const p = getPoint(i, 120)
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 8, fill: 'rgba(27,21,80,0.6)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {d.category.slice(0, 4).toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontFamily: TYPE.body,
  fontSize: 14,
  color: BRAND.indigo,
  background: BRAND.paper,
  border: `1px solid ${BRAND.line}`,
  borderRadius: 4,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function IDPsPage() {
  const { selectedRosterId } = useTeam()
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, IDPDraft>>({})
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [sendingId, setSendingId] = useState<string | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  // SSR-safe localStorage hydration on mount.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const d = localStorage.getItem('fairplai_idp_drafts')
      if (d) setDrafts(JSON.parse(d))
      const s = localStorage.getItem('fairplai_idp_sent')
      if (s) setSentIds(new Set(JSON.parse(s)))
    }
  }, [])

  // Deep-link from squad pop-out / player profile.
  useEffect(() => {
    const pid = searchParams?.get('player')
    if (!pid) return
    if (players.some(p => p.id === pid)) setSelectedPlayerId(pid)
  }, [searchParams])
  /* eslint-enable react-hooks/set-state-in-effect */

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

  const statusPill: Record<IDPStatus, { label: string; bg: string; ink: string }> = {
    due: { label: 'DUE', bg: 'rgba(235,77,109,0.14)', ink: BRAND.coral },
    draft: { label: 'DRAFT', bg: BRAND.lineSoft, ink: BRAND.indigoMid },
    sent: { label: '✓ SENT', bg: BRAND.yellowSoft, ink: BRAND.indigo },
  }

  // ── EDITOR VIEW ──────────────────────────────────────────────
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
    const latestFeedback = coachFeedbackHistory
      .filter(f => f.playerId === selectedPlayerId)
      .sort((a, b) => b.date.localeCompare(a.date))[0]

    const draft: IDPDraft = drafts[selectedPlayerId] ?? {
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('fairplai_idp_drafts', JSON.stringify(newDrafts))
      }
    }

    const handleSend = () => {
      setSendingId(selectedPlayerId)
      setTimeout(() => {
        const newSent = new Set(sentIds).add(selectedPlayerId)
        setSentIds(newSent)
        if (typeof window !== 'undefined') {
          localStorage.setItem('fairplai_idp_sent', JSON.stringify([...newSent]))
        }
        setSendingId(null)
      }, 1500)
    }

    const compositeScore = score?.compositeScore ?? 0
    const avgScore = score?.avgScore ?? 0
    const diff = compositeScore - avgScore
    const radarData = radar.map(r => ({ category: r.category, value: r.score, average: r.avg }))
    const position = player.position[0] || 'CM'
    const isSent = sentIds.has(selectedPlayerId)
    const hasDraft = drafts[selectedPlayerId] != null

    return (
      <div
        style={{
          background: BRAND.sand,
          minHeight: '100%',
          color: BRAND.indigo,
          fontFamily: TYPE.body,
        }}
      >
        {/* Editor header — back link, player identity, status */}
        <div
          style={{
            background: hasDraft && !isSent ? BRAND.yellowSoft : BRAND.sand,
            padding: isMobile ? '14px 14px' : '20px 32px',
            borderBottom: `1px solid ${BRAND.line}`,
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedPlayerId(null)}
            style={{
              ...mcButtons.text,
              padding: 0,
              marginBottom: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: BRAND.indigo,
            }}
          >
            <ArrowLeft size={14} /> Back to list
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <PlayerAvatar player={player} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <MEyebrow>INDIVIDUAL DEVELOPMENT PLAN</MEyebrow>
              <MDisplay size={isMobile ? 28 : 36} style={{ marginTop: 4 }}>
                {player.firstName} {player.lastName}
              </MDisplay>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: BRAND.indigoMute,
                    border: `1px solid ${BRAND.line}`,
                    padding: '2px 6px',
                    borderRadius: 2,
                  }}
                >
                  {position}
                </span>
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: BRAND.indigoMute,
                    fontWeight: 700,
                  }}
                >
                  #{player.jerseyNumber}
                </span>
                {isSent ? (
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: BRAND.indigo,
                      background: BRAND.yellow,
                      padding: '3px 7px',
                      borderRadius: 3,
                    }}
                  >
                    ✓ SENT TO PARENT
                  </span>
                ) : hasDraft ? (
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: BRAND.indigoMid,
                      background: BRAND.lineSoft,
                      padding: '3px 7px',
                      borderRadius: 3,
                    }}
                  >
                    DRAFT IN PROGRESS
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 14 : 20,
            padding: isMobile ? 14 : 32,
            paddingBottom: 96,
          }}
        >
          {/* LEFT — auto-populated context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Performance — composite + delta */}
            <Card style={{ padding: 18 }}>
              <MEyebrow>PERFORMANCE</MEyebrow>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
                <MatchCenterScoreArc
                  value={compositeScore}
                  size={66}
                  stroke={5}
                  color={scoreColorForBrand(compositeScore)}
                  ring={BRAND.lineSoft}
                  textColor={BRAND.indigo}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {diff > 3 ? (
                      <TrendingUp size={14} color={BRAND.indigo} />
                    ) : diff < -3 ? (
                      <TrendingDown size={14} color={BRAND.coral} />
                    ) : null}
                    <span
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        color:
                          diff > 3 ? BRAND.indigo : diff < -3 ? BRAND.coral : BRAND.indigoMute,
                      }}
                    >
                      {diff > 0 ? '+' : ''}
                      {diff} VS AVG
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      color: BRAND.indigoMute,
                      fontWeight: 700,
                    }}
                  >
                    SEASON AVG · {avgScore}
                  </span>
                </div>
              </div>
            </Card>

            {/* Skill profile radar */}
            {radarData.length > 0 && (
              <Card style={{ padding: 18 }}>
                <MEyebrow>SKILL PROFILE</MEyebrow>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  <MiniRadar data={radarData} />
                </div>
              </Card>
            )}

            {/* Key stats */}
            {stats && (
              <Card style={{ padding: 18 }}>
                <MEyebrow>KEY STATS</MEyebrow>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '0 16px',
                    marginTop: 10,
                  }}
                >
                  {stats.stats.map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: `1px solid ${BRAND.lineSoft}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: TYPE.mono,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          color: BRAND.indigoMute,
                        }}
                      >
                        {stat.label.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontFamily: TYPE.body,
                          fontSize: 13,
                          fontWeight: 700,
                          color: BRAND.indigo,
                        }}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Strengths + working-on */}
            {review && (
              <Card style={{ padding: 18 }}>
                <MEyebrow>ANALYSIS</MEyebrow>
                {review.strengthAreas.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 9.5,
                        letterSpacing: '0.18em',
                        fontWeight: 700,
                        color: BRAND.indigoMute,
                        marginBottom: 8,
                      }}
                    >
                      STRENGTHS
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {review.strengthAreas.map(s => (
                        <span
                          key={s}
                          style={{
                            fontFamily: TYPE.body,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: BRAND.yellowSoft,
                            color: BRAND.indigo,
                            border: `1px solid ${BRAND.yellow}`,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {review.improvementAreas.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 9.5,
                        letterSpacing: '0.18em',
                        fontWeight: 700,
                        color: BRAND.indigoMute,
                        marginBottom: 8,
                      }}
                    >
                      WORKING ON
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {review.improvementAreas.map(s => (
                        <span
                          key={s}
                          style={{
                            fontFamily: TYPE.body,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: 'transparent',
                            color: BRAND.coral,
                            border: `1px solid ${BRAND.coral}`,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: 18,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px solid ${BRAND.lineSoft}`,
                  }}
                >
                  <SmallStat label="ATTENDANCE" value={attendance ? `${attendance.sessionsAttended}/${attendance.totalSessions}` : '—'} />
                  <SmallStat label="HIGHLIGHTS" value={String(playerHighlights.length)} />
                  <SmallStat label="MATCHES" value={String(review.matchesPlayed)} />
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT — coach input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Star ratings */}
            <Card style={{ padding: 18 }}>
              <MEyebrow>TEMPERAMENT &amp; ATTITUDE</MEyebrow>
              <div style={{ marginTop: 12 }}>
                {[
                  { key: 'attitude' as const, label: 'Attitude' },
                  { key: 'effort' as const, label: 'Effort' },
                  { key: 'coachability' as const, label: 'Coachability' },
                  { key: 'sportsmanship' as const, label: 'Sportsmanship' },
                ].map((attr, i, arr) => (
                  <div
                    key={attr.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${BRAND.lineSoft}` : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: TYPE.body,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: BRAND.indigo,
                      }}
                    >
                      {attr.label}
                    </span>
                    <StarRating value={draft[attr.key]} onChange={v => updateDraft({ [attr.key]: v })} />
                  </div>
                ))}
              </div>

              {devData && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: `1px solid ${BRAND.line}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 9.5,
                      letterSpacing: '0.18em',
                      fontWeight: 700,
                      color: BRAND.indigoMute,
                      marginBottom: 10,
                    }}
                  >
                    DATA-BACKED SOFT SKILLS
                  </div>
                  {devData.softSkills.map(ss => (
                    <div
                      key={ss.category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: TYPE.body,
                          fontSize: 12.5,
                          color: BRAND.indigo,
                          width: 100,
                        }}
                      >
                        {ss.category}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          background: BRAND.lineSoft,
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${ss.score}%`,
                            height: '100%',
                            background: ss.score >= ss.avg ? BRAND.indigo : BRAND.coral,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: TYPE.mono,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: BRAND.indigoMute,
                          width: 28,
                          textAlign: 'right',
                        }}
                      >
                        {ss.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Coach observation */}
            <Card style={{ padding: 18 }}>
              <MEyebrow>COACH&apos;S OBSERVATION</MEyebrow>
              <textarea
                value={draft.observation}
                onChange={e => updateDraft({ observation: e.target.value.slice(0, 280) })}
                placeholder="Share your observations about this player…"
                rows={4}
                style={{
                  ...inputBaseStyle,
                  marginTop: 10,
                  minHeight: 110,
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
              <div
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  color: BRAND.indigoMute,
                  fontWeight: 700,
                  marginTop: 4,
                  textAlign: 'right',
                }}
              >
                {draft.observation.length}/280
              </div>
            </Card>

            {/* Goals */}
            <Card style={{ padding: 18 }}>
              <MEyebrow>GOALS FOR NEXT PERIOD</MEyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {draft.goals.map((goal, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 9.5,
                        letterSpacing: '0.18em',
                        fontWeight: 700,
                        color: BRAND.indigoMute,
                        marginBottom: 6,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')} · GOAL
                    </div>
                    <input
                      value={goal}
                      onChange={e => {
                        const newGoals = [...draft.goals]
                        newGoals[i] = e.target.value
                        updateDraft({ goals: newGoals })
                      }}
                      placeholder={`What should ${player.firstName} work on?`}
                      style={inputBaseStyle}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sticky footer CTA bar */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: BRAND.sand,
            borderTop: `1px solid ${BRAND.line}`,
            padding: isMobile ? '12px 14px' : '14px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            zIndex: 10,
          }}
        >
          <span style={{ flex: 1 }} />
          <button type="button" style={mcButtons.ghost} onClick={() => updateDraft({})}>
            <Save size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />
            Save draft
          </button>
          <button
            type="button"
            style={{
              ...mcButtons.ghost,
              color: BRAND.indigoMute,
              borderColor: BRAND.line,
            }}
          >
            <Download size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />
            PDF
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sendingId === selectedPlayerId || isSent}
            style={{
              ...mcButtons.primary,
              opacity: sendingId === selectedPlayerId || isSent ? 0.5 : 1,
              cursor: sendingId === selectedPlayerId || isSent ? 'default' : 'pointer',
            }}
          >
            <Send size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />
            {isSent ? 'Sent ✓' : sendingId === selectedPlayerId ? 'Sending…' : 'Send to parent →'}
          </button>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ────────────────────────────────────────────────
  const dueCount = rosterPlayers.filter(p => getStatus(p.id) === 'due').length

  return (
    <div
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        color: BRAND.indigo,
        fontFamily: TYPE.body,
      }}
    >
      {/* List header */}
      <div
        style={{
          padding: isMobile ? '20px 14px 14px' : '32px 32px 18px',
        }}
      >
        <MEyebrow>COACH WORKSPACE</MEyebrow>
        <MDisplay size={isMobile ? 32 : 56} style={{ marginTop: 6 }}>
          Individual Development Plans
        </MDisplay>
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            marginTop: 10,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              color: BRAND.indigoMute,
              fontWeight: 700,
            }}
          >
            {selectedRoster?.name?.toUpperCase() ?? 'ALL ROSTERS'}
          </span>
          {dueCount > 0 ? (
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                color: BRAND.coral,
                fontWeight: 700,
              }}
            >
              · {dueCount} REPORT{dueCount > 1 ? 'S' : ''} DUE
            </span>
          ) : (
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                color: BRAND.indigo,
                fontWeight: 700,
              }}
            >
              · ALL UP TO DATE ✓
            </span>
          )}
        </div>
      </div>

      {/* Player list */}
      <div style={{ padding: isMobile ? '0 14px 24px' : '0 32px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rosterPlayers.map(player => {
            const score = squadScores[player.id]
            const compositeScore = score?.compositeScore ?? 0
            const status = getStatus(player.id)
            const pill = statusPill[status]
            const position = player.position[0] || 'CM'

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: BRAND.paper,
                  borderRadius: 6,
                  border: `1px solid ${BRAND.line}`,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(11,8,40,0.04)',
                  transition: 'all 0.15s',
                  fontFamily: TYPE.body,
                }}
              >
                <PlayerAvatar player={player} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: BRAND.indigo,
                      }}
                    >
                      {player.firstName} {player.lastName}
                    </span>
                    <span
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        padding: '2px 6px',
                        borderRadius: 2,
                        border: `1px solid ${BRAND.line}`,
                        color: BRAND.indigoMute,
                      }}
                    >
                      {position}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      color: BRAND.indigoMute,
                      fontWeight: 700,
                    }}
                  >
                    #{player.jerseyNumber}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: TYPE.display,
                    fontSize: 22,
                    color: scoreColorForBrand(compositeScore),
                    letterSpacing: '-0.02em',
                  }}
                >
                  {compositeScore}
                </span>
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    padding: '4px 8px',
                    borderRadius: 3,
                    background: pill.bg,
                    color: pill.ink,
                  }}
                >
                  {pill.label}
                </span>
                <ChevronRight size={16} color={BRAND.indigoMute} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9.5,
          letterSpacing: '0.18em',
          color: BRAND.indigoMute,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: TYPE.display,
          fontSize: 18,
          color: BRAND.indigo,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  )
}
