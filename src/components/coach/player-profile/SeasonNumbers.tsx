import type { ProgressionFrame } from '@/lib/player-progression'
import { getSeasonNumbers } from '@/lib/player-progression'

interface SeasonNumbersProps {
  data: ProgressionFrame[]
}

/**
 * Compressed season-numbers strip — replaces the original v1 "trajectory"
 * section. One row, four numeric tiles, plus a single inline trend marker.
 * Reads as the season's headline numbers without duplicating the filmstrip.
 */
export function SeasonNumbers({ data }: SeasonNumbersProps) {
  const { matches, goals, assists, motms, trend } = getSeasonNumbers(data)
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
          SEASON · TO DATE
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
