import type { ProgressionFrame } from '@/lib/player-progression'
import { ScoreArc } from './ScoreArc'
import { MatchNoteEditor } from './MatchNoteEditor'

interface PlayheadDetailProps {
  frame: ProgressionFrame
  /** Player id — used to key the note storage. */
  playerId: string
}

/**
 * Match-detail band that renders when the coach scrubs the playhead OFF the
 * latest match. The latest is already rendered by <LatestHero/>, so this
 * component returns null when called with the latest frame.
 *
 * Three states:
 *   - Upcoming: small "no data yet" stub
 *   - DNP:     coral eyebrow + the coach's reason note
 *   - Played:  three-column score + label + coach note
 */
export function PlayheadDetail({ frame: f, playerId }: PlayheadDetailProps) {
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
          vs {f.opp}
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
          vs {f.opp}
        </div>
        <div style={{ maxWidth: 540, marginTop: 4 }}>
          <MatchNoteEditor playerId={playerId} sessionId={f.sessionId} variant="light" />
        </div>
      </section>
    )
  }

  // Played match
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
        padding: '28px 36px',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '140px minmax(0, 1fr) 320px',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <ScoreArc value={f.score} size={120} stroke={10} color={arcColor} />
        <div style={{ minWidth: 0 }}>
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
              fontSize: 34,
              color: 'var(--brand-indigo)',
              letterSpacing: '-0.02em',
              marginTop: 4,
              wordBreak: 'break-word',
            }}
          >
            vs {f.opp}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--brand-indigo-mute)',
              marginTop: 4,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span>{f.shortDate}</span>
            <span>·</span>
            <span>{resultLabel}</span>
            {f.g > 0 && (
              <>
                <span>·</span>
                <span>
                  <strong style={{ color: 'var(--brand-indigo)' }}>{f.g}</strong> goal
                  {f.g > 1 ? 's' : ''}
                </span>
              </>
            )}
            {f.a > 0 && (
              <>
                <span>·</span>
                <span>
                  <strong style={{ color: 'var(--brand-indigo)' }}>{f.a}</strong> key pass
                  {f.a > 1 ? 'es' : ''}
                </span>
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
    </section>
  )
}
