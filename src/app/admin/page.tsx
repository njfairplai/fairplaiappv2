'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Briefcase, Users } from 'lucide-react'

/**
 * Founder portal picker — landing page once /admin is unlocked.
 *
 * Coach + Parent only. Super Admin + Academy Admin used to be cards
 * here too but were dropped — those portals aren't part of the demo
 * conversation Nahel is having today, and a leaner picker is faster
 * to navigate. The PortalToggleFab (bottom-right floating chip) lets
 * the founder flip between coach + parent without coming back here.
 *
 * Each card stamps the appropriate localStorage keys (fairplai_role +
 * auth session + consented) so the destination layout doesn't bounce
 * to /login.
 *
 * Demo state is intentionally NOT touched — if a demo session is in
 * progress, the founder might be using /admin to peek at a portal mid-
 * tour and we don't want to disrupt that.
 */

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

type Role = 'parent' | 'coach'

interface PortalCard {
  role: Role
  title: string
  blurb: string
  route: string
  icon: typeof Briefcase
}

const PORTALS: PortalCard[] = [
  {
    role: 'coach',
    title: 'Coach Portal',
    blurb: 'Mikel, Match Center, Squad pitch, Highlights, Hub.',
    route: '/coach/web',
    icon: Briefcase,
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    blurb: 'Parent home, Stats, Highlights, Development, Hub.',
    route: '/parent/home',
    icon: Users,
  },
]

function stampSession(role: Role) {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const session = {
    userId: `user_${role}_${now}`,
    email: `${role}@fairplai.local`,
    role,
    loginTimestamp: now,
    expiresAt: now + SESSION_DURATION_MS,
  }
  try {
    localStorage.setItem('fairplai_auth_session', JSON.stringify(session))
    localStorage.setItem('fairplai_role', role)
    localStorage.setItem('fairplai_consented', 'true')
  } catch {
    /* ignore */
  }
}

export default function AdminPortalPickerPage() {
  const router = useRouter()

  function open(card: PortalCard) {
    stampSession(card.role)
    router.push(card.route)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--brand-sand)',
        padding: '48px 24px 80px',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            fontWeight: 800,
            color: 'var(--brand-indigo-mute)',
            marginBottom: 12,
          }}
        >
          FAIRPLAI · ADMIN
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-clash), serif',
            fontSize: 48,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
            fontWeight: 700,
          }}
        >
          Pick a portal.
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--brand-indigo-mute)',
            margin: '0 0 36px',
            maxWidth: 540,
            lineHeight: 1.5,
          }}
        >
          Each card stamps the right session and drops you straight in —
          no demo flow, no email gate. Once you're inside, the floating
          chip (bottom right) lets you flip between coach and parent
          without coming back here.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14,
          }}
        >
          {PORTALS.map(card => {
            const Icon = card.icon
            return (
              <button
                key={card.role}
                type="button"
                onClick={() => open(card)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: '20px 18px',
                  background: 'var(--brand-paper)',
                  border: '1px solid var(--brand-line)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 160ms ease',
                  fontFamily: 'inherit',
                  color: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-indigo)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(11, 8, 40, 0.10)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-line)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'var(--brand-indigo)',
                    color: 'var(--brand-yellow)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-clash), serif',
                      fontSize: 20,
                      letterSpacing: '-0.01em',
                      fontWeight: 700,
                    }}
                  >
                    {card.title}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: 'var(--brand-indigo-mute)',
                      lineHeight: 1.45,
                    }}
                  >
                    {card.blurb}
                  </span>
                </div>
                <span
                  style={{
                    marginTop: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--brand-indigo)',
                    letterSpacing: '0.02em',
                  }}
                >
                  Open <ArrowRight size={13} />
                </span>
              </button>
            )
          })}
        </div>

        <div
          style={{
            marginTop: 48,
            padding: '14px 16px',
            background: 'var(--brand-paper)',
            border: '1px dashed var(--brand-line)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--brand-indigo-mute)',
            lineHeight: 1.5,
          }}
        >
          Jump back to <strong style={{ color: 'var(--brand-indigo)' }}>/admin</strong>{' '}
          any time to switch portals. The unlock persists across visits
          on this device — clear localStorage to lock again.
        </div>
      </div>
    </main>
  )
}
