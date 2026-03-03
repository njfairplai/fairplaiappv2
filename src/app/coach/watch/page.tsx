'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Play, X, ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, SkipBack, SkipForward, Rewind, FastForward, Pause } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { sessions, highlights, players, pitches, rosters, bookmarks, sessionSegments } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import type { Session, Highlight, Bookmark } from '@/lib/types'

// ─── COLORS ──────────────────────────────────────────────────
const C = {
  primary: '#4A4AFF',
  navy: '#1B1650',
  darkBg: '#0D1020',
  muted: '#6E7180',
  lightBg: '#F5F6FC',
  border: '#E8EAED',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  electricNavy: '#282689',
}

// ─── HELPERS ─────────────────────────────────────────────────
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()]}, ${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${monthAbbr[d.getMonth()]} ${d.getDate()}`
}

function calcDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function formatDuration(startTime: string, endTime: string): string {
  const totalMin = calcDurationMinutes(startTime, endTime)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

function calcDurationSeconds(startTime: string, endTime: string): number {
  return calcDurationMinutes(startTime, endTime) * 60
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function getEventBadge(eventType: string): { bg: string; color: string; label: string } {
  switch (eventType) {
    case 'goal':
      return { bg: '#FEF3C7', color: '#92400E', label: 'Goal' }
    case 'key_pass':
      return { bg: '#EFF6FF', color: '#1E40AF', label: 'Key Pass' }
    case 'sprint_recovery':
      return { bg: '#DCFCE7', color: '#166534', label: 'Sprint' }
    case 'tackle':
      return { bg: '#F3E8FF', color: '#6B21A8', label: 'Tackle' }
    case 'save':
      return { bg: '#FEF3C7', color: '#92400E', label: 'Save' }
    default:
      return { bg: '#F5F6FC', color: '#6E7180', label: eventType }
  }
}

function getSegmentChip(classification: string): { bg: string; color: string; label: string } {
  switch (classification) {
    case 'drill':
      return { bg: '#DCFCE7', color: '#166534', label: 'Drill' }
    case 'match':
      return { bg: '#EFF6FF', color: '#1E40AF', label: 'Match' }
    case 'training_match':
      return { bg: '#FEF3C7', color: '#92400E', label: 'Training Match' }
    default:
      return { bg: '#F5F6FC', color: '#9DA2B3', label: 'Unclassified' }
  }
}

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

function getCardBadge(eventType: string, flaggedByCoach: boolean): { bg: string; label: string } {
  if (flaggedByCoach) return { bg: 'rgba(255,215,0,0.9)', label: '\uD83C\uDFC6 Coach Pick' }
  switch (eventType) {
    case 'goal': return { bg: 'rgba(245,166,35,0.9)', label: '\u26BD Goal' }
    case 'key_pass': return { bg: 'rgba(74,74,255,0.9)', label: '\uD83C\uDFAF Key Pass' }
    case 'sprint_recovery': return { bg: 'rgba(39,174,96,0.9)', label: '\u26A1 Sprint' }
    case 'tackle': return { bg: 'rgba(155,89,182,0.9)', label: '\uD83D\uDEE1 Tackle' }
    case 'save': return { bg: 'rgba(245,166,35,0.9)', label: '\uD83E\uDDE4 Save' }
    default: return { bg: 'rgba(110,113,128,0.9)', label: eventType }
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return '#27AE60'
  if (confidence >= 70) return '#F39C12'
  return '#E74C3C'
}

const highlightEventOptions = [
  { type: 'goal', label: '\u26BD Goal', color: '#F39C12' },
  { type: 'key_pass', label: '\uD83C\uDFAF Great Pass', color: '#4A4AFF' },
  { type: 'skill', label: '\uD83D\uDCAA Skill', color: '#9B59B6' },
  { type: 'effort', label: '\uD83C\uDFC3 Effort', color: '#27AE60' },
]

// ─── MAIN COMPONENT ──────────────────────────────────────────
type SubTab = 'footage' | 'highlights'

export default function WatchPage() {
  const { selectedRosterId } = useTeam()
  const router = useRouter()

  const [subTab, setSubTab] = useState<SubTab>('footage')
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightSearch, setHighlightSearch] = useState('')
  const [clipImgErrors, setClipImgErrors] = useState<Record<string, boolean>>({})

  // DVR player state
  const [dvrSession, setDvrSession] = useState<Session | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [bookmarkSheet, setBookmarkSheet] = useState(false)
  const [localBookmarks, setLocalBookmarks] = useState<{ id: string; timestampSeconds: number; label: string }[]>([])
  const [customBookmarkInput, setCustomBookmarkInput] = useState(false)
  const [customBookmarkText, setCustomBookmarkText] = useState('')
  const scrubRef = useRef<HTMLDivElement>(null)

  // Highlights clip viewer state
  const [selectedClip, setSelectedClip] = useState<Highlight | null>(null)
  const [clipPlaying, setClipPlaying] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)

  // Mark-as-highlight state
  const [markHighlightMode, setMarkHighlightMode] = useState(false)
  const [selectedMarkPlayer, setSelectedMarkPlayer] = useState<string | null>(null)
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null)
  const [markNote, setMarkNote] = useState('')
  const [markSuccess, setMarkSuccess] = useState(false)

  // ─── ROSTER PLAYERS ─────────────────────────────────────────
  const rosterPlayerIds = rosterPlayerMap[selectedRosterId] || []
  const rosterPlayers = rosterPlayerIds.map(pid => players.find(p => p.id === pid)).filter((p): p is NonNullable<typeof p> => !!p)

  // ─── TRAINING FOOTAGE DATA ─────────────────────────────────
  const roster = rosters.find(r => r.id === selectedRosterId)
  const rosterName = roster?.name ?? ''

  const filteredSessions = sessions
    .filter(s => s.rosterId === selectedRosterId && s.type === 'drill' && s.status === 'playback_ready')
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(s => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const dateStr = formatDateFull(s.date).toLowerCase()
      const rName = (roster?.name ?? '').toLowerCase()
      const pitch = pitches.find(p => p.id === s.pitchId)
      const pitchName = (pitch?.name ?? '').toLowerCase()
      const playerNames = s.participatingPlayerIds
        .map(pid => {
          const p = players.find(pl => pl.id === pid)
          return p ? `${p.firstName} ${p.lastName}`.toLowerCase() : ''
        })
        .join(' ')
      return dateStr.includes(q) || rName.includes(q) || pitchName.includes(q) || playerNames.includes(q)
    })

  // ─── HIGHLIGHTS DATA ───────────────────────────────────────
  const filteredHighlights = highlights
    .filter(h => h.squadId === selectedRosterId)
    .filter(h => {
      if (!highlightSearch.trim()) return true
      const q = highlightSearch.toLowerCase()
      const player = players.find(p => p.id === h.playerId)
      const playerName = player ? `${player.firstName} ${player.lastName}`.toLowerCase() : ''
      const session = sessions.find(s => s.id === h.sessionId)
      const dateStr = session ? formatDateShort(session.date).toLowerCase() : ''
      return playerName.includes(q) || h.eventType.toLowerCase().includes(q) || dateStr.includes(q)
    })

  // ─── DVR HELPERS ───────────────────────────────────────────
  const dvrTotalDuration = dvrSession ? calcDurationSeconds(dvrSession.startTime, dvrSession.endTime) : 0
  const dvrBookmarks = dvrSession
    ? [...bookmarks.filter(b => b.sessionId === dvrSession.id), ...localBookmarks.filter(b => b.id.startsWith('local_'))]
    : []
  const dvrBookmarkCount = dvrBookmarks.length

  const dvrRosterName = dvrSession ? (rosters.find(r => r.id === dvrSession.rosterId)?.name ?? '') : ''
  const dvrDateLabel = dvrSession ? formatDateFull(dvrSession.date) : ''

  const progressPct = dvrTotalDuration > 0 ? (currentTime / dvrTotalDuration) * 100 : 0

  const openDvr = (session: Session) => {
    setDvrSession(session)
    setCurrentTime(0)
    setIsPlaying(false)
    setPlaybackSpeed(1)
    setBookmarkSheet(false)
    setLocalBookmarks([])
    setCustomBookmarkInput(false)
    setCustomBookmarkText('')
  }

  const closeDvr = () => {
    setDvrSession(null)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleScrubClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubRef.current || dvrTotalDuration === 0) return
    const rect = scrubRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    setCurrentTime(pct * dvrTotalDuration)
  }, [dvrTotalDuration])

  const handleScrubMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleScrubClick(e)
  }, [handleScrubClick])

  const handleScrubMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrubRef.current || dvrTotalDuration === 0) return
    const rect = scrubRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    setCurrentTime(pct * dvrTotalDuration)
  }, [isDragging, dvrTotalDuration])

  const handleScrubMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2, 0.5]
    const idx = speeds.indexOf(playbackSpeed)
    setPlaybackSpeed(speeds[(idx + 1) % speeds.length])
  }

  const addBookmark = (label: string) => {
    const newBm = {
      id: `local_${Date.now()}`,
      timestampSeconds: Math.floor(currentTime),
      label,
    }
    setLocalBookmarks(prev => [...prev, newBm])
    setBookmarkSheet(false)
    setCustomBookmarkInput(false)
    setCustomBookmarkText('')
  }

  // ─── CLIP VIEWER HELPERS ───────────────────────────────────
  const openClip = (clip: Highlight) => {
    setSelectedClip(clip)
    setClipPlaying(false)
    setSwipeOffset(0)
  }

  const closeClip = () => {
    setSelectedClip(null)
    setClipPlaying(false)
  }

  const getNextClip = (): Highlight | null => {
    if (!selectedClip) return null
    const idx = filteredHighlights.findIndex(h => h.id === selectedClip.id)
    if (idx < filteredHighlights.length - 1) return filteredHighlights[idx + 1]
    return null
  }

  const getPrevClip = (): Highlight | null => {
    if (!selectedClip) return null
    const idx = filteredHighlights.findIndex(h => h.id === selectedClip.id)
    if (idx > 0) return filteredHighlights[idx - 1]
    return null
  }

  const handleClipTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleClipTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const delta = e.touches[0].clientX - touchStartX
    setSwipeOffset(delta)
  }

  const handleClipTouchEnd = () => {
    if (touchStartX === null) return
    if (swipeOffset > 60) {
      const prev = getPrevClip()
      if (prev) {
        setSelectedClip(prev)
        setClipPlaying(false)
      }
    } else if (swipeOffset < -60) {
      const next = getNextClip()
      if (next) {
        setSelectedClip(next)
        setClipPlaying(false)
      }
    }
    setSwipeOffset(0)
    setTouchStartX(null)
  }

  // ─── PITCH OVERLAY (reusable) ─────────────────────────────
  const renderPitchOverlay = (opacity: number) => (
    <>
      {/* Outer rectangle */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', right: '15%', bottom: '10%', border: `2px solid rgba(255,255,255,${opacity})`, borderRadius: 2 }} />
      {/* Center line */}
      <div style={{ position: 'absolute', top: '50%', left: '15%', right: '15%', height: 0, borderTop: `1px solid rgba(255,255,255,${opacity * 0.67})` }} />
      {/* Center circle */}
      <div style={{ position: 'absolute', width: 60, height: 60, border: `1px solid rgba(255,255,255,${opacity * 0.67})`, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      {/* Top penalty box */}
      <div style={{ position: 'absolute', top: '10%', left: '30%', right: '30%', height: '15%', borderLeft: `1px solid rgba(255,255,255,${opacity * 0.67})`, borderRight: `1px solid rgba(255,255,255,${opacity * 0.67})`, borderBottom: `1px solid rgba(255,255,255,${opacity * 0.67})` }} />
      {/* Bottom penalty box */}
      <div style={{ position: 'absolute', bottom: '10%', left: '30%', right: '30%', height: '15%', borderLeft: `1px solid rgba(255,255,255,${opacity * 0.67})`, borderRight: `1px solid rgba(255,255,255,${opacity * 0.67})`, borderTop: `1px solid rgba(255,255,255,${opacity * 0.67})` }} />
    </>
  )

  // ─── BOOKMARK CHIP LABELS ──────────────────────────────────
  const bookmarkChipLabels = ['Show team', 'Review', 'Good example', 'Needs work', 'Defending', 'Attacking']

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ paddingBottom: 100, background: C.lightBg, minHeight: '100vh' }}>
      {/* ─── SUB-TABS ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'row', borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
        <button
          onClick={() => { setSubTab('footage'); setSearchQuery('') }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '14px 0',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'footage' ? `2px solid ${C.primary}` : '2px solid transparent',
            color: subTab === 'footage' ? C.navy : '#9DA2B3',
            fontWeight: subTab === 'footage' ? 700 : 400,
            fontSize: 15,
          }}
        >
          Training Footage
        </button>
        <button
          onClick={() => { setSubTab('highlights'); setHighlightSearch('') }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '14px 0',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'highlights' ? `2px solid ${C.primary}` : '2px solid transparent',
            color: subTab === 'highlights' ? C.navy : '#9DA2B3',
            fontWeight: subTab === 'highlights' ? 700 : 400,
            fontSize: 15,
          }}
        >
          Highlights
        </button>
      </div>

      {/* ═══ TRAINING FOOTAGE ═══ */}
      {subTab === 'footage' && (
        <div>
          {/* Search bar */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#9DA2B3" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by player, date, or session type..."
                style={{
                  width: '100%',
                  height: 44,
                  background: '#fff',
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  padding: '0 16px 0 40px',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Session cards */}
          <div style={{ padding: '16px 16px 0' }}>
            {filteredSessions.length === 0 ? (
              searchQuery.trim() ? (
                <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: 40 }}>
                  <div>No sessions match &apos;{searchQuery}&apos;</div>
                  <div
                    onClick={() => setSearchQuery('')}
                    style={{ color: C.primary, cursor: 'pointer', marginTop: 8, fontSize: 14 }}
                  >
                    Clear search
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: 40 }}>
                  No training footage available yet for this team.
                </div>
              )
            ) : (
              filteredSessions.map(session => {
                const pitch = pitches.find(p => p.id === session.pitchId)
                const pitchName = pitch?.name ?? ''
                const segments = sessionSegments.filter(seg => seg.sessionId === session.id)

                return (
                  <div
                    key={session.id}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                        {formatDateFull(session.date)}
                      </div>
                      <div style={{ color: '#9DA2B3', fontSize: 13 }}>
                        {formatDuration(session.startTime, session.endTime)}
                      </div>
                    </div>
                    {/* Second row */}
                    <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                      {rosterName} &middot; {pitchName}
                    </div>
                    {/* Segment chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {segments.length > 0
                        ? segments.map(seg => {
                            const chip = getSegmentChip(seg.aiClassification)
                            return (
                              <span
                                key={seg.id}
                                style={{
                                  fontSize: 11,
                                  borderRadius: 20,
                                  padding: '4px 10px',
                                  background: chip.bg,
                                  color: chip.color,
                                }}
                              >
                                {chip.label}
                              </span>
                            )
                          })
                        : (() => {
                            const chip = getSegmentChip(session.type)
                            return (
                              <span
                                style={{
                                  fontSize: 11,
                                  borderRadius: 20,
                                  padding: '4px 10px',
                                  background: chip.bg,
                                  color: chip.color,
                                }}
                              >
                                {chip.label}
                              </span>
                            )
                          })()
                      }
                    </div>
                    {/* Watch button */}
                    <button
                      onClick={() => openDvr(session)}
                      style={{
                        width: '100%',
                        height: 40,
                        background: C.primary,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 8,
                        marginTop: 10,
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      Watch
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ═══ HIGHLIGHTS ═══ */}
      {subTab === 'highlights' && (
        <div>
          {/* Search bar */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#9DA2B3" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={highlightSearch}
                onChange={e => setHighlightSearch(e.target.value)}
                placeholder="Search by player name, date..."
                style={{
                  width: '100%',
                  height: 44,
                  background: '#fff',
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  padding: '0 16px 0 40px',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Result count */}
          <div style={{ color: '#9DA2B3', fontSize: 13, padding: '12px 16px 8px' }}>
            Showing {filteredHighlights.length} clips &middot; {rosterName}
          </div>

          {/* 2-column grid */}
          <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {filteredHighlights.map(clip => {
              const clipPlayer = players.find(p => p.id === clip.playerId)
              const playerName = clipPlayer ? `${clipPlayer.firstName} ${clipPlayer.lastName}` : 'Unknown'
              const session = sessions.find(s => s.id === clip.sessionId)
              const sessionDate = session ? formatDateShort(session.date) : ''
              const opponent = session?.opponent ? `vs ${session.opponent}` : ''
              const sessionContext = [sessionDate, opponent].filter(Boolean).join(' \u00B7 ')
              const cardBadge = getCardBadge(clip.eventType, clip.flaggedByCoach)
              const durationFormatted = `${Math.floor(clip.durationSeconds / 60)}:${(clip.durationSeconds % 60).toString().padStart(2, '0')}`

              return (
                <div
                  key={clip.id}
                  onClick={() => openClip(clip)}
                  style={{
                    aspectRatio: '9/16',
                    borderRadius: 14,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    background: 'linear-gradient(180deg, #1B1650 0%, #0D1020 100%)',
                  }}
                >
                  {/* Player photo strip (bottom 35%) */}
                  {clipPlayer?.photo && !clipImgErrors[clip.id] && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', overflow: 'hidden' }}>
                      <Image src={clipPlayer.photo} alt="" fill style={{ objectFit: 'cover', objectPosition: 'top' }} onError={() => setClipImgErrors(prev => ({ ...prev, [clip.id]: true }))} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9) 80%)' }} />
                    </div>
                  )}

                  {/* Event badge top-left */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    background: cardBadge.bg,
                    borderRadius: 20,
                    padding: '4px 10px',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {cardBadge.label}
                  </div>

                  {/* Duration pill top-right */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: 20,
                    padding: '4px 8px',
                    color: '#fff',
                    fontSize: 10,
                  }}>
                    {durationFormatted}
                  </div>

                  {/* Play button centered */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '35%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderLeft: '12px solid #4A4AFF',
                      borderTop: '7px solid transparent',
                      borderBottom: '7px solid transparent',
                      marginLeft: 2,
                    }} />
                  </div>

                  {/* Bottom overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '8px 10px',
                    zIndex: 2,
                  }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{playerName}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{sessionContext}</div>
                  </div>

                  {/* AI confidence bar */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    zIndex: 3,
                    background: 'transparent',
                  }}>
                    <div style={{
                      width: `${clip.aiConfidence}%`,
                      height: 4,
                      background: getConfidenceColor(clip.aiConfidence),
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ DVR PLAYER OVERLAY ═══ */}
      {dvrSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: C.darkBg,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* TOP BAR */}
          <div style={{
            height: 56,
            background: C.darkBg,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <button
              onClick={closeDvr}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={22} color="#fff" />
            </button>
            <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: 700 }}>
              {dvrDateLabel} &middot; {dvrRosterName} Training
            </div>
            <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookmarkIcon size={22} color="#fff" />
              {dvrBookmarkCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -4 + 8,
                  right: -6 + 8,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: C.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                }}>
                  {dvrBookmarkCount}
                </div>
              )}
            </div>
          </div>

          {/* VIDEO AREA */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* CSS-drawn pitch */}
            {renderPitchOverlay(0.06)}

            {/* Center play/pause button */}
            <div
              onClick={() => setIsPlaying(prev => !prev)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPlaying ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 4, height: 20, background: '#fff', borderRadius: 2 }} />
                  <div style={{ width: 4, height: 20, background: '#fff', borderRadius: 2 }} />
                </div>
              ) : (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M8 4L24 14L8 24V4Z" fill={C.primary} />
                </svg>
              )}
            </div>
          </div>

          {/* SCRUB BAR */}
          <div style={{ padding: '0 16px', marginTop: 8 }}>
            <div
              ref={scrubRef}
              onClick={handleScrubClick}
              onMouseDown={handleScrubMouseDown}
              onMouseMove={handleScrubMouseMove}
              onMouseUp={handleScrubMouseUp}
              onMouseLeave={handleScrubMouseUp}
              style={{
                width: '100%',
                height: 4,
                background: '#40424D',
                borderRadius: 2,
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {/* Progress */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: 4,
                background: C.primary,
                borderRadius: 2,
                width: `${progressPct}%`,
              }} />

              {/* Bookmark dots */}
              {dvrBookmarks.map((bm, i) => {
                const bmPct = dvrTotalDuration > 0 ? (bm.timestampSeconds / dvrTotalDuration) * 100 : 0
                return (
                  <div
                    key={`bm-dot-${i}`}
                    style={{
                      position: 'absolute',
                      top: -1,
                      left: `${bmPct}%`,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#fff',
                      transform: 'translateX(-3px)',
                    }}
                  />
                )
              })}

              {/* Playhead */}
              <div style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: `calc(${progressPct}% - 7px)`,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

          {/* CONTROLS ROW */}
          <div style={{
            height: 56,
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Time */}
            <div style={{ color: '#fff', fontSize: 13, fontFamily: 'monospace' }}>
              {formatTime(currentTime)} / {formatTime(dvrTotalDuration)}
            </div>

            {/* Center buttons */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <SkipBack
                size={20}
                color="#fff"
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentTime(0)}
              />
              <Rewind
                size={20}
                color="#fff"
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentTime(prev => Math.max(0, prev - 10))}
              />
              <div
                onClick={() => setIsPlaying(prev => !prev)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isPlaying ? (
                  <Pause size={20} color={C.primary} />
                ) : (
                  <Play size={20} color={C.primary} style={{ marginLeft: 2 }} />
                )}
              </div>
              <FastForward
                size={20}
                color="#fff"
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentTime(prev => Math.min(dvrTotalDuration, prev + 10))}
              />
              <SkipForward
                size={20}
                color="#fff"
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentTime(dvrTotalDuration)}
              />
            </div>

            {/* Speed pill */}
            <div
              onClick={cycleSpeed}
              style={{
                background: C.primary,
                padding: '4px 12px',
                borderRadius: 12,
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {playbackSpeed === 1 ? '1' : playbackSpeed}&times;
            </div>
          </div>

          {/* FLOATING BOOKMARK BUTTON */}
          <button
            onClick={() => setBookmarkSheet(true)}
            style={{
              position: 'absolute',
              bottom: 120,
              right: 16,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookmarkIcon size={20} color="#fff" />
          </button>

          {/* BOOKMARK BOTTOM SHEET */}
          {bookmarkSheet && (
            <>
              {/* Overlay */}
              <div
                onClick={() => { setBookmarkSheet(false); setCustomBookmarkInput(false); setCustomBookmarkText(''); setMarkHighlightMode(false); setSelectedMarkPlayer(null); setSelectedEventType(null); setMarkNote(''); setMarkSuccess(false) }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)',
                  zIndex: 10000,
                }}
              />
              {/* Sheet */}
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10001,
                transition: 'transform 200ms ease',
                transform: 'translateY(0)',
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: '16px 16px 0 0',
                  padding: 20,
                  maxWidth: 480,
                  margin: '0 auto',
                  position: 'relative',
                  zIndex: 10001,
                }}>
                  {/* Handle bar */}
                  <div style={{
                    width: 36,
                    height: 4,
                    background: C.border,
                    borderRadius: 2,
                    margin: '0 auto 16px',
                  }} />
                  {/* Title */}
                  <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>
                    Add Bookmark at {formatTime(currentTime)}
                  </div>

                  {markSuccess ? (
                    /* ── Success state ── */
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <span style={{ fontSize: 28 }}>{'\u2705'}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Highlight created!</div>
                    </div>
                  ) : markHighlightMode ? (
                    /* ── Mark as Highlight mini-form ── */
                    <div style={{ marginTop: 12 }}>
                      {/* Which player? */}
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Which player?</div>
                      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 8, paddingBottom: 4 }}>
                        {rosterPlayers.map(p => {
                          const isSelected = selectedMarkPlayer === p.id
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedMarkPlayer(isSelected ? null : p.id)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer',
                                minWidth: 60,
                                opacity: isSelected ? 1 : 0.6,
                                border: isSelected ? '2px solid #4A4AFF' : '2px solid transparent',
                                borderRadius: 12,
                                padding: 6,
                              }}
                            >
                              <PlayerAvatar player={p} size="sm" />
                              <span style={{ fontSize: 10, color: isSelected ? '#4A4AFF' : '#6E7180' }}>{p.firstName}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* What happened? */}
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 12 }}>What happened?</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                        {highlightEventOptions.map(opt => {
                          const isSelected = selectedEventType === opt.type
                          return (
                            <button
                              key={opt.type}
                              onClick={() => setSelectedEventType(isSelected ? null : opt.type)}
                              style={{
                                height: 44,
                                borderRadius: 10,
                                border: isSelected ? 'none' : `1px solid ${C.border}`,
                                background: isSelected ? opt.color : '#fff',
                                color: isSelected ? '#fff' : C.navy,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* Note input */}
                      <input
                        value={markNote}
                        onChange={e => setMarkNote(e.target.value)}
                        placeholder="Add a note... (optional)"
                        style={{
                          width: '100%',
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: '10px 14px',
                          marginTop: 12,
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />

                      {/* Create Highlight button */}
                      <button
                        disabled={!selectedMarkPlayer || !selectedEventType}
                        onClick={() => {
                          setMarkSuccess(true)
                          setTimeout(() => {
                            setBookmarkSheet(false)
                            setMarkHighlightMode(false)
                            setSelectedMarkPlayer(null)
                            setSelectedEventType(null)
                            setMarkNote('')
                            setMarkSuccess(false)
                          }, 1500)
                        }}
                        style={{
                          width: '100%',
                          height: 48,
                          background: '#4A4AFF',
                          color: '#fff',
                          fontSize: 15,
                          fontWeight: 700,
                          border: 'none',
                          borderRadius: 10,
                          marginTop: 12,
                          cursor: 'pointer',
                          opacity: (!selectedMarkPlayer || !selectedEventType) ? 0.5 : 1,
                        }}
                      >
                        Create Highlight
                      </button>
                    </div>
                  ) : (
                    /* ── Default bookmark chips + Mark as Highlight ── */
                    <>
                      {/* Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        {bookmarkChipLabels.map(label => (
                          <button
                            key={label}
                            onClick={() => addBookmark(label)}
                            style={{
                              background: '#fff',
                              color: C.navy,
                              border: `1px solid ${C.border}`,
                              borderRadius: 20,
                              padding: '8px 16px',
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                        {/* + Custom */}
                        {!customBookmarkInput ? (
                          <button
                            onClick={() => setCustomBookmarkInput(true)}
                            style={{
                              background: '#fff',
                              color: C.navy,
                              border: `1px solid ${C.border}`,
                              borderRadius: 20,
                              padding: '8px 16px',
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            + Custom
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', marginTop: 8 }}>
                            <input
                              autoFocus
                              value={customBookmarkText}
                              onChange={e => setCustomBookmarkText(e.target.value)}
                              placeholder="Custom label..."
                              style={{
                                flex: 1,
                                height: 40,
                                border: `1px solid ${C.border}`,
                                borderRadius: 8,
                                padding: '0 12px',
                                fontSize: 13,
                                outline: 'none',
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && customBookmarkText.trim()) {
                                  addBookmark(customBookmarkText.trim())
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (customBookmarkText.trim()) addBookmark(customBookmarkText.trim())
                              }}
                              style={{
                                height: 40,
                                padding: '0 16px',
                                background: C.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Separator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                        <div style={{ flex: 1, height: 1, background: '#E8EAED' }} />
                        <span style={{ color: '#9DA2B3', fontSize: 12 }}>or</span>
                        <div style={{ flex: 1, height: 1, background: '#E8EAED' }} />
                      </div>

                      {/* Mark as Highlight button */}
                      <button
                        onClick={() => setMarkHighlightMode(true)}
                        style={{
                          width: '100%',
                          height: 48,
                          background: 'linear-gradient(135deg, #4A4AFF, #6232FF)',
                          color: '#fff',
                          fontSize: 15,
                          fontWeight: 700,
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                        }}
                      >
                        {'\uD83C\uDFC6'} Mark as Highlight
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ CLIP VIEWER OVERLAY ═══ */}
      {selectedClip && (() => {
        const clip = selectedClip
        const player = players.find(p => p.id === clip.playerId)
        const playerName = player ? `${player.firstName} ${player.lastName}` : 'Unknown'
        const session = sessions.find(s => s.id === clip.sessionId)
        const sessionDate = session ? formatDateShort(session.date) : ''
        const opponent = session?.opponent ? `vs ${session.opponent}` : ''
        const sessionContext = [sessionDate, opponent].filter(Boolean).join(' \u00B7 ')
        const badge = getEventBadge(clip.eventType)
        const clipTitle = `${playerName} \u00B7 ${badge.label} \u00B7 ${sessionDate}`

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
            }}
            onTouchStart={handleClipTouchStart}
            onTouchMove={handleClipTouchMove}
            onTouchEnd={handleClipTouchEnd}
          >
            {/* Top bar */}
            <div style={{
              height: 56,
              padding: '0 16px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <button
                onClick={closeClip}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={22} color="#fff" />
              </button>
              <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                {clipTitle}
              </div>
              <div style={{ width: 44 }} />
            </div>

            {/* Video area */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                transform: `translateX(${swipeOffset}px)`,
                transition: touchStartX === null ? 'transform 200ms ease' : 'none',
              }}
            >
              {/* Pitch overlay */}
              {renderPitchOverlay(0.06)}

              {/* Center play/pause */}
              <div
                onClick={() => setClipPlaying(prev => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {clipPlaying ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 20, background: '#fff', borderRadius: 2 }} />
                    <div style={{ width: 4, height: 20, background: '#fff', borderRadius: 2 }} />
                  </div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M8 4L24 14L8 24V4Z" fill={C.primary} />
                  </svg>
                )}
              </div>
            </div>

            {/* Bottom overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 16px',
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            }}>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                {playerName} &middot; {badge.label}
              </div>
              <div style={{ color: '#9DA2B3', fontSize: 13, marginTop: 2 }}>
                {sessionContext}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  style={{
                    flex: 1,
                    height: 44,
                    background: '#fff',
                    color: C.navy,
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {'\uD83D\uDCCC'} Flag for Player
                </button>
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Check out this ${badge.label} by ${playerName}!`)
                    window.open(`https://wa.me/?text=${text}`, '_blank')
                  }}
                  style={{
                    flex: 1,
                    height: 44,
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {'\uD83D\uDCAC'} WhatsApp
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
