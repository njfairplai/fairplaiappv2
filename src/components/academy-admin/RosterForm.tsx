'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { COLORS } from '@/lib/constants'
import { coaches } from '@/lib/mockData'
import { X } from 'lucide-react'

interface RosterFormProps {
  onClose: () => void
  onCreated?: (roster: {
    id: string
    academyId: string
    name: string
    ageGroup: string
    gender: 'male' | 'female' | 'mixed'
    type: 'development' | 'competitive' | 'elite'
    coachId: string
  }) => void
}

const AGE_GROUPS = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18']
const ROSTER_TYPES: { value: 'development' | 'competitive' | 'elite'; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'elite', label: 'Elite' },
]

export default function RosterForm({ onClose, onCreated }: RosterFormProps) {
  const [form, setForm] = useState({
    name: '',
    ageGroup: 'U12',
    gender: 'male' as 'male' | 'female' | 'mixed',
    type: 'development' as 'development' | 'competitive' | 'elite',
    coachId: '',
  })

  const academyCoaches = coaches.filter(c => c.academyId === 'academy_001')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
    fontSize: 14, color: COLORS.navy, outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  }

  const canSubmit = form.name.trim().length > 0 && form.coachId.length > 0

  function handleSubmit() {
    if (!canSubmit) return

    const newRoster = {
      id: `roster_${Date.now()}`,
      academyId: 'academy_001',
      name: form.name.trim(),
      ageGroup: form.ageGroup,
      gender: form.gender,
      type: form.type,
      coachId: form.coachId,
    }

    // Save to localStorage
    const existing = localStorage.getItem('fairplai_custom_rosters')
    const list = existing ? JSON.parse(existing) : []
    list.push(newRoster)
    localStorage.setItem('fairplai_custom_rosters', JSON.stringify(list))

    onCreated?.(newRoster)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          zIndex: 199,
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw',
        background: '#fff', zIndex: 200, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Add Roster</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color={COLORS.muted} />
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Roster Name */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>
              Roster Name
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. MAK U12 Gold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Age Group */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>
              Age Group
            </label>
            <select
              style={inputStyle}
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
            >
              {AGE_GROUPS.map(ag => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>
              Gender
            </label>
            <select
              style={inputStyle}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' | 'mixed' })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Type (pill toggle) */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 8 }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {ROSTER_TYPES.map(rt => {
                const active = form.type === rt.value
                return (
                  <button
                    key={rt.value}
                    onClick={() => setForm({ ...form, type: rt.value })}
                    style={{
                      padding: '8px 16px', borderRadius: 16,
                      border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: active ? COLORS.primary : '#F5F6FC',
                      color: active ? '#fff' : COLORS.navy,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {rt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Coach */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>
              Head Coach
            </label>
            <select
              style={inputStyle}
              value={form.coachId}
              onChange={(e) => setForm({ ...form, coachId: e.target.value })}
            >
              <option value="">Select a coach</option>
              {academyCoaches.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 24, borderTop: `1px solid ${COLORS.border}` }}>
          <Button fullWidth onClick={handleSubmit} disabled={!canSubmit}>
            Create Roster
          </Button>
        </div>
      </div>
    </>
  )
}
