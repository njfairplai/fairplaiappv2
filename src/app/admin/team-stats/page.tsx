'use client'

import { useState } from 'react'
import { COLORS, SHADOWS } from '@/lib/constants'
import { squadPerformance, academyWideStats, teamAlerts, squadMatchRecords, leagueStandings } from '@/lib/mockData'

/* ─── helpers ─────────────────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 7.0) return COLORS.success
  if (score >= 6.0) return COLORS.warning
  return COLORS.error
}

function trendLabel(trend: 'improving' | 'stable' | 'declining') {
  if (trend === 'improving') return { text: '\u2191 Improving', color: COLORS.success }
  if (trend === 'stable') return { text: '\u2192 Stable', color: COLORS.warning }
  return { text: '\u2193 Declining', color: COLORS.error }
}

function severityColor(severity: 'warning' | 'info' | 'positive') {
  if (severity === 'warning') return COLORS.error
  if (severity === 'info') return COLORS.primary
  return COLORS.success
}

function severityOrder(severity: 'warning' | 'info' | 'positive') {
  if (severity === 'warning') return 0
  if (severity === 'info') return 1
  return 2
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function positionColor(pos: number): string {
  if (pos <= 3) return COLORS.success
  if (pos <= 6) return COLORS.warning
  return COLORS.error
}

function resultColor(r: string): string {
  if (r === 'W') return COLORS.success
  if (r === 'D') return COLORS.warning
  return COLORS.error
}

/* ─── styles ──────────────────────────────────────────────── */
const card: React.CSSProperties = {
  background: COLORS.cardBg,
  boxShadow: SHADOWS.card,
  borderRadius: 12,
  padding: 20,
}

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1B1650',
  marginBottom: 16,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  color: COLORS.muted,
  letterSpacing: 0.5,
  marginBottom: 4,
}

const bigNumber: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#1B1650',
  lineHeight: 1.2,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: COLORS.muted,
  marginTop: 2,
}

type TabKey = 'overview' | 'competitive' | 'development'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'competitive', label: 'Competitive' },
  { key: 'development', label: 'Development' },
]

/* ─── component ───────────────────────────────────────────── */
export default function TeamStatsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [expandedStandings, setExpandedStandings] = useState<Record<string, boolean>>({
    [squadMatchRecords[0]?.squadId]: true,
  })

  const stats = academyWideStats
  const scoreDiff = stats.averageScore - stats.previousAverageScore
  const scoreDiffStr = scoreDiff >= 0 ? `+${scoreDiff.toFixed(2)}` : scoreDiff.toFixed(2)
  const sessionPct = Math.round((stats.totalSessionsDelivered / stats.totalSessionsPlanned) * 100)

  const sortedAlerts = [...teamAlerts].sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity))

  /* ── SVG line chart data ── */
  const trend = stats.monthlyScoreTrend
  const chartW = 600
  const chartH = 160
  const padX = 40
  const padY = 20
  const minVal = Math.min(...trend) - 0.2
  const maxVal = Math.max(...trend) + 0.2
  const points = trend.map((v, i) => {
    const x = padX + (i / (trend.length - 1)) * (chartW - padX * 2)
    const y = padY + ((maxVal - v) / (maxVal - minVal)) * (chartH - padY * 2)
    return { x, y, v }
  })
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  /* ── find max per comparison column ── */
  const comparisonFields = ['avgScore', 'avgTechnical', 'avgTemperament', 'avgPhysical', 'attendanceRate'] as const
  const maxValues: Record<string, number> = {}
  comparisonFields.forEach((field) => {
    maxValues[field] = Math.max(...squadPerformance.map((s) => s[field]))
  })

  const toggleStanding = (squadId: string) => {
    setExpandedStandings((prev) => ({ ...prev, [squadId]: !prev[squadId] }))
  }

  /* ── Helper: find match record for a squad ── */
  const getMatchRecord = (squadId: string) => squadMatchRecords.find((r) => r.squadId === squadId)

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B1650', marginBottom: 16 }}>Team Stats</h1>

      {/* ── Tab Selector ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === tab.key ? COLORS.primary : COLORS.cloud,
              color: activeTab === tab.key ? '#fff' : '#1B1650',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: OVERVIEW
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* ── Academy-Wide Metrics ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
            {/* Total Players */}
            <div style={card}>
              <p style={labelStyle}>Total Players</p>
              <p style={bigNumber}>{stats.totalActivePlayers}</p>
              <p style={subtitleStyle}>Across all squads</p>
            </div>

            {/* Academy Average */}
            <div style={card}>
              <p style={labelStyle}>Academy Average</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <p style={bigNumber}>{stats.averageScore.toFixed(1)}</p>
                <span style={{ fontSize: 14, fontWeight: 600, color: scoreDiff >= 0 ? COLORS.success : COLORS.error }}>
                  {scoreDiff >= 0 ? '\u2191' : '\u2193'}
                </span>
              </div>
              <p style={subtitleStyle}>{scoreDiffStr} vs last month</p>
            </div>

            {/* Session Delivery */}
            <div style={card}>
              <p style={labelStyle}>Session Delivery</p>
              <p style={bigNumber}>{stats.totalSessionsDelivered}/{stats.totalSessionsPlanned}</p>
              <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: COLORS.cloud, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sessionPct}%`, background: COLORS.primary, borderRadius: 3 }} />
              </div>
              <p style={subtitleStyle}>This month</p>
            </div>

            {/* Attendance Rate */}
            <div style={card}>
              <p style={labelStyle}>Attendance Rate</p>
              <p style={bigNumber}>{stats.averageAttendance}%</p>
              <p style={subtitleStyle}>Academy-wide</p>
            </div>
          </div>

          {/* ── Squad Summary Cards ── */}
          <p style={sectionTitle}>Squad Summary</p>
          {squadPerformance.map((squad) => {
            const matchRecord = getMatchRecord(squad.squadId)
            const wdl = matchRecord ? `${matchRecord.won}W ${matchRecord.drawn}D ${matchRecord.lost}L` : '--'
            const leagueName = matchRecord ? `${matchRecord.league}` : ''
            const position = matchRecord?.position ?? 0
            const form = matchRecord?.form ?? []

            return (
              <div
                key={squad.squadId}
                style={{
                  ...card,
                  marginBottom: 12,
                  padding: '14px 20px',
                }}
              >
                {/* Top row: name / position / score */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  {/* Left: squad + coach */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1B1650', margin: 0, lineHeight: 1.3 }}>{squad.squadName}</p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{squad.coachName}</p>
                  </div>

                  {/* Middle: league position pill + league name */}
                  {matchRecord && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 10px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#fff',
                          background: positionColor(position),
                          minWidth: 32,
                        }}
                      >
                        {ordinal(position)}
                      </span>
                      <span style={{ fontSize: 11, color: COLORS.muted, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leagueName}
                      </span>
                    </div>
                  )}

                  {/* Right: avg score circle */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: scoreColor(squad.avgScore),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {squad.avgScore.toFixed(1)}
                  </div>
                </div>

                {/* Bottom row: compact stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: COLORS.muted }}>
                  <span style={{ fontWeight: 600, color: '#1B1650' }}>{wdl}</span>
                  <span>Att: {squad.attendanceRate}%</span>
                  {/* Form dots */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ marginRight: 2 }}>Form:</span>
                    {form.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: resultColor(f),
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </span>
                  <span>Sessions: {squad.sessionsThisMonth}/{squad.sessionsPlanned}</span>
                </div>
              </div>
            )
          })}

          {/* ── Alerts & Insights ── */}
          <div style={{ ...card, marginTop: 12, marginBottom: 24 }}>
            <p style={sectionTitle}>Alerts &amp; Insights</p>
            {sortedAlerts.map((alert) => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                {/* dot */}
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: severityColor(alert.severity), flexShrink: 0 }} />
                {/* message */}
                <span style={{ flex: 1, fontSize: 14, color: '#1B1650' }}>{alert.message}</span>
                {/* right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(alert.date)}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: COLORS.cloud, color: COLORS.muted }}>{alert.squad}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: COMPETITIVE
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'competitive' && (
        <>
          {/* ── Competitive Overview ── */}
          <p style={sectionTitle}>Competitive Overview</p>
          {squadMatchRecords.map((squad) => {
            const isTopThree = squad.position <= 3
            return (
              <div
                key={squad.squadId}
                style={{
                  ...card,
                  marginBottom: 16,
                  borderLeft: isTopThree ? `3px solid ${COLORS.success}` : undefined,
                }}
              >
                {/* Card header */}
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#1B1650', margin: 0 }}>{squad.squadName}</p>
                  <p style={{ fontSize: 13, color: COLORS.muted, margin: '2px 0 0' }}>
                    {squad.league} &middot; {squad.division}
                  </p>
                </div>

                {/* League position */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: positionColor(squad.position), lineHeight: 1 }}>
                    {ordinal(squad.position)}
                  </span>
                  <span style={{ fontSize: 14, color: COLORS.muted }}>out of {squad.totalTeams} teams</span>
                </div>

                {/* Season Record row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'P', value: squad.played },
                    { label: 'W', value: squad.won },
                    { label: 'D', value: squad.drawn },
                    { label: 'L', value: squad.lost },
                    { label: 'GF', value: squad.goalsFor },
                    { label: 'GA', value: squad.goalsAgainst },
                    { label: 'GD', value: squad.goalDifference >= 0 ? `+${squad.goalDifference}` : squad.goalDifference },
                    { label: 'Pts', value: squad.points },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', minWidth: 36 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 2 }}>{s.label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#1B1650' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Form Guide */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase' }}>Form</span>
                  {squad.form.map((f, i) => (
                    <span
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: resultColor(f),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Recent Results (last 3) */}
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Recent Results</p>
                {squad.recentMatches.slice(0, 3).map((m, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: resultColor(m.result) }}>{m.result}</span>
                        <span style={{ fontSize: 14, color: '#1B1650' }}>vs {m.opponent} &mdash; {m.score}</span>
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(m.date)}</span>
                    </div>
                    {m.scorers.length > 0 && (
                      <p style={{ fontSize: 12, color: COLORS.muted, marginLeft: 26, marginTop: 2 }}>
                        {m.scorers.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          })}

          {/* ── League Standings ── */}
          <p style={{ ...sectionTitle, marginTop: 8 }}>League Standings</p>
          {squadMatchRecords.map((squad) => {
            const isExpanded = !!expandedStandings[squad.squadId]
            const standings = leagueStandings[squad.squadId] || []
            return (
              <div key={squad.squadId} style={{ ...card, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
                {/* Collapsible header */}
                <button
                  onClick={() => toggleStanding(squad.squadId)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1B1650' }}>
                    {squad.squadName} &mdash; {squad.league} {squad.division}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: COLORS.muted,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      display: 'inline-block',
                    }}
                  >
                    &#9660;
                  </span>
                </button>

                {/* Table */}
                {isExpanded && (
                  <div style={{ overflowX: 'auto', padding: '0 20px 16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                          {['Pos', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: h === 'Team' ? 'left' : 'center',
                                padding: '8px 6px',
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: COLORS.muted,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((row, idx) => {
                          const isOurTeam = row.isUs
                          const isEven = idx % 2 === 0
                          const totalTeams = standings.length
                          let posColor: string = COLORS.muted
                          if (row.position <= 3) posColor = COLORS.success
                          else if (row.position > totalTeams - 3) posColor = COLORS.error

                          return (
                            <tr
                              key={row.position}
                              style={{
                                background: isOurTeam
                                  ? `${COLORS.primary}1A`
                                  : isEven
                                  ? '#fff'
                                  : COLORS.lightBg,
                                borderBottom: `1px solid ${COLORS.border}`,
                              }}
                            >
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 700, color: posColor }}>{row.position}</td>
                              <td style={{ padding: '8px 6px', fontWeight: isOurTeam ? 700 : 400, color: '#1B1650' }}>{row.team}</td>
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: isOurTeam ? 700 : 400, color: '#1B1650' }}>{row.played}</td>
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: isOurTeam ? 700 : 400, color: '#1B1650' }}>{row.won}</td>
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: isOurTeam ? 700 : 400, color: '#1B1650' }}>{row.drawn}</td>
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: isOurTeam ? 700 : 400, color: '#1B1650' }}>{row.lost}</td>
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: isOurTeam ? 700 : 400, color: '#1B1650' }}>{row.gd >= 0 ? `+${row.gd}` : row.gd}</td>
                              <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 700, color: '#1B1650' }}>{row.points}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: DEVELOPMENT
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'development' && (
        <>
          {/* ── Squad Performance Cards ── */}
          <p style={sectionTitle}>Squad Performance</p>
          {squadPerformance.map((squad) => {
            const t = trendLabel(squad.trend)
            const total = squad.playersImproving + squad.playersStable + squad.playersDeclining
            const improvingPct = (squad.playersImproving / total) * 100
            const stablePct = (squad.playersStable / total) * 100
            const decliningPct = (squad.playersDeclining / total) * 100

            return (
              <div key={squad.squadId} style={{ ...card, marginBottom: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1B1650' }}>{squad.squadName}</span>
                    <span style={{ fontSize: 13, color: COLORS.muted, marginLeft: 10 }}>{squad.coachName}</span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: scoreColor(squad.avgScore), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                    {squad.avgScore.toFixed(1)}
                  </div>
                </div>

                {/* Trend badge */}
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: t.color, background: `${t.color}18`, marginBottom: 12 }}>
                  {t.text}
                </span>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>Attendance</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1B1650' }}>{squad.attendanceRate}%</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>Sessions</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1B1650' }}>{squad.sessionsThisMonth}/{squad.sessionsPlanned}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>Players</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1B1650' }}>{squad.playerCount}</p>
                  </div>
                </div>

                {/* Player Development bar */}
                <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>Player Development</p>
                <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ width: `${improvingPct}%`, background: COLORS.success }} />
                  <div style={{ width: `${stablePct}%`, background: COLORS.cloud }} />
                  <div style={{ width: `${decliningPct}%`, background: COLORS.error }} />
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: COLORS.muted, marginBottom: 12 }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.success, marginRight: 4 }} />{squad.playersImproving} Improving</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.cloud, marginRight: 4 }} />{squad.playersStable} Stable</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS.error, marginRight: 4 }} />{squad.playersDeclining} Declining</span>
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#1B1650' }}>Top: {squad.topPerformer.name} ({squad.topPerformer.score})</span>
                  <span style={{ fontSize: 13, color: COLORS.warning, fontWeight: 600 }}>Concern: {squad.areaOfConcern}</span>
                </div>

                {/* Last session */}
                <p style={{ fontSize: 12, color: COLORS.muted }}>Last session: {formatDate(squad.lastSessionDate)}</p>
              </div>
            )
          })}

          {/* ── Squad Comparison Table ── */}
          <div style={{ ...card, marginTop: 8, marginBottom: 24, overflowX: 'auto' }}>
            <p style={sectionTitle}>Squad Comparison</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                  {['Squad', 'Avg Score', 'Technical', 'Temperament', 'Physical', 'Attendance', 'Trend'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: COLORS.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {squadPerformance.map((squad, idx) => {
                  const t = trendLabel(squad.trend)
                  const isEven = idx % 2 === 0
                  const cellVal = (field: typeof comparisonFields[number], value: number) => {
                    const isMax = value === maxValues[field]
                    return (
                      <td key={field} style={{ padding: '10px 12px', fontWeight: isMax ? 700 : 400, color: isMax ? COLORS.primary : '#1B1650' }}>
                        {field === 'attendanceRate' ? `${value}%` : value.toFixed(1)}
                      </td>
                    )
                  }
                  return (
                    <tr key={squad.squadId} style={{ background: isEven ? '#fff' : COLORS.lightBg, borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1B1650' }}>{squad.squadName}</td>
                      {cellVal('avgScore', squad.avgScore)}
                      {cellVal('avgTechnical', squad.avgTechnical)}
                      {cellVal('avgTemperament', squad.avgTemperament)}
                      {cellVal('avgPhysical', squad.avgPhysical)}
                      {cellVal('attendanceRate', squad.attendanceRate)}
                      <td style={{ padding: '10px 12px', color: t.color, fontWeight: 600, fontSize: 13 }}>{t.text}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Academy Performance Trend ── */}
          <div style={{ ...card, marginBottom: 24 }}>
            <p style={sectionTitle}>Academy Performance Trend</p>
            <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 30}`} style={{ display: 'block' }}>
              {/* grid lines */}
              {points.map((p, i) => (
                <line key={`grid-${i}`} x1={p.x} y1={padY} x2={p.x} y2={chartH} stroke={COLORS.cloud} strokeWidth={1} />
              ))}
              {/* line */}
              <path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {/* dots + labels */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={5} fill={COLORS.primary} />
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize={12} fontWeight={600} fill="#1B1650">{p.v.toFixed(2)}</text>
                  <text x={p.x} y={chartH + 20} textAnchor="middle" fontSize={12} fill={COLORS.muted}>{stats.monthLabels[i]}</text>
                </g>
              ))}
            </svg>
          </div>
        </>
      )}
    </div>
  )
}
