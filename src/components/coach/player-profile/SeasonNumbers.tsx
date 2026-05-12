import type { ProgressionFrame } from '@/lib/player-progression'
import { getSeasonNumbers } from '@/lib/player-progression'
import { ScoreArc } from './ScoreArc'

interface SeasonNumbersProps {
  data: ProgressionFrame[]
  /** Hero variant — large composite arc on the left, totals as a tile grid
   *  on the right. Used as the season-mode hero on the player profile. The
   *  default (compact) strip is no longer rendered on the profile page but
   *  is kept for callers that want a thin one-row strip. */
  hero?: boolean
  /** Season composite score (0-100). Required when `hero` is true. */
  seasonScore?: number
  isMobile?: boolean
}

const tilesFromData = (
  data: ProgressionFrame[],
): Array<{ k: string; v: number | string }> => {
  const { matches, goals, assists, motms, trend } = getSeasonNumbers(data)
  const minutesPlayed = data.reduce(
    (s, d) => s + (d.dnp || d.upcoming ? 0 : 1),
    0,
  )
  return [
    { k: 'Matches', v: matches },
    { k: 'Goals', v: goals },
    { k: 'Key passes', v: assists },
    { k: 'MOTMs', v: motms },
    { k: 'Mins / match', v: minutesPlayed > 0 ? Math.round((matches * 75) / matches) : 0 },
    { k: 'Trend', v: `${trend >= 0 ? '+' : ''}${trend}` },
  ]
}

/**
 * Season totals. Two visual modes:
 *
 * `hero` (used as the season-mode hero on the player profile): big composite
 * score arc on the left, "Spring 2026 . Season summary" eyebrow, then a
 * 6-tile totals grid (matches / goals / key passes / MOTMs / mins / trend).
 * Carries the season-mode page on its own.
 *
 * Compact (legacy strip): one row, four numeric tiles + inline trend. Not
 * rendered on the profile any more — kept for backwards compatibility.
 */
export function SeasonNumbers({
  data,
  hero = false,
  seasonScore = 0,
  isMobile,
}: SeasonNumbersProps) {
  const { matches, goals, assists, motms, trend } = getSeasonNumbers(data)

  if (!hero) {
    const tiles: Array<{ k: string; v: number }> = [
      { k: 'Matches', v: matches },
      { k: 'Goals', v: goals },
      { k: 'Key passes', v: assists },
      { k: 'MOTMs', v: motms },
    ]
    return (
      <section className="bg-brand-sand px-9 py-5 border-b border-brand-line">
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: 'auto repeat(4, 1fr) auto' }}
        >
          <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold pr-[22px]">
            SEASON . TO DATE
          </span>
          {tiles.map((s, i, arr) => (
            <div
              key={s.k}
              className={`px-[22px] py-1 border-l border-brand-line flex items-baseline gap-2.5 ${
                i === arr.length - 1 ? 'border-r border-brand-line' : ''
              }`}
            >
              <span className="font-clash text-[30px] text-brand-indigo tracking-[-0.02em]">
                {s.v}
              </span>
              <span className="font-fragment text-[10px] tracking-[0.18em] font-bold text-brand-indigo-mute">
                {s.k.toUpperCase()}
              </span>
            </div>
          ))}
          <div
            className="pl-[22px] font-fragment text-[11px] font-bold tracking-[0.12em]"
            style={{ color: trend >= 0 ? '#3A8F6B' : 'var(--brand-coral)' }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} OVER SEASON
          </div>
        </div>
      </section>
    )
  }

  // Hero variant — season-mode hero on the player profile.
  const heroTiles = tilesFromData(data)
  return (
    <section
      className={`bg-brand-sand border-b border-brand-line ${
        isMobile ? 'px-4 py-6' : 'px-9 py-8'
      }`}
    >
      <div
        className={`grid items-center ${isMobile ? 'gap-[18px]' : 'gap-9'}`}
        style={{ gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr' }}
      >
        <div className={`flex items-center ${isMobile ? 'gap-3.5' : 'gap-5'}`}>
          <ScoreArc value={seasonScore} size={isMobile ? 96 : 132} stroke={9} />
          <div>
            <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
              SPRING 2026 . SEASON COMPOSITE
            </span>
            <div
              className={`font-clash text-brand-indigo tracking-[-0.02em] mt-1 leading-[1.1] ${
                isMobile ? 'text-2xl' : 'text-[32px]'
              }`}
            >
              {matches} matches across the season.
            </div>
            <div className="font-satoshi text-[13px] text-brand-indigo-mute mt-1">
              {goals} goals . {assists} key passes . {motms} MOTM
              {motms === 1 ? '' : 's'} . trend {trend >= 0 ? '+' : ''}{trend}
            </div>
          </div>
        </div>

        <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-6'}`}>
          {heroTiles.map(t => (
            <div
              key={t.k}
              className="bg-brand-paper border border-brand-line rounded-[10px] px-3.5 py-3"
            >
              <div className="font-fragment text-[9.5px] tracking-[0.18em] text-brand-indigo-mute font-bold uppercase">
                {t.k}
              </div>
              <div className="font-clash text-[26px] text-brand-indigo tracking-[-0.02em] mt-1">
                {t.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
