'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { GitCompareArrows } from 'lucide-react'
import type { Player, MatchAnalysis } from '@/lib/types'
import { highlights, players } from '@/lib/mockData'
import { PolyRadar, RADAR_CATEGORIES, type RadarCategory } from './PolyRadar'
import { PlayerPickerPopover } from '@/components/coach/compare/PlayerPickerPopover'
import type { ProfileScope } from './ScopeToggle'

const CATEGORIES = RADAR_CATEGORIES
type Category = RadarCategory

interface SubStat {
  label: string
  value: string
  /** Real values come from canonical MatchAnalysis fields. AI-derived ones
   *  are computed from the category score (same pattern as the match page's
   *  getKeyStats: tackles approx defendingScore/10, etc.). */
  source: 'real' | 'ai-derived'
}

interface RadarSectionProps {
  player: Player
  /** Every season MatchAnalysis record for this player. */
  records: MatchAnalysis[]
  /** Current playhead session id from the filmstrip. In match scope this drives
   *  the solid match polygon; in season scope it's ignored. */
  currentSessionId?: string | null
  /** Page scope. Match (default): match polygon solid + season dotted overlay.
   *  Season: only the season polygon. */
  scope: ProfileScope
  isMobile?: boolean
}

/**
 * 6-axis radar that adapts to page scope.
 *
 * Match scope: the playhead match draws as a solid indigo polygon, the
 * player's season average draws as a dotted yellow overlay underneath. Both
 * are visible by default — the coach reads the match against the baseline at
 * a glance. A "Hide season average" link in the legend collapses the overlay
 * if it gets in the way.
 *
 * Season scope: only the season polygon. No overlay, no toggle, no legend.
 *
 * The header carries a "Compare with…" button that picks another player and
 * routes to the compare page (this is the lone "compare" entry-point on the
 * profile, since the identity strip dropped its old button).
 *
 * Click any axis to drill 3 sub-stats below the radar.
 */
export function RadarSection({
  player,
  records,
  currentSessionId,
  scope,
  isMobile,
}: RadarSectionProps) {
  const router = useRouter()
  const [pickerOpen, setPickerOpen] = useState(false)
  // Season averages — the default radar shape and the source for derived sub-stats.
  const avg = useMemo(() => {
    const pick = (f: (r: MatchAnalysis) => number): number => {
      if (records.length === 0) return 0
      return Math.round(records.reduce((s, r) => s + f(r), 0) / records.length)
    }
    return {
      composite: pick(r => r.compositeScore),
      physical: pick(r => r.physicalScore),
      positional: pick(r => r.positionalScore),
      passing: pick(r => r.passingScore),
      dribbling: pick(r => r.dribblingScore),
      control: pick(r => r.controlScore),
      defending: pick(r => r.defendingScore),
      distance: pick(r => Math.round(r.distanceCovered * 10)) / 10,
      topSpeed: pick(r => Math.round(r.topSpeed * 10)) / 10,
      sprintCount: pick(r => r.sprintCount),
      passCompletion: pick(r => r.passCompletion),
      dribbleSuccess: pick(r => r.dribbleSuccess),
    }
  }, [records])

  // Current playhead match record (if any) for the overlay.
  const matchRecord = useMemo(
    () => (currentSessionId ? records.find(r => r.sessionId === currentSessionId) : null),
    [records, currentSessionId],
  )

  // Season-overlay visibility — defaults ON in match scope so the coach sees
  // the dotted reference straight away. Toggled via the "Hide / Show season
  // average" link in the legend below.
  const [seasonOverlayVisible, setSeasonOverlayVisible] = useState(true)
  const inMatchScope = scope === 'match'
  const showSeasonOverlay = inMatchScope && !!matchRecord && seasonOverlayVisible

  // Default-selected category: strongest season axis.
  const strongest = useMemo<Category>(() => {
    let best: Category = 'Physical'
    let bestScore = -1
    const score = (c: Category): number =>
      c === 'Physical' ? avg.physical :
      c === 'Positional' ? avg.positional :
      c === 'Passing' ? avg.passing :
      c === 'Dribbling' ? avg.dribbling :
      c === 'Control' ? avg.control :
      avg.defending
    for (const c of CATEGORIES) {
      const s = score(c)
      if (s > bestScore) {
        bestScore = s
        best = c
      }
    }
    return best
  }, [avg])

  const [selected, setSelected] = useState<Category>(strongest)

  // Sub-stats follow the radar's primary series. In match scope they're
  // derived from THIS match (distance / top speed / sprints, plus AI splits
  // off the match's per-category scores). In season scope, season averages.
  const useMatchStats = inMatchScope && matchRecord
  const src = useMatchStats
    ? {
        physical: matchRecord.physicalScore,
        positional: matchRecord.positionalScore,
        passing: matchRecord.passingScore,
        dribbling: matchRecord.dribblingScore,
        control: matchRecord.controlScore,
        defending: matchRecord.defendingScore,
        distance: matchRecord.distanceCovered,
        topSpeed: matchRecord.topSpeed,
        sprintCount: matchRecord.sprintCount,
        passCompletion: matchRecord.passCompletion,
        dribbleSuccess: matchRecord.dribbleSuccess,
      }
    : avg

  const keyPassCount = useMemo(() => {
    if (useMatchStats) {
      return highlights.filter(
        h =>
          h.playerId === player.id &&
          h.sessionId === matchRecord.sessionId &&
          h.eventType === 'key_pass',
      ).length
    }
    return highlights.filter(h => h.playerId === player.id && h.eventType === 'key_pass').length
  }, [player.id, useMatchStats, matchRecord])

  // "/ 90" labels are misleading in match scope (a single match), so swap
  // them for the bare label.
  const perLabel = useMatchStats ? '' : ' / 90'

  const subStats: Record<Category, [SubStat, SubStat, SubStat]> = {
    Physical: [
      { label: `Distance${perLabel}`, value: `${src.distance.toFixed(1)} km`, source: 'real' },
      { label: 'Top speed', value: `${src.topSpeed.toFixed(1)} km/h`, source: 'real' },
      { label: `Sprints${perLabel}`, value: `${src.sprintCount}`, source: 'real' },
    ],
    Positional: [
      { label: 'Position discipline', value: `${src.positional}`, source: 'ai-derived' },
      { label: `Recoveries${perLabel}`, value: `${Math.round(src.positional / 8)}`, source: 'ai-derived' },
      { label: 'Heat coverage', value: `${Math.round(src.positional * 0.9)}%`, source: 'ai-derived' },
    ],
    Passing: [
      { label: 'Pass completion', value: `${src.passCompletion}%`, source: 'real' },
      { label: 'Key passes', value: `${keyPassCount}`, source: 'real' },
      { label: `Long balls${perLabel}`, value: `${Math.round(src.passing / 18)}`, source: 'ai-derived' },
    ],
    Dribbling: [
      { label: 'Dribble success', value: `${src.dribbleSuccess}%`, source: 'real' },
      { label: `Take-ons${perLabel}`, value: `${Math.round(src.dribbling / 12)}`, source: 'ai-derived' },
      { label: 'Press-resistance', value: `${Math.round(src.dribbling * 0.95)}`, source: 'ai-derived' },
    ],
    Control: [
      { label: `Touches${perLabel}`, value: `${Math.round(src.control * 1.2)}`, source: 'ai-derived' },
      { label: 'Retention', value: `${Math.min(99, src.control + 5)}%`, source: 'ai-derived' },
      { label: 'First touches won', value: `${Math.round(src.control / 9)}`, source: 'ai-derived' },
    ],
    Defending: [
      { label: `Tackles${perLabel}`, value: `${Math.round(src.defending / 10)}`, source: 'ai-derived' },
      { label: `Interceptions${perLabel}`, value: `${Math.round(src.positional / 8)}`, source: 'ai-derived' },
      { label: 'Duels won', value: `${Math.min(99, src.defending + 4)}%`, source: 'ai-derived' },
    ],
  }

  const activeStats = subStats[selected]

  // Six axis values — season + (optional) overlay match.
  const seasonValues: Record<Category, number> = {
    Physical: avg.physical,
    Positional: avg.positional,
    Passing: avg.passing,
    Dribbling: avg.dribbling,
    Control: avg.control,
    Defending: avg.defending,
  }
  const matchValues: Record<Category, number> | null = matchRecord
    ? {
        Physical: matchRecord.physicalScore,
        Positional: matchRecord.positionalScore,
        Passing: matchRecord.passingScore,
        Dribbling: matchRecord.dribblingScore,
        Control: matchRecord.controlScore,
        Defending: matchRecord.defendingScore,
      }
    : null

  return (
    <section
      className={`bg-brand-paper border-b border-brand-line ${
        isMobile ? 'px-4 py-6' : 'px-9 py-8'
      }`}
    >
      <div
        className={`grid items-baseline mb-4 ${isMobile ? 'gap-3' : 'gap-8'}`}
        style={{ gridTemplateColumns: isMobile ? '1fr' : '180px 1fr auto' }}
      >
        <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold border-t-2 border-brand-indigo pt-2">
          PROFILE
        </span>
        <div
          className={`font-clash text-brand-indigo tracking-[-0.02em] ${
            isMobile ? 'text-2xl' : 'text-[32px]'
          }`}
        >
          How {player.firstName} plays.
        </div>
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => setPickerOpen(o => !o)}
            aria-label="Compare with another player"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-yellow text-brand-indigo border-0 font-satoshi text-[13px] font-bold cursor-pointer tracking-[0.01em]"
          >
            <GitCompareArrows size={14} />
            Compare with…
          </button>
          <PlayerPickerPopover
            pool={players}
            excluded={[player.id]}
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={otherId =>
              router.push(`/coach/web/compare?players=${player.id},${otherId}`)
            }
            align="right"
          />
        </div>
      </div>

      <div className="bg-brand-sand rounded-xl p-5 flex justify-center">
        <PolyRadar
          series={
            inMatchScope && matchValues
              ? [
                  // Season dotted underneath as the reference shape.
                  ...(showSeasonOverlay
                    ? [
                        {
                          values: seasonValues,
                          color: 'var(--brand-yellow)',
                          fillOpacity: 0,
                          strokeWidth: 2,
                          strokeDasharray: '6 4',
                          dots: false,
                        },
                      ]
                    : []),
                  // This match — solid indigo, drawn on top.
                  {
                    values: matchValues,
                    color: 'var(--brand-indigo)',
                    fillOpacity: 0.22,
                    strokeWidth: 2.5,
                  },
                ]
              : [
                  // Season scope (or no match record) — solid season only.
                  {
                    values: seasonValues,
                    color: 'var(--brand-indigo)',
                    fillOpacity: 0.22,
                    strokeWidth: 2,
                  },
                ]
          }
          selected={selected}
          onSelect={setSelected}
          size={isMobile ? 280 : 340}
        />
      </div>

      {/* Legend (match scope only, when there's a match to overlay). The
          "Hide / Show season average" link doubles as the toggle so the
          page only carries one affordance for season-overlay control. */}
      {inMatchScope && matchValues && (
        <div className="mt-2.5 flex justify-center items-center gap-[18px] font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-[2.5px] bg-brand-indigo inline-block" />
            THIS MATCH
          </span>
          {showSeasonOverlay && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-3.5 h-0 inline-block"
                style={{ borderTop: '2px dashed var(--brand-yellow)' }}
              />
              SEASON AVG
            </span>
          )}
          <button
            type="button"
            onClick={() => setSeasonOverlayVisible(v => !v)}
            className="bg-transparent border-0 text-brand-indigo cursor-pointer underline p-0"
            style={{
              fontFamily: 'inherit',
              fontSize: 'inherit',
              letterSpacing: 'inherit',
              fontWeight: 'inherit',
            }}
          >
            {showSeasonOverlay ? 'HIDE SEASON AVERAGE' : 'SHOW SEASON AVERAGE'}
          </button>
        </div>
      )}

      {/* Sub-stat strip — fades when selected category changes. */}
      <div
        key={selected}
        className={`mt-[18px] grid ${isMobile ? 'gap-2' : 'gap-3'}`}
        style={{
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          animation: 'fp-fade-in 220ms ease',
        }}
      >
        <style>
          {`@keyframes fp-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}
        </style>
        {activeStats.map(s => (
          <div
            key={s.label}
            className="bg-brand-sand border border-brand-line rounded-[10px] px-4 py-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-fragment text-[9.5px] tracking-[0.18em] text-brand-indigo-mute font-bold uppercase">
                {s.label}
              </span>
              {s.source === 'ai-derived' && (
                <span
                  title="AI-derived from category score"
                  className="font-fragment text-[9px] tracking-[0.12em] text-brand-indigo-mute bg-brand-line-soft px-1.5 py-0.5 rounded-full font-semibold cursor-help"
                >
                  AI
                </span>
              )}
            </div>
            <div className="font-clash text-[28px] text-brand-indigo tracking-[-0.02em] mt-1.5">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 font-fragment text-[10px] tracking-[0.18em] text-brand-indigo-mute font-semibold">
        TAP A CATEGORY ON THE RADAR. AI PILLS ARE DERIVED FROM CATEGORY SCORES.
      </div>
    </section>
  )
}
