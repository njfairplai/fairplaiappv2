'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { sessions, players, squadScores, highlights, sessionTeamScores, highlightLocations, highlightClips } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import WhatsAppDeliveryPanel from '@/components/shared/WhatsAppDeliveryPanel'
import EventTimeline from '@/components/coach/EventTimeline'
import PitchEventMap from '@/components/coach/PitchEventMap'
import type { TimelineEvent } from '@/lib/types'

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

  const [whatsAppOpen, setWhatsAppOpen] = useState(false)
  const [matchNote, setMatchNote] = useState('')
  const [matchNoteLastSaved, setMatchNoteLastSaved] = useState<string | null>(null)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [highlightPrivacy, setHighlightPrivacy] = useState<Record<string, string>>({})
  const [showEventMap, setShowEventMap] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      const saved = localStorage.getItem(`fairplai_match_note_${sessionId}`)
      if (saved) { setMatchNote(saved); setNotesExpanded(true) }
      const privData = localStorage.getItem('fairplai_highlight_privacy')
      if (privData) setHighlightPrivacy(JSON.parse(privData))
    }
  }, [sessionId])

  useEffect(() => {
    if (typeof window === 'undefined' || !matchNote || !sessionId) return
    const timer = setTimeout(() => {
      localStorage.setItem(`fairplai_match_note_${sessionId}`, matchNote)
      const now = new Date()
      setMatchNoteLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }, 1500)
    return () => clearTimeout(timer)
  }, [matchNote, sessionId])

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

  /* highlights for this session */
  const sessionHighlights = highlights.filter(h => h.sessionId === sessionId)

  /* build timeline events from highlights */
  const timelineEvents: TimelineEvent[] = sessionHighlights.map(h => ({
    highlightId: h.id,
    playerId: h.playerId,
    eventType: h.eventType,
    timestampSeconds: h.timestampSeconds,
    confidence: h.confidence,
    pitchX: highlightLocations[h.id]?.pitchX,
    pitchY: highlightLocations[h.id]?.pitchY,
  }))

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

      {/* ─── 2b. MATCH TIMELINE ─── */}
      {isAnalysed && timelineEvents.length > 0 && (
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
            Match Timeline
          </div>
          <EventTimeline
            events={timelineEvents}
            durationMinutes={durationMin}
            players={participatingPlayers.map(pp => pp.player)}
          />

          {/* Pitch Event Map toggle */}
          <button
            onClick={() => setShowEventMap(prev => !prev)}
            style={{
              marginTop: 10, background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
              color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {showEventMap ? '▲ Hide Pitch View' : '▼ Show Pitch View'}
          </button>

          {showEventMap && (
            <div style={{ marginTop: 10 }}>
              <PitchEventMap
                events={timelineEvents}
                players={participatingPlayers.map(pp => pp.player)}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── 3. TEAM STATS ─── */}
      {isAnalysed && (
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>
            TEAM STATS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Possession', value: '54%', color: C.primary },
              { label: 'Pass Acc.', value: '78%', color: C.success },
              { label: 'Shots', value: '12', color: C.warning },
              { label: 'Tackles', value: '18', color: '#8B5CF6' },
              { label: 'Fouls', value: '6', color: C.error },
              { label: 'Corners', value: '5', color: C.primary },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: '#fff', borderRadius: 12, padding: '14px 10px',
                textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. MATCH HIGHLIGHTS (parent portal style) ─── */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
            HIGHLIGHTS
          </div>
          <span style={{ background: '#F1F5F9', color: C.muted, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>
            {sessionHighlights.length}
          </span>
        </div>

        {sessionHighlights.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '32px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 32 }}>{'\uD83C\uDFA5'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginTop: 8 }}>No highlights yet</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Highlights will appear once the match is analysed.</div>
          </div>
        ) : (
          <div className="hide-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {sessionHighlights.map(h => {
              const highlightPlayer = players.find(p => p.id === h.playerId)
              const minute = Math.floor(h.timestampSeconds / 60)
              const badge = getEventBadge(h.eventType)
              const clip = highlightClips.find(c => c.eventType.toLowerCase().replace(/\s+/g, '_') === h.eventType) || highlightClips[0]

              return (
                <div key={h.id} style={{
                  flexShrink: 0, width: 180, height: 110, borderRadius: 14,
                  background: 'linear-gradient(135deg, #1B1650, #0D1020)',
                  position: 'relative', overflow: 'hidden',
                  border: '1px solid rgba(74,74,255,0.15)', cursor: 'pointer',
                }}>
                  {/* Play button center */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 4 L10.5 7 L5.5 10 Z" fill="white" /></svg>
                    </div>
                  </div>

                  {/* Event badge top-left */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    background: badge.color === '#92400E' ? '#F59E0B' : badge.color === '#1E40AF' ? C.primary : badge.color === '#166534' ? '#10B981' : badge.color === '#6B21A8' ? '#8B5CF6' : C.muted,
                    borderRadius: 100, padding: '2px 8px',
                  }}>
                    {badge.label.replace(/^[^\w]+\s*/, '')}
                  </div>

                  {/* Duration top-right */}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(0,0,0,0.4)', borderRadius: 100, padding: '2px 7px',
                  }}>
                    {h.durationSeconds}s
                  </div>

                  {/* Bottom: player + minute */}
                  <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {highlightPlayer ? `${highlightPlayer.firstName} ${highlightPlayer.lastName}` : 'Unknown'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(245,246,252,0.5)', fontWeight: 600, marginTop: 1 }}>
                      {minute}&apos;
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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

      {/* ─── 6. SEND VIA WHATSAPP ─── */}
      {isAnalysed && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={() => setWhatsAppOpen(true)}
            style={{
              width: '100%',
              height: 48,
              background: '#25D366',
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
            <MessageCircle size={18} /> Send Summary via WhatsApp
          </button>
        </div>
      )}

      {/* ─── 7. COACH NOTES ─── */}
      <div style={{ padding: '0 16px 24px' }}>
        <button
          onClick={() => setNotesExpanded(!notesExpanded)}
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: notesExpanded ? '12px 12px 0 0' : 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `1px solid ${C.border}`,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: C.navy,
          }}
        >
          Coach Notes
          {notesExpanded ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
        </button>
        {notesExpanded && (
          <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '0 16px 16px', borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <textarea
              value={matchNote}
              onChange={e => setMatchNote(e.target.value)}
              placeholder="Add notes about this match..."
              style={{
                width: '100%',
                minHeight: 80,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {matchNoteLastSaved && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Last saved: {matchNoteLastSaved}</div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Delivery Panel */}
      <WhatsAppDeliveryPanel
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        session={session ? { id: session.id, rosterId: session.rosterId, opponent: session.opponent, date: session.date, type: session.type } : null}
      />

      {/* Bottom spacer */}
      <div style={{ height: 24 }} />
    </div>
  )
}
