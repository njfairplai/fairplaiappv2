'use client'

import React, { useState, useRef } from 'react'
import { COLORS } from '@/lib/constants'
import { Send } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function CoachChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || disabled) return
    onSend(text)
    setInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px',
        borderTop: '1px solid #E8EAED',
        background: '#fff', flexShrink: 0,
      }}
    >
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask about your squad, schedule, or stats..."
        disabled={disabled}
        style={{
          flex: 1, padding: '12px 16px', borderRadius: 12,
          border: '1px solid #E2E8F0', fontSize: 14, color: '#1E293B',
          outline: 'none', background: '#F8FAFC',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = COLORS.primary }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0' }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: input.trim() ? COLORS.primary : '#E2E8F0',
          border: 'none', cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <Send size={18} color={input.trim() ? '#fff' : '#94a3b8'} />
      </button>
    </form>
  )
}
