'use client'

import { useMemo } from 'react'
import { players, rosters, squadScores } from '@/lib/mockData'
import type { Player, Roster } from '@/lib/types'

export interface SquadPlayer extends Player {
  compositeScore: number
  avgScore: number
}

export function useSquad(rosterId: string) {
  const roster = useMemo<Roster | undefined>(
    () => rosters.find((r) => r.id === rosterId),
    [rosterId]
  )

  const rosterPlayers = useMemo<SquadPlayer[]>(() => {
    const rosterObj = rosters.find((r) => r.id === rosterId)
    if (!rosterObj) return []
    return players
      .filter((p) => p.academyId === rosterObj.academyId)
      .slice(0, 8)
      .map((p) => ({
        ...p,
        compositeScore: squadScores[p.id]?.compositeScore ?? 70,
        avgScore: squadScores[p.id]?.avgScore ?? 70,
      }))
  }, [rosterId])

  return { roster, players: rosterPlayers }
}
