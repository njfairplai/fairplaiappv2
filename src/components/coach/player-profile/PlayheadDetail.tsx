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
      <section className="bg-brand-paper px-9 py-7 border-b border-brand-line">
        <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
          UPCOMING · {f.shortDate.toUpperCase()}
        </span>
        <div className="font-clash text-[32px] text-brand-indigo tracking-[-0.02em] mt-1.5">
          {f.kind === 'training' ? 'Training match' : `vs ${f.opp}`}
        </div>
        <div className="font-satoshi text-[13px] text-brand-indigo-mute mt-1">
          {f.shortDate} · No data yet.
        </div>
      </section>
    )
  }

  if (f.dnp) {
    return (
      <section className="bg-brand-paper px-9 py-7 border-b border-brand-line">
        <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-coral font-bold">
          DID NOT PLAY · {f.shortDate.toUpperCase()}
        </span>
        <div className="font-clash text-[32px] text-brand-indigo tracking-[-0.02em] mt-1.5">
          {f.kind === 'training' ? 'Training match' : `vs ${f.opp}`}
        </div>
        <div className="max-w-[540px] mt-1">
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
    ? 'text-brand-indigo'
    : f.poor
    ? 'text-brand-coral'
    : 'text-brand-indigo-mute'
  const eyebrowText =
    (f.motm ? '★ MOTM · ' : f.poor ? 'POOR FORM · ' : '') +
    (f.kind === 'training' ? 'TRAINING · ' : '') +
    f.shortDate.toUpperCase()
  const resultLabel = f.result === 'W' ? 'Won' : f.result === 'L' ? 'Lost' : 'Drew'

  return (
    <section
      className={`bg-brand-paper border-b border-brand-line ${
        isMobile ? 'px-4 py-6' : 'px-9 py-7'
      }`}
    >
      <div
        className={
          isMobile
            ? 'flex flex-col gap-3.5 items-stretch'
            : 'grid items-center gap-7'
        }
        style={
          isMobile
            ? undefined
            : { gridTemplateColumns: '140px minmax(0, 1fr) 320px' }
        }
      >
        <div className={`flex ${isMobile ? 'justify-center' : 'justify-start'}`}>
          <ScoreArc value={f.score} size={isMobile ? 96 : 120} stroke={isMobile ? 8 : 10} color={arcColor} />
        </div>
        <div className={`min-w-0 ${isMobile ? 'text-center' : 'text-left'}`}>
          <span
            className={`font-fragment text-[10.5px] tracking-[0.22em] font-bold ${eyebrowColor}`}
          >
            {eyebrowText}
          </span>
          <div
            className={`font-clash text-brand-indigo tracking-[-0.02em] mt-1 ${
              isMobile ? 'text-2xl' : 'text-[34px]'
            }`}
          >
            {f.kind === 'training' ? 'Training match' : `vs ${f.opp}`}
          </div>
          <div
            className={`font-satoshi text-[13px] text-brand-indigo-mute mt-1 flex gap-2.5 items-center flex-wrap ${
              isMobile ? 'justify-center' : 'justify-start'
            }`}
          >
            <span>{f.shortDate}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-brand-indigo-mute" />
            <span>{resultLabel}</span>
            {analysis?.minutesPlayed !== undefined && (
              <>
                <span className="w-[3px] h-[3px] rounded-full bg-brand-indigo-mute" />
                <span>{analysis.minutesPlayed} mins</span>
              </>
            )}
          </div>
        </div>
        <div
          className="bg-brand-sand border border-brand-line rounded-[10px] px-4 py-3.5"
          style={{ order: isMobile ? 3 : undefined }}
        >
          <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
            COACH NOTE
          </span>
          <MatchNoteEditor playerId={playerId} sessionId={f.sessionId} variant="light" />
        </div>
      </div>

      {/* Row 2: full-width stat strip — same shape as LatestHero. */}
      {stats.length > 0 && (
        <div
          className={`grid gap-0 border-t border-b border-brand-line ${
            isMobile ? 'mt-3' : 'mt-[18px]'
          }`}
          style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        >
          {stats.map((s, i) => (
            <div
              key={s.k}
              className={`text-center ${isMobile ? 'px-2 py-2.5' : 'px-2.5 py-3'} ${
                i < stats.length - 1 ? 'border-r border-brand-line' : ''
              }`}
            >
              <div
                className={`font-clash text-brand-indigo tracking-[-0.02em] whitespace-nowrap overflow-hidden text-ellipsis ${
                  isMobile ? 'text-lg' : 'text-[22px]'
                }`}
              >
                {s.v}
              </div>
              <div className="font-fragment text-[9px] tracking-[0.16em] font-bold text-brand-indigo-mute mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
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
