'use client'

import React, { useState } from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { useCommandCentre } from '@/contexts/CommandCentreContext'
import { rosters, facilities, pitches, leaseContracts } from '@/lib/mockData'
import type { AgentAction } from '@/lib/types'

const ACADEMY_ID = 'academy_001'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: RADIUS.input,
  border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4,
}

function AddPlayerForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', guardianEmail: '', position: '', jerseyNumber: '' })
  const positions = ['', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'AM', 'LW', 'RW', 'CF', 'ST', 'SS']
  const canSubmit = form.firstName && form.lastName && form.guardianEmail

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={labelStyle}>Guardian Email <span style={{ color: COLORS.error }}>*</span></label>
        <input style={inputStyle} type="email" placeholder="e.g. parent@email.com" value={form.guardianEmail} onChange={e => setForm(p => ({ ...p, guardianEmail: e.target.value }))} />
        <span style={{ fontSize: 11, color: COLORS.muted, marginTop: 2, display: 'block' }}>An onboarding invite will be sent to this email</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Player First Name <span style={{ color: COLORS.error }}>*</span></label>
          <input style={inputStyle} placeholder="e.g. Ahmed" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Player Last Name <span style={{ color: COLORS.error }}>*</span></label>
          <input style={inputStyle} placeholder="e.g. Hassan" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Position <span style={{ fontSize: 10, color: COLORS.muted }}>(optional)</span></label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}>
            {positions.map(p => <option key={p} value={p}>{p || '—'}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Jersey # <span style={{ fontSize: 10, color: COLORS.muted }}>(optional)</span></label>
          <input style={inputStyle} type="number" placeholder="e.g. 10" value={form.jerseyNumber} onChange={e => setForm(p => ({ ...p, jerseyNumber: e.target.value }))} />
        </div>
      </div>
      <button
        onClick={() => canSubmit && onSubmit(form)}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: '10px', borderRadius: RADIUS.input,
          background: canSubmit ? COLORS.primary : COLORS.cloud,
          color: canSubmit ? '#fff' : COLORS.muted,
          border: 'none', fontSize: 13, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        Add Player & Send Invite
      </button>
    </div>
  )
}

function AddCoachForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const academyRosters = rosters.filter(r => r.academyId === ACADEMY_ID)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'head_coach', rosterIds: [] as string[] })
  const roles = [
    { value: 'head_coach', label: 'Head Coach' },
    { value: 'assistant_coach', label: 'Assistant Coach' },
    { value: 'goalkeeper_coach', label: 'Goalkeeper Coach' },
    { value: 'fitness_coach', label: 'Fitness Coach' },
  ]
  const canSubmit = form.name && form.email

  const toggleRoster = (id: string) => {
    setForm(p => ({
      ...p,
      rosterIds: p.rosterIds.includes(id) ? p.rosterIds.filter(r => r !== id) : [...p.rosterIds, id]
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={labelStyle}>Coach Name <span style={{ color: COLORS.error }}>*</span></label>
        <input style={inputStyle} placeholder="e.g. Marcus Silva" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <label style={labelStyle}>Email <span style={{ color: COLORS.error }}>*</span></label>
        <input style={inputStyle} type="email" placeholder="e.g. coach@academy.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        <span style={{ fontSize: 11, color: COLORS.muted, marginTop: 2, display: 'block' }}>An onboarding invite will be sent to this email</span>
      </div>
      <div>
        <label style={labelStyle}>Phone <span style={{ fontSize: 10, color: COLORS.muted }}>(optional)</span></label>
        <input style={inputStyle} type="tel" placeholder="e.g. +971 50 123 4567" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
      </div>
      <div>
        <label style={labelStyle}>Role</label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {academyRosters.length > 0 && (
        <div>
          <label style={labelStyle}>Assign to Squads <span style={{ fontSize: 10, color: COLORS.muted }}>(optional)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {academyRosters.map(r => {
              const selected = form.rosterIds.includes(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRoster(r.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 20,
                    border: `1.5px solid ${selected ? COLORS.primary : COLORS.border}`,
                    background: selected ? `${COLORS.primary}10` : '#fff',
                    color: selected ? COLORS.primary : COLORS.muted,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {r.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <button
        onClick={() => canSubmit && onSubmit(form)}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: '10px', borderRadius: RADIUS.input,
          background: canSubmit ? COLORS.primary : COLORS.cloud,
          color: canSubmit ? '#fff' : COLORS.muted,
          border: 'none', fontSize: 13, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        Add Coach & Send Invite
      </button>
    </div>
  )
}

function AddProgramForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const academyRosters = rosters.filter(r => r.academyId === ACADEMY_ID)
  const [form, setForm] = useState({
    name: '',
    rosterId: academyRosters[0]?.id || '',
    facilityId: '',
    pitchId: '',
    daysOfWeek: [] as string[],
    startTime: '17:00',
    sessionLength: '90',
    termStart: '',
    termEnd: '',
  })
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayToNum: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

  const facilityPitches = form.facilityId ? pitches.filter(p => p.facilityId === form.facilityId) : []

  // Booking validation
  const bookingCheck = (() => {
    if (!form.facilityId || !form.pitchId || form.daysOfWeek.length === 0) return null
    const matchingBookings = leaseContracts.filter(c =>
      c.facilityId === form.facilityId && c.pitchId === form.pitchId && c.status !== 'expired'
    )
    if (matchingBookings.length === 0) {
      return { valid: false, msg: 'No active recurring bookings for this pitch.' }
    }
    const selectedDayNums = form.daysOfWeek.map(d => dayToNum[d])
    const uncovered = selectedDayNums.filter(d => !matchingBookings.some(b => b.dayOfWeek.includes(d)))
    if (uncovered.length > 0) {
      const names = uncovered.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
      return { valid: false, msg: `No booking covers: ${names.join(', ')}` }
    }
    return { valid: true, msg: 'Matches active booking.' }
  })()

  const canSubmit = form.name && form.rosterId && form.facilityId && form.pitchId && form.daysOfWeek.length > 0 && form.termStart && form.termEnd && (!bookingCheck || bookingCheck.valid)

  const toggleDay = (d: string) => {
    setForm(p => ({
      ...p,
      daysOfWeek: p.daysOfWeek.includes(d) ? p.daysOfWeek.filter(x => x !== d) : [...p.daysOfWeek, d]
    }))
  }

  // Calculate session count
  let sessionCount = 0
  if (form.termStart && form.termEnd && form.daysOfWeek.length > 0) {
    const start = new Date(form.termStart)
    const end = new Date(form.termEnd)
    const selectedDayNums = form.daysOfWeek.map(d => dayToNum[d])
    const d = new Date(start)
    while (d <= end) {
      if (selectedDayNums.includes(d.getDay())) sessionCount++
      d.setDate(d.getDate() + 1)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={labelStyle}>Program Name <span style={{ color: COLORS.error }}>*</span></label>
        <input style={inputStyle} placeholder="e.g. Spring Term Training" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <label style={labelStyle}>Team <span style={{ color: COLORS.error }}>*</span></label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.rosterId} onChange={e => setForm(p => ({ ...p, rosterId: e.target.value }))}>
          {academyRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Facility <span style={{ color: COLORS.error }}>*</span></label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.facilityId} onChange={e => setForm(p => ({ ...p, facilityId: e.target.value, pitchId: '' }))}>
          <option value="">Select facility...</option>
          {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Pitch <span style={{ color: COLORS.error }}>*</span></label>
        <select style={{ ...inputStyle, cursor: form.facilityId ? 'pointer' : 'not-allowed', background: form.facilityId ? '#fff' : '#F5F6FC' }} disabled={!form.facilityId} value={form.pitchId} onChange={e => setForm(p => ({ ...p, pitchId: e.target.value }))}>
          <option value="">{form.facilityId ? 'Select pitch...' : 'Select facility first'}</option>
          {facilityPitches.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Training Days <span style={{ color: COLORS.error }}>*</span></label>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {days.map(d => {
            const selected = form.daysOfWeek.includes(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                style={{
                  width: 42, height: 36, borderRadius: 8,
                  border: `1.5px solid ${selected ? COLORS.primary : COLORS.border}`,
                  background: selected ? `${COLORS.primary}10` : '#fff',
                  color: selected ? COLORS.primary : COLORS.muted,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>
      {bookingCheck && (
        <div style={{
          fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8,
          background: bookingCheck.valid ? `${COLORS.success}10` : '#FEF2F2',
          color: bookingCheck.valid ? COLORS.success : '#DC2626',
        }}>
          {bookingCheck.msg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Time</label>
          <input style={inputStyle} type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Session Length</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.sessionLength} onChange={e => setForm(p => ({ ...p, sessionLength: e.target.value }))}>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
            <option value="120">120 min</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Term Start <span style={{ color: COLORS.error }}>*</span></label>
          <input style={inputStyle} type="date" value={form.termStart} onChange={e => setForm(p => ({ ...p, termStart: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Term End <span style={{ color: COLORS.error }}>*</span></label>
          <input style={inputStyle} type="date" value={form.termEnd} onChange={e => setForm(p => ({ ...p, termEnd: e.target.value }))} />
        </div>
      </div>
      {sessionCount > 0 && (
        <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, padding: '6px 10px', background: `${COLORS.primary}08`, borderRadius: 8 }}>
          This will generate {sessionCount} sessions
        </div>
      )}
      <button
        onClick={() => canSubmit && onSubmit(form)}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: '10px', borderRadius: RADIUS.input,
          background: canSubmit ? COLORS.primary : COLORS.cloud,
          color: canSubmit ? '#fff' : COLORS.muted,
          border: 'none', fontSize: 13, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        Create Program
      </button>
    </div>
  )
}

function CreateRosterForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ name: '', ageGroup: 'U12', type: 'development' })
  const ageGroups = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18']
  const types = ['development', 'competitive', 'elite']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={labelStyle}>Squad Name</label>
        <input style={inputStyle} placeholder="e.g. MAK U12 Gold" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Age Group</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.ageGroup} onChange={e => setForm(p => ({ ...p, ageGroup: e.target.value }))}>
            {ageGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <button
        onClick={() => form.name && onSubmit(form)}
        disabled={!form.name}
        style={{
          padding: '10px', borderRadius: RADIUS.input,
          background: form.name ? COLORS.primary : COLORS.cloud,
          color: form.name ? '#fff' : COLORS.muted,
          border: 'none', fontSize: 13, fontWeight: 600, cursor: form.name ? 'pointer' : 'not-allowed',
        }}
      >
        Create Squad
      </button>
    </div>
  )
}

function ScheduleSessionForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const academyRosters = rosters.filter(r => r.academyId === ACADEMY_ID)
  const [form, setForm] = useState({
    rosterId: academyRosters[0]?.id || '',
    date: '',
    startTime: '17:00',
    endTime: '18:30',
    type: 'training_match',
  })
  const sessionTypes = ['match', 'drill', 'training_match']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={labelStyle}>Team</label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.rosterId} onChange={e => setForm(p => ({ ...p, rosterId: e.target.value }))}>
          {academyRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Date</label>
        <input style={inputStyle} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Start</label>
          <input style={inputStyle} type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>End</label>
          <input style={inputStyle} type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {sessionTypes.map(t => (
            <button
              key={t}
              onClick={() => setForm(p => ({ ...p, type: t }))}
              style={{
                flex: 1, padding: '8px', borderRadius: RADIUS.input,
                border: `1.5px solid ${form.type === t ? COLORS.primary : COLORS.border}`,
                background: form.type === t ? `${COLORS.primary}10` : '#fff',
                color: form.type === t ? COLORS.primary : COLORS.muted,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => form.date && onSubmit(form)}
        disabled={!form.date}
        style={{
          padding: '10px', borderRadius: RADIUS.input,
          background: form.date ? COLORS.primary : COLORS.cloud,
          color: form.date ? '#fff' : COLORS.muted,
          border: 'none', fontSize: 13, fontWeight: 600, cursor: form.date ? 'pointer' : 'not-allowed',
        }}
      >
        Schedule Session
      </button>
    </div>
  )
}

const FORM_TITLES: Record<string, string> = {
  add_player: 'Add Player',
  add_coach: 'Add Coach',
  create_roster: 'Create Squad',
  schedule_session: 'Schedule Session',
  add_program: 'Create Program',
}

export default function InlineFormCard({ formType, messageId }: { formType: string; messageId?: string }) {
  const { executeAction } = useCommandCentre()
  const storageKey = messageId ? `fairplai_form_submitted_${messageId}` : null
  const [submitted, setSubmitted] = useState(() => {
    if (!storageKey) return false
    try { return localStorage.getItem(storageKey) === '1' } catch { return false }
  })

  const handleSubmit = (data: Record<string, unknown>) => {
    executeAction(formType as AgentAction, data)
    setSubmitted(true)
    if (storageKey) try { localStorage.setItem(storageKey, '1') } catch { /* ignore */ }
  }

  if (submitted) return null

  return (
    <div style={{
      background: '#fff', borderRadius: RADIUS.card, padding: 16,
      boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${COLORS.periwinkle}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 12 }}>
        {FORM_TITLES[formType] || 'Form'}
      </div>
      {formType === 'add_player' && <AddPlayerForm onSubmit={handleSubmit} />}
      {formType === 'add_coach' && <AddCoachForm onSubmit={handleSubmit} />}
      {formType === 'create_roster' && <CreateRosterForm onSubmit={handleSubmit} />}
      {formType === 'schedule_session' && <ScheduleSessionForm onSubmit={handleSubmit} />}
      {formType === 'add_program' && <AddProgramForm onSubmit={handleSubmit} />}
    </div>
  )
}
