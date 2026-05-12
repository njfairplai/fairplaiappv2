'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { Player, Session, MatchAnalysis, Highlight } from '@/lib/types'
import { PolyRadar, type RadarCategory } from '@/components/coach/player-profile/PolyRadar'
import { parentScoreColor } from '@/lib/parent-score-color'
import { VideoModal } from '@/components/video/VideoModal'

/* TODO: design-refinement-target — Pack 3 will refine visual treatment.
 * Current is a vertical 2-card hero: clip on top, radar below. Both halves
 * use brand-aligned components but the composition + chrome is plain. */

interface HomeHeroProps {
  player: Player
  /** Most-recent analysed match — drives the clip context (top half). */
  match: Session | null
  matchAnalysis: MatchAnalysis | null
  bestClip: Highlight | null
  /** Every season analysis for the kid — drives the season radar (bottom
   *  half). When empty, radar is omitted. */
  seasonAnalyses: MatchAnalysis[]
  /** Role-aware copy. */
  role: 'parent' | 'player'
}

/* Locked event vocabulary across the app. Legacy aliases (tackle,
 * sprint_recovery, key) carried so older fixture rows don't break. */
const EVENT_LABELS: Record<Highlight['eventType'], string> = {
  goal:            'GOAL',
  shot:            'SHOT',
  key:             'KEY PASS',
  key_pass:        'KEY PASS',
  def:             'KEY DEFENCE',
  tackle:          'KEY DEFENCE',
  save:            'SAVE',
  sprint_recovery: 'SPRINT',
  injury:          'INJURY',
}

export function HomeHero({
  player,
  match,
  matchAnalysis,
  bestClip,
  seasonAnalyses,
  role,
}: HomeHeroProps) {
  // Tap-to-play opens a full-screen video modal when the clip carries a
  // playable URL. Static play-button card is preserved as the fallback
  // for highlights without `clipUrl` (most legacy fixtures).
  const [videoOpen, setVideoOpen] = useState(false)
  const canPlay = !!bestClip?.clipUrl
  // Separate state for the "Watch full match" CTA — parents can play the
  // raw camera feed even when there's no best-clip yet. Coach-only AI
  // overlay is intentionally not exposed here.
  const [fullMatchOpen, setFullMatchOpen] = useState(false)
  const fullMatchUrl = match?.matchVideoUrl ?? null
  // Season-averaged radar shape (different from Stats' per-match radar so
  // the two surfaces feel like distinct lenses, not duplicates).
  const seasonShape: Record<RadarCategory, number> | null = (() => {
    if (seasonAnalyses.length === 0) return null
    const pick = (f: (a: MatchAnalysis) => number) =>
      Math.round(seasonAnalyses.reduce((s, a) => s + f(a), 0) / seasonAnalyses.length)
    return {
      Physical: pick(a => a.physicalScore),
      Positional: pick(a => a.positionalScore),
      Passing: pick(a => a.passingScore),
      Dribbling: pick(a => a.dribblingScore),
      Control: pick(a => a.controlScore),
      Defending: pick(a => a.defendingScore),
    }
  })()

  const greeting =
    role === 'player'
      ? `How you played`
      : `How ${player.firstName} played`

  if (!match || !matchAnalysis) {
    return (
      <section className="bg-brand-sand px-4 pt-6 pb-4 text-center border-b border-brand-line">
        <div className="font-clash text-[22px] text-brand-indigo tracking-[-0.02em]">
          {role === 'player' ? "You haven't played yet." : `${player.firstName} hasn't played yet.`}
        </div>
        <div className="font-satoshi text-[13px] text-brand-indigo-mute mt-1.5">
          Once a match is analysed, the highlights and stats land here.
        </div>
      </section>
    )
  }

  return (
    <section className="bg-brand-sand px-4 py-5 flex flex-col gap-3.5">
      {/* Eyebrow */}
      <div className="flex flex-col gap-1">
        <span className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold">
          {greeting.toUpperCase()}
        </span>
        <div className="font-clash text-[26px] text-brand-indigo tracking-[-0.02em] leading-[1.1]">
          {match.type === 'training_match' ? 'Training match' : `vs ${match.opponent ?? 'Match'}`}
        </div>
        <div className="font-satoshi text-[12.5px] text-brand-indigo-mute flex gap-2 items-center flex-wrap">
          <span>{formatShortDate(match.date)}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-brand-indigo-mute" />
          <span>
            Composite{' '}
            <span className="font-bold" style={{ color: parentScoreColor(matchAnalysis.compositeScore) }}>
              {matchAnalysis.compositeScore}
            </span>
          </span>
          {matchAnalysis.minutesPlayed !== undefined && (
            <>
              <span className="w-[3px] h-[3px] rounded-full bg-brand-indigo-mute" />
              <span>{matchAnalysis.minutesPlayed} mins</span>
            </>
          )}
        </div>
      </div>

      {/* Clip card — top half. Whole card is clickable when clipUrl
       *  exists; falls back to non-interactive when there's no playable
       *  source so we don't fake an action. */}
      {bestClip && (
        <div
          role={canPlay ? 'button' : undefined}
          tabIndex={canPlay ? 0 : undefined}
          onClick={canPlay ? () => setVideoOpen(true) : undefined}
          onKeyDown={canPlay ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setVideoOpen(true)
            }
          } : undefined}
          className={`bg-brand-indigo text-brand-sand rounded-xl p-4 relative overflow-hidden flex items-center gap-3.5 aspect-video ${
            canPlay ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          {/* Video thumbnail layer — uses the clip URL itself with
           *  preload="metadata" so the browser fetches and renders just
           *  the first frame of the requested time-range. No extra image
           *  asset, no ffmpeg, but the card now reads as a real video
           *  preview instead of a flat indigo block. Falls back to the
           *  indigo background when no clipUrl is available. */}
          {canPlay && bestClip.clipUrl && (
            <>
              <video
                src={bestClip.clipUrl}
                muted
                playsInline
                preload="metadata"
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              {/* Dark scrim so the play button + caption stay legible
               *  on top of variable footage frames. */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(11, 8, 40, 0.78) 0%, rgba(11, 8, 40, 0.55) 60%, rgba(11, 8, 40, 0.35) 100%)',
                }}
              />
            </>
          )}
          <button
            type="button"
            aria-label="Play best moment"
            onClick={canPlay ? (e) => {
              e.stopPropagation()
              setVideoOpen(true)
            } : undefined}
            disabled={!canPlay}
            className={`relative w-16 h-16 rounded-full bg-brand-yellow text-brand-indigo border-0 inline-flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(252,215,24,0.32)] ${
              canPlay ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <Play size={26} fill="currentColor" />
          </button>
          <div className="flex-1 min-w-0 relative">
            <div className="font-fragment text-[9.5px] tracking-[0.18em] font-extrabold text-brand-yellow">
              {EVENT_LABELS[bestClip.eventType]} · {Math.floor(bestClip.timestampSeconds / 60)}m
            </div>
            <div className="font-clash text-xl text-brand-sand tracking-[-0.02em] mt-1 leading-[1.15]">
              {bestClip.eventType === 'goal'
                ? role === 'player'
                  ? 'You scored.'
                  : `${player.firstName} scored.`
                : 'The moment to watch.'}
            </div>
            <div className="font-satoshi text-[11.5px] text-brand-sand/70 mt-1">
              {bestClip.durationSeconds}s clip · tap to play
            </div>
          </div>
        </div>
      )}

      {/* "Watch full match" — parents have a clip up top (one moment),
       *  but they couldn't watch the whole match anywhere. This button
       *  fills that gap. Renders only when the match carries a video
       *  URL (currently the demo-anchor session). Plain text-button so
       *  it doesn't fight the clip card for attention. */}
      {fullMatchUrl && (
        <button
          type="button"
          onClick={() => setFullMatchOpen(true)}
          className="self-start inline-flex items-center gap-2 px-3.5 py-2.5 bg-transparent text-brand-indigo border border-brand-indigo rounded-full font-satoshi font-bold text-[12.5px] tracking-[0.01em] cursor-pointer"
        >
          <Play size={14} fill="currentColor" />
          Watch full match
        </button>
      )}

      {/* Radar — bottom half */}
      {seasonShape && (
        <div className="bg-brand-paper border border-brand-line rounded-xl p-4 flex flex-col items-center gap-2">
          <span className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold self-start">
            SEASON SHAPE · {seasonAnalyses.length} {seasonAnalyses.length === 1 ? 'MATCH' : 'MATCHES'}
          </span>
          <PolyRadar
            series={[
              {
                values: seasonShape,
                color: 'var(--brand-indigo)',
                fillOpacity: 0.22,
                strokeWidth: 2,
              },
            ]}
            size={260}
          />
        </div>
      )}

      {bestClip?.clipUrl && (
        <VideoModal
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          src={bestClip.clipUrl}
          caption={`${EVENT_LABELS[bestClip.eventType]} · ${Math.floor(bestClip.timestampSeconds / 60)}m`}
        />
      )}

      {fullMatchUrl && (
        <VideoModal
          open={fullMatchOpen}
          onClose={() => setFullMatchOpen(false)}
          src={fullMatchUrl}
          caption={match?.opponent ? `FULL MATCH · vs ${match.opponent.toUpperCase()}` : 'FULL MATCH'}
        />
      )}
    </section>
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
