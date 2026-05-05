'use client'

import { useState, useMemo } from 'react'
import { Layers } from 'lucide-react'
import type { Player, MatchAnalysis } from '@/lib/types'
import { highlights } from '@/lib/mockData'
import { PolyRadar, RADAR_CATEGORIES, type RadarCategory } from './PolyRadar'

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
  /** Current playhead session id from the filmstrip. When the coach toggles
   *  the overlay, this match's per-category scores draw on top of the season
   *  shape so they can compare. */
  currentSessionId?: string | null
  isMobile?: boolean
}

/**
 * Solo season radar with a prominent overlay toggle.
 *
 * Default state: ONE bold indigo radar = the player's season averages across
 * the 6 categories. No faint grey background series (that was invisible and
 * confusing).
 *
 * Compare mode: the coach taps a yellow "Compare with this match" button
 * (sized as a real CTA, not a settings toggle); the playhead match's radar
 * draws on top of the season shape in dotted yellow. A small legend appears
 * underneath. Tap again to remove.
 *
 * Click any axis to drill the 3 sub-stats below the radar.
 */
export function RadarSection({
  player,
  records,
  currentSessionId,
  isMobile,
}: RadarSectionProps) {
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

  const [overlayOn, setOverlayOn] = useState(false)
  const showOverlay = overlayOn && !!matchRecord

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

  const keyPassCount = useMemo(
    () => highlights.filter(h => h.playerId === player.id && h.eventType === 'key_pass').length,
    [player.id],
  )

  const subStats: Record<Category, [SubStat, SubStat, SubStat]> = {
    Physical: [
      { label: 'Distance / 90', value: `${avg.distance.toFixed(1)} km`, source: 'real' },
      { label: 'Top speed', value: `${avg.topSpeed.toFixed(1)} km/h`, source: 'real' },
      { label: 'Sprints / 90', value: `${avg.sprintCount}`, source: 'real' },
    ],
    Positional: [
      { label: 'Position discipline', value: `${avg.positional}`, source: 'ai-derived' },
      { label: 'Recoveries / 90', value: `${Math.round(avg.positional / 8)}`, source: 'ai-derived' },
      { label: 'Heat coverage', value: `${Math.round(avg.positional * 0.9)}%`, source: 'ai-derived' },
    ],
    Passing: [
      { label: 'Pass completion', value: `${avg.passCompletion}%`, source: 'real' },
      { label: 'Key passes', value: `${keyPassCount}`, source: 'real' },
      { label: 'Long balls / 90', value: `${Math.round(avg.passing / 18)}`, source: 'ai-derived' },
    ],
    Dribbling: [
      { label: 'Dribble success', value: `${avg.dribbleSuccess}%`, source: 'real' },
      { label: 'Take-ons / 90', value: `${Math.round(avg.dribbling / 12)}`, source: 'ai-derived' },
      { label: 'Press-resistance', value: `${Math.round(avg.dribbling * 0.95)}`, source: 'ai-derived' },
    ],
    Control: [
      { label: 'Touches / 90', value: `${Math.round(avg.control * 1.2)}`, source: 'ai-derived' },
      { label: 'Retention', value: `${Math.min(99, avg.control + 5)}%`, source: 'ai-derived' },
      { label: 'First touches won', value: `${Math.round(avg.control / 9)}`, source: 'ai-derived' },
    ],
    Defending: [
      { label: 'Tackles / 90', value: `${Math.round(avg.defending / 10)}`, source: 'ai-derived' },
      { label: 'Interceptions / 90', value: `${Math.round(avg.positional / 8)}`, source: 'ai-derived' },
      { label: 'Duels won', value: `${Math.min(99, avg.defending + 4)}%`, source: 'ai-derived' },
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
      style={{
        background: 'var(--brand-paper)',
        padding: isMobile ? '24px 16px' : '32px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '180px 1fr auto',
          gap: isMobile ? 12 : 32,
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
            borderTop: '2px solid var(--brand-indigo)',
            paddingTop: 8,
          }}
        >
          PROFILE
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 24 : 32,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
          }}
        >
          How {player.firstName} plays.
        </div>
        {matchRecord && (
          <button
            type="button"
            onClick={() => setOverlayOn(v => !v)}
            aria-pressed={showOverlay}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 999,
              background: showOverlay ? 'var(--brand-indigo)' : 'var(--brand-yellow)',
              color: showOverlay ? 'var(--brand-sand)' : 'var(--brand-indigo)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            <Layers size={14} />
            {showOverlay ? 'Hide match overlay' : 'Compare with this match'}
          </button>
        )}
      </div>

      <div
        style={{
          background: 'var(--brand-sand)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PolyRadar
          series={[
            {
              values: seasonValues,
              color: 'var(--brand-indigo)',
              fillOpacity: 0.22,
              strokeWidth: 2,
            },
            ...(showOverlay && matchValues
              ? [
                  {
                    values: matchValues,
                    color: 'var(--brand-yellow)',
                    fillOpacity: 0.18,
                    strokeWidth: 2.5,
                    strokeDasharray: '6 4',
                    dotStroke: 'var(--brand-indigo)',
                  },
                ]
              : []),
          ]}
          selected={selected}
          onSelect={setSelected}
          size={isMobile ? 280 : 340}
        />
      </div>

      {/* Legend appears only in compare mode. */}
      {showOverlay && matchValues && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 2,
                background: 'var(--brand-indigo)',
                display: 'inline-block',
              }}
            />
            SEASON
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 0,
                borderTop: '2px dashed var(--brand-yellow)',
                display: 'inline-block',
              }}
            />
            THIS MATCH
          </span>
        </div>
      )}

      {/* Sub-stat strip — fades when selected category changes. */}
      <div
        key={selected}
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 8 : 12,
          animation: 'fp-fade-in 220ms ease',
        }}
      >
        <style>
          {`@keyframes fp-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}
        </style>
        {activeStats.map(s => (
          <div
            key={s.label}
            style={{
              background: 'var(--brand-sand)',
              border: '1px solid var(--brand-line)',
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {s.label}
              </span>
              {s.source === 'ai-derived' && (
                <span
                  title="AI-derived from category score"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    color: 'var(--brand-indigo-mute)',
                    background: 'var(--brand-line-soft)',
                    padding: '2px 6px',
                    borderRadius: 999,
                    fontWeight: 600,
                    cursor: 'help',
                  }}
                >
                  AI
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                color: 'var(--brand-indigo)',
                letterSpacing: '-0.02em',
                marginTop: 6,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 600,
        }}
      >
        TAP A CATEGORY ON THE RADAR. AI PILLS ARE DERIVED FROM CATEGORY SCORES.
      </div>
    </section>
  )
}
