'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Star, Send, Download, Save, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'
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
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} of 5`}
            aria-pressed={filled}
            className="cursor-pointer border-none bg-transparent p-0 leading-none"
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
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-brand-indigo-mute font-fragment text-[8px] font-bold"
          >
            {d.category.slice(0, 4).toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

const inputClass =
  'w-full rounded-[4px] border border-brand-line bg-brand-paper px-3.5 py-2.5 font-satoshi text-sm text-brand-indigo outline-none box-border'

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

  const statusPill: Record<IDPStatus, { label: string; className: string }> = {
    due: { label: 'DUE', className: 'bg-brand-coral/15 text-brand-coral' },
    draft: { label: 'DRAFT', className: 'bg-brand-line-soft text-brand-indigo-mid' },
    sent: { label: '✓ SENT', className: 'bg-brand-yellow-soft text-brand-indigo' },
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
      <div className="min-h-full bg-brand-sand font-satoshi text-brand-indigo">
        {/* Editor header — back link, player identity, status */}
        <div
          className={cn(
            'border-b border-brand-line',
            isMobile ? 'p-3.5' : 'px-8 py-5',
            hasDraft && !isSent ? 'bg-brand-yellow-soft' : 'bg-brand-sand',
          )}
        >
          <button
            type="button"
            onClick={() => setSelectedPlayerId(null)}
            className="mb-3 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-fragment text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-indigo"
          >
            <ArrowLeft size={14} /> Back to list
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <PlayerAvatar player={player} size="md" />
            <div className="min-w-0 flex-1">
              <MEyebrow>INDIVIDUAL DEVELOPMENT PLAN</MEyebrow>
              <MDisplay size={isMobile ? 28 : 36} style={{ marginTop: 4 }}>
                {player.firstName} {player.lastName}
              </MDisplay>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-brand-line px-1.5 py-0.5 font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">
                  {position}
                </span>
                <span className="font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-indigo-mute">
                  #{player.jerseyNumber}
                </span>
                {isSent ? (
                  <span className="rounded-[3px] bg-brand-yellow px-1.5 py-0.5 font-fragment text-[9px] font-bold tracking-[0.18em] text-brand-indigo">
                    ✓ SENT TO PARENT
                  </span>
                ) : hasDraft ? (
                  <span className="rounded-[3px] bg-brand-line-soft px-1.5 py-0.5 font-fragment text-[9px] font-bold tracking-[0.18em] text-brand-indigo-mid">
                    DRAFT IN PROGRESS
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div
          className={cn(
            'grid pb-24',
            isMobile ? 'grid-cols-1 gap-3.5 p-3.5' : 'grid-cols-2 gap-5 p-8',
          )}
        >
          {/* LEFT — auto-populated context */}
          <div className="flex flex-col gap-3.5">
            {/* Performance — composite + delta */}
            <IDPCard>
              <MEyebrow>PERFORMANCE</MEyebrow>
              <div className="mt-3 flex items-center gap-4">
                <MatchCenterScoreArc
                  value={compositeScore}
                  size={66}
                  stroke={5}
                  color={scoreColorForBrand(compositeScore)}
                  ring={BRAND.lineSoft}
                  textColor={BRAND.indigo}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    {diff > 3 ? (
                      <TrendingUp size={14} color={BRAND.indigo} />
                    ) : diff < -3 ? (
                      <TrendingDown size={14} color={BRAND.coral} />
                    ) : null}
                    <span
                      className={cn(
                        'font-fragment text-[11px] font-bold tracking-[0.14em]',
                        diff > 3
                          ? 'text-brand-indigo'
                          : diff < -3
                            ? 'text-brand-coral'
                            : 'text-brand-indigo-mute',
                      )}
                    >
                      {diff > 0 ? '+' : ''}
                      {diff} VS AVG
                    </span>
                  </div>
                  <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                    SEASON AVG · {avgScore}
                  </span>
                </div>
              </div>
            </IDPCard>

            {/* Skill profile radar */}
            {radarData.length > 0 && (
              <IDPCard>
                <MEyebrow>SKILL PROFILE</MEyebrow>
                <div className="mt-1 flex justify-center">
                  <MiniRadar data={radarData} />
                </div>
              </IDPCard>
            )}

            {/* Key stats */}
            {stats && (
              <IDPCard>
                <MEyebrow>KEY STATS</MEyebrow>
                <div
                  className={cn(
                    'mt-2.5 grid gap-x-4',
                    isMobile ? 'grid-cols-1' : 'grid-cols-2',
                  )}
                >
                  {stats.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex justify-between border-b border-brand-line-soft py-2"
                    >
                      <span className="font-fragment text-[10px] font-bold tracking-[0.14em] text-brand-indigo-mute">
                        {stat.label.toUpperCase()}
                      </span>
                      <span className="font-satoshi text-[13px] font-bold text-brand-indigo">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </IDPCard>
            )}

            {/* Strengths + working-on */}
            {review && (
              <IDPCard>
                <MEyebrow>ANALYSIS</MEyebrow>
                {review.strengthAreas.length > 0 && (
                  <div className="mt-2.5">
                    <div className="mb-2 font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                      STRENGTHS
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {review.strengthAreas.map(s => (
                        <span
                          key={s}
                          className="rounded-full border border-brand-yellow bg-brand-yellow-soft px-2.5 py-1 font-satoshi text-xs font-bold text-brand-indigo"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {review.improvementAreas.length > 0 && (
                  <div className="mt-3.5">
                    <div className="mb-2 font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                      WORKING ON
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {review.improvementAreas.map(s => (
                        <span
                          key={s}
                          className="rounded-full border border-brand-coral bg-transparent px-2.5 py-1 font-satoshi text-xs font-bold text-brand-coral"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3.5 flex gap-4 border-t border-brand-line-soft pt-3">
                  <SmallStat label="ATTENDANCE" value={attendance ? `${attendance.sessionsAttended}/${attendance.totalSessions}` : '—'} />
                  <SmallStat label="HIGHLIGHTS" value={String(playerHighlights.length)} />
                  <SmallStat label="MATCHES" value={String(review.matchesPlayed)} />
                </div>
              </IDPCard>
            )}
          </div>

          {/* RIGHT — coach input */}
          <div className="flex flex-col gap-3.5">
            {/* Star ratings */}
            <IDPCard>
              <MEyebrow>TEMPERAMENT &amp; ATTITUDE</MEyebrow>
              <div className="mt-3">
                {[
                  { key: 'attitude' as const, label: 'Attitude' },
                  { key: 'effort' as const, label: 'Effort' },
                  { key: 'coachability' as const, label: 'Coachability' },
                  { key: 'sportsmanship' as const, label: 'Sportsmanship' },
                ].map((attr, i, arr) => (
                  <div
                    key={attr.key}
                    className={cn(
                      'flex items-center justify-between py-2.5',
                      i < arr.length - 1 && 'border-b border-brand-line-soft',
                    )}
                  >
                    <span className="font-satoshi text-[13.5px] font-semibold text-brand-indigo">
                      {attr.label}
                    </span>
                    <StarRating value={draft[attr.key]} onChange={v => updateDraft({ [attr.key]: v })} />
                  </div>
                ))}
              </div>

              {devData && (
                <div className="mt-3.5 border-t border-brand-line pt-3.5">
                  <div className="mb-2.5 font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
                    DATA-BACKED SOFT SKILLS
                  </div>
                  {devData.softSkills.map(ss => (
                    <div key={ss.category} className="mb-2 flex items-center gap-2.5">
                      <span className="w-[100px] font-satoshi text-[12.5px] text-brand-indigo">
                        {ss.category}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-brand-line-soft">
                        <div
                          className="h-full rounded-[3px]"
                          style={{
                            width: `${ss.score}%`,
                            background: ss.score >= ss.avg ? BRAND.indigo : BRAND.coral,
                          }}
                        />
                      </div>
                      <span className="w-7 text-right font-fragment text-[10px] font-bold tracking-[0.12em] text-brand-indigo-mute">
                        {ss.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </IDPCard>

            {/* Coach observation */}
            <IDPCard>
              <MEyebrow>COACH&apos;S OBSERVATION</MEyebrow>
              <textarea
                value={draft.observation}
                onChange={e => updateDraft({ observation: e.target.value.slice(0, 280) })}
                placeholder="Share your observations about this player…"
                rows={4}
                className={cn(inputClass, 'mt-2.5 min-h-[110px] resize-y leading-normal')}
              />
              <div className="mt-1 text-right font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-indigo-mute">
                {draft.observation.length}/280
              </div>
            </IDPCard>

            {/* Goals */}
            <IDPCard>
              <MEyebrow>GOALS FOR NEXT PERIOD</MEyebrow>
              <div className="mt-3 flex flex-col gap-2.5">
                {draft.goals.map((goal, i) => (
                  <div key={i}>
                    <div className="mb-1.5 font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
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
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </IDPCard>
          </div>
        </div>

        {/* Sticky footer CTA bar */}
        <div
          className={cn(
            'sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-brand-line bg-brand-sand',
            isMobile ? 'px-3.5 py-3' : 'px-8 py-3.5',
          )}
        >
          <span className="flex-1" />
          <button type="button" style={mcButtons.ghost} onClick={() => updateDraft({})}>
            <Save size={12} className="mr-1 align-[-2px]" />
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
            <Download size={12} className="mr-1 align-[-2px]" />
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
            <Send size={12} className="mr-1 align-[-2px]" />
            {isSent ? 'Sent ✓' : sendingId === selectedPlayerId ? 'Sending…' : 'Send to parent →'}
          </button>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ────────────────────────────────────────────────
  const dueCount = rosterPlayers.filter(p => getStatus(p.id) === 'due').length

  return (
    <div className="min-h-full bg-brand-sand font-satoshi text-brand-indigo">
      {/* List header */}
      <div className={cn(isMobile ? 'px-3.5 pt-5 pb-3.5' : 'px-8 pt-8 pb-4')}>
        <MEyebrow>COACH WORKSPACE</MEyebrow>
        <MDisplay size={isMobile ? 32 : 56} style={{ marginTop: 6 }}>
          Individual Development Plans
        </MDisplay>
        <div className="mt-2.5 flex flex-wrap items-center gap-3.5">
          <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            {selectedRoster?.name?.toUpperCase() ?? 'ALL ROSTERS'}
          </span>
          {dueCount > 0 ? (
            <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-coral">
              · {dueCount} REPORT{dueCount > 1 ? 'S' : ''} DUE
            </span>
          ) : (
            <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo">
              · ALL UP TO DATE ✓
            </span>
          )}
        </div>
      </div>

      {/* Player list */}
      <div className={cn(isMobile ? 'px-3.5 pb-6' : 'px-8 pb-8')}>
        <div className="flex flex-col gap-2">
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
                className="flex w-full cursor-pointer items-center gap-3.5 rounded-md border border-brand-line bg-brand-paper px-3.5 py-3 text-left font-satoshi shadow-[0_1px_3px_rgba(11,8,40,0.04)] transition-all duration-150"
              >
                <PlayerAvatar player={player} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-brand-indigo">
                      {player.firstName} {player.lastName}
                    </span>
                    <span className="rounded-sm border border-brand-line px-1.5 py-0.5 font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute">
                      {position}
                    </span>
                  </div>
                  <span className="font-fragment text-[10px] font-bold tracking-[0.16em] text-brand-indigo-mute">
                    #{player.jerseyNumber}
                  </span>
                </div>
                <span
                  className="font-clash text-[22px] tracking-[-0.02em]"
                  style={{ color: scoreColorForBrand(compositeScore) }}
                >
                  {compositeScore}
                </span>
                <span
                  className={cn(
                    'rounded-[3px] px-2 py-1 font-fragment text-[9.5px] font-bold tracking-[0.18em]',
                    pill.className,
                  )}
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

function IDPCard({ children }: { children: React.ReactNode }) {
  return <Card style={{ padding: 18 }}>{children}</Card>
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
        {label}
      </div>
      <div className="mt-0.5 font-clash text-lg text-brand-indigo">
        {value}
      </div>
    </div>
  )
}
