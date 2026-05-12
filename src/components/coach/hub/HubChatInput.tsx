'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, type KeyboardEvent } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/cn'
import { hubGhostBtnStyle, hubPrimaryBtnStyle } from './HubEmbeds'

/* The chat input is the hero of the Coach Hub. Centered, large,
 * weighted toward the question itself — everything else on the
 * surface is in service of "ask Mikel anything". */

export interface HubChatInputHandle {
  /** Imperative API: set the input value AND focus it. Used by the
   *  parent page when a suggestion chip is clicked. */
  setValueAndFocus: (next: string) => void
}

interface HubChatInputProps {
  initialFocus?: boolean
  onSubmit?: (question: string) => void
  onAttach?: () => void
  onMention?: () => void
}

export const HubChatInput = forwardRef<HubChatInputHandle, HubChatInputProps>(function HubChatInput(
  { initialFocus = false, onSubmit, onAttach, onMention },
  ref,
) {
  const isMobile = useIsMobile()
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(initialFocus)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    setValueAndFocus: (next: string) => {
      setValue(next)
      // Wait a tick so the textarea ref reflects the new value before
      // focusing/selecting the end.
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(next.length, next.length)
      })
    },
  }))

  // Cmd/Ctrl-K shortcut focuses the input. Matches the design's
  // "⏎ TO SEND · ⌘K TO FOCUS" hint in the input footer.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleSubmit() {
    if (!value.trim()) return
    onSubmit?.(value.trim())
    setValue('')
  }
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      className={cn(
        'w-full max-w-[720px] overflow-hidden rounded-lg border-[1.5px] bg-white transition-all duration-200 ease-in-out',
        focused
          ? 'border-brand-indigo shadow-[0_8px_28px_rgba(11,8,40,0.12)]'
          : 'border-brand-line shadow-[0_2px_6px_rgba(11,8,40,0.06)]',
      )}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Mikel anything…"
        rows={2}
        className={cn(
          'block w-full min-h-[78px] resize-none border-none bg-transparent font-satoshi leading-[1.4] text-brand-indigo outline-none',
          isMobile ? 'px-[18px] py-4 text-[15px]' : 'px-[22px] py-5 text-[17px]',
        )}
      />
      <div
        className={cn(
          'flex flex-wrap items-center border-t border-brand-line bg-brand-sand',
          isMobile ? 'gap-1.5 px-2.5 py-2' : 'gap-2.5 px-3.5 py-2.5',
        )}
      >
        {!isMobile && (
          <>
            <button type="button" style={hubGhostBtnStyle} onClick={onAttach}>
              ＋ Attach clip
            </button>
            <button type="button" style={hubGhostBtnStyle} onClick={onMention}>
              ＠ Mention player
            </button>
          </>
        )}
        <span className="flex-1" />
        {!isMobile && (
          <span className="font-fragment text-[9px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            ⏎ TO SEND · ⌘K TO FOCUS
          </span>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          style={{
            ...hubPrimaryBtnStyle,
            opacity: value.trim() ? 1 : 0.5,
            cursor: value.trim() ? 'pointer' : 'default',
          }}
        >
          ASK MIKEL →
        </button>
      </div>
    </div>
  )
})

interface SuggestionChipsProps {
  chips: string[]
  onPick?: (chip: string) => void
}

export function SuggestionChips({ chips, onPick }: SuggestionChipsProps) {
  const isMobile = useIsMobile()
  return (
    <div className="mb-3.5 flex max-w-[760px] flex-wrap justify-center gap-2">
      {chips.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onPick?.(c)}
          className={cn(
            'cursor-pointer rounded-[18px] border border-brand-line bg-transparent font-fragment font-semibold uppercase tracking-[0.14em] text-brand-indigo-mid transition-all duration-150 ease-in-out',
            isMobile ? 'px-2.5 py-1.5 text-[9.5px]' : 'px-3 py-[7px] text-[10px]',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
