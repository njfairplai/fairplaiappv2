'use client'

import { useState, useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { leaseContracts, pitches, academies } from '@/lib/mockData'
import type { LeaseContract } from '@/lib/types'

const FACILITY_ID = 'facility_001'
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatTerm(startDate: string, endDate: string): string {
  const s = new Date(startDate + 'T00:00:00')
  const e = new Date(endDate + 'T00:00:00')
  return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
}

function formatSchedule(contract: LeaseContract): string {
  const days = contract.dayOfWeek.map(d => DAY_NAMES_FULL[d].slice(0, 3))
  return `${days.join(' & ')} \u00B7 ${contract.startTime}–${contract.endTime}`
}

function getStatusBadge(status: LeaseContract['status']): { bg: string; color: string; label: string } {
  switch (status) {
    case 'active': return { bg: `${COLORS.success}22`, color: COLORS.success, label: 'Active' }
    case 'expiring_soon': return { bg: '#FEF3C7', color: '#92400E', label: 'Expiring Soon' }
    case 'expired': return { bg: '#F5F6FC', color: COLORS.muted, label: 'Expired' }
    default: return { bg: '#F5F6FC', color: COLORS.muted, label: status }
  }
}

function countSessionsBetween(days: number[], startDate: string, endDate: string): number {
  if (!startDate || !endDate || days.length === 0) return 0
  let count = 0
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (end <= start) return 0
  const current = new Date(start)
  while (current <= end) {
    if (days.includes(current.getDay())) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export default function ContractsPage() {
  const [showNewPanel, setShowNewPanel] = useState(false)
  const [renewContract, setRenewContract] = useState<LeaseContract | null>(null)

  // New contract form state
  const [ncAcademyId, setNcAcademyId] = useState('')
  const [ncPitchId, setNcPitchId] = useState('')
  const [ncDays, setNcDays] = useState<number[]>([])
  const [ncDayTimes, setNcDayTimes] = useState<Record<number, string>>({})
  const [ncSessionLength, setNcSessionLength] = useState(90)
  const [ncCustomLength, setNcCustomLength] = useState('')
  const [ncStartDate, setNcStartDate] = useState('')
  const [ncEndDate, setNcEndDate] = useState('')
  const [ncRate, setNcRate] = useState('')
  const [ncCurrency, setNcCurrency] = useState<'AED' | 'SAR'>('AED')
  const [ncNotes, setNcNotes] = useState('')
  const [ncSuccess, setNcSuccess] = useState(false)

  // Renew form state
  const [renewEndDate, setRenewEndDate] = useState('')
  const [renewRate, setRenewRate] = useState('')
  const [renewSuccess, setRenewSuccess] = useState(false)

  const facilityContracts = useMemo(() => leaseContracts.filter(c => c.facilityId === FACILITY_ID), [])
  const facilityPitches = useMemo(() => pitches.filter(p => p.facilityId === FACILITY_ID), [])

  const previewCount = useMemo(() => {
    return countSessionsBetween(ncDays, ncStartDate, ncEndDate)
  }, [ncDays, ncStartDate, ncEndDate])

  function toggleDay(day: number) {
    setNcDays(prev => {
      if (prev.includes(day)) {
        const newTimes = { ...ncDayTimes }
        delete newTimes[day]
        setNcDayTimes(newTimes)
        return prev.filter(d => d !== day)
      }
      setNcDayTimes(prev2 => ({ ...prev2, [day]: '17:00' }))
      return [...prev, day]
    })
  }

  function handleCreateContract() {
    const academy = academies.find(a => a.id === ncAcademyId)
    const pitch = facilityPitches.find(p => p.id === ncPitchId)
    setNcSuccess(true)
    setTimeout(() => {
      setShowNewPanel(false)
      setNcSuccess(false)
      resetNewForm()
    }, 3000)
    void academy
    void pitch
  }

  function resetNewForm() {
    setNcAcademyId('')
    setNcPitchId('')
    setNcDays([])
    setNcDayTimes({})
    setNcSessionLength(90)
    setNcCustomLength('')
    setNcStartDate('')
    setNcEndDate('')
    setNcRate('')
    setNcCurrency('AED')
    setNcNotes('')
  }

  function handleRenewOpen(c: LeaseContract) {
    setRenewContract(c)
    setRenewEndDate('')
    setRenewRate(String(c.ratePerSession))
    setRenewSuccess(false)
  }

  function handleRenewSubmit() {
    setRenewSuccess(true)
    setTimeout(() => {
      setRenewContract(null)
      setRenewSuccess(false)
    }, 3000)
  }

  const ncAcademy = academies.find(a => a.id === ncAcademyId)
  const ncPitch = facilityPitches.find(p => p.id === ncPitchId)

  return (
    <div style={{ padding: 32, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Contracts</h1>
        <button onClick={() => setShowNewPanel(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={16} /> New Contract
        </button>
      </div>

      {/* CONTRACT TABLE */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F6FC' }}>
              {['Academy', 'Pitch', 'Schedule', 'Rate', 'Term', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facilityContracts.map(c => {
              const academy = academies.find(a => a.id === c.academyId)
              const pitch = pitches.find(p => p.id === c.pitchId)
              const statusBadge = getStatusBadge(c.status)
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{academy?.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{pitch?.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{formatSchedule(c)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{c.ratePerSession} {c.currency}/session</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{formatTerm(c.startDate, c.endDate)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                      background: statusBadge.bg, color: statusBadge.color,
                    }}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.navy, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleRenewOpen(c)} style={{ background: 'none', border: `1px solid ${COLORS.primary}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: 'pointer' }}>Renew</button>
                      <button style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.muted, cursor: 'pointer' }}>View Sessions</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* NEW CONTRACT SLIDE-IN PANEL */}
      {showNewPanel && (
        <>
          <div onClick={() => { setShowNewPanel(false); setNcSuccess(false); resetNewForm() }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>New Contract</h2>
              <button onClick={() => { setShowNewPanel(false); setNcSuccess(false); resetNewForm() }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {ncSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>
                    Contract created. {previewCount} sessions generated for {ncAcademy?.name || 'academy'} on {ncPitch?.name || 'pitch'}.
                  </p>
                </div>
              ) : (
                <>
                  {/* Academy */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Academy</label>
                    <select value={ncAcademyId} onChange={e => setNcAcademyId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Select academy...</option>
                      {academies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  {/* Pitch */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Pitch</label>
                    <select value={ncPitchId} onChange={e => setNcPitchId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Select pitch...</option>
                      {facilityPitches.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  {/* Days of Week */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Days of Week</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {DAY_LABELS.map((label, i) => {
                        const active = ncDays.includes(i)
                        return (
                          <button key={i} onClick={() => toggleDay(i)} style={{
                            width: 40, height: 40, borderRadius: '50%', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            background: active ? COLORS.primary : '#fff',
                            color: active ? '#fff' : COLORS.primary,
                            border: `2px solid ${COLORS.primary}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Start times per selected day */}
                  {ncDays.sort((a, b) => a - b).map(day => (
                    <div key={day} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>{DAY_NAMES_FULL[day]} Start Time</label>
                      <input type="time" value={ncDayTimes[day] || '17:00'} onChange={e => setNcDayTimes(prev => ({ ...prev, [day]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  {ncDays.length > 0 && <div style={{ marginBottom: 8 }} />}

                  {/* Session Length */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Session Length</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[60, 90, 120, 0].map(d => {
                        const isCustom = d === 0
                        const label = isCustom ? 'Custom' : `${d} min`
                        const active = isCustom ? (ncSessionLength === 0) : (ncSessionLength === d)
                        return (
                          <button key={d} onClick={() => setNcSessionLength(d)} style={{
                            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: active ? COLORS.primary : '#fff',
                            color: active ? '#fff' : COLORS.navy,
                            border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
                          }}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    {ncSessionLength === 0 && (
                      <input type="number" placeholder="Minutes" value={ncCustomLength} onChange={e => setNcCustomLength(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', marginTop: 8, boxSizing: 'border-box' }} />
                    )}
                  </div>

                  {/* Term Start */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Term Start Date</label>
                    <input type="date" value={ncStartDate} onChange={e => setNcStartDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Term End */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Term End Date</label>
                    <input type="date" value={ncEndDate} onChange={e => setNcEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Preview Card */}
                  {ncDays.length > 0 && ncStartDate && ncEndDate && (
                    <div style={{ background: '#F5F6FC', borderRadius: RADIUS.card, padding: 16, marginBottom: 20 }}>
                      <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, fontWeight: 600 }}>
                        This will generate <strong>{previewCount}</strong> sessions between {ncStartDate} and {ncEndDate}
                      </p>
                    </div>
                  )}

                  {/* Rate */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Rate per Session</label>
                    <input type="number" value={ncRate} onChange={e => setNcRate(e.target.value)} placeholder="e.g., 180" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Currency toggle */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Currency</label>
                    <div style={{ display: 'flex', background: '#F5F6FC', borderRadius: RADIUS.pill, padding: 3, width: 'fit-content' }}>
                      {(['AED', 'SAR'] as const).map(cur => (
                        <button key={cur} onClick={() => setNcCurrency(cur)} style={{
                          padding: '6px 20px', borderRadius: RADIUS.pill, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: ncCurrency === cur ? COLORS.primary : 'transparent',
                          color: ncCurrency === cur ? '#fff' : COLORS.muted,
                        }}>
                          {cur}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                    <textarea value={ncNotes} onChange={e => setNcNotes(e.target.value)} rows={3} placeholder="Any additional notes..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>

                  <button onClick={handleCreateContract} style={{ width: '100%', padding: '12px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Create Contract
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* RENEW CONTRACT SLIDE-IN PANEL */}
      {renewContract && (
        <>
          <div onClick={() => setRenewContract(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Renew Contract</h2>
              <button onClick={() => setRenewContract(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {renewSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>Contract renewed. 24 additional sessions generated.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Academy</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{academies.find(a => a.id === renewContract.academyId)?.name}</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Pitch</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{pitches.find(p => p.id === renewContract.pitchId)?.name}</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Schedule</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{formatSchedule(renewContract)}</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Current Rate</label>
                    <p style={{ fontSize: 14, color: COLORS.navy, margin: 0, padding: '8px 12px', background: '#F5F6FC', borderRadius: 8 }}>{renewContract.ratePerSession} {renewContract.currency}/session</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>New End Date</label>
                    <input type="date" value={renewEndDate} onChange={e => setRenewEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>New Rate per Session</label>
                    <input type="number" value={renewRate} onChange={e => setRenewRate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={handleRenewSubmit} style={{ width: '100%', padding: '12px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Renew Contract
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
