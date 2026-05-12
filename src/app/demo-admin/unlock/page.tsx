'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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
    <main className="flex min-h-screen items-center justify-center bg-brand-sand px-5 py-10 font-satoshi text-brand-indigo">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>

      <form
        onSubmit={tryUnlock}
        className={cn(
          'flex w-full max-w-[380px] flex-col gap-[18px]',
          shake && '[animation:shake_0.3s_ease]',
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-indigo text-brand-yellow">
            <Lock size={18} />
          </span>
          <span className="font-fragment text-[11px] font-extrabold tracking-[0.22em] text-brand-indigo-mute">
            FAIRPLAI · DEMO ADMIN
          </span>
        </div>

        <h1 className="m-0 font-clash text-4xl font-bold leading-[1.05] tracking-[-0.02em]">
          Founder access.
        </h1>
        <p className="m-0 text-sm leading-[1.5] text-brand-indigo-mute">
          One password unlocks every portal — coach, parent — and the
          user-testing feedback viewer. Cookie-based, so your laptop and
          phone each unlock once and remember.
        </p>

        <Input
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
          invalid={!!error}
        />

        {error && (
          <span className="font-satoshi text-[12.5px] font-semibold text-brand-coral">
            {error}
          </span>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={pw.trim().length === 0 || submitting}
          className="rounded-lg"
        >
          {submitting ? 'Checking…' : 'Unlock →'}
        </Button>
      </form>
    </main>
  )
}
