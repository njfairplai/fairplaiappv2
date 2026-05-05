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
      <section
        style={{
          background: 'var(--brand-sand)',
          padding: '20px 36px',
          borderBottom: '1px solid var(--brand-line)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto repeat(4, 1fr) auto',
            gap: 0,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              paddingRight: 22,
            }}
          >
            SEASON . TO DATE
          </span>
          {tiles.map((s, i, arr) => (
            <div
              key={s.k}
              style={{
                padding: '4px 22px',
                borderLeft: '1px solid var(--brand-line)',
                borderRight:
                  i === arr.length - 1 ? '1px solid var(--brand-line)' : 'none',
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 30,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.v}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                  color: 'var(--brand-indigo-mute)',
                }}
              >
                {s.k.toUpperCase()}
              </span>
            </div>
          ))}
          <div
            style={{
              paddingLeft: 22,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: trend >= 0 ? '#3A8F6B' : 'var(--brand-coral)',
              letterSpacing: '0.12em',
            }}
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
      style={{
        background: 'var(--brand-sand)',
        padding: isMobile ? '24px 16px' : '32px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
          gap: isMobile ? 18 : 36,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20 }}>
          <ScoreArc value={seasonScore} size={isMobile ? 96 : 132} stroke={9} />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              SPRING 2026 . SEASON COMPOSITE
            </span>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? 24 : 32,
                color: 'var(--brand-indigo)',
                letterSpacing: '-0.02em',
                marginTop: 4,
                lineHeight: 1.1,
              }}
            >
              {matches} matches across the season.
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--brand-indigo-mute)',
                marginTop: 4,
              }}
            >
              {goals} goals . {assists} key passes . {motms} MOTM
              {motms === 1 ? '' : 's'} . trend {trend >= 0 ? '+' : ''}{trend}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(3, 1fr)'
              : 'repeat(6, 1fr)',
            gap: 8,
          }}
        >
          {heroTiles.map(t => (
            <div
              key={t.k}
              style={{
                background: 'var(--brand-paper)',
                border: '1px solid var(--brand-line)',
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {t.k}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.02em',
                  marginTop: 4,
                }}
              >
                {t.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
