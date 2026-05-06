'use client'

import { useEffect, useRef } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterHighlight } from '@/lib/match-center'
import { MEyebrow, mcButtons } from './atoms'

/* Small action sheet that appears when the coach clicks ↗ on a clip.
 * Three stub destinations: copy link / send to parent / send to player.
 * Each triggers a toast via the parent-supplied callbacks. Real
 * messaging integration (WhatsApp / SMS / email) is downstream — for
 * now the sheet documents the intended capability and gives the coach
 * a real action point per the "every button does something" mandate. */

interface ShareSheetProps {
  clip: MatchCenterHighlight | null
  onClose: () => void
  onAction: (label: string) => void
}

export function ShareSheet({ clip, onClose, onAction }: ShareSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!clip) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clip, onClose])

  if (!clip) return null

  function shareTo(label: string, toast: string) {
    if (label === 'Copy link' && typeof window !== 'undefined' && navigator.clipboard) {
      // Best-effort clipboard write. We don't surface the URL itself
      // anywhere yet so this is a stable demo URL.
      const url = `${window.location.origin}/share/clip/${clip!.id}`
      navigator.clipboard.writeText(url).catch(() => {})
    }
    onAction(toast)
    onClose()
  }

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 95,
        padding: 24,
      }}
    >
      <div
        style={{
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderRadius: 8,
          width: '100%',
          maxWidth: 380,
          padding: '20px 22px',
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
        }}
      >
        <MEyebrow>SHARE CLIP</MEyebrow>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          {clip.ev} · {clip.minute}&apos; · {clip.player} #{clip.num}
        </div>
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <button
            type="button"
            style={{ ...mcButtons.primary, padding: '11px 14px' }}
            onClick={() => shareTo('Copy link', 'Link copied to clipboard')}
          >
            Copy link
          </button>
          <button
            type="button"
            style={{ ...mcButtons.ghost, padding: '11px 14px' }}
            onClick={() => shareTo('Parent', `Sent to ${clip!.player}'s parent`)}
          >
            Send to parent
          </button>
          <button
            type="button"
            style={{ ...mcButtons.ghost, padding: '11px 14px' }}
            onClick={() => shareTo('Player', `Sent to ${clip!.player}`)}
          >
            Send to player
          </button>
        </div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" style={mcButtons.text} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
