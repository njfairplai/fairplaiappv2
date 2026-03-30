'use client'

import React, { useRef, useEffect } from 'react'
import { COLORS } from '@/lib/constants'
import { useCoachHub } from '@/contexts/CoachHubContext'
import CoachChatBubble from './CoachChatBubble'
import CoachChatInput from './CoachChatInput'
import { Sparkles } from 'lucide-react'

export default function CoachChatContainer() {
  const { messages, isLoading, sendMessage } = useCoachHub()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%',
      background: '#fff', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '16px 24px', borderBottom: '1px solid #E8EAED',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${COLORS.primary}, #8B5CF6)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Coach&apos;s Hub</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Your AI coaching assistant</div>
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px 24px 16px',
        background: '#F8F9FC',
      }}>
        {messages.map(msg => (
          <CoachChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px', maxWidth: '80%' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: COLORS.primary,
                animation: `pulse-dot 1s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.5,
              }} />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <CoachChatInput onSend={sendMessage} disabled={isLoading} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
      ` }} />
    </div>
  )
}
