'use client'

import { useState } from 'react'
import { pendingReviewItems, players } from '@/lib/mockData'
import type { PendingReviewItem } from '@/lib/types'
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react'

const positionColors: Record<string, string> = {
  GK: '#F39C12',
  CB: '#3498DB',
  LB: '#3498DB',
  RB: '#3498DB',
  CDM: '#9B59B6',
  CM: '#27AE60',
  AM: '#27AE60',
  LW: '#E74C3C',
  RW: '#E74C3C',
  CF: '#E74C3C',
  ST: '#E74C3C',
  SS: '#E74C3C',
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`
}

export default function ReviewPage() {
  const [items, setItems] = useState<PendingReviewItem[]>([...pendingReviewItems])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [segmentConfirmations, setSegmentConfirmations] = useState<Record<string, string>>({})
  const [tagAssignments, setTagAssignments] = useState<Record<string, string>>({})
  const [successItemId, setSuccessItemId] = useState<string | null>(null)
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null)

  const handleToggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
    setActiveBoxId(null)
  }

  const handleConfirmSegment = (segId: string, classification: string) => {
    setSegmentConfirmations(prev => ({ ...prev, [segId]: classification }))
  }

  const handleAssignPlayer = (boxId: string, playerId: string) => {
    setTagAssignments(prev => ({ ...prev, [boxId]: playerId }))
    setActiveBoxId(null)
  }

  const handleSubmitClassify = (item: PendingReviewItem) => {
    setSuccessItemId(item.id)
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id))
      setExpandedId(null)
      setSuccessItemId(null)
      setSegmentConfirmations({})
    }, 1200)
  }

  const handleSubmitTag = (item: PendingReviewItem) => {
    setSuccessItemId(item.id)
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id))
      setExpandedId(null)
      setSuccessItemId(null)
      setTagAssignments({})
      setActiveBoxId(null)
    }, 1200)
  }

  const handleSkipTag = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId))
    setExpandedId(null)
    setTagAssignments({})
    setActiveBoxId(null)
  }

  // ── EMPTY STATE ──
  if (items.length === 0) {
    return (
      <div style={{ padding: 16, background: '#F5F6FC', minHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={56} color="#27AE60" />
        <div style={{ fontWeight: 700, fontSize: 22, color: '#1B1650', marginTop: 16 }}>All caught up</div>
        <div style={{ fontSize: 14, color: '#6E7180', textAlign: 'center', maxWidth: 280, marginTop: 8 }}>
          Nothing needs your review right now. We'll let you know when something comes up.
        </div>
      </div>
    )
  }

  // ── PENDING STATE ──
  return (
    <div style={{ padding: 16, background: '#F5F6FC', minHeight: 'calc(100vh - 160px)' }}>
      <div style={{ fontWeight: 700, fontSize: 24, color: '#1B1650' }}>Needs Your Input</div>
      <div style={{ fontSize: 14, color: '#6E7180', marginTop: 4, marginBottom: 20 }}>
        {items.length} item{items.length !== 1 ? 's' : ''} waiting
      </div>

      {items.map(item => {
        const isExpanded = expandedId === item.id

        return (
          <div key={item.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 14, overflow: 'hidden' }}>
            {/* CARD HEADER */}
            <div
              onClick={() => handleToggleExpand(item.id)}
              style={{
                padding: 16,
                borderBottom: isExpanded ? '1px solid #F5F6FC' : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Type Badge */}
              <div style={{
                background: item.type === 'classify' ? '#FEF3C7' : '#EFF6FF',
                color: item.type === 'classify' ? '#92400E' : '#1E40AF',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 10,
                whiteSpace: 'nowrap',
              }}>
                {item.type === 'classify' ? 'Classify Session' : 'Tag Players'}
              </div>

              {/* Session Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1B1650' }}>{item.sessionLabel}</div>
                <div style={{ fontSize: 13, color: '#6E7180', marginTop: 2 }}>
                  {item.type === 'classify'
                    ? `${item.segments?.filter(s => s.confidence < 85 || !segmentConfirmations[s.id]).length ?? 0} segment${(item.segments?.filter(s => s.confidence < 85 || !segmentConfirmations[s.id]).length ?? 0) !== 1 ? 's' : ''} needs confirmation`
                    : `${item.playersToTag?.length ?? 0} player${(item.playersToTag?.length ?? 0) !== 1 ? 's' : ''} need identity confirmation`
                  }
                </div>
              </div>

              {/* Chevron */}
              {isExpanded
                ? <ChevronUp size={18} color="#9DA2B3" />
                : <ChevronDown size={18} color="#9DA2B3" />
              }
            </div>

            {/* EXPANDED: CLASSIFY SESSION */}
            {isExpanded && item.type === 'classify' && item.segments && (
              <div style={{ overflow: 'hidden', maxHeight: 2000, transition: 'max-height 0.3s ease' }}>
                <div style={{ padding: 16 }}>
                  {/* Timeline Bar */}
                  {(() => {
                    const totalDuration = Math.max(...item.segments.map(s => s.endMin)) - Math.min(...item.segments.map(s => s.startMin))
                    return (
                      <div style={{ width: '100%', height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'row', marginBottom: 16 }}>
                        {item.segments.map(seg => {
                          const widthPct = ((seg.endMin - seg.startMin) / totalDuration) * 100
                          const isConfirmed = !!segmentConfirmations[seg.id]
                          const confirmedClass = segmentConfirmations[seg.id]

                          let bgStyle: React.CSSProperties = {}

                          if (isConfirmed) {
                            const cls = confirmedClass
                            bgStyle.background = cls === 'drill' || cls === 'Drill' ? '#27AE60' : '#4A4AFF'
                          } else if (seg.confidence >= 85) {
                            bgStyle.background = seg.aiClassification === 'drill' ? 'rgba(39,174,96,0.5)' : 'rgba(74,74,255,0.5)'
                          } else {
                            bgStyle.background = 'repeating-linear-gradient(45deg, #9DA2B3 0px, #9DA2B3 4px, #BCBFCC 4px, #BCBFCC 8px)'
                          }

                          return (
                            <div key={seg.id} style={{ width: `${widthPct}%`, height: '100%', ...bgStyle }} />
                          )
                        })}
                      </div>
                    )
                  })()}

                  {/* Segment Cards */}
                  {item.segments.map((seg, idx) => {
                    const isConfirmed = !!segmentConfirmations[seg.id]
                    const confirmedClass = segmentConfirmations[seg.id]
                    const isLast = idx === (item.segments?.length ?? 0) - 1

                    const formatTime = (min: number) => {
                      const h = Math.floor(min / 60)
                      const m = min % 60
                      return `${h}:${m.toString().padStart(2, '0')}`
                    }

                    return (
                      <div key={seg.id} style={{ padding: '12px 0', borderBottom: isLast ? 'none' : '1px solid #F5F6FC', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        {/* Left */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1B1650' }}>{seg.label}</div>
                          <div style={{ fontSize: 12, color: '#9DA2B3' }}>
                            {formatTime(seg.startMin)} &ndash; {formatTime(seg.endMin)} &middot; AI: {seg.confidence}% confident
                          </div>
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isConfirmed ? (
                            <div style={{
                              background: confirmedClass === 'Drill' || confirmedClass === 'drill' ? '#27AE60' : confirmedClass === 'Tr. Match' ? '#F39C12' : '#4A4AFF',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 10,
                            }}>
                              Confirmed &#10003;
                            </div>
                          ) : seg.confidence >= 85 ? (
                            <>
                              <div style={{
                                background: seg.aiClassification === 'drill' ? '#DCFCE7' : '#EFF6FF',
                                color: seg.aiClassification === 'drill' ? '#166534' : '#1E40AF',
                                fontSize: 11,
                                padding: '3px 10px',
                                borderRadius: 10,
                              }}>
                                {seg.aiClassification === 'drill' ? 'Likely Drill' : 'Likely Match'}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleConfirmSegment(seg.id, seg.aiClassification) }}
                                style={{
                                  background: '#27AE60',
                                  color: '#fff',
                                  padding: '6px 14px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                &#10003; Confirm
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{
                                background: '#FEF3C7',
                                color: '#92400E',
                                fontSize: 11,
                                padding: '3px 10px',
                                borderRadius: 10,
                              }}>
                                Uncertain
                              </div>
                              {[
                                { label: 'Drill', color: '#27AE60' },
                                { label: 'Tr. Match', color: '#F39C12' },
                                { label: 'Match', color: '#4A4AFF' },
                              ].map(opt => (
                                <button
                                  key={opt.label}
                                  onClick={(e) => { e.stopPropagation(); handleConfirmSegment(seg.id, opt.label) }}
                                  style={{
                                    background: 'transparent',
                                    border: `1px solid ${opt.color}`,
                                    color: opt.color,
                                    padding: '5px 12px',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Footer */}
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontSize: 12, color: '#9DA2B3' }}>
                      Confirming match segments will use ~38 min of analysis time &middot; Balance: 47 min
                    </div>

                    {(() => {
                      const allConfirmed = item.segments!.every(s => !!segmentConfirmations[s.id])
                      const isSuccess = successItemId === item.id

                      return (
                        <button
                          onClick={() => { if (allConfirmed && !isSuccess) handleSubmitClassify(item) }}
                          disabled={!allConfirmed || isSuccess}
                          style={{
                            width: '100%',
                            height: 48,
                            borderRadius: 10,
                            fontSize: 15,
                            fontWeight: 700,
                            marginTop: 12,
                            border: 'none',
                            cursor: allConfirmed && !isSuccess ? 'pointer' : 'default',
                            background: isSuccess ? '#27AE60' : allConfirmed ? '#4A4AFF' : '#E8EAED',
                            color: isSuccess ? '#fff' : allConfirmed ? '#fff' : '#9DA2B3',
                            transition: 'background 0.3s, color 0.3s',
                          }}
                        >
                          {isSuccess ? 'Submitted \u2713' : 'Confirm All & Submit'}
                        </button>
                      )
                    })()}

                    <div style={{ fontSize: 12, color: '#9DA2B3', fontStyle: 'italic', marginTop: 8 }}>
                      High-confidence sessions are classified automatically. You only see this when we're genuinely uncertain.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EXPANDED: TAG PLAYERS */}
            {isExpanded && item.type === 'tag' && item.playersToTag && (
              <div style={{ overflow: 'hidden', maxHeight: 3000, transition: 'max-height 0.3s ease' }}>
                <div style={{ padding: 16 }}>
                  {/* Intro Note */}
                  <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#1E40AF' }}>
                      Once you confirm a player, they'll be auto-recognised in all future sessions. This is a one-time task per player.
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(() => {
                    const total = item.totalPlayers ?? 16
                    const autoTagged = item.autoTaggedCount ?? 13
                    const assigned = Object.keys(tagAssignments).filter(k => item.playersToTag!.some(p => p.boundingBoxId === k)).length
                    const confirmed = autoTagged + assigned
                    const pct = (confirmed / total) * 100

                    return (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1B1650' }}>
                          {confirmed} of {total} players confirmed
                        </div>
                        <div style={{ width: '100%', height: 8, background: '#E8EAED', borderRadius: 4, marginTop: 6, marginBottom: 16 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#4A4AFF', borderRadius: 4, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Bounding Box Frame */}
                  <div style={{
                    background: '#1B1650',
                    borderRadius: 10,
                    padding: 16,
                    aspectRatio: '16/9',
                    maxHeight: 200,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Faint pitch lines */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
                      {/* Center line */}
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: '#fff' }} />
                      {/* Center circle */}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, border: '1px solid #fff', borderRadius: '50%' }} />
                      {/* Goal boxes */}
                      <div style={{ position: 'absolute', top: '25%', left: 0, width: 40, height: '50%', border: '1px solid #fff', borderLeft: 'none' }} />
                      <div style={{ position: 'absolute', top: '25%', right: 0, width: 40, height: '50%', border: '1px solid #fff', borderRight: 'none' }} />
                      {/* Outer border */}
                      <div style={{ position: 'absolute', inset: 4, border: '1px solid #fff' }} />
                    </div>

                    {/* Confirmed green boxes */}
                    {[
                      { top: '20%', left: '25%', num: 4 },
                      { top: '50%', left: '40%', num: 8 },
                      { top: '30%', left: '60%', num: 3 },
                      { top: '60%', left: '75%', num: 1 },
                      { top: '45%', left: '15%', num: 2 },
                    ].map((box, i) => (
                      <div key={`confirmed-${i}`} style={{
                        position: 'absolute',
                        top: box.top,
                        left: box.left,
                        width: 28,
                        height: 36,
                        border: '2px solid #27AE60',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{box.num}</span>
                      </div>
                    ))}

                    {/* Unconfirmed orange boxes (from playersToTag) */}
                    {(() => {
                      const positions = [
                        { top: '35%', left: '50%' },
                        { top: '55%', left: '30%' },
                        { top: '25%', left: '80%' },
                      ]
                      return item.playersToTag!.map((pt, i) => {
                        const pos = positions[i % positions.length]
                        const isAssigned = !!tagAssignments[pt.boundingBoxId]
                        const isActiveBox = activeBoxId === pt.boundingBoxId

                        return (
                          <div
                            key={pt.boundingBoxId}
                            onClick={(e) => { e.stopPropagation(); if (!isAssigned) setActiveBoxId(isActiveBox ? null : pt.boundingBoxId) }}
                            style={{
                              position: 'absolute',
                              top: pos.top,
                              left: pos.left,
                              width: 28,
                              height: 36,
                              border: `2px solid ${isAssigned ? '#27AE60' : '#F39C12'}`,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isAssigned ? 'default' : 'pointer',
                              opacity: isAssigned ? 1 : 0.85,
                              animation: isAssigned ? 'none' : undefined,
                            }}
                          >
                            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
                              {pt.jerseyNumber || '?'}
                            </span>
                          </div>
                        )
                      })
                    })()}
                  </div>

                  {/* Player Assignment Dropdown */}
                  {activeBoxId && (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #E8EAED',
                      borderRadius: 8,
                      padding: 8,
                      marginTop: 8,
                      maxHeight: 160,
                      overflowY: 'auto',
                    }}>
                      {players
                        .filter(p => p.academyId === 'academy_001' && ['player_001','player_002','player_003','player_004','player_005','player_006','player_007','player_008'].includes(p.id))
                        .map(p => {
                          const color = positionColors[p.position[0]] || '#6E7180'
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleAssignPlayer(activeBoxId, p.id)}
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                padding: 8,
                                cursor: 'pointer',
                                borderRadius: 6,
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#F5F6FC')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                              }}>
                                {getInitials(p.firstName, p.lastName)}
                              </div>
                              <div style={{ fontSize: 13, color: '#1B1650' }}>{p.firstName} {p.lastName}</div>
                              <div style={{ fontSize: 12, color: '#9DA2B3', marginLeft: 'auto' }}>#{p.jerseyNumber}</div>
                            </div>
                          )
                        })}
                    </div>
                  )}

                  {/* Players needing confirmation list */}
                  <div style={{ marginTop: 12 }}>
                    {item.playersToTag!
                      .filter(pt => !tagAssignments[pt.boundingBoxId])
                      .map(pt => (
                        <div key={pt.boundingBoxId} style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid #F5F6FC',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F39C12', marginRight: 8 }} />
                          <div style={{ flex: 1, fontSize: 13, color: '#1B1650' }}>
                            Jersey #{pt.jerseyNumber || '?'}
                          </div>
                          <div
                            onClick={() => setActiveBoxId(pt.boundingBoxId)}
                            style={{ fontSize: 12, color: '#4A4AFF', cursor: 'pointer' }}
                          >
                            Assign player &rarr;
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Footer */}
                  <div
                    onClick={() => handleSkipTag(item.id)}
                    style={{ fontSize: 13, color: '#9DA2B3', textAlign: 'center', marginTop: 12, cursor: 'pointer' }}
                  >
                    Skip for now
                  </div>

                  {(() => {
                    const assigned = Object.keys(tagAssignments).filter(k => item.playersToTag!.some(p => p.boundingBoxId === k)).length
                    const canSubmit = assigned > 0
                    const isSuccess = successItemId === item.id

                    return (
                      <button
                        onClick={() => { if (canSubmit && !isSuccess) handleSubmitTag(item) }}
                        disabled={!canSubmit || isSuccess}
                        style={{
                          width: '100%',
                          height: 48,
                          background: isSuccess ? '#27AE60' : canSubmit ? '#4A4AFF' : '#E8EAED',
                          color: isSuccess ? '#fff' : canSubmit ? '#fff' : '#9DA2B3',
                          borderRadius: 10,
                          border: 'none',
                          fontSize: 15,
                          fontWeight: 700,
                          marginTop: 12,
                          cursor: canSubmit && !isSuccess ? 'pointer' : 'default',
                          transition: 'background 0.3s, color 0.3s',
                        }}
                      >
                        {isSuccess ? 'Submitted \u2713' : 'Confirm & Submit'}
                      </button>
                    )
                  })()}

                  <div style={{ fontSize: 12, color: '#9DA2B3', fontStyle: 'italic', marginTop: 8 }}>
                    Skipping is fine — analysis will run using jersey numbers only.
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
