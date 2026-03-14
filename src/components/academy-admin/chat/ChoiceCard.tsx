'use client'

import React, { useState } from 'react'
import { COLORS, RADIUS } from '@/lib/constants'
import { useCommandCentre } from '@/contexts/CommandCentreContext'
import { Pencil, Upload } from 'lucide-react'

interface ChoiceCardProps {
  context: 'add_player' | 'add_program'
  messageId: string
}

const LABELS: Record<string, { title: string; manualLabel: string; uploadLabel: string; uploadDesc: string }> = {
  add_player: {
    title: 'How would you like to add players?',
    manualLabel: 'Enter manually',
    uploadLabel: 'Upload file or photo',
    uploadDesc: 'CSV, Excel, or photo of a player list',
  },
  add_program: {
    title: 'How would you like to create a program?',
    manualLabel: 'Enter manually',
    uploadLabel: 'Upload file or photo',
    uploadDesc: 'CSV, Excel, or photo of a schedule',
  },
}

export default function ChoiceCard({ context, messageId }: ChoiceCardProps) {
  const { appendAssistantMessage } = useCommandCentre()
  const [chosen, setChosen] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(`fairplai_choice_${messageId}`) || null
  })

  const labels = LABELS[context] || LABELS.add_player

  function handleChoice(choice: 'manual' | 'upload') {
    if (chosen) return
    setChosen(choice)
    localStorage.setItem(`fairplai_choice_${messageId}`, choice)

    if (choice === 'manual') {
      appendAssistantMessage(
        context === 'add_player' ? "Sure! Fill in the player details below:" : "Sure! Fill in the program details below:",
        [{ type: 'inline_form', payload: { formType: context } }]
      )
    } else {
      appendAssistantMessage(
        context === 'add_player'
          ? "Upload a file or take a photo of your player list — I'll extract the details automatically."
          : "Upload a file or photo of your program schedule — I'll extract the details automatically.",
        [{ type: 'smart_upload', payload: { context } }]
      )
    }
  }

  if (chosen) {
    return (
      <div style={{
        padding: '12px 16px', borderRadius: RADIUS.card,
        background: COLORS.lightBg, border: `1px solid ${COLORS.border}`,
        fontSize: 12, color: COLORS.muted, fontStyle: 'italic',
      }}>
        {chosen === 'manual' ? `Selected: ${labels.manualLabel}` : `Selected: ${labels.uploadLabel}`}
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff', borderRadius: RADIUS.card, overflow: 'hidden',
      border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{labels.title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>
        {/* Manual entry */}
        <button
          onClick={() => handleChoice('manual')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '20px 16px', borderRadius: 12, cursor: 'pointer',
            background: `${COLORS.primary}08`, border: `1.5px solid ${COLORS.primary}30`,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${COLORS.primary}14`
            e.currentTarget.style.borderColor = `${COLORS.primary}60`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${COLORS.primary}08`
            e.currentTarget.style.borderColor = `${COLORS.primary}30`
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${COLORS.primary}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Pencil size={22} color={COLORS.primary} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{labels.manualLabel}</p>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: '4px 0 0' }}>Type in the details</p>
          </div>
        </button>

        {/* Upload */}
        <button
          onClick={() => handleChoice('upload')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '20px 16px', borderRadius: 12, cursor: 'pointer',
            background: 'rgba(16,185,129,0.05)', border: '1.5px solid rgba(16,185,129,0.25)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(16,185,129,0.1)'
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(16,185,129,0.05)'
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload size={22} color="#10B981" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{labels.uploadLabel}</p>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: '4px 0 0' }}>{labels.uploadDesc}</p>
          </div>
        </button>
      </div>
    </div>
  )
}
