'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Soft-lock banner — sits at the top of every coach/parent surface AFTER
 * the demo tour has completed. Reminds the user the call is the next
 * step. No Calendly CTA: testers only land on these surfaces via a
 * pre-booked call, so a "book a call" button doesn't make sense.
 *
 * Activation:
 *   - Reads `fairplai_demo_completed` from localStorage
 *   - Hidden if not present, OR if the user dismissed it this session
 *
 * Dismissal is per-session (sessionStorage) so a refresh shows it again
 * if the user opens a new tab. Deliberate: the banner is the only thing
 * reminding them the tour ended, so we don't want it to disappear forever
 * after one tap of ×.
 */

const SS_DISMISSED = 'fairplai_demo_banner_dismissed'

export function SoftLockBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Iframe guard: palette voting renders /parent/* or /coach/web/*
    // inside an iframe. The banner is for post-tour exploration of the
    // live app — never the right context for a palette preview iframe.
    if (window.self !== window.top) {
      setShow(false)
      return
    }
    try {
      const completed = window.localStorage.getItem('fairplai_demo_completed') === 'true'
      const dismissed = window.sessionStorage.getItem(SS_DISMISSED) === 'true'
      setShow(completed && !dismissed)
    } catch {
      /* ignore */
    }
  }, [])

  if (!show) return null

  return (
    <div
      role="status"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 14px',
        background: 'var(--brand-indigo)',
        color: 'var(--brand-sand)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 500,
        borderBottom: '1px solid rgba(238, 228, 200, 0.12)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-fragment), monospace',
          fontSize: 9.5,
          letterSpacing: '0.22em',
          fontWeight: 700,
          color: 'var(--brand-yellow)',
          flexShrink: 0,
        }}
      >
        TOUR COMPLETE
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        Click around freely — see you on the call to talk through it.
      </span>
      <button
        type="button"
        aria-label="Dismiss banner"
        onClick={() => {
          try {
            window.sessionStorage.setItem(SS_DISMISSED, 'true')
          } catch {
            /* ignore */
          }
          setShow(false)
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'transparent',
          color: 'var(--brand-sand)',
          border: '1px solid rgba(238, 228, 200, 0.28)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={12} />
      </button>
    </div>
  )
}
