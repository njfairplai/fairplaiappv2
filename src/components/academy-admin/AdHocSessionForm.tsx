'use client'

import { useState, useMemo } from 'react'
import { rosters, pitches } from '@/lib/mockData'
import { COLORS } from '@/lib/constants'
import { X, Lock, AlertTriangle } from 'lucide-react'
import { checkConflicts } from '@/lib/conflictDetection'
import type { Session } from '@/lib/types'

interface AdHocSessionFormProps {
  open: boolean
  onClose: () => void
  onCreated: (session: Session) => void
  editSession?: Session
}

type SessionType = 'drill' | 'match' | 'training_match'

export default function AdHocSessionForm({ open, onClose, onCreated, editSession }: AdHocSessionFormProps) {
  const [formRoster, setFormRoster] = useState(editSession?.rosterId || '')
  const [formPitch, setFormPitch] = useState(editSession?.pitchId || '')
  const [formDate, setFormDate] = useState(editSession?.date || '')
  const [formStart, setFormStart] = useState(editSession?.startTime || '17:00')
  const [formEnd, setFormEnd] = useState(editSession?.endTime || '19:00')
  const [formType, setFormType] = useState<SessionType>((editSession?.type as SessionType) || 'drill')

  const academyRosters = rosters.filter(r => r.academyId === 'academy_001')
  const facilityPitches = pitches.filter(p => p.facilityId === 'facility_001')

  const conflict = useMemo(() =>
    checkConflicts(formPitch, formDate, formStart, formEnd, editSession?.id),
    [formPitch, formDate, formStart, formEnd, editSession?.id]
  )

  const canSubmit = formRoster && formPitch && formDate && formStart && formEnd && !(conflict.hasConflict && conflict.type === 'session_overlap')

  function handleCreate() {
    if (!canSubmit) return
    const newSession: Session = {
      id: `session_adhoc_${Date.now()}`,
      facilityId: 'facility_001',
      pitchId: formPitch,
      academyId: 'academy_001',
      rosterId: formRoster,
      date: formDate,
      startTime: formStart,
      endTime: formEnd,
      type: formType,
      status: 'scheduled',
      participatingPlayerIds: [],
      isAdHoc: true,
      opponent: formType === 'match' ? 'TBD' : undefined,
    }

    // Save to localStorage
    const existing = localStorage.getItem('fairplai_adhoc_sessions')
    const list = existing ? JSON.parse(existing) : []
    list.push(newSession)
    localStorage.setItem('fairplai_adhoc_sessions', JSON.stringify(list))

    onCreated(newSession)
    resetForm()
    onClose()
  }

  function resetForm() {
    setFormRoster('')
    setFormPitch('')
    setFormDate('')
    setFormStart('17:00')
    setFormEnd('19:00')
    setFormType('drill')
  }

  if (!open) return null

  const typeOptions: { value: SessionType; label: string }[] = [
    { value: 'drill', label: 'Training' },
    { value: 'match', label: 'Match' },
    { value: 'training_match', label: 'Training Match' },
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
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 199,
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#fff', zIndex: 200, overflowY: 'auto',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{isEditing ? 'Edit Session' : 'New Session'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={COLORS.muted} />
          </button>
        </div>

        {/* Info */}
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 20px', lineHeight: 1.5 }}>
          {isEditing ? 'Edit session details. Note: session type cannot be changed.' : 'Schedule a standalone session outside of your regular programs.'}
        </p>

        {/* Team */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Team</label>
          <select
            value={formRoster}
            onChange={(e) => setFormRoster(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select a team</option>
            {academyRosters.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Pitch */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Pitch</label>
          <select
            value={formPitch}
            onChange={(e) => setFormPitch(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select a pitch</option>
            {facilityPitches.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Start / End time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Start Time</label>
            <input
              type="time"
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>End Time</label>
            <input
              type="time"
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Conflict Warning */}
        {conflict.hasConflict && (
          <div style={{
            background: 'rgba(243,156,18,0.1)',
            border: '1px solid rgba(243,156,18,0.25)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}>
            <AlertTriangle size={16} color="#F39C12" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, color: '#92400E' }}>{conflict.message}</span>
          </div>
        )}

        {/* Session Type */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
            Session Type
            {isEditing && <Lock size={12} color={COLORS.muted} />}
          </label>
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
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          {isEditing && (
            <p style={{ fontSize: 12, color: '#F39C12', fontStyle: 'italic', margin: '6px 0 0' }}>
              Session type cannot be changed after creation. Delete and recreate if needed.
            </p>
          )}
        </div>

        {/* Create button */}
        <button
          disabled={!canSubmit}
          onClick={handleCreate}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
            background: canSubmit ? COLORS.primary : `${COLORS.primary}40`,
            color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          {isEditing ? 'Save Changes' : 'Create Session'}
        </button>
      </div>
    </>
  )
}
