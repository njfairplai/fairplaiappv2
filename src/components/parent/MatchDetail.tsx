'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { MatchRecord } from '@/lib/types'
import { scoreColor } from '@/lib/utils'
import { SHADOWS, COLORS } from '@/lib/constants'
import { highlightClips, radarData } from '@/lib/mockData'
import { ChevronLeft } from 'lucide-react'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 240 }} /> })

type PerformanceCategory = 'Physical' | 'Positional' | 'Passing' | 'Dribbling' | 'Control' | 'Defending'

interface CategoryStat {
  label: string
  value: string
  avg: string
  pct: string
  positive: boolean
}

const categoryStats: Record<PerformanceCategory, CategoryStat[]> = {
  Physical: [
    { label: 'Distance', value: '7.4 km', avg: '6.8 km', pct: '+9%', positive: true },
    { label: 'Top Speed', value: '27.3 km/h', avg: '25.1 km/h', pct: '+8%', positive: true },
    { label: 'Sprints', value: '14', avg: '11', pct: '+27%', positive: true },
  ],
  Positional: [
    { label: 'Heat Map', value: '68%', avg: '62%', pct: '+10%', positive: true },
    { label: 'Avg Position', value: 'Advanced', avg: 'Normal', pct: '+1', positive: true },
    { label: 'Zone Entries', value: '12', avg: '9', pct: '+33%', positive: true },
  ],
  Passing: [
    { label: 'Completion', value: '73%', avg: '69%', pct: '+6%', positive: true },
    { label: 'Key Passes', value: '4', avg: '3', pct: '+33%', positive: true },
    { label: 'Long Balls', value: '6', avg: '4', pct: '+50%', positive: true },
  ],
  Dribbling: [
    { label: 'Completed', value: '5', avg: '4', pct: '+25%', positive: true },
    { label: 'Success Rate', value: '71%', avg: '68%', pct: '+4%', positive: true },
    { label: 'Chances', value: '3', avg: '2', pct: '+50%', positive: true },
  ],
  Control: [
    { label: 'Touches', value: '48', avg: '42', pct: '+14%', positive: true },
    { label: 'Retention', value: '82%', avg: '78%', pct: '+5%', positive: true },
    { label: '1st Touch', value: 'Good', avg: 'Avg', pct: '+1', positive: true },
  ],
  Defending: [
    { label: 'Tackles', value: '4', avg: '3', pct: '+33%', positive: true },
    { label: 'Intercepts', value: '3', avg: '2', pct: '+50%', positive: true },
    { label: 'Duels Won', value: '67%', avg: '61%', pct: '+10%', positive: true },
  ],
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>
      {text}
    </p>
  )
}

export default function MatchDetail({ match, onBack }: { match: MatchRecord; onBack: () => void }) {
  const color = scoreColor(match.score)
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory>('Physical')
  const [tileOpacity, setTileOpacity] = useState(1)
  const [displayedCategory, setDisplayedCategory] = useState<PerformanceCategory>('Physical')

  useEffect(() => {
    if (selectedCategory !== displayedCategory) {
      setTileOpacity(0)
      const timer = setTimeout(() => {
        setDisplayedCategory(selectedCategory)
        setTileOpacity(1)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [selectedCategory, displayedCategory])

  const stats = categoryStats[displayedCategory]

  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#F5F6FC', paddingBottom: 24 }}>
      <div style={{ padding: '16px 20px 12px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={20} color={COLORS.primary} />
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary }}>Matches</span>
        </button>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1B1650 0%, #282689 100%)', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, boxShadow: SHADOWS.card }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(245,246,252,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>vs</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#F5F6FC', letterSpacing: '-0.5px' }}>{match.opponent}</p>
            <p style={{ fontSize: 13, color: 'rgba(245,246,252,0.45)', marginTop: 4 }}>{match.day} {match.month} 2026 · {match.competition}</p>
          </div>
          <div style={{ background: `${color}22`, border: `2px solid ${color}66`, borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>{match.score}</p>
            <p style={{ fontSize: 10, color: 'rgba(245,246,252,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Score</p>
          </div>
        </div>

        <SectionLabel text="How I Played" />
        <div style={{ background: '#fff', borderRadius: 14, padding: '12px 0 6px', boxShadow: SHADOWS.card }}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '0 16px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4A4AFF', opacity: 0.7 }} />
              <span style={{ fontSize: 11, color: '#6E7180', fontWeight: 600 }}>This Match</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#d1d5db' }} />
              <span style={{ fontSize: 11, color: '#6E7180', fontWeight: 600 }}>Season Avg</span>
            </div>
          </div>
          <RadarChartDynamic
            data={radarData}
            selectedCategory={selectedCategory}
            onCategoryClick={(cat: string) => setSelectedCategory(cat as PerformanceCategory)}
          />
        </div>

        <SectionLabel text={`${displayedCategory} Stats`} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, opacity: tileOpacity, transition: 'opacity 150ms ease' }}>
          {stats.map(({ label, value, avg, pct, positive }) => {
            const pctColor = positive ? COLORS.success : '#EF4444'
            return (
              <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: SHADOWS.card }}>
                <p style={{ fontSize: 17, fontWeight: 900, color: '#1B1650', letterSpacing: '-0.3px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, color: '#9DA2B3', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: 10, color: '#9DA2B3', marginTop: 2 }}>{avg}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: pctColor, marginTop: 2 }}>{pct}</p>
              </div>
            )
          })}
        </div>

        <SectionLabel text="Highlights" />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
          {highlightClips.map((clip) => (
            <div key={clip.id} style={{ flexShrink: 0, width: 160, height: 90, background: 'linear-gradient(135deg, #1B1650, #0D1020)', borderRadius: 12, position: 'relative', overflow: 'hidden', border: '1px solid rgba(74,74,255,0.15)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 4 L10.5 7 L5.5 10 Z" fill="white" /></svg>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color: '#fff', background: clip.color, borderRadius: 100, padding: '2px 7px' }}>{clip.eventType}</div>
              <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 10, color: 'rgba(245,246,252,0.5)', fontWeight: 600 }}>{clip.minute}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(74,74,255,0.06)', border: '1px solid rgba(74,74,255,0.15)', borderRadius: 12, padding: '14px 16px', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: '#1B1650', lineHeight: 1.55, margin: 0 }}>
            Kiyan&apos;s physical output was his strongest area this match, ranking in the top 15% for U12 midfielders.
          </p>
        </div>
      </div>
    </div>
  )
}
