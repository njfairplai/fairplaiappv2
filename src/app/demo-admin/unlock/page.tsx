'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

/**
 * Founder password screen for /demo-admin. Posts the password to
 * /api/demo-admin/unlock; on success the server sets an httpOnly cookie
 * and we hard-navigate to /demo-admin so middleware re-runs and lets us
 * through.
 *
 * Compare on the server is case-insensitive + trimmed (matching legacy
 * /admin gate) so mobile autocorrect can't silently reject the right
 * password.
 */
export default function DemoAdminUnlockPage() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!pw.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/demo-admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || `Server returned ${res.status}`)
        setShake(true)
        setTimeout(() => setShake(false), 320)
        setSubmitting(false)
        return
      }
      // Hard navigation so middleware re-runs against the freshly set cookie.
      window.location.href = '/demo-admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setShake(true)
      setTimeout(() => setShake(false), 320)
      setSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--brand-sand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>

      <form
        onSubmit={tryUnlock}
        style={{
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          animation: shake ? 'shake 0.3s ease' : undefined,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--brand-indigo)',
              color: 'var(--brand-yellow)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={18} />
          </span>
          <span
            style={{
              fontFamily: 'var(--font-fragment), monospace',
              fontSize: 11,
              letterSpacing: '0.22em',
              fontWeight: 800,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            FAIRPLAI · DEMO ADMIN
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash), serif',
            fontSize: 36,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: 0,
            fontWeight: 700,
          }}
        >
          Founder access.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--brand-indigo-mute)', margin: 0, lineHeight: 1.5 }}>
          One password unlocks every portal — coach, parent — and the
          user-testing feedback viewer. Cookie-based, so your laptop and
          phone each unlock once and remember.
        </p>

        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={pw}
          onChange={e => {
            setPw(e.target.value)
            if (error) setError(null)
          }}
          placeholder="Password"
          aria-label="Demo-admin password"
          style={{
            padding: '14px 16px',
            background: 'var(--brand-paper)',
            border: `1px solid ${error ? 'var(--brand-coral)' : 'var(--brand-line)'}`,
            borderRadius: 8,
            fontFamily: 'var(--font-satoshi)',
            fontSize: 15,
            color: 'var(--brand-indigo)',
            outline: 'none',
            transition: 'border-color 160ms ease',
          }}
        />

        {error && (
          <span
            style={{
              fontFamily: 'var(--font-satoshi)',
              fontSize: 12.5,
              color: 'var(--brand-coral)',
              fontWeight: 600,
            }}
          >
            {error}
          </span>
        )}

        <button
          type="submit"
          disabled={pw.trim().length === 0 || submitting}
          style={{
            padding: '13px 18px',
            background: pw.trim() && !submitting ? 'var(--brand-indigo)' : 'var(--brand-line-soft)',
            color: pw.trim() && !submitting ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-satoshi)',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.02em',
            cursor: pw.trim() && !submitting ? 'pointer' : 'default',
            transition: 'all 160ms ease',
          }}
        >
          {submitting ? 'Checking…' : 'Unlock →'}
        </button>
      </form>
    </main>
  )
}
