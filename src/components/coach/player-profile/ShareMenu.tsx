'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, MessageCircle, Link as LinkIcon, Mail, Check } from 'lucide-react'

interface ShareMenuProps {
  /** Headline shown on the WhatsApp / email body. */
  title: string
  /** Public-facing URL the recipient opens. */
  url: string
  /** Mode controls the trigger affordance. 'icon' is the small inline button
   *  used on per-clip rows; 'pill' is the larger button used on the reel
   *  hero cards. */
  mode?: 'icon' | 'pill'
  /** Optional one-line message body for WhatsApp / email. */
  body?: string
}

/**
 * Share affordance with three quick channels: WhatsApp deep-link, copy-link
 * (with checkmark confirmation), and mailto. Anchored popover positioned
 * relative to the trigger; closes on outside-click + Escape.
 */
export function ShareMenu({ title, url, mode = 'icon', body }: ShareMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const message = body ?? title
  const waLink = `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`
  const mailLink = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${url}`)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard may be unavailable; do nothing visible.
    }
  }

  const trigger =
    mode === 'pill' ? (
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 999,
          background: 'var(--brand-yellow)',
          color: 'var(--brand-indigo)',
          border: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: 12.5,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <Share2 size={13} /> Share
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Share"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: 6,
          background: 'transparent',
          border: '1px solid var(--brand-line)',
          color: 'var(--brand-indigo)',
          cursor: 'pointer',
        }}
      >
        <Share2 size={12} />
      </button>
    )

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      {trigger}
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 200,
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            borderRadius: 10,
            boxShadow: '0 12px 28px rgba(11, 8, 40, 0.18)',
            padding: 6,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            fontFamily: 'var(--font-body)',
          }}
        >
          <MenuItem
            href={waLink}
            icon={<MessageCircle size={14} />}
            label="WhatsApp"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={copied ? <Check size={14} /> : <LinkIcon size={14} />}
            label={copied ? 'Copied' : 'Copy link'}
            onClick={handleCopy}
          />
          <MenuItem
            href={mailLink}
            icon={<Mail size={14} />}
            label="Email"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  const sharedStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'transparent',
    border: 'none',
    color: 'var(--brand-indigo)',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    width: '100%',
    textAlign: 'left',
  }
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        style={sharedStyle}
      >
        {icon} {label}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} style={sharedStyle}>
      {icon} {label}
    </button>
  )
}
