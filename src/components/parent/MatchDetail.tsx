'use client'

import dynamic from 'next/dynamic'
import type { MatchRecord } from '@/lib/types'
import { scoreColor } from '@/lib/utils'
import { SHADOWS, COLORS } from '@/lib/constants'
import { highlightClips, radarData } from '@/lib/mockData'
import { ChevronLeft } from 'lucide-react'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 220 }} /> })

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>
      {text}
    </p>
  )
}

export default function MatchDetail({ match, onBack }: { match: MatchRecord; onBack: () => void }) {
  const color = scoreColor(match.score)

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

        <SectionLabel text="Match Performance" />
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
          <RadarChartDynamic data={radarData} />
        </div>

        <SectionLabel text="Physical Stats" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Distance', value: '7.4 km', avg: '6.8km', pct: '+9%', c: COLORS.success },
            { label: 'Top Speed', value: '27.3 km/h', avg: '25.1', pct: '+8%', c: COLORS.success },
            { label: 'Sprints', value: '14', avg: 'avg 11', pct: '+27%', c: COLORS.success },
          ].map(({ label, value, avg, pct, c: col }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: SHADOWS.card }}>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#1B1650', letterSpacing: '-0.3px', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 10, color: '#9DA2B3', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 10, color: '#9DA2B3', marginTop: 2 }}>{avg}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: col, marginTop: 2 }}>{pct}</p>
            </div>
          ))}
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
