'use client'

import { useRef, useState } from 'react'
import type { TourStep } from '@/lib/demo-tour-steps'
import { useTour } from './TourProvider'

/**
 * Tour narrator card — fixed top-right of viewport.
 *
 * Replaces the prior spotlight + dim approach. The card is informational,
 * non-blocking; the user can interact with the entire page underneath
 * while reading. Each stop describes a whole product surface.
 *
 * Card is dismissable via `× Hide` — that just collapses the card for
 * the current stop; the next route change brings it back. Separately,
 * the always-visible `<EndDemoPill />` lets the user end the demo at
 * any point.
 */

const CARD_WIDTH = 360

export function TourTooltip({ step }: { step: TourStep }) {
  const tour = useTour()
  // Drag offset relative to the default top-left anchor. Persists
  // across step changes (we don't reset on step.id) so the user only
  // re-positions once per session. Touch + mouse via pointer events.
  const [offset, setOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const dragState = useRef<{ startX: number; startY: number; baseDx: number; baseDy: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't intercept clicks on interactive elements — Next/Back/Hide
    // buttons need to fire normally. closest() walks the DOM up to the
    // card root.
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, select')) return
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseDx: offset.dx,
      baseDy: offset.dy,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current
    if (!s) return
    const nextDx = s.baseDx + (e.clientX - s.startX)
    const nextDy = s.baseDy + (e.clientY - s.startY)
    // Clamp to viewport — keep at least a corner of the card visible.
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768
    const minDx = -10  // can go slightly off the left edge
    const maxDx = vw - CARD_WIDTH - 30
    const minDy = -10
    const maxDy = vh - 100
    setOffset({
      dx: Math.max(minDx, Math.min(maxDx, nextDx)),
      dy: Math.max(minDy, Math.min(maxDy, nextDy)),
    })
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
  }

  const isDragging = !!dragState.current

  return (
    <div
      role="dialog"
      aria-label="Demo tour narrator"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: 'fixed',
        // Top-left so we don't collide with notifications bell (parent
        // top-right), team selector + avatar (coach top-right), or the
        // End demo pill (bottom-right). User can drag anywhere from here.
        top: 'max(20px, env(safe-area-inset-top, 20px))',
        left: 20,
        transform: `translate(${offset.dx}px, ${offset.dy}px)`,
        width: CARD_WIDTH,
        maxWidth: 'calc(100vw - 40px)',
        background: 'var(--brand-paper)',
        color: 'var(--brand-indigo)',
        border: '1px solid var(--brand-indigo)',
        borderRadius: 14,
        padding: '16px 18px',
        boxShadow: isDragging
          ? '0 24px 56px rgba(11, 8, 40, 0.32)'
          : '0 16px 40px rgba(11, 8, 40, 0.22)',
        zIndex: 1001,
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        animation: offset.dx === 0 && offset.dy === 0
          ? 'tourTooltipIn 220ms cubic-bezier(.2,.7,.2,1) both'
          : undefined,
      }}
    >
      <style>{`
        @keyframes tourTooltipIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          STOP {tour.stepIndex + 1} OF {tour.totalSteps}
        </span>
        <button
          type="button"
          onClick={tour.hide}
          aria-label="Hide tour card"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid var(--brand-line)',
            borderRadius: 999,
            color: 'var(--brand-indigo-mute)',
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          × HIDE
        </button>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-clash), system-ui, sans-serif',
          fontSize: 22,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          margin: '0 0 8px',
        }}
      >
        {step.headline}
      </div>
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          margin: '0 0 10px',
          color: 'var(--brand-indigo-mid, #3A3478)',
        }}
      >
        {step.body}
      </p>
      {step.tryThis && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            marginBottom: 14,
            background: 'var(--brand-yellow-soft, #F5E89A)',
            border: '1px solid var(--brand-yellow)',
            borderRadius: 6,
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            color: 'var(--brand-indigo)',
            fontWeight: 700,
          }}
        >
          → {step.tryThis.toUpperCase()}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: step.tryThis ? 0 : 8,
        }}
      >
        {tour.stepIndex > 0 && (
          <button
            type="button"
            onClick={tour.back}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              color: 'var(--brand-indigo)',
              border: '1px solid var(--brand-line)',
              borderRadius: 6,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 12.5,
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
            padding: '9px 18px',
            background: 'var(--brand-indigo)',
            color: 'var(--brand-sand)',
            border: 'none',
            borderRadius: 6,
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(11,8,40,0.22)',
          }}
        >
          {step.cta === 'finish' ? 'End demo →' : step.cta === 'transition' ? 'Continue →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
