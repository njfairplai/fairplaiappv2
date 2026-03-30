'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Check } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { COLORS } from '@/lib/constants'
import { players, rosters, squadScores, playerKeyMetrics, playerSeasonStats, playerRadarData } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import type { Player } from '@/lib/types'

// ─── Roster-to-player mapping ─────────────────────────────
const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

// ─── Helpers ──────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 75) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}

function getPositionColor(position: string): string {
  if (position === 'GK') return '#D97706'
  if (['CB', 'LB', 'RB'].includes(position)) return '#059669'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return COLORS.primary
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return '#DC2626'
  return '#64748B'
}

function getStrainColor(strain: 'low' | 'moderate' | 'high'): string {
  if (strain === 'low') return COLORS.success
  if (strain === 'moderate') return COLORS.warning
  return COLORS.error
}

function getStrainLabel(strain: 'low' | 'moderate' | 'high'): string {
  return strain.charAt(0).toUpperCase() + strain.slice(1)
}

// ─── Player color palette for bars ────────────────────────
const PLAYER_COLORS = ['#4A4AFF', '#E74C3C', '#27AE60', '#F39C12']

// ─── Component ────────────────────────────────────────────
export default function ComparePlayersPage() {
  const router = useRouter()
  const { selectedRosterId } = useTeam()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalSearch, setModalSearch] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const selectedRoster = rosters.find(r => r.id === (selectedRosterId === 'all' ? rosters[0]?.id : selectedRosterId)) || rosters[0]

  const rosterPlayers = useMemo(() => {
    if (selectedRosterId === 'all') {
      const allIds = Object.values(rosterPlayerMap).flat()
      return players.filter(p => allIds.includes(p.id))
    }
    const ids = rosterPlayerMap[selectedRosterId] || []
    return players.filter(p => ids.includes(p.id))
  }, [selectedRosterId])

  const selectedPlayers = useMemo(
    () => selectedIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[],
    [selectedIds],
  )

  const availablePlayers = useMemo(
    () => rosterPlayers.filter(p => !selectedIds.includes(p.id)),
    [rosterPlayers, selectedIds],
  )

  const filteredAvailable = useMemo(() => {
    if (!modalSearch.trim()) return availablePlayers
    const q = modalSearch.toLowerCase()
    return availablePlayers.filter(
      p =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.position[0]?.toLowerCase().includes(q),
    )
  }, [availablePlayers, modalSearch])

  // ─── Collect all unique stat labels across selected players ──
  const allStatLabels = useMemo(() => {
    const labelsSet = new Set<string>()
    for (const p of selectedPlayers) {
      const ps = playerSeasonStats.find(s => s.playerId === p.id)
      if (ps) ps.stats.forEach(s => labelsSet.add(s.label))
    }
    return Array.from(labelsSet)
  }, [selectedPlayers])

  // ─── Radar categories (fixed order) ─────────────────────
  const radarCategories = ['Physical', 'Positional', 'Passing', 'Dribbling', 'Control', 'Defending']

  // ─── Handlers ───────────────────────────────────────────
  const addPlayer = useCallback(
    (id: string) => {
      if (selectedIds.length >= 4) return
      setSelectedIds(prev => [...prev, id])
      if (selectedIds.length >= 3) setShowModal(false)
    },
    [selectedIds],
  )

  const removePlayer = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(pid => pid !== id))
  }, [])

  const openModal = useCallback(() => {
    setModalSearch('')
    setShowModal(true)
  }, [])

  // Close modal on outside click
  useEffect(() => {
    if (!showModal) return
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showModal])

  // ─── Pre-select first two players if none selected ──────
  useEffect(() => {
    if (selectedIds.length === 0 && rosterPlayers.length >= 2) {
      setSelectedIds([rosterPlayers[0].id, rosterPlayers[1].id])
    }
  }, [rosterPlayers]) // eslint-disable-line react-hooks/exhaustive-deps

  const canCompare = selectedPlayers.length >= 2
  const colCount = selectedPlayers.length

  // ─── Styles ─────────────────────────────────────────────
  const styles: Record<string, React.CSSProperties> = {
    page: {
      background: '#F8F9FC',
      minHeight: '100vh',
      paddingBottom: 40,
    },
    header: {
      background: '#0A0E1A',
      padding: '48px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      flexShrink: 0,
    },
    title: {
      margin: 0,
      fontSize: 24,
      fontWeight: 800,
      color: '#FFFFFF',
    },
    subtitle: {
      margin: '2px 0 0 36px',
      fontSize: 13,
      color: 'rgba(255,255,255,0.5)',
    },
    selectionBar: {
      padding: '16px 20px',
      background: '#FFFFFF',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      gap: 8,
    },
    pill: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#F0F0FF',
      borderRadius: 24,
      padding: '6px 12px 6px 6px',
      fontSize: 13,
      fontWeight: 600,
      color: COLORS.navy,
      border: 'none',
      cursor: 'default',
      transition: 'background 0.15s',
    },
    pillRemove: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      borderRadius: '50%',
      color: COLORS.muted,
      transition: 'color 0.15s',
    },
    addBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: COLORS.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 24,
      padding: '8px 16px 8px 10px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'opacity 0.15s',
    },
    addBtnDisabled: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: COLORS.border,
      color: COLORS.muted,
      border: 'none',
      borderRadius: 24,
      padding: '8px 16px 8px 10px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'not-allowed',
    },
    // Comparison table
    tableWrap: {
      padding: '20px 16px',
      overflowX: 'auto' as const,
    },
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: COLORS.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      marginBottom: 12,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: colCount ? `repeat(${colCount}, 1fr)` : 'repeat(2, 1fr)',
      gap: 12,
    },
    card: {
      background: '#FFFFFF',
      borderRadius: 14,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: 8,
    },
    playerName: {
      fontSize: 14,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: 'center' as const,
      lineHeight: 1.2,
    },
    positionBadge: {
      fontSize: 10,
      fontWeight: 700,
      color: '#FFFFFF',
      borderRadius: 12,
      padding: '2px 8px',
      display: 'inline-block',
    },
    jerseyNum: {
      fontSize: 11,
      fontWeight: 600,
      color: COLORS.muted,
    },
    compositeScore: {
      fontSize: 36,
      fontWeight: 800,
      lineHeight: 1,
    },
    avgLabel: {
      fontSize: 11,
      color: COLORS.muted,
    },
    metricRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid #F3F4F6',
      width: '100%',
    },
    metricLabel: {
      fontSize: 12,
      color: COLORS.muted,
    },
    metricVal: {
      fontSize: 14,
      fontWeight: 700,
    },
    // Season stats
    statRow: {
      display: 'grid',
      gap: 12,
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #F3F4F6',
    },
    statLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: COLORS.navy,
      minWidth: 100,
    },
    statValue: {
      fontSize: 13,
      fontWeight: 700,
      color: COLORS.navy,
      textAlign: 'center' as const,
    },
    statEmpty: {
      fontSize: 12,
      color: '#D1D5DB',
      textAlign: 'center' as const,
    },
    // Radar bar row
    barRow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
      padding: '6px 0',
      borderBottom: '1px solid #F3F4F6',
    },
    barCategoryLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: COLORS.navy,
      marginBottom: 2,
    },
    barTrack: {
      height: 10,
      background: '#F3F4F6',
      borderRadius: 5,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    },
    barPlayerRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    barPlayerDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
    },
    barPlayerName: {
      fontSize: 11,
      color: COLORS.muted,
      width: 60,
      flexShrink: 0,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      whiteSpace: 'nowrap' as const,
    },
    barContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    barScore: {
      fontSize: 11,
      fontWeight: 700,
      width: 24,
      textAlign: 'right' as const,
    },
    // Modal
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    },
    modal: {
      background: '#FFFFFF',
      borderRadius: '20px 20px 0 0',
      width: '100%',
      maxWidth: 480,
      maxHeight: '70vh',
      display: 'flex',
      flexDirection: 'column' as const,
      animation: 'slideUp 0.25s ease',
    },
    modalHeader: {
      padding: '20px 20px 12px',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: 700,
      color: COLORS.navy,
      margin: 0,
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      color: COLORS.muted,
      display: 'flex',
      alignItems: 'center',
    },
    modalSearch: {
      margin: '12px 20px 0',
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${COLORS.border}`,
      fontSize: 14,
      outline: 'none',
      width: 'calc(100% - 40px)',
      color: COLORS.navy,
    },
    modalList: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '8px 0',
    },
    modalRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 20px',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      width: '100%',
      textAlign: 'left' as const,
      transition: 'background 0.12s',
    },
    modalRowInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
    },
    modalRowName: {
      fontSize: 14,
      fontWeight: 600,
      color: COLORS.navy,
    },
    modalRowPos: {
      fontSize: 11,
      fontWeight: 700,
      color: '#FFFFFF',
      borderRadius: 10,
      padding: '1px 7px',
      display: 'inline-block',
      width: 'fit-content',
    },
    modalAddBtn: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: COLORS.primary,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'transform 0.12s',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: COLORS.muted,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: COLORS.navy,
      marginBottom: 8,
    },
    emptyDesc: {
      fontSize: 13,
      color: COLORS.muted,
      lineHeight: 1.5,
    },
  }

  return (
    <div style={styles.page}>
      {/* Keyframes for modal animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .compare-modal-row:hover { background: #F8F9FC !important; }
        .compare-pill-remove:hover { color: ${COLORS.error} !important; }
        .compare-add-btn:hover { opacity: 0.9; }
        .compare-modal-add:active { transform: scale(0.92); }
      ` }} />

      {/* ─── HEADER ────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button
            style={styles.backBtn}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft size={22} color="#FFFFFF" />
          </button>
          <h1 style={styles.title}>Compare Players</h1>
        </div>
        <p style={styles.subtitle}>{selectedRoster.name}</p>
      </div>

      {/* ─── PLAYER SELECTION BAR ──────────────────────────── */}
      <div style={styles.selectionBar}>
        {selectedPlayers.map((p, idx) => (
          <div key={p.id} style={{
            ...styles.pill,
            borderLeft: `3px solid ${PLAYER_COLORS[idx]}`,
          }}>
            <PlayerAvatar player={p} size="sm" />
            <span>{p.firstName} {p.lastName[0]}.</span>
            <button
              className="compare-pill-remove"
              style={styles.pillRemove}
              onClick={() => removePlayer(p.id)}
              aria-label={`Remove ${p.firstName}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {selectedIds.length < 4 && (
          <button
            className="compare-add-btn"
            style={availablePlayers.length > 0 ? styles.addBtn : styles.addBtnDisabled}
            onClick={availablePlayers.length > 0 ? openModal : undefined}
            disabled={availablePlayers.length === 0}
          >
            <Plus size={16} />
            Add Player
          </button>
        )}

        {selectedIds.length < 2 && (
          <span style={{ fontSize: 12, color: COLORS.muted, marginLeft: 4 }}>
            Select at least 2 players to compare
          </span>
        )}
      </div>

      {/* ─── COMPARISON CONTENT ────────────────────────────── */}
      {!canCompare ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>Select players to compare</div>
          <div style={styles.emptyDesc}>
            Choose 2 to 4 players from your squad to see a side-by-side comparison
            of their scores, metrics, season stats, and skill profiles.
          </div>
        </div>
      ) : (
        <div style={styles.tableWrap}>

          {/* ─── Row 1: Player Identity ─────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Players</div>
            <div style={styles.grid}>
              {selectedPlayers.map((p, idx) => {
                const pos = p.position[0] || 'CM'
                return (
                  <div key={p.id} style={{
                    ...styles.card,
                    borderTop: `3px solid ${PLAYER_COLORS[idx]}`,
                  }}>
                    <PlayerAvatar player={p} size="lg" showJersey />
                    <div style={styles.playerName}>
                      {p.firstName} {p.lastName}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        ...styles.positionBadge,
                        background: getPositionColor(pos),
                      }}>
                        {pos}
                      </span>
                      <span style={styles.jerseyNum}>#{p.jerseyNumber}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── Row 2: Composite Score ─────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Composite Score</div>
            <div style={styles.grid}>
              {selectedPlayers.map((p) => {
                const score = squadScores[p.id]
                const composite = score?.compositeScore ?? 0
                const avg = score?.avgScore ?? 0
                return (
                  <div key={p.id} style={{
                    ...styles.card,
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      ...styles.compositeScore,
                      color: getScoreColor(composite),
                    }}>
                      {composite}
                    </div>
                    <div style={styles.avgLabel}>Season Avg: {avg}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── Row 3: Key Metrics ─────────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Key Metrics</div>
            <div style={styles.grid}>
              {selectedPlayers.map((p) => {
                const km = playerKeyMetrics[p.id]
                if (!km) {
                  return (
                    <div key={p.id} style={styles.card}>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>No data</div>
                    </div>
                  )
                }
                return (
                  <div key={p.id} style={styles.card}>
                    {/* Technical */}
                    <div style={styles.metricRow}>
                      <span style={styles.metricLabel}>Technical</span>
                      <span style={{ ...styles.metricVal, color: getScoreColor(km.technical) }}>
                        {km.technical}
                      </span>
                    </div>
                    {/* Temperament */}
                    <div style={styles.metricRow}>
                      <span style={styles.metricLabel}>Temperament</span>
                      <span style={{ ...styles.metricVal, color: getScoreColor(km.temperament) }}>
                        {km.temperament}
                      </span>
                    </div>
                    {/* Strain */}
                    <div style={{ ...styles.metricRow, borderBottom: 'none' }}>
                      <span style={styles.metricLabel}>Strain</span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: getStrainColor(km.strain),
                        background: `${getStrainColor(km.strain)}18`,
                        padding: '2px 10px',
                        borderRadius: 12,
                      }}>
                        {getStrainLabel(km.strain)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── Row 4: Season Stats ────────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Season Stats</div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              {allStatLabels.map((label, i) => (
                <div
                  key={label}
                  style={{
                    ...styles.statRow,
                    gridTemplateColumns: `120px repeat(${colCount}, 1fr)`,
                    borderBottom: i < allStatLabels.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  <span style={styles.statLabel}>{label}</span>
                  {selectedPlayers.map((p) => {
                    const ps = playerSeasonStats.find(s => s.playerId === p.id)
                    const stat = ps?.stats.find(s => s.label === label)
                    return (
                      <span
                        key={p.id}
                        style={stat ? styles.statValue : styles.statEmpty}
                      >
                        {stat?.value ?? '--'}
                      </span>
                    )
                  })}
                </div>
              ))}
              {allStatLabels.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: COLORS.muted, fontSize: 13 }}>
                  No season stats available
                </div>
              )}
            </div>
          </div>

          {/* ─── Row 5: Skill Profile Bars (Radar alt) ──── */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Skill Profile</div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              {/* Legend */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap' as const,
                gap: 12,
                marginBottom: 16,
              }}>
                {selectedPlayers.map((p, idx) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ ...styles.barPlayerDot, background: PLAYER_COLORS[idx] }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>
                      {p.firstName} {p.lastName[0]}.
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#D1D5DB',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: COLORS.muted }}>Squad Avg</span>
                </div>
              </div>

              {radarCategories.map((category, ci) => (
                <div
                  key={category}
                  style={{
                    ...styles.barRow,
                    borderBottom: ci < radarCategories.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  <div style={styles.barCategoryLabel}>{category}</div>
                  {selectedPlayers.map((p, idx) => {
                    const rd = playerRadarData[p.id]
                    const cat = rd?.find(r => r.category === category)
                    const score = cat?.score ?? 0
                    const avg = cat?.avg ?? 0
                    return (
                      <div key={p.id} style={{ marginBottom: 3 }}>
                        <div style={styles.barPlayerRow}>
                          <span style={styles.barPlayerName}>{p.firstName}</span>
                          <div style={styles.barContainer}>
                            <div style={{
                              ...styles.barTrack,
                              flex: 1,
                            }}>
                              {/* Average marker */}
                              <div style={{
                                position: 'absolute',
                                left: `${avg}%`,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                background: '#D1D5DB',
                                zIndex: 2,
                              }} />
                              {/* Player score bar */}
                              <div style={{
                                height: '100%',
                                width: `${score}%`,
                                background: PLAYER_COLORS[idx],
                                borderRadius: 5,
                                transition: 'width 0.5s ease',
                                position: 'relative',
                                zIndex: 1,
                              }} />
                            </div>
                            <span style={{
                              ...styles.barScore,
                              color: PLAYER_COLORS[idx],
                            }}>
                              {score}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD PLAYER MODAL ──────────────────────────────── */}
      {showModal && (
        <div style={styles.overlay}>
          <div ref={modalRef} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Player</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <input
              style={styles.modalSearch}
              placeholder="Search by name or position..."
              value={modalSearch}
              onChange={e => setModalSearch(e.target.value)}
              autoFocus
            />

            <div style={styles.modalList}>
              {filteredAvailable.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 20px',
                  color: COLORS.muted,
                  fontSize: 13,
                }}>
                  {availablePlayers.length === 0
                    ? 'All squad players have been selected'
                    : 'No players match your search'}
                </div>
              ) : (
                filteredAvailable.map(p => {
                  const pos = p.position[0] || 'CM'
                  return (
                    <button
                      key={p.id}
                      className="compare-modal-row"
                      style={styles.modalRow}
                      onClick={() => addPlayer(p.id)}
                    >
                      <PlayerAvatar player={p} size="md" />
                      <div style={styles.modalRowInfo}>
                        <span style={styles.modalRowName}>
                          {p.firstName} {p.lastName}
                        </span>
                        <span style={{
                          ...styles.modalRowPos,
                          background: getPositionColor(pos),
                        }}>
                          {pos}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginRight: 8 }}>
                        #{p.jerseyNumber}
                      </div>
                      <div
                        className="compare-modal-add"
                        style={styles.modalAddBtn}
                      >
                        <Check size={16} color="#FFFFFF" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
