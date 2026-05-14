'use client'

import { useEffect, useMemo, useState } from 'react'
import { matchAnalyses, highlights } from '@/lib/mockData'
import {
  getKidsForParent,
  getDefaultKid,
  getMatchListForKid,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { MatchFilmstripCard } from '@/components/parent-portal/MatchFilmstripCard'
import { StatsRadarSection } from '@/components/parent-portal/StatsRadarSection'
import { parentScoreColor } from '@/lib/parent-score-color'

/**
 * Parent Stats — split-screen: horizontal filmstrip top, radar bottom.
 * Tap a card → radar updates in place. Both visible at once, no separate
 * page, no scroll-to-top jump.
 *
 * The per-match detail route (`/parent/match/[id]`) still exists as a
 * deep-link target (notifications, share links) but isn't reached from
 * Stats anymore.
 */
export default function ParentStatsPage() {
  const PARENT_ID = 'parent_001'

  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)
  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const matchList = useMemo(
    () => (activeKid ? getMatchListForKid(activeKid.id) : []),
    [activeKid],
  )
  // Newest first (filmstrip reads right-to-left in chronological terms).
  const sortedList = useMemo(() => [...matchList].reverse(), [matchList])

  // Selected match defaults to most-recent ANALYSED.
  const initialSelectedSessionId = useMemo(() => {
    if (!activeKid) return null
    const today = new Date().toISOString().slice(0, 10)
    for (const s of sortedList) {
      if (
        s.date <= today &&
        (s.status === 'analysed' || s.status === 'playback_ready')
      )
        return s.id
    }
    return null
  }, [sortedList, activeKid])

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    initialSelectedSessionId,
  )
  useEffect(() => {
    setSelectedSessionId(initialSelectedSessionId)
  }, [initialSelectedSessionId])

  const selectedMatch = sortedList.find(s => s.id === selectedSessionId) ?? null
  const selectedAnalysis = useMemo(() => {
    if (!activeKid || !selectedSessionId) return null
    return (
      matchAnalyses.find(
        a => a.playerId === activeKid.id && a.sessionId === selectedSessionId,
      ) ?? null
    )
  }, [activeKid, selectedSessionId])
  const selectedMatchLabel = useMemo(() => {
    if (!selectedMatch) return ''
    if (selectedMatch.type === 'training_match') return 'Training match'
    return selectedMatch.opponent ? `vs ${selectedMatch.opponent}` : 'Match'
  }, [selectedMatch])

  if (!activeKid) {
    return (
      <div className="p-6 text-center">
        <p className="font-satoshi text-brand-indigo-mute">
          No players linked to this account yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-brand-sand pb-20 text-brand-indigo">
      <PortalTopBar />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Top half: horizontal filmstrip of matches */}
      <section className="flex flex-col gap-2 px-4 pb-2 pt-3.5">
        <div className="flex items-baseline justify-between">
          <span className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
            SEASON · {sortedList.length} {sortedList.length === 1 ? 'MATCH' : 'MATCHES'}
          </span>
          <span className="font-fragment text-[9.5px] font-semibold tracking-[0.16em] text-brand-indigo-mute">
            TAP A MATCH
          </span>
        </div>
        {sortedList.length === 0 ? (
          <div className="px-2 py-8 text-center font-satoshi text-[13px] text-brand-indigo-mute">
            No matches recorded yet.
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory [scrollbar-width:thin]">
            {sortedList.map(s => {
              const analysis = matchAnalyses.find(
                a => a.playerId === activeKid.id && a.sessionId === s.id,
              ) ?? null
              const today = new Date().toISOString().slice(0, 10)
              const upcoming = s.date > today
              const motm = !!analysis && analysis.compositeScore >= 80
              return (
                <div key={s.id} className="snap-start">
                  <MatchFilmstripCard
                    session={s}
                    analysis={analysis}
                    selected={s.id === selectedSessionId}
                    upcoming={upcoming}
                    motm={motm}
                    onClick={() => {
                      if (upcoming) return
                      if (
                        s.status !== 'analysed' &&
                        s.status !== 'playback_ready'
                      )
                        return
                      setSelectedSessionId(s.id)
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Bottom half: radar for the selected match */}
      <section className="flex flex-1 flex-col gap-2 px-4 pb-5 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="font-fragment text-[10px] font-bold tracking-[0.22em] text-brand-indigo-mute">
            {selectedMatchLabel ? selectedMatchLabel.toUpperCase() : 'NO MATCH SELECTED'}
          </span>
          {selectedAnalysis && (
            <span className="font-fragment text-[9.5px] font-semibold tracking-[0.16em] text-brand-indigo-mute">
              COMPOSITE{' '}
              <span
                className="font-bold"
                style={{ color: parentScoreColor(selectedAnalysis.compositeScore) }}
              >
                {selectedAnalysis.compositeScore}
              </span>
            </span>
          )}
        </div>
        {selectedAnalysis ? (
          <StatsRadarSection
            playerId={activeKid.id}
            records={[selectedAnalysis]}
            scope="match"
            isMobile
          />
        ) : (
          <div className="rounded-xl border border-brand-line bg-brand-paper px-4 py-10 text-center font-satoshi text-[13px] text-brand-indigo-mute">
            Tap an analysed match above to see the radar.
          </div>
        )}
      </section>
    </div>
  )
}

// `highlights` import retained for downstream additions (per-match-clip
// preview line if we add it). Currently unused — silence the linter.
void highlights
