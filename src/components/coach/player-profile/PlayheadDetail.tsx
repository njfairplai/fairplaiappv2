import type { Player, MatchAnalysis } from '@/lib/types'
import type { ProgressionFrame } from '@/lib/player-progression'
import { matchAnalyses } from '@/lib/mockData'
import { getKeyStats } from '@/lib/squad-position-stats'
import { ScoreArc } from './ScoreArc'
import { MatchNoteEditor } from './MatchNoteEditor'

interface PlayheadDetailProps {
  frame: ProgressionFrame
  /** Player — used to surface the same per-match key stats line that
   *  LatestHero renders, so a scrubbed match doesn't lose them. */
  player: Player
  isMobile?: boolean
}

/**
 * Match-detail band that renders when the coach scrubs the playhead OFF the
 * latest match. The latest is already rendered by <LatestHero/>, so this
 * component returns null when called with the latest frame.
 *
 * Layout matches LatestHero (2-row desktop, single-column mobile stack):
 *   Row 1: score arc │ match label + meta │ coach note
 *   Row 2: ────── stat strip (full width) ──────
 *
 * Three states:
 *   - Upcoming: small "no data yet" stub
 *   - DNP:     coral eyebrow + the coach's reason note
 *   - Played:  full layout with stats
 */
export function PlayheadDetail({ frame: f, player, isMobile }: PlayheadDetailProps) {
  const playerId = player.id
  if (f.upcoming) {
    return (
      <section
        style={{
          background: 'var(--brand-paper)',
          padding: '28px 36px',
          borderBottom: '1px solid var(--brand-line)',
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
          UPCOMING · {f.shortDate.toUpperCase()}
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
            marginTop: 6,
          }}
        >
          {f.kind === 'training' ? 'Training match' : `vs ${f.opp}`}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--brand-indigo-mute)',
            marginTop: 4,
          }}
        >
          {f.shortDate} · No data yet.
        </div>
      </section>
    )
  }

  if (f.dnp) {
    return (
      <section
        style={{
          background: 'var(--brand-paper)',
          padding: '28px 36px',
          borderBottom: '1px solid var(--brand-line)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: 'var(--brand-coral)',
            fontWeight: 700,
          }}
        >
          DID NOT PLAY · {f.shortDate.toUpperCase()}
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
            marginTop: 6,
          }}
        >
          {f.kind === 'training' ? 'Training match' : `vs ${f.opp}`}
        </div>
        <div style={{ maxWidth: 540, marginTop: 4 }}>
          <MatchNoteEditor playerId={playerId} sessionId={f.sessionId} variant="light" />
        </div>
      </section>
    )
  }

  // Played match — pull the underlying analysis so we can surface the same
  // key-stats strip as LatestHero. Without this, scrubbing onto a non-latest
  // match shows the score and label but no per-match data — the page felt
  // half-rendered.
  const analysis = matchAnalyses.find(
    a => a.playerId === player.id && a.sessionId === f.sessionId,
  )
  const stats = analysis ? buildStats(player, analysis) : []

  const arcColor = f.motm
    ? 'var(--brand-yellow)'
    : f.poor
    ? 'var(--brand-coral)'
    : undefined
  const eyebrowColor = f.motm
    ? 'var(--brand-indigo)'
    : f.poor
    ? 'var(--brand-coral)'
    : 'var(--brand-indigo-mute)'
  const eyebrowText =
    (f.motm ? '★ MOTM · ' : f.poor ? 'POOR FORM · ' : '') +
    (f.kind === 'training' ? 'TRAINING · ' : '') +
    f.shortDate.toUpperCase()
  const resultLabel = f.result === 'W' ? 'Won' : f.result === 'L' ? 'Lost' : 'Drew'

  return (
    <section
      style={{
        background: 'var(--brand-paper)',
        padding: isMobile ? '24px 16px' : '28px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '140px minmax(0, 1fr) 320px',
          gap: isMobile ? 14 : 28,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
          <ScoreArc value={f.score} size={isMobile ? 96 : 120} stroke={isMobile ? 8 : 10} color={arcColor} />
        </div>
        <div style={{ minWidth: 0, textAlign: isMobile ? 'center' : 'left' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: eyebrowColor,
              fontWeight: 700,
            }}
          >
            {eyebrowText}
          </span>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 24 : 34,
              color: 'var(--brand-indigo)',
              letterSpacing: '-0.02em',
              marginTop: 4,
            }}
          >
            {f.kind === 'training' ? 'Training match' : `vs ${f.opp}`}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
              marginTop: 4,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            <span>{f.shortDate}</span>
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
        <div
          style={{
            background: 'var(--brand-sand)',
            border: '1px solid var(--brand-line)',
            borderRadius: 10,
            padding: '14px 16px',
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
            COACH NOTE
          </span>
          <MatchNoteEditor playerId={playerId} sessionId={f.sessionId} variant="light" />
        </div>
      </div>

      {/* Row 2: full-width stat strip — same shape as LatestHero. */}
      {stats.length > 0 && (
        <div
          style={{
            marginTop: isMobile ? 12 : 18,
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
                padding: isMobile ? '10px 8px' : '12px 10px',
                borderRight: i < stats.length - 1 ? '1px solid var(--brand-line)' : 'none',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isMobile ? 18 : 22,
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

/** Same shape as LatestHero.buildHeroStats — kept inline so they evolve
 *  together. 5 cells: position-aware key stats + universal movement stats. */
function buildStats(player: Player, a: MatchAnalysis): Array<{ k: string; v: string }> {
  const [keyA, keyB] = getKeyStats(player.position[0] ?? 'CM', a)
  return [
    { k: keyA.label, v: `${keyA.value}${keyA.suffix}` },
    { k: keyB.label, v: `${keyB.value}${keyB.suffix}` },
    { k: 'Distance', v: `${a.distanceCovered.toFixed(1)} km` },
    { k: 'Top speed', v: `${a.topSpeed.toFixed(1)}` },
    { k: 'Sprints', v: String(a.sprintCount) },
  ]
}
