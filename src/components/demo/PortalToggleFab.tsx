'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeftRight } from 'lucide-react'

/**
 * PortalToggleFab — bottom-right floating button that toggles between
 * the coach + parent portals. Two activation paths:
 *
 *   A. Demo testers, post-tour:
 *        1. `fairplai_demo_completed = 'true'`
 *        2. Persona is `coach` or `misc` (not `parent` — asymmetric
 *           persona rule keeps parents from peeking at the coach side)
 *        3. On a coach or parent route
 *
 *   B. Founder via /admin gate:
 *        1. `fairplai_admin_unlocked = 'true'`
 *        2. On a coach or parent route
 *      No persona check — the founder gets to flip freely.
 *
 * Common to both: hidden inside iframes (palette voting context) and
 * per-session dismissable via × on the chip.
 *
 * Tap routes to the home of the OTHER portal. Tap-and-stamp also
 * re-stamps `fairplai_role` so the destination layout's role check
 * doesn't bounce to /login when the founder switches sides.
 */

const SS_DISMISSED = 'fairplai_demo_toggle_dismissed'
const COACH_HOME = '/coach/web'
const PARENT_HOME = '/parent/home'

export function PortalToggleFab() {
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Iframe guard — palette voting renders /parent or /coach inside
    // an iframe; portal-toggle FAB doesn't belong there.
    if (window.self !== window.top) {
      setShow(false)
      return
    }
    try {
      const dismissed = window.sessionStorage.getItem(SS_DISMISSED) === 'true'
      const onPortalRoute =
        pathname.startsWith('/coach/web') || pathname.startsWith('/parent/')

      // Path B: founder unlocked /admin. No persona check.
      const adminUnlocked = window.localStorage.getItem('fairplai_admin_unlocked') === 'true'
      if (adminUnlocked) {
        setShow(onPortalRoute && !dismissed)
        return
      }

      // Path A: demo tester, post-tour.
      const completed = window.localStorage.getItem('fairplai_demo_completed') === 'true'
      const persona = window.localStorage.getItem('fairplai_demo_persona')
      const validPersona = persona === 'coach' || persona === 'misc'
      setShow(completed && validPersona && onPortalRoute && !dismissed)
    } catch {
      /* ignore */
    }
  }, [pathname])

  if (!show) return null

  const onCoach = pathname.startsWith('/coach/web')
  const targetLabel = onCoach ? 'Parent view' : 'Coach view'
  const targetRoute = onCoach ? PARENT_HOME : COACH_HOME
  const targetRole = onCoach ? 'parent' : 'coach'

  function onToggle() {
    // For the admin-unlocked founder, re-stamp the role + auth session
    // so the destination layout's role check (parent/layout.tsx) doesn't
    // bounce to /login when flipping sides. No-op when role already
    // matches or when the demo flow is what put the user here.
    try {
      const adminUnlocked = window.localStorage.getItem('fairplai_admin_unlocked') === 'true'
      if (adminUnlocked) {
        const now = Date.now()
        window.localStorage.setItem('fairplai_role', targetRole)
        window.localStorage.setItem(
          'fairplai_auth_session',
          JSON.stringify({
            userId: `user_${targetRole}_${now}`,
            email: `${targetRole}@fairplai.local`,
            role: targetRole,
            loginTimestamp: now,
            expiresAt: now + 24 * 60 * 60 * 1000,
          }),
        )
        window.localStorage.setItem('fairplai_consented', 'true')
      }
    } catch {
      /* ignore */
    }
    router.push(targetRoute)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        right: 20,
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        background: 'var(--brand-indigo)',
        color: 'var(--brand-sand)',
        borderRadius: 999,
        boxShadow: '0 8px 22px rgba(11, 8, 40, 0.32)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <ArrowLeftRight size={14} color="var(--brand-yellow)" />
        Switch to {targetLabel}
      </button>
      <button
        type="button"
        aria-label="Hide toggle"
        onClick={() => {
          try {
            window.sessionStorage.setItem(SS_DISMISSED, 'true')
          } catch {
            /* ignore */
          }
          setShow(false)
        }}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'transparent',
          color: 'var(--brand-sand)',
          border: '1px solid rgba(238, 228, 200, 0.28)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
