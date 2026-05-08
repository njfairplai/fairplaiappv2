'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { ADMIN_PASSWORD, unlockAdmin } from '@/lib/admin-gate'

/**
 * Founder-only password screen for the /admin gate. On correct
 * password, sets the unlock flag in localStorage and routes to /admin
 * (which then renders the portal picker).
 *
 * Whitespace is trimmed before compare so a tester typing on mobile
 * doesn't get burned by an autocorrect-added space.
 */
export default function AdminUnlockPage() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (pw.trim() === ADMIN_PASSWORD) {
      unlockAdmin()
      router.replace('/admin')
    } else {
      setError("That's not it.")
      setShake(true)
      setTimeout(() => setShake(false), 320)
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
            FAIRPLAI · ADMIN
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
          One password unlocks every portal — coach, parent, super admin —
          without going through the demo flow. You only need to enter
          this once on this device.
        </p>

        <input
          type="password"
          autoFocus
          value={pw}
          onChange={e => {
            setPw(e.target.value)
            if (error) setError(null)
          }}
          placeholder="Password"
          aria-label="Admin password"
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
          disabled={pw.trim().length === 0}
          style={{
            padding: '13px 18px',
            background: pw.trim() ? 'var(--brand-indigo)' : 'var(--brand-line-soft)',
            color: pw.trim() ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-satoshi)',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.02em',
            cursor: pw.trim() ? 'pointer' : 'default',
            transition: 'all 160ms ease',
          }}
        >
          Unlock →
        </button>
      </form>
    </main>
  )
}
