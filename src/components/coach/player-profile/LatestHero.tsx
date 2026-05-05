import type { Player, MatchAnalysis } from '@/lib/types'
import type { ProgressionFrame } from '@/lib/player-progression'
import { matchAnalyses } from '@/lib/mockData'
import { getKeyStats } from '@/lib/squad-position-stats'
import { ScoreArc } from './ScoreArc'
import { MatchNoteEditor } from './MatchNoteEditor'

interface LatestHeroProps {
  player: Player
  latest: ProgressionFrame
  isMobile?: boolean
}

/**
 * Hero band for the latest match — ALWAYS the page's first content section.
 *
 * Desktop layout (2 rows):
 *   Row 1: score arc │ match label + meta │ coach note
 *   Row 2: ────── stat strip (full width) ──────
 *
 * Mobile layout (single column stack):
 *   score arc + state chip → match label + meta → stat strip → coach note
 *
 * Stats: position-aware (via `getKeyStats`) + universal movement extras
 * (Distance, Top speed, Sprints) — 5 cells. Stat strip is full-width on
 * desktop so each cell stays single-line; the previous middle-column-only
 * version forced "6.3 km" / "TOP SPEED" to wrap.
 */
export function LatestHero({ player, latest, isMobile }: LatestHeroProps) {
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
        padding: isMobile ? '24px 16px' : '32px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '180px minmax(0, 1fr) 320px',
          gap: isMobile ? 16 : 32,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        {/* Score + state chip */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'stretch' }}>
          <ScoreArc value={latest.score} size={isMobile ? 120 : 160} stroke={isMobile ? 10 : 12} color={arcColor} />
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

        {/* Match label + meta (no stat strip — that lives in row 2 now) */}
        <div style={{ minWidth: 0, textAlign: isMobile ? 'center' : 'left' }}>
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
              fontSize: isMobile ? 28 : 44,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: 'var(--brand-indigo)',
              marginTop: 4,
            }}
          >
            {latest.kind === 'training' ? 'Training match' : `vs ${latest.opp}`}
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
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            <span>{latest.shortDate}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
            <span>{resultLabel}</span>
            {analysis?.minutesPlayed !== undefined && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
                <span>{analysis.minutesPlayed} mins</span>
              </>
            )}
          </div>
        </div>

        {/* Coach note (row 1, right column on desktop; full-width below on mobile) */}
        <div
          style={{
            background: 'var(--brand-sand)',
            border: '1px solid var(--brand-line)',
            borderRadius: 10,
            padding: '16px 18px',
            order: isMobile ? 3 : undefined,
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

      {/* Row 2: full-width stat strip. With ~1100px of horizontal real estate
          on desktop, 5 cells get ~220px each — value + label both fit on
          single lines, no wrap. On mobile the strip stretches to full width
          of the section padding. */}
      {stats.length > 0 && (
        <div
          style={{
            marginTop: isMobile ? 12 : 22,
            display: 'grid',
            gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
            gap: 0,
            borderTop: '1px solid var(--brand-line)',
            borderBottom: '1px solid var(--brand-line)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.k}
              style={{
                padding: isMobile ? '10px 8px' : '14px 12px',
                borderRight:
                  i < stats.length - 1 ? '1px solid var(--brand-line)' : 'none',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isMobile ? 20 : 26,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  fontWeight: 700,
                  color: 'var(--brand-indigo-mute)',
                  marginTop: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.k.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/** Build the 5-cell hero stats line — position-aware key stats + universal
 *  movement stats (distance / top speed / sprints). The previous version
 *  appended Goals universally, which collided with the forward key-stat
 *  also being GOALS. Minutes are already in the meta line above. */
function buildHeroStats(
  player: Player,
  a: MatchAnalysis,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _frame: ProgressionFrame,
): Array<{ k: string; v: string }> {
  const [keyA, keyB] = getKeyStats(player.position[0] ?? 'CM', a)
  return [
    { k: keyA.label, v: `${keyA.value}${keyA.suffix}` },
    { k: keyB.label, v: `${keyB.value}${keyB.suffix}` },
    { k: 'Distance', v: `${a.distanceCovered.toFixed(1)} km` },
    { k: 'Top speed', v: `${a.topSpeed.toFixed(1)}` },
    { k: 'Sprints', v: String(a.sprintCount) },
  ]
}
