'use client'

import { useState, useMemo, useEffect } from 'react'
import { sessions as baseSessions, rosters, pitches, tournamentFixtures, processingStatuses } from '@/lib/mockData'
import { COLORS, SHADOWS } from '@/lib/constants'
import type { Session } from '@/lib/types'
import AdHocSessionForm from '@/components/academy-admin/AdHocSessionForm'
import {
  Info,
  ChevronRight,
  Plus,
  CheckCircle,
  MessageCircle,
} from 'lucide-react'
import WhatsAppDeliveryPanel from '@/components/shared/WhatsAppDeliveryPanel'
import ProcessingStatusPanel from '@/components/coach/ProcessingStatusPanel'

/* ─── helpers ─────────────────────────────────────────────── */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ─── component ───────────────────────────────────────────── */
export default function SessionsPage() {
  const [adHocPanelOpen, setAdHocPanelOpen] = useState(false)
  const [adHocSessions, setAdHocSessions] = useState<Session[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [whatsAppSession, setWhatsAppSession] = useState<{ id: string; rosterId: string; opponent?: string; date: string; type: string } | null>(null)
  const [whatsAppDeliveries, setWhatsAppDeliveries] = useState<Record<string, { status: string; sentAt: string; count: number }>>({})
  const [processingPanelSessionId, setProcessingPanelSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fairplai_whatsapp_deliveries')
      if (stored) setWhatsAppDeliveries(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  /* ── Sessions filter state ── */
  const [filterRoster, setFilterRoster] = useState('all')
  const [filterType, setFilterType] = useState<'all' | 'match' | 'drill' | 'tournament'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | Session['status']>('all')

  const academyRosters = rosters.filter((r) => r.academyId === 'academy_001')
  const allSessions = [...baseSessions, ...adHocSessions]
  const academySessions = allSessions.filter((s) => s.academyId === 'academy_001')

  /* sessions filtering */
  const filteredSessions = useMemo(() => {
    let list = [...academySessions]
    if (filterRoster !== 'all') list = list.filter((s) => s.rosterId === filterRoster)
    if (filterType !== 'all') {
      if (filterType === 'tournament') {
        list = list.filter((s) => !!s.tournamentFixtureId)
      } else if (filterType === 'match') {
        list = list.filter((s) => s.type === 'match' && !s.tournamentFixtureId)
      } else {
        list = list.filter((s) => s.type === 'drill' || s.type === 'training_match')
      }
    }
    if (filterStatus !== 'all') list = list.filter((s) => s.status === filterStatus)
    list.sort((a, b) => b.date.localeCompare(a.date))
    return list
  }, [filterRoster, filterType, filterStatus, academySessions])

  /* ── pill style helper ── */
  const smallPill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 16,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : COLORS.muted,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.border}`,
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Sessions</h1>
      </div>

      {/* Info card */}
      <div style={{
        background: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 20,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Info size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
          Sessions are automatically generated from your Programs and facility contracts. To change a recurring schedule, edit the Program or contact your facility admin.
        </p>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filterRoster}
          onChange={(e) => setFilterRoster(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
            fontSize: 13, color: COLORS.navy, outline: 'none', background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="all">All Squads</option>
          {academyRosters.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <span style={{
          padding: '8px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
          fontSize: 13, color: COLORS.muted, background: '#fff',
        }}>
          Jan 1 – Apr 30, 2026
        </span>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'match', 'drill', 'tournament'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as typeof filterType)}
              style={smallPill(filterType === t)}
            >
              {t === 'all' ? 'All' : t === 'match' ? 'Match' : t === 'drill' ? 'Training' : 'Tournament'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'scheduled', 'processing', 'analysed', 'complete', 'playback_ready'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as typeof filterStatus)}
              style={smallPill(filterStatus === s)}
            >
              {s === 'all' ? 'All' : s === 'playback_ready' ? 'Playback Ready' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredSessions.map((s) => {
          const roster = rosters.find((r) => r.id === s.rosterId)
          const pitch = pitches.find((p) => p.id === s.pitchId)
          const d = new Date(s.date + 'T00:00:00')
          const dayNum = d.getDate()
          const monthLabel = MONTH_NAMES[d.getMonth()]

          const statusColors: Record<Session['status'], { bg: string; color: string }> = {
            scheduled: { bg: '#F3F4F6', color: '#6B7280' },
            in_progress: { bg: `${COLORS.warning}1A`, color: COLORS.warning },
            processing: { bg: `${COLORS.primary}1A`, color: COLORS.primary },
            analysed: { bg: '#7C3AED1A', color: '#7C3AED' },
            complete: { bg: `${COLORS.success}1A`, color: COLORS.success },
            playback_ready: { bg: `${COLORS.success}1A`, color: COLORS.success },
          }
          const sc = statusColors[s.status]

          const statusLabel: Record<Session['status'], string> = {
            scheduled: 'Scheduled',
            in_progress: 'In Progress',
            processing: 'Processing',
            analysed: 'Analysed',
            complete: 'Complete',
            playback_ready: 'Playback Ready',
          }

          const needsClassification = s.aiMatchConfidence !== undefined && s.aiMatchConfidence < 85 && s.status === 'complete'

          return (
            <div key={s.id} style={{
              background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: SHADOWS.card,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {/* Date block */}
              <div style={{
                width: 48, height: 48, borderRadius: 8, background: '#F5F6FC',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{dayNum}</span>
                <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{monthLabel}</span>
              </div>

              {/* Center */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
                    {roster?.name}{s.opponent ? ` vs ${s.opponent}` : ''}
                  </span>
                  <span style={{
                    background: s.tournamentFixtureId ? `${COLORS.warning}1A` : s.type === 'match' ? `${COLORS.primary}1A` : `${COLORS.success}1A`,
                    color: s.tournamentFixtureId ? COLORS.warning : s.type === 'match' ? COLORS.primary : COLORS.success,
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  }}>
                    {s.tournamentFixtureId ? 'Tournament' : s.type === 'match' ? 'Match' : s.type === 'training_match' ? 'Training Match' : 'Training'}
                  </span>
                  {s.isAdHoc && (
                    <span style={{
                      background: '#F3F4F6', color: '#6B7280',
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    }}>
                      Ad Hoc
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  {pitch?.name} &middot; {s.startTime}&ndash;{s.endTime}
                </span>
                {s.tournamentFixtureId && (() => {
                  const fixture = tournamentFixtures.find(f => f.id === s.tournamentFixtureId)
                  return fixture ? (
                    <div style={{ fontSize: 12, color: COLORS.warning, fontWeight: 600, marginTop: 3 }}>
                      {fixture.tournamentName} &middot; {fixture.round} &middot; {fixture.venue}
                    </div>
                  ) : null
                })()}
              </div>

              {/* Right badges */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <span style={{
                  background: sc.bg, color: sc.color,
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  {statusLabel[s.status]}
                </span>
                {s.status === 'processing' && (() => {
                  const proc = processingStatuses[s.processingStatusId ?? '']
                  return proc ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setProcessingPanelSessionId(s.id) }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 600, color: COLORS.primary,
                        padding: '4px 10px', borderRadius: 10, background: `${COLORS.primary}08`,
                        border: `1px solid ${COLORS.primary}20`, cursor: 'pointer',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.primary, animation: 'pulse 1.5s ease-in-out infinite' }} />
                      {proc.progress}% · {proc.eta}
                    </button>
                  ) : null
                })()}
                {(s.type === 'match' || s.tournamentFixtureId) && (() => {
                  const isProcessing = s.status === 'scheduled' || s.status === 'in_progress'
                  const isSent = s.status === 'analysed' || s.status === 'playback_ready'
                  if (isProcessing) {
                    return (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, color: COLORS.muted,
                        padding: '3px 8px', borderRadius: 10, background: '#F3F4F6',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.warning, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        Analysis processing…
                      </span>
                    )
                  }
                  if (isSent) {
                    return (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, color: COLORS.success,
                        padding: '3px 8px', borderRadius: 10, background: `${COLORS.success}1A`,
                      }}>
                        <CheckCircle size={12} />
                        Parent notification sent
                      </span>
                    )
                  }
                  return null
                })()}
                {s.status === 'analysed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button style={{
                      background: 'none', border: 'none', color: COLORS.primary,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0,
                    }}>
                      View Analysis
                    </button>
                    {whatsAppDeliveries[s.id] ? (
                      <span style={{
                        background: '#25D3661A', color: '#25D366',
                        fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        Sent &#10003;
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setWhatsAppSession({ id: s.id, rosterId: s.rosterId, opponent: s.opponent, date: s.date, type: s.type })
                        }}
                        style={{
                          background: '#25D366', color: '#fff', borderRadius: 12,
                          fontSize: 12, fontWeight: 600, padding: '4px 10px',
                          border: 'none', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <MessageCircle size={12} />
                        WhatsApp
                      </button>
                    )}
                  </div>
                )}
                {needsClassification && (
                  <span style={{
                    background: `${COLORS.warning}1A`, color: '#92400E',
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10,
                  }}>
                    Classification Needed
                  </span>
                )}
              </div>

              <ChevronRight size={18} color={COLORS.muted} style={{ flexShrink: 0 }} />
            </div>
          )
        })}
      </div>


      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: COLORS.navy, color: '#fff', padding: '14px 28px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, boxShadow: SHADOWS.elevated, zIndex: 1000,
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <ProcessingStatusPanel open={!!processingPanelSessionId} onClose={() => setProcessingPanelSessionId(null)} sessionId={processingPanelSessionId} />

      <WhatsAppDeliveryPanel
        open={!!whatsAppSession}
        onClose={() => {
          setWhatsAppSession(null)
          const stored = localStorage.getItem('fairplai_whatsapp_deliveries')
          if (stored) setWhatsAppDeliveries(JSON.parse(stored))
        }}
        session={whatsAppSession}
      />
    </div>
  )
}
