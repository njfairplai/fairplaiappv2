'use client'

import { useRouter } from 'next/navigation'
import { Users, Heart, Eye } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

/**
 * /demo/persona — three-card persona gate.
 *
 * The user just picked a palette. Now they choose who they're visiting
 * as. Their answer routes them into the matching tour (coach / parent /
 * miscellaneous). The persona is also stashed in localStorage so the
 * TourProvider knows which step list to load.
 *
 * Asymmetric handoff:
 *   Coach   → coach tour → parent tour → /demo/end
 *   Parent  → parent tour only → /demo/end
 *   Misc    → 3-stop curated tour → /demo/end
 */

type Persona = 'coach' | 'parent' | 'misc'

const PERSONAS: { id: Persona; label: string; sub: string; Icon: typeof Users; firstRoute: string }[] = [
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
    sub: "I'm evaluating Fairplai for an academy / club / investor pitch. Show me the highlights.",
    Icon: Eye,
    firstRoute: '/coach/web/match/session_007',
  },
]

export default function DemoPersonaPage() {
  const router = useRouter()

  function pick(p: Persona, firstRoute: string) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fairplai_demo_persona', p)
        localStorage.setItem('fairplai_demo_active', p)
        // Reset step counter
        localStorage.setItem('fairplai_demo_step', '0')
        // Clear any prior completion flag (a re-run is allowed)
        localStorage.removeItem('fairplai_demo_completed')
      } catch {
        /* ignore */
      }
    }
    router.push(firstRoute)
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
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
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
            maxWidth: 520,
            margin: '0 auto 36px',
          }}
        >
          Pick one. We&apos;ll route you into a guided tour of the surfaces that matter to your role. Takes 3–4 minutes.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {PERSONAS.map(({ id, label, sub, Icon, firstRoute }) => (
            <button
              key={id}
              type="button"
              onClick={() => pick(id, firstRoute)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                padding: 22,
                background: 'var(--brand-paper)',
                border: '1px solid var(--brand-line)',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                color: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand-indigo)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(11, 8, 40, 0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--brand-line)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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
              <div
                style={{
                  marginTop: 'auto',
                  fontFamily: 'var(--font-fragment)',
                  fontSize: 10.5,
                  letterSpacing: '0.18em',
                  color: 'var(--brand-indigo)',
                  fontWeight: 700,
                }}
              >
                START TOUR →
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
