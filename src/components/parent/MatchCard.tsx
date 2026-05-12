'use client'

import type { MatchRecord } from '@/lib/types'
import { scoreColor } from '@/lib/utils'
import { SHADOWS } from '@/lib/constants'
import { ChevronRight } from 'lucide-react'

interface MatchCardProps {
  match: MatchRecord
  onClick: () => void
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const c = scoreColor(match.score)

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white border-0 rounded-xl px-4 py-3.5 mb-2 w-full text-left cursor-pointer"
      style={{ boxShadow: SHADOWS.card }}
    >
      <div className="w-11 h-[50px] rounded-[10px] bg-[#F5F6FC] flex flex-col items-center justify-center shrink-0">
        <span className="text-xl font-extrabold text-[#1B1650] leading-none">{match.day}</span>
        <span className="text-[11px] text-[#6E7180] uppercase tracking-[0.04em]">{match.month}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[15px] font-bold text-[#1B1650] m-0">{match.opponent}</p>
          <span
            className={`text-[11px] font-bold rounded-[20px] px-2 py-[3px] leading-none ${
              match.type === 'match'
                ? 'bg-[#EFF6FF] text-[#4A4AFF]'
                : 'bg-[#ECFDF5] text-[#059669]'
            }`}
          >
            {match.type === 'match' ? 'Match' : 'Training'}
          </span>
        </div>
        <p className="text-xs text-[#9DA2B3] mt-0.5">{match.competition}</p>
        <p className="text-xs text-[#9DA2B3]">{match.duration}</p>
      </div>
      <div className="text-right">
        <p className="text-[22px] font-black m-0 leading-none" style={{ color: c }}>{match.score}</p>
        <p className="text-[10px] text-[#9DA2B3] mt-0.5 uppercase tracking-[0.05em]">score</p>
      </div>
      <ChevronRight size={16} color="#9DA2B3" />
    </button>
  )
}
