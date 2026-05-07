'use client'

import { useEffect, useState } from 'react'
import type { TourStep } from '@/lib/demo-tour-steps'
import { useTour } from './TourProvider'

/**
 * Tour tooltip — anchored to the current step's element via a CSS
 * selector. Uses MutationObserver to wait for the anchor to mount (the
 * page may render asynchronously after a route change).
 *
 * Position is one of top / bottom / left / right / center. The card sits
 * adjacent to the anchor with a 12px gap. If the resolved position would
 * fall offscreen, the card flips to the opposite side as a graceful
 * fallback. `center` ignores the anchor and centres the card on the
 * viewport — useful for steps that are about a whole surface, not one
 * element.
 */

const GAP = 14
const CARD_WIDTH = 320
const CARD_MAX_HEIGHT = 280

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

function getRect(selector: string): AnchorRect | null {
  if (typeof window === 'undefined') return null
  const el = document.querySelector(selector) as HTMLElement | null
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function useAnchorRect(selector: string): AnchorRect | null {
  const [rect, setRect] = useState<AnchorRect | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let raf = 0
    let cancelled = false

    const update = () => {
      if (cancelled) return
      setRect(getRect(selector))
    }

    // Immediate try
    update()

    // Watch for DOM mutations until anchor appears, then keep updating
    // on layout shifts.
    const observer = new MutationObserver(() => update())
    observer.observe(document.body, { childList: true, subtree: true })

    // Track scroll + resize so the tooltip follows
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelled = true
      observer.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
    }
  }, [selector])
  return rect
}

function computePosition(
  rect: AnchorRect | null,
  position: TourStep['position'],
): { top: number; left: number } {
  const vw = typeof window === 'undefined' ? 1024 : window.innerWidth
  const vh = typeof window === 'undefined' ? 768 : window.innerHeight

  // Center mode (or no rect available)
  if (position === 'center' || !rect) {
    return {
      top: Math.max(20, (vh - CARD_MAX_HEIGHT) / 2),
      left: Math.max(20, (vw - CARD_WIDTH) / 2),
    }
  }

  let top = 0
  let left = 0

  switch (position) {
    case 'top':
      top = rect.top - CARD_MAX_HEIGHT - GAP
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2
      // flip to bottom if off-screen
      if (top < 20) top = rect.top + rect.height + GAP
      break
    case 'bottom':
      top = rect.top + rect.height + GAP
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2
      if (top + CARD_MAX_HEIGHT > vh - 20) top = rect.top - CARD_MAX_HEIGHT - GAP
      break
    case 'left':
      top = rect.top + rect.height / 2 - CARD_MAX_HEIGHT / 2
      left = rect.left - CARD_WIDTH - GAP
      if (left < 20) left = rect.left + rect.width + GAP
      break
    case 'right':
      top = rect.top + rect.height / 2 - CARD_MAX_HEIGHT / 2
      left = rect.left + rect.width + GAP
      if (left + CARD_WIDTH > vw - 20) left = rect.left - CARD_WIDTH - GAP
      break
  }

  // Clamp horizontally
  left = Math.max(16, Math.min(vw - CARD_WIDTH - 16, left))
  // Clamp vertically
  top = Math.max(16, Math.min(vh - CARD_MAX_HEIGHT - 16, top))
  return { top, left }
}

export function TourTooltip({ step }: { step: TourStep }) {
  const tour = useTour()
  const rect = useAnchorRect(step.anchor)
  const { top, left } = computePosition(rect, step.position)

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top,
        left,
        width: CARD_WIDTH,
        maxHeight: CARD_MAX_HEIGHT,
        background: 'var(--brand-paper)',
        color: 'var(--brand-indigo)',
        border: '1px solid var(--brand-indigo)',
        borderRadius: 12,
        padding: '16px 18px',
        boxShadow: '0 16px 40px rgba(11, 8, 40, 0.28)',
        zIndex: 1001,
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        animation: 'tourTooltipIn 220ms cubic-bezier(.2,.7,.2,1) both',
      }}
    >
      <style>{`
        @keyframes tourTooltipIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          fontFamily: 'var(--font-fragment), monospace',
          fontSize: 10,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        STOP {tour.stepIndex + 1} OF {tour.totalSteps}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-clash), system-ui, sans-serif',
          fontSize: 20,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          margin: '0 0 8px',
        }}
      >
        {step.headline}
      </div>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          margin: '0 0 14px',
          color: 'var(--brand-indigo-mid, #3A3478)',
        }}
      >
        {step.body}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={tour.skip}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: 'var(--brand-indigo-mute)',
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 10,
            letterSpacing: '0.16em',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          SKIP TOUR
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {tour.stepIndex > 0 && (
            <button
              type="button"
              onClick={tour.back}
              style={{
                padding: '7px 14px',
                background: 'transparent',
                color: 'var(--brand-indigo)',
                border: '1px solid var(--brand-line)',
                borderRadius: 6,
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={tour.next}
            style={{
              padding: '8px 16px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 6,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(11,8,40,0.22)',
            }}
          >
            {step.cta === 'finish' ? 'Finish →' : step.cta === 'transition' ? 'Continue →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
