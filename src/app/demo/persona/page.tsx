'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Heart, Eye, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

/**
 * /demo/persona — three-card persona gate with inline email capture.
 *
 * The user just voted on a palette (or jumped straight here via the
 * /user-testing shortcut). They pick one of three personas; clicking a
 * card expands the SAME card with name + email inputs. Submitting
 * stashes the persona + identity in localStorage and routes into the
 * matching tour.
 *
 * Persona → tour mapping (after submit):
 *   Coach        → coach + parent tour (14 stops)
 *   Parent       → parent tour only (7 stops)
 *   Just looking → coach + parent tour (14 stops, same as Coach)
 *
 * Email capture target: localStorage record + `mailto:` to the founder
 * so a tester record exists without a backend.
 */

type Persona = 'coach' | 'parent' | 'misc'

const PERSONAS: {
  id: Persona
  label: string
  sub: string
  Icon: typeof Users
  firstRoute: string
}[] = [
  {
    id: 'coach',
    label: 'Coach',
    sub: 'I run a team. Show me what I get from the AI footage analysis + the parent loop.',
    Icon: Users,
    firstRoute: '/coach/web',
  },
  {
    id: 'parent',
    label: 'Parent',
    sub: "I'm a parent of a kid in an academy. Show me what I'd see about my kid.",
    Icon: Heart,
    firstRoute: '/parent/home',
  },
  {
    id: 'misc',
    label: 'Just looking',
    sub: "I'm evaluating Fairplai for an academy / club / investor pitch. Show me both portals.",
    Icon: Eye,
    firstRoute: '/coach/web',
  },
]

const FOUNDER_EMAIL = 'naheljar@gmail.com'

export default function DemoPersonaPage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<Persona | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  function start(persona: Persona, firstRoute: string) {
    if (typeof window === 'undefined') return
    if (!name.trim() || !email.trim()) return

    // Stash identity + persona to localStorage so TourProvider picks it
    // up on the next pathname change.
    try {
      localStorage.setItem('fairplai_demo_persona', persona)
      localStorage.setItem('fairplai_demo_active', persona)
      localStorage.setItem('fairplai_demo_step', '0')
      localStorage.removeItem('fairplai_demo_completed')
      localStorage.setItem(
        'fairplai_demo_tester',
        JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          persona,
          startedAt: new Date().toISOString(),
        }),
      )
    } catch {
      /* ignore */
    }

    // Fire a mailto with the tester record so we have a real-time signal
    // a new walkthrough started. Best-effort — opens in a new tab so it
    // doesn't block the route push.
    const subject = encodeURIComponent('Fairplai demo — new tester started')
    const body = encodeURIComponent(
      [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Persona: ${persona}`,
        `Started: ${new Date().toISOString()}`,
      ].join('\n'),
    )
    try {
      const a = document.createElement('a')
      a.href = `mailto:${FOUNDER_EMAIL}?subject=${subject}&body=${body}`
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
    } catch {
      /* ignore — non-critical */
    }

    router.push(firstRoute)
  }

  function isExpanded(p: Persona) { return expanded === p }
  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && /\S+@\S+\.\S+/.test(email)

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
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
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
          GUIDED DEMO · STEP 1 OF 2
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 14px',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Who are you<br />visiting as?
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            marginBottom: 36,
            color: 'var(--brand-indigo-mute)',
            textAlign: 'center',
            maxWidth: 540,
            margin: '0 auto 36px',
          }}
        >
          Pick one. We&apos;ll route you into a guided tour of the surfaces that matter to your role. Takes 3–4 minutes.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14,
            alignItems: 'start',
          }}
        >
          {PERSONAS.map(({ id, label, sub, Icon, firstRoute }) => {
            const expandedHere = isExpanded(id)
            return (
              <div
                key={id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--brand-paper)',
                  border: `1px solid ${expandedHere ? 'var(--brand-indigo)' : 'var(--brand-line)'}`,
                  borderRadius: 14,
                  padding: 22,
                  transition: 'all 0.18s ease',
                  boxShadow: expandedHere ? '0 8px 24px rgba(11, 8, 40, 0.10)' : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(expandedHere ? null : id)
                    setName('')
                    setEmail('')
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 12,
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--brand-indigo)',
                      color: 'var(--brand-sand)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-clash)',
                      fontSize: 26,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                      color: 'var(--brand-indigo)',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: 'var(--brand-indigo-mute)',
                    }}
                  >
                    {sub}
                  </div>
                  {!expandedHere && (
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: 'var(--font-fragment)',
                        fontSize: 10.5,
                        letterSpacing: '0.18em',
                        color: 'var(--brand-indigo)',
                        fontWeight: 700,
                      }}
                    >
                      START AS {label.toUpperCase()} →
                    </div>
                  )}
                </button>

                {/* Inline name + email form — expands when card is clicked */}
                {expandedHere && (
                  <form
                    onSubmit={e => {
                      e.preventDefault()
                      if (canSubmit) start(id, firstRoute)
                    }}
                    style={{
                      marginTop: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      animation: 'personaExpand 240ms cubic-bezier(.2,.7,.2,1) both',
                    }}
                  >
                    <style>{`
                      @keyframes personaExpand {
                        from { opacity: 0; transform: translateY(-4px); }
                        to   { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>
                    <FormField label="Your name">
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="First + last"
                        autoFocus
                        style={inputStyle}
                      />
                    </FormField>
                    <FormField label="Email">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={inputStyle}
                      />
                    </FormField>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      style={{
                        marginTop: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '11px 16px',
                        background: canSubmit ? 'var(--brand-indigo)' : 'var(--brand-line)',
                        color: canSubmit ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
                        border: 'none',
                        borderRadius: 7,
                        fontFamily: 'inherit',
                        fontWeight: 700,
                        fontSize: 13.5,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Start tour
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpanded(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        fontFamily: 'var(--font-fragment)',
                        fontSize: 10.5,
                        letterSpacing: '0.16em',
                        color: 'var(--brand-indigo-mute)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: 2,
                      }}
                    >
                      ← PICK A DIFFERENT ONE
                    </button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--brand-line)',
  borderRadius: 7,
  fontFamily: 'inherit',
  fontSize: 14,
  color: 'var(--brand-indigo)',
  background: 'var(--brand-sand)',
  outline: 'none',
  boxSizing: 'border-box',
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 9.5,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}
      >
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  )
}
