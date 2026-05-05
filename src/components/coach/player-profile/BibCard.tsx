'use client'

import type { Player, MatchAnalysis } from '@/lib/types'
import { RADAR_CATEGORIES, type RadarCategory } from './PolyRadar'

export type BibFormat = 'square' | 'story' | 'card'

const STAT_CODES: Record<RadarCategory, string> = {
  Physical: 'PHY',
  Positional: 'POS',
  Passing: 'PAS',
  Dribbling: 'DRI',
  Control: 'CTL',
  Defending: 'DEF',
}

export const BIB_FORMATS: Record<BibFormat, { w: number; h: number; label: string; sub: string }> = {
  square: { w: 1080, h: 1080, label: 'Square', sub: '1:1 . Instagram' },
  story: { w: 1080, h: 1920, label: 'Story', sub: '9:16 . IG / WhatsApp' },
  card: { w: 1080, h: 680, label: 'Card', sub: '16:10 . WhatsApp / Text' },
}

interface BibCardProps {
  player: Player
  /** Per-axis season averages 0-100 for the foot stat strip. */
  radar: Record<RadarCategory, number>
  /** Headline composite score (yellow numeral under the bib number). */
  seasonScore: number
  /** Total matches in season — drives the foot meta line. */
  matchesPlayed: number
  /** Total minutes played — drives the foot meta line. */
  minutesPlayed: number
  /** Trend signed integer (e.g. +4 / -2) — surfaces in the foot meta. */
  trend: number
  /** Display roster name. */
  rosterName?: string
  /** Format preset (square / story / card). */
  format: BibFormat
  /** Visual scale (0-1). 1 = native dimensions. */
  scale: number
}

/** Compute season radar averages from a list of MatchAnalysis records. */
export function computeBibRadar(records: MatchAnalysis[]): Record<RadarCategory, number> {
  const acc: Record<RadarCategory, number> = {
    Physical: 0, Positional: 0, Passing: 0, Dribbling: 0, Control: 0, Defending: 0,
  }
  if (records.length === 0) return acc
  for (const r of records) {
    acc.Physical += r.physicalScore
    acc.Positional += r.positionalScore
    acc.Passing += r.passingScore
    acc.Dribbling += r.dribblingScore
    acc.Control += r.controlScore
    acc.Defending += r.defendingScore
  }
  for (const c of RADAR_CATEGORIES) acc[c] = Math.round(acc[c] / records.length)
  return acc
}

/** Mini academy-crest motif. Uses brand colours; no real crest data. */
function AcademyCrest({ size, color, bg }: { size: number; color: string; bg: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${color}`,
      }}
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
        <path
          d="M3 21 L3 4 L8 9 L12 5 L16 9 L21 4 L21 21 L18 21 L18 11 L13 15 L11 15 L6 11 L6 21 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

/**
 * Bib silhouette — rectangular body with shoulder taper, U-shaped neck cutout,
 * straight bottom hem. Drawn in a 100×130 viewbox and scaled.
 */
function BibShape({
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  neckColor,
  children,
}: {
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  neckColor: string
  children: React.ReactNode
}) {
  const outer =
    'M 22 4 L 78 4 Q 78 12 80 18 L 90 22 Q 96 24 96 32 L 96 116 Q 96 124 88 124 L 12 124 Q 4 124 4 116 L 4 32 Q 4 24 10 22 L 20 18 Q 22 12 22 4 Z'
  const neck = 'M 38 4 L 62 4 Q 62 22 50 22 Q 38 22 38 4 Z'
  const combined = `${outer} ${neck}`
  return (
    <div style={{ width, height, position: 'relative' }}>
      {/* SVG provides the bib silhouette underneath. The HTML children render
          on top — they're positioned via percentages of bibW/bibH and stay
          inside the bib bounds, so no clip-path is needed. (Earlier versions
          used a userSpaceOnUse clipPath defined for a 100×130 viewbox; that
          masked anything past 100×130 px once the bib was rendered at modal
          scale, blanking the preview.) */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 130"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      >
        <path d={combined} fill={fill} fillRule="evenodd" />
        <path
          d={outer}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={neck}
          fill={neckColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  )
}

/**
 * Inner contents of the bib — name press-band on top, hero number, composite
 * + position meta row, divider, 6-stat foot strip, footer caption.
 */
function BibContents({
  bibW,
  bibH,
  player,
  radar,
  seasonScore,
  rosterName,
  matchesPlayed,
  minutesPlayed,
  trend,
}: {
  bibW: number
  bibH: number
  player: Player
  radar: Record<RadarCategory, number>
  seasonScore: number
  rosterName?: string
  matchesPlayed: number
  minutesPlayed: number
  trend: number
}) {
  const ink = 'var(--brand-sand)'
  const number = 'var(--brand-sand)'
  const accent = 'var(--brand-yellow)'
  const px = bibW * 0.1
  const positionAbbrev = player.position[1] || player.position[0] || 'PL'
  const trendStr = trend >= 0 ? `+${trend}` : `${trend}`
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: bibH * 0.14,
          left: px,
          right: px,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: bibW * 0.04,
            color: ink,
            opacity: 0.6,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {player.firstName}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: bibW * 0.105,
            color: ink,
            letterSpacing: '-0.03em',
            lineHeight: 0.92,
            marginTop: 4,
          }}
        >
          {player.lastName.toUpperCase()}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: bibH * 0.27,
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: bibW * 0.62,
            color: number,
            letterSpacing: '-0.06em',
            lineHeight: 0.88,
            fontWeight: 400,
          }}
        >
          {player.jerseyNumber}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: bibH * 0.66,
          left: px,
          right: px,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: bibW * 0.03,
            fontWeight: 800,
            color: ink,
            opacity: 0.7,
            letterSpacing: '0.14em',
          }}
        >
          {player.dominantFoot.toUpperCase()}-FOOT
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: bibW * 0.018 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: bibW * 0.075,
              color: accent,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {seasonScore}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: bibW * 0.024,
              fontWeight: 800,
              color: ink,
              opacity: 0.7,
              letterSpacing: '0.18em',
            }}
          >
            {positionAbbrev}
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: bibH * 0.74,
          left: px,
          right: px,
          height: 1,
          background: ink,
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: bibH * 0.76,
          left: px,
          right: px,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          rowGap: bibH * 0.018,
          columnGap: bibW * 0.05,
        }}
      >
        {RADAR_CATEGORIES.map(c => (
          <div
            key={c}
            style={{ display: 'flex', alignItems: 'baseline', gap: bibW * 0.015 }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: bibW * 0.045,
                color: ink,
                letterSpacing: '-0.02em',
                minWidth: bibW * 0.06,
                lineHeight: 1,
              }}
            >
              {radar[c]}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: bibW * 0.02,
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: ink,
                opacity: 0.7,
              }}
            >
              {STAT_CODES[c]}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: bibH * 0.04,
          left: px,
          right: px,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: bibW * 0.022,
            letterSpacing: '0.22em',
            color: accent,
            fontWeight: 800,
          }}
        >
          SPRING 2026 . {(rosterName ?? 'SQUAD').toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: bibW * 0.022,
            color: ink,
            opacity: 0.7,
            marginTop: 4,
          }}
        >
          {matchesPlayed} matches . {minutesPlayed} mins . trend {trendStr}
        </div>
      </div>
    </>
  )
}

/**
 * Bib-shaped player card. Three formats:
 *   square (1080×1080) — bib centered on a sand canvas with header strip
 *   story  (1080×1920) — same plus a Top-25% chip footer
 *   card   (1080×680)  — landscape: bib hangs left, identity panel right
 *
 * Everything is sized off the `scale` prop so the same component renders
 * the modal preview, the format-picker thumbnail, and the eventual export
 * frame.
 */
export function BibCard({
  player,
  radar,
  seasonScore,
  matchesPlayed,
  minutesPlayed,
  trend,
  rosterName,
  format,
  scale,
}: BibCardProps) {
  const native = BIB_FORMATS[format]
  const W = native.w * scale
  const H = native.h * scale
  const surface = 'var(--brand-paper)'
  const bibFill = 'var(--brand-indigo)'
  const bibStroke = 'var(--brand-indigo)'
  const frameInset = 12 * scale
  const bibAspect = 0.85

  if (format === 'card') {
    const padX = 36 * scale
    const padY = 28 * scale
    const bibH = H - padY * 2 - 16 * scale
    const bibW = bibH * bibAspect
    return (
      <div
        style={{
          width: W,
          height: H,
          background: surface,
          color: 'var(--brand-indigo)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: frameInset,
            border: `${1.5 * scale}px solid var(--brand-indigo)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 22 * scale,
            left: padX,
            right: padX,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13 * scale,
                letterSpacing: '0.32em',
                fontWeight: 800,
                color: 'var(--brand-indigo)',
              }}
            >
              FAIRPL.AI
            </div>
            <div
              style={{
                width: 1,
                height: 14 * scale,
                background: 'var(--brand-indigo)',
                opacity: 0.4,
              }}
            />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11 * scale,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo)',
                opacity: 0.6,
                fontWeight: 600,
              }}
            >
              PLAYER CARD . SEASON
            </div>
          </div>
          <AcademyCrest size={26 * scale} color="var(--brand-indigo)" bg={surface} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: padY + 32 * scale,
            left: padX,
            bottom: padY,
            display: 'flex',
            gap: 28 * scale,
            alignItems: 'flex-start',
          }}
        >
          <BibShape
            width={bibW}
            height={bibH}
            fill={bibFill}
            stroke={bibStroke}
            strokeWidth={2}
            neckColor={surface}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
              <BibContents
                bibW={bibW}
                bibH={bibH}
                player={player}
                radar={radar}
                seasonScore={seasonScore}
                rosterName={rosterName}
                matchesPlayed={matchesPlayed}
                minutesPlayed={minutesPlayed}
                trend={trend}
              />
            </div>
          </BibShape>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: bibH,
              paddingTop: 16 * scale,
              paddingRight: padX,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11 * scale,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                {player.position.join(' . ').toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 16 * scale,
                  color: 'var(--brand-indigo)',
                  opacity: 0.75,
                  marginTop: 8 * scale,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {player.firstName}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 64 * scale,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.9,
                  marginTop: 4 * scale,
                }}
              >
                {player.lastName.toUpperCase()}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8 * scale,
                  marginTop: 14 * scale,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 76 * scale,
                    color: 'var(--brand-yellow)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    WebkitTextStroke: `${1.5 * scale}px var(--brand-indigo)`,
                  }}
                >
                  {seasonScore}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13 * scale,
                    fontWeight: 800,
                    color: 'var(--brand-indigo-mute)',
                    letterSpacing: '0.22em',
                  }}
                >
                  SEASON COMPOSITE
                </div>
              </div>
            </div>

            <div
              style={{
                paddingTop: 16 * scale,
                borderTop: `1px solid var(--brand-line)`,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11 * scale,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                SEASON STORY
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12 * scale,
                  color: 'var(--brand-indigo)',
                  opacity: 0.85,
                  marginTop: 14 * scale,
                  lineHeight: 1.55,
                  maxWidth: bibW * 1.1,
                }}
              >
                {matchesPlayed} matches . {minutesPlayed} mins . trend {trend >= 0 ? `+${trend}` : trend}.
                {rosterName ? ` ${rosterName}.` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Square / Story — bib centred on a vertical canvas.
  const isStory = format === 'story'
  const bibTargetH = H * 0.78
  const bibH = bibTargetH
  const bibW = bibH * bibAspect

  return (
    <div
      style={{
        width: W,
        height: H,
        background: surface,
        color: 'var(--brand-indigo)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: frameInset,
          border: `${1.5 * scale}px solid var(--brand-indigo)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 36 * scale,
          left: 36 * scale,
          right: 36 * scale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13 * scale,
              letterSpacing: '0.32em',
              fontWeight: 800,
              color: 'var(--brand-indigo)',
            }}
          >
            FAIRPL.AI
          </div>
          <div
            style={{
              width: 1,
              height: 14 * scale,
              background: 'var(--brand-indigo)',
              opacity: 0.4,
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11 * scale,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo)',
              opacity: 0.6,
              fontWeight: 600,
            }}
          >
            PLAYER CARD
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 * scale }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11 * scale,
              letterSpacing: '0.22em',
              fontWeight: 700,
              color: 'var(--brand-indigo)',
            }}
          >
            SPRING 2026
          </div>
          <AcademyCrest size={26 * scale} color="var(--brand-indigo)" bg={surface} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: (W - bibW) / 2,
          top: isStory ? 200 * scale : 100 * scale,
          width: bibW,
          height: bibH,
        }}
      >
        <BibShape
          width={bibW}
          height={bibH}
          fill={bibFill}
          stroke={bibStroke}
          strokeWidth={2}
          neckColor={surface}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <BibContents
              bibW={bibW}
              bibH={bibH}
              player={player}
              radar={radar}
              seasonScore={seasonScore}
              rosterName={rosterName}
              matchesPlayed={matchesPlayed}
              minutesPlayed={minutesPlayed}
              trend={trend}
            />
          </div>
        </BibShape>
      </div>

      {isStory && (
        <div
          style={{
            position: 'absolute',
            bottom: 70 * scale,
            left: 36 * scale,
            right: 36 * scale,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13 * scale,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
              marginBottom: 12 * scale,
            }}
          >
            SEASON SUMMARY
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14 * scale,
              color: 'var(--brand-indigo)',
              opacity: 0.85,
              lineHeight: 1.5,
              maxWidth: 600 * scale,
              margin: '0 auto',
            }}
          >
            {matchesPlayed} matches . {minutesPlayed} mins . trend {trend >= 0 ? `+${trend}` : trend}
          </div>
        </div>
      )}
    </div>
  )
}

/** Tiny mini-bib button that replaces the "Make a card" text affordance.
 *  Size is responsive — mobile clients can pass `size="sm"` to render a
 *  smaller 48×60 variant so the identity strip doesn't crowd the player
 *  name on narrow viewports. */
export function CardThumbButton({
  player,
  seasonScore,
  onClick,
  size = 'md',
}: {
  player: Player
  seasonScore: number
  onClick: () => void
  size?: 'sm' | 'md'
}) {
  const W = size === 'sm' ? 48 : 64
  const H = size === 'sm' ? 60 : 80
  const numberSize = size === 'sm' ? 22 : 30
  const lastNameSize = size === 'sm' ? 5 : 6
  const compositeSize = size === 'sm' ? 11 : 14
  const padTop = size === 'sm' ? 16 : 22
  return (
    <button
      type="button"
      onClick={onClick}
      title="Open player card"
      aria-label="Open player card"
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        width: W,
        height: H,
        position: 'relative',
        transition: 'transform 200ms ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <BibShape
        width={W}
        height={H}
        fill="var(--brand-indigo)"
        stroke="var(--brand-indigo)"
        strokeWidth={1}
        neckColor="var(--brand-paper)"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: padTop,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: lastNameSize,
              color: 'var(--brand-sand)',
              opacity: 0.7,
              letterSpacing: '0.14em',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {player.lastName.slice(0, 8).toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: numberSize,
              color: 'var(--brand-sand)',
              letterSpacing: '-0.06em',
              lineHeight: 1,
              marginTop: -2,
            }}
          >
            {player.jerseyNumber}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: compositeSize,
              color: 'var(--brand-yellow)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              marginTop: 'auto',
              marginBottom: 5,
              WebkitTextStroke: '0.5px var(--brand-indigo)',
            }}
          >
            {seasonScore}
          </div>
        </div>
      </BibShape>
    </button>
  )
}
