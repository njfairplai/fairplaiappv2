'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, type KeyboardEvent } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
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
      style={{
        width: '100%',
        maxWidth: 720,
        background: '#fff',
        border: `1.5px solid ${focused ? BRAND.indigo : BRAND.line}`,
        borderRadius: 8,
        boxShadow: focused
          ? '0 8px 28px rgba(11,8,40,0.12)'
          : '0 2px 6px rgba(11,8,40,0.06)',
        transition: 'all 200ms ease',
        overflow: 'hidden',
      }}
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
        style={{
          width: '100%',
          padding: isMobile ? '16px 18px' : '20px 22px',
          fontFamily: TYPE.body,
          fontSize: isMobile ? 15 : 17,
          color: BRAND.indigo,
          lineHeight: 1.4,
          minHeight: 78,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          display: 'block',
        }}
      />
      <div
        style={{
          padding: isMobile ? '8px 10px' : '10px 14px',
          borderTop: `1px solid ${BRAND.line}`,
          background: BRAND.sand,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 10,
          flexWrap: 'wrap',
        }}
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
        <span style={{ flex: 1 }} />
        {!isMobile && (
          <span
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              letterSpacing: '0.18em',
              color: BRAND.indigoMute,
              fontWeight: 700,
            }}
          >
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
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 760,
        marginBottom: 14,
      }}
    >
      {chips.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onPick?.(c)}
          style={{
            background: 'transparent',
            border: `1px solid ${BRAND.line}`,
            padding: isMobile ? '6px 10px' : '7px 12px',
            borderRadius: 18,
            cursor: 'pointer',
            fontFamily: TYPE.mono,
            fontSize: isMobile ? 9.5 : 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: BRAND.indigoMid,
            textTransform: 'uppercase',
            transition: 'all 150ms ease',
          }}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
