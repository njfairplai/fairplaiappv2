'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Lightweight full-screen video modal — used by parent surfaces
 * (HomeHero best-clip, MatchFilmstripCard moments) when a `clipUrl`
 * is present.
 *
 * The clipUrl is expected to carry an HTML5 `#t=start,end` fragment
 * (see src/lib/demo-video.ts) so the same source file can back many
 * clips. Autoplay + muted by default to satisfy mobile autoplay
 * policy; tap-to-unmute via the native controls.
 */

interface VideoModalProps {
  open: boolean
  onClose: () => void
  src: string
  /** Caption shown in the top-left chrome strip — e.g. "GOAL · 14m". */
  caption?: string
}

export function VideoModal({ open, onClose, src, caption }: VideoModalProps) {
  const ref = useRef<HTMLVideoElement | null>(null)

  // Pause + reset when closing so a re-open doesn't resume mid-clip.
  useEffect(() => {
    if (!open) {
      const el = ref.current
      if (el) {
        try { el.pause() } catch { /* ignore */ }
      }
      return
    }
    // ESC closes
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(11, 8, 40, 0.92)', zIndex: 1100 }}
    >
      <button
        type="button"
        aria-label="Close video"
        onClick={onClose}
        className="absolute right-4 z-[2] inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-brand-sand"
        style={{
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(238, 228, 200, 0.25)',
        }}
      >
        <X size={18} />
      </button>

      {caption && (
        <div
          className="absolute left-4 z-[2] rounded-full px-3.5 py-2 font-fragment text-[11px] font-bold tracking-[0.18em] text-brand-yellow"
          style={{
            top: 'max(16px, env(safe-area-inset-top, 16px))',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(238, 228, 200, 0.18)',
          }}
        >
          {caption}
        </div>
      )}

      <video
        ref={ref}
        src={src}
        controls
        autoPlay
        playsInline
        muted
        preload="metadata"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[920px] rounded-xl bg-black"
        style={{
          maxHeight: '85vh',
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.6)',
        }}
      />
    </div>
  )
}
