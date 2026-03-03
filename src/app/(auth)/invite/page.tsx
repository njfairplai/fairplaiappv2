'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { COLORS } from '@/lib/constants'

export default function InvitePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) return
    setSubmitted(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none',
    fontFamily: 'Inter, sans-serif',
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.darkBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${COLORS.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={COLORS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Account Created!</h2>
        <p style={{ fontSize: 14, color: '#9DA2B3' }}>Redirecting you to login...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.darkBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Image src="/logo-white.png" alt="FairplAI" width={120} height={36} style={{ height: 36, width: 'auto', objectFit: 'contain', marginBottom: 24 }} />

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>You&apos;ve been invited to join FairPlai</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <Image src="/logos/mak-academy.jpeg" alt="MAK Academy" width={40} height={40} style={{ borderRadius: 8, height: 40, width: 40, objectFit: 'contain' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>MAK Academy</p>
              <p style={{ fontSize: 13, color: '#9DA2B3', margin: 0 }}>Invited by Tariq Makkawi · Coach</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={8} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <p style={{ fontSize: 13, color: COLORS.error, margin: '0 0 12px' }}>Passwords do not match</p>
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 13, color: '#9DA2B3' }}>I agree to the <span style={{ color: COLORS.primary }}>Terms of Service</span> and <span style={{ color: COLORS.primary }}>Privacy Policy</span></span>
          </label>

          <Button fullWidth type="submit" disabled={!accepted || !password || password !== confirmPassword}>
            Accept & Create Account
          </Button>
        </form>
      </div>
    </div>
  )
}
