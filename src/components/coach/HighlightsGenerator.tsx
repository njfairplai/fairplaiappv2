'use client'

import { useState } from 'react'
import { Sparkles, Film, Search, Clock, Loader2, Play, ChevronRight, X } from 'lucide-react'
import { highlights, sessions, players } from '@/lib/mockData'
import { useTeam } from '@/contexts/TeamContext'
import type { Highlight } from '@/lib/types'

/* ─── MOCK HIGHLIGHT REQUEST PRESETS ──────────────────────── */
const QUICK_FILTERS = [
  { label: 'All goals this season', query: 'all goals this season' },
  { label: 'Key passes – last 3 months', query: 'all key passes in the last 3 months' },
  { label: 'Tackles by centre-backs', query: 'every tackle by centre-backs in competitive matches' },
  { label: 'Sprint recoveries – training', query: 'sprint recoveries in training matches this month' },
]

interface GeneratedResult {
  query: string
  highlights: Highlight[]
  generatedAt: string
}

function getEventBadge(type: string) {
  switch (type) {
    case 'goal': return { emoji: '⚽', label: 'Goal', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
    case 'key_pass': return { emoji: '🎯', label: 'Key Pass', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' }
    case 'sprint_recovery': return { emoji: '⚡', label: 'Sprint', color: '#10B981', bg: 'rgba(16,185,129,0.12)' }
    case 'tackle': return { emoji: '🛡', label: 'Tackle', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' }
    case 'save': return { emoji: '🧤', label: 'Save', color: '#F97316', bg: 'rgba(249,115,22,0.12)' }
    default: return { emoji: '🔥', label: type, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
  }
}

interface HighlightsGeneratorProps {
  /** When true, uses dark theme styling (for Video tab) */
  darkMode?: boolean
}

export default function HighlightsGenerator({ darkMode = false }: HighlightsGeneratorProps) {
  const { selectedRosterId } = useTeam()
  const [query, setQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [history, setHistory] = useState<GeneratedResult[]>([])
  const [viewingClip, setViewingClip] = useState<number | null>(null)

  // Theme colors
  const theme = darkMode
    ? { bg: 'transparent', cardBg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(255,255,255,0.1)', text: '#fff', textMuted: '#94a3b8', pillBg: 'rgba(255,255,255,0.06)', pillBorder: 'rgba(255,255,255,0.08)', pillText: '#cbd5e1', pillHoverBg: 'rgba(255,255,255,0.1)', historyBg: 'rgba(255,255,255,0.04)', historyBorder: 'rgba(255,255,255,0.08)', clipBg: 'rgba(255,255,255,0.04)', clipBorder: 'rgba(255,255,255,0.08)', clipHoverBg: 'rgba(255,255,255,0.06)' }
    : { bg: '#fff', cardBg: '#fff', border: '#E8EAED', inputBg: '#F8F9FC', inputBorder: '#E2E8F0', text: '#1E293B', textMuted: '#94a3b8', pillBg: '#F1F5F9', pillBorder: '#E2E8F0', pillText: '#475569', pillHoverBg: '#E2E8F0', historyBg: '#F8F9FC', historyBorder: '#E8EAED', clipBg: '#F8F9FC', clipBorder: '#E8EAED', clipHoverBg: '#F1F5F9' }

  function handleGenerate(q?: string) {
    const searchQuery = q || query
    if (!searchQuery.trim()) return

    setIsGenerating(true)
    setResult(null)

    // Simulate AI processing — filter highlights based on keywords
    setTimeout(() => {
      const lowerQ = searchQuery.toLowerCase()
      let filtered = [...highlights]

      // Filter by roster if not 'all'
      if (selectedRosterId !== 'all') {
        filtered = filtered.filter(h => {
          const session = sessions.find(s => s.id === h.sessionId)
          return session?.rosterId === selectedRosterId
        })
      }

      // Filter by event type keywords
      if (lowerQ.includes('goal')) filtered = filtered.filter(h => h.eventType === 'goal')
      else if (lowerQ.includes('tackle')) filtered = filtered.filter(h => h.eventType === 'tackle')
      else if (lowerQ.includes('pass') || lowerQ.includes('assist')) filtered = filtered.filter(h => h.eventType === 'key_pass')
      else if (lowerQ.includes('sprint') || lowerQ.includes('recovery')) filtered = filtered.filter(h => h.eventType === 'sprint_recovery')
      else if (lowerQ.includes('save')) filtered = filtered.filter(h => h.eventType === 'save')

      // Filter by player name — use word boundary matching to avoid false positives
      const playerNames = players.map(p => ({ id: p.id, full: `${p.firstName} ${p.lastName}`.toLowerCase(), last: p.lastName.toLowerCase() }))
      const wordBoundaryMatch = (text: string, name: string) => name.length >= 4 && new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
      const matchedPlayer = playerNames.find(p => wordBoundaryMatch(lowerQ, p.full) || wordBoundaryMatch(lowerQ, p.last))
      if (matchedPlayer) {
        filtered = filtered.filter(h => h.playerId === matchedPlayer.id)
      }

      // Filter by position keywords
      if (lowerQ.includes('centre-back') || lowerQ.includes('center-back') || lowerQ.includes('defender')) {
        const defenderIds = players.filter(p => p.position.some(pos => ['CB', 'LB', 'RB'].includes(pos))).map(p => p.id)
        filtered = filtered.filter(h => defenderIds.includes(h.playerId))
      }
      if (lowerQ.includes('midfielder') || lowerQ.includes('central mid')) {
        const midIds = players.filter(p => p.position.some(pos => ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos))).map(p => p.id)
        filtered = filtered.filter(h => midIds.includes(h.playerId))
      }
      if (lowerQ.includes('forward') || lowerQ.includes('striker') || lowerQ.includes('attacker')) {
        const fwdIds = players.filter(p => p.position.some(pos => ['ST', 'CF', 'LW', 'RW'].includes(pos))).map(p => p.id)
        filtered = filtered.filter(h => fwdIds.includes(h.playerId))
      }

      // Filter by session type
      if (lowerQ.includes('competitive') || lowerQ.includes('match')) {
        filtered = filtered.filter(h => {
          const session = sessions.find(s => s.id === h.sessionId)
          return session?.type === 'match'
        })
      }
      if (lowerQ.includes('training')) {
        filtered = filtered.filter(h => {
          const session = sessions.find(s => s.id === h.sessionId)
          return session?.type === 'drill' || session?.type === 'training_match'
        })
      }

      // Sort by date descending
      filtered.sort((a, b) => {
        const sA = sessions.find(s => s.id === a.sessionId)
        const sB = sessions.find(s => s.id === b.sessionId)
        return (sB?.date || '').localeCompare(sA?.date || '')
      })

      const newResult: GeneratedResult = {
        query: searchQuery,
        highlights: filtered.slice(0, 20),
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setResult(newResult)
      setHistory(prev => [newResult, ...prev].slice(0, 5))
      setIsGenerating(false)
      setQuery('')
    }, 1800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg, borderRadius: darkMode ? 0 : 16, border: darkMode ? 'none' : `1px solid ${theme.border}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #F59E0B, #F97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Film size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Highlights Generator</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Request specific highlights using natural language</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: darkMode ? 640 : undefined }}>
          <Search size={16} color={theme.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. all goals for Kiyan Makkawi in last 3 months..."
            style={{
              width: '100%', padding: '12px 14px 12px 38px',
              borderRadius: 12, border: `1.5px solid ${theme.inputBorder}`,
              fontSize: 13, color: theme.text, background: theme.inputBg,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {query && (
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                padding: '6px 14px', borderRadius: 8,
                background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #F59E0B, #F97316)',
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {isGenerating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
              Generate
            </button>
          )}
        </div>

        {/* Quick Filters */}
        {!result && !isGenerating && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Quick requests
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_FILTERS.map(f => (
                <button
                  key={f.label}
                  onClick={() => { setQuery(f.query); handleGenerate(f.query) }}
                  style={{
                    padding: '6px 12px', borderRadius: 20,
                    background: theme.pillBg, border: `1px solid ${theme.pillBorder}`,
                    fontSize: 12, fontWeight: 500, color: theme.pillText,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.pillHoverBg; e.currentTarget.style.color = theme.text }}
                  onMouseLeave={e => { e.currentTarget.style.background = theme.pillBg; e.currentTarget.style.color = theme.pillText }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 size={24} color="#F59E0B" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>Generating highlights...</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Scanning sessions and extracting matching clips</div>
          </div>
        )}

        {/* Results */}
        {result && !isGenerating && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                  {result.highlights.length} clip{result.highlights.length !== 1 ? 's' : ''} found
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  &ldquo;{result.query}&rdquo; · Generated at {result.generatedAt}
                </div>
              </div>
              <button
                onClick={() => setResult(null)}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: theme.pillBg, border: `1px solid ${theme.pillBorder}`,
                  fontSize: 11, fontWeight: 600, color: theme.textMuted, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <X size={12} /> Clear
              </button>
            </div>

            {result.highlights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>No matching highlights</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Try adjusting your search query</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: darkMode ? 800 : undefined }}>
                {result.highlights.map((h, idx) => {
                  const player = players.find(p => p.id === h.playerId)
                  const session = sessions.find(s => s.id === h.sessionId)
                  const badge = getEventBadge(h.eventType)
                  const isViewing = viewingClip === idx

                  return (
                    <div key={h.id}>
                      <button
                        onClick={() => setViewingClip(isViewing ? null : idx)}
                        style={{
                          width: '100%', textAlign: 'left', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 10,
                          background: isViewing ? badge.bg : theme.clipBg,
                          border: `1px solid ${isViewing ? badge.color + '40' : theme.clipBorder}`,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!isViewing) e.currentTarget.style.background = theme.clipHoverBg }}
                        onMouseLeave={e => { if (!isViewing) e.currentTarget.style.background = isViewing ? badge.bg : theme.clipBg }}
                      >
                        {/* Event icon */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 16 }}>{badge.emoji}</span>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
                            {player?.firstName} {player?.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                            {badge.label} · {Math.floor(h.timestampSeconds / 60)}&apos; · {session?.date}
                            {session?.opponent ? ` vs ${session.opponent}` : ''}
                          </div>
                        </div>

                        {/* Duration & play icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>
                            {h.durationSeconds}s
                          </span>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: isViewing ? badge.color : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Play size={12} color={isViewing ? '#fff' : theme.textMuted} fill={isViewing ? '#fff' : 'none'} />
                          </div>
                        </div>
                      </button>

                      {/* Expanded clip preview */}
                      {isViewing && (
                        <div style={{
                          margin: '4px 0 8px', borderRadius: 10, overflow: 'hidden',
                          background: '#000', position: 'relative',
                          height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <Play size={36} color="rgba(255,255,255,0.5)" style={{ marginBottom: 8 }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                              {badge.emoji} {player?.firstName} {player?.lastName} — {badge.label}
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                              {session?.date} · {Math.floor(h.timestampSeconds / 60)}&apos; · {h.durationSeconds}s clip
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {!result && !isGenerating && history.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Recent requests
            </div>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setResult(h)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: theme.historyBg, border: `1px solid ${theme.historyBorder}`,
                  cursor: 'pointer', marginBottom: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.clipHoverBg }}
                onMouseLeave={e => { e.currentTarget.style.background = theme.historyBg }}
              >
                <Clock size={14} color={theme.textMuted} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.query}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>
                    {h.highlights.length} clips · {h.generatedAt}
                  </div>
                </div>
                <ChevronRight size={14} color={theme.textMuted} />
              </button>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }} />
    </div>
  )
}
