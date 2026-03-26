'use client'

import { useState } from 'react'
import { Plus, X, Users, Trophy, Calendar } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { academyStats, facilities } from '@/lib/mockData'

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'Club', email: '', phone: '',
    tier: 'Development', facility: facilities[0]?.name || '', notes: '',
  })

  function handleSubmit() {
    setFormSuccess(true)
    setTimeout(() => { setShowForm(false); setFormSuccess(false); setForm({ name: '', type: 'Club', email: '', phone: '', tier: 'Development', facility: facilities[0]?.name || '', notes: '' }) }, 2000)
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }
  const selectStyle: React.CSSProperties = { ...inputStyle, background: '#fff' }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Clients</h1>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={16} /> Add Academy
        </button>
      </div>

      {/* Academy Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380, 1fr))', gap: 16 }}>
        {academyStats.map((a) => (
          <div key={a.academyId} style={{ background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.card }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{a.name}</h3>
                <p style={{ fontSize: 13, color: COLORS.muted, margin: '4px 0 0' }}>{a.facilityName}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                  background: a.subscriptionTier === 'professional' ? `${COLORS.primary}15` : `${COLORS.success}15`,
                  color: a.subscriptionTier === 'professional' ? COLORS.primary : COLORS.success,
                  textTransform: 'capitalize',
                }}>{a.subscriptionTier}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                  background: `${COLORS.success}15`, color: COLORS.success, textTransform: 'capitalize',
                }}>{a.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.navy }}>{a.players} players</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trophy size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.navy }}>{a.coaches} coaches</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.navy }}>{a.sessionsThisMonth} sessions/mo</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 16px' }}>Last activity: {a.lastActivity}</p>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>View Details</button>
              <button style={{ flex: 1, padding: '8px 0', background: '#fff', color: COLORS.primary, border: `2px solid ${COLORS.primary}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Form */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Add Academy</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {formSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>Academy added successfully.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Academy Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Al Ahli Academy" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={selectStyle}>
                      <option>Club</option>
                      <option>School</option>
                      <option>Independent</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Contact Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="admin@academy.com" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Contact Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+966 5XX XXX XXXX" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Subscription Tier</label>
                    <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} style={selectStyle}>
                      <option>Development</option>
                      <option>Professional</option>
                      <option>Elite</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Assigned Facility</label>
                    <select value={form.facility} onChange={(e) => setForm({ ...form, facility: e.target.value })} style={selectStyle}>
                      {facilities.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Logo</label>
                    <div style={{ padding: '20px 12px', border: `2px dashed ${COLORS.border}`, borderRadius: 8, textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
                      Drag & drop or click to upload
                    </div>
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional notes..." />
                  </div>
                  <button onClick={handleSubmit} style={{ width: '100%', padding: '12px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Add Academy
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
