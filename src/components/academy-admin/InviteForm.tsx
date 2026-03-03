'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { COLORS } from '@/lib/constants'
import { Check } from 'lucide-react'

interface InviteFormProps {
  open: boolean
  onClose: () => void
  type?: 'coach' | 'player'
}

export default function InviteForm({ open, onClose, type = 'coach' }: InviteFormProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend() {
    setSent(true)
    setTimeout(() => { setSent(false); setEmail(''); onClose() }, 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Invite ${type === 'coach' ? 'Coach' : 'Player'}`}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${COLORS.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Check size={24} color={COLORS.success} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Invitation Sent!</p>
          <p style={{ fontSize: 13, color: COLORS.muted }}>An invite link has been sent to {email}</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 4 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${type}@academy.com`}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none' }}
            />
          </div>
          <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>
            They&apos;ll receive an email with a link to join as a {type}.
          </p>
          <Button fullWidth onClick={handleSend} disabled={!email.includes('@')}>Send Invitation</Button>
        </>
      )}
    </Modal>
  )
}
