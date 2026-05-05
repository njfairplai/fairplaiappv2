import type { ProgressionFrame } from '@/lib/player-progression'
import { ScoreArc } from './ScoreArc'

interface FrameProps {
  frame: ProgressionFrame
  isPlayhead: boolean
  onClick?: () => void
  /** Frame width in px. Default 138; v2 mini-strip uses 104. */
  width?: number
  /** Frame height in px. Default 172; v2 mini-strip uses 138. */
  height?: number
}

/**
 * One frame in the season filmstrip. Visual encoding (no text labels):
 *   MOTM       — gold border (3px) + yellow score arc + star sprocket
 *   Poor form  — coral border (2px) + coral score arc
 *   DNP        — diagonal-stripe overlay + DNP stamp, no arc
 *   Training   — slightly darker sand body + yellow TRAINING chip in the
 *                FOOTER (replaces the opponent line). The chip is the only
 *                differentiator now — same palette as comp, just a flag.
 *   Upcoming   — translucent + UPCOMING label, no arc, no click
 *   Playhead   — indigo fill, sand text, yellow MD eyebrow
 *
 * Hierarchy when multiple flags collide:
 *   MOTM > Poor > Playhead > default
 */
export function Frame({ frame: f, isPlayhead, onClick, width = 138, height = 172 }: FrameProps) {
  const isMotm = f.motm
  const isPoor = f.poor
  const isDnp = f.dnp
  const isUpcoming = f.upcoming
  const isTraining = f.kind === 'training'

  let borderColor = 'var(--brand-line)'
  let borderWidth = 1
  if (isMotm) {
    borderColor = 'var(--brand-yellow)'
    borderWidth = 3
  } else if (isPoor) {
    borderColor = 'var(--brand-coral)'
    borderWidth = 2
  } else if (isPlayhead) {
    borderColor = 'var(--brand-indigo)'
    borderWidth = 2
  }

  let arcColor: string | undefined
  if (isMotm) arcColor = 'var(--brand-yellow)'
  else if (isPoor) arcColor = 'var(--brand-coral)'

  // Training frames sit on a slightly darker sand surface so they read as a
  // touch heavier than comp, but stay in the same colour family. The yellow
  // TRAINING chip in the footer carries the kind signal — that's enough.
  const surfaceColor = isTraining ? 'var(--brand-sand-deep)' : 'var(--brand-paper)'
  const bodyBgColor = isPlayhead
    ? `radial-gradient(ellipse at 50% 65%, var(--brand-indigo-mid) 0%, var(--brand-indigo) 80%)`
    : isDnp
    ? 'transparent'
    : isTraining
    ? 'var(--brand-sand-deep)'
    : 'var(--brand-sand)'

  const resultDot =
    f.result === 'W'
      ? '#3A8F6B'
      : f.result === 'L'
      ? 'var(--brand-coral)'
      : f.result === 'D'
      ? 'var(--brand-indigo-mute)'
      : 'transparent'

  const dnpPatternId = `dnp-${f.md}`

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isUpcoming}
      aria-label={
        isTraining
          ? `Training match on ${f.shortDate}, ${f.opp}`
          : `${f.shortDate}, ${f.opp}${f.score > 0 ? `, score ${f.score}` : ''}`
      }
      style={{
        width,
        minWidth: width,
        height,
        padding: 0,
        position: 'relative',
        background: isPlayhead
          ? 'var(--brand-indigo)'
          : isUpcoming
          ? 'transparent'
          : surfaceColor,
        border: `${borderWidth}px solid ${borderColor}`,
        color: isPlayhead ? 'var(--brand-sand)' : 'var(--brand-indigo)',
        borderRadius: 6,
        cursor: isUpcoming ? 'default' : 'pointer',
        textAlign: 'left',
        transition: 'all 200ms ease',
        boxShadow: isPlayhead
          ? '0 12px 28px rgba(11, 8, 40, 0.32)'
          : isMotm
          ? '0 4px 14px rgba(252, 215, 24, 0.25)'
          : '0 2px 6px rgba(11, 8, 40, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isUpcoming ? 0.45 : 1,
      }}
    >
      {/* Sprocket header — single line, just date + (MOTM star or W/L dot).
          The decorative 3-sprocket dots used to live here; dropped, they
          carried no information. */}
      <div
        style={{
          background: isPlayhead
            ? '#0F0A36'
            : isTraining
            ? 'var(--brand-sand-deeper)'
            : 'var(--brand-sand)',
          borderBottom: `1px solid ${
            isPlayhead ? 'rgba(238, 228, 200, 0.16)' : 'var(--brand-line)'
          }`,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {isMotm && (
          <span
            style={{
              color: 'var(--brand-yellow)',
              fontSize: 12,
              lineHeight: 1,
              marginTop: -1,
            }}
          >
            ★
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.16em',
            fontWeight: 700,
            color: isPlayhead ? 'var(--brand-yellow)' : 'var(--brand-indigo-mute)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {f.shortDate.toUpperCase()}
        </span>
        <span style={{ flex: 1 }} />
        {!isTraining && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: resultDot,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Body — score arc, DNP stripes, or upcoming label */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: bodyBgColor,
        }}
      >
        {isDnp && (
          <svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0 }}
            aria-hidden
          >
            <defs>
              <pattern
                id={dnpPatternId}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill="var(--brand-sand-deep)" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--brand-line)" strokeWidth={2} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${dnpPatternId})`} />
          </svg>
        )}

        {/* Score arc — small, top-left. Reverted from a brief experiment
            with a centered 76px arc; the larger arc swallowed the frame and
            forced the strip to only fit 4 cards. */}
        {!isDnp && !isUpcoming && f.score > 0 && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <ScoreArc
              value={f.score}
              size={50}
              stroke={4.5}
              color={arcColor}
              ring={isPlayhead ? 'rgba(238, 228, 200, 0.18)' : 'var(--brand-line-soft)'}
              textColor={isPlayhead ? 'var(--brand-sand)' : undefined}
            />
          </div>
        )}

        {isDnp && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -60%) rotate(-8deg)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--brand-coral)',
                letterSpacing: '0.04em',
                border: '2px solid var(--brand-coral)',
                padding: '2px 10px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              DNP
            </div>
          </div>
        )}

        {isUpcoming && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              UPCOMING
            </span>
          </div>
        )}

        {!isDnp && !isUpcoming && (f.g > 0 || f.a > 0) && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              display: 'flex',
              gap: 4,
            }}
          >
            {f.g > 0 && (
              <span
                style={{
                  background: isPlayhead ? 'var(--brand-yellow)' : 'var(--brand-indigo)',
                  color: isPlayhead ? 'var(--brand-indigo)' : 'var(--brand-sand)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: 3,
                  letterSpacing: '0.04em',
                }}
              >
                {f.g}G
              </span>
            )}
            {f.a > 0 && (
              <span
                style={{
                  background: 'transparent',
                  color: isPlayhead ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                  border: `1px solid ${
                    isPlayhead ? 'rgba(238, 228, 200, 0.4)' : 'var(--brand-line)'
                  }`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 3,
                  letterSpacing: '0.04em',
                }}
              >
                {f.a}KP
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer — opponent for comp matches. For training matches the yellow
          TRAINING chip replaces the opponent line entirely (per direction —
          "vs Internal squad" was redundant given the chip). */}
      <div
        style={{
          background: isPlayhead
            ? '#0F0A36'
            : 'var(--brand-sand-deep)',
          borderTop: `1px solid ${
            isPlayhead ? 'rgba(238, 228, 200, 0.16)' : 'var(--brand-line)'
          }`,
          padding: '8px 10px',
          minHeight: 28,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isTraining ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: 'var(--brand-indigo)',
              background: 'var(--brand-yellow)',
              padding: '3px 8px',
              borderRadius: 3,
              lineHeight: 1,
            }}
          >
            TRAINING
          </span>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 600,
              color: isPlayhead ? 'var(--brand-sand)' : 'var(--brand-indigo)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {f.opp}
          </div>
        )}
      </div>
    </button>
  )
}
