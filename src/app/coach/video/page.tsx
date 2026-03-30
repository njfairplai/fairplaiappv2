'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Play, Pause, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Film, Clapperboard, Sparkles, ArrowLeft, MessageCircle,
  Bookmark as BookmarkIcon, SkipBack, SkipForward, Rewind, FastForward,
  Eye, Shield, Lock, Star, Flag, MessageSquare, BarChart3,
  Target, Footprints, ShieldCheck, Zap, Hand, User, Share2, TrendingUp, TrendingDown, Minus, ClipboardList,
} from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import {
  sessions, highlights, players, pitches, rosters, bookmarks, sessionSegments,
  squadScores, matchAnalyses, sessionTeamScores, playerHeatmaps, highlightLocations,
  pendingReviewItems,
} from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import EventTimeline from '@/components/coach/EventTimeline'
import PitchEventMap from '@/components/coach/PitchEventMap'
import PitchHeatmap from '@/components/coach/PitchHeatmap'
import WhatsAppDeliveryPanel from '@/components/shared/WhatsAppDeliveryPanel'
import HighlightsGenerator from '@/components/coach/HighlightsGenerator'
import type { Session, Highlight, TimelineEvent, PendingReviewItem } from '@/lib/types'
import { COLORS } from '@/lib/constants'

const ACADEMY_ID = 'academy_001'

// ─── HELPERS ─────────────────────────────────────────────────
const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${monthAbbr[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
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
  return `${hours}h ${mins}m`
}

function calcDurationSeconds(startTime: string, endTime: string): number {
  return calcDurationMinutes(startTime, endTime) * 60
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#D97706'
  if (['CB', 'LB', 'RB'].includes(position)) return '#059669'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return COLORS.primary
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#DC2626'
  return '#64748B'
}

function getPositionGradient(position: string): string {
  if (position === 'GK') return 'linear-gradient(160deg, #D97706 0%, #B45309 100%)'
  if (['CB', 'LB', 'RB'].includes(position)) return 'linear-gradient(160deg, #059669 0%, #047857 100%)'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return 'linear-gradient(160deg, #4A4AFF 0%, #3025AE 100%)'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return 'linear-gradient(160deg, #DC2626 0%, #B91C1C 100%)'
  return 'linear-gradient(160deg, #6E7180 0%, #40424D 100%)'
}

function getEventBadge(eventType: string): { bg: string; color: string; label: string } {
  switch (eventType) {
    case 'goal': return { bg: '#FEF3C7', color: '#92400E', label: '\u26BD Goal' }
    case 'key_pass': return { bg: '#EFF6FF', color: '#1E40AF', label: '\uD83C\uDFAF Key Pass' }
    case 'sprint_recovery': return { bg: '#DCFCE7', color: '#166534', label: '\u26A1 Sprint' }
    case 'tackle': return { bg: '#F3E8FF', color: '#6B21A8', label: '\uD83D\uDEE1 Tackle' }
    case 'save': return { bg: '#FEF3C7', color: '#92400E', label: '\uD83E\uDDE4 Save' }
    default: return { bg: '#F5F6FC', color: '#6E7180', label: eventType }
  }
}

const EVENT_META: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  goal: { color: '#EF4444', icon: Target, label: 'Goal' },
  key_pass: { color: '#4A4AFF', icon: Footprints, label: 'Key Pass' },
  tackle: { color: '#10B981', icon: ShieldCheck, label: 'Tackle' },
  sprint_recovery: { color: '#F59E0B', icon: Zap, label: 'Sprint' },
  save: { color: '#8B5CF6', icon: Hand, label: 'Save' },
}

type Tab = 'training' | 'matches' | 'highlights' | 'generator'

// ─── REVIEW EMBEDDED ────────────────────────────────────────
function ReviewEmbedded({ items }: { items: PendingReviewItem[] }) {
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())

  if (items.length === 0) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>All caught up</p>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>No sessions need review right now.</p>
      </div>
    )
  }

  const handleConfirm = (id: string) => {
    setConfirmedIds(prev => new Set(prev).add(id))
  }

  const activeItems = items.filter(i => !confirmedIds.has(i.id))

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Session Review</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>{activeItems.length} item{activeItems.length !== 1 ? 's' : ''} need{activeItems.length === 1 ? 's' : ''} your attention</p>
      </div>

      {activeItems.map(item => {
        const session = sessions.find(s => s.id === item.sessionId)
        const roster = session ? rosters.find(r => r.id === session.rosterId) : null
        const isClassify = item.type === 'classify'

        return (
          <div key={item.id} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {roster?.name}{session?.opponent ? ` vs ${session.opponent}` : ''}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, marginLeft: 8,
                  background: isClassify ? 'rgba(245,158,11,0.15)' : 'rgba(74,74,255,0.15)',
                  color: isClassify ? '#F59E0B' : '#4A4AFF',
                }}>
                  {isClassify ? 'Classify' : 'Tag Players'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#64748B' }}>{session?.date}</span>
            </div>

            {isClassify && item.segments && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {item.segments.map((seg, i) => (
                  <div key={i} style={{
                    flex: seg.endMin - seg.startMin,
                    height: 24, borderRadius: 4,
                    background: seg.aiClassification === 'drill' ? 'rgba(16,185,129,0.25)' : seg.aiClassification === 'match' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{seg.aiClassification}</span>
                  </div>
                ))}
              </div>
            )}

            {!isClassify && (
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                {item.playersToTag?.length || 0} players to identify on pitch
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleConfirm(item.id)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: COLORS.primary, color: '#fff', fontSize: 12, fontWeight: 700,
                }}
              >
                {isClassify ? 'Confirm Classification' : 'Confirm Tags'}
              </button>
              <a
                href="/coach/review"
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 600,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                }}
              >
                Full Review
              </a>
            </div>
          </div>
        )
      })}

      {confirmedIds.size > 0 && activeItems.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>All items reviewed</p>
        </div>
      )}
    </div>
  )
}

// ─── PILL TOGGLE ────────────────────────────────────────────
function PillToggle<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 3 }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: value === opt.id ? COLORS.primary : 'transparent',
            color: value === opt.id ? '#fff' : '#94a3b8',
            fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── SIDEBAR SESSION CARD ────────────────────────────────────
function SessionCard({ session, active, onClick }: { session: Session; active: boolean; onClick: () => void }) {
  const roster = rosters.find(r => r.id === session.rosterId)
  const pitch = pitches.find(p => p.id === session.pitchId)
  const typeColors: Record<string, string> = { match: '#EF4444', drill: '#10B981', training_match: '#F59E0B' }

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: 10,
        background: active ? `${COLORS.primary}15` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? COLORS.primary + '40' : 'rgba(255,255,255,0.06)'}`,
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {roster?.name}{session.opponent ? ` vs ${session.opponent}` : ''}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: `${typeColors[session.type] || '#94a3b8'}20`,
          color: typeColors[session.type] || '#94a3b8',
          textTransform: 'capitalize',
        }}>
          {session.type === 'training_match' ? 'Training Match' : session.type}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        {formatDateShort(session.date)} · {session.startTime} · {formatDuration(session.startTime, session.endTime)}
      </div>
      {pitch && <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{pitch.name}</div>}
    </button>
  )
}

// ─── DVR PLAYER ─────────────────────────────────────────────
function DvrPlayer({ session }: { session: Session }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(1)
  const scrubRef = useRef<HTMLDivElement>(null)
  const totalSeconds = calcDurationSeconds(session.startTime, session.endTime)
  const currentSeconds = Math.floor(progress * totalSeconds)
  const sessionBookmarks = bookmarks.filter(b => b.sessionId === session.id)
  const sessionHighlights = highlights.filter(h => h.sessionId === session.id)
  const segments = sessionSegments.filter(s => s.sessionId === session.id)
  const roster = rosters.find(r => r.id === session.rosterId)
  const speeds = [0.5, 1, 1.5, 2]

  function handleScrub(e: React.MouseEvent) {
    if (!scrubRef.current) return
    const rect = scrubRef.current.getBoundingClientRect()
    setProgress(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {roster?.name}{session.opponent ? ` vs ${session.opponent}` : ''}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDateShort(session.date)} · {session.startTime}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {segments.map(seg => (
            <span key={seg.id} style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: seg.aiClassification === 'match' ? 'rgba(239,68,68,0.2)' : seg.aiClassification === 'drill' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              color: seg.aiClassification === 'match' ? '#EF4444' : seg.aiClassification === 'drill' ? '#10B981' : '#F59E0B',
              textTransform: 'capitalize',
            }}>
              {seg.coachConfirmation || seg.aiClassification} ({Math.round(seg.aiConfidence)}%)
            </span>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', aspectRatio: '16/9', minHeight: 280 }}>
        <div style={{ position: 'absolute', inset: '10%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', opacity: 0.3 }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <button onClick={() => setPlaying(!playing)} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          {playing ? <Pause size={24} color="#fff" fill="#fff" /> : <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />}
        </button>
      </div>
      <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.9)' }}>
        <div ref={scrubRef} onClick={handleScrub} style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', marginBottom: 8 }}>
          <div style={{ height: '100%', borderRadius: 4, background: COLORS.primary, width: `${progress * 100}%`, transition: 'width 0.1s' }} />
          {sessionBookmarks.map(bm => (
            <div key={bm.id} onClick={e => { e.stopPropagation(); setProgress(bm.timestampSeconds / totalSeconds) }} title={bm.label}
              style={{ position: 'absolute', top: -4, left: `${(bm.timestampSeconds / totalSeconds) * 100}%`, width: 16, height: 16, borderRadius: '50%', background: COLORS.primary, border: '2px solid #000', transform: 'translateX(-50%)', cursor: 'pointer' }} />
          ))}
          {sessionHighlights.map(h => {
            const meta = EVENT_META[h.eventType]
            return <div key={h.id} onClick={e => { e.stopPropagation(); setProgress(h.timestampSeconds / totalSeconds) }} title={`${meta?.label} — ${formatTime(h.timestampSeconds)}`}
              style={{ position: 'absolute', top: -3, left: `${(h.timestampSeconds / totalSeconds) * 100}%`, width: 14, height: 14, borderRadius: 3, transform: 'translateX(-50%) rotate(45deg)', background: meta?.color || '#94a3b8', border: '2px solid #000', cursor: 'pointer' }} />
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', minWidth: 48 }}>{formatTime(currentSeconds)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setProgress(Math.max(0, progress - 10 / totalSeconds))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><SkipBack size={16} color="#fff" /></button>
            <button onClick={() => setProgress(Math.max(0, progress - 30 / totalSeconds))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Rewind size={16} color="#fff" /></button>
            <button onClick={() => setPlaying(!playing)} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {playing ? <Pause size={16} color="#fff" fill="#fff" /> : <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={() => setProgress(Math.min(1, progress + 30 / totalSeconds))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><FastForward size={16} color="#fff" /></button>
            <button onClick={() => setProgress(Math.min(1, progress + 10 / totalSeconds))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><SkipForward size={16} color="#fff" /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => { const i = speeds.indexOf(speed); setSpeed(speeds[(i + 1) % speeds.length]) }} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{speed}x</button>
            <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{formatTime(totalSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ACTION BAR ─────────────────────────────────────────────
function ActionBar() {
  const actions = [
    { icon: BookmarkIcon, label: 'Bookmark', color: COLORS.primary },
    { icon: Star, label: 'Highlight', color: '#F59E0B' },
    { icon: Flag, label: 'Flag for Review', color: '#EF4444' },
    { icon: MessageSquare, label: 'Add Note', color: '#10B981' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
      {actions.map(({ icon: Icon, label, color }) => (
        <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, color, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${color}25` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${color}15` }}>
          <Icon size={15} />{label}
        </button>
      ))}
    </div>
  )
}

// ─── COACH TOOLS (Training tab) ─────────────────────────────
function CoachToolsPanel({ session }: { session: Session }) {
  const sessionBmarks = bookmarks.filter(b => b.sessionId === session.id).sort((a, b) => a.timestampSeconds - b.timestampSeconds)
  const [playerNote, setPlayerNote] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const sessionPlayers = session.participatingPlayerIds?.map(id => players.find(p => p.id === id)).filter(Boolean) || []

  const BOOKMARK_PRESETS = ['Show team', 'Review', 'Good example', 'Needs work', 'Defending', 'Attacking']

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Bookmarks */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bookmarks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sessionBmarks.map(bm => (
            <div key={bm.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <BookmarkIcon size={14} color={COLORS.primary} />
              <span style={{ fontSize: 12, color: '#fff', flex: 1 }}>{bm.label}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{formatTime(bm.timestampSeconds)}</span>
            </div>
          ))}
          {sessionBmarks.length === 0 && <div style={{ fontSize: 12, color: '#64748B', padding: '8px 0' }}>No bookmarks yet</div>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {BOOKMARK_PRESETS.map(label => (
            <button key={label} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              + {label}
            </button>
          ))}
        </div>
      </div>

      {/* Player Notes */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Player Notes</div>
        <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}>
          <option value="">Select a player...</option>
          {sessionPlayers.map(p => p && <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
        <textarea value={playerNote} onChange={e => setPlayerNote(e.target.value)} placeholder="Write a note about this player's performance..."
          style={{ width: '100%', minHeight: 60, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        <button style={{ marginTop: 6, padding: '6px 14px', borderRadius: 6, background: selectedPlayer && playerNote ? COLORS.primary : 'rgba(255,255,255,0.06)', border: 'none', color: selectedPlayer && playerNote ? '#fff' : '#64748B', fontSize: 12, fontWeight: 700, cursor: selectedPlayer && playerNote ? 'pointer' : 'default' }}>
          Save Note
        </button>
      </div>
    </div>
  )
}

// ─── STATS ROW ──────────────────────────────────────────────
function StatsRow({ session }: { session: Session }) {
  const sh = highlights.filter(h => h.sessionId === session.id)
  const stats = [
    { label: 'Goals', count: sh.filter(h => h.eventType === 'goal').length, icon: Target, color: '#EF4444' },
    { label: 'Passes', count: sh.filter(h => h.eventType === 'key_pass').length, icon: Footprints, color: '#4A4AFF' },
    { label: 'Defense', count: sh.filter(h => h.eventType === 'tackle').length, icon: ShieldCheck, color: '#10B981' },
    { label: 'Sprints', count: sh.filter(h => h.eventType === 'sprint_recovery').length, icon: Zap, color: '#F59E0B' },
  ]
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 0' }}>
      {stats.map(({ label, count, icon: Icon, color }) => (
        <div key={label} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={color} /></div>
          <div>
            <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color }}>{count}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── TIMELINE EVENTS ────────────────────────────────────────
function TimelineEventsPanel({ session }: { session: Session }) {
  const [playerFilter, setPlayerFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const sh = highlights.filter(h => h.sessionId === session.id).sort((a, b) => a.timestampSeconds - b.timestampSeconds)
  const sessionPlayers = useMemo(() => [...new Set(sh.map(h => h.playerId))].map(id => players.find(p => p.id === id)).filter(Boolean), [sh])
  const eventTypes = [...new Set(sh.map(h => h.eventType))]
  const filtered = sh.filter(h => !playerFilter || h.playerId === playerFilter).filter(h => !eventFilter || h.eventType === eventFilter)

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Timeline Events</span>
        <span style={{ fontSize: 11, color: '#64748B' }}>{filtered.length} events</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <select value={playerFilter} onChange={e => setPlayerFilter(e.target.value)} style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 11, outline: 'none' }}>
          <option value="">All Players</option>
          {sessionPlayers.map(p => p && <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 11, outline: 'none' }}>
          <option value="">All Events</option>
          {eventTypes.map(et => <option key={et} value={et}>{EVENT_META[et]?.label || et}</option>)}
        </select>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(h => {
          const meta = EVENT_META[h.eventType] || { color: '#94a3b8', icon: Play, label: h.eventType }
          const player = players.find(p => p.id === h.playerId)
          const Icon = meta.icon
          return (
            <button key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={meta.color} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{meta.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{player ? `${player.firstName} ${player.lastName}` : 'Unknown'}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${meta.color}20`, color: meta.color, fontFamily: 'monospace' }}>{formatTime(h.timestampSeconds)}</span>
            </button>
          )
        })}
        {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 12 }}>No events recorded</div>}
      </div>
    </div>
  )
}

// ─── MATCH ANALYSIS PANEL (Rich) ────────────────────────────
function MatchAnalysisPanel({ session, onWhatsAppOpen, onNavigatePlayer }: { session: Session; onWhatsAppOpen: () => void; onNavigatePlayer: (playerId: string) => void }) {
  const [showHeatmaps, setShowHeatmaps] = useState(false)
  const [showEventMap, setShowEventMap] = useState(false)
  const [matchNote, setMatchNote] = useState('')
  const [matchNoteLastSaved, setMatchNoteLastSaved] = useState<string | null>(null)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [highlightPrivacy, setHighlightPrivacy] = useState<Record<string, string>>({})
  const [expandedHeatmap, setExpandedHeatmap] = useState<string | null>(null)

  const teamScore = sessionTeamScores[session.id] || 0
  const sessionHL = highlights.filter(h => h.sessionId === session.id)
  const analyses = matchAnalyses.filter(a => a.sessionId === session.id)
  const participatingPlayers = (session.participatingPlayerIds || []).map(id => players.find(p => p.id === id)).filter(Boolean) as typeof players

  // Load saved notes and privacy data
  useEffect(() => {
    if (typeof window !== 'undefined' && session.id) {
      const saved = localStorage.getItem(`fairplai_match_note_${session.id}`)
      if (saved) { setMatchNote(saved); setNotesExpanded(true) }
      const privData = localStorage.getItem('fairplai_highlight_privacy')
      if (privData) setHighlightPrivacy(JSON.parse(privData))
    }
  }, [session.id])

  // Auto-save notes
  useEffect(() => {
    if (typeof window === 'undefined' || !matchNote || !session.id) return
    const timer = setTimeout(() => {
      localStorage.setItem(`fairplai_match_note_${session.id}`, matchNote)
      const now = new Date()
      setMatchNoteLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }, 1500)
    return () => clearTimeout(timer)
  }, [matchNote, session.id])

  // Build TimelineEvents
  const timelineEvents: TimelineEvent[] = sessionHL.map(h => ({
    highlightId: h.id,
    playerId: h.playerId,
    eventType: h.eventType as TimelineEvent['eventType'],
    timestampSeconds: h.timestampSeconds,
    confidence: h.aiConfidence / 100,
    pitchX: highlightLocations[h.id]?.pitchX,
    pitchY: highlightLocations[h.id]?.pitchY,
  }))

  const durationMin = calcDurationMinutes(session.startTime, session.endTime)
  const isAnalysed = session.status === 'analysed'
  const resultColor = teamScore >= 75 ? '#10B981' : teamScore >= 60 ? '#F59E0B' : '#EF4444'
  const resultLabel = teamScore >= 75 ? 'Win' : teamScore >= 60 ? 'Draw' : 'Loss'

  // Player scores from analyses
  const playerScores = analyses.map(a => ({ ...a, player: players.find(p => p.id === a.playerId) })).filter(a => a.player).sort((a, b) => b.compositeScore - a.compositeScore)

  // Participating players with scores (for rich cards)
  const squadPerformance = participatingPlayers
    .map(player => {
      const score = squadScores[player.id]
      return { player, compositeScore: score?.compositeScore ?? 0 }
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)

  const scoredPlayers = squadPerformance.filter(pp => pp.compositeScore > 0)
  const avgScore = scoredPlayers.length > 0
    ? Math.round(scoredPlayers.reduce((sum, pp) => sum + pp.compositeScore, 0) / scoredPlayers.length)
    : teamScore

  const topPerformers = [...squadPerformance].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 5)
  const heatmapKeys = Object.keys(playerHeatmaps).filter(k => k.startsWith(session.id))

  // Score arc
  const arcRadius = 36
  const arcCircumference = 2 * Math.PI * arcRadius
  const arcOffset = arcCircumference - (arcCircumference * avgScore / 100)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>

      {/* ─── Squad Score Arc ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
        <svg width={84} height={84} viewBox="0 0 84 84">
          <circle cx={42} cy={42} r={arcRadius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
          <circle cx={42} cy={42} r={arcRadius} fill="none" stroke={resultColor} strokeWidth={4}
            strokeDasharray={arcCircumference} strokeDashoffset={arcOffset}
            strokeLinecap="round" transform="rotate(-90 42 42)" />
          <text x={42} y={46} textAnchor="middle" fill={getScoreColor(avgScore)} fontSize={20} fontWeight={700}>
            {avgScore}
          </text>
        </svg>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Avg Squad Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${resultColor}20`, color: resultColor }}>{resultLabel}</span>
            <span style={{ fontSize: 12, color: getScoreColor(avgScore), fontWeight: 700 }}>
              {avgScore >= 75 ? 'Strong Performance' : avgScore >= 60 ? 'Average Performance' : 'Needs Improvement'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Top Performers ─── */}
      {topPerformers.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Top Performers</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {topPerformers.map(({ player, compositeScore }) => {
              const pos = player.position[0] || 'CM'
              const posColor = getPositionColor(pos)
              const avgPlayerScore = squadScores[player.id]?.avgScore ?? 0
              const diff = compositeScore - avgPlayerScore
              return (
                <div key={player.id} style={{ minWidth: 120, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <PlayerAvatar player={player} size="sm" />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 6 }}>{player.firstName}</div>
                  <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, borderRadius: 8, padding: '2px 8px', marginTop: 4, background: `${posColor}1A`, color: posColor }}>{pos}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(compositeScore) }}>{compositeScore}</span>
                    {diff > 3 ? <TrendingUp size={12} color="#10B981" /> : diff < -3 ? <TrendingDown size={12} color="#EF4444" /> : <Minus size={12} color="#94a3b8" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Event Timeline + Pitch Event Map ─── */}
      {timelineEvents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Match Timeline</div>
          <EventTimeline
            events={timelineEvents}
            durationMinutes={durationMin}
            players={participatingPlayers.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, position: p.position }))}
          />
          <button
            onClick={() => setShowEventMap(prev => !prev)}
            style={{
              marginTop: 10, background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
              color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {showEventMap ? '\u25B2 Hide Pitch View' : '\u25BC Show Pitch View'}
          </button>
          {showEventMap && timelineEvents.some(e => e.pitchX !== undefined) && (
            <div style={{ marginTop: 10 }}>
              <PitchEventMap
                events={timelineEvents}
                players={participatingPlayers.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, position: p.position }))}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Squad Performance (Rich Cards) ─── */}
      {squadPerformance.length > 0 && (
        <div style={{ marginBottom: 16 }}>
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
                  onClick={() => onNavigatePlayer(player.id)}
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

      {/* ─── Player Heatmaps ─── */}
      {heatmapKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowHeatmaps(!showHeatmaps)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700,
          }}>
            Player Heatmaps {showHeatmaps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showHeatmaps && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {participatingPlayers.map(player => {
                  const heatmapKey = `${session.id}_${player.id}`
                  const hasData = !!playerHeatmaps[heatmapKey]
                  if (!hasData) return null
                  const isActive = expandedHeatmap === player.id
                  return (
                    <button
                      key={player.id}
                      onClick={() => setExpandedHeatmap(isActive ? null : player.id)}
                      style={{
                        padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        border: isActive ? `2px solid ${COLORS.primary}` : '2px solid rgba(255,255,255,0.1)',
                        background: isActive ? `${COLORS.primary}10` : 'rgba(255,255,255,0.04)',
                        color: isActive ? COLORS.primary : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      {player.firstName} {player.lastName}
                    </button>
                  )
                })}
              </div>
              {expandedHeatmap && (() => {
                const heatmapKey = `${session.id}_${expandedHeatmap}`
                const heatmapData = playerHeatmaps[heatmapKey]
                if (!heatmapData) return null
                const player = players.find(p => p.id === expandedHeatmap)
                return (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {player?.firstName} {player?.lastName}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{'\u00B7'}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{heatmapData.positionLabel}</span>
                    </div>
                    <PitchHeatmap data={heatmapData} showLegend />
                  </div>
                )
              })()}
            </>
          )}
        </div>
      )}

      {/* ─── Match Highlights with Privacy Controls ─── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Match Highlights</div>
          <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>
            {sessionHL.length}
          </span>
        </div>

        {sessionHL.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '32px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 32 }}>{'\uD83C\uDFA5'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 8 }}>No highlights yet</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Highlights will appear here once the match has been analysed.</div>
          </div>
        ) : (
          sessionHL.map((h: Highlight) => {
            const badge = getEventBadge(h.eventType)
            const highlightPlayer = players.find(p => p.id === h.playerId)
            const minute = Math.floor(h.timestampSeconds / 60)

            return (
              <div key={h.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 6 }}>
                      {highlightPlayer ? `${highlightPlayer.firstName} ${highlightPlayer.lastName}` : 'Unknown'} &middot; {minute}&apos;
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{h.durationSeconds}s</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 10, cursor: 'pointer' }}>
                    <div style={{ width: 0, height: 0, borderLeft: '10px solid #FFFFFF', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 2 }} />
                  </div>
                </div>

                {/* Privacy controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Visibility:</span>
                  {(['parent_visible', 'team_only', 'private'] as const).map(p => {
                    const currentPrivacy = highlightPrivacy[h.id] || h.privacy || 'parent_visible'
                    const isActive = currentPrivacy === p
                    const labels = { parent_visible: 'Parent/Player', team_only: 'Team', private: 'Private' }
                    const colors = { parent_visible: '#10B981', team_only: '#4A4AFF', private: '#64748B' }
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          const newPrivacy = { ...highlightPrivacy, [h.id]: p }
                          setHighlightPrivacy(newPrivacy)
                          localStorage.setItem('fairplai_highlight_privacy', JSON.stringify(newPrivacy))
                        }}
                        style={{
                          padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          background: isActive ? `${colors[p]}1A` : 'rgba(255,255,255,0.06)',
                          color: isActive ? colors[p] : '#9DA2B3',
                          border: isActive ? `1px solid ${colors[p]}40` : '1px solid transparent',
                        }}
                      >
                        {labels[p]}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ─── WhatsApp Share Button ─── */}
      {isAnalysed && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={onWhatsAppOpen}
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

      {/* ─── Coach Notes ─── */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setNotesExpanded(!notesExpanded)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: notesExpanded ? '12px 12px 0 0' : 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          Coach Notes
          {notesExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
        </button>
        {notesExpanded && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0 0 12px 12px', padding: '0 16px 16px', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <textarea
              value={matchNote}
              onChange={e => setMatchNote(e.target.value)}
              placeholder="Add notes about this match..."
              style={{
                width: '100%',
                minHeight: 80,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                outline: 'none',
              }}
            />
            {matchNoteLastSaved && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Last saved: {matchNoteLastSaved}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HIGHLIGHTS BY GAME ─────────────────────────────────────
function HighlightsByGame({ sessionList, allHighlights, onClipClick }: { sessionList: Session[]; allHighlights: Highlight[]; onClipClick: (clip: Highlight) => void }) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const sessionsWithHighlights = sessionList.filter(s => allHighlights.some(h => h.sessionId === s.id))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Highlights by Game</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessionsWithHighlights.map(s => {
          const sHL = allHighlights.filter(h => h.sessionId === s.id)
          const isExpanded = expandedSession === s.id
          const roster = rosters.find(r => r.id === s.rosterId)
          const typeColors: Record<string, string> = { match: '#EF4444', drill: '#10B981', training_match: '#F59E0B' }

          return (
            <div key={s.id}>
              <button
                onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: isExpanded ? `${COLORS.primary}10` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isExpanded ? COLORS.primary + '30' : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {s.opponent ? `vs ${s.opponent}` : roster?.name || 'Session'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${typeColors[s.type] || '#94a3b8'}20`, color: typeColors[s.type] || '#94a3b8' }}>
                      {s.type === 'training_match' ? 'Training Match' : s.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDateShort(s.date)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: `${COLORS.primary}20`, color: COLORS.primary }}>{sHL.length}</span>
                  {isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                </div>
              </button>

              {isExpanded && (
                <div style={{ padding: '8px 0 0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sHL.sort((a, b) => a.timestampSeconds - b.timestampSeconds).map(clip => {
                    const meta = EVENT_META[clip.eventType]
                    const player = players.find(p => p.id === clip.playerId)
                    const Icon = meta?.icon || Play
                    return (
                      <button key={clip.id} onClick={() => onClipClick(clip)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta?.color || '#94a3b8'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} color={meta?.color || '#94a3b8'} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{meta?.label || clip.eventType}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{player?.firstName} {player?.lastName} · {formatTime(clip.timestampSeconds)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{clip.durationSeconds}s</span>
                          <Play size={14} color={COLORS.primary} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {sessionsWithHighlights.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No highlights available</div>}
      </div>
    </div>
  )
}

// ─── REELS VIEW ─────────────────────────────────────────────
function ReelsView({ allHighlights }: { allHighlights: Highlight[] }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const sorted = [...allHighlights].sort((a, b) => b.timestampSeconds - a.timestampSeconds)
  const clip = sorted[currentIdx]
  if (!clip) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>No highlights</div>

  const player = players.find(p => p.id === clip.playerId)
  const session = sessions.find(s => s.id === clip.sessionId)
  const meta = EVENT_META[clip.eventType]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#000' }}>
      {/* Main clip area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(ellipse at center, ${meta?.color || '#4A4AFF'}15, transparent 70%)`,
        position: 'relative', padding: 24,
      }}>
        {/* Event badge */}
        <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: `${meta?.color || '#94a3b8'}25`, border: `1px solid ${meta?.color || '#94a3b8'}40` }}>
          {meta?.icon && React.createElement(meta.icon, { size: 14, color: meta.color })}
          <span style={{ fontSize: 12, fontWeight: 700, color: meta?.color || '#fff' }}>{meta?.label || clip.eventType}</span>
        </div>
        {/* Duration */}
        <div style={{ position: 'absolute', top: 20, right: 20, padding: '4px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
          {clip.durationSeconds}s
        </div>

        {/* Play button */}
        <button style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
        </button>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 4 }}>{meta?.label || clip.eventType}</div>
        <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 2 }}>
          {Math.floor(clip.timestampSeconds / 60)}{'\''} · {player?.firstName} {player?.lastName}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', textAlign: 'center' }}>
          {session?.opponent ? `vs ${session.opponent}` : formatDateShort(session?.date || '')}
        </div>

        {/* Share */}
        <button style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={18} color="#fff" />
        </button>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(0,0,0,0.9)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: currentIdx === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={14} /> Previous
        </button>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 4 }}>
          {sorted.slice(Math.max(0, currentIdx - 3), currentIdx + 4).map((_, i) => {
            const actualIdx = Math.max(0, currentIdx - 3) + i
            return <div key={actualIdx} style={{ width: actualIdx === currentIdx ? 16 : 6, height: 6, borderRadius: 3, background: actualIdx === currentIdx ? COLORS.primary : 'rgba(255,255,255,0.2)', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => setCurrentIdx(actualIdx)} />
          })}
        </div>

        <button onClick={() => setCurrentIdx(Math.min(sorted.length - 1, currentIdx + 1))}
          style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: currentIdx === sorted.length - 1 ? 0.3 : 1 }}>
          Next <ChevronRight size={14} />
        </button>
      </div>

      {/* Counter */}
      <div style={{ textAlign: 'center', padding: '4px 0 8px', background: 'rgba(0,0,0,0.9)', fontSize: 11, color: '#64748B' }}>
        {currentIdx + 1} of {sorted.length}
      </div>
    </div>
  )
}

// ─── STITCHED HIGHLIGHTS VIEW ──────────────────────────────────
function getHighlightBadge(type: string) {
  switch (type) {
    case 'goal': return { emoji: '⚽', label: 'Goal', color: '#F59E0B' }
    case 'key_pass': return { emoji: '🎯', label: 'Key Pass', color: '#3B82F6' }
    case 'sprint_recovery': return { emoji: '⚡', label: 'Sprint', color: '#10B981' }
    case 'tackle': return { emoji: '🛡', label: 'Tackle', color: '#8B5CF6' }
    case 'save': return { emoji: '🧤', label: 'Save', color: '#F97316' }
    case 'dribble': return { emoji: '💨', label: 'Dribble', color: '#06B6D4' }
    default: return { emoji: '🔥', label: type, color: '#94a3b8' }
  }
}

// ─── STITCHED REEL PLAYER (for a single session's highlights) ─────
function StitchedReelPlayer({ highlights: sessionHighlights, session, onBack }: {
  highlights: Highlight[]
  session: Session
  onBack: () => void
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const sorted = [...sessionHighlights].sort((a, b) => a.timestampSeconds - b.timestampSeconds)
  const current = sorted[currentIdx]
  const currentPlayer = current ? players.find(p => p.id === current.playerId) : null
  const badge = current ? getHighlightBadge(current.eventType) : null
  const roster = rosters.find(r => r.id === session.rosterId)

  if (sorted.length === 0) return null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Back bar */}
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        background: 'rgba(0,0,0,0.6)',
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to matches
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {session.opponent ? `vs ${session.opponent}` : `${roster?.name || 'Training'}`}
        </div>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          {formatDateShort(session.date)} · {sorted.length} highlight{sorted.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Video Player Area */}
      <div style={{ flex: 1, background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        {/* Placeholder for stitched video */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
          <div style={{ textAlign: 'center' }}>
            <Play size={48} color="rgba(255,255,255,0.3)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {badge?.emoji} {currentPlayer?.firstName} {currentPlayer?.lastName}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {badge?.label} · {current?.timestampSeconds ? `${Math.floor(current.timestampSeconds / 60)}'` : ''}
            </div>
          </div>
        </div>

        {/* Event badge overlay */}
        {badge && (
          <div style={{
            position: 'absolute', top: 16, left: 16,
            padding: '6px 12px', borderRadius: 8,
            background: `${badge.color}20`, border: `1px solid ${badge.color}40`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{badge.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: badge.color }}>{badge.label}</span>
          </div>
        )}

        {/* Nav arrows */}
        {currentIdx > 0 && (
          <button onClick={() => setCurrentIdx(currentIdx - 1)} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronLeft size={18} />
          </button>
        )}
        {currentIdx < sorted.length - 1 && (
          <button onClick={() => setCurrentIdx(currentIdx + 1)} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Info bar + Dot Timeline */}
      <div style={{ background: 'rgba(0,0,0,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {/* Now playing info */}
        <div style={{
          padding: '10px 20px 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {badge && <span style={{ fontSize: 18 }}>{badge.emoji}</span>}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {currentPlayer?.firstName} {currentPlayer?.lastName}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginLeft: 8 }}>
                  {currentPlayer?.position?.[0]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
                {badge?.label} · {current?.timestampSeconds ? `${Math.floor(current.timestampSeconds / 60)}'` : ''}
                {current?.durationSeconds ? ` · ${current.durationSeconds}s clip` : ''}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
            {currentIdx + 1} / {sorted.length}
          </div>
        </div>

        {/* Dot navigation */}
        <div style={{ padding: '6px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', overflowX: 'auto', padding: '4px 0' }}>
            {sorted.map((h, i) => {
              const b = getHighlightBadge(h.eventType)
              const isActive = i === currentIdx
              return (
                <button
                  key={h.id}
                  onClick={() => setCurrentIdx(i)}
                  title={`${b.label} — ${players.find(p => p.id === h.playerId)?.firstName || ''} · ${Math.floor(h.timestampSeconds / 60)}'`}
                  style={{
                    width: isActive ? 14 : 8,
                    height: isActive ? 14 : 8,
                    borderRadius: '50%',
                    border: isActive ? `2px solid ${b.color}` : 'none',
                    background: isActive ? '#fff' : `${b.color}80`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: '#475569', marginTop: 4 }}>
            Click dots to jump between highlights
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── HIGHLIGHTS TAB (Match list → Stitched reel) ──────────────────
function HighlightsTab({ allHighlights, matchSessions }: {
  allHighlights: Highlight[]
  matchSessions: Session[]
}) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Get sessions that have highlights, sorted by date desc
  const sessionsWithHighlights = useMemo(() => {
    const sessionIds = [...new Set(allHighlights.map(h => h.sessionId))]
    return matchSessions
      .filter(s => sessionIds.includes(s.id))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [allHighlights, matchSessions])

  const selectedSession = selectedSessionId ? sessions.find(s => s.id === selectedSessionId) : null
  const sessionHighlights = selectedSessionId ? allHighlights.filter(h => h.sessionId === selectedSessionId) : []

  // If a session is selected, show the stitched reel
  if (selectedSession && sessionHighlights.length > 0) {
    return (
      <StitchedReelPlayer
        highlights={sessionHighlights}
        session={selectedSession}
        onBack={() => setSelectedSessionId(null)}
      />
    )
  }

  // Otherwise show match list
  if (sessionsWithHighlights.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={48} color="#64748B" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>No Highlights Yet</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Highlights will appear here after sessions are analysed.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Match Highlights</h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Select a match to view its highlight reel</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessionsWithHighlights.map(s => {
            const sHighlights = allHighlights.filter(h => h.sessionId === s.id)
            const roster = rosters.find(r => r.id === s.rosterId)
            const isMatch = s.type === 'match'

            // Count by event type
            const eventCounts: Record<string, number> = {}
            sHighlights.forEach(h => {
              eventCounts[h.eventType] = (eventCounts[h.eventType] || 0) + 1
            })

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                {/* Date block */}
                <div style={{
                  width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                  background: isMatch ? 'rgba(74,74,255,0.12)' : 'rgba(16,185,129,0.12)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: isMatch ? COLORS.primary : '#10B981', lineHeight: 1 }}>
                    {new Date(s.date + 'T00:00:00').getDate()}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isMatch ? COLORS.primary : '#10B981', textTransform: 'uppercase', marginTop: 1 }}>
                    {monthAbbr[new Date(s.date + 'T00:00:00').getMonth()]}
                  </div>
                </div>

                {/* Match info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {s.opponent ? `vs ${s.opponent}` : `${roster?.name || 'Training Session'}`}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: isMatch ? 'rgba(74,74,255,0.15)' : 'rgba(16,185,129,0.15)',
                      color: isMatch ? COLORS.primary : '#10B981',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {isMatch ? 'Match' : 'Training'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {roster?.name} · {s.competition || formatDateShort(s.date)}
                  </div>
                  {/* Event type pills */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {Object.entries(eventCounts).map(([type, count]) => {
                      const b = getHighlightBadge(type)
                      return (
                        <span key={type} style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                          background: `${b.color}15`, color: b.color,
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                          <span style={{ fontSize: 12 }}>{b.emoji}</span> {count}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Highlight count + play */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      {sHighlights.length}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                      clip{sHighlights.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function VideoPortalPage() {
  const router = useRouter()
  const { selectedRosterId } = useTeam()
  const [activeTab, setActiveTab] = useState<Tab>('training')
  const [search, setSearch] = useState('')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [selectedClip, setSelectedClip] = useState<Highlight | null>(null)
  const [matchView, setMatchView] = useState<'watch' | 'analysis'>('watch')
  const [highlightView, setHighlightView] = useState<'by_game' | 'reels'>('by_game')
  const [whatsAppOpen, setWhatsAppOpen] = useState(false)

  const rosterFilter = selectedRosterId === 'all' ? null : (selectedRosterId || 'roster_001')

  const trainingSessions = useMemo(() =>
    sessions.filter(s => s.academyId === ACADEMY_ID && (!rosterFilter || s.rosterId === rosterFilter) && s.status === 'playback_ready')
      .sort((a, b) => b.date.localeCompare(a.date)), [rosterFilter])

  const matchSessions = useMemo(() =>
    sessions.filter(s => s.academyId === ACADEMY_ID && (!rosterFilter || s.rosterId === rosterFilter) && (s.type === 'match' || s.type === 'training_match') && ['analysed', 'complete'].includes(s.status))
      .sort((a, b) => b.date.localeCompare(a.date)), [rosterFilter])

  const rosterHighlights = useMemo(() => {
    const rosterSessionIds = sessions.filter(s => s.academyId === ACADEMY_ID && (!rosterFilter || s.rosterId === rosterFilter)).map(s => s.id)
    return highlights.filter(h => rosterSessionIds.includes(h.sessionId)).sort((a, b) => b.timestampSeconds - a.timestampSeconds)
  }, [rosterFilter])

  const highlightSessions = useMemo(() => {
    const sessionIds = [...new Set(rosterHighlights.map(h => h.sessionId))]
    return sessions.filter(s => sessionIds.includes(s.id)).sort((a, b) => b.date.localeCompare(a.date))
  }, [rosterHighlights])

  const filteredHighlights = useMemo(() => {
    if (!search) return rosterHighlights
    const lower = search.toLowerCase()
    return rosterHighlights.filter(h => {
      const player = players.find(p => p.id === h.playerId)
      const session = sessions.find(s => s.id === h.sessionId)
      return player?.firstName.toLowerCase().includes(lower) || player?.lastName.toLowerCase().includes(lower) || h.eventType.toLowerCase().includes(lower) || session?.opponent?.toLowerCase().includes(lower)
    })
  }, [rosterHighlights, search])

  const rosterReviewItems = pendingReviewItems.filter(item => {
    const s = sessions.find(ss => ss.id === item.sessionId)
    return s && (!rosterFilter || s.rosterId === rosterFilter)
  })

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'training', label: 'Training Footage', icon: <Film size={16} />, count: trainingSessions.length },
    { id: 'matches', label: 'Match Footage', icon: <Clapperboard size={16} />, count: matchSessions.length },
    { id: 'highlights', label: 'Highlights', icon: <Sparkles size={16} />, count: rosterHighlights.length },
    { id: 'generator', label: 'Generator', icon: <Search size={16} /> },
  ]

  const roster = rosters.find(r => r.id === rosterFilter)

  // WhatsApp session payload
  const whatsAppSession = selectedSession ? { id: selectedSession.id, rosterId: selectedSession.rosterId, opponent: selectedSession.opponent, date: selectedSession.date, type: selectedSession.type } : null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.darkBg, color: '#fff', overflow: 'hidden' }}>

      {/* ── Top Header ── */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/coach/home" style={{ color: '#94a3b8', display: 'flex' }}><ArrowLeft size={18} /></Link>
        <Image src="/logo-white.png" alt="FairplAI" width={90} height={28} style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{roster?.name || 'Video Portal'}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>Coach Video Portal</div>
      </div>

      {/* ── Top Tabs ── */}
      <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', gap: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedSession(null); setSelectedClip(null); setMatchView('watch') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
              cursor: 'pointer',
              color: activeTab === tab.id ? COLORS.primary : '#94a3b8',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              transition: 'all 0.15s',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: activeTab === tab.id ? `${COLORS.primary}20` : 'rgba(255,255,255,0.06)',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ─── TRAINING TAB ─── */}
        {activeTab === 'training' && (
          <>
            {/* Session list sidebar */}
            <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {trainingSessions.map(s => (
                    <SessionCard key={s.id} session={s} active={selectedSession?.id === s.id} onClick={() => setSelectedSession(s)} />
                  ))}
                  {trainingSessions.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 12 }}>No training sessions</div>}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {selectedSession ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
                    <DvrPlayer session={selectedSession} />
                    <ActionBar />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', padding: '0 24px 16px' }}>
                    <CoachToolsPanel session={selectedSession} />
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                  <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <Film size={48} color="#64748B" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Training Footage</h2>
                    <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Select a training session to watch footage, add bookmarks, and write notes for your players.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── MATCHES TAB ─── */}
        {activeTab === 'matches' && (
          <>
            {/* Session list sidebar */}
            <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {matchSessions.map(s => (
                    <SessionCard key={s.id} session={s} active={selectedSession?.id === s.id} onClick={() => { setSelectedSession(s); setMatchView('watch') }} />
                  ))}
                  {matchSessions.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 12 }}>No match sessions</div>}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {selectedSession ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px', flexShrink: 0 }}>
                      <DvrPlayer session={selectedSession} />
                      <ActionBar />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 24px 16px' }}>
                      <StatsRow session={selectedSession} />
                      <TimelineEventsPanel session={selectedSession} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                  <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <Clapperboard size={48} color="#64748B" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Match Footage</h2>
                    <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Select a match to watch footage.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── HIGHLIGHTS TAB (Match list → Stitched reel) ─── */}
        {activeTab === 'highlights' && (
          <HighlightsTab allHighlights={filteredHighlights} matchSessions={highlightSessions} />
        )}

        {/* ─── GENERATOR TAB (Full width) ─── */}
        {activeTab === 'generator' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <HighlightsGenerator darkMode />
          </div>
        )}
      </div>

      {/* Clip viewer modal */}
      {selectedClip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111', borderRadius: 16, width: '90%', maxWidth: 640, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{players.find(p => p.id === selectedClip.playerId)?.firstName} {players.find(p => p.id === selectedClip.playerId)?.lastName}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{selectedClip.eventType.replace('_', ' ')} · {formatTime(selectedClip.timestampSeconds)} · {selectedClip.durationSeconds}s</div>
              </div>
              <button onClick={() => setSelectedClip(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#fff" /></button>
            </div>
            <div style={{ height: 360, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => { const idx = filteredHighlights.findIndex(h => h.id === selectedClip.id); if (idx > 0) setSelectedClip(filteredHighlights[idx - 1]) }}
                style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{filteredHighlights.findIndex(h => h.id === selectedClip.id) + 1} / {filteredHighlights.length}</span>
              <button onClick={() => { const idx = filteredHighlights.findIndex(h => h.id === selectedClip.id); if (idx < filteredHighlights.length - 1) setSelectedClip(filteredHighlights[idx + 1]) }}
                style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Delivery Panel (at page level) */}
      <WhatsAppDeliveryPanel
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        session={whatsAppSession}
      />
    </div>
  )
}
