'use client'

import { useEffect, useState } from 'react'
import { useTour } from './TourProvider'

/**
 * Always-visible "End demo" affordance during a tour. Sits bottom-right.
 *
 * The user can click this at any point — including after they've hidden
 * the tour tooltip via × — to wrap up and land on /demo/end.
 *
 * Hidden when there's no active persona (i.e. before the tour starts or
 * after it's been completed). Post-completion the SoftLockBanner takes
 * over with a different message.
 */
export function EndDemoPill() {
  const tour = useTour()
  // Iframe guard — palette voting renders /parent/* or /coach/web/*
  // inside an iframe; the End-demo pill is for the live tour, not for
  // the palette preview context.
  const [inIframe, setInIframe] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setInIframe(window.self !== window.top)
  }, [])

  if (inIframe) return null
  if (!tour.persona) return null

  return (
    <button
      type="button"
      onClick={tour.skip}
      style={{
        position: 'fixed',
        bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        right: 20,
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 16px',
        background: 'var(--brand-indigo)',
        color: 'var(--brand-sand)',
        border: 'none',
        borderRadius: 999,
        boxShadow: '0 8px 22px rgba(11, 8, 40, 0.32)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        fontWeight: 700,
        fontSize: 12.5,
        cursor: 'pointer',
        letterSpacing: '0.02em',
      }}
    >
      End demo →
    </button>
  )
}
