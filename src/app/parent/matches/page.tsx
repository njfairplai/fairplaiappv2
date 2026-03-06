'use client'

import { useState } from 'react'
import { matchHistory, playerSeasonStats } from '@/lib/mockData'
import { SHADOWS, COLORS } from '@/lib/constants'
import type { MatchRecord } from '@/lib/types'
import MatchCard from '@/components/parent/MatchCard'
import MatchDetail from '@/components/parent/MatchDetail'

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>
      {text}
    </p>
  )
}

type HistoryTab = 'match' | 'training'

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null)
  const [historyTab, setHistoryTab] = useState<HistoryTab>('match')

  if (selectedMatch) return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />

  const filtered = matchHistory.filter((m) => m.type === historyTab)

  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#F5F6FC', paddingBottom: 100 }}>
      <div style={{ padding: '24px 20px 4px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1B1650', letterSpacing: '-0.4px', margin: 0 }}>Matches &amp; Schedule</h1>
      </div>
      <div style={{ padding: '0 20px' }}>
        <SectionLabel text="Upcoming" />
        {[
          { icon: '🏃', title: 'Training Session', subtitle: 'Tuesday, Mar 3 · 17:00 – 19:00', venue: 'Pitch 2 · MAK Academy', barColor: COLORS.success },
          { icon: '⚽', title: 'Match vs Dubai SC', subtitle: 'Saturday, Mar 7 · 15:00 KO', venue: 'Al Wasl Sports Club', barColor: COLORS.primary },
          { icon: '🏃', title: 'Training Session', subtitle: 'Tuesday, Mar 10 · 17:00 – 19:00', venue: 'Pitch 2 · MAK Academy', barColor: COLORS.success },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, marginBottom: 10, display: 'flex', overflow: 'hidden', boxShadow: SHADOWS.card }}>
            <div style={{ width: 4, background: s.barColor, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '14px 14px 14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1B1650', margin: 0 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: '#6E7180', marginTop: 2 }}>{s.subtitle}</p>
              </div>
              <p style={{ fontSize: 12, color: '#9DA2B3', textAlign: 'right', flexShrink: 0, maxWidth: 100 }}>{s.venue}</p>
            </div>
          </div>
        ))}
        <SectionLabel text="My Season" />
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: SHADOWS.card }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 0' }}>
            {(playerSeasonStats.find(s => s.playerId === 'player_001')?.stats ?? []).map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center', padding: '4px 0' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#1B1650', letterSpacing: '-0.5px', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: '#6E7180', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle + History */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Match History</p>
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 3 }}>
            {([['match', 'Matches'], ['training', 'Training']] as const).map(([key, label]) => {
              const active = historyTab === key
              return (
                <button
                  key={key}
                  onClick={() => setHistoryTab(key)}
                  style={{
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: active ? '#fff' : '#64748B',
                    background: active ? '#4A4AFF' : 'transparent',
                    border: 'none', borderRadius: 8, padding: '5px 14px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        {filtered.map((m) => <MatchCard key={m.id} match={m} onClick={() => setSelectedMatch(m)} />)}
      </div>
    </div>
  )
}
