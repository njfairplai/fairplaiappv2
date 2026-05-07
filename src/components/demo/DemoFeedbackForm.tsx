'use client'

import { useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'

/**
 * Post-tour feedback form on /demo/end.
 *
 * Adapted from `src/components/user-testing/PortalFeedbackForm.tsx` which
 * was the longer-form palette-test form. The current questions reflect
 * the welfare-extended product, not the original palette-test surfaces:
 *
 *   - Agreement scales (1–5): professional / scannable / trust / clarity
 *   - Multi-select: features you'd actually use (welfare-aware list)
 *   - Multi-select: features that felt unnecessary or confusing
 *   - NPS (1–10): recommend to a friend
 *   - Free-text: what's missing or what would you change
 *
 * Submission target: localStorage + mailto. No backend.
 */

const FOUNDER_EMAIL = 'naheljar@gmail.com'

const AGREEMENT_QUESTIONS = [
  { key: 'professional', label: 'The product looks professional.' },
  { key: 'scan',         label: 'The pages are easy to scan.' },
  { key: 'trust',        label: "I'd trust this with my squad's / kid's data." },
  { key: 'clarity',      label: 'The tour explained things clearly.' },
] as const

/** Updated to the post-welfare-slice surface set. The legacy form's
 *  features (timeline, clip panel, watch-match) were removed earlier;
 *  this list reflects what testers actually saw. */
const FEATURES = [
  { key: 'mikel',          label: 'Coach Hub (Mikel)' },
  { key: 'match_center',   label: 'Match Center calendar' },
  { key: 'match_drillin',  label: 'Match drill-in (composite + radar)' },
  { key: 'squad_pitch',    label: 'Squad-as-pitch with welfare filters' },
  { key: 'player_profile', label: 'Player profile (filmstrip + workload)' },
  { key: 'send_clip',      label: 'Send Clip / Coach Cam' },
  { key: 'welfare_flags',  label: 'Injury + fatigue + gear flags' },
  { key: 'parent_home',    label: 'Parent home + welfare cards' },
  { key: 'parent_clips',   label: 'Parent Highlights ("from your coach")' },
  { key: 'idp',            label: 'IDP editor' },
] as const

type AgreementKey = typeof AGREEMENT_QUESTIONS[number]['key']
type FeatureKey   = typeof FEATURES[number]['key']

interface FeedbackResponse {
  agreement: Partial<Record<AgreementKey, number>>
  use: FeatureKey[]
  drop: FeatureKey[]
  nps: number
  open: string
  submittedAt: string
}

export function DemoFeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [agreement, setAgreement] = useState<Partial<Record<AgreementKey, number>>>({})
  const [use, setUse] = useState<FeatureKey[]>([])
  const [drop, setDrop] = useState<FeatureKey[]>([])
  const [nps, setNps] = useState<number>(7)
  const [open, setOpen] = useState('')
  const [error, setError] = useState<string | null>(null)

  function toggleFeature(set: FeatureKey[], key: FeatureKey, setter: (v: FeatureKey[]) => void) {
    setter(set.includes(key) ? set.filter(k => k !== key) : [...set, key])
  }

  function submit() {
    // Lightweight validation: at least all four agreement scales answered.
    const missing = AGREEMENT_QUESTIONS.find(q => agreement[q.key] == null)
    if (missing) {
      setError('Please answer all four agreement scales before submitting.')
      return
    }
    setError(null)

    const payload: FeedbackResponse = {
      agreement,
      use,
      drop,
      nps,
      open: open.trim(),
      submittedAt: new Date().toISOString(),
    }

    // Persist locally so we have a record even if mailto fails.
    try {
      const raw = localStorage.getItem('fairplai_demo_feedback')
      const list = raw ? (JSON.parse(raw) as FeedbackResponse[]) : []
      list.push(payload)
      localStorage.setItem('fairplai_demo_feedback', JSON.stringify(list))
    } catch {
      /* ignore */
    }

    // Open the user's email composer with the responses prefilled.
    const lines: string[] = ['= AGREEMENT (1–5) =']
    for (const q of AGREEMENT_QUESTIONS) {
      lines.push(`${q.label}  →  ${agreement[q.key] ?? '(blank)'}`)
    }
    lines.push('', '= FEATURES YOU\'D USE =')
    if (use.length === 0) lines.push('(none picked)')
    for (const k of use) {
      const f = FEATURES.find(f => f.key === k)
      lines.push(`- ${f?.label ?? k}`)
    }
    lines.push('', '= FEATURES TO DROP / CONFUSING =')
    if (drop.length === 0) lines.push('(none picked)')
    for (const k of drop) {
      const f = FEATURES.find(f => f.key === k)
      lines.push(`- ${f?.label ?? k}`)
    }
    lines.push('', `= NPS = ${nps} / 10`)
    lines.push('', '= OPEN COMMENTS =', payload.open || '(blank)')
    lines.push('', `— Submitted ${payload.submittedAt}`)

    // Stitch in tester identity if available
    try {
      const tester = localStorage.getItem('fairplai_demo_tester')
      if (tester) lines.unshift(`= TESTER =\n${tester}\n`)
    } catch { /* ignore */ }

    const subject = encodeURIComponent('Fairplai demo feedback')
    const body = encodeURIComponent(lines.join('\n'))
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${FOUNDER_EMAIL}?subject=${subject}&body=${body}`
    }
    onSubmitted()
  }

  return (
    <div
      style={{
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 12,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {/* Agreement scales */}
      <Section label="How much do you agree?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AGREEMENT_QUESTIONS.map(q => (
            <div key={q.key}>
              <div
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 13.5,
                  color: BRAND.indigo,
                  marginBottom: 6,
                }}
              >
                {q.label}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const isActive = agreement[q.key] === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAgreement(a => ({ ...a, [q.key]: n }))}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        border: `1px solid ${isActive ? BRAND.indigo : BRAND.line}`,
                        borderRadius: 6,
                        background: isActive ? BRAND.indigo : 'transparent',
                        color: isActive ? BRAND.sand : BRAND.indigo,
                        fontFamily: TYPE.body,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  color: BRAND.indigoMute,
                  fontWeight: 700,
                }}
              >
                <span>DISAGREE</span>
                <span>AGREE</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Use multi-select */}
      <Section label="Which features would you actually use?">
        <FeatureGrid set={use} onToggle={k => toggleFeature(use, k, setUse)} />
      </Section>

      {/* Drop multi-select */}
      <Section label="Which felt unnecessary or confusing?">
        <FeatureGrid set={drop} onToggle={k => toggleFeature(drop, k, setDrop)} />
      </Section>

      {/* NPS */}
      <Section label="Recommend Fairplai to a coach / parent friend?">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            type="range"
            min={1}
            max={10}
            value={nps}
            onChange={e => setNps(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 32,
              color: BRAND.indigo,
              letterSpacing: '-0.02em',
              minWidth: 50,
              textAlign: 'center',
            }}
          >
            {nps}
            <span style={{ fontSize: 14, color: BRAND.indigoMute, marginLeft: 4 }}>/10</span>
          </div>
        </div>
      </Section>

      {/* Open text */}
      <Section label="What's missing or what would you change? (optional)">
        <textarea
          value={open}
          onChange={e => setOpen(e.target.value)}
          rows={4}
          placeholder="Anything that surprised you, anything you wished was there, anything that should die…"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${BRAND.line}`,
            borderRadius: 7,
            fontFamily: TYPE.body,
            fontSize: 14,
            color: BRAND.indigo,
            background: BRAND.sand,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </Section>

      {error && (
        <div
          style={{
            padding: '8px 12px',
            background: `${BRAND.coral}15`,
            border: `1px solid ${BRAND.coral}`,
            borderRadius: 6,
            color: BRAND.coral,
            fontFamily: TYPE.body,
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          type="button"
          onClick={submit}
          style={{
            padding: '12px 22px',
            background: BRAND.indigo,
            color: BRAND.sand,
            border: 'none',
            borderRadius: 7,
            fontFamily: TYPE.body,
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(11,8,40,0.18)',
          }}
        >
          Send feedback →
        </button>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10.5,
          letterSpacing: '0.18em',
          color: BRAND.indigoMute,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  )
}

function FeatureGrid({
  set,
  onToggle,
}: {
  set: FeatureKey[]
  onToggle: (k: FeatureKey) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
      {FEATURES.map(f => {
        const isActive = set.includes(f.key)
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onToggle(f.key)}
            style={{
              padding: '9px 12px',
              border: `1px solid ${isActive ? BRAND.indigo : BRAND.line}`,
              borderRadius: 7,
              background: isActive ? BRAND.indigo : 'transparent',
              color: isActive ? BRAND.sand : BRAND.indigo,
              fontFamily: TYPE.body,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
