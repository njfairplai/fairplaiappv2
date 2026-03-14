'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { useFeedback } from '@/contexts/FeedbackContext'

interface FeedbackPromptProps {
  screenKey: string
  question: string
  textPlaceholder: string
  bottomOffset?: number
  desktopSidebarOffset?: number
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 2, margin: '12px 0' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            fontSize: 28,
            lineHeight: 1,
            color: n <= (hover || value) ? '#F39C12' : COLORS.border,
            transition: 'color 0.12s ease, transform 0.12s ease',
            transform: n <= (hover || value) ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {n <= (hover || value) ? '\u2605' : '\u2606'}
        </button>
      ))}
      {value > 0 && (
        <span style={{ fontSize: 13, color: COLORS.muted, alignSelf: 'center', marginLeft: 8 }}>
          {value}/5
        </span>
      )}
    </div>
  )
}

export default function FeedbackPrompt({
  screenKey,
  question,
  textPlaceholder,
  bottomOffset = 90,
  desktopSidebarOffset = 0,
}: FeedbackPromptProps) {
  const { dismissedScreens, dismissScreen, submitRating } = useFeedback()
  const [visible, setVisible] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const mountedScreenKey = useRef(screenKey)

  // Check if already dismissed
  const alreadyDismissed = dismissedScreens.has(screenKey)

  // Slide in after delay
  useEffect(() => {
    mountedScreenKey.current = screenKey
    if (alreadyDismissed) return

    const timer = setTimeout(() => {
      if (mountedScreenKey.current === screenKey) {
        setVisible(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [screenKey, alreadyDismissed])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => {
      dismissScreen(screenKey)
      setDismissed(true)
    }, 400)
  }

  function handleSubmit() {
    if (rating === 0) return
    submitRating(screenKey, question, rating, comment.trim())
    setSubmitted(true)
    setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        dismissScreen(screenKey)
        setDismissed(true)
      }, 400)
    }, 1500)
  }

  if (alreadyDismissed || dismissed) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: bottomOffset,
        left: desktopSidebarOffset || 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(27,22,80,0.18)',
          padding: '20px 24px',
          pointerEvents: 'auto',
          transform: visible ? 'translateY(0)' : 'translateY(calc(100% + 40px))',
          opacity: visible ? 1 : 0,
          transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
        }}
      >
        {submitted ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ display: 'inline' }}>
                <circle cx="16" cy="16" r="16" fill="#27AE6020" />
                <path d="M10 16l4 4 8-8" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, margin: 0 }}>
              Thanks for your feedback!
            </p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, margin: 0, lineHeight: 1.4 }}>
                {question}
              </p>
              <button
                onClick={handleDismiss}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
              >
                <X size={16} color={COLORS.muted} />
              </button>
            </div>

            {/* Star rating */}
            <StarRating value={rating} onChange={setRating} />

            {/* Text field — shown after rating */}
            {rating > 0 && (
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={textPlaceholder}
                rows={2}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  color: COLORS.navy,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                  marginBottom: 12,
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = COLORS.primary }}
                onBlur={e => { e.currentTarget.style.borderColor = COLORS.border }}
              />
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: COLORS.muted,
                  padding: '4px 0',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                style={{
                  background: COLORS.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 20,
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: rating > 0 ? 'pointer' : 'default',
                  opacity: rating > 0 ? 1 : 0.4,
                  transition: 'opacity 0.15s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
