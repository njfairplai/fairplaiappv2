'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Bell, ChevronDown, ChevronUp, ChevronRight, Clock, MapPin,
  TrendingUp, TrendingDown, X, Activity, Brain, Zap, ExternalLink, Monitor,
} from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import {
  sessions, players, rosters, pendingReviewItems, pitches,
  squadScores, sessionTeamScores, playerKeyMetrics, playerRadarData,
} from '@/lib/mockData'
import NotificationCentre from '@/components/shared/NotificationCentre'

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

const MAX_VISIBLE_SESSIONS = 3

export default function CoachHomePage() {
  const router = useRouter()
  const { availableRosters } = useTeam()
  const [notifOpen, setNotifOpen] = useState(false)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null) // null = All Teams
  const [playerSnapshotId, setPlayerSnapshotId] = useState<string | null>(null)
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [desktopBannerDismissed, setDesktopBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('fairplai_desktop_banner_dismissed') === 'true'
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const teamPhotoRoster = rosters.find(r => r.teamPhoto)

  /* ── Upcoming sessions ── */
  const allUpcoming = sessions
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const nextSessionDay = allUpcoming.length > 0 ? allUpcoming[0].date : null
  const todaySessions = allUpcoming.filter(s => s.date === todayStr)
  const nextDaySessions = nextSessionDay ? allUpcoming.filter(s => s.date === nextSessionDay) : []

  const primarySessions = todaySessions.length > 0 ? todaySessions : nextDaySessions
  const displaySessions = showAllSessions ? allUpcoming : primarySessions.slice(0, MAX_VISIBLE_SESSIONS)
  const remainingCount = allUpcoming.length - primarySessions.slice(0, MAX_VISIBLE_SESSIONS).length
  const hasMoreSessions = remainingCount > 0

  /* ── Team Form (filtered by roster) ── */
  const teamForm = useMemo(() => {
    const matchSessions = sessions
      .filter(s => s.type === 'match' && ['analysed', 'playback_ready'].includes(s.status))
      .filter(s => !selectedRosterId || s.rosterId === selectedRosterId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)

    return matchSessions.map(s => ({
      id: s.id,
      opponent: s.opponent || 'Unknown',
      date: s.date,
      score: sessionTeamScores[s.id] ?? 0,
      rosterId: s.rosterId,
    }))
  }, [selectedRosterId])

  const avgTeamScore = teamForm.length > 0
    ? Math.round(teamForm.reduce((sum, m) => sum + m.score, 0) / teamForm.length)
    : 0

  /* ── Players to Watch (filtered by roster) ── */
  const playersToWatch = useMemo(() => {
    const playerIds = selectedRosterId
      ? new Set(rosterPlayerMap[selectedRosterId] || [])
      : new Set(Object.values(rosterPlayerMap).flat())

    return players
      .filter(p => playerIds.has(p.id))
      .map(p => {
        const score = squadScores[p.id]
        if (!score) return null
        const diff = score.compositeScore - score.avgScore
        return { ...p, compositeScore: score.compositeScore, avgScore: score.avgScore, diff }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.diff - b.diff)
  }, [selectedRosterId])

  /* ── Player snapshot data ── */
  const snapshotPlayer = playerSnapshotId ? players.find(p => p.id === playerSnapshotId) : null
  const snapshotScore = snapshotPlayer ? squadScores[snapshotPlayer.id] : null


  return (
    <>
      <div style={{ background: '#F8F9FC', minHeight: '100vh' }}>

        {/* ═══════════ HERO HEADER WITH TEAM PHOTO ═══════════ */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 200,
        }}>
          {teamPhotoRoster?.teamPhoto && (
            <Image
              src={teamPhotoRoster.teamPhoto}
              alt="Team"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
              priority
            />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: teamPhotoRoster?.teamPhoto
              ? 'linear-gradient(180deg, rgba(10,14,26,0.7) 0%, rgba(10,14,26,0.85) 60%, rgba(10,14,26,0.98) 100%)'
              : '#0A0E1A',
          }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '48px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Image src="/logo-white.png" alt="FairplAI" width={72} height={22} style={{ objectFit: 'contain' }} />
              <div onClick={() => setNotifOpen(true)} style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={22} color="#fff" />
                {pendingReviewItems.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 8, height: 8, borderRadius: '50%', background: '#EF4444',
                  }} />
                )}
              </div>
            </div>

            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {availableRosters.length === 1 ? availableRosters[0].name : 'Home'}
            </h1>
            {availableRosters.length > 1 && (
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '4px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                {availableRosters.map(r => r.name).join(' · ')}
              </p>
            )}
          </div>
        </div>


        {/* ═══════════ ROSTER TOGGLE ═══════════ */}
        {availableRosters.length > 1 && (
          <div style={{
            display: 'flex', gap: 6, padding: '12px 16px 0',
            overflowX: 'auto',
          }}>
            <button
              onClick={() => setSelectedRosterId(null)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                background: !selectedRosterId ? '#4A4AFF' : '#E2E8F0',
                color: !selectedRosterId ? '#fff' : '#64748B',
              }}
            >
              All Teams
            </button>
            {availableRosters.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRosterId(r.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                  background: selectedRosterId === r.id ? '#4A4AFF' : '#E2E8F0',
                  color: selectedRosterId === r.id ? '#fff' : '#64748B',
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}

        {/* ═══════════ DESKTOP BANNER ═══════════ */}
        {!desktopBannerDismissed && (
          <div style={{
            margin: '12px 16px 0',
            padding: '14px 16px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(74,74,255,0.08) 0%, rgba(117,127,255,0.06) 100%)',
            border: '1px solid rgba(74,74,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(74,74,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Monitor size={18} color="#4A4AFF" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Web Portal available
              </p>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0', lineHeight: 1.3 }}>
                Review matches & analytics on the big screen
              </p>
            </div>
            <button
              onClick={() => router.push('/coach/web')}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#4A4AFF', color: '#fff', fontSize: 12, fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Open
            </button>
            <button
              onClick={() => {
                setDesktopBannerDismissed(true)
                localStorage.setItem('fairplai_desktop_banner_dismissed', 'true')
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
            >
              <X size={14} color="#94a3b8" />
            </button>
          </div>
        )}

        {/* ═══════════ UPCOMING SESSIONS ═══════════ */}
        <div style={{ padding: '16px 16px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {todaySessions.length > 0 ? 'Today' : 'Next Up'}
          </span>

          {displaySessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {displaySessions.map((session, idx) => {
                const isMatch = session.type === 'match'
                const accentColor = isMatch ? '#4A4AFF' : '#10B981'
                const pitch = pitches.find(p => p.id === session.pitchId)
                const roster = rosters.find(r => r.id === session.rosterId)
                const daysUntil = daysBetween(todayStr, session.date)
                const daysLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`

                return (
                  <div key={session.id} style={{
                    background: '#fff',
                    borderRadius: 16,
                    borderLeft: `4px solid ${accentColor}`,
                    padding: '18px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {formatDate(session.date)} · {session.startTime}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: daysUntil <= 1 ? '#F59E0B' : '#94a3b8' }}>
                        {daysLabel}
                      </span>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                      {isMatch ? `vs ${session.opponent}` : 'Training Session'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: idx === 0 ? 14 : 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                        background: isMatch ? '#EFF6FF' : '#ECFDF5',
                        color: isMatch ? '#4A4AFF' : '#059669',
                      }}>
                        {isMatch ? 'Match' : 'Training'}
                      </span>
                      {roster && (
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                          {roster.name}
                        </span>
                      )}
                      {pitch && (
                        <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={12} /> {pitch.name}
                        </span>
                      )}
                    </div>

                    {idx === 0 && (
                      <button
                        onClick={() => router.push('/coach/record')}
                        style={{
                          width: '100%', padding: '12px 0', borderRadius: 12,
                          background: accentColor, color: '#fff',
                          fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                        }}
                      >
                        Start Session →
                      </button>
                    )}
                  </div>
                )
              })}

              {hasMoreSessions && !showAllSessions && (
                <button
                  onClick={() => setShowAllSessions(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: 'none', border: '1px solid #E2E8F0', borderRadius: 12,
                    padding: '10px 0', cursor: 'pointer', width: '100%',
                    fontSize: 13, fontWeight: 600, color: '#4A4AFF',
                  }}
                >
                  <ChevronDown size={14} /> {remainingCount} more session{remainingCount > 1 ? 's' : ''}
                </button>
              )}
              {showAllSessions && (
                <button
                  onClick={() => setShowAllSessions(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: 'none', border: '1px solid #E2E8F0', borderRadius: 12,
                    padding: '10px 0', cursor: 'pointer', width: '100%',
                    fontSize: 13, fontWeight: 600, color: '#64748B',
                  }}
                >
                  <ChevronUp size={14} /> Show less
                </button>
              )}
            </div>
          ) : (
            <div style={{
              marginTop: 8, padding: 24, textAlign: 'center',
              background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>No sessions scheduled</p>
            </div>
          )}
        </div>


        {/* ═══════════ TEAM FORM ═══════════ */}
        {teamForm.length > 0 && (
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recent Form
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: getScoreColor(avgTeamScore) }}>
                Avg: {avgTeamScore}
              </span>
            </div>

            <div style={{
              display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto',
              paddingBottom: 4,
            }}>
              {teamForm.map(match => {
                const scoreColor = getScoreColor(match.score)
                const dateObj = new Date(match.date + 'T00:00:00')
                const roster = rosters.find(r => r.id === match.rosterId)

                return (
                  <div
                    key={match.id}
                    onClick={() => router.push(`/coach/match/${match.id}`)}
                    style={{
                      minWidth: 120, background: '#fff', borderRadius: 14,
                      padding: '14px 12px', textAlign: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      flexShrink: 0, cursor: 'pointer',
                      transition: 'transform 100ms ease',
                    }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                      {match.score}
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: '#0F172A',
                      marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      vs {match.opponent}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {monthAbbr[dateObj.getMonth()]} {dateObj.getDate()}
                    </div>
                    {!selectedRosterId && roster && (
                      <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 2 }}>
                        {roster.name}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}


        {/* ═══════════ PLAYERS TO WATCH ═══════════ */}
        {playersToWatch.length > 0 && (
          <div style={{ padding: '20px 16px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Players to Watch
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {(showAllPlayers ? playersToWatch : playersToWatch.slice(0, 3)).map(player => {
                const isDecline = player.diff < 0
                const TrendIcon = isDecline ? TrendingDown : TrendingUp
                const trendColor = isDecline ? '#EF4444' : '#10B981'
                const trendBg = isDecline ? '#FEF2F2' : '#ECFDF5'

                return (
                  <button
                    key={player.id}
                    onClick={() => setPlayerSnapshotId(player.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: '#fff', borderRadius: 14, padding: '12px 14px',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      width: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{
                      width: 4, height: 36, borderRadius: 2,
                      background: trendColor, flexShrink: 0,
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                        {player.firstName} {player.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                        {player.position[0]} · #{player.jerseyNumber}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(player.compositeScore) }}>
                        {player.compositeScore}
                      </span>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        padding: '2px 6px', borderRadius: 16, background: trendBg,
                      }}>
                        <TrendIcon size={12} color={trendColor} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: trendColor }}>
                          {isDecline ? '' : '+'}{player.diff}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={16} color="#CBD5E1" />
                  </button>
                )
              })}
            </div>

            {playersToWatch.length > 3 && (
              <button
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  width: '100%', padding: '10px 0', marginTop: 8,
                  background: 'none', border: '1px solid #E2E8F0', borderRadius: 10,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748B',
                }}
              >
                {showAllPlayers ? 'Show less' : `See ${playersToWatch.length - 3} more`}
                {showAllPlayers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 100 }} />
      </div>

      {/* ═══════════ PLAYER SNAPSHOT MODAL ═══════════ */}
      {snapshotPlayer && snapshotScore && (
        <div
          onClick={() => setPlayerSnapshotId(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end',
            justifyContent: 'center', zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px 20px 0 0',
              width: '100%', maxWidth: 480, padding: '20px 20px 32px',
              maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                  {snapshotPlayer.firstName} {snapshotPlayer.lastName}
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {snapshotPlayer.position[0]} · #{snapshotPlayer.jerseyNumber}
                </div>
              </div>
              <button onClick={() => setPlayerSnapshotId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="#94a3b8" />
              </button>
            </div>

            {/* Score + Trend */}
            {(() => {
              const diff = snapshotScore.compositeScore - snapshotScore.avgScore
              const isDecline = diff < 0
              const trendColor = isDecline ? '#EF4444' : '#10B981'
              const TrendIcon = isDecline ? TrendingDown : TrendingUp
              const metrics = playerKeyMetrics[snapshotPlayer.id]

              return (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: '#F8F9FC', borderRadius: 16, padding: '16px 20px', marginBottom: 16,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 40, fontWeight: 800, color: getScoreColor(snapshotScore.compositeScore), lineHeight: 1 }}>
                        {snapshotScore.compositeScore}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>SCORE</div>
                    </div>
                    <div style={{ width: 1, height: 48, background: '#E2E8F0' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <TrendIcon size={16} color={trendColor} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: trendColor }}>
                          {isDecline ? '' : '+'}{diff} vs average
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        Season avg: {snapshotScore.avgScore}
                      </div>
                    </div>
                  </div>

                  {/* Technical Categories — dual bars */}
                  {(() => {
                    const radarData = playerRadarData[snapshotPlayer.id]
                    if (!radarData) return null
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                        {radarData.map(item => {
                          const diff = item.score - item.avg
                          const diffColor = diff >= 0 ? '#10B981' : '#EF4444'
                          return (
                            <div key={item.category}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{item.category}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 14, fontWeight: 800, color: getScoreColor(item.score) }}>
                                    {item.score}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: diffColor }}>
                                    {diff >= 0 ? '+' : ''}{diff}
                                  </span>
                                </div>
                              </div>
                              {/* Player bar */}
                              <div style={{ height: 6, borderRadius: 3, background: '#F1F5F9', marginBottom: 3 }}>
                                <div style={{
                                  height: '100%', borderRadius: 3, width: `${item.score}%`,
                                  background: getScoreColor(item.score),
                                  transition: 'width 0.5s ease',
                                }} />
                              </div>
                              {/* Team avg bar */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ height: 4, borderRadius: 2, background: '#F1F5F9', flex: 1 }}>
                                  <div style={{
                                    height: '100%', borderRadius: 2, width: `${item.avg}%`,
                                    background: '#CBD5E1',
                                    transition: 'width 0.5s ease',
                                  }} />
                                </div>
                                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>Avg {item.avg}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {/* Quick Insight */}
                  <div style={{
                    background: isDecline ? '#FEF2F2' : '#ECFDF5',
                    borderRadius: 12, padding: '12px 16px', marginBottom: 16,
                    borderLeft: `3px solid ${trendColor}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: trendColor, marginBottom: 2 }}>
                      {isDecline ? 'Needs Attention' : 'Improving'}
                    </div>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>
                      {isDecline
                        ? `Score dropped ${Math.abs(diff)} pts from season average. Review recent sessions for patterns and consider a 1-on-1 check-in.`
                        : `Up ${diff} pts vs season average. Keep momentum going with targeted challenges.`
                      }
                    </div>
                  </div>

                  {/* View Full Profile */}
                  <button
                    onClick={() => {
                      setPlayerSnapshotId(null)
                      router.push(`/coach/squad/${snapshotPlayer.id}`)
                    }}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 12,
                      background: '#0A0E1A', color: '#fff',
                      fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    View Full Profile <ExternalLink size={14} />
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      <NotificationCentre open={notifOpen} onClose={() => setNotifOpen(false)} role="coach" />
    </>
  )
}
