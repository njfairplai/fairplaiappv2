'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import type { Player } from '@/lib/types'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'

interface PlayerPickerPopoverProps {
  /** Pool the user can pick from. */
  pool: Player[]
  /** Already selected — these are filtered out and shown as "added". */
  excluded: string[]
  /** Whether the picker is open. */
  open: boolean
  onClose: () => void
  onPick: (id: string) => void
  /** Anchor placement — defaults to 'right' (popover sits left-aligned with anchor). */
  align?: 'left' | 'right'
}

/**
 * Compact roster-search popover. Click a row → onPick(id). The host owns the
 * trigger button; this component only renders the floating panel and its
 * outside-click + Escape behaviour.
 */
export function PlayerPickerPopover({
  pool,
  excluded,
  open,
  onClose,
  onPick,
  align = 'right',
}: PlayerPickerPopoverProps) {
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const available = useMemo(
    () => pool.filter(p => !excluded.includes(p.id)),
    [pool, excluded],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return available
    return available.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
      const pos = p.position.join(' ').toLowerCase()
      return (
        fullName.includes(q) ||
        pos.includes(q) ||
        String(p.jerseyNumber).includes(q)
      )
    })
  }, [available, query])

  if (!open) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        [align]: 0,
        zIndex: 30,
        width: 320,
        background: 'var(--brand-sand)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        boxShadow: '0 18px 40px rgba(11, 8, 40, 0.18)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxHeight: 380,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          ADD PLAYER
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close picker"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--brand-indigo-mute)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>
      <input
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name, position, jersey"
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid var(--brand-line)',
          background: 'var(--brand-paper)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--brand-indigo)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          paddingRight: 2,
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '18px 8px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              color: 'var(--brand-indigo-mute)',
            }}
          >
            {available.length === 0 ? 'All squad players added' : 'No players match'}
          </div>
        ) : (
          filtered.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background = 'var(--brand-paper)')
              }
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <PlayerGlyph
                size={32}
                jerseyNumber={p.jerseyNumber}
                name={`${p.firstName} ${p.lastName}`}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--brand-indigo)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.firstName} {p.lastName}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.18em',
                    color: 'var(--brand-indigo-mute)',
                    fontWeight: 700,
                  }}
                >
                  #{p.jerseyNumber} · {p.position.join(' / ')}
                </div>
              </div>
              <Plus size={14} color="var(--brand-indigo-mute)" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
