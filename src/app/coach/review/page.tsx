'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { pendingReviewItems, players } from '@/lib/mockData'
import type { PendingReviewItem } from '@/lib/types'
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const router = useRouter()
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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
        {/* Page Header */}
        <div style={{ background: '#0A0E1A', padding: '48px 20px 20px' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none',
              border: 'none', cursor: 'pointer', color: '#4A4AFF', fontSize: 14,
              fontWeight: 600, padding: 0, marginBottom: 8,
            }}
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>Session Review</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>All caught up</div>
        </div>

        {/* Empty State Body */}
        <div style={{
          background: '#F8F9FC',
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '40px 32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            margin: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}>
            {/* Checkmark circle */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 16 }}>All caught up</div>
            <div style={{ fontSize: 15, color: '#64748B', marginTop: 8, textAlign: 'center' }}>
              Nothing needs your review right now.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PENDING STATE ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
      {/* Page Header */}
      <div style={{ background: '#0A0E1A', padding: '48px 20px 20px' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, background: 'none',
            border: 'none', cursor: 'pointer', color: '#4A4AFF', fontSize: 14,
            fontWeight: 600, padding: 0, marginBottom: 8,
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>Session Review</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
          {items.length} item{items.length !== 1 ? 's' : ''} need{items.length === 1 ? 's' : ''} your input
        </div>
      </div>

      {/* Items List */}
      <div style={{ background: '#F8F9FC', flex: 1, padding: 16 }}>
        {items.map(item => {
          const isExpanded = expandedId === item.id

          return (
            <div key={item.id} style={{
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              {/* CARD HEADER */}
              <div
                onClick={() => handleToggleExpand(item.id)}
                style={{
                  padding: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Type Badge Pill */}
                <div style={{
                  background: item.type === 'classify' ? '#FFFBEB' : '#EFF6FF',
                  color: item.type === 'classify' ? '#D97706' : '#4A4AFF',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                }}>
                  {item.type === 'classify' ? 'Classify Session' : 'Tag Players'}
                </div>

                {/* Session Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.sessionLabel}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {item.type === 'classify'
                      ? `${item.segments?.filter(s => s.confidence < 85 || !segmentConfirmations[s.id]).length ?? 0} segment${(item.segments?.filter(s => s.confidence < 85 || !segmentConfirmations[s.id]).length ?? 0) !== 1 ? 's' : ''} needs confirmation`
                      : `${item.playersToTag?.length ?? 0} player${(item.playersToTag?.length ?? 0) !== 1 ? 's' : ''} need identity confirmation`
                    }
                  </div>
                </div>

                {/* Expand chevron — rotates */}
                <div style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9DA2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* EXPANDED: CLASSIFY SESSION */}
              <AnimatePresence>
              {isExpanded && item.type === 'classify' && item.segments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 16px' }}>
                    {/* Timeline Bar */}
                    {(() => {
                      const totalDuration = Math.max(...item.segments.map(s => s.endMin)) - Math.min(...item.segments.map(s => s.startMin))
                      return (
                        <div style={{ width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'row', marginBottom: 8 }}>
                          {item.segments.map(seg => {
                            const widthPct = ((seg.endMin - seg.startMin) / totalDuration) * 100
                            const isConfirmed = !!segmentConfirmations[seg.id]
                            const confirmedClass = segmentConfirmations[seg.id]

                            let bgStyle: React.CSSProperties = {}

                            if (isConfirmed) {
                              const cls = confirmedClass
                              bgStyle.background = cls === 'drill' || cls === 'Drill' ? '#10B981' : '#4A4AFF'
                            } else if (seg.confidence >= 85) {
                              bgStyle.background = seg.aiClassification === 'drill' ? '#10B981' : '#4A4AFF'
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
                  </div>

                  {/* Segment Rows */}
                  {item.segments.map((seg, idx) => {
                    const isConfirmed = !!segmentConfirmations[seg.id]
                    const confirmedClass = segmentConfirmations[seg.id]

                    const formatTime = (min: number) => {
                      const h = Math.floor(min / 60)
                      const m = min % 60
                      return `${h}:${m.toString().padStart(2, '0')}`
                    }

                    return (
                      <div key={seg.id} style={{
                        padding: '14px 16px',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        {/* Left */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{seg.label}</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            {formatTime(seg.startMin)} &ndash; {formatTime(seg.endMin)} &middot; AI: {seg.confidence}% confident
                          </div>
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {isConfirmed ? (
                            <div style={{
                              background: confirmedClass === 'Drill' || confirmedClass === 'drill' ? '#ECFDF5' : confirmedClass === 'Tr. Match' ? '#FFFBEB' : '#EFF6FF',
                              color: confirmedClass === 'Drill' || confirmedClass === 'drill' ? '#059669' : confirmedClass === 'Tr. Match' ? '#D97706' : '#4A4AFF',
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '5px 12px',
                              borderRadius: 20,
                            }}>
                              Confirmed &#10003;
                            </div>
                          ) : seg.confidence >= 85 ? (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleConfirmSegment(seg.id, seg.aiClassification) }}
                                style={{
                                  background: '#ECFDF5',
                                  color: '#059669',
                                  padding: '5px 12px',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                &#10003; Confirm
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation() }}
                                style={{
                                  background: 'transparent',
                                  color: '#64748B',
                                  padding: '5px 12px',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: '1px solid #E2E8F0',
                                  cursor: 'pointer',
                                }}
                              >
                                Change
                              </button>
                            </>
                          ) : (
                            <>
                              {[
                                { label: 'Drill', bg: '#ECFDF5', color: '#059669' },
                                { label: 'Tr. Match', bg: '#FFFBEB', color: '#D97706' },
                                { label: 'Match', bg: '#EFF6FF', color: '#4A4AFF' },
                              ].map(opt => (
                                <button
                                  key={opt.label}
                                  onClick={(e) => { e.stopPropagation(); handleConfirmSegment(seg.id, opt.label) }}
                                  style={{
                                    background: opt.bg,
                                    border: 'none',
                                    color: opt.color,
                                    padding: '5px 12px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 600,
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
                  <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
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
                            background: isSuccess ? '#10B981' : allConfirmed ? '#4A4AFF' : '#E2E8F0',
                            color: isSuccess ? '#fff' : allConfirmed ? '#fff' : '#94A3B8',
                            transition: 'background 0.3s, color 0.3s',
                          }}
                        >
                          {isSuccess ? 'Submitted \u2713' : 'Confirm All & Submit'}
                        </button>
                      )
                    })()}

                    <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', marginTop: 8 }}>
                      High-confidence sessions are classified automatically. You only see this when we're genuinely uncertain.
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>

              {/* EXPANDED: TAG PLAYERS */}
              <AnimatePresence>
              {isExpanded && item.type === 'tag' && item.playersToTag && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: 16 }}>
                    {/* Info Card */}
                    <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, color: '#1E40AF' }}>
                        &#x1F535; Once confirmed, players are auto-recognised in all future sessions.
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
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                            {confirmed} of {total} players confirmed
                          </div>
                          <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, marginTop: 6, marginBottom: 16 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#4A4AFF', borderRadius: 4, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Pitch Frame */}
                    <div style={{
                      background: '#0D1A0D',
                      borderRadius: 12,
                      padding: 16,
                      aspectRatio: '16/9',
                      maxHeight: 200,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Pitch lines at 5% opacity */}
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
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
                          border: '2px solid #10B981',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{box.num}</span>
                        </div>
                      ))}

                      {/* Unconfirmed orange boxes */}
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
                                border: `2px solid ${isAssigned ? '#10B981' : '#F59E0B'}`,
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
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: 8,
                        marginTop: 8,
                        maxHeight: 160,
                        overflowY: 'auto',
                      }}>
                        {players
                          .filter(p => p.academyId === 'academy_001' && ['player_001','player_002','player_003','player_004','player_005','player_006','player_007','player_008'].includes(p.id))
                          .map(p => {
                            const color = positionColors[p.position[0]] || '#64748B'
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
                                onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FC')}
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
                                <div style={{ fontSize: 13, color: '#0F172A' }}>{p.firstName} {p.lastName}</div>
                                <div style={{ fontSize: 12, color: '#64748B', marginLeft: 'auto' }}>#{p.jerseyNumber}</div>
                              </div>
                            )
                          })}
                      </div>
                    )}

                    {/* Player list rows */}
                    <div style={{ marginTop: 0 }}>
                      {item.playersToTag!
                        .filter(pt => !tagAssignments[pt.boundingBoxId])
                        .map(pt => (
                          <div key={pt.boundingBoxId} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderTop: '1px solid #F1F5F9',
                          }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', marginRight: 10 }} />
                            <div style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>
                              Jersey #{pt.jerseyNumber || '?'}
                            </div>
                            <div
                              onClick={() => setActiveBoxId(pt.boundingBoxId)}
                              style={{ fontSize: 13, color: '#4A4AFF', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Assign &rarr;
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Skip link */}
                    <div
                      onClick={() => handleSkipTag(item.id)}
                      style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 16, cursor: 'pointer' }}
                    >
                      Skip for now
                    </div>

                    {/* Confirm button */}
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
                            background: isSuccess ? '#10B981' : canSubmit ? '#4A4AFF' : '#E2E8F0',
                            color: isSuccess ? '#fff' : canSubmit ? '#fff' : '#94A3B8',
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

                    <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', marginTop: 8 }}>
                      Skipping is fine — analysis will run using jersey numbers only.
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
