'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Send, Download, Link2 } from 'lucide-react'
import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterHighlight } from '@/lib/match-center'
import { sendClipToParent } from '@/lib/match-center'
import { players, parents } from '@/lib/mockData'
import { MEyebrow, mcButtons } from './atoms'

/* Share Clip sheet — single primary CTA "Send to {parent}" plus the
 * secondary Download + Copy link affordances. The previous three-way
 * split (copy / parent / player) diluted the primary action; coaches
 * share clips TO PARENTS — that's the job. The primary CTA writes a
 * SharedClipRecord to localStorage which the parent inbox picks up
 * via parent-portal.ts -> readClientNotifications(). The Copy link
 * URL routes to /parent/clips/<highlightId>?source=shared, which is
 * a real route built in this slice. */

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

  // Resolve player + parent so the primary CTA names the actual recipient.
  const parentTarget = useMemo(() => {
    if (!clip) return null
    const player = players.find(p => p.jerseyNumber === clip.num)
    if (!player) return null
    const parentId = player.parentIds[0]
    if (!parentId) return null
    const parent = parents.find(p => p.id === parentId)
    if (!parent) return null
    return { player, parent }
  }, [clip])

  if (!clip) return null

  function sendToParent() {
    if (!parentTarget || !clip) return
    sendClipToParent({
      highlightId: clip.id,
      playerId: parentTarget.player.id,
      parentId: parentTarget.parent.id,
      coachId: 'coach_001',
      message: clip.headline,
    })
    onAction(`Sent to ${parentTarget.parent.name}`)
    onClose()
  }

  function copyLink() {
    if (!clip) return
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}/parent/clips/${clip.id}?source=shared`
      navigator.clipboard.writeText(url).catch(() => {})
    }
    onAction('Link copied to clipboard')
    onClose()
  }

  function download() {
    // No real video binary in the mock — show feedback so the affordance
    // is clearly wired but doesn't pretend to deliver a file. The real
    // backend will swap this for a signed-URL download.
    onAction('Download queued')
    onClose()
  }

  const parentLabel = parentTarget
    ? `Send to ${parentTarget.parent.name.split(' ')[0]}`
    : 'Send to parent'
  const parentSub = parentTarget
    ? `${parentTarget.player.firstName}'s parent · in-app inbox`
    : 'Parent inbox'

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
          maxWidth: 400,
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

        {/* Primary CTA — full width, names the actual parent. */}
        <button
          type="button"
          onClick={sendToParent}
          disabled={!parentTarget}
          style={{
            ...mcButtons.primary,
            marginTop: 16,
            width: '100%',
            padding: '13px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: parentTarget ? 1 : 0.55,
            cursor: parentTarget ? 'pointer' : 'not-allowed',
          }}
        >
          <Send size={14} />
          <span>{parentLabel}</span>
        </button>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 11.5,
            color: BRAND.indigoMute,
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          {parentSub}
        </div>

        {/* Secondary row — Download + Copy link, equal weight. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            onClick={download}
            style={{
              ...mcButtons.ghost,
              padding: '10px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Download size={13} />
            Download
          </button>
          <button
            type="button"
            onClick={copyLink}
            style={{
              ...mcButtons.ghost,
              padding: '10px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Link2 size={13} />
            Copy link
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
