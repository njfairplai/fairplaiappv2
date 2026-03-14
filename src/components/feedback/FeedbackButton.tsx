'use client'

import { MessageSquare } from 'lucide-react'

interface FeedbackButtonProps {
  onClick: () => void
}

export default function FeedbackButton({ onClick }: FeedbackButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 156,
        right: 16,
        zIndex: 998,
        height: 40,
        borderRadius: 20,
        background: '#27AE60',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 14px',
        boxShadow: '0 4px 20px rgba(39,174,96,0.4)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(39,174,96,0.5)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(39,174,96,0.4)'
      }}
    >
      <MessageSquare size={16} color="#fff" />
      <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
        Feedback
      </span>
    </button>
  )
}
