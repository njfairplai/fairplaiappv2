'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { COLORS } from '@/lib/constants'
import { useCoachHub } from '@/contexts/CoachHubContext'
import type { CoachChatMessage, CoachChatCard, CoachAgentAction } from '@/lib/types'
import { Users, Calendar, FileText, BarChart3, ClipboardList, ChevronRight, AlertTriangle } from 'lucide-react'

const actionIcons: Record<string, React.ReactNode> = {
  view_squad: <Users size={14} />,
  check_schedule: <Calendar size={14} />,
  create_idp: <FileText size={14} />,
  view_stats: <BarChart3 size={14} />,
  review_session: <ClipboardList size={14} />,
  analyze_player: <Users size={14} />,
}

function ActionChips({ actions }: { actions: Array<{ label: string; action: string }> }) {
  const { triggerAction } = useCoachHub()
  const router = useRouter()

  const handleAction = (action: string) => {
    // Some actions navigate directly
    if (action === 'view_squad') { router.push('/coach/web/squad'); return }
    if (action === 'create_idp') { router.push('/coach/web/idps'); return }
    triggerAction(action as CoachAgentAction)
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={() => handleAction(a.action)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 20,
            background: '#fff', border: `1px solid ${COLORS.primary}30`,
            color: COLORS.primary, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${COLORS.primary}10` }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
        >
          {actionIcons[a.action] || null}
          {a.label}
        </button>
      ))}
    </div>
  )
}

function StatCard({ stats }: { stats: Array<{ label: string; value: number }> }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
      gap: 8, marginTop: 8,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 10, padding: '12px 14px',
          border: '1px solid #E8EAED',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{s.value}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function ReviewPrompt({ count }: { count: number }) {
  const router = useRouter()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginTop: 8,
      padding: '12px 16px', borderRadius: 10,
      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    }}>
      <AlertTriangle size={18} color="#F59E0B" />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
          {count} session{count > 1 ? 's' : ''} need{count === 1 ? 's' : ''} review
        </span>
      </div>
      <button
        onClick={() => router.push('/coach/web/video')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '6px 12px', borderRadius: 6,
          background: '#F59E0B', border: 'none',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Review Now <ChevronRight size={12} />
      </button>
    </div>
  )
}

function renderCard(card: CoachChatCard, index: number) {
  const p = card.payload
  switch (card.type) {
    case 'action_chips':
      return <ActionChips key={index} actions={p.actions as Array<{ label: string; action: string }>} />
    case 'stat_card':
      return <StatCard key={index} stats={p.stats as Array<{ label: string; value: number }>} />
    case 'review_prompt':
      return <ReviewPrompt key={index} count={p.count as number} />
    default:
      return null
  }
}

export default function CoachChatBubble({ message }: { message: CoachChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
    }}>
      <div style={{
        maxWidth: isUser ? '70%' : '85%',
      }}>
        {message.text && (
          <div style={{
            padding: '10px 16px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isUser ? COLORS.primary : '#fff',
            color: isUser ? '#fff' : '#1E293B',
            fontSize: 14,
            lineHeight: 1.5,
            boxShadow: isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
            border: isUser ? 'none' : '1px solid #E8EAED',
          }}>
            {message.text}
          </div>
        )}
        {message.cards?.map((card, i) => renderCard(card, i))}
      </div>
    </div>
  )
}
