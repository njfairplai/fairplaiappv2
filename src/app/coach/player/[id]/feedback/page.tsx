'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { players, rosters, sessions, playerFeedbackStatus } from '@/lib/mockData'
import PlayerAvatar from '@/components/coach/PlayerAvatar'
import { SHADOWS, COLORS } from '@/lib/constants'
import { ChevronLeft } from 'lucide-react'

type RatingKey = 'attitude' | 'effort' | 'coachability' | 'sportsmanship'

const ratingLabels: { key: RatingKey; label: string; emoji: string }[] = [
  { key: 'attitude', label: 'Attitude', emoji: '🧠' },
  { key: 'effort', label: 'Effort', emoji: '💪' },
  { key: 'coachability', label: 'Coachability', emoji: '📋' },
  { key: 'sportsmanship', label: 'Sportsmanship', emoji: '🤝' },
]

export default function PlayerFeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const playerId = params.id as string
  const player = players.find(p => p.id === playerId)

  const [ratings, setRatings] = useState<Record<RatingKey, number | null>>({
    attitude: null,
    effort: null,
    coachability: null,
    sportsmanship: null,
  })
  const [summary, setSummary] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  if (!player) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#F5F6FC' }}>
        <p>Player not found</p>
      </div>
    )
  }

  // Find the roster this player belongs to
  const playerSessions = sessions.filter(s => s.participatingPlayerIds.includes(playerId))
  const rosterId = playerSessions[0]?.rosterId
  const roster = rosters.find(r => r.id === rosterId)
  const feedbackStatus = playerFeedbackStatus[playerId]

  const allRated = Object.values(ratings).every(v => v !== null)
  const canSubmit = allRated

  function handleRate(key: RatingKey, value: number) {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!canSubmit || !player) return
    // Save to localStorage
    const feedbackEntry = {
      id: `feedback_${Date.now()}`,
      playerId,
      coachId: 'coach_001',
      date: new Date().toISOString().split('T')[0],
      ...ratings,
      summary,
      sessionsSinceLastFeedback: feedbackStatus?.sessionsSinceLastFeedback || 0,
    }
    const existing = localStorage.getItem('fairplai_feedback_history')
    const history = existing ? JSON.parse(existing) : []
    history.push(feedbackEntry)
    localStorage.setItem('fairplai_feedback_history', JSON.stringify(history))

    setToast(`Feedback submitted for ${player.firstName} ✓`)
    setTimeout(() => {
      setToast(null)
      router.back()
    }, 1500)
  }

  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#0D1020', paddingBottom: 120 }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={20} color={COLORS.primary} />
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary }}>Back</span>
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Player Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <PlayerAvatar player={player} size="lg" showJersey />
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#F5F6FC', letterSpacing: '-0.4px', margin: 0 }}>
              {player.firstName} {player.lastName}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.4)', marginTop: 4 }}>
              {roster?.name} · {player.position[0]}
            </p>
            {feedbackStatus && (
              <p style={{ fontSize: 12, color: COLORS.warning, fontWeight: 600, marginTop: 4 }}>
                {feedbackStatus.sessionsSinceLastFeedback} sessions since last feedback
              </p>
            )}
          </div>
        </div>

        {/* Rating Attributes */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,246,252,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Ratings
        </p>

        {ratingLabels.map(({ key, label, emoji }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F5F6FC' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(v => {
                const active = ratings[key] === v
                return (
                  <button
                    key={v}
                    onClick={() => handleRate(key, v)}
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: active ? '#4A4AFF' : 'rgba(255,255,255,0.08)',
                      border: active ? '2px solid #757FFF' : '1px solid rgba(255,255,255,0.1)',
                      color: active ? '#fff' : 'rgba(245,246,252,0.5)',
                      fontSize: 16, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Written Summary */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,246,252,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, marginTop: 20 }}>
          Summary (Optional)
        </p>
        <div style={{ position: 'relative' }}>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value.slice(0, 280))}
            placeholder="Write a brief note about this player's development..."
            style={{
              width: '100%', minHeight: 100, padding: '14px 16px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, color: '#F5F6FC', fontSize: 14,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute', bottom: 10, right: 14,
            fontSize: 11, color: summary.length >= 260 ? COLORS.warning : 'rgba(245,246,252,0.3)',
          }}>
            {summary.length}/280
          </span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', marginTop: 24, padding: '14px 0',
            background: canSubmit ? '#4A4AFF' : 'rgba(74,74,255,0.3)',
            color: canSubmit ? '#fff' : 'rgba(245,246,252,0.4)',
            border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? SHADOWS.elevated : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Submit Feedback
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#1B1650', color: '#F5F6FC', padding: '10px 20px',
          borderRadius: 12, fontSize: 14, fontWeight: 600,
          boxShadow: SHADOWS.elevated, zIndex: 100,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
