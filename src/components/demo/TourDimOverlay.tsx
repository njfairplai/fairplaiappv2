'use client'

import { useEffect, useState } from 'react'

/**
 * Tour dim overlay — full-screen dim with a clip-path cutout around the
 * tour anchor element, so the spotlight is the only thing the user sees
 * at full brightness. Pointer-events on the overlay block clicks outside
 * the spotlight (we do NOT block clicks inside it — the user can still
 * interact with the highlighted element if they want, e.g. to expand a
 * card or click into a row).
 *
 * Implementation: SVG mask with a fenestrated rect. The cutout has a
 * 6px buffer + 8px border-radius so it reads as a "spotlight" not a
 * sharp window.
 */

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 6
const RADIUS = 10

export function TourDimOverlay({ anchor }: { anchor: string }) {
  const [rect, setRect] = useState<AnchorRect | null>(null)
  const [vw, setVw] = useState(1024)
  const [vh, setVh] = useState(768)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const update = () => {
      const el = document.querySelector(anchor) as HTMLElement | null
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      } else {
        setRect(null)
      }
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
    }
  }, [anchor])

  // No anchor visible yet — render a plain dim while we wait.
  if (!rect) {
    return (
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 8, 40, 0.55)',
          zIndex: 999,
          pointerEvents: 'none',
          animation: 'tourDimIn 200ms ease both',
        }}
      >
        <style>{`
          @keyframes tourDimIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    )
  }

  const x = Math.max(0, rect.left - PAD)
  const y = Math.max(0, rect.top - PAD)
  const w = rect.width + PAD * 2
  const h = rect.height + PAD * 2

  return (
    <svg
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        pointerEvents: 'none',
        animation: 'tourDimIn 200ms ease both',
      }}
      width={vw}
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
    >
      <style>{`
        @keyframes tourDimIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <defs>
        <mask id="tour-spotlight-mask">
          {/* white = visible (i.e. dim), black = transparent (i.e. cutout) */}
          <rect x={0} y={0} width={vw} height={vh} fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={RADIUS} ry={RADIUS} fill="black" />
        </mask>
      </defs>
      <rect
        x={0}
        y={0}
        width={vw}
        height={vh}
        fill="rgba(11, 8, 40, 0.55)"
        mask="url(#tour-spotlight-mask)"
      />
      {/* Yellow highlight ring around the spotlight to draw the eye */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={RADIUS}
        ry={RADIUS}
        fill="none"
        stroke="var(--brand-yellow, #FCD718)"
        strokeWidth={2}
        strokeOpacity={0.9}
      />
    </svg>
  )
}
