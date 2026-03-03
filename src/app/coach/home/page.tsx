'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Bell, ChevronRight, AlertTriangle } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { sessions, players, rosters, pendingReviewItems, squadScores, pitches } from '@/lib/mockData'
import { coachTokens } from '@/styles/coach-tokens'

/* ── helpers ── */
function getPlayerIdsForRoster(rosterId: string): string[] {
  const ids = new Set<string>()
  sessions
    .filter(s => s.rosterId === rosterId)
    .forEach(s => s.participatingPlayerIds.forEach(pid => ids.add(pid)))
  return Array.from(ids)
}

const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatCardDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayAbbr[d.getDay()]}, ${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

/* ── scrollbar-hidden CSS ── */
const hideScrollbarCSS = `
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`

interface DvrSession {
  id: string
  label: string
  date: string
  duration: number
}

export default function CoachHomePage() {
  const router = useRouter()
  const { selectedRosterId, setSelectedRosterId, availableRosters } = useTeam()
  const [dvrSession, setDvrSession] = useState<DvrSession | null>(null)
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})
  const animStarted = useRef(false)

  const selectedRoster = rosters.find(r => r.id === selectedRosterId) || rosters[0]
  const rosterPlayerIds = getPlayerIdsForRoster(selectedRosterId)
  const rosterPlayers = players.filter(p => rosterPlayerIds.includes(p.id))
  const rosterSessions = sessions.filter(s => s.rosterId === selectedRosterId)

  const todayStr = new Date().toISOString().slice(0, 10)

  /* ── season summary stats ── */
  const sessionCount = rosterSessions.length
  const playerScores = rosterPlayerIds
    .map(pid => squadScores[pid])
    .filter(Boolean)
  const avgScore = playerScores.length > 0
    ? Math.round(playerScores.reduce((sum, s) => sum + s.compositeScore, 0) / playerScores.length)
    : 0
  const topScorerEntry = rosterPlayerIds
    .map(pid => ({ pid, score: squadScores[pid]?.compositeScore ?? 0 }))
    .sort((a, b) => b.score - a.score)[0]
  const topScorer = topScorerEntry ? players.find(p => p.id === topScorerEntry.pid) : null

  /* ── upcoming sessions ── */
  const upcomingSessions = [...rosterSessions]
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  /* ── recent sessions ── */
  const recentSessions = [...rosterSessions]
    .filter(s => s.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  // Animated counter
  useEffect(() => {
    if (animStarted.current) return
    animStarted.current = true

    const targets: Record<string, number> = {
      sessions: sessionCount,
      winRate: 68,
      avgScore: avgScore,
      goals: 18,
      distance: 6.8,
      topScorer: 0, // not animated — text value
    }

    const duration = 800
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out: 1 - (1-p)^3
      const eased = 1 - Math.pow(1 - progress, 3)

      const current: Record<string, number> = {}
      for (const [key, target] of Object.entries(targets)) {
        current[key] = Math.round(target * eased * 10) / 10
      }
      setAnimatedValues(current)

      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [sessionCount, avgScore])

  /* ── DVR overlay handler ── */
  function handleRecentSessionTap(session: typeof sessions[0]) {
    if (
      session.status === 'analysed' ||
      session.status === 'playback_ready' ||
      session.status === 'complete'
    ) {
      const isMatch = session.type === 'match'
      const label = isMatch ? `vs ${session.opponent}` : 'Training Session'
      const duration = diffMinutes(session.startTime, session.endTime)
      setDvrSession({ id: session.id, label, date: session.date, duration })
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />
      <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>

        {/* ═══════════ HERO SECTION ═══════════ */}
        <div style={{ position: 'relative', overflow: 'hidden', height: 320 }}>
          {/* Team photo background */}
          <Image
            src="/players/teamphoto.jpg"
            alt="Team"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            priority
          />

          {/* Gradient overlay layer 1: bottom fade */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,14,26,0.3) 0%, rgba(10,14,26,0.95) 100%)',
            zIndex: 1,
          }} />
          {/* Gradient overlay layer 2: left darken */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(10,14,26,0.4) 0%, transparent 60%)',
            zIndex: 2,
          }} />

          {/* Top bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '48px 20px 0',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Image
              src="/logo-white.png"
              alt="FairplAI"
              width={72}
              height={22}
              style={{ objectFit: 'contain' }}
            />
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="#fff" />
              {pendingReviewItems.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#EF4444',
                }} />
              )}
            </div>
          </div>

          {/* Bottom content */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            zIndex: 3,
          }}>
            <div style={{
              color: '#4A4AFF',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: 2,
            }}>
              SPRING TERM 2026
            </div>
            <h1 style={{
              color: '#fff',
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              marginTop: 4,
            }}>
              {selectedRoster.name}
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              margin: '4px 0 0',
            }}>
              Marcus Silva
            </p>

            {/* Team toggle pills */}
            {availableRosters.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {availableRosters.map(r => {
                  const isActive = r.id === selectedRosterId
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRosterId(r.id)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        background: isActive ? '#fff' : 'rgba(255,255,255,0.12)',
                        color: isActive ? '#0A0E1A' : 'rgba(255,255,255,0.6)',
                        border: isActive ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                      }}
                    >
                      {r.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ STATS STRIP ═══════════ */}
        <div style={{ background: '#111827', padding: '16px 20px' }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{Math.round(animatedValues.sessions ?? 0)}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Sessions Played</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)', alignSelf: 'center' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{Math.round(animatedValues.winRate ?? 0)}%</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Win Rate</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)', alignSelf: 'center' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{Math.round(animatedValues.avgScore ?? 0)}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Avg Score</div>
            </div>
          </div>

          {/* Row separator */}
          <div style={{ height: 12 }} />

          {/* Row 2 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{Math.round(animatedValues.goals ?? 0)}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Total Goals</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)', alignSelf: 'center' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{(animatedValues.distance ?? 0).toFixed(1)}km</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Avg Distance</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)', alignSelf: 'center' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{topScorer?.firstName ?? '\u2014'}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Top Performer</div>
            </div>
          </div>

          {/* Recent Form strip */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Form</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {recentSessions.slice(0, 5).reverse().map((s, i) => {
                const participantScores = s.participatingPlayerIds
                  .map(pid => squadScores[pid]?.compositeScore)
                  .filter((v): v is number => v !== undefined)
                const sessionScore = participantScores.length > 0
                  ? Math.round(participantScores.reduce((a, b) => a + b, 0) / participantScores.length)
                  : 50

                let dotColor = '#10B981' // win (>=75)
                if (sessionScore < 60) dotColor = '#EF4444' // loss
                else if (sessionScore < 75) dotColor = '#F59E0B' // draw

                return (
                  <div key={i} style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: dotColor,
                  }} />
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══════════ UPCOMING SESSIONS ═══════════ */}
        <div style={{ background: '#F8F9FC', padding: '20px 20px 8px' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>Upcoming</span>
            <span style={{ color: '#4A4AFF', fontSize: 13, cursor: 'pointer' }}>See all</span>
          </div>

          {upcomingSessions.length > 0 ? (
            <div
              className="hide-scrollbar"
              style={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap' }}
            >
              {upcomingSessions.map(session => {
                const isMatch = session.type === 'match'
                const accentColor = isMatch ? '#4A4AFF' : '#10B981'
                const label = isMatch ? `vs ${session.opponent}` : 'Training Session'
                const pitch = pitches.find(p => p.id === session.pitchId)
                const pitchName = pitch?.name ?? ''
                const daysUntil = daysBetween(todayStr, session.date)

                return (
                  <div
                    key={session.id}
                    style={{
                      width: 200,
                      minWidth: 200,
                      background: '#fff',
                      borderRadius: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                      padding: 14,
                      marginRight: 12,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Top accent bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: accentColor,
                      borderRadius: '3px 3px 0 0',
                    }} />

                    <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginTop: 2 }}>
                      {formatCardDate(session.date)}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      {session.startTime} &middot; {pitchName}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                      {isMatch ? (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: '#EFF6FF',
                          color: '#4A4AFF',
                        }}>
                          Match
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: '#ECFDF5',
                          color: '#059669',
                        }}>
                          Training
                        </span>
                      )}
                      {daysUntil <= 7 && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748B', fontSize: 14, padding: '20px 0' }}>
              No upcoming sessions scheduled
            </div>
          )}
        </div>

        {/* ═══════════ RECENT SESSIONS ═══════════ */}
        <div style={{ background: '#F8F9FC', padding: 20 }}>
          {/* Section header */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>Recent Sessions</span>
          </div>

          {recentSessions.map(session => {
            const d = new Date(session.date + 'T00:00:00')
            const dayNum = d.getDate()
            const month = monthAbbr[d.getMonth()]
            const isMatch = session.type === 'match'
            const label = isMatch ? `vs ${session.opponent}` : 'Training Session'
            const rosterName = rosters.find(r => r.id === session.rosterId)?.name ?? ''
            const typeLabel = isMatch ? 'Match' : 'Training'
            const duration = diffMinutes(session.startTime, session.endTime)

            /* status badge / score */
            let badgeText = ''
            let badgeBg = ''
            let badgeColor = ''
            let scoreDisplay: number | null = null
            let scoreColor = ''
            let accentBorderColor = '#F59E0B' // pending default

            if (session.status === 'analysed') {
              const participantScores = session.participatingPlayerIds
                .map(pid => squadScores[pid]?.compositeScore)
                .filter((v): v is number => v !== undefined)
              scoreDisplay = participantScores.length > 0
                ? Math.round(participantScores.reduce((a, b) => a + b, 0) / participantScores.length)
                : 75
              if (scoreDisplay >= 75) scoreColor = '#10B981'
              else if (scoreDisplay >= 60) scoreColor = '#F59E0B'
              else scoreColor = '#EF4444'
              accentBorderColor = '#4A4AFF'
            } else if (session.type === 'drill' && session.status === 'playback_ready') {
              badgeText = '\u25B6 Footage'
              badgeBg = 'transparent'
              badgeColor = '#10B981'
              accentBorderColor = '#10B981'
            } else if (session.status === 'complete' || session.status === 'scheduled') {
              badgeText = 'Pending'
              badgeBg = 'transparent'
              badgeColor = '#F59E0B'
              accentBorderColor = '#F59E0B'
            }

            return (
              <div
                key={session.id}
                onClick={() => handleRecentSessionTap(session)}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  padding: 0,
                  marginBottom: 10,
                  overflow: 'hidden',
                  borderLeft: `4px solid ${accentBorderColor}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  {/* Date block */}
                  <div style={{
                    width: 48,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{dayNum}</span>
                    <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase' as const }}>{month}</span>
                  </div>

                  {/* Center info */}
                  <div style={{ flex: 1, minWidth: 0, padding: '0 12px' }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      {isMatch ? (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 20,
                          background: '#EFF6FF',
                          color: '#4A4AFF',
                        }}>
                          Match
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 20,
                          background: '#ECFDF5',
                          color: '#059669',
                        }}>
                          Training
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>{duration} min</span>
                    </div>
                  </div>

                  {/* Right: score or badge + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {scoreDisplay !== null && (
                      <span style={{ fontSize: 24, fontWeight: 800, color: scoreColor }}>{scoreDisplay}</span>
                    )}
                    {badgeText && (
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: badgeColor,
                        whiteSpace: 'nowrap',
                      }}>
                        {badgeText}
                      </span>
                    )}
                    <ChevronRight size={20} color="#CBD5E1" style={{ marginLeft: 8 }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ═══════════ NEEDS YOUR INPUT ═══════════ */}
        {pendingReviewItems.length > 0 && (
          <div style={{
            background: '#FFFBEB',
            padding: '16px 20px',
            borderLeft: '3px solid #F59E0B',
          }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{
                color: '#92400E',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {'\u26A0'} Needs Your Input
              </span>
            </div>

            <div
              className="hide-scrollbar"
              style={{ display: 'flex', overflowX: 'auto', flexWrap: 'nowrap' }}
            >
              {pendingReviewItems.map(item => {
                const isClassify = item.type === 'classify'
                return (
                  <div
                    key={item.id}
                    style={{
                      width: 200,
                      minWidth: 200,
                      padding: 12,
                      background: '#fff',
                      borderRadius: 12,
                      borderLeft: '4px solid #F59E0B',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      marginRight: 12,
                    }}
                  >
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 10,
                      background: isClassify ? '#FEF3C7' : '#EFF6FF',
                      color: isClassify ? '#92400E' : '#1E40AF',
                    }}>
                      {isClassify ? 'Classify Session' : 'Tag Players'}
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>
                      {item.sessionLabel}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      {isClassify
                        ? `${item.segments?.filter(s => s.aiClassification === 'uncertain').length ?? 1} uncertain segment needs confirmation`
                        : `${item.playersToTag?.length ?? 0} players need identity confirmation`
                      }
                    </div>
                    <button
                      onClick={() => router.push('/coach/review')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#4A4AFF',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: 0,
                        marginTop: 8,
                      }}
                    >
                      {'Review \u2192'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 24 }} />
      </div>

      {/* ═══════════ DVR PLAYER OVERLAY ═══════════ */}
      {dvrSession && (
        <div
          onClick={() => setDvrSession(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            background: '#0D1020',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top bar */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '48px 16px 12px',
            }}
          >
            <button
              onClick={() => setDvrSession(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 28,
                fontWeight: 300,
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
                width: 40,
                textAlign: 'left',
              }}
            >
              &times;
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{dvrSession.label}</div>
              <div style={{ color: '#9DA2B3', fontSize: 12 }}>
                {formatCardDate(dvrSession.date)}
              </div>
            </div>
            <div style={{ width: 40 }} />
          </div>

          {/* CSS-drawn pitch */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
          >
            <div style={{
              width: '100%',
              maxWidth: 400,
              aspectRatio: '3 / 2',
              background: '#2E7D32',
              borderRadius: 8,
              border: '2px solid #fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Center line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: 2,
                height: '100%',
                background: 'rgba(255,255,255,0.6)',
              }} />
              {/* Center circle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.6)',
                transform: 'translate(-50%, -50%)',
              }} />
              {/* Center dot */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.6)',
                transform: 'translate(-50%, -50%)',
              }} />
              {/* Left penalty area */}
              <div style={{
                position: 'absolute',
                top: '20%',
                left: 0,
                width: '18%',
                height: '60%',
                borderRight: '2px solid rgba(255,255,255,0.6)',
                borderTop: '2px solid rgba(255,255,255,0.6)',
                borderBottom: '2px solid rgba(255,255,255,0.6)',
              }} />
              {/* Right penalty area */}
              <div style={{
                position: 'absolute',
                top: '20%',
                right: 0,
                width: '18%',
                height: '60%',
                borderLeft: '2px solid rgba(255,255,255,0.6)',
                borderTop: '2px solid rgba(255,255,255,0.6)',
                borderBottom: '2px solid rgba(255,255,255,0.6)',
              }} />
              {/* Left goal area */}
              <div style={{
                position: 'absolute',
                top: '35%',
                left: 0,
                width: '8%',
                height: '30%',
                borderRight: '2px solid rgba(255,255,255,0.6)',
                borderTop: '2px solid rgba(255,255,255,0.6)',
                borderBottom: '2px solid rgba(255,255,255,0.6)',
              }} />
              {/* Right goal area */}
              <div style={{
                position: 'absolute',
                top: '35%',
                right: 0,
                width: '8%',
                height: '30%',
                borderLeft: '2px solid rgba(255,255,255,0.6)',
                borderTop: '2px solid rgba(255,255,255,0.6)',
                borderBottom: '2px solid rgba(255,255,255,0.6)',
              }} />

              {/* Play button centered on pitch */}
              <button
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div style={{
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: '18px solid #0D1020',
                  marginLeft: 4,
                }} />
              </button>
            </div>
          </div>

          {/* Scrub bar at bottom */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ padding: '12px 16px 40px' }}
          >
            <div style={{
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              position: 'relative',
              marginBottom: 8,
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: 4,
                width: '0%',
                borderRadius: 2,
                background: 'linear-gradient(90deg, #4A4AFF, #7C3AED)',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0%',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#fff',
                transform: 'translate(-50%, -50%)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#9DA2B3' }}>00:00</span>
              <span style={{ fontSize: 12, color: '#9DA2B3' }}>
                {String(Math.floor(dvrSession.duration / 60)).padStart(2, '0')}:{String(dvrSession.duration % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
