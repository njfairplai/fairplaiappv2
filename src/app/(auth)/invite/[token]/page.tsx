'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { COLORS } from '@/lib/constants'
import { Mail, Shield } from 'lucide-react'

// Mock token → invitation mapping
function decodeInviteToken(token: string): { academy: string; role: string; invitedBy: string; email: string } | null {
  const invites: Record<string, { academy: string; role: string; invitedBy: string; email: string }> = {
    'parent-invite-001': { academy: 'MAK Academy', role: 'parent', invitedBy: 'Admin', email: 'parent@email.com' },
    'coach-invite-001': { academy: 'MAK Academy', role: 'coach', invitedBy: 'Admin', email: 'coach@email.com' },
    'admin-invite-001': { academy: 'Desert Eagles FC', role: 'academy_admin', invitedBy: 'FairplAI', email: 'admin@deserteagles.com' },
  }
  return invites[token] || null
}

export default function InviteTokenPage() {
  const router = useRouter()
  const { token } = useParams<{ token: string }>()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const invite = decodeInviteToken(token)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  }

  function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    if (!invite) return
    localStorage.setItem('fairplai_role', invite.role)
    router.push('/consent')
  }

  if (!invite) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain', marginBottom: 32 }} />
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${COLORS.error}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Shield size={24} color={COLORS.error} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Invalid invitation</h2>
        <p style={{ fontSize: 14, color: '#9DA2B3', margin: '0 0 24px', textAlign: 'center' }}>This invitation link is expired or invalid.</p>
        <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 14, fontWeight: 600 }}>Go to login</button>
      </div>
    )
  }

  const roleLabels: Record<string, string> = { parent: 'Parent/Player', coach: 'Coach', academy_admin: 'Academy Admin' }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Invitation Info */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${COLORS.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Mail size={20} color={COLORS.primary} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>You&apos;re invited!</h2>
          <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: '#fff' }}>{invite.academy}</strong> has invited you to join as a <strong style={{ color: COLORS.primary }}>{roleLabels[invite.role] || invite.role}</strong>
          </p>
        </div>

        {/* Accept Form */}
        <form onSubmit={handleAccept}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: '#9DA2B3', marginBottom: 6, display: 'block' }}>Your name</label>
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: '#9DA2B3', marginBottom: 6, display: 'block' }}>Email</label>
            <input type="email" value={invite.email} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: '#9DA2B3', marginBottom: 6, display: 'block' }}>Create a password</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={8} />
          </div>
          <button type="submit" disabled={!name || !password} style={{ width: '100%', height: 52, borderRadius: 8, background: COLORS.primary, color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: name && password ? 'pointer' : 'default', opacity: name && password ? 1 : 0.4, fontFamily: 'Inter, sans-serif' }}>
            Accept Invitation
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9DA2B3', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
          This invitation expires in 7 days.{' '}
          <a href="/login" style={{ color: COLORS.primary, textDecoration: 'none' }}>Already have an account?</a>
        </p>
      </div>
    </div>
  )
}
