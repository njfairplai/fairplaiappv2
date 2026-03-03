'use client'
import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Play, X, ChevronLeft, ChevronRight, ChevronDown, Bookmark as BookmarkIcon, SkipBack, SkipForward, Rewind, FastForward, Pause } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { sessions, highlights, players, pitches, rosters, bookmarks, sessionSegments, squadScores } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import type { Session, Highlight, Bookmark } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

// ─── COLORS ──────────────────────────────────────────────────
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
      return { bg: '#ECFDF5', color: '#059669', label: 'Drill' }
    case 'match':
      return { bg: '#EFF6FF', color: '#4A4AFF', label: 'Match' }
    case 'training_match':
      return { bg: '#FFFBEB', color: '#D97706', label: 'Training Match' }
    default:
      return { bg: '#F5F6FC', color: '#9DA2B3', label: 'Unclassified' }
  }
}

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

function getCardBadge(eventType: string, flaggedByCoach: boolean): { borderColor: string; label: string } {
  if (flaggedByCoach) return { borderColor: '#FFD700', label: '\uD83C\uDFC6 Pick' }
  switch (eventType) {
    case 'goal': return { borderColor: '#F59E0B', label: '\u26BD Goal' }
    case 'key_pass': return { borderColor: '#4A4AFF', label: '\uD83C\uDFAF Pass' }
    case 'sprint_recovery': return { borderColor: '#10B981', label: '\u26A1 Sprint' }
    case 'tackle': return { borderColor: '#9B59B6', label: '\uD83D\uDEE1 Tackle' }
    case 'save': return { borderColor: '#F59E0B', label: '\uD83E\uDDE4 Save' }
    default: return { borderColor: '#6E7180', label: eventType }
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return '#10B981'
  if (confidence >= 70) return '#F59E0B'
  return '#EF4444'
}

const highlightEventOptions = [
  { type: 'goal', label: '\u26BD Goal', color: '#F39C12' },
  { type: 'key_pass', label: '\uD83C\uDFAF Great Pass', color: '#4A4AFF' },
  { type: 'skill', label: '\uD83D\uDCAA Skill', color: '#9B59B6' },
  { type: 'effort', label: '\uD83C\uDFC3 Effort', color: '#27AE60' },
]

// ─── MAIN COMPONENT ──────────────────────────────────────────
type SubTab = 'footage' | 'match' | 'highlights'

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
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})

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

  // ─── MATCH FOOTAGE DATA ───────────────────────────────────
  const matchSessions = sessions
    .filter(s => s.rosterId === selectedRosterId && s.type === 'match' && (s.status === 'analysed' || s.status === 'complete'))
    .sort((a, b) => b.date.localeCompare(a.date))

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

  // Grouped highlights by session
  const groupedHighlights = useMemo(() => {
    const groups: Record<string, { session: typeof sessions[0]; clips: typeof highlights }> = {}
    const sourceHighlights = highlights.filter(h => h.squadId === selectedRosterId)

    for (const clip of sourceHighlights) {
      if (!groups[clip.sessionId]) {
        const session = sessions.find(s => s.id === clip.sessionId)
        if (!session) continue
        groups[clip.sessionId] = { session, clips: [] }
      }
      groups[clip.sessionId].clips.push(clip)
    }

    return Object.values(groups).sort((a, b) => b.session.date.localeCompare(a.session.date))
  }, [selectedRosterId])

  // Initialize expanded state: 2 most recent groups expanded by default
  const isSessionExpanded = (sessionId: string): boolean => {
    if (expandedSessions[sessionId] !== undefined) return expandedSessions[sessionId]
    const idx = groupedHighlights.findIndex(g => g.session.id === sessionId)
    return idx < 2
  }

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !isSessionExpanded(sessionId),
    }))
  }

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
    <div style={{ paddingBottom: 100, background: subTab === 'highlights' ? C.darkBg : C.lightBg, minHeight: '100vh' }} >
      {/* ─── PAGE HEADER ───────────────────────────────────── */}
      <div style={{ background: C.darkBg, padding: '48px 20px 0' }}>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>Watch</div>
        {/* Sub-tab row */}
        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 16, paddingBottom: 16 }}>
          <button
            onClick={() => { setSubTab('footage'); setSearchQuery('') }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: subTab === 'footage' ? '2px solid #fff' : '2px solid transparent',
              color: subTab === 'footage' ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 15,
              fontWeight: subTab === 'footage' ? 600 : 400,
              padding: '0 0 8px 0',
              marginRight: 24,
              cursor: 'pointer',
            }}
          >
            Training Footage
          </button>
          <button
            onClick={() => { setSubTab('match') }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: subTab === 'match' ? '2px solid #fff' : '2px solid transparent',
              color: subTab === 'match' ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 15,
              fontWeight: subTab === 'match' ? 600 : 400,
              padding: '0 0 8px 0',
              marginRight: 24,
              cursor: 'pointer',
            }}
          >
            Match Footage
          </button>
          <button
            onClick={() => { setSubTab('highlights'); setHighlightSearch('') }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: subTab === 'highlights' ? '2px solid #fff' : '2px solid transparent',
              color: subTab === 'highlights' ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 15,
              fontWeight: subTab === 'highlights' ? 600 : 400,
              padding: '0 0 8px 0',
              marginRight: 24,
              cursor: 'pointer',
            }}
          >
            Highlights
          </button>
        </div>
      </div>

      {/* ═══ TRAINING FOOTAGE ═══ */}
      {subTab === 'footage' && (
        <div style={{ background: C.lightBg, padding: 16 }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#4A4AFF" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by player, date, or session type..."
              style={{
                width: '100%',
                height: 48,
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '0 16px 0 44px',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#4A4AFF' }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border }}
            />
          </div>

          {/* Session cards */}
          <div style={{ marginTop: 16 }}>
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
                      borderRadius: 14,
                      padding: '12px 14px',
                      marginBottom: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>
                        {formatDateFull(session.date)}
                      </div>
                      <div style={{ color: '#64748B', fontSize: 13 }}>
                        {formatDuration(session.startTime, session.endTime)}
                      </div>
                    </div>
                    {/* Meta row */}
                    <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                      {rosterName} &middot; {pitchName}
                    </div>
                    {/* Segment chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {segments.length > 0
                        ? segments.map(seg => {
                            const chip = getSegmentChip(seg.aiClassification)
                            return (
                              <span
                                key={seg.id}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  borderRadius: 20,
                                  padding: '3px 10px',
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
                                  fontWeight: 600,
                                  borderRadius: 20,
                                  padding: '3px 10px',
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
                        height: 36,
                        background: '#0A0E1A',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        marginTop: 12,
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      {'\u25B6'} Watch
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ═══ MATCH FOOTAGE ═══ */}
      {subTab === 'match' && (
        <div style={{ background: C.lightBg, padding: 16 }}>
          {matchSessions.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: 40 }}>
              No match footage available yet for this team.
            </div>
          ) : (
            matchSessions.map(session => {
              const pitch = pitches.find(p => p.id === session.pitchId)
              const pitchName = pitch?.name ?? ''
              const duration = calcDurationMinutes(session.startTime, session.endTime)
              const isAnalysed = session.status === 'analysed'

              /* compute average squad score for analysed matches */
              let avgMatchScore: number | null = null
              let scoreColor = ''
              if (isAnalysed) {
                const participantScores = session.participatingPlayerIds
                  .map(pid => squadScores[pid]?.compositeScore)
                  .filter((v): v is number => v !== undefined)
                avgMatchScore = participantScores.length > 0
                  ? Math.round(participantScores.reduce((a, b) => a + b, 0) / participantScores.length)
                  : null
                if (avgMatchScore !== null) {
                  if (avgMatchScore >= 75) scoreColor = C.success
                  else if (avgMatchScore >= 60) scoreColor = C.warning
                  else scoreColor = C.error
                }
              }

              return (
                <div
                  key={session.id}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 10,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                    borderLeft: isAnalysed ? `4px solid ${C.primary}` : `4px solid ${C.warning}`,
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                        vs {session.opponent}
                      </div>
                      <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
                        {formatDateFull(session.date)} &middot; {duration} min
                      </div>
                    </div>
                    {/* Score badge */}
                    {avgMatchScore !== null && (
                      <div style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: scoreColor,
                      }}>
                        {avgMatchScore}
                      </div>
                    )}
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {session.competition && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 20,
                        padding: '3px 10px',
                        background: '#EFF6FF',
                        color: C.primary,
                      }}>
                        {session.competition}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 20,
                      padding: '3px 10px',
                      background: isAnalysed ? '#ECFDF5' : '#FFFBEB',
                      color: isAnalysed ? '#059669' : '#D97706',
                    }}>
                      {isAnalysed ? 'Analysed' : 'Pending Analysis'}
                    </span>
                  </div>

                  {/* Pitch info */}
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
                    {rosterName} &middot; {pitchName}
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => openDvr(session)}
                      style={{
                        flex: 1,
                        height: 38,
                        background: C.darkBg,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      {'\u25B6'} Watch Footage
                    </button>
                    {isAnalysed && (
                      <button
                        onClick={() => router.push(`/coach/match/${session.id}`)}
                        style={{
                          flex: 1,
                          height: 38,
                          background: C.primary,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        View Analysis &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ═══ HIGHLIGHTS ═══ */}
      {subTab === 'highlights' && (
        <div style={{ background: C.darkBg, padding: 12 }}>
          {/* Search bar (dark version) */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={highlightSearch}
              onChange={e => setHighlightSearch(e.target.value)}
              placeholder="Search by player name, date..."
              style={{
                width: '100%',
                height: 44,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '0 16px 0 40px',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#fff',
              }}
            />
          </div>

          {/* Result count */}
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '10px 0' }}>
            {highlightSearch.trim()
              ? `Showing ${filteredHighlights.length} clips · ${rosterName}`
              : `${highlights.filter(h => h.squadId === selectedRosterId).length} clips · ${groupedHighlights.length} sessions · ${rosterName}`
            }
          </div>

          {/* Search active → flat ungrouped list */}
          {highlightSearch.trim() ? (
            <div>
              {filteredHighlights.map((clip, clipIdx) => {
                const clipPlayer = players.find(p => p.id === clip.playerId)
                const playerName = clipPlayer ? `${clipPlayer.firstName} ${clipPlayer.lastName}` : 'Unknown'
                const session = sessions.find(s => s.id === clip.sessionId)
                const sessionDate = session ? formatDateShort(session.date) : ''
                const opponent = session?.opponent ? `vs ${session.opponent}` : 'Training'
                const badge = getEventBadge(clip.eventType)
                const minute = Math.floor(clip.timestampSeconds / 60)
                const durationFormatted = `${Math.floor(clip.durationSeconds / 60)}:${(clip.durationSeconds % 60).toString().padStart(2, '0')}`

                return (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: clipIdx * 0.04, duration: 0.2 }}
                    onClick={() => openClip(clip)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 10,
                      marginBottom: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <PlayerAvatar player={clipPlayer!} size="sm" />
                    <span style={{ ...badge, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: badge.bg, color: badge.color }}>{badge.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{minute}&apos;</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, flex: 1 }}>{playerName}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{sessionDate} · {opponent}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 6px' }}>{durationFormatted}</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: getConfidenceColor(clip.aiConfidence) }} />
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* Grouped by session feed */
            <div>
              {groupedHighlights.map(group => {
                const { session, clips } = group
                const expanded = isSessionExpanded(session.id)
                const sessionLabel = session.opponent ? `vs ${session.opponent}` : 'Training Session'
                const sessionDate = formatDateShort(session.date)
                const uniquePlayerIds = [...new Set(clips.map(c => c.playerId))]
                const avatarPlayers = uniquePlayerIds.slice(0, 4).map(pid => players.find(p => p.id === pid)).filter(Boolean)
                const moreCount = uniquePlayerIds.length - 4

                return (
                  <div key={session.id} style={{ marginBottom: 8 }}>
                    {/* Session header */}
                    <div
                      onClick={() => toggleSession(session.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: expanded ? '10px 10px 0 0' : 10,
                        cursor: 'pointer',
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{sessionLabel}</div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{sessionDate}</div>
                      </div>
                      {/* Clip count badge */}
                      <span style={{
                        background: 'rgba(74,74,255,0.2)',
                        color: '#818CF8',
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 10,
                        padding: '2px 8px',
                      }}>
                        {clips.length} clip{clips.length !== 1 ? 's' : ''}
                      </span>
                      {/* Chevron */}
                      <div style={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease',
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        <ChevronDown size={18} color="rgba(255,255,255,0.5)" />
                      </div>
                    </div>

                    {/* Collapsed: stacked avatar strip */}
                    {!expanded && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '0 0 10px 10px',
                        gap: 4,
                      }}>
                        <div style={{ display: 'flex' }}>
                          {avatarPlayers.map((p, i) => (
                            <div key={p!.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: avatarPlayers.length - i }}>
                              <PlayerAvatar player={p!} size="sm" />
                            </div>
                          ))}
                        </div>
                        {moreCount > 0 && (
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 4 }}>+{moreCount} more</span>
                        )}
                      </div>
                    )}

                    {/* Expanded: clip rows */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 10px 10px' }}
                        >
                          {clips.map((clip, clipIdx) => {
                            const clipPlayer = players.find(p => p.id === clip.playerId)
                            const playerName = clipPlayer ? `${clipPlayer.firstName} ${clipPlayer.lastName}` : 'Unknown'
                            const badge = getEventBadge(clip.eventType)
                            const minute = Math.floor(clip.timestampSeconds / 60)
                            const durationFormatted = `${Math.floor(clip.durationSeconds / 60)}:${(clip.durationSeconds % 60).toString().padStart(2, '0')}`

                            return (
                              <motion.div
                                key={clip.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: clipIdx * 0.04, duration: 0.2 }}
                                onClick={() => openClip(clip)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '10px 12px',
                                  borderTop: clipIdx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <PlayerAvatar player={clipPlayer!} size="sm" />
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: badge.bg, color: badge.color }}>{badge.label}</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{minute}&apos;</span>
                                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, flex: 1 }}>{playerName}</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 6px' }}>{durationFormatted}</span>
                                {/* Play button */}
                                <div style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: 'rgba(74,74,255,0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Play size={12} color="#818CF8" fill="#818CF8" />
                                </div>
                                {/* AI confidence dot */}
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: getConfidenceColor(clip.aiConfidence) }} />
                              </motion.div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
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
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.25)',
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
                        <div style={{ flex: 1, height: 1, background: C.border }} />
                        <span style={{ color: '#9DA2B3', fontSize: 12 }}>or</span>
                        <div style={{ flex: 1, height: 1, background: C.border }} />
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
              background: C.darkBg,
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
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
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
              background: 'linear-gradient(to top, rgba(10,14,26,0.9), transparent)',
            }}>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                {playerName} &middot; {badge.label}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 }}>
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
