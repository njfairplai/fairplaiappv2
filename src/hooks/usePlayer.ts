'use client'

import { useMemo } from 'react'
import { players, matchAnalyses, highlights as allHighlights } from '@/lib/mockData'
import type { Player, MatchAnalysis, Highlight } from '@/lib/types'

export function usePlayer(playerId: string) {
  const player = useMemo<Player | undefined>(
    () => players.find((p) => p.id === playerId),
    [playerId]
  )

  const analyses = useMemo<MatchAnalysis[]>(
    () => matchAnalyses.filter((a) => a.playerId === playerId),
    [playerId]
  )

  const playerHighlights = useMemo<Highlight[]>(
    () => allHighlights.filter((h) => h.playerId === playerId),
    [playerId]
  )

  const latestAnalysis = analyses[0] ?? null

  return { player, analyses, highlights: playerHighlights, latestAnalysis }
}
