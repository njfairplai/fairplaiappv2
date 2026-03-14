'use client'

import React, { useState, useRef } from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { Send, Loader2 } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSend, isLoading }: Props) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', background: '#fff',
      borderTop: `1px solid ${COLORS.border}`,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
    }}>
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Ask me anything or tell me what to do..."
        disabled={isLoading}
        style={{
          flex: 1, padding: '12px 16px', borderRadius: 24,
          border: `1.5px solid ${COLORS.border}`, fontSize: 14,
          outline: 'none', background: COLORS.lightBg,
          color: COLORS.navy,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = COLORS.primary }}
        onBlur={e => { e.currentTarget.style.borderColor = COLORS.border }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: text.trim() && !isLoading ? COLORS.primary : COLORS.cloud,
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: text.trim() && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s ease',
          flexShrink: 0,
        }}
      >
        {isLoading ? (
          <Loader2 size={18} color={COLORS.muted} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Send size={18} color={text.trim() ? '#fff' : COLORS.muted} />
        )}
      </button>
    </div>
  )
}
