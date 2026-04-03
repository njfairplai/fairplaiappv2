'use client'

import { useState, useMemo } from 'react'
import { rosters, facilities, pitches } from '@/lib/mockData'
import { COLORS } from '@/lib/constants'
import { X, AlertTriangle, Building2, MapPin } from 'lucide-react'
import { checkConflicts } from '@/lib/conflictDetection'
import type { Session } from '@/lib/types'

interface AdHocSessionFormProps {
  open: boolean
  onClose: () => void
  onCreated: (session: Session) => void
  editSession?: Session
}

type SessionType = 'drill' | 'match' | 'training_match'

const SESSION_LENGTHS = [60, 90, 120, 0] // 0 = custom
const COMPETITIONS = ['UAE Youth League', 'Friendly', 'Cup', 'Tournament', 'Other']

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export default function AdHocSessionForm({ open, onClose, onCreated, editSession }: AdHocSessionFormProps) {
  const [formRoster, setFormRoster] = useState(editSession?.rosterId || '')
  const [formDate, setFormDate] = useState(editSession?.date || '')
  const [formStart, setFormStart] = useState(editSession?.startTime || '17:00')
  const [formLength, setFormLength] = useState<number>(90)
  const [formCustomLength, setFormCustomLength] = useState('')
  const [formType, setFormType] = useState<SessionType>((editSession?.type as SessionType) || 'drill')

  // Facility & Pitch
  const [formFacilityId, setFormFacilityId] = useState(editSession?.facilityId || '')
  const [formPitchId, setFormPitchId] = useState(editSession?.pitchId || '')

  // Opponent details (competitive match only)
  const [formOpponent, setFormOpponent] = useState(editSession?.opponent || '')
  const [formCompetition, setFormCompetition] = useState('')
  const [formHomeAway, setFormHomeAway] = useState<'home' | 'away'>('home')

  const academyRosters = rosters.filter(r => r.academyId === 'academy_001')

  const facilityPitches = useMemo(() => {
    if (!formFacilityId) return []
    return pitches.filter(p => p.facilityId === formFacilityId)
  }, [formFacilityId])

  const lengthMinutes = formLength || parseInt(formCustomLength) || 90
  const computedEndTime = addMinutesToTime(formStart, lengthMinutes)

  const conflict = useMemo(() =>
    checkConflicts(formPitchId, formDate, formStart, computedEndTime, editSession?.id),
    [formPitchId, formDate, formStart, computedEndTime, editSession?.id]
  )

  const canSubmit = formRoster && formFacilityId && formPitchId && formDate && formStart && !(conflict.hasConflict && conflict.type === 'session_overlap') && (formType !== 'match' || formOpponent.trim())

  function handleCreate() {
    if (!canSubmit) return
    const newSession: Session = {
      id: `session_adhoc_${Date.now()}`,
      facilityId: formFacilityId,
      pitchId: formPitchId,
      academyId: 'academy_001',
      rosterId: formRoster,
      date: formDate,
      startTime: formStart,
      endTime: computedEndTime,
      type: formType,
      status: 'scheduled',
      participatingPlayerIds: [],
      isAdHoc: true,
      opponent: formType === 'match' ? formOpponent : undefined,
    }

    const existing = localStorage.getItem('fairplai_adhoc_sessions')
    const list = existing ? JSON.parse(existing) : []
    list.push(newSession)
    localStorage.setItem('fairplai_adhoc_sessions', JSON.stringify(list))

    onCreated(newSession)
    resetForm()
    onClose()
  }

  function resetForm() {
    setFormRoster(''); setFormFacilityId(''); setFormPitchId('')
    setFormDate(''); setFormStart('17:00'); setFormLength(90); setFormCustomLength('')
    setFormType('drill'); setFormOpponent(''); setFormCompetition(''); setFormHomeAway('home')
  }

  if (!open) return null

  const typeOptions: { value: SessionType; label: string }[] = [
    { value: 'drill', label: 'Training' },
    { value: 'training_match', label: 'Training Match' },
    { value: 'match', label: 'Competitive Match' },
  ]

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const isEditing = !!editSession

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: '#fff', zIndex: 200, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{isEditing ? 'Edit Session' : 'New Session'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={COLORS.muted} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {/* Info */}
          <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 20px', lineHeight: 1.5 }}>
            {isEditing ? 'Edit session details.' : 'Schedule a standalone session outside of your recurring schedules.'}
          </p>

          {/* Session Type */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Session Type</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {typeOptions.map(opt => {
                const isActive = formType === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={isEditing ? undefined : () => setFormType(opt.value)}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: isActive ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                      background: isActive ? `${COLORS.primary}0D` : '#fff',
                      color: isActive ? COLORS.primary : COLORS.muted,
                      fontSize: 13, fontWeight: 600,
                      cursor: isEditing ? 'not-allowed' : 'pointer',
                      opacity: isEditing && !isActive ? 0.4 : 1,
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Team */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Team / Squad</label>
            <select value={formRoster} onChange={(e) => setFormRoster(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select a team</option>
              {academyRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} style={inputStyle} />
          </div>

          {/* Start Time + Session Length (matching recurring sessions form) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.muted, background: '#F8F9FC' }}>
                {computedEndTime}
              </div>
            </div>
          </div>

          {/* Session Length pills */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 8 }}>Session Length</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SESSION_LENGTHS.map(d => {
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
              <input type="number" placeholder="Minutes" value={formCustomLength} onChange={e => setFormCustomLength(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} />
            )}
          </div>

          {/* Facility */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={13} /> Facility
            </label>
            <select value={formFacilityId} onChange={(e) => { setFormFacilityId(e.target.value); setFormPitchId('') }} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select facility...</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* Pitch */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> Pitch
            </label>
            <select value={formPitchId} onChange={(e) => setFormPitchId(e.target.value)} disabled={!formFacilityId} style={{ ...inputStyle, cursor: formFacilityId ? 'pointer' : 'not-allowed', background: formFacilityId ? '#fff' : '#F5F6FC' }}>
              <option value="">{formFacilityId ? 'Select pitch...' : 'Select a facility first'}</option>
              {facilityPitches.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
            </select>
          </div>

          {/* Conflict Warning */}
          {conflict.hasConflict && (
            <div style={{
              background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.25)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <AlertTriangle size={16} color="#F39C12" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: '#92400E' }}>{conflict.message}</span>
            </div>
          )}

          {/* ── OPPONENT SECTION (Competitive Match only) ── */}
          {formType === 'match' && (
            <div style={{
              background: '#F8F9FC', borderRadius: 12, padding: 20, marginBottom: 20,
              border: '1px solid #E2E8F0',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginBottom: 16 }}>
                Opponent Details
              </div>

              {/* Opponent Team Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Opponent Team Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  value={formOpponent}
                  onChange={(e) => setFormOpponent(e.target.value)}
                  placeholder="e.g. Al Wasl Academy"
                  style={inputStyle}
                />
              </div>

              {/* Competition */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Competition</label>
                <select value={formCompetition} onChange={(e) => setFormCompetition(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select competition...</option>
                  {COMPETITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Home / Away */}
              <div>
                <label style={labelStyle}>Home / Away</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['home', 'away'] as const).map(opt => {
                    const isActive = formHomeAway === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => setFormHomeAway(opt)}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600,
                          cursor: 'pointer', textTransform: 'capitalize',
                          border: isActive ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                          background: isActive ? `${COLORS.primary}0D` : '#fff',
                          color: isActive ? COLORS.primary : COLORS.muted,
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Create button */}
          <button
            disabled={!canSubmit}
            onClick={handleCreate}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: canSubmit ? COLORS.primary : `${COLORS.primary}40`,
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {isEditing ? 'Save Changes' : 'Create Session'}
          </button>
        </div>
      </div>
    </>
  )
}
