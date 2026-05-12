'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { MatchRecord } from '@/lib/types'
import { scoreColor } from '@/lib/utils'
import { SHADOWS, COLORS } from '@/lib/constants'
import { highlightClips, radarData } from '@/lib/mockData'
import { ChevronLeft } from 'lucide-react'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div className="h-60" /> })

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
    <p
      className="text-[13px] font-bold uppercase tracking-[0.08em] mb-2.5 mt-5"
      style={{ color: COLORS.primary }}
    >
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
    <div className="tab-fade min-h-[calc(100dvh-80px)] bg-[#F5F6FC] pb-6">
      <div className="px-5 pt-4 pb-3 bg-white border-b border-black/5 flex items-center gap-1.5 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0">
          <ChevronLeft size={20} color={COLORS.primary} />
          <span className="text-[15px] font-bold" style={{ color: COLORS.primary }}>Matches</span>
        </button>
      </div>

      <div className="px-5 pt-4">
        {/* Header */}
        <div
          className="rounded-2xl p-5 flex justify-between items-start mb-4"
          style={{ background: 'linear-gradient(135deg, #1B1650 0%, #282689 100%)', boxShadow: SHADOWS.card }}
        >
          <div>
            <p className="text-xs text-[#F5F6FC]/40 font-semibold tracking-[0.06em] uppercase mb-1">vs</p>
            <p className="text-[22px] font-black text-[#F5F6FC] tracking-[-0.5px]">{match.opponent}</p>
            <p className="text-[13px] text-[#F5F6FC]/45 mt-1">{match.day} {match.month} 2026 · {match.competition}</p>
          </div>
          <div
            className="rounded-2xl px-4 py-3 text-center"
            style={{ background: `${color}22`, border: `2px solid ${color}66` }}
          >
            <p className="text-[34px] font-black leading-none" style={{ color }}>{match.score}</p>
            <p className="text-[10px] text-[#F5F6FC]/40 font-bold uppercase tracking-[0.08em] mt-0.5">Score</p>
          </div>
        </div>

        <SectionLabel text="How I Played" />
        <div
          className="bg-white rounded-2xl pt-3 pb-1.5"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div className="flex gap-4 justify-center px-4 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#4A4AFF] opacity-70" />
              <span className="text-[11px] text-[#6E7180] font-semibold">This Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#d1d5db]" />
              <span className="text-[11px] text-[#6E7180] font-semibold">Season Avg</span>
            </div>
          </div>
          <RadarChartDynamic
            data={radarData}
            selectedCategory={selectedCategory}
            onCategoryClick={(cat: string) => setSelectedCategory(cat as PerformanceCategory)}
          />
        </div>

        <SectionLabel text={`${displayedCategory} Stats`} />
        <div
          className="grid grid-cols-3 gap-2.5 transition-opacity duration-150"
          style={{ opacity: tileOpacity }}
        >
          {stats.map(({ label, value, avg, pct, positive }) => {
            const pctColor = positive ? COLORS.success : '#EF4444'
            return (
              <div
                key={label}
                className="bg-white rounded-2xl px-2.5 py-3.5 text-center"
                style={{ boxShadow: SHADOWS.card }}
              >
                <p className="text-[17px] font-black text-[#1B1650] tracking-[-0.3px] leading-none">{value}</p>
                <p className="text-[10px] text-[#9DA2B3] font-semibold mt-[3px] uppercase tracking-[0.05em]">{label}</p>
                <p className="text-[10px] text-[#9DA2B3] mt-0.5">{avg}</p>
                <p className="text-[11px] font-bold mt-0.5" style={{ color: pctColor }}>{pct}</p>
              </div>
            )
          })}
        </div>

        <SectionLabel text="Highlights" />
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {highlightClips.map((clip) => (
            <div
              key={clip.id}
              className="shrink-0 w-40 h-[90px] rounded-xl relative overflow-hidden border border-[#4A4AFF]/15"
              style={{ background: 'linear-gradient(135deg, #1B1650, #0D1020)' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 4 L10.5 7 L5.5 10 Z" fill="white" /></svg>
                </div>
              </div>
              <div
                className="absolute top-2 left-2 text-[10px] font-bold text-white rounded-full px-[7px] py-0.5"
                style={{ background: clip.color }}
              >
                {clip.eventType}
              </div>
              <div className="absolute bottom-2 left-2 text-[10px] text-[#F5F6FC]/50 font-semibold">{clip.minute}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#4A4AFF]/[0.06] border border-[#4A4AFF]/15 rounded-xl px-4 py-3.5 mt-5">
          <p className="text-[13px] text-[#1B1650] leading-relaxed m-0">
            Kiyan&apos;s physical output was his strongest area this match, ranking in the top 15% for U12 midfielders.
          </p>
        </div>
      </div>
    </div>
  )
}
