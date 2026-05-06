'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { BRAND, TYPE } from '@/lib/constants'

/**
 * BottomSheet — phone-friendly slide-up panel.
 *
 * Used by the dots-view month-grid (tap a day → reveal the full session
 * frame + state pane content) and, in Phase 2, by the squad-as-pitch
 * SideRail when the viewport is below the mobile breakpoint.
 *
 * Backdrop dim + click to dismiss. Esc to close. Body scroll locked
 * while open. Drag-handle (visual only — pointer-driven dismissal isn't
 * worth the complexity here, the backdrop tap covers it).
 *
 * Brand chrome: sand surface, indigo ink, line border. Top corners
 * rounded so the sheet reads as lifting off the page.
 */
interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Optional eyebrow shown in the sheet header band. */
  eyebrow?: string
  /** Optional title shown below the eyebrow in display font. */
  title?: string
  children: ReactNode
  /** Max sheet height as a percentage of the viewport. Default 88%. */
  maxHeightVh?: number
}

export function BottomSheet({
  open,
  onClose,
  eyebrow,
  title,
  children,
  maxHeightVh = 88,
}: BottomSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      onClick={e => {
        if (e.target === backdropRef.current) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11,8,40,0.62)',
        backdropFilter: 'blur(4px)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? eyebrow ?? 'Sheet'}
        style={{
          width: '100%',
          maxHeight: `${maxHeightVh}vh`,
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderBottom: 'none',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'mcSheetIn 220ms ease both',
          boxShadow: '0 -16px 40px rgba(11,8,40,0.32)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <span
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: BRAND.line,
            }}
          />
        </div>

        {(eyebrow || title) && (
          <div
            style={{
              padding: '4px 20px 14px',
              borderBottom: `1px solid ${BRAND.line}`,
              background: BRAND.sand,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              {eyebrow && (
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    color: BRAND.indigoMute,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {eyebrow}
                </div>
              )}
              {title && (
                <div
                  style={{
                    fontFamily: TYPE.display,
                    fontSize: 22,
                    letterSpacing: '-0.01em',
                    color: BRAND.indigo,
                    marginTop: eyebrow ? 2 : 0,
                  }}
                >
                  {title}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                color: BRAND.indigo,
                cursor: 'pointer',
                fontFamily: TYPE.mono,
                fontSize: 16,
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}
