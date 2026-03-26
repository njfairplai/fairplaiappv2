'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Settings, ChevronDown } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { platformUsers, academyStats, facilities } from '@/lib/mockData'

interface PlatformUser {
  id: string
  name: string
  email: string
  role: string
  assignedTo: string
  status: string
  lastLogin: string
}

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: `${COLORS.success}15`, color: COLORS.success },
  invited: { bg: `${COLORS.warning}15`, color: COLORS.warning },
  deactivated: { bg: '#E5E7EB', color: '#6B7280' },
}

const roleLabels: Record<string, string> = {
  academy_admin: 'Academy Admin',
  facility_admin: 'Facility Admin',
  super_admin: 'Super Admin',
}

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>(platformUsers)
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'academy_admin', assignedTo: '', phone: '' })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fairplai_platform_users')
      if (stored) {
        const extra = JSON.parse(stored) as PlatformUser[]
        setUsers([...platformUsers, ...extra])
      }
    } catch { /* ignore */ }
  }, [])

  function handleSubmit() {
    const newUser: PlatformUser = {
      id: `user_${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      assignedTo: form.assignedTo,
      status: 'invited',
      lastLogin: '',
    }
    const updated = [...users, newUser]
    setUsers(updated)
    const extra = updated.filter((u) => !platformUsers.find((pu) => pu.id === u.id))
    localStorage.setItem('fairplai_platform_users', JSON.stringify(extra))
    setFormSuccess(true)
    setTimeout(() => { setShowForm(false); setFormSuccess(false); setForm({ name: '', email: '', role: 'academy_admin', assignedTo: '', phone: '' }) }, 2000)
  }

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    return true
  })

  const selectStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.navy, background: '#fff', outline: 'none', cursor: 'pointer' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 6 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy, outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Users</h1>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={16} /> Create User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Roles</option>
          <option value="academy_admin">Academy Admin</option>
          <option value="facility_admin">Facility Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email Address', 'Role', 'Assigned To', 'Status', 'Last Login', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const sc = statusColors[u.status] || statusColors.deactivated
              return (
                <tr key={u.id}>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{u.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{u.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{roleLabels[u.role] || u.role}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{u.assignedTo}</td>
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: u.lastLogin ? COLORS.navy : COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>{u.lastLogin || '--'}</td>
                  <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}`, position: 'relative' }}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                      style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Settings size={14} color={COLORS.muted} />
                      <ChevronDown size={12} color={COLORS.muted} />
                    </button>
                    {activeMenu === u.id && (
                      <>
                        <div onClick={() => setActiveMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                        <div style={{ position: 'absolute', top: '100%', right: 14, background: '#fff', borderRadius: 8, boxShadow: SHADOWS.elevated, zIndex: 99, minWidth: 180, overflow: 'hidden' }}>
                          {['Edit', 'Deactivate', 'Reset Password', 'Set as Super Admin'].map((action) => (
                            <button
                              key={action}
                              onClick={() => setActiveMenu(null)}
                              style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: action === 'Deactivate' ? COLORS.error : COLORS.navy, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F6FC' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create User Slide-over */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', zIndex: 200, boxShadow: SHADOWS.elevated, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Create User</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {formSuccess ? (
                <div style={{ background: `${COLORS.success}15`, border: `1px solid ${COLORS.success}40`, borderRadius: RADIUS.card, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.success, margin: 0 }}>User created. Invitation sent.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Full name" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="user@academy.com" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, assignedTo: '' })} style={{ ...inputStyle, background: '#fff' }}>
                      <option value="academy_admin">Academy Admin</option>
                      <option value="facility_admin">Facility Admin</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Assigned To</label>
                    <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                      <option value="">Select...</option>
                      {form.role === 'academy_admin'
                        ? academyStats.map((a) => <option key={a.academyId} value={a.name}>{a.name}</option>)
                        : facilities.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)
                      }
                    </select>
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>Phone (optional)</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+966 5XX XXX XXXX" />
                  </div>
                  <button onClick={handleSubmit} style={{ width: '100%', padding: '12px 0', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Create User
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
