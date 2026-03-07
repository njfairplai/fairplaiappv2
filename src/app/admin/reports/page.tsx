'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { COLORS, SHADOWS } from '@/lib/constants'
import { rosters, players, attendanceData, developmentReportData, playerKeyMetrics } from '@/lib/mockData'
import { Eye, Send, Clock } from 'lucide-react'
import ScoreArc from '@/components/charts/ScoreArc'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 200 }} /> })

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'development'>('attendance')
  const [selectedRoster, setSelectedRoster] = useState('roster_001')
  const [autoSendEnabled, setAutoSendEnabled] = useState(false)
  const [autoSendCadence, setAutoSendCadence] = useState<'weekly' | 'monthly' | 'custom'>('weekly')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toast, setToast] = useState('')

  // Load auto-send settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fairplai_reports_autoSend')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.enabled !== undefined) setAutoSendEnabled(parsed.enabled)
        if (parsed.cadence) setAutoSendCadence(parsed.cadence)
        if (parsed.rosterId) setSelectedRoster(parsed.rosterId)
      }
    } catch {}
  }, [])

  // Auto-dismiss toast
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t) } }, [toast])

  const academyRosters = rosters.filter(r => r.academyId === 'academy_001')
  const currentRoster = rosters.find(r => r.id === selectedRoster)
  const rosterAttendance = attendanceData[selectedRoster] || []

  // Pill toggle style helper (active = primary bg white text, inactive = white bg muted text with inset border)
  const pill = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 20, border: 'none', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', background: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : COLORS.muted,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.border}`,
    transition: 'all 0.15s ease',
  })

  // Small pill for cadence
  const smallPill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 16, border: 'none', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', background: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : COLORS.muted,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.border}`,
    transition: 'all 0.15s ease',
  })

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
    fontSize: 14, color: COLORS.navy, outline: 'none', fontFamily: 'Inter, sans-serif',
  }

  function handleSaveAutoSend() {
    localStorage.setItem('fairplai_reports_autoSend', JSON.stringify({ enabled: autoSendEnabled, cadence: autoSendCadence, rosterId: selectedRoster }))
    setToast('Auto-send settings saved')
  }

  // Attendance calculations
  const totalSessions = rosterAttendance[0]?.totalSessions || 0
  const avgAttendance = rosterAttendance.length > 0
    ? Math.round(rosterAttendance.reduce((sum, a) => sum + (a.sessionsAttended / a.totalSessions) * 100, 0) / rosterAttendance.length)
    : 0

  function getAttendanceColor(pct: number) {
    if (pct >= 90) return COLORS.success
    if (pct >= 70) return COLORS.warning
    return COLORS.error
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Reports</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setActiveTab('attendance')} style={pill(activeTab === 'attendance')}>Attendance</button>
          <button onClick={() => setActiveTab('development')} style={pill(activeTab === 'development')}>Development</button>
        </div>
      </div>

      {/* Team selector + Auto-send */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {/* Team Selector */}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Team</label>
          <select style={{ ...inputStyle, width: '100%' }} value={selectedRoster} onChange={(e) => setSelectedRoster(e.target.value)}>
            {academyRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {/* Auto-Send Card */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: autoSendEnabled ? 16 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Send size={16} color={COLORS.primary} />
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Schedule Auto-Send</span>
          </div>
          {/* Toggle */}
          <button onClick={() => setAutoSendEnabled(!autoSendEnabled)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: autoSendEnabled ? COLORS.primary : COLORS.border,
            position: 'relative', transition: 'background 0.2s ease',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2,
              left: autoSendEnabled ? 22 : 2,
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
        {autoSendEnabled && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['weekly', 'monthly', 'custom'] as const).map(c => (
                <button key={c} onClick={() => setAutoSendCadence(c)} style={smallPill(autoSendCadence === c)}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  Recipients: <strong style={{ color: COLORS.navy }}>Parents of {currentRoster?.name || 'Team'}</strong>
                </span>
              </div>
              <Button size="sm" onClick={handleSaveAutoSend}>Save</Button>
            </div>
          </div>
        )}
      </div>

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: SHADOWS.card }}>
          {/* Summary row */}
          <div style={{ display: 'flex', gap: 24, padding: '16px 20px', borderBottom: `2px solid ${COLORS.border}`, background: '#F9FAFB' }}>
            <div><span style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy }}>{rosterAttendance.length}</span><span style={{ fontSize: 13, color: COLORS.muted, marginLeft: 6 }}>Players</span></div>
            <div><span style={{ fontSize: 24, fontWeight: 800, color: getAttendanceColor(avgAttendance) }}>{avgAttendance}%</span><span style={{ fontSize: 13, color: COLORS.muted, marginLeft: 6 }}>Avg Attendance</span></div>
            <div><span style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy }}>{totalSessions}</span><span style={{ fontSize: 13, color: COLORS.muted, marginLeft: 6 }}>Total Sessions</span></div>
          </div>
          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                {['Player Name', 'Sessions Attended', 'Total Sessions', 'Attendance %'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: COLORS.muted, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rosterAttendance.map(a => {
                const player = players.find(p => p.id === a.playerId)
                const pct = Math.round((a.sessionsAttended / a.totalSessions) * 100)
                return (
                  <tr key={a.playerId} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: COLORS.navy }}>{player ? `${player.firstName} ${player.lastName}` : a.playerId}</td>
                    <td style={{ padding: '14px 16px', color: COLORS.muted }}>{a.sessionsAttended}</td>
                    <td style={{ padding: '14px 16px', color: COLORS.muted }}>{a.totalSessions}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: getAttendanceColor(pct) }}>{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DEVELOPMENT TAB */}
      {activeTab === 'development' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rosterAttendance.map(a => {
            const player = players.find(p => p.id === a.playerId)
            if (!player) return null
            const devData = developmentReportData[a.playerId]
            const keyMetrics = playerKeyMetrics[a.playerId]
            const attendancePct = Math.round((a.sessionsAttended / a.totalSessions) * 100)
            if (!devData || !keyMetrics) return null

            const strainColors: Record<string, { color: string; bg: string }> = {
              low: { color: COLORS.success, bg: `${COLORS.success}1A` },
              moderate: { color: COLORS.warning, bg: `${COLORS.warning}1A` },
              high: { color: COLORS.error, bg: `${COLORS.error}1A` },
            }
            const sc = strainColors[keyMetrics.strain]

            return (
              <div key={a.playerId} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card }}>
                {/* Player header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{player.firstName} {player.lastName}</span>
                  <Badge variant="info">{player.position.join(', ')}</Badge>
                </div>

                {/* 3 Key Metrics row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto 6px' }}>
                      <ScoreArc score={keyMetrics.technical} size={40} strokeWidth={3} dark={false} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.navy }}>{keyMetrics.technical}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Technical</p>
                  </div>
                  <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto 6px' }}>
                      <ScoreArc score={keyMetrics.temperament} size={40} strokeWidth={3} color="#9333ea" dark={false} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.navy }}>{keyMetrics.temperament}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Temperament</p>
                  </div>
                  <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: sc.color, display: 'block', marginBottom: 2 }}>{keyMetrics.strain.charAt(0).toUpperCase() + keyMetrics.strain.slice(1)}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: sc.color, background: sc.bg, padding: '2px 6px', borderRadius: 6 }}>Est.</span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, margin: '6px 0 0' }}>Strain</p>
                  </div>
                </div>

                {/* Soft Skills Radar + Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', margin: '0 0 8px' }}>Soft Skills</p>
                    <RadarChartDynamic data={devData.softSkills} height={200} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', margin: '0 0 8px' }}>Details</p>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: COLORS.muted }}>Attendance: </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: getAttendanceColor(attendancePct) }}>{attendancePct}%</span>
                      <span style={{ fontSize: 12, color: COLORS.muted }}> ({a.sessionsAttended}/{a.totalSessions} sessions)</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 13, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Coach Notes:</span>
                      <p style={{ fontSize: 13, color: COLORS.navy, lineHeight: 1.5, margin: 0, background: '#F9FAFB', borderRadius: 8, padding: 12 }}>{devData.coachNotes}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview + Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
          <Eye size={14} /> Preview Report
        </Button>
      </div>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={`${activeTab === 'attendance' ? 'Attendance' : 'Development'} Report Preview`} maxWidth={600}>
        <div style={{ padding: '0 0 16px' }}>
          {/* Report header */}
          <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: '0 0 4px' }}>FairplAI</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, margin: '0 0 2px' }}>{currentRoster?.name} — {activeTab === 'attendance' ? 'Attendance' : 'Development'} Report</p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Generated March 7, 2026</p>
          </div>

          {activeTab === 'attendance' ? (
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', background: '#F9FAFB', borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{avgAttendance}%</p>
                  <p style={{ fontSize: 11, color: COLORS.muted, margin: '2px 0 0' }}>Team Avg</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: '#F9FAFB', borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{totalSessions}</p>
                  <p style={{ fontSize: 11, color: COLORS.muted, margin: '2px 0 0' }}>Sessions</p>
                </div>
              </div>
              {rosterAttendance.map(a => {
                const player = players.find(p => p.id === a.playerId)
                const pct = Math.round((a.sessionsAttended / a.totalSessions) * 100)
                return (
                  <div key={a.playerId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 13, color: COLORS.navy }}>{player ? `${player.firstName} ${player.lastName}` : a.playerId}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: getAttendanceColor(pct) }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div>
              {rosterAttendance.slice(0, 3).map(a => {
                const player = players.find(p => p.id === a.playerId)
                const devData = developmentReportData[a.playerId]
                const keyMetrics = playerKeyMetrics[a.playerId]
                if (!player || !devData || !keyMetrics) return null
                return (
                  <div key={a.playerId} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: '0 0 8px' }}>{player.firstName} {player.lastName}</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>Technical: {keyMetrics.technical}</span>
                      <span style={{ fontSize: 12, color: '#9333ea', fontWeight: 600 }}>Temperament: {keyMetrics.temperament}</span>
                      <span style={{ fontSize: 12, color: keyMetrics.strain === 'low' ? COLORS.success : keyMetrics.strain === 'moderate' ? COLORS.warning : COLORS.error, fontWeight: 600 }}>Strain: {keyMetrics.strain}</span>
                    </div>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>{devData.coachNotes}</p>
                  </div>
                )
              })}
              <p style={{ fontSize: 11, color: COLORS.muted, textAlign: 'center' }}>Showing 3 of {rosterAttendance.length} players</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Powered by FairplAI</p>
          </div>
        </div>
      </Modal>

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
      `}</style>
    </div>
  )
}
