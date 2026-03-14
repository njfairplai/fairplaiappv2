'use client'

import { useState, useMemo } from 'react'
import { players, seasonReviews, seasonProgressData, matchHistory, playerSeasonStats, squadScores, highlights } from '@/lib/mockData'
import { useTeam } from '@/contexts/TeamContext'
import { COLORS } from '@/lib/constants'
import { ArrowLeft, Trophy, TrendingUp, Star, Video, Send, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SeasonReviewData } from '@/lib/types'

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function scoreTierColor(score: number): string {
  if (score >= 75) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}

export default function SeasonReviewPage() {
  const router = useRouter()
  const { selectedRosterId } = useTeam()
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null)
  const [sentReports, setSentReports] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    const stored: Record<string, boolean> = {}
    const rosterPlayers = rosterPlayerMap[selectedRosterId] || rosterPlayerMap['roster_001']
    rosterPlayers.forEach(pid => {
      if (localStorage.getItem(`fairplai_season_report_sent_${pid}`)) {
        stored[pid] = true
      }
    })
    return stored
  })
  const [sendingReport, setSendingReport] = useState<string | null>(null)
  const [reelGenerated, setReelGenerated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('fairplai_season_reel_generated') === 'true'
  })
  const [generatingReel, setGeneratingReel] = useState(false)

  const rosterPlayers = useMemo(() => {
    const ids = rosterPlayerMap[selectedRosterId] || rosterPlayerMap['roster_001']
    return players.filter(p => ids.includes(p.id))
  }, [selectedRosterId])

  const rosterReviews = useMemo(() => {
    const ids = rosterPlayerMap[selectedRosterId] || rosterPlayerMap['roster_001']
    return seasonReviews.filter(r => ids.includes(r.playerId))
  }, [selectedRosterId])

  const totalMatches = useMemo(() => {
    return matchHistory.filter(m => m.type === 'match').length
  }, [])

  const avgTeamScore = useMemo(() => {
    const scores = Object.values(squadScores).map(s => s.compositeScore)
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [])

  const totalHighlights = useMemo(() => {
    return rosterReviews.reduce((sum, r) => sum + r.highlightCount, 0)
  }, [rosterReviews])

  const handleSendReport = (playerId: string) => {
    if (sentReports[playerId] || sendingReport) return
    setSendingReport(playerId)
    setTimeout(() => {
      setSendingReport(null)
      setSentReports(prev => ({ ...prev, [playerId]: true }))
      localStorage.setItem(`fairplai_season_report_sent_${playerId}`, 'true')
    }, 1500)
  }

  const handleGenerateReel = () => {
    if (reelGenerated || generatingReel) return
    setGeneratingReel(true)
    setTimeout(() => {
      setGeneratingReel(false)
      setReelGenerated(true)
      localStorage.setItem('fairplai_season_reel_generated', 'true')
    }, 2000)
  }

  const getPlayerById = (id: string) => players.find(p => p.id === id)
  const getPlayerStats = (id: string) => playerSeasonStats.find(s => s.playerId === id)

  // ─── STYLES ───────────────────────────────────────────────
  const styles: Record<string, React.CSSProperties> = {
    page: {
      background: '#F8F9FC',
      minHeight: '100vh',
      paddingBottom: 120,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '20px 20px 8px',
    },
    backButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: COLORS.navy,
      margin: 0,
    },
    subtitle: {
      fontSize: 13,
      color: COLORS.muted,
      margin: '2px 0 0',
    },
    section: {
      padding: '0 20px',
    },
    overviewRow: {
      display: 'flex',
      gap: 10,
      padding: '16px 20px',
    },
    overviewCard: {
      flex: 1,
      background: '#FFFFFF',
      borderRadius: 12,
      padding: '16px 12px',
      textAlign: 'center' as const,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    overviewIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 8px',
    },
    overviewValue: {
      fontSize: 22,
      fontWeight: 700,
      color: COLORS.navy,
      margin: 0,
    },
    overviewLabel: {
      fontSize: 11,
      color: COLORS.muted,
      margin: '2px 0 0',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: COLORS.navy,
      margin: '24px 0 12px',
    },
    progressRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative' as const,
      padding: '16px 0',
    },
    progressLine: {
      position: 'absolute' as const,
      top: '50%',
      left: 20,
      right: 20,
      height: 2,
      background: COLORS.border,
      transform: 'translateY(-50%)',
      zIndex: 0,
    },
    progressBubble: {
      width: 42,
      height: 42,
      borderRadius: 21,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      color: '#FFFFFF',
      fontWeight: 700,
      fontSize: 13,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    },
    progressLabel: {
      fontSize: 9,
      color: COLORS.muted,
      textAlign: 'center' as const,
      marginTop: 4,
    },
    progressCard: {
      background: '#FFFFFF',
      borderRadius: 12,
      padding: '16px 16px 8px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    playerCard: {
      background: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 10,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    },
    playerHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left' as const,
    },
    playerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      background: COLORS.primary + '18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: COLORS.primary,
      overflow: 'hidden',
      flexShrink: 0,
    },
    playerName: {
      fontSize: 15,
      fontWeight: 600,
      color: COLORS.navy,
      margin: 0,
    },
    positionBadge: {
      display: 'inline-block',
      background: COLORS.primary + '14',
      color: COLORS.primary,
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 10,
      marginTop: 2,
    },
    playerMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginLeft: 'auto',
    },
    metaStat: {
      textAlign: 'center' as const,
    },
    metaValue: {
      fontSize: 15,
      fontWeight: 700,
      color: COLORS.navy,
      margin: 0,
    },
    metaLabel: {
      fontSize: 9,
      color: COLORS.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.4,
    },
    expandedBody: {
      padding: '0 16px 16px',
      borderTop: `1px solid ${COLORS.border}`,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      margin: '14px 0',
    },
    statCell: {
      background: '#F8F9FC',
      borderRadius: 8,
      padding: '10px 12px',
    },
    statLabel: {
      fontSize: 11,
      color: COLORS.muted,
      margin: 0,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 700,
      color: COLORS.navy,
      margin: '2px 0 0',
    },
    bestMatch: {
      background: COLORS.success + '10',
      border: `1px solid ${COLORS.success}30`,
      borderRadius: 10,
      padding: '10px 14px',
      margin: '12px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    bestMatchText: {
      fontSize: 13,
      color: COLORS.navy,
      fontWeight: 500,
      margin: 0,
    },
    tagRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 6,
      margin: '8px 0',
    },
    strengthTag: {
      background: COLORS.success + '14',
      color: COLORS.success,
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 12,
    },
    improveTag: {
      background: COLORS.warning + '14',
      color: '#B87A00',
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 12,
    },
    tagLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: COLORS.muted,
      margin: '12px 0 4px',
    },
    highlightRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      margin: '12px 0',
    },
    highlightText: {
      fontSize: 13,
      color: COLORS.navy,
      fontWeight: 500,
    },
    sendButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      padding: '12px 16px',
      borderRadius: 10,
      border: 'none',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 14,
      transition: 'background 0.2s',
    },
    bottomAction: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      padding: '16px 20px',
      background: '#F8F9FC',
      borderTop: `1px solid ${COLORS.border}`,
      zIndex: 10,
    },
    reelButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      padding: '14px 20px',
      borderRadius: 12,
      border: 'none',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    spinner: {
      width: 18,
      height: 18,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#FFFFFF',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
  }

  return (
    <div style={styles.page}>
      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ─── HEADER ──────────────────────────────────────── */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft size={22} color={COLORS.navy} />
        </button>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Season in Review</h1>
          <p style={styles.subtitle}>Spring 2026</p>
        </div>
      </div>

      {/* ─── TEAM OVERVIEW CARDS ─────────────────────────── */}
      <div style={styles.overviewRow}>
        <div style={styles.overviewCard}>
          <div style={{ ...styles.overviewIcon, background: COLORS.primary + '14' }}>
            <Trophy size={18} color={COLORS.primary} />
          </div>
          <p style={styles.overviewValue}>{totalMatches}</p>
          <p style={styles.overviewLabel}>Total Matches</p>
        </div>
        <div style={styles.overviewCard}>
          <div style={{ ...styles.overviewIcon, background: COLORS.success + '14' }}>
            <TrendingUp size={18} color={COLORS.success} />
          </div>
          <p style={styles.overviewValue}>{avgTeamScore}</p>
          <p style={styles.overviewLabel}>Avg Team Score</p>
        </div>
        <div style={styles.overviewCard}>
          <div style={{ ...styles.overviewIcon, background: COLORS.warning + '14' }}>
            <Star size={18} color={COLORS.warning} />
          </div>
          <p style={styles.overviewValue}>{totalHighlights}</p>
          <p style={styles.overviewLabel}>Total Highlights</p>
        </div>
      </div>

      {/* ─── SEASON PROGRESS CHART ───────────────────────── */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Season Progress</p>
        <div style={styles.progressCard}>
          <div style={styles.progressRow}>
            <div style={styles.progressLine} />
            {seasonProgressData.map((point, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <div
                  style={{
                    ...styles.progressBubble,
                    background: scoreTierColor(point.score),
                  }}
                >
                  {point.score}
                </div>
                <span style={styles.progressLabel}>{point.match}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PLAYER SEASON CARDS ─────────────────────────── */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Player Reviews</p>
        {rosterPlayers.map(player => {
          const review = rosterReviews.find(r => r.playerId === player.id)
          if (!review) return null
          const isExpanded = expandedPlayerId === player.id
          const stats = getPlayerStats(player.id)
          const isSending = sendingReport === player.id
          const isSent = sentReports[player.id]

          return (
            <div key={player.id} style={styles.playerCard}>
              {/* Collapsed header */}
              <button
                style={styles.playerHeader}
                onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                aria-expanded={isExpanded}
              >
                <div style={styles.playerAvatar}>
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={`${player.firstName} ${player.lastName}`}
                      style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover' }}
                    />
                  ) : (
                    `${player.firstName[0]}${player.lastName[0]}`
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.playerName}>{player.firstName} {player.lastName}</p>
                  <span style={styles.positionBadge}>{player.position.join(' / ')}</span>
                </div>
                <div style={styles.playerMeta}>
                  <div style={styles.metaStat}>
                    <p style={styles.metaValue}>{review.avgScore}</p>
                    <span style={styles.metaLabel}>Avg</span>
                  </div>
                  <div style={styles.metaStat}>
                    <p style={{ ...styles.metaValue, color: scoreTierColor(review.peakScore) }}>{review.peakScore}</p>
                    <span style={styles.metaLabel}>Peak</span>
                  </div>
                  <div style={styles.metaStat}>
                    <p style={styles.metaValue}>{review.matchesPlayed}</p>
                    <span style={styles.metaLabel}>Played</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} color={COLORS.muted} />
                  ) : (
                    <ChevronDown size={18} color={COLORS.muted} />
                  )}
                </div>
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div style={styles.expandedBody}>
                  {/* Stats Grid */}
                  {stats && (
                    <div style={styles.statsGrid}>
                      {stats.stats.map((s, idx) => (
                        <div key={idx} style={styles.statCell}>
                          <p style={styles.statLabel}>{s.label}</p>
                          <p style={styles.statValue}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Best Match */}
                  <div style={styles.bestMatch}>
                    <Trophy size={16} color={COLORS.success} />
                    <p style={styles.bestMatchText}>
                      Best: {review.bestMatch.score} vs {review.bestMatch.opponent} ({formatDate(review.bestMatch.date)})
                    </p>
                  </div>

                  {/* Strengths */}
                  <p style={styles.tagLabel}>Strengths</p>
                  <div style={styles.tagRow}>
                    {review.strengthAreas.map((s, idx) => (
                      <span key={idx} style={styles.strengthTag}>{s}</span>
                    ))}
                  </div>

                  {/* Areas to Improve */}
                  <p style={styles.tagLabel}>Areas to Improve</p>
                  <div style={styles.tagRow}>
                    {review.improvementAreas.map((s, idx) => (
                      <span key={idx} style={styles.improveTag}>{s}</span>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div style={styles.highlightRow}>
                    <Video size={16} color={COLORS.primary} />
                    <span style={styles.highlightText}>{review.highlightCount} highlight{review.highlightCount !== 1 ? 's' : ''} this season</span>
                  </div>

                  {/* Send Report Button */}
                  <button
                    style={{
                      ...styles.sendButton,
                      background: isSent ? COLORS.success + '14' : COLORS.success,
                      color: isSent ? COLORS.success : '#FFFFFF',
                      opacity: isSending ? 0.7 : 1,
                      cursor: isSent || isSending ? 'default' : 'pointer',
                    }}
                    onClick={() => handleSendReport(player.id)}
                    disabled={isSent || isSending}
                  >
                    {isSending ? (
                      <>
                        <div style={styles.spinner} />
                        Sending...
                      </>
                    ) : isSent ? (
                      <>
                        <Check size={16} color={COLORS.success} />
                        Sent
                      </>
                    ) : (
                      <>
                        <Send size={16} color="#FFFFFF" />
                        Send Season Report via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ─── BOTTOM ACTION ───────────────────────────────── */}
      <div style={styles.bottomAction}>
        <button
          style={{
            ...styles.reelButton,
            background: reelGenerated ? COLORS.success + '14' : COLORS.primary,
            color: reelGenerated ? COLORS.success : '#FFFFFF',
            opacity: generatingReel ? 0.7 : 1,
            cursor: reelGenerated || generatingReel ? 'default' : 'pointer',
          }}
          onClick={handleGenerateReel}
          disabled={reelGenerated || generatingReel}
        >
          {generatingReel ? (
            <>
              <div style={styles.spinner} />
              Generating Highlight Reel...
            </>
          ) : reelGenerated ? (
            <>
              <Check size={18} color={COLORS.success} />
              Highlight reel generated! 12 clips compiled
            </>
          ) : (
            <>
              <Video size={18} color="#FFFFFF" />
              Generate Highlight Reel
            </>
          )}
        </button>
      </div>
    </div>
  )
}
