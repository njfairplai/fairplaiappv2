'use client'

import { useState, useMemo } from 'react'
import { Plus, X, AlertTriangle, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { leaseContracts, pitches, academies, contractRateHistory, expiredContracts } from '@/lib/mockData'
import type { LeaseContract, RateChange } from '@/lib/types'

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
  const [rateHistoryContract, setRateHistoryContract] = useState<LeaseContract | null>(null)
  const [showMarketSlots, setShowMarketSlots] = useState(false)

  // Rate history form state
  const [newRate, setNewRate] = useState('')
  const [newRateReason, setNewRateReason] = useState('')
  const [rateSuccess, setRateSuccess] = useState(false)

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

  function handleRateHistoryOpen(c: LeaseContract) {
    setRateHistoryContract(c)
    setNewRate('')
    setNewRateReason('')
    setRateSuccess(false)
  }

  function handleApplyNewRate() {
    setRateSuccess(true)
    setTimeout(() => {
      setRateHistoryContract(null)
      setRateSuccess(false)
    }, 3000)
  }

  function handleRebook(c: LeaseContract) {
    setShowNewPanel(true)
    setNcAcademyId(c.academyId)
    setNcPitchId(c.pitchId)
    setNcDays(c.dayOfWeek)
    const times: Record<number, string> = {}
    c.dayOfWeek.forEach(d => { times[d] = c.startTime })
    setNcDayTimes(times)
    setNcRate(String(c.ratePerSession))
    setNcCurrency(c.currency)
  }

  function getDaysUntilExpiry(endDate: string): number {
    const end = new Date(endDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function formatFullDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  const ncAcademy = academies.find(a => a.id === ncAcademyId)
  const ncPitch = facilityPitches.find(p => p.id === ncPitchId)

  return (
    <div style={{ padding: 32, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Recurring Bookings</h1>
        <button onClick={() => setShowNewPanel(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={16} /> New Booking
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
              const daysLeft = getDaysUntilExpiry(c.endDate)
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{academy?.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{pitch?.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{formatSchedule(c)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{c.ratePerSession} {c.currency}/session</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: COLORS.navy }}>{formatTerm(c.startDate, c.endDate)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                        background: statusBadge.bg, color: statusBadge.color,
                      }}>
                        {statusBadge.label}
                      </span>
                      {daysLeft > 0 && daysLeft <= 7 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: RADIUS.pill,
                          background: '#E74C3C22', color: '#E74C3C',
                        }}>
                          <AlertTriangle size={11} /> 7-day reminder
                        </span>
                      )}
                      {daysLeft > 7 && daysLeft <= 30 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: RADIUS.pill,
                          background: '#F39C1222', color: '#92400E',
                        }}>
                          <Clock size={11} /> 30-day reminder
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.navy, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleRenewOpen(c)} style={{ background: 'none', border: `1px solid ${COLORS.primary}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: 'pointer' }}>Renew</button>
                      <button onClick={() => handleRateHistoryOpen(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.navy, cursor: 'pointer' }}>
                        <DollarSign size={12} /> Rate History
                      </button>
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>New Recurring Booking</h2>
              <button onClick={() => { setShowNewPanel(false); setNcSuccess(false); resetNewForm() }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {ncSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>
                    Recurring booking created. {previewCount} sessions generated for {ncAcademy?.name || 'academy'} on {ncPitch?.name || 'pitch'}.
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
                    Create Booking
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Renew Booking</h2>
              <button onClick={() => setRenewContract(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {renewSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>Booking renewed. 24 additional sessions generated.</p>
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
                    Renew Booking
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* RATE HISTORY SLIDE-IN PANEL */}
      {rateHistoryContract && (
        <>
          <div onClick={() => { setRateHistoryContract(null); setRateSuccess(false) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Rate History</h2>
              <button onClick={() => { setRateHistoryContract(null); setRateSuccess(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {/* Current Rate */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Current Rate</label>
                <p style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>
                  {rateHistoryContract.ratePerSession} <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.muted }}>{rateHistoryContract.currency}/session</span>
                </p>
              </div>

              {/* Rate Timeline */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 12 }}>Change History</label>
                {(contractRateHistory[rateHistoryContract.id] || []).map((entry, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                    {/* Timeline line & dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === arr.length - 1 ? COLORS.primary : COLORS.border, border: `2px solid ${i === arr.length - 1 ? COLORS.primary : COLORS.muted}`, flexShrink: 0, marginTop: 4 }} />
                      {i < arr.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: COLORS.border, minHeight: 32 }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{formatFullDate(entry.date)}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, margin: '4px 0 2px' }}>
                        <TrendingUp size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {entry.rate} {entry.currency}/session
                      </p>
                      <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{entry.reason}</p>
                    </div>
                  </div>
                ))}
                {!(contractRateHistory[rateHistoryContract.id]?.length) && (
                  <p style={{ fontSize: 13, color: COLORS.muted, fontStyle: 'italic', margin: 0 }}>No rate history available for this contract.</p>
                )}
              </div>

              {/* Adjust Rate Section */}
              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, display: 'block', marginBottom: 14 }}>Adjust Rate</label>
                {rateSuccess ? (
                  <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.success, margin: 0 }}>Rate updated. Change logged.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>New Rate ({rateHistoryContract.currency}/session)</label>
                      <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="e.g., 200" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Reason</label>
                      <textarea value={newRateReason} onChange={e => setNewRateReason(e.target.value)} rows={3} placeholder="e.g., Annual rate review, peak hours adjustment..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <button onClick={handleApplyNewRate} disabled={!newRate || !newRateReason} style={{ width: '100%', padding: '12px 0', background: (!newRate || !newRateReason) ? COLORS.muted : COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: (!newRate || !newRateReason) ? 'not-allowed' : 'pointer', opacity: (!newRate || !newRateReason) ? 0.5 : 1 }}>
                      Apply New Rate
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* AVAILABLE SLOTS — EXPIRED CONTRACTS */}
      <div style={{ marginTop: 32, background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Available Slots</h2>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '4px 0 0' }}>Expired bookings with open time slots</p>
        </div>
        {expiredContracts.filter(c => c.status === 'expired').length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>No expired bookings with available slots.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F6FC' }}>
                {['Academy', 'Pitch', 'Schedule', 'Last Rate', 'Expired Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expiredContracts.filter(c => c.status === 'expired').map(c => {
                const academy = academies.find(a => a.id === c.academyId)
                const pitch = pitches.find(p => p.id === c.pitchId)
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{academy?.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: COLORS.navy }}>{pitch?.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: COLORS.navy }}>{formatSchedule(c)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: COLORS.navy }}>{c.ratePerSession} {c.currency}/session</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: COLORS.muted }}>{formatTerm(c.startDate, c.endDate)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.muted, cursor: 'pointer' }}>List as Available</button>
                        <button onClick={() => handleRebook(c)} style={{ background: 'none', border: `1px solid ${COLORS.primary}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: 'pointer' }}>Rebook</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
