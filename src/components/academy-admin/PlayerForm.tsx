'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { COLORS } from '@/lib/constants'
import { X } from 'lucide-react'

interface PlayerFormProps {
  onClose: () => void
}

export default function PlayerForm({ onClose }: PlayerFormProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '', position: '', jerseyNumber: '', foot: 'right' })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
    fontSize: 14, color: COLORS.navy, outline: 'none', fontFamily: 'Inter, sans-serif',
  }

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, maxWidth: '100vw', background: '#fff', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Add Player</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>First Name</label>
          <input style={inputStyle} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Last Name</label>
          <input style={inputStyle} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Date of Birth</label>
          <input type="date" style={inputStyle} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Position</label>
          <select style={inputStyle} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
            <option value="">Select position</option>
            {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'AM', 'LW', 'RW', 'CF', 'SS'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Jersey Number</label>
          <input type="number" style={inputStyle} value={form.jerseyNumber} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Dominant Foot</label>
          <select style={inputStyle} value={form.foot} onChange={(e) => setForm({ ...form, foot: e.target.value })}>
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>
      <div style={{ padding: 24, borderTop: `1px solid ${COLORS.border}` }}>
        <Button fullWidth onClick={onClose}>Save Player</Button>
      </div>
    </div>
  )
}
