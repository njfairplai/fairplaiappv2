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
      className={
        isMobile
          ? 'bg-brand-paper px-4 py-6 border-b border-brand-line'
          : 'bg-brand-paper px-9 py-8 border-b border-brand-line'
      }
    >
      <div
        className={
          isMobile
            ? 'flex flex-col gap-4 items-stretch'
            : 'grid items-center gap-8'
        }
        style={
          isMobile
            ? undefined
            : { gridTemplateColumns: '180px minmax(0, 1fr) 320px' }
        }
      >
        {/* Score + state chip */}
        <div className={`flex flex-col ${isMobile ? 'items-center' : 'items-stretch'}`}>
          <ScoreArc value={latest.score} size={isMobile ? 120 : 160} stroke={isMobile ? 10 : 12} color={arcColor} />
          <div className="flex gap-1.5 mt-3.5 items-center justify-center">
            {latest.motm ? (
              <span className="bg-brand-yellow text-brand-indigo px-2.5 py-1 rounded-full font-fragment text-[9.5px] font-bold tracking-[0.18em]">
                ★ MAN OF THE MATCH
              </span>
            ) : latest.poor ? (
              <span className="bg-transparent text-brand-coral border border-brand-coral px-2.5 py-1 rounded-full font-fragment text-[9.5px] font-bold tracking-[0.18em]">
                BELOW FORM
              </span>
            ) : null}
          </div>
        </div>

        {/* Match label + meta (no stat strip — that lives in row 2 now) */}
        <div className={`min-w-0 ${isMobile ? 'text-center' : 'text-left'}`}>
          <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
            LATEST MATCH
          </span>
          <div
            className={`font-clash leading-[1.02] tracking-[-0.02em] text-brand-indigo mt-1 ${
              isMobile ? 'text-[28px]' : 'text-[44px]'
            }`}
          >
            {latest.kind === 'training' ? 'Training match' : `vs ${latest.opp}`}
          </div>
          <div
            className={`font-satoshi text-sm text-brand-indigo-mute mt-1 flex gap-2.5 items-center flex-wrap ${
              isMobile ? 'justify-center' : 'justify-start'
            }`}
          >
            <span>{latest.shortDate}</span>
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

        {/* Coach note (row 1, right column on desktop; full-width below on mobile) */}
        <div
          className="bg-brand-sand border border-brand-line rounded-[10px] px-[18px] py-4"
          style={{ order: isMobile ? 3 : undefined }}
        >
          <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
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
          className={`grid gap-0 border-t border-b border-brand-line ${
            isMobile ? 'mt-3' : 'mt-[22px]'
          }`}
          style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        >
          {stats.map((s, i) => (
            <div
              key={s.k}
              className={`text-center ${isMobile ? 'px-2 py-2.5' : 'px-3 py-3.5'} ${
                i < stats.length - 1 ? 'border-r border-brand-line' : ''
              }`}
            >
              <div
                className={`font-clash text-brand-indigo tracking-[-0.02em] whitespace-nowrap overflow-hidden text-ellipsis ${
                  isMobile ? 'text-xl' : 'text-[26px]'
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
