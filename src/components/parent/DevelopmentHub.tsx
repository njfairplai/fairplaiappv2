'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { categoryGrades, percentileData, coachFlaggedClips, highlights, coachFeedbackHistory } from '@/lib/mockData'
import CategoryGrade from './CategoryGrade'
import PercentileBar from '@/components/charts/PercentileBar'
import BenchmarkComparison from './BenchmarkComparison'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import { SHADOWS, COLORS } from '@/lib/constants'

const LineChartDynamic = dynamic(() => import('@/components/charts/LineChart'), { ssr: false })

function SectionLabel({ text, sub }: { text: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{text}</p>
      {sub && <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 2, margin: 0 }}>{sub}</p>}
    </div>
  )
}

function CoachNotesCard() {
  const unviewed = coachFlaggedClips.filter(c => !c.viewed && c.playerId === 'player_001')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (unviewed.length === 0) return null

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: SHADOWS.card, border: `1.5px solid ${COLORS.warning}33` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${COLORS.warning}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={COLORS.warning}/></svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>Coach&apos;s Notes</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: COLORS.warning, background: `${COLORS.warning}18`, borderRadius: 10, padding: '2px 8px' }}>{unviewed.length} new</span>
      </div>
      {unviewed.map(clip => {
        const hl = highlights.find(h => h.id === clip.highlightId)
        const expanded = expandedId === clip.id
        return (
          <div
            key={clip.id}
            onClick={() => setExpandedId(expanded ? null : clip.id)}
            style={{ background: '#F5F6FC', borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{clip.eventType.replace('_', ' ').toUpperCase()}</span>
                <span style={{ fontSize: 12, color: COLORS.muted, marginLeft: 8 }}>{clip.sessionDate}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M3 4.5L6 7.5L9 4.5" stroke={COLORS.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {expanded && (
              <div style={{ marginTop: 8 }}>
                {clip.coachNote && (
                  <p style={{ fontSize: 13, color: COLORS.navy, margin: '0 0 6px', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{clip.coachNote}&rdquo;</p>
                )}
                {hl && (
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>
                    {hl.eventType.replace('_', ' ')} · {hl.durationSeconds}s clip · {Math.round(hl.aiConfidence)}% AI confidence
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CoachMessageCard() {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/coach-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: 'player_001' }) })
      .then((r) => r.json())
      .then((d) => { setMessage(d.message); setLoading(false) })
      .catch(() => { setMessage(null); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1B1650 0%, #282689 100%)', borderRadius: 16, padding: 20, boxShadow: SHADOWS.card }}>
        <SkeletonLoader width="90%" height={16} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="40%" height={12} style={{ marginLeft: 'auto' }} />
      </div>
    )
  }

  if (!message) {
    return (
      <div style={{ background: '#F5F6FC', border: '1px solid #EDEFF7', borderRadius: 16, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#9DA2B3' }}>Coach message unavailable right now</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #1B1650 0%, #282689 100%)', borderRadius: 16, padding: 20, position: 'relative', boxShadow: SHADOWS.elevated }}>
      <p style={{ fontSize: 15, color: '#F5F6FC', fontStyle: 'italic', lineHeight: 1.65, margin: 0, paddingBottom: 28 }}>
        &ldquo;{message}&rdquo;
      </p>
      <div style={{ position: 'absolute', bottom: 14, right: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 11, color: '#9DA2B3', fontWeight: 600 }}>AI Coach · Powered by FairplAI</span>
      </div>
    </div>
  )
}

function CoachFeedbackCard() {
  const feedback = coachFeedbackHistory.find(f => f.playerId === 'player_001')

  if (!feedback) {
    return (
      <>
        <SectionLabel text="Coach Feedback" />
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: SHADOWS.card, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0 }}>No feedback submitted yet this term.</p>
        </div>
      </>
    )
  }

  const attributes = [
    { label: 'Attitude', value: feedback.attitude, emoji: '🧠' },
    { label: 'Effort', value: feedback.effort, emoji: '💪' },
    { label: 'Coachability', value: feedback.coachability, emoji: '📋' },
    { label: 'Sportsmanship', value: feedback.sportsmanship, emoji: '🤝' },
  ]

  return (
    <>
      <SectionLabel text="Coach Feedback" />
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: SHADOWS.card }}>
        {/* Rating bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {attributes.map(attr => (
            <div key={attr.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{attr.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>{attr.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.primary }}>{attr.value}/5</span>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(attr.value / 5) * 100}%`,
                    background: 'linear-gradient(90deg, #4A4AFF, #757FFF)',
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coach's written note */}
        {feedback.summary && (
          <div style={{ background: '#F5F6FC', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: COLORS.navy, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
              &ldquo;{feedback.summary}&rdquo;
            </p>
            <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 6, margin: '6px 0 0' }}>
              Coach Marcus · {feedback.date}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default function DevelopmentHub() {
  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#F5F6FC', paddingBottom: 24 }}>
      <div style={{ padding: '24px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1B1650', letterSpacing: '-0.4px', margin: 0 }}>Progress Report</h1>
        <Image src="/logos/mak-academy.jpeg" alt="MAK Academy" width={56} height={28} style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ padding: '0 20px' }}>
        <CoachNotesCard />

        <CoachFeedbackCard />

        <SectionLabel text="Coach's Analysis" />
        <CoachMessageCard />

        <SectionLabel text="How I Played" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categoryGrades.map((g) => <CategoryGrade key={g.category} item={g} />)}
        </div>

        <SectionLabel text="My Season" />
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 4px 12px', boxShadow: SHADOWS.card }}>
          <LineChartDynamic />
          <p style={{ fontSize: 12, color: '#9DA2B3', textAlign: 'center', marginTop: 6 }}>#8 in U12 · Top 35% this season</p>
        </div>

        <BenchmarkComparison />
      </div>
    </div>
  )
}
