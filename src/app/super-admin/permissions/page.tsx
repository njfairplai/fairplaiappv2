'use client'

import { useState, useEffect } from 'react'
import { Info, Check } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { defaultPermissions } from '@/lib/mockData'

const ROLES = [
  { key: 'academy_admin', label: 'Academy Admin' },
  { key: 'facility_admin', label: 'Facility Admin' },
  { key: 'coach', label: 'Coach' },
  { key: 'parent', label: 'Parent' },
  { key: 'player', label: 'Player' },
]

const PERM_KEYS = ['view', 'create', 'edit', 'delete', 'export'] as const
type PermKey = typeof PERM_KEYS[number]

const STORAGE_KEY = 'fairplai_permissions'

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('academy_admin')
  const [permissions, setPermissions] = useState<Record<string, Record<string, Record<string, boolean>>>>(deepClone(defaultPermissions))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge stored overrides with defaults
        const merged = deepClone(defaultPermissions)
        for (const role of Object.keys(parsed)) {
          if (merged[role]) {
            for (const feature of Object.keys(parsed[role])) {
              if (merged[role][feature]) {
                merged[role][feature] = { ...merged[role][feature], ...parsed[role][feature] }
              }
            }
          }
        }
        setPermissions(merged)
      }
    } catch { /* ignore */ }
  }, [])

  const rolePerms = permissions[selectedRole] || {}
  const features = Object.keys(rolePerms)

  function togglePerm(feature: string, perm: PermKey) {
    setPermissions((prev) => {
      const next = deepClone(prev)
      if (next[selectedRole] && next[selectedRole][feature]) {
        next[selectedRole][feature][perm] = !next[selectedRole][feature][perm]
      }
      return next
    })
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 4px' }}>Role Permissions</h1>
      <p style={{ fontSize: 14, color: COLORS.muted, margin: '0 0 24px' }}>Manage feature access for each user role</p>

      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: `${COLORS.primary}08`, border: `1px solid ${COLORS.primary}30`, borderRadius: RADIUS.card, marginBottom: 24 }}>
        <Info size={16} color={COLORS.primary} />
        <p style={{ fontSize: 13, color: COLORS.navy, margin: 0 }}>Changes to permissions will be applied across all users with the selected role.</p>
      </div>

      {/* Role Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {ROLES.map((r) => (
          <button
            key={r.key}
            onClick={() => setSelectedRole(r.key)}
            style={{
              padding: '8px 18px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: selectedRole === r.key ? COLORS.primary : '#fff',
              color: selectedRole === r.key ? '#fff' : COLORS.navy,
              boxShadow: selectedRole === r.key ? 'none' : SHADOWS.card,
              transition: 'all 0.15s ease',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div style={{ background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}`, width: 200 }}>Feature</th>
              {PERM_KEYS.map((p) => (
                <th key={p} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: COLORS.muted, textAlign: 'center', borderBottom: `1px solid ${COLORS.border}`, textTransform: 'capitalize' }}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature}>
                <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{feature}</td>
                {PERM_KEYS.map((perm) => {
                  const allowed = rolePerms[feature]?.[perm] ?? false
                  // Determine if it's "view-only" (view=true, all others false) for partial display
                  const isViewOnly = perm === 'view' && allowed && !rolePerms[feature]?.create && !rolePerms[feature]?.edit && !rolePerms[feature]?.delete && !rolePerms[feature]?.export
                  const circleColor = allowed
                    ? (perm === 'view' && isViewOnly ? COLORS.warning : COLORS.success)
                    : COLORS.border
                  return (
                    <td key={perm} style={{ padding: '14px 20px', textAlign: 'center', borderBottom: `1px solid ${COLORS.border}` }}>
                      <button
                        onClick={() => togglePerm(feature, perm)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', border: `2px solid ${circleColor}`,
                          background: allowed ? circleColor : 'transparent',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {allowed && <Check size={14} color="#fff" strokeWidth={3} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, marginTop: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${COLORS.border}` }} />
          <span style={{ fontSize: 12, color: COLORS.muted }}>Not Allowed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: COLORS.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={10} color="#fff" strokeWidth={3} />
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Allowed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: COLORS.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={10} color="#fff" strokeWidth={3} />
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Partially Allowed</span>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={handleSave}
          style={{ padding: '12px 32px', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          Save Changes
        </button>
        {saved && (
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.success }}>Changes saved successfully.</span>
        )}
      </div>
    </div>
  )
}
