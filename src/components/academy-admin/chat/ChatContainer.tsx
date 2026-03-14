'use client'

import React, { useRef, useEffect } from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { useCommandCentre } from '@/contexts/CommandCentreContext'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import { Sparkles } from 'lucide-react'

export default function ChatContainer() {
  const { messages, setupProgress, isLoading, sendMessage } = useCommandCentre()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const completedCount = setupProgress.completedSteps.length
  const totalSteps = setupProgress.totalSteps

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 48px)',
      background: '#fff', borderRadius: RADIUS.card,
      boxShadow: SHADOWS.card, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: `1px solid ${COLORS.border}`,
        background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.periwinkle})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>Command Centre</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Your AI academy assistant</div>
          </div>
        </div>

        {completedCount < totalSteps && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: RADIUS.pill,
            background: `${COLORS.primary}10`, border: `1px solid ${COLORS.primary}20`,
          }}>
            <div style={{
              width: 40, height: 4, background: COLORS.cloud, borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: COLORS.primary,
                width: `${(completedCount / totalSteps) * 100}%`,
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary }}>
              {completedCount}/{totalSteps} setup
            </span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '24px 24px 16px',
          background: COLORS.lightBg,
        }}
      >
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.periwinkle})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              F
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
              background: '#F0F1F8',
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: COLORS.muted,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
