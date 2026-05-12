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
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-brand-yellow px-3.5 py-2 font-satoshi text-[12.5px] font-bold text-brand-indigo"
      >
        <Share2 size={13} /> Share
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Share"
        className="inline-flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-md border border-brand-line bg-transparent text-brand-indigo"
      >
        <Share2 size={12} />
      </button>
    )

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-30 flex min-w-[200px] flex-col gap-0.5 rounded-[10px] border border-brand-line bg-brand-paper p-1.5 font-satoshi shadow-[0_12px_28px_rgba(11,8,40,0.18)]"
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
  const sharedClassName =
    'flex w-full cursor-pointer items-center gap-2.5 rounded-md border-none bg-transparent px-2.5 py-2 text-left font-[inherit] text-[13px] font-semibold text-brand-indigo no-underline'
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={sharedClassName}
      >
        {icon} {label}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={sharedClassName}>
      {icon} {label}
    </button>
  )
}
