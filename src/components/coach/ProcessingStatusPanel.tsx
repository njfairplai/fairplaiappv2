'use client'

import { useState, useEffect } from 'react'
import { X, Check, Loader2, Circle, Cpu, Clock } from 'lucide-react'
import { COLORS, RADIUS } from '@/lib/constants'
import { sessions, processingStatuses } from '@/lib/mockData'
import type { ProcessingStageStatus } from '@/lib/types'

interface ProcessingStatusPanelProps {
  open: boolean
  onClose: () => void
  sessionId: string | null
}

const stageIcons: Record<string, string> = {
  nvr_capture: '📹',
  ingestion: '📥',
  calibration: '🎯',
  player_tracking: '🏃',
  ball_tracking: '⚽',
  event_detection: '🔍',
  metric_computation: '📊',
  highlights: '✨',
  composite_score: '🏆',
  delivery: '📤',
}

export default function ProcessingStatusPanel({ open, onClose, sessionId }: ProcessingStatusPanelProps) {
  const [, setTick] = useState(0)

  // Re-render every 3s for "live" feel
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => setTick(t => t + 1), 3000)
    return () => clearInterval(interval)
  }, [open])

  if (!open || !sessionId) return null

  const session = sessions.find(s => s.id === sessionId)
  if (!session) return null

  const procStatus = processingStatuses[session.processingStatusId ?? '']
  if (!procStatus) return null

  const sessionLabel = session.opponent
    ? `vs ${session.opponent}`
    : session.type === 'drill'
    ? 'Training Session'
    : 'Match Session'

  function getStageIcon(stage: ProcessingStageStatus) {
    if (stage.status === 'complete') {
      return (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10B98120', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Check size={14} color="#10B981" strokeWidth={3} />
        </div>
      )
    }
    if (stage.status === 'in_progress') {
      return (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'pulseGlow 2s ease-in-out infinite' }}>
          <Loader2 size={14} color={COLORS.primary} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )
    }
    return (
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Circle size={8} color="#D1D5DB" fill="#D1D5DB" />
      </div>
    )
  }

  const completedCount = procStatus.stages.filter(s => s.status === 'complete').length
  const totalCount = procStatus.stages.length

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,74,255,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(74,74,255,0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: '#fff', zIndex: 200,
        boxShadow: '0 8px 32px rgba(27,22,80,0.25)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Cpu size={16} color={COLORS.primary} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Processing Status</h2>
            </div>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>{sessionLabel} · {session.date}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={COLORS.muted} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>Overall Progress</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.primary }}>{procStatus.progress}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#F3F4F6', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${procStatus.progress}%`,
                background: 'linear-gradient(90deg, #4A4AFF 0%, #10B981 100%)',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.muted }}>{completedCount}/{totalCount} stages complete</span>
            </div>
          </div>

          {/* ETA card */}
          <div style={{
            background: `${COLORS.primary}08`, borderRadius: RADIUS.card, padding: '12px 16px',
            border: `1px solid ${COLORS.primary}20`, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Clock size={16} color={COLORS.primary} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, margin: 0 }}>{procStatus.eta}</p>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Started at {new Date(procStatus.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Pipeline stages */}
          <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Pipeline Stages</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {procStatus.stages.map((stage, idx) => (
              <div key={stage.name}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                }}>
                  {/* Connector line */}
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {getStageIcon(stage)}
                    {idx < procStatus.stages.length - 1 && (
                      <div style={{
                        position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
                        width: 2, height: 20,
                        background: stage.status === 'complete' ? '#10B981' : '#E5E7EB',
                      }} />
                    )}
                  </div>

                  {/* Stage info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{stageIcons[stage.name]}</span>
                      <span style={{
                        fontSize: 14, fontWeight: stage.status === 'in_progress' ? 700 : 500,
                        color: stage.status === 'pending' ? COLORS.muted : COLORS.navy,
                      }}>
                        {stage.label}
                      </span>
                      {stage.status === 'in_progress' && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: COLORS.primary,
                          background: `${COLORS.primary}15`, padding: '2px 6px', borderRadius: 6,
                        }}>ACTIVE</span>
                      )}
                    </div>
                  </div>

                  {/* Duration / status */}
                  <div style={{ flexShrink: 0 }}>
                    {stage.status === 'complete' && stage.duration && (
                      <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>{stage.duration}</span>
                    )}
                    {stage.status === 'in_progress' && (
                      <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 500 }}>Running...</span>
                    )}
                    {stage.status === 'pending' && (
                      <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>
                    )}
                  </div>
                </div>
                {/* Spacer for connector line */}
                {idx < procStatus.stages.length - 1 && <div style={{ height: 8 }} />}
              </div>
            ))}
          </div>

          {/* SLA note */}
          <div style={{
            marginTop: 24, padding: '12px 16px', background: '#FFFBEB',
            borderRadius: RADIUS.card, border: '1px solid #FEF3C7',
          }}>
            <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
              <strong>SLA:</strong> Full analysis delivered within 2 hours of session end. WhatsApp summaries sent automatically on completion.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
