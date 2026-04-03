'use client'

import { useState, useEffect, useMemo } from 'react'
import { rosters, programs, facilities, pitches, leaseContracts } from '@/lib/mockData'
import { COLORS, SHADOWS } from '@/lib/constants'
import {
  Info,
  Calendar,
  CalendarDays,
  X,
  Plus,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Building2,
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function formatDaysOfWeek(days: number[]): string {
  const names = days.map((d) => DAY_NAMES[d])
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' & ')
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
}

function countSessionsBetween(days: number[], start: string, end: string): number {
  if (!start || !end || days.length === 0) return 0
  let count = 0
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  const d = new Date(startDate)
  while (d <= endDate) {
    if (days.includes(d.getDay())) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

/* ─── component ───────────────────────────────────────────── */
export default function RecurringSessionsPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [customPrograms, setCustomPrograms] = useState<any[]>([])

  /* ── Create Recurring Schedule form state ── */
  const [formName, setFormName] = useState('')
  const [formRoster, setFormRoster] = useState('')
  const [formDays, setFormDays] = useState<number[]>([])
  const [formStartTimes, setFormStartTimes] = useState<Record<number, string>>({})
  const [formLength, setFormLength] = useState<number>(90)
  const [formCustomLength, setFormCustomLength] = useState('')
  const [formTermStart, setFormTermStart] = useState('')
  const [formTermEnd, setFormTermEnd] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  /* ── Facility & Pitch form state ── */
  const [formFacilityId, setFormFacilityId] = useState('')
  const [formPitchId, setFormPitchId] = useState('')

  const academyRosters = rosters.filter((r) => r.academyId === 'academy_001')
  const academyPrograms = programs.filter((p) => p.academyId === 'academy_001')

  /* ── Filter pitches by selected facility ── */
  const facilityPitches = useMemo(() => {
    if (!formFacilityId) return []
    return pitches.filter(p => p.facilityId === formFacilityId)
  }, [formFacilityId])

  /* ── Find matching recurring bookings for selected facility + pitch + days ── */
  const bookingValidation = useMemo(() => {
    if (!formFacilityId || !formPitchId || formDays.length === 0) return null

    const matchingBookings = leaseContracts.filter(c =>
      c.facilityId === formFacilityId &&
      c.pitchId === formPitchId &&
      c.status !== 'expired'
    )

    if (matchingBookings.length === 0) {
      return { valid: false, message: 'No active recurring bookings found for this facility and pitch. Please ensure a booking exists before creating a schedule.' }
    }

    // Check if the selected days overlap with any booking's days
    const coveredDays: number[] = []
    const uncoveredDays: number[] = []

    for (const day of formDays) {
      const hasBooking = matchingBookings.some(b => b.dayOfWeek.includes(day))
      if (hasBooking) {
        coveredDays.push(day)
      } else {
        uncoveredDays.push(day)
      }
    }

    // Check time overlap
    const timeConflicts: string[] = []
    for (const day of coveredDays) {
      const dayBookings = matchingBookings.filter(b => b.dayOfWeek.includes(day))
      const selectedTime = formStartTimes[day] || '17:00'
      const selectedEnd = addMinutesToTime(selectedTime, formLength || parseInt(formCustomLength) || 90)

      const hasTimeMatch = dayBookings.some(b => {
        return selectedTime >= b.startTime && selectedEnd <= b.endTime
      })

      if (!hasTimeMatch) {
        const dayName = DAY_NAMES[day]
        const availableTimes = dayBookings.map(b => `${b.startTime}–${b.endTime}`).join(', ')
        timeConflicts.push(`${dayName}: selected ${selectedTime}–${selectedEnd}, but booking covers ${availableTimes}`)
      }
    }

    if (uncoveredDays.length > 0) {
      const names = uncoveredDays.map(d => DAY_NAMES[d]).join(', ')
      return { valid: false, message: `No recurring booking covers ${names} on this pitch. Available booking days: ${matchingBookings.flatMap(b => b.dayOfWeek.map(d => DAY_NAMES[d])).join(', ')}` }
    }

    if (timeConflicts.length > 0) {
      return { valid: false, message: `Time mismatch: ${timeConflicts.join('; ')}` }
    }

    return { valid: true, message: 'Schedule matches an active recurring booking.' }
  }, [formFacilityId, formPitchId, formDays, formStartTimes, formLength, formCustomLength])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fairplai_custom_programs')
      if (stored) setCustomPrograms(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const allPrograms = [...academyPrograms, ...customPrograms]

  /* program preview count */
  const previewCount = countSessionsBetween(formDays, formTermStart, formTermEnd)

  /* auto-suggest name when roster selected */
  useEffect(() => {
    if (formRoster) {
      const r = rosters.find((r) => r.id === formRoster)
      if (r) setFormName(`${r.name} — Schedule`)
    }
  }, [formRoster])

  function toggleDay(day: number) {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  function handleStartTimeChange(day: number, time: string) {
    setFormStartTimes((prev) => ({ ...prev, [day]: time }))
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Recurring Sessions</h1>
        <button onClick={() => setPanelOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={16} /> Create Recurring Schedule
        </button>
      </div>

      {/* Info card */}
      <div style={{
        background: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 20,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Info size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
          Recurring sessions define your weekly schedule. Sessions are automatically generated from your schedules and your facility&apos;s bookings.
        </p>
      </div>

      {/* Program cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {allPrograms.map((prog) => {
          const roster = rosters.find((r) => r.id === prog.rosterId)
          const endTime = addMinutesToTime(prog.startTime, prog.sessionLengthMinutes)
          return (
            <div key={prog.id} style={{
              background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card,
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{prog.name}</span>
                <span style={{
                  background: `${COLORS.primary}1A`, color: COLORS.primary,
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  {roster?.name}
                </span>
              </div>
              {/* Facility & Pitch row */}
              {prog.pitchId && (() => {
                const pitch = pitches.find(p => p.id === prog.pitchId)
                const facility = pitch ? facilities.find(f => f.id === pitch.facilityId) : null
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <MapPin size={14} color={COLORS.muted} />
                    <span style={{ fontSize: 13, color: COLORS.muted }}>
                      {facility?.name || 'Unknown Facility'} &middot; {pitch?.name || 'Unknown Pitch'}
                    </span>
                  </div>
                )
              })()}
              {/* Schedule row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Calendar size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  {formatDaysOfWeek(prog.daysOfWeek)} &middot; {prog.startTime}&ndash;{endTime} &middot; {prog.sessionLengthMinutes} min
                </span>
              </div>
              {/* Term row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <CalendarDays size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  {formatDate(prog.termStart)} &ndash; {formatDate(prog.termEnd)}
                </span>
              </div>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span style={{
                  background: `${COLORS.success}1A`, color: COLORS.success,
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  {prog.sessionsGenerated} sessions generated
                </span>
                <span style={{
                  background: `${COLORS.warning}1A`, color: '#92400E',
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                }}>
                  0 conflicts
                </span>
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 16 }}>
                <button style={{
                  background: 'none', border: 'none', color: COLORS.primary,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
                }}>
                  Edit
                </button>
                <button style={{
                  background: 'none', border: 'none', color: COLORS.primary,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
                }}>
                  View Sessions
                </button>
              </div>
            </div>
          )
        })}
        {allPrograms.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.muted, fontSize: 14 }}>
            No recurring sessions yet. Create one to generate your training schedule.
          </div>
        )}
      </div>

      {/* CREATE PROGRAM SLIDE-OVER PANEL */}
      {panelOpen && (
        <>
          <div onClick={() => setPanelOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 440, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid #E2E8F0` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Create Recurring Schedule</h2>
              <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {/* Program Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Schedule Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. U12 Red — Spring Term" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Team */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Team / Squad <span style={{ color: '#EF4444' }}>*</span></label>
                <select value={formRoster} onChange={e => setFormRoster(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select squad...</option>
                  {academyRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Facility */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>
                  <Building2 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Facility <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select value={formFacilityId} onChange={e => { setFormFacilityId(e.target.value); setFormPitchId('') }} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select facility...</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              {/* Pitch */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>
                  <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Pitch <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select value={formPitchId} onChange={e => setFormPitchId(e.target.value)} disabled={!formFacilityId} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, background: formFacilityId ? '#fff' : '#F5F6FC', outline: 'none', boxSizing: 'border-box', cursor: formFacilityId ? 'pointer' : 'not-allowed' }}>
                  <option value="">{formFacilityId ? 'Select pitch...' : 'Select a facility first'}</option>
                  {facilityPitches.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                </select>
              </div>

              {/* Days of Week */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Training Days <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {DAY_LETTERS.map((label, i) => {
                    const active = formDays.includes(i)
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
              {formDays.sort((a, b) => a - b).map(day => (
                <div key={day} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>{DAY_NAMES[day]} Start Time</label>
                  <input type="time" value={formStartTimes[day] || '17:00'} onChange={e => handleStartTimeChange(day, e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              {formDays.length > 0 && <div style={{ marginBottom: 8 }} />}

              {/* Session Length */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Session Length</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[60, 90, 120, 0].map(d => {
                    const isCustom = d === 0
                    const label = isCustom ? 'Custom' : `${d} min`
                    const active = isCustom ? (formLength === 0) : (formLength === d)
                    return (
                      <button key={d} onClick={() => setFormLength(d)} style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: active ? COLORS.primary : '#fff',
                        color: active ? '#fff' : COLORS.navy,
                        border: `1px solid ${active ? COLORS.primary : '#E2E8F0'}`,
                      }}>
                        {label}
                      </button>
                    )
                  })}
                </div>
                {formLength === 0 && (
                  <input type="number" placeholder="Minutes" value={formCustomLength} onChange={e => setFormCustomLength(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, outline: 'none', marginTop: 8, boxSizing: 'border-box' }} />
                )}
              </div>

              {/* Term Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Term Start <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="date" value={formTermStart} onChange={e => setFormTermStart(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Term End <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="date" value={formTermEnd} onChange={e => setFormTermEnd(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Session Preview */}
              {previewCount > 0 && (
                <div style={{ fontSize: 13, color: COLORS.primary, fontWeight: 600, padding: '10px 14px', background: `${COLORS.primary}08`, borderRadius: 10, marginBottom: 16 }}>
                  This will generate <strong>{previewCount}</strong> sessions
                </div>
              )}

              {/* Booking Validation */}
              {bookingValidation && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 20,
                  background: bookingValidation.valid ? `${COLORS.success}10` : '#FEF2F2',
                  border: `1px solid ${bookingValidation.valid ? `${COLORS.success}40` : '#FECACA'}`,
                }}>
                  {bookingValidation.valid ? (
                    <CheckCircle size={16} color={COLORS.success} style={{ flexShrink: 0, marginTop: 1 }} />
                  ) : (
                    <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  )}
                  <p style={{ fontSize: 13, color: bookingValidation.valid ? COLORS.success : '#DC2626', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                    {bookingValidation.message}
                  </p>
                </div>
              )}

              {/* Create Button */}
              {(() => {
                const canCreate = formName && formRoster && formFacilityId && formPitchId && formDays.length > 0 && formTermStart && formTermEnd && (!bookingValidation || bookingValidation.valid)
                return (
                  <button
                    onClick={() => {
                      if (!canCreate) return
                      const lengthMinutes = formLength || parseInt(formCustomLength) || 90
                      // Save program
                      try {
                        const existingPrograms = JSON.parse(localStorage.getItem('fairplai_custom_programs') || '[]')
                        const programId = `program_custom_${Date.now()}`
                        existingPrograms.push({
                          id: programId,
                          academyId: 'academy_001',
                          name: formName,
                          rosterId: formRoster,
                          daysOfWeek: formDays,
                          startTime: formStartTimes[formDays[0]] || '17:00',
                          sessionLengthMinutes: lengthMinutes,
                          termStart: formTermStart,
                          termEnd: formTermEnd,
                          sessionsGenerated: previewCount,
                          pitchId: formPitchId,
                          facilityId: formFacilityId,
                        })
                        localStorage.setItem('fairplai_custom_programs', JSON.stringify(existingPrograms))
                        setCustomPrograms(existingPrograms)
                      } catch { /* ignore */ }
                      setToast(`Recurring schedule "${formName}" created with ${previewCount} sessions.`)
                      setPanelOpen(false)
                      // Reset form
                      setFormName(''); setFormRoster(''); setFormFacilityId(''); setFormPitchId('')
                      setFormDays([]); setFormStartTimes({}); setFormLength(90); setFormCustomLength('')
                      setFormTermStart(''); setFormTermEnd('')
                    }}
                    disabled={!canCreate}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: canCreate ? 'pointer' : 'not-allowed',
                      background: canCreate ? COLORS.primary : '#E2E8F0',
                      color: canCreate ? '#fff' : COLORS.muted,
                      border: 'none',
                    }}
                  >
                    Create Schedule
                  </button>
                )
              })()}
            </div>
          </div>
        </>
      )}

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
