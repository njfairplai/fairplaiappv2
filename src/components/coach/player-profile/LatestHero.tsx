import type { Player, MatchAnalysis } from '@/lib/types'
import type { ProgressionFrame } from '@/lib/player-progression'
import { matchAnalyses } from '@/lib/mockData'
import { getKeyStats } from '@/lib/squad-position-stats'
import { ScoreArc } from './ScoreArc'
import { MatchNoteEditor } from './MatchNoteEditor'

interface LatestHeroProps {
  player: Player
  latest: ProgressionFrame
}

/**
 * Hero band for the latest match — ALWAYS the page's first content section.
 * Three-column desktop: big score arc + result chip on left, match label +
 * key stats inline in the middle, coach note for the match on the right.
 *
 * Stats are position-aware (via `getKeyStats`) plus universal extras
 * (Goals, Assists/Key passes, Distance, Top speed, Minutes) — 6 cells.
 */
export function LatestHero({ player, latest }: LatestHeroProps) {
  const analysis = matchAnalyses.find(
    a => a.playerId === player.id && a.sessionId === latest.sessionId,
  )
  const stats = analysis ? buildHeroStats(player, analysis, latest) : []

  const arcColor = latest.motm
    ? 'var(--brand-yellow)'
    : latest.poor
    ? 'var(--brand-coral)'
    : undefined

  const resultLabel = latest.result === 'W' ? 'Won' : latest.result === 'L' ? 'Lost' : 'Drew'

  return (
    <section
      style={{
        background: 'var(--brand-paper)',
        padding: '32px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '180px minmax(0, 1fr) 320px',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* Score + state chip */}
        <div>
          <ScoreArc value={latest.score} size={160} stroke={12} color={arcColor} />
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {latest.motm ? (
              <span
                style={{
                  background: 'var(--brand-yellow)',
                  color: 'var(--brand-indigo)',
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                }}
              >
                ★ MAN OF THE MATCH
              </span>
            ) : latest.poor ? (
              <span
                style={{
                  background: 'transparent',
                  color: 'var(--brand-coral)',
                  border: '1px solid var(--brand-coral)',
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                }}
              >
                BELOW FORM
              </span>
            ) : null}
          </div>
        </div>

        {/* Match label + inline stats */}
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            LATEST MATCH
          </span>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 44,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: 'var(--brand-indigo)',
              marginTop: 4,
              wordBreak: 'break-word',
            }}
          >
            vs {latest.opp}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--brand-indigo-mute)',
              marginTop: 4,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span>{latest.shortDate}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
            <span>{resultLabel}</span>
            {analysis?.minutesPlayed !== undefined && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
                <span>{analysis.minutesPlayed}'</span>
              </>
            )}
          </div>

          {/* Stats grid */}
          {stats.length > 0 && (
            <div
              style={{
                marginTop: 22,
                display: 'grid',
                gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                gap: 0,
                borderTop: '1px solid var(--brand-line)',
                borderBottom: '1px solid var(--brand-line)',
              }}
            >
              {stats.map((s, i) => (
                <div
                  key={s.k}
                  style={{
                    padding: '14px 12px',
                    borderRight:
                      i < stats.length - 1 ? '1px solid var(--brand-line)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 26,
                      color: 'var(--brand-indigo)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      fontWeight: 700,
                      color: 'var(--brand-indigo-mute)',
                      marginTop: 4,
                    }}
                  >
                    {s.k.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coach note */}
        <div
          style={{
            background: 'var(--brand-sand)',
            border: '1px solid var(--brand-line)',
            borderRadius: 10,
            padding: '16px 18px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            COACH NOTE · {latest.shortDate.toUpperCase()}
          </span>
          <MatchNoteEditor playerId={player.id} sessionId={latest.sessionId} variant="light" />
        </div>
      </div>
    </section>
  )
}

/** Build the 6-cell hero stats line — position-aware key stats + universal extras. */
function buildHeroStats(
  player: Player,
  a: MatchAnalysis,
  frame: ProgressionFrame,
): Array<{ k: string; v: string }> {
  const [keyA, keyB] = getKeyStats(player.position[0] ?? 'CM', a)
  return [
    { k: keyA.label, v: `${keyA.value}${keyA.suffix}` },
    { k: keyB.label, v: `${keyB.value}${keyB.suffix}` },
    { k: 'Goals', v: String(frame.g) },
    { k: 'Distance', v: `${a.distanceCovered.toFixed(1)} km` },
    { k: 'Top speed', v: `${a.topSpeed.toFixed(1)}` },
    { k: 'Sprints', v: String(a.sprintCount) },
  ]
}
