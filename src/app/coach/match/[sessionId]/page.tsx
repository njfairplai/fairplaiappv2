'use client'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { sessions, players, squadScores, highlights, sessionTeamScores } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import type { Highlight } from '@/lib/types'

/* ── colour constants ── */
const C = {
  primary: '#4A4AFF',
  navy: '#0F172A',
  darkBg: '#0A0E1A',
  muted: '#64748B',
  lightBg: '#F8F9FC',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

/* ── helpers ── */
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()]}, ${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function calcDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function getScoreColor(score: number): string {
  if (score >= 75) return C.success
  if (score >= 60) return C.warning
  return C.error
}

function getEventBadge(eventType: string): { bg: string; color: string; label: string } {
  switch (eventType) {
    case 'goal':
      return { bg: '#FEF3C7', color: '#92400E', label: '\u26BD Goal' }
    case 'key_pass':
      return { bg: '#EFF6FF', color: '#1E40AF', label: '\uD83C\uDFAF Key Pass' }
    case 'sprint_recovery':
      return { bg: '#DCFCE7', color: '#166534', label: '\u26A1 Sprint' }
    case 'tackle':
      return { bg: '#F3E8FF', color: '#6B21A8', label: '\uD83D\uDEE1 Tackle' }
    case 'save':
      return { bg: '#FEF3C7', color: '#92400E', label: '\uD83E\uDDE4 Save' }
    default:
      return { bg: '#F5F6FC', color: '#6E7180', label: eventType }
  }
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#D97706'
  if (['CB', 'LB', 'RB'].includes(position)) return '#059669'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return C.primary
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#DC2626'
  return C.muted
}

function getPositionGradient(position: string): string {
  if (position === 'GK') return 'linear-gradient(160deg, #D97706 0%, #B45309 100%)'
  if (['CB', 'LB', 'RB'].includes(position)) return 'linear-gradient(160deg, #059669 0%, #047857 100%)'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return 'linear-gradient(160deg, #4A4AFF 0%, #3025AE 100%)'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return 'linear-gradient(160deg, #DC2626 0%, #B91C1C 100%)'
  return 'linear-gradient(160deg, #6E7180 0%, #40424D 100%)'
}

/* ── hide-scrollbar CSS ── */
const hideScrollbarCSS = `
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`

/* ── component ── */
export default function MatchAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const session = sessions.find(s => s.id === sessionId)

  if (!session) {
    return (
      <div style={{ background: C.lightBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.muted, fontSize: 16 }}>Match not found</p>
      </div>
    )
  }

  const isAnalysed = session.status === 'analysed'
  const durationMin = calcDurationMinutes(session.startTime, session.endTime)
  /* participating players with scores */
  const participatingPlayers = session.participatingPlayerIds
    .map(pid => {
      const player = players.find(p => p.id === pid)
      const score = squadScores[pid]
      return player ? { player, compositeScore: score?.compositeScore ?? 0 } : null
    })
    .filter(Boolean) as { player: typeof players[number]; compositeScore: number }[]

  /* average squad score */
  const scoredPlayers = participatingPlayers.filter(pp => pp.compositeScore > 0)
  const avgScore = scoredPlayers.length > 0
    ? Math.round(scoredPlayers.reduce((sum, pp) => sum + pp.compositeScore, 0) / scoredPlayers.length)
    : 0

  /* top performers (sorted by score descending, top 5) */
  const topPerformers = [...participatingPlayers]
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 5)

  /* squad performance (all players sorted by score descending) */
  const squadPerformance = [...participatingPlayers]
    .sort((a, b) => b.compositeScore - a.compositeScore)

  /* highlights for this session */
  const sessionHighlights = highlights.filter(h => h.sessionId === sessionId)

  /* score arc calculations */
  const arcRadius = 36
  const arcCircumference = 2 * Math.PI * arcRadius
  const arcOffset = arcCircumference - (arcCircumference * avgScore / 100)

  return (
    <div style={{ background: C.lightBg, minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

      {/* ─── 1. DARK HEADER ─── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '48px 20px 20px' }}>
        {/* Team photo background */}
        <Image
          src="/players/teamphoto.jpg"
          alt="Team"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,14,26,0.85) 0%, rgba(10,14,26,0.98) 100%)',
          zIndex: 1,
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Back button */}
        <div
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(10,14,26,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <ChevronLeft size={18} color="#fff" />
        </div>

        {/* Competition badge */}
        {session.competition && (
          <div
            style={{
              display: 'inline-block',
              background: '#EFF6FF',
              color: C.primary,
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 20,
              padding: '3px 10px',
              marginBottom: 8,
            }}
          >
            {session.competition}
          </div>
        )}

        {/* Opponent */}
        <div style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 800, marginTop: session.competition ? 0 : 0 }}>
          vs {session.opponent ?? 'Unknown'}
        </div>

        {/* Date + duration */}
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
          {formatDateFull(session.date)} &middot; {durationMin} min
        </div>

        {/* Average squad score arc */}
        {isAnalysed && avgScore > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <svg width={84} height={84} viewBox="0 0 84 84">
              <circle
                cx={42}
                cy={42}
                r={arcRadius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={4}
              />
              <circle
                cx={42}
                cy={42}
                r={arcRadius}
                fill="none"
                stroke={C.primary}
                strokeWidth={4}
                strokeDasharray={arcCircumference}
                strokeDashoffset={arcOffset}
                strokeLinecap="round"
                transform="rotate(-90 42 42)"
              />
              <text
                x={42}
                y={46}
                textAnchor="middle"
                fill={getScoreColor(avgScore)}
                fontSize={20}
                fontWeight={700}
              >
                {avgScore}
              </text>
            </svg>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Avg Squad Score</div>
              <div style={{ color: getScoreColor(avgScore), fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                {avgScore >= 75 ? 'Strong Performance' : avgScore >= 60 ? 'Average Performance' : 'Needs Improvement'}
              </div>
            </div>
            {/* W/D/L badge */}
            <div style={{
              background: avgScore >= 75 ? '#10B981' : avgScore >= 60 ? '#F59E0B' : '#EF4444',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 20,
              padding: '3px 10px',
              marginLeft: 8,
              alignSelf: 'center',
            }}>
              {avgScore >= 75 ? 'W' : avgScore >= 60 ? 'D' : 'L'}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ─── 2. TOP PERFORMERS ─── */}
      {isAnalysed && topPerformers.length > 0 && (
        <div style={{ padding: '20px 16px', background: C.lightBg }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
            Top Performers
          </div>

          <div
            className="hide-scrollbar"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {topPerformers.map(({ player, compositeScore }) => {
              const pos = player.position[0] || 'CM'
              const posColor = getPositionColor(pos)
              return (
                <div
                  key={player.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    padding: 14,
                    width: 140,
                    minWidth: 140,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                  }}
                >
                  <PlayerAvatar player={player} size="sm" />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {player.firstName} {player.lastName}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 8,
                      padding: '2px 8px',
                      marginTop: 4,
                      background: `${posColor}1A`,
                      color: posColor,
                    }}
                  >
                    {pos}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: getScoreColor(compositeScore), marginTop: 8 }}>
                    {compositeScore}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── 3. SQUAD PERFORMANCE ─── */}
      {isAnalysed && squadPerformance.length > 0 && (
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>
            SQUAD PERFORMANCE
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {squadPerformance.map(({ player, compositeScore }) => {
              const scoreColor = getScoreColor(compositeScore)
              const position = player.position[0] || 'CM'
              const posColor = getPositionColor(position)
              const initials = (player.firstName[0] || '') + (player.lastName[0] || '')
              const avgPlayerScore = squadScores[player.id]?.avgScore ?? 0
              const diff = compositeScore - avgPlayerScore
              let trendColor = '#9DA2B3'
              let trendText = '\u2192'
              if (diff > 3) { trendColor = '#10B981'; trendText = `\u2191+${diff}` }
              else if (diff < -3) { trendColor = '#EF4444'; trendText = `\u2193${diff}` }

              return (
                <div
                  key={player.id}
                  onClick={() => router.push(`/coach/squad/${player.id}`)}
                  style={{
                    height: 200,
                    borderRadius: 16,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Photo or gradient fallback */}
                  {player.photo ? (
                    <Image
                      src={player.photo}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'top center' }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: getPositionGradient(position),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 36, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{initials}</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                    background: 'linear-gradient(160deg, rgba(10,14,26,0.0) 0%, rgba(10,14,26,0.1) 35%, rgba(10,14,26,0.7) 65%, rgba(10,14,26,0.96) 100%)',
                  }} />

                  {/* Position pill top-left */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    background: `${posColor}D9`,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 10,
                    padding: '3px 7px',
                    borderRadius: 20,
                  }}>
                    {position}
                  </div>

                  {/* Jersey badge top-right */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'rgba(10,14,26,0.75)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {player.jerseyNumber}
                  </div>

                  {/* Bottom content */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '10px 12px',
                    zIndex: 2,
                  }}>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                      {player.firstName} {player.lastName}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: scoreColor, textShadow: `0 0 8px ${scoreColor}66` }}>
                        {compositeScore}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: trendColor }}>
                        {trendText}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── 4. MATCH HIGHLIGHTS ─── */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Match Highlights</div>
          <span
            style={{
              background: '#F1F5F9',
              color: C.muted,
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              marginLeft: 8,
            }}
          >
            {sessionHighlights.length}
          </span>
        </div>

        {sessionHighlights.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: '32px 20px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 32 }}>{'\uD83C\uDFA5'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginTop: 8 }}>
              No highlights yet
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              Highlights will appear here once the match has been analysed.
            </div>
          </div>
        ) : (
          sessionHighlights.map((h: Highlight) => {
            const badge = getEventBadge(h.eventType)
            const highlightPlayer = players.find(p => p.id === h.playerId)
            const minute = Math.floor(h.timestampSeconds / 60)

            return (
              <div
                key={h.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                {/* Left content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 10,
                      background: badge.bg,
                      color: badge.color,
                    }}
                  >
                    {badge.label}
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 6 }}>
                    {highlightPlayer ? `${highlightPlayer.firstName} ${highlightPlayer.lastName}` : 'Unknown'} &middot; {minute}&apos;
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {h.durationSeconds}s
                  </div>
                </div>

                {/* Play button */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: C.darkBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid #FFFFFF',
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      marginLeft: 2,
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ─── 5. WATCH FOOTAGE BUTTON ─── */}
      <div style={{ padding: '0 16px 24px' }}>
        <button
          onClick={() => router.push('/coach/watch')}
          style={{
            width: '100%',
            height: 52,
            background: C.darkBg,
            color: '#FFFFFF',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {'\u25B6'} Watch Full Match
        </button>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 24 }} />
    </div>
  )
}
