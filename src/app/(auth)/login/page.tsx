'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { COLORS, DEMO_ACCOUNTS, ROLE_PATHS } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/types'
import Button from '@/components/ui/Button'
import { Check } from 'lucide-react'

const CURRENT_POLICY_VERSION = '2.0'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magicLink, setMagicLink] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [error, setError] = useState('')

  const isDemoAccount = DEMO_ACCOUNTS.some(a => a.email === email)
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const showValidation = password.length > 0 && !isDemoAccount

  function redirectAfterAuth(role?: string) {
    // Consent screen is only required for parent/player role
    if (role === 'parent') {
      const consented = localStorage.getItem('fairplai_consented')
      const storedVersion = localStorage.getItem('policy_version')
      if (!consented || (storedVersion && storedVersion < CURRENT_POLICY_VERSION)) {
        router.push('/consent')
        return
      }
    }
    const path = role ? ROLE_PATHS[role] : '/'
    router.push(path || '/')
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const account = DEMO_ACCOUNTS.find((a) => a.email === email)
    if (account && password === 'demo1234') {
      login(account.email, account.role as UserRole)
      redirectAfterAuth(account.role)
    } else {
      setError('Invalid email or password. Try a demo account below.')
    }
  }

  function handleSocialLogin(provider: string) {
    void provider
    const role = localStorage.getItem('fairplai_role') || undefined
    redirectAfterAuth(role)
  }

  function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMagicSent(true)
  }

  function handleDemoSelect(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email)
    setPassword('demo1234')
    setMagicLink(false)
  }

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

  const socialBtnStyle: React.CSSProperties = {
    width: '100%',
    height: 52,
    borderRadius: 8,
    border: '1px solid #E8EAED',
    background: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    cursor: 'pointer',
    marginBottom: 12,
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    fontWeight: 500,
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image
            src="/logo-white.png"
            alt="FairplAI"
            width={140}
            height={42}
            style={{ height: 42, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {magicLink ? (
          magicSent ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `${COLORS.success}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={COLORS.success}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                Check your email
              </h2>
              <p style={{ fontSize: 14, color: '#9DA2B3', margin: '0 0 24px' }}>
                We sent a magic link to {email}
              </p>
              <button
                onClick={() => {
                  setMagicLink(false)
                  setMagicSent(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: COLORS.primary,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px',
                  textAlign: 'center',
                }}
              >
                Magic Link
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: '#9DA2B3',
                  margin: '0 0 24px',
                  textAlign: 'center',
                }}
              >
                Enter your email to receive a sign-in link
              </p>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...inputStyle, marginBottom: 16 }}
                required
              />
              <Button fullWidth type="submit">
                Send Magic Link
              </Button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => setMagicLink(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: COLORS.primary,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Sign in with password instead
                </button>
              </div>
            </form>
          )
        ) : (
          <>
            {/* Social Sign-in Buttons */}
            <div style={{ marginBottom: 4 }}>
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                style={{ ...socialBtnStyle, color: COLORS.navy }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#4285F4',
                    lineHeight: 1,
                  }}
                >
                  G
                </span>
                <span>Continue with Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                style={{ ...socialBtnStyle, color: '#000' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M14.94 13.38c-.34.78-.5 1.13-.94 1.82-.61.97-1.47 2.17-2.54 2.18-1.05.02-1.32-.68-2.74-.67-1.42.01-1.72.69-2.77.67-1.07-.01-1.88-1.08-2.49-2.05C1.82 12.48 1.7 9.6 2.78 8.08c.76-1.07 1.96-1.7 3.08-1.7 1.15 0 1.87.69 2.82.69.92 0 1.48-.69 2.81-.69 1 0 2.06.54 2.82 1.47-2.48 1.36-2.08 4.9.53 5.53zM11.3 4.7c.47-.61.83-1.47.7-2.35-.77.05-1.67.54-2.2 1.17-.47.57-.87 1.44-.72 2.28.84.03 1.71-.47 2.22-1.1z"
                    fill="#000"
                  />
                </svg>
                <span>Continue with Apple</span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                onClick={() => handleSocialLogin('microsoft')}
                style={{ ...socialBtnStyle, color: COLORS.navy }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="0" y="0" width="8" height="8" fill="#F25022" />
                  <rect x="10" y="0" width="8" height="8" fill="#7FBA00" />
                  <rect x="0" y="10" width="8" height="8" fill="#00A4EF" />
                  <rect x="10" y="10" width="8" height="8" fill="#FFB900" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '8px 0 20px',
                gap: 16,
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
              <span style={{ fontSize: 13, color: '#9DA2B3', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {showValidation && (
                <div style={{ marginBottom: 8, marginTop: 4 }}>
                  {[
                    { label: '8+ characters', ok: hasMinLength },
                    { label: '1 number', ok: hasNumber },
                    { label: '1 special character', ok: hasSpecial },
                  ].map((rule) => (
                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: rule.ok ? `${COLORS.success}20` : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {rule.ok && <Check size={8} color={COLORS.success} />}
                      </div>
                      <span style={{ fontSize: 11, color: rule.ok ? COLORS.success : '#9DA2B3' }}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p style={{ fontSize: 13, color: COLORS.error, margin: '8px 0', textAlign: 'center' }}>
                  {error}
                </p>
              )}

              <div style={{ textAlign: 'right', marginTop: 4, marginBottom: 12 }}>
                <button
                  onClick={() => router.push('/forgot-password')}
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9DA2B3', fontSize: 13 }}
                >
                  Forgot password?
                </button>
              </div>

              <div>
                <Button fullWidth type="submit">
                  Sign In
                </Button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => setMagicLink(true)}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: COLORS.primary,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Sign in with magic link instead
                </button>
              </div>
            </form>

            {/* T&C Note */}
            <p
              style={{
                fontSize: 12,
                color: '#9DA2B3',
                textAlign: 'center',
                marginTop: 20,
                lineHeight: 1.5,
              }}
            >
              By continuing you agree to our{' '}
              <a href="/terms" style={{ color: COLORS.primary, textDecoration: 'none' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" style={{ color: COLORS.primary, textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </p>
          </>
        )}

        {/* Demo Accounts */}
        <div
          style={{
            marginTop: 40,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#6E7180',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}
          >
            Demo Accounts
          </p>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              onClick={() => handleDemoSelect(a)}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 12,
                color: '#9DA2B3',
              }}
            >
              <span style={{ color: COLORS.primary, fontWeight: 600 }}>{a.email}</span> → {a.label}
            </button>
          ))}
          <p style={{ fontSize: 11, color: '#6E7180', margin: '8px 0 0' }}>Password: demo1234</p>
        </div>
      </div>
    </div>
  )
}
