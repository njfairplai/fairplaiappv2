'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeftRight } from 'lucide-react'

/**
 * PortalToggleFab — bottom-right floating button that toggles between
 * the coach + parent portals. Built for testers who saw both portals on
 * the demo and want to flip back and forth without typing URLs.
 *
 * Activation rules (all must be true):
 *   1. Tour completed (`fairplai_demo_completed = 'true'`)
 *   2. Persona is `coach` or `misc` — NOT `parent`. Parents are not
 *      shown the coach side per the asymmetric persona rule.
 *   3. Current pathname is on a coach or parent surface.
 *
 * Tap routes to the home of the OTHER portal. Per-session dismissable
 * via × on the chip.
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
      const completed = window.localStorage.getItem('fairplai_demo_completed') === 'true'
      // The persona localStorage key is cleared on tour completion (in
      // /demo/end) so we read the previously-stashed `fairplai_demo_persona`
      // which /demo/persona writes alongside `fairplai_demo_active`.
      const persona = window.localStorage.getItem('fairplai_demo_persona')
      const dismissed = window.sessionStorage.getItem(SS_DISMISSED) === 'true'
      const validPersona = persona === 'coach' || persona === 'misc'
      const onPortalRoute =
        pathname.startsWith('/coach/web') || pathname.startsWith('/parent/')
      setShow(completed && validPersona && onPortalRoute && !dismissed)
    } catch {
      /* ignore */
    }
  }, [pathname])

  if (!show) return null

  const onCoach = pathname.startsWith('/coach/web')
  const targetLabel = onCoach ? 'Parent view' : 'Coach view'
  const targetRoute = onCoach ? PARENT_HOME : COACH_HOME

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
        onClick={() => router.push(targetRoute)}
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
