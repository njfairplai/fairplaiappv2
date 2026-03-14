'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { COLORS } from '@/lib/constants'
import { Check, ArrowLeft, Eye, EyeOff } from 'lucide-react'

type Step = 'email' | 'sent' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const hasMinLength = newPassword.length >= 8
  const hasNumber = /\d/.test(newPassword)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  const passwordValid = hasMinLength && hasNumber && hasSpecial

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

  function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setStep('sent')
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.length === 6) setStep('reset')
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordValid) return
    setStep('success')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.navy,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendLink}>
            <button type="button" onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9DA2B3', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              <ArrowLeft size={16} /> Back to login
            </button>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px', textAlign: 'center' }}>Forgot password?</h2>
            <p style={{ fontSize: 14, color: '#9DA2B3', margin: '0 0 24px', textAlign: 'center' }}>Enter your email and we&apos;ll send you a reset link</p>
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} required />
            <button type="submit" style={{ width: '100%', height: 52, borderRadius: 8, background: COLORS.primary, color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Send Reset Link
            </button>
          </form>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${COLORS.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={24} color={COLORS.success} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Check your email</h2>
            <p style={{ fontSize: 14, color: '#9DA2B3', margin: '0 0 24px' }}>We sent a reset link to {email}. Enter the 6-digit code below.</p>
            <form onSubmit={handleVerifyCode}>
              <input type="text" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ ...inputStyle, textAlign: 'center', letterSpacing: 8, fontSize: 24, marginBottom: 16 }} maxLength={6} />
              <button type="submit" disabled={code.length !== 6} style={{ width: '100%', height: 52, borderRadius: 8, background: COLORS.primary, color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: code.length === 6 ? 'pointer' : 'default', opacity: code.length === 6 ? 1 : 0.4, fontFamily: 'Inter, sans-serif' }}>
                Verify Code
              </button>
            </form>
            <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 16 }}>
              Didn&apos;t receive the email?{' '}
              <button onClick={() => setStep('email')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 13, fontWeight: 600 }}>Try again</button>
            </p>
          </div>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px', textAlign: 'center' }}>Set new password</h2>
            <p style={{ fontSize: 14, color: '#9DA2B3', margin: '0 0 24px', textAlign: 'center' }}>Create a secure password for your account</p>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...inputStyle, paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPassword ? <EyeOff size={18} color="#9DA2B3" /> : <Eye size={18} color="#9DA2B3" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {[
                  { label: 'At least 8 characters', ok: hasMinLength },
                  { label: 'At least 1 number', ok: hasNumber },
                  { label: 'At least 1 special character', ok: hasSpecial },
                ].map((rule) => (
                  <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: rule.ok ? `${COLORS.success}20` : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {rule.ok && <Check size={10} color={COLORS.success} />}
                    </div>
                    <span style={{ fontSize: 13, color: rule.ok ? COLORS.success : '#9DA2B3' }}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={!passwordValid} style={{ width: '100%', height: 52, borderRadius: 8, background: COLORS.primary, color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: passwordValid ? 'pointer' : 'default', opacity: passwordValid ? 1 : 0.4, fontFamily: 'Inter, sans-serif' }}>
              Reset Password
            </button>
          </form>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${COLORS.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={24} color={COLORS.success} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Password reset!</h2>
            <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0 }}>Redirecting you to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}
