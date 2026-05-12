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
      className="absolute top-[calc(100%+8px)] z-30 flex max-h-[380px] w-80 flex-col gap-2.5 rounded-xl border border-brand-line bg-brand-sand p-3 shadow-[0_18px_40px_rgba(11,8,40,0.18)]"
      style={{ [align]: 0 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
          ADD PLAYER
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close picker"
          className="inline-flex cursor-pointer items-center border-none bg-transparent text-brand-indigo-mute"
        >
          <X size={14} />
        </button>
      </div>
      <input
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name, position, jersey"
        className="box-border w-full rounded-lg border border-brand-line bg-brand-paper px-2.5 py-2 font-satoshi text-[13px] text-brand-indigo outline-none"
      />
      <div className="flex flex-col gap-1 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <div className="px-2 py-[18px] text-center font-satoshi text-[12.5px] text-brand-indigo-mute">
            {available.length === 0 ? 'All squad players added' : 'No players match'}
          </div>
        ) : (
          filtered.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent bg-transparent px-2.5 py-2 text-left font-satoshi"
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
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-brand-indigo">
                  {p.firstName} {p.lastName}
                </div>
                <div className="font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
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
