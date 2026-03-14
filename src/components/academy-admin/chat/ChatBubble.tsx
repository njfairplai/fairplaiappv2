'use client'

import React from 'react'
import type { ChatMessage } from '@/lib/types'
import { COLORS, RADIUS } from '@/lib/constants'
import ActionChips from './ActionChips'
import SetupProgressCard from './SetupProgressCard'
import InlineFormCard from './InlineFormCard'
import StatSummaryCard from './StatSummaryCard'
import EntityListCard from './EntityListCard'
import ConfirmationCard from './ConfirmationCard'
import CsvBulkImportCard from './CsvBulkImportCard'
import ChoiceCard from './ChoiceCard'
import SmartUploadCard from './SmartUploadCard'

interface Props {
  message: ChatMessage
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 8, marginBottom: 16 }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.periwinkle})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            F
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>FairplAI</span>
        </div>
      )}

      {message.text && (
        <div style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? COLORS.primary : '#F0F1F8',
          color: isUser ? '#fff' : COLORS.navy,
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}>
          {message.text}
        </div>
      )}

      {message.cards?.map((card, i) => (
        <div key={i} style={{ maxWidth: '90%', width: '100%' }}>
          {card.type === 'action_chips' && (
            <ActionChips chips={(card.payload.chips as Array<{ label: string; action: string }>) || []} />
          )}
          {card.type === 'progress_card' && (
            <SetupProgressCard progress={(card.payload.progress as { completedSteps: string[]; totalSteps: number })} />
          )}
          {card.type === 'inline_form' && (
            <InlineFormCard formType={card.payload.formType as string} messageId={message.id} />
          )}
          {card.type === 'stat_card' && (
            <StatSummaryCard stats={card.payload.stats as Array<{ label: string; value: string | number }> | undefined} />
          )}
          {card.type === 'entity_list' && (
            <EntityListCard entityType={card.payload.entityType as string} />
          )}
          {card.type === 'confirmation' && (
            <ConfirmationCard action={card.payload.action as string} payload={card.payload as Record<string, unknown>} />
          )}
          {card.type === 'csv_import' && (
            <CsvBulkImportCard messageId={message.id} />
          )}
          {card.type === 'choice_card' && (
            <ChoiceCard context={card.payload.context as 'add_player' | 'add_program'} messageId={message.id} />
          )}
          {card.type === 'smart_upload' && (
            <SmartUploadCard context={card.payload.context as 'add_player' | 'add_program'} messageId={message.id} />
          )}
        </div>
      ))}
    </div>
  )
}
