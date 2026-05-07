'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

/**
 * /demo/end — terminal screen after a guided tour completes.
 *
 * Shows two CTAs side-by-side: submit a 5-question feedback form OR jump
 * to Calendly to book a call. Marks `fairplai_demo_completed` so the
 * SoftLockBanner activates across coach/parent surfaces.
 *
 * Submission target: localStorage + a `mailto:` link that opens the user's
 * email client pre-filled with the form responses. No backend dependency;
 * easy to swap in a webhook (Formspree etc.) later.
 */

const CALENDLY_URL = 'https://calendly.com/fairplai-demo'
const FEEDBACK_EMAIL = 'naheljar@gmail.com'

interface FeedbackResponse {
  q1_summary: string
  q2_valuable: string
  q3_confusing: string
  q4_recommend: number
  q5_wish: string
  submittedAt: string
}

export default function DemoEndPage() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [q4, setQ4] = useState(7)
  const [q5, setQ5] = useState('')

  // Mark tour completed so SoftLockBanner picks it up across coach/parent surfaces.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('fairplai_demo_completed', 'true')
      // Tour itself is no longer active — surfaces should render normally now.
      localStorage.removeItem('fairplai_demo_active')
    } catch {
      /* ignore */
    }
  }, [])

  function submit() {
    const payload: FeedbackResponse = {
      q1_summary: q1.trim(),
      q2_valuable: q2.trim(),
      q3_confusing: q3.trim(),
      q4_recommend: q4,
      q5_wish: q5.trim(),
      submittedAt: new Date().toISOString(),
    }
    // Persist to localStorage so we have a record even if the mailto fails.
    try {
      const raw = localStorage.getItem('fairplai_demo_feedback')
      const list = raw ? (JSON.parse(raw) as FeedbackResponse[]) : []
      list.push(payload)
      localStorage.setItem('fairplai_demo_feedback', JSON.stringify(list))
    } catch {
      /* ignore */
    }
    // Open the user's email composer with the responses prefilled.
    const subject = encodeURIComponent('Fairplai demo feedback')
    const body = encodeURIComponent(
      [
        `1. What does Fairplai do (in one line)?`,
        payload.q1_summary || '(blank)',
        ``,
        `2. Most valuable thing you saw?`,
        payload.q2_valuable || '(blank)',
        ``,
        `3. Most confusing or missing?`,
        payload.q3_confusing || '(blank)',
        ``,
        `4. Recommend it to a friend (1–10)?`,
        String(payload.q4_recommend),
        ``,
        `5. Anything you wish you could try that the demo didn't show?`,
        payload.q5_wish || '(blank)',
        ``,
        `— Submitted ${payload.submittedAt}`,
      ].join('\n'),
    )
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
    }
    setSubmitted(true)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-satoshi)',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
          <Logo height={28} />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-fragment)',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          GUIDED DEMO · COMPLETE
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 18px',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          That&apos;s the tour.
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: 'var(--brand-indigo-mute)',
            textAlign: 'center',
            maxWidth: 520,
            margin: '0 auto 36px',
          }}
        >
          You can keep clicking around the app — a banner up top stays so you don&apos;t lose
          your way back. When you&apos;re ready, drop us feedback or jump on a call.
        </p>

        {submitted ? (
          <SubmittedThanks />
        ) : showForm ? (
          <FeedbackForm
            q1={q1} setQ1={setQ1}
            q2={q2} setQ2={setQ2}
            q3={q3} setQ3={setQ3}
            q4={q4} setQ4={setQ4}
            q5={q5} setQ5={setQ5}
            onSubmit={submit}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 22px',
                background: 'var(--brand-indigo)',
                color: 'var(--brand-sand)',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              Submit feedback (5 questions)
            </button>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 22px',
                background: 'var(--brand-yellow)',
                color: 'var(--brand-indigo)',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              Discuss on call →
            </a>
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link
            href="/coach/web"
            style={{
              fontFamily: 'var(--font-fragment)',
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              textDecoration: 'underline',
            }}
          >
            KEEP CLICKING AROUND →
          </Link>
        </div>
      </div>
    </main>
  )
}

function FeedbackForm(props: {
  q1: string; setQ1: (v: string) => void
  q2: string; setQ2: (v: string) => void
  q3: string; setQ3: (v: string) => void
  q4: number; setQ4: (v: number) => void
  q5: string; setQ5: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Question
        n={1}
        label="In one line — what does Fairplai do?"
        value={props.q1}
        onChange={props.setQ1}
        rows={1}
      />
      <Question
        n={2}
        label="Most valuable thing you saw?"
        value={props.q2}
        onChange={props.setQ2}
        rows={2}
      />
      <Question
        n={3}
        label="Most confusing or missing?"
        value={props.q3}
        onChange={props.setQ3}
        rows={2}
      />
      <div>
        <Label n={4}>Recommend it to a coach/parent friend? (1–10)</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            type="range"
            min={1}
            max={10}
            value={props.q4}
            onChange={e => props.setQ4(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <div
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 32,
              color: 'var(--brand-indigo)',
              letterSpacing: '-0.02em',
              minWidth: 40,
              textAlign: 'center',
            }}
          >
            {props.q4}
          </div>
        </div>
      </div>
      <Question
        n={5}
        label="Anything you wish you could try that the demo didn't show?"
        value={props.q5}
        onChange={props.setQ5}
        rows={2}
      />

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          type="button"
          onClick={props.onCancel}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--brand-indigo-mute)',
            border: 'none',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={props.onSubmit}
          style={{
            padding: '11px 20px',
            background: 'var(--brand-indigo)',
            color: 'var(--brand-sand)',
            border: 'none',
            borderRadius: 7,
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Send feedback →
        </button>
      </div>
    </div>
  )
}

function Question({ n, label, value, onChange, rows }: {
  n: number
  label: string
  value: string
  onChange: (v: string) => void
  rows: number
}) {
  return (
    <div>
      <Label n={n}>{label}</Label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid var(--brand-line)',
          borderRadius: 7,
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'var(--brand-indigo)',
          background: 'var(--brand-sand)',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function Label({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-fragment)',
        fontSize: 10.5,
        letterSpacing: '0.18em',
        color: 'var(--brand-indigo-mute)',
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      Q{n} · {children}
    </div>
  )
}

function SubmittedThanks() {
  return (
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: 28,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 28,
          letterSpacing: '-0.02em',
          color: 'var(--brand-indigo)',
          marginBottom: 8,
        }}
      >
        Got it — thanks.
      </div>
      <p style={{ fontSize: 14, color: 'var(--brand-indigo-mute)', maxWidth: 420, margin: '0 auto' }}>
        Your responses just opened in your email composer. Hit send and we&apos;ll pick this up on the call.
      </p>
    </div>
  )
}
