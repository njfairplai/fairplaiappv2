'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, Send, MessageSquare, Clock } from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { useFeedback } from '@/contexts/FeedbackContext'

interface FeedbackPanelProps {
  open: boolean
  onClose: () => void
}

interface StoredGeneralFeedback {
  id: string
  comment: string
  currentPage: string
  submittedAt: string
}

export default function FeedbackPanel({ open, onClose }: FeedbackPanelProps) {
  const pathname = usePathname()
  const { submitGeneral } = useFeedback()
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [history, setHistory] = useState<StoredGeneralFeedback[]>([])

  // Load history when panel opens
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('fairplai_feedback_general')
        if (stored) setHistory(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [open])

  function handleSubmit() {
    if (!comment.trim()) return
    submitGeneral(comment.trim(), pathname)
    setComment('')
    setSubmitted(true)

    // Refresh history
    try {
      const stored = localStorage.getItem('fairplai_feedback_general')
      if (stored) setHistory(JSON.parse(stored))
    } catch {
      // ignore
    }

    setTimeout(() => setSubmitted(false), 2000)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 199,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          background: '#fff',
          zIndex: 200,
          boxShadow: '0 8px 32px rgba(27,22,80,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#27AE6015',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={16} color="#27AE60" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
                Share Your Thoughts
              </h3>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>
                General feedback about anything
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} color={COLORS.muted} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Current page indicator */}
          <div
            style={{
              fontSize: 12,
              color: COLORS.muted,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27AE60', display: 'inline-block' }} />
            Viewing: {pathname}
          </div>

          {/* Textarea */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="What's on your mind? Share any feedback, suggestions, or concerns..."
            rows={5}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              color: COLORS.navy,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              lineHeight: 1.5,
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = COLORS.primary }}
            onBlur={e => { e.currentTarget.style.borderColor = COLORS.border }}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!comment.trim()}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 8,
              background: submitted ? '#27AE60' : COLORS.primary,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: comment.trim() ? 'pointer' : 'default',
              opacity: comment.trim() || submitted ? 1 : 0.4,
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {submitted ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submitted!
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Feedback
              </>
            )}
          </button>

          {/* History */}
          {history.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                Your Previous Feedback ({history.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...history].reverse().map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 14px',
                      background: '#F5F6FC',
                      borderRadius: 8,
                      fontSize: 13,
                      color: COLORS.navy,
                      lineHeight: 1.5,
                    }}
                  >
                    <p style={{ margin: '0 0 6px' }}>{item.comment}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.muted }}>
                      <Clock size={10} />
                      {new Date(item.submittedAt).toLocaleString()}
                      <span style={{ margin: '0 4px' }}>&middot;</span>
                      {item.currentPage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
