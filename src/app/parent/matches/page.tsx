'use client'

import { useState } from 'react'
import { matchHistory, playerSeasonStats } from '@/lib/mockData'
import { COLORS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { MatchRecord } from '@/lib/types'
import MatchCard from '@/components/parent/MatchCard'
import MatchDetail from '@/components/parent/MatchDetail'

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="mb-2.5 mt-5 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-yellow">
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
    <div className="tab-fade min-h-[calc(100dvh-80px)] bg-[#F5F6FC] pb-[100px]">
      <div className="px-5 pb-1 pt-6">
        <h1 className="m-0 text-2xl font-extrabold tracking-[-0.4px] text-[#1B1650]">Matches &amp; Schedule</h1>
      </div>
      <div className="px-5">
        <SectionLabel text="Upcoming" />
        {[
          { icon: '🏃', title: 'Training Session', subtitle: 'Tuesday, Mar 3 · 17:00 – 19:00', venue: 'Pitch 2 · MAK Academy', barColor: COLORS.success },
          { icon: '⚽', title: 'Match vs Dubai SC', subtitle: 'Saturday, Mar 7 · 15:00 KO', venue: 'Al Wasl Sports Club', barColor: COLORS.primary },
          { icon: '🏃', title: 'Training Session', subtitle: 'Tuesday, Mar 10 · 17:00 – 19:00', venue: 'Pitch 2 · MAK Academy', barColor: COLORS.success },
        ].map((s, i) => (
          <div key={i} className="mb-2.5 flex overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="w-1 flex-shrink-0" style={{ background: s.barColor }} />
            <div className="flex flex-1 items-center gap-3 py-3.5 pl-4 pr-3.5">
              <span className="text-[22px]">{s.icon}</span>
              <div className="flex-1">
                <p className="m-0 text-[15px] font-bold text-[#1B1650]">{s.title}</p>
                <p className="mt-0.5 text-[13px] text-[#6E7180]">{s.subtitle}</p>
              </div>
              <p className="max-w-[100px] flex-shrink-0 text-right text-xs text-[#9DA2B3]">{s.venue}</p>
            </div>
          </div>
        ))}
        <SectionLabel text="My Season" />
        <div className="rounded-xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-3 gap-y-3">
            {(playerSeasonStats.find(s => s.playerId === 'player_001')?.stats ?? []).map(({ value, label }) => (
              <div key={label} className="py-1 text-center">
                <p className="m-0 text-xl font-extrabold tracking-[-0.5px] text-[#1B1650]">{value}</p>
                <p className="mt-0.5 text-[11px] text-[#6E7180]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle + History */}
        <div className="mb-3 mt-5 flex items-center justify-between">
          <p className="m-0 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-yellow">Match History</p>
          <div className="flex rounded-[10px] bg-[#F1F5F9] p-[3px]">
            {([['match', 'Matches'], ['training', 'Training']] as const).map(([key, label]) => {
              const active = historyTab === key
              return (
                <button
                  key={key}
                  onClick={() => setHistoryTab(key)}
                  className={cn(
                    'cursor-pointer rounded-lg border-none px-3.5 py-[5px] text-xs transition-all duration-150',
                    active ? 'bg-[#4A4AFF] font-bold text-white' : 'bg-transparent font-medium text-[#64748B]',
                  )}
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
