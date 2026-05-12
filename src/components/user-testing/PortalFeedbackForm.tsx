'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES } from '@/lib/themes'
import {
  COMPREHENSION_QUESTIONS,
  FEATURES,
  FAVOURITE_QUESTION,
  FEEL_QUESTIONS,
  INTENT_OPTIONS,
  INTENT_QUESTION,
  KILL_QUESTION,
  MISSING_QUESTION,
  NPS_QUESTION,
  ROLES,
  SECTIONS,
  SURPRISE_QUESTION,
  questionLabel,
  resolveRole,
  type IntentValue,
  type Role,
} from '@/lib/feedback-schema'

/**
 * Phase 2B form (Slice 4.5 + audit redesign): app feedback after the user
 * has explored the portal in their chosen palette.
 *
 * Reads palette + words from localStorage (set by PaletteVoteForm in Phase 1B)
 * and bundles them with the new answers into ONE submission to /api/feedback.
 *
 * Sections (in render order):
 *   B. Comprehension (3 Likerts: tour clarity, mikel, score)
 *   C. Overall feel (2 Likerts: professional, trust — role-aware)
 *   D. Favourite features (multi-select chips, max 3)
 *   E. Kill-list features (multi-select chips, no max)
 *   F. Intent (yes / maybe / no — role-aware)
 *   G. NPS 0-10 (role-aware)
 *   H. Surprise (open textarea)
 *   I. What's missing (open textarea)
 *   J. Role + email
 *
 * The schema (questions, role-aware labels, dotted keys) lives in
 * src/lib/feedback-schema.ts so the admin viewer can render the same
 * structure without drift.
 */

const LIKERT_LABELS = ['Strongly disagree', 'Strongly agree']

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

function LikertRow({ label, value, onChange }: {
  label: string
  value: number | null
  onChange: (v: number) => void
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
      <div style={{ display: 'flex', gap: 5 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const active = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of 5`}
              style={{
                width: 32, height: 32, borderRadius: '50%',
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
      </div>
    </div>
  )
}

function LikertGroup({
  questions,
  values,
  setValue,
  role,
}: {
  questions: { key: string; label: string | ((r: Role) => string) }[]
  values: Record<string, number | null>
  setValue: (k: string, v: number) => void
  role: Role
}) {
  return (
    <div style={{ background: 'var(--brand-paper)', border: '1px solid var(--brand-line)', borderRadius: 10, padding: '4px 16px' }}>
      {questions.map(q => (
        <LikertRow
          key={q.key}
          label={typeof q.label === 'function' ? q.label(role) : q.label}
          value={values[q.key] ?? null}
          onChange={v => setValue(q.key, v)}
        />
      ))}
    </div>
  )
}

function NPSScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const active = value === n
          const tone = n <= 6 ? 'var(--brand-coral)' : n <= 8 ? 'var(--brand-indigo-mid)' : 'var(--brand-yellow)'
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Score ${n} out of 10`}
              style={{
                flex: 1, minWidth: 38, height: 44,
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

function IntentChoice({ value, onChange }: { value: IntentValue | null; onChange: (v: IntentValue) => void }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {INTENT_OPTIONS.map(opt => {
        const active = value === opt.value
        const activeBg =
          opt.tone === 'positive' ? 'var(--brand-yellow)' :
          opt.tone === 'negative' ? 'var(--brand-coral)' :
          'var(--brand-indigo)'
        const activeText =
          opt.tone === 'positive' ? 'var(--brand-indigo)' : 'var(--brand-sand)'
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: '1 1 100px',
              minWidth: 100,
              padding: '14px 18px',
              background: active ? activeBg : 'var(--brand-paper)',
              color: active ? activeText : 'var(--brand-indigo)',
              border: `1px solid ${active ? activeBg : 'var(--brand-line)'}`,
              borderRadius: 10,
              fontFamily: 'var(--font-clash)',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function PortalFeedbackForm() {
  const router = useRouter()

  // Phase 1 answers from localStorage
  const [phase1, setPhase1] = useState<{ palette_vote: string; palette_words: string[] } | null>(null)
  const [phase1Loaded, setPhase1Loaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fairplai-testing-palette')
      if (raw) setPhase1(JSON.parse(raw))
    } catch { /* noop */ }
    setPhase1Loaded(true)
  }, [])

  // Comprehension Likerts (B)
  const [comprehension, setComprehension] = useState<Record<string, number | null>>(
    Object.fromEntries(COMPREHENSION_QUESTIONS.map(q => [q.key, null]))
  )
  const setComprehensionKey = (k: string, v: number) =>
    setComprehension(prev => ({ ...prev, [k]: v }))

  // Feel Likerts (C) — kept under 'feel.<short>' nested for back-compat with
  // the JSONB shape; in the form state we flatten then re-nest at submit.
  const [feel, setFeel] = useState<Record<string, number | null>>(
    Object.fromEntries(FEEL_QUESTIONS.map(q => [q.key, null]))
  )
  const setFeelKey = (k: string, v: number) => setFeel(prev => ({ ...prev, [k]: v }))

  // Features (D + E)
  const [favouriteFeatures, setFavouriteFeatures] = useState<string[]>([])
  const [killFeatures, setKillFeatures] = useState<string[]>([])
  const toggleFav = (k: string) => {
    setFavouriteFeatures(prev => {
      if (prev.includes(k)) return prev.filter(x => x !== k)
      if (FAVOURITE_QUESTION.max && prev.length >= FAVOURITE_QUESTION.max) return prev
      return [...prev, k]
    })
  }
  const toggleKill = (k: string) => {
    setKillFeatures(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  // Intent (F)
  const [intent, setIntent] = useState<IntentValue | null>(null)

  // NPS (G)
  const [nps, setNps] = useState<number | null>(null)

  // Open text (H, I)
  const [surprise, setSurprise] = useState('')
  const [whatsMissing, setWhatsMissing] = useState('')

  // About you (J)
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedRole: Role = useMemo(() => resolveRole(role), [role])

  const allComprehensionAnswered = COMPREHENSION_QUESTIONS.every(q => comprehension[q.key] !== null)
  const allFeelAnswered = FEEL_QUESTIONS.every(q => feel[q.key] !== null)
  const canSubmit =
    !!phase1?.palette_vote &&
    allComprehensionAnswered &&
    allFeelAnswered &&
    favouriteFeatures.length > 0 &&
    intent !== null &&
    nps !== null &&
    !submitting

  // If they got here without phase 1 data, send them back to /vote.
  if (phase1Loaded && !phase1?.palette_vote) {
    return (
      <div style={{
        padding: 24,
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 10,
      }}>
        <div style={{ fontFamily: 'var(--font-fragment)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--brand-indigo-mute)', fontWeight: 700, marginBottom: 6 }}>
          MISSING PHASE 1
        </div>
        <h2 style={{ fontFamily: 'var(--font-clash)', fontSize: 24, margin: '0 0 12px' }}>You skipped a step.</h2>
        <p style={{ marginBottom: 18 }}>Please go back and pick a palette before giving app feedback.</p>
        <button
          onClick={() => router.push('/user-testing')}
          style={{
            background: 'var(--brand-indigo)', color: 'var(--brand-sand)', border: 'none',
            padding: '10px 18px', borderRadius: 7, fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >← Start over</button>
      </div>
    )
  }

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

    // Build the responses payload from the form state. The schema expects
    // feel.{professional,trust} nested; everything else is flat.
    const feelOut: Record<string, number | null> = {}
    for (const q of FEEL_QUESTIONS) {
      const subKey = q.key.split('.')[1] ?? q.key
      feelOut[subKey] = feel[q.key]
    }
    const comprehensionOut: Record<string, number | null> = {}
    for (const q of COMPREHENSION_QUESTIONS) comprehensionOut[q.key] = comprehension[q.key]

    const payload = {
      palette_vote: phase1!.palette_vote,
      responses: {
        palette_words: phase1!.palette_words,
        ...comprehensionOut,
        feel: feelOut,
        favourite_features: favouriteFeatures,
        kill_features: killFeatures,
        intent,
        nps,
        surprise: surprise.trim() || null,
      },
      whats_missing: whatsMissing.trim() || null,
      role: role || null,
      email: email || null,
      dwell_seconds: dwell,
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Server returned ${res.status}`)
      }
      try {
        localStorage.removeItem('fairplai-testing-dwell')
        localStorage.removeItem('fairplai-testing-palette')
      } catch { /* noop */ }
      router.push('/user-testing/feedback?submitted=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
      setSubmitting(false)
    }
  }

  if (!phase1Loaded) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--brand-indigo-mute)' }}>Loading…</div>
  }

  const chosen = THEMES.find(t => t.id === phase1!.palette_vote)

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Phase 1 recap card */}
      {chosen && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--brand-yellow-soft)',
          border: '1px solid var(--brand-yellow)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'var(--font-fragment)',
            fontSize: 10,
            letterSpacing: '0.22em',
            fontWeight: 700,
          }}>YOU PICKED</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {chosen.swatches.map((c, i) => (
                <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-clash)', fontSize: 18, letterSpacing: '-0.01em' }}>{chosen.name}</span>
          </div>
          {phase1!.palette_words.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {phase1!.palette_words.map(w => (
                <span key={w} style={{
                  fontSize: 11, padding: '2px 8px',
                  background: 'var(--brand-indigo)', color: 'var(--brand-sand)',
                  borderRadius: 999, fontWeight: 600,
                }}>{w}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section B: comprehension */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.comprehension}</div>
        <h2 style={sectionHeadline}>Did the tour land?</h2>
        <ScaleHeader leftLabel={LIKERT_LABELS[0]} rightLabel={LIKERT_LABELS[1]} />
        <LikertGroup
          questions={COMPREHENSION_QUESTIONS}
          values={comprehension}
          setValue={setComprehensionKey}
          role={resolvedRole}
        />
      </section>

      {/* Section C: feel */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.feel}</div>
        <h2 style={sectionHeadline}>How does the app feel?</h2>
        <ScaleHeader leftLabel={LIKERT_LABELS[0]} rightLabel={LIKERT_LABELS[1]} />
        <LikertGroup
          questions={FEEL_QUESTIONS}
          values={feel}
          setValue={setFeelKey}
          role={resolvedRole}
        />
      </section>

      {/* Section D: favourites */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.features}</div>
        <h2 style={sectionHeadline}>{FAVOURITE_QUESTION.label}</h2>
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 12,
        }}>PICK UP TO {FAVOURITE_QUESTION.max ?? '—'} · {favouriteFeatures.length}/{FAVOURITE_QUESTION.max ?? '—'} SELECTED</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FEATURES.map(f => {
            const active = favouriteFeatures.includes(f.key)
            const disabled = !active && !!FAVOURITE_QUESTION.max && favouriteFeatures.length >= FAVOURITE_QUESTION.max
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleFav(f.key)}
                disabled={disabled}
                style={{
                  padding: '10px 14px',
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
              >{f.label}</button>
            )
          })}
        </div>
      </section>

      {/* Section E: kill list */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.killList}</div>
        <h2 style={sectionHeadline}>{KILL_QUESTION.label}</h2>
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 12,
        }}>PICK ANY THAT APPLY (OR NONE)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FEATURES.map(f => {
            const active = killFeatures.includes(f.key)
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleKill(f.key)}
                style={{
                  padding: '10px 14px',
                  background: active ? 'var(--brand-coral)' : 'var(--brand-paper)',
                  color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                  border: `1px solid ${active ? 'var(--brand-coral)' : 'var(--brand-line)'}`,
                  borderRadius: 999,
                  fontFamily: 'var(--font-satoshi)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                }}
              >{f.label}</button>
            )
          })}
        </div>
      </section>

      {/* Section F: intent */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.intent}</div>
        <h2 style={sectionHeadline}>{questionLabel(INTENT_QUESTION, resolvedRole)}</h2>
        <IntentChoice value={intent} onChange={setIntent} />
      </section>

      {/* Section G: NPS */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.nps}</div>
        <h2 style={sectionHeadline}>{questionLabel(NPS_QUESTION, resolvedRole)}</h2>
        <NPSScale value={nps} onChange={setNps} />
      </section>

      {/* Section H: surprise */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.surprise}</div>
        <h2 style={sectionHeadline}>{SURPRISE_QUESTION.label} (optional)</h2>
        <textarea
          value={surprise}
          onChange={e => setSurprise(e.target.value)}
          placeholder={SURPRISE_QUESTION.placeholder}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </section>

      {/* Section I: missing */}
      <section>
        <div style={sectionEyebrow}>{SECTIONS.missing}</div>
        <h2 style={sectionHeadline}>{MISSING_QUESTION.label} (optional)</h2>
        <textarea
          value={whatsMissing}
          onChange={e => setWhatsMissing(e.target.value)}
          placeholder={MISSING_QUESTION.placeholder}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </section>

      {/* Section J: about you */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={sectionEyebrow}>{SECTIONS.about}</div>
          <h2 style={sectionHeadline}>Just two more.</h2>
          <p style={{ fontSize: 13, color: 'var(--brand-indigo-mute)', margin: '-12px 0 0' }}>
            Pick a role so the questions above re-phrase to your context next time.
          </p>
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
