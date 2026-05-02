'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES } from '@/lib/themes'

/**
 * Feedback form for /user-testing/feedback.
 *
 * **PALETTE TEST ONLY.** This form gathers feedback on the colour palettes,
 * not on features or usability. Per-feature usefulness ratings have been
 * removed — they belong in the future portal-usability test (separate route)
 * once the rest of the coach portal is redesigned and a winning palette is
 * picked.
 *
 * Sections:
 *   A. Palette vote (single-select)
 *   B. Three-word descriptor (chip multi-select, max 3)
 *   C. Overall feel (3× Likert 1–5)
 *   D. NPS 0–10
 *   E. One open textarea (optional)
 *   F. Role + email (optional)
 *
 * Click-heavy by design: only one optional textarea so submission isn't
 * blocked on writing. ~2-3 min to complete.
 *
 * The whole structured payload posts as JSONB in `responses`, plus the
 * palette vote denormalised at the top level for easy filtering.
 */

const ROLES = [
  { value: '', label: 'Pick one (optional)' },
  { value: 'coach', label: 'Coach' },
  { value: 'academy_admin', label: 'Academy admin' },
  { value: 'parent', label: 'Parent' },
  { value: 'player', label: 'Player' },
  { value: 'analyst', label: 'Performance analyst' },
  { value: 'tech', label: 'Tech / engineering' },
  { value: 'other', label: 'Other' },
]

const DESCRIPTOR_WORDS = [
  // positive
  'Modern', 'Calm', 'Premium', 'Trustworthy', 'Clear', 'Bold', 'Professional', 'Playful',
  // neutral
  'Different',
  // negative
  'Cluttered', 'Confusing', 'Busy', 'Cold', 'Outdated', 'Cheap', 'Generic',
] as const

const FEEL_STATEMENTS = [
  { key: 'professional', label: 'This palette looks professional.' },
  { key: 'scan',         label: 'The page is easy to scan in this palette.' },
  { key: 'trust',        label: "I'd trust a coach product that looked like this." },
] as const

const LIKERT_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

const labelStyle = {
  fontFamily: 'var(--font-fragment)',
  fontSize: 11,
  letterSpacing: '0.2em',
  color: 'var(--brand-indigo-mute)',
  fontWeight: 700,
  display: 'block',
  marginBottom: 8,
} as const

const sectionEyebrow = {
  fontFamily: 'var(--font-fragment)',
  fontSize: 10,
  letterSpacing: '0.22em',
  color: 'var(--brand-indigo)',
  fontWeight: 700,
  marginBottom: 6,
} as const

const sectionHeadline = {
  fontFamily: 'var(--font-clash)',
  fontSize: 22,
  letterSpacing: '-0.01em',
  color: 'var(--brand-indigo)',
  margin: '0 0 18px',
  lineHeight: 1.2,
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

/** Once-per-section scale header that names the 1-5 anchors. Saves us
 *  repeating the end-tags on every row, which keeps the rows tight. */
function ScaleHeader({ leftLabel, rightLabel }: { leftLabel: string; rightLabel: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-fragment)',
      fontSize: 9.5,
      letterSpacing: '0.18em',
      color: 'var(--brand-indigo-mute)',
      fontWeight: 700,
      marginBottom: 8,
      paddingLeft: 4,
      paddingRight: 4,
    }}>
      <span>1 · {leftLabel.toUpperCase()}</span>
      <span>{rightLabel.toUpperCase()} · 5</span>
    </div>
  )
}

/** Single-row Likert scale: a label, then 5 round buttons with end-tags.
 *  Tight vertical rhythm so the rows read as a connected list rather than
 *  a wall of equal-weight items. */
function LikertRow({ label, value, onChange, ends, showEnds }: {
  label: string
  value: number | null
  onChange: (v: number) => void
  ends: [string, string]
  showEnds: boolean
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: 16,
      padding: '10px 0',
      borderBottom: '1px solid var(--brand-line-soft)',
    }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-indigo)', lineHeight: 1.35 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {showEnds && (
          <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--brand-indigo-mute)', marginRight: 6, fontWeight: 700 }}>
            {ends[0].toUpperCase()}
          </span>
        )}
        {[1, 2, 3, 4, 5].map(n => {
          const active = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of 5`}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: active ? 'var(--brand-indigo)' : 'var(--brand-paper)',
                color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                border: `1px solid ${active ? 'var(--brand-indigo)' : 'var(--brand-line)'}`,
                fontFamily: 'var(--font-clash)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
            >{n}</button>
          )
        })}
        {showEnds && (
          <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--brand-indigo-mute)', marginLeft: 6, fontWeight: 700 }}>
            {ends[1].toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}

/** 0-10 NPS scale: 11 buttons in a row with low/high anchor labels. */
function NPSScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const active = value === n
          // Tone: 0-6 detractor, 7-8 passive, 9-10 promoter
          const tone = n <= 6 ? 'var(--brand-coral)' : n <= 8 ? 'var(--brand-indigo-mid)' : 'var(--brand-yellow)'
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Score ${n} out of 10`}
              style={{
                flex: 1,
                minWidth: 38,
                height: 44,
                borderRadius: 7,
                background: active ? tone : 'var(--brand-paper)',
                color: active ? (n >= 9 ? 'var(--brand-indigo)' : 'var(--brand-sand)') : 'var(--brand-indigo)',
                border: `1px solid ${active ? tone : 'var(--brand-line)'}`,
                fontFamily: 'var(--font-clash)',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
            >{n}</button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-fragment)', fontSize: 9.5, letterSpacing: '0.18em', color: 'var(--brand-indigo-mute)', fontWeight: 700 }}>
        <span>NOT AT ALL LIKELY</span>
        <span>EXTREMELY LIKELY</span>
      </div>
    </div>
  )
}

export function FeedbackForm() {
  const router = useRouter()

  // Section A: palette
  const [paletteVote, setPaletteVote] = useState<string>('')

  // Section B: descriptor words (max 3)
  const [words, setWords] = useState<string[]>([])
  const toggleWord = (w: string) => {
    setWords(prev => {
      if (prev.includes(w)) return prev.filter(x => x !== w)
      if (prev.length >= 3) return prev // cap at 3
      return [...prev, w]
    })
  }

  // Section C: overall feel (1-5 each)
  const [feel, setFeel] = useState<Record<string, number | null>>(
    Object.fromEntries(FEEL_STATEMENTS.map(s => [s.key, null]))
  )
  const setFeelKey = (key: string, v: number) => setFeel(prev => ({ ...prev, [key]: v }))

  // Section D: NPS
  const [nps, setNps] = useState<number | null>(null)

  // Section E: open
  const [whatsMissing, setWhatsMissing] = useState('')

  // Section F: about you
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Required: palette + words >= 1 + all feel + nps
  const allFeelAnswered = FEEL_STATEMENTS.every(s => feel[s.key] !== null)
  const canSubmit =
    !!paletteVote &&
    words.length > 0 &&
    allFeelAnswered &&
    nps !== null &&
    !submitting

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

    const responses = {
      palette_words: words,
      feel,
      nps,
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          palette_vote: paletteVote,
          responses,
          whats_missing: whatsMissing,
          role: role || null,
          email: email || null,
          dwell_seconds: dwell,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Server returned ${res.status}`)
      }
      try { localStorage.removeItem('fairplai-testing-dwell') } catch { /* noop */ }
      router.push('/user-testing/feedback?submitted=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* ────────── Section A: palette vote ────────── */}
      <section>
        <div style={sectionEyebrow}>SECTION A · THE PALETTE</div>
        <h2 style={sectionHeadline}>Which palette felt right?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THEMES.map(t => {
            const active = paletteVote === t.id
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: active ? 'var(--brand-yellow-soft)' : 'var(--brand-paper)',
                  border: `1px solid ${active ? 'var(--brand-yellow)' : 'var(--brand-line)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
              >
                <input
                  type="radio"
                  name="palette"
                  value={t.id}
                  checked={active}
                  onChange={() => setPaletteVote(t.id)}
                  style={{ accentColor: 'var(--brand-indigo)' }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  {t.swatches.map((c, i) => (
                    <span key={i} style={{ width: 18, height: 18, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
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
      </section>

      {/* ────────── Section B: three words ────────── */}
      <section>
        <div style={sectionEyebrow}>SECTION B · GUT REACTION</div>
        <h2 style={sectionHeadline}>Pick up to three words that describe the design.</h2>
        <div style={{ ...labelStyle, marginBottom: 14 }}>
          {words.length}/3 SELECTED
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DESCRIPTOR_WORDS.map(w => {
            const active = words.includes(w)
            const disabled = !active && words.length >= 3
            return (
              <button
                key={w}
                type="button"
                onClick={() => toggleWord(w)}
                disabled={disabled}
                style={{
                  padding: '8px 14px',
                  background: active ? 'var(--brand-indigo)' : 'var(--brand-paper)',
                  color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                  border: `1px solid ${active ? 'var(--brand-indigo)' : 'var(--brand-line)'}`,
                  borderRadius: 999,
                  fontFamily: 'var(--font-satoshi)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  transition: 'all 140ms ease',
                }}
              >
                {w}
              </button>
            )
          })}
        </div>
      </section>

      {/* ────────── Section C: overall feel about the palette ────────── */}
      <section>
        <div style={sectionEyebrow}>SECTION C · OVERALL FEEL</div>
        <h2 style={sectionHeadline}>How much do you agree about the palette you picked?</h2>
        <ScaleHeader leftLabel={LIKERT_LABELS[0]} rightLabel={LIKERT_LABELS[4]} />
        <div style={{ background: 'var(--brand-paper)', border: '1px solid var(--brand-line)', borderRadius: 10, padding: '4px 16px' }}>
          {FEEL_STATEMENTS.map(s => (
            <LikertRow
              key={s.key}
              label={s.label}
              value={feel[s.key]}
              onChange={v => setFeelKey(s.key, v)}
              ends={[LIKERT_LABELS[0], LIKERT_LABELS[4]]}
              showEnds={false}
            />
          ))}
        </div>
      </section>

      {/* ────────── Section D: NPS ────────── */}
      <section>
        <div style={sectionEyebrow}>SECTION D · RECOMMENDATION</div>
        <h2 style={sectionHeadline}>If the design used your favourite palette, how likely would you recommend Fairplai to another coach?</h2>
        <NPSScale value={nps} onChange={setNps} />
      </section>

      {/* ────────── Section E: open ────────── */}
      <section>
        <div style={sectionEyebrow}>SECTION E · ANYTHING ELSE</div>
        <h2 style={sectionHeadline}>Anything else about the colours? (optional)</h2>
        <textarea
          value={whatsMissing}
          onChange={e => setWhatsMissing(e.target.value)}
          placeholder="Features, info, interactions you'd want to see…"
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </section>

      {/* ────────── Section F: about you ────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={sectionEyebrow}>SECTION F · ABOUT YOU</div>
          <h2 style={sectionHeadline}>Just two more.</h2>
        </div>
        <div>
          <label style={labelStyle} htmlFor="role">YOUR ROLE</label>
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
        <div>
          <label style={labelStyle} htmlFor="email">EMAIL FOR FOLLOW-UP (optional)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
      </section>

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

      {!canSubmit && !error && (
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}>
          ANSWER ALL REQUIRED QUESTIONS TO SUBMIT.
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
