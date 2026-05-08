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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 8, 40, 0.92)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <button
        type="button"
        aria-label="Close video"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 999,
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(238, 228, 200, 0.25)',
          color: 'var(--brand-sand)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <X size={18} />
      </button>

      {caption && (
        <div
          style={{
            position: 'absolute',
            top: 'max(16px, env(safe-area-inset-top, 16px))',
            left: 16,
            padding: '8px 14px',
            borderRadius: 999,
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(238, 228, 200, 0.18)',
            color: 'var(--brand-yellow)',
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            fontWeight: 700,
            zIndex: 2,
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
        style={{
          width: '100%',
          maxWidth: 920,
          maxHeight: '85vh',
          borderRadius: 12,
          background: '#000',
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.6)',
        }}
      />
    </div>
  )
}
