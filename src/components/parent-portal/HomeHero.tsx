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
      <section
        style={{
          background: 'var(--brand-sand)',
          padding: '24px 16px 16px',
          textAlign: 'center',
          borderBottom: '1px solid var(--brand-line)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
          }}
        >
          {role === 'player' ? "You haven't played yet." : `${player.firstName} hasn't played yet.`}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--brand-indigo-mute)',
            marginTop: 6,
          }}
        >
          Once a match is analysed, the highlights and stats land here.
        </div>
      </section>
    )
  }

  return (
    <section
      style={{
        background: 'var(--brand-sand)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Eyebrow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {greeting.toUpperCase()}
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {match.type === 'training_match' ? 'Training match' : `vs ${match.opponent ?? 'Match'}`}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12.5,
            color: 'var(--brand-indigo-mute)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span>{formatShortDate(match.date)}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
          <span>
            Composite{' '}
            <span style={{ color: parentScoreColor(matchAnalysis.compositeScore), fontWeight: 700 }}>
              {matchAnalysis.compositeScore}
            </span>
          </span>
          {matchAnalysis.minutesPlayed !== undefined && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-indigo-mute)' }} />
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
          style={{
            background: 'var(--brand-indigo)',
            color: 'var(--brand-sand)',
            borderRadius: 12,
            padding: 16,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            aspectRatio: '16 / 9',
            cursor: canPlay ? 'pointer' : 'default',
          }}
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
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
              {/* Dark scrim so the play button + caption stay legible
               *  on top of variable footage frames. */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(11, 8, 40, 0.78) 0%, rgba(11, 8, 40, 0.55) 60%, rgba(11, 8, 40, 0.35) 100%)',
                  pointerEvents: 'none',
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
            style={{
              position: 'relative',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--brand-yellow)',
              color: 'var(--brand-indigo)',
              border: 'none',
              cursor: canPlay ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(252, 215, 24, 0.32)',
            }}
          >
            <Play size={26} fill="currentColor" />
          </button>
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.18em',
                fontWeight: 800,
                color: 'var(--brand-yellow)',
              }}
            >
              {EVENT_LABELS[bestClip.eventType]} · {Math.floor(bestClip.timestampSeconds / 60)}m
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                color: 'var(--brand-sand)',
                letterSpacing: '-0.02em',
                marginTop: 4,
                lineHeight: 1.15,
              }}
            >
              {bestClip.eventType === 'goal'
                ? role === 'player'
                  ? 'You scored.'
                  : `${player.firstName} scored.`
                : 'The moment to watch.'}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11.5,
                color: 'rgba(238, 228, 200, 0.7)',
                marginTop: 4,
              }}
            >
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
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: 'transparent',
            color: 'var(--brand-indigo)',
            border: '1px solid var(--brand-indigo)',
            borderRadius: 999,
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12.5,
            letterSpacing: '0.01em',
            cursor: 'pointer',
          }}
        >
          <Play size={14} fill="currentColor" />
          Watch full match
        </button>
      )}

      {/* Radar — bottom half */}
      {seasonShape && (
        <div
          style={{
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              alignSelf: 'flex-start',
            }}
          >
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
