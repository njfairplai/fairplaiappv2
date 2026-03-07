'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import RosterTable from '@/components/academy-admin/RosterTable'
import RosterForm from '@/components/academy-admin/RosterForm'
import { COLORS, SHADOWS } from '@/lib/constants'

export default function RostersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Rosters</h1>
        <Button onClick={() => setFormOpen(true)}>Add Roster</Button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: SHADOWS.card }}>
        <RosterTable />
      </div>

      {formOpen && (
        <RosterForm
          onClose={() => setFormOpen(false)}
          onCreated={(roster) => {
            setToast(`Roster "${roster.name}" created`)
          }}
        />
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
