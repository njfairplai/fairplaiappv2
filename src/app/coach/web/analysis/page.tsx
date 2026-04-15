'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock, MapPin, Trophy, BarChart3,
  ArrowUpDown, Shirt, ClipboardList, Eye,
  ChevronRight,
} from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { useTeam } from '@/contexts/TeamContext'
import { useCoachTheme } from '@/contexts/CoachThemeContext'
import { sessions, matchAnalyses, rosters, players } from '@/lib/mockData'
import { useIsMobile } from '@/hooks/useIsMobile'

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
  const { colors } = useCoachTheme()
  const isMobile = useIsMobile()

  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const [filterType, setFilterType] = useState<'all' | 'training' | 'competitive'>('all')
  const [tableView, setTableView] = useState<'prep' | 'analyse' | 'analysed'>('analyse')

  const getDisplayType = (type: string) =>
    type === 'match' ? 'competitive' : 'training'

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
      if (selectedRosterId !== 'all' && s.rosterId !== selectedRosterId) return false
      const displayType = getDisplayType(s.type)
      if (filterType !== 'all' && displayType !== filterType) return false
      return true
    })
  }, [selectedRosterId, filterType])

  // ── Three action buckets ──
  const prepBucket = useMemo(() =>
    filtered.filter(s => s.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
  [filtered])

  const analyseBucket = useMemo(() =>
    filtered.filter(s => s.status === 'complete' || s.status === 'processing')
      .sort((a, b) => a.date.localeCompare(b.date)),
  [filtered])

  const analysedBucket = useMemo(() => {
    const arr = filtered.filter(s => s.status === 'analysed' || s.status === 'playback_ready')
      .sort((a, b) => b.date.localeCompare(a.date))
    if (sortBy === 'score') {
      return [...arr].sort((a, b) => (sessionScores[b.id] || 0) - (sessionScores[a.id] || 0))
    }
    return arr
  }, [filtered, sortBy, sessionScores])

  const currentBucket =
    tableView === 'prep' ? prepBucket :
    tableView === 'analyse' ? analyseBucket :
    analysedBucket

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: colors.pageBg, minHeight: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '24px 20px', width: '100%', boxSizing: 'border-box' }}>

        {/* ── ACTION CTA CARDS (3) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 10 : 14,
          marginBottom: isMobile ? 18 : 24,
        }}>
          {([
            {
              id: 'prep' as const,
              step: 1,
              label: 'To Prep',
              caption: 'Plan attendance, lineup & tactics',
              count: prepBucket.length,
              next: prepBucket[0],
              icon: ClipboardList,
              accent: COLORS.primary,
            },
            {
              id: 'analyse' as const,
              step: 2,
              label: 'To Analyse',
              caption: 'Recorded sessions awaiting AI analysis',
              count: analyseBucket.length,
              next: analyseBucket[0],
              icon: Eye,
              accent: '#F59E0B',
            },
            {
              id: 'analysed' as const,
              step: 3,
              label: 'Analysed',
              caption: 'Match insights & player scores ready',
              count: analysedBucket.length,
              next: analysedBucket[0],
              icon: BarChart3,
              accent: '#10B981',
            },
          ]).map(card => {
            const Icon = card.icon
            const isActive = tableView === card.id
            const nextLabel = card.next
              ? card.next.type === 'match'
                ? `vs ${card.next.opponent}`
                : `${rosters.find(r => r.id === card.next.rosterId)?.name || 'Team'} training`
              : null
            return (
              <button
                key={card.id}
                onClick={() => setTableView(card.id)}
                style={{
                  textAlign: 'left',
                  padding: '18px 18px',
                  borderRadius: 14,
                  background: isActive ? `${card.accent}0E` : colors.cardBg,
                  border: `1.5px solid ${isActive ? card.accent : colors.cardBorder}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  boxShadow: isActive
                    ? `0 4px 16px ${card.accent}30`
                    : `inset 4px 0 0 ${card.accent}`,
                }}
              >
                {/* Step pill (pipeline indicator) */}
                <div style={{
                  position: 'absolute',
                  top: 12, right: 12,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: `${card.accent}1A`,
                  fontSize: 9,
                  fontWeight: 800,
                  color: card.accent,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}>
                  Step {card.step}
                </div>

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 56 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${card.accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={17} color={card.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: card.accent, lineHeight: 1 }}>
                        {card.count}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
                        {card.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {card.caption}
                    </div>
                  </div>
                </div>

                {/* Inline next item preview */}
                {card.next ? (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: isActive ? `${card.accent}10` : colors.controlBg,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: colors.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        {card.id === 'prep' ? 'Next up' : card.id === 'analyse' ? 'Oldest pending' : 'Most recent'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {nextLabel}
                      </div>
                      <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
                        {formatDate(card.next.date)} · {formatTime(card.next.startTime)}
                      </div>
                    </div>
                    <ChevronRight size={14} color={card.accent} style={{ opacity: 0.7 }} />
                  </div>
                ) : (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: colors.controlBg,
                    fontSize: 11, color: colors.textFaint, textAlign: 'center',
                  }}>
                    No sessions in this bucket
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── BUCKET HEADER + FILTERS ── */}
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          marginBottom: 12, flexWrap: 'wrap', gap: 8,
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              {tableView === 'prep' && 'Sessions to prep'}
              {tableView === 'analyse' && 'Sessions to analyse'}
              {tableView === 'analysed' && 'Analysed sessions'}
            </h3>
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              {currentBucket.length} {currentBucket.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          {/* Filter / Sort Bar (right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 2, background: colors.controlBg, borderRadius: 6, padding: 2 }}>
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
                    background: filterType === f.id ? colors.controlBgActive : 'transparent',
                    color: filterType === f.id ? colors.textPrimary : colors.textMuted,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {tableView === 'analysed' && (
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none',
                  background: colors.controlBg, color: colors.textSecondary,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <ArrowUpDown size={11} /> {sortBy === 'date' ? 'By date' : 'By score'}
              </button>
            )}
          </div>
        </div>

        {/* ── MOBILE: Card list ── */}
        {isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentBucket.map(s => {
              const displayType = getDisplayType(s.type)
              const rosterName = rosters.find(r => r.id === s.rosterId)?.name || 'Team'
              const score = sessionScores[s.id]
              const topPlayer = sessionTopPlayers[s.id]
              const game = gameScores[s.id]
              const isClickable = tableView === 'analysed'

              return (
                <div
                  key={s.id}
                  onClick={() => isClickable && router.push(`/coach/web/match/${s.id}`)}
                  style={{
                    background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
                    borderRadius: 12, padding: '12px 14px',
                    cursor: isClickable ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: displayType === 'competitive' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)',
                        color: displayType === 'competitive' ? '#EF4444' : '#10B981',
                        fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>
                        {displayType === 'competitive' ? 'Match' : 'Training'}
                      </span>
                      <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, flexShrink: 0 }}>
                        {formatDate(s.date)}
                      </span>
                      {tableView !== 'analysed' && (
                        <span style={{ fontSize: 11, color: colors.textFaint, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} /> {formatTime(s.startTime)}
                        </span>
                      )}
                    </div>
                    {tableView === 'analysed' && score && (
                      displayType === 'competitive' && game ? (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: game.result === 'W' ? '#10B981' : game.result === 'L' ? '#EF4444' : '#F59E0B' }}>
                            {game.score}
                          </span>
                          <span style={{ fontSize: 9, color: colors.textMuted, fontWeight: 600, marginLeft: 4 }}>
                            {game.result}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(score) }}>{score}</span>
                      )
                    )}
                    {tableView === 'analyse' && (
                      <span style={{ fontSize: 11, color: s.status === 'processing' ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                        {s.status === 'processing' ? 'Processing' : 'Awaiting'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                      {displayType === 'competitive' ? `vs ${s.opponent}` : `${rosterName} — Team A vs Team B`}
                    </div>
                    {displayType === 'competitive' && s.competition && (
                      <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 2 }}>{s.competition}</div>
                    )}
                  </div>

                  {/* Meta row + action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: colors.textMuted, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={10} /> {getPitchName(s.pitchId)}
                      </span>
                      {tableView === 'analysed' && topPlayer && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Trophy size={10} /> {topPlayer.name} ({topPlayer.score})
                        </span>
                      )}
                    </div>
                    {tableView === 'prep' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push('/coach/web/record') }}
                        style={{
                          padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: '#10B981', color: '#fff',
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        Prep & Record
                      </button>
                    )}
                    {tableView === 'analyse' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push('/coach/web/record?mode=analyse') }}
                        style={{
                          padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: s.status === 'processing' ? `${COLORS.primary}15` : '#F59E0B',
                          color: s.status === 'processing' ? COLORS.primary : '#fff',
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {s.status === 'processing' ? 'View progress' : 'Analyse'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {currentBucket.length === 0 && (
              <div style={{
                padding: '32px 16px', textAlign: 'center', color: colors.textFaint, fontSize: 13,
                background: colors.cardBg, borderRadius: 12, border: `1px solid ${colors.cardBorder}`,
              }}>
                {tableView === 'prep' && 'No upcoming sessions to prep'}
                {tableView === 'analyse' && 'All recorded sessions are analysed — nothing pending'}
                {tableView === 'analysed' && 'No analysed sessions match your filters'}
              </div>
            )}
          </div>
        )}

        {/* ── DESKTOP: Table ── */}
        {!isMobile && (
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${colors.cardBorder}`,
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              tableView === 'analysed' ? '62px 72px 1fr 80px 60px 100px' :
              tableView === 'prep' ? '62px 72px 1fr 90px 110px' :
              '62px 72px 1fr 90px 110px',
            minWidth: 0,
            padding: '10px 16px', background: colors.tableHeaderBg,
            fontSize: 10, fontWeight: 700, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span>Date</span>
            <span>Type</span>
            <span>Session</span>
            {tableView === 'analysed' && (
              <>
                <span style={{ textAlign: 'center' }}>Status</span>
                <span style={{ textAlign: 'center' }}>Score</span>
                <span style={{ textAlign: 'right' }}>Top Player</span>
              </>
            )}
            {tableView === 'prep' && (
              <>
                <span style={{ textAlign: 'center' }}>Time</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </>
            )}
            {tableView === 'analyse' && (
              <>
                <span style={{ textAlign: 'center' }}>Status</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </>
            )}
          </div>

          {/* ANALYSED ROWS */}
          {tableView === 'analysed' && analysedBucket.map((s, i) => {
            const displayType = getDisplayType(s.type)
            const rosterName = rosters.find(r => r.id === s.rosterId)?.name || 'Team'
            const score = sessionScores[s.id]
            const topPlayer = sessionTopPlayers[s.id]
            const game = gameScores[s.id]

            return (
              <div key={s.id} onClick={() => router.push(`/coach/web/match/${s.id}`)} style={{
                display: 'grid', gridTemplateColumns: '62px 72px 1fr 80px 60px 100px',
                padding: '12px 16px', alignItems: 'center',
                background: i % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd,
                borderTop: `1px solid ${colors.tableBorder}`,
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>{formatDate(s.date)}</span>
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                    {displayType === 'competitive' ? `vs ${s.opponent}` : `${rosterName} — Team A vs Team B`}
                  </span>
                  {displayType === 'competitive' && s.competition && (
                    <span style={{ fontSize: 11, color: colors.textFaint, marginLeft: 8 }}>{s.competition}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                    {s.status === 'analysed' ? 'Analysed' : 'Playback'}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {displayType === 'competitive' && game ? (
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: game.result === 'W' ? '#10B981' : game.result === 'L' ? '#EF4444' : '#F59E0B' }}>
                        {game.score}
                      </span>
                      <div style={{ fontSize: 9, color: colors.textMuted, fontWeight: 600 }}>
                        {game.result === 'W' ? 'Won' : game.result === 'L' ? 'Lost' : 'Draw'}
                      </div>
                    </div>
                  ) : score ? (
                    <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(score) }}>{score}</span>
                  ) : (
                    <span style={{ fontSize: 12, color: colors.textFaint }}>--</span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {topPlayer ? (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topPlayer.name}</div>
                      <div style={{ fontSize: 10, color: colors.textMuted }}>{topPlayer.score}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: colors.textFaint }}>--</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* PREP ROWS */}
          {tableView === 'prep' && prepBucket.map((s, i) => {
            const displayType = getDisplayType(s.type)
            const rosterName = rosters.find(r => r.id === s.rosterId)?.name || 'Team'

            return (
              <div key={s.id} style={{
                display: 'grid', gridTemplateColumns: '62px 72px 1fr 90px 110px',
                padding: '12px 16px', alignItems: 'center',
                background: i % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd,
                borderTop: `1px solid ${colors.tableBorder}`,
              }}>
                <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>{formatDate(s.date)}</span>
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                    {displayType === 'competitive' ? `vs ${s.opponent}` : `${rosterName} — Training Match`}
                  </span>
                  {displayType === 'competitive' && s.competition && (
                    <span style={{ fontSize: 11, color: colors.textFaint, marginLeft: 8 }}>{s.competition}</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={10} /> {getPitchName(s.pitchId)}
                    </span>
                    {displayType === 'training' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Shirt size={10} /> Team A vs B
                      </span>
                    )}
                    {displayType === 'competitive' && s.competition && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Trophy size={10} /> {s.competition}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Clock size={11} /> {formatTime(s.startTime)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => router.push('/coach/web/record')}
                    style={{
                      padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: '#10B981',
                      color: '#fff',
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    Prep & Record
                  </button>
                </div>
              </div>
            )
          })}

          {/* ANALYSE ROWS */}
          {tableView === 'analyse' && analyseBucket.map((s, i) => {
            const displayType = getDisplayType(s.type)
            const rosterName = rosters.find(r => r.id === s.rosterId)?.name || 'Team'

            return (
              <div key={s.id} style={{
                display: 'grid', gridTemplateColumns: '62px 72px 1fr 90px 110px',
                padding: '12px 16px', alignItems: 'center',
                background: i % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd,
                borderTop: `1px solid ${colors.tableBorder}`,
              }}>
                <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>{formatDate(s.date)}</span>
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                    {displayType === 'competitive' ? `vs ${s.opponent}` : `${rosterName} — Team A vs Team B`}
                  </span>
                  {displayType === 'competitive' && s.competition && (
                    <span style={{ fontSize: 11, color: colors.textFaint, marginLeft: 8 }}>{s.competition}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {s.status === 'processing' ? (
                    <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Processing</span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Awaiting</span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => router.push('/coach/web/record?mode=analyse')}
                    style={{
                      padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: s.status === 'processing' ? `${COLORS.primary}15` : '#F59E0B',
                      color: s.status === 'processing' ? COLORS.primary : '#fff',
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {s.status === 'processing' ? 'View progress' : 'Analyse'}
                  </button>
                </div>
              </div>
            )
          })}

          {/* Empty state */}
          {currentBucket.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: colors.textFaint, fontSize: 13 }}>
              {tableView === 'prep' && 'No upcoming sessions to prep'}
              {tableView === 'analyse' && 'All recorded sessions are analysed — nothing pending'}
              {tableView === 'analysed' && 'No analysed sessions match your filters'}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
