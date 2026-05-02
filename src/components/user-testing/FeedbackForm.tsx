'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES } from '@/lib/themes'

const ROLES = [
  { value: '', label: 'Pick one (optional)' },
  { value: 'coach', label: 'Coach' },
  { value: 'academy_admin', label: 'Academy admin' },
  { value: 'parent', label: 'Parent' },
  { value: 'player', label: 'Player' },
  { value: 'other', label: 'Other' },
]

export function FeedbackForm() {
  const router = useRouter()
  const [themeChosen, setThemeChosen] = useState<string>('')
  const [whatWorked, setWhatWorked] = useState('')
  const [whatDidnt, setWhatDidnt] = useState('')
  const [whatsMissing, setWhatsMissing] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = !!themeChosen && whatWorked.trim().length > 0 && whatDidnt.trim().length > 0 && !submitting

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    let dwell: Record<string, number> = {}
    try {
      const raw = localStorage.getItem('fairplai-testing-dwell')
      if (raw) dwell = JSON.parse(raw)
    } catch { /* noop */ }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_chosen: themeChosen,
          what_worked: whatWorked,
          what_didnt: whatDidnt,
          whats_missing: whatsMissing,
          role: role || null,
          email: email || null,
          dwell_seconds: dwell,
        }),
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      // Clear dwell so a follow-up vote doesn't double-count
      try { localStorage.removeItem('fairplai-testing-dwell') } catch { /* noop */ }
      router.push('/user-testing/feedback?submitted=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
      setSubmitting(false)
    }
  }

  const labelStyle = {
    fontFamily: 'var(--font-fragment)',
    fontSize: 11,
    letterSpacing: '0.2em',
    color: 'var(--brand-indigo-mute)',
    fontWeight: 700,
    display: 'block',
    marginBottom: 8,
  } as const

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--brand-paper)',
    border: '1px solid var(--brand-line)',
    borderRadius: 8,
    fontFamily: 'var(--font-satoshi)',
    fontSize: 15,
    color: 'var(--brand-indigo)',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 1. Which theme won */}
      <div>
        <label style={labelStyle}>1. WHICH PALETTE FELT RIGHT?</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THEMES.map(t => {
            const active = themeChosen === t.id
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: active ? 'var(--brand-yellow-soft)' : 'var(--brand-paper)',
                  border: `1px solid ${active ? 'var(--brand-yellow)' : 'var(--brand-line)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.id}
                  checked={active}
                  onChange={() => setThemeChosen(t.id)}
                  style={{ accentColor: 'var(--brand-indigo)' }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  {t.swatches.map((c, i) => (
                    <span key={i} style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      background: c,
                      border: '1px solid rgba(0,0,0,0.08)',
                    }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-fragment)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--brand-indigo-mute)' }}>
                    {t.tagline.toUpperCase()}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* 2. What worked */}
      <div>
        <label style={labelStyle} htmlFor="what-worked">2. WHAT WORKED ABOUT THE PALETTE YOU PICKED?</label>
        <textarea
          id="what-worked"
          value={whatWorked}
          onChange={e => setWhatWorked(e.target.value)}
          placeholder="What stood out, what felt right, what made you trust it…"
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* 3. What didn't */}
      <div>
        <label style={labelStyle} htmlFor="what-didnt">3. WHAT DIDN&apos;T LAND IN THE OTHERS?</label>
        <textarea
          id="what-didnt"
          value={whatDidnt}
          onChange={e => setWhatDidnt(e.target.value)}
          placeholder="What threw you off, what felt wrong, what missed the mark…"
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* 4. What's missing */}
      <div>
        <label style={labelStyle} htmlFor="whats-missing">4. ANYTHING MISSING FROM THE COACH PORTAL? (optional)</label>
        <textarea
          id="whats-missing"
          value={whatsMissing}
          onChange={e => setWhatsMissing(e.target.value)}
          placeholder="Features, info, interactions you'd want to see…"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* 5. Role */}
      <div>
        <label style={labelStyle} htmlFor="role">5. YOUR ROLE</label>
        <select
          id="role"
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* 6. Email */}
      <div>
        <label style={labelStyle} htmlFor="email">6. EMAIL FOR FOLLOW-UP (optional)</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </div>

      {/* Submit */}
      {error && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--brand-yellow-soft)',
          border: '1px solid var(--brand-coral)',
          borderRadius: 8,
          color: 'var(--brand-indigo)',
          fontSize: 14,
        }}>
          Couldn&apos;t submit your response: {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          padding: '14px 24px',
          background: canSubmit ? 'var(--brand-indigo)' : 'var(--brand-indigo-soft)',
          color: canSubmit ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-satoshi)',
          fontWeight: 700,
          fontSize: 15,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          alignSelf: 'flex-start',
          boxShadow: canSubmit ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        {submitting ? 'Submitting…' : 'Submit feedback →'}
      </button>
    </form>
  )
}
