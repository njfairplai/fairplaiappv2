'use client'

import { BRAND, TYPE } from '@/lib/constants'
import type { MatchCenterSession } from '@/lib/match-center'
import {
  MStatusPill,
  MKindChip,
  MatchCenterScoreArc,
} from './atoms'

/* The filmstrip frame is built once and rendered in two shapes:
 *
 *   shape="cell"  — compact pill that lives inside a month-grid day cell
 *   shape="frame" — full 156×188 sprocketed card used in the week filmstrip
 *
 * Selected ("playhead") state drops the surface to indigo, so the card the
 * pane below is keyed off is never ambiguous. The trailing days in the
 * grid render no SessionFrame at all — see MonthGrid.
 */

interface SessionFrameProps {
  s: MatchCenterSession & { dateLabel?: string }
  shape?: 'cell' | 'frame'
  selected?: boolean
  onClick?: () => void
}

export function SessionFrame({ s, shape = 'frame', selected = false, onClick }: SessionFrameProps) {
  if (shape === 'cell') {
    return <CellFrame s={s} selected={selected} onClick={onClick} />
  }
  return <FullFrame s={s} selected={selected} onClick={onClick} />
}

/* Explicit per-status encoding for the month-grid cell. The previous
 * dot-only signal was too quiet — coaches couldn't scan the month and
 * tell at a glance which matches were analysed vs upcoming vs pending
 * categorisation. Each status now gets a literal word in mono caps
 * (line 1) and the opponent or footage meta below it (line 2).
 *
 * `drills` and `training` collapse to a single-line chip — there's no
 * opponent to render on a second line. */
function getCellEncoding(s: MatchCenterSession): {
  topLabel: string
  topColor: string
  topBg?: string
  bottomLabel?: string
  pulse?: boolean
} {
  switch (s.status) {
    case 'ready':
      return {
        topLabel: s.score != null ? `ANALYSED · ${s.score}` : 'ANALYSED',
        topColor: BRAND.indigo,
        bottomLabel: s.opponent ?? undefined,
      }
    case 'processing':
      return {
        topLabel: 'IN PROGRESS',
        topColor: BRAND.indigoMute,
        bottomLabel: s.opponent ?? undefined,
        pulse: true,
      }
    case 'prep':
      return {
        topLabel: 'PREP',
        topColor: BRAND.coral,
        bottomLabel: s.opponent ?? undefined,
      }
    case 'uncategorised':
      return {
        topLabel: 'PENDING',
        topColor: BRAND.coral,
        bottomLabel: s.opponent ?? undefined,
      }
    case 'drills':
      return {
        topLabel: 'DRILLS',
        topColor: BRAND.indigo,
        topBg: BRAND.sandDeep,
      }
    case 'upcoming':
      return {
        topLabel: 'UPCOMING',
        topColor: BRAND.indigoMute,
      }
    default:
      return { topLabel: '—', topColor: BRAND.indigoMute }
  }
}

function CellFrame({
  s,
  selected,
  onClick,
}: {
  s: MatchCenterSession
  selected: boolean
  onClick?: () => void
}) {
  // Training sessions render with the yellow TRAINING chip irrespective of
  // status — kind is the dominant signal there.
  if (s.kind === 'training') {
    return (
      <SingleLineCell
        topLabel="TRAINING"
        topColor={BRAND.indigo}
        topBg={BRAND.yellow}
        selected={selected}
        onClick={onClick}
      />
    )
  }

  const enc = getCellEncoding(s)

  // Drills + upcoming: collapse to a single-line chip — no opponent to show.
  if (!enc.bottomLabel) {
    return (
      <SingleLineCell
        topLabel={enc.topLabel}
        topColor={selected ? BRAND.sand : enc.topColor}
        topBg={selected ? undefined : enc.topBg}
        selected={selected}
        pulse={enc.pulse}
        onClick={onClick}
      />
    )
  }

  // Match cells with status: two-line — status word on top, opponent below.
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 4,
        padding: '4px 6px',
        background: selected ? BRAND.indigo : BRAND.paper,
        color: selected ? BRAND.sand : BRAND.indigo,
        border: `1px solid ${selected ? BRAND.indigo : BRAND.line}`,
        borderRadius: 3,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
        boxShadow: selected ? '0 6px 14px rgba(11,8,40,0.25)' : 'none',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 8,
          letterSpacing: '0.16em',
          fontWeight: 700,
          color: selected ? BRAND.yellow : enc.topColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          maxWidth: '100%',
        }}
      >
        {enc.pulse && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: selected ? BRAND.yellow : enc.topColor,
              animation: 'mcPulse 1.4s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
        )}
        {enc.topLabel}
      </span>
      <span
        style={{
          fontFamily: TYPE.body,
          fontSize: 10.5,
          fontWeight: 600,
          color: selected ? BRAND.sand : BRAND.indigo,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {enc.bottomLabel}
      </span>
    </button>
  )
}

/** Single-line chip variant for kind-driven cells (TRAINING / DRILLS / UPCOMING). */
function SingleLineCell({
  topLabel,
  topColor,
  topBg,
  pulse,
  selected,
  onClick,
}: {
  topLabel: string
  topColor: string
  topBg?: string
  pulse?: boolean
  selected: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 4,
        padding: '4px 6px',
        background: selected ? BRAND.indigo : topBg ?? BRAND.paper,
        color: selected ? BRAND.sand : BRAND.indigo,
        border: `1px solid ${selected ? BRAND.indigo : BRAND.line}`,
        borderRadius: 3,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        boxShadow: selected ? '0 6px 14px rgba(11,8,40,0.25)' : 'none',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {pulse && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: selected ? BRAND.yellow : topColor,
            animation: 'mcPulse 1.4s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 8.5,
          letterSpacing: '0.16em',
          fontWeight: 700,
          color: selected ? BRAND.sand : topColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {topLabel}
      </span>
    </button>
  )
}

function FullFrame({
  s,
  selected,
  onClick,
}: {
  s: MatchCenterSession & { dateLabel?: string }
  selected: boolean
  onClick?: () => void
}) {
  const isReady = s.status === 'ready'
  const isDrills = s.status === 'drills'
  const isPlayhead = selected

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 156,
        minWidth: 156,
        height: 188,
        padding: 0,
        position: 'relative',
        background: isPlayhead ? BRAND.indigo : isDrills ? BRAND.sandDeep : BRAND.paper,
        border: isPlayhead ? `2px solid ${BRAND.indigo}` : `1px solid ${BRAND.line}`,
        color: isPlayhead ? BRAND.sand : BRAND.indigo,
        borderRadius: 6,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: isPlayhead
          ? '0 12px 28px rgba(11,8,40,0.32)'
          : '0 2px 6px rgba(11,8,40,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Sprocket header — date + sprocket holes */}
      <div
        style={{
          background: isPlayhead ? '#0F0A36' : BRAND.sand,
          borderBottom: `1px solid ${
            isPlayhead ? 'rgba(238,228,200,0.16)' : BRAND.line
          }`,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 1,
                background: isPlayhead ? '#1B1550' : BRAND.line,
              }}
            />
          ))}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 8.5,
            letterSpacing: '0.16em',
            fontWeight: 700,
            color: isPlayhead ? BRAND.yellow : BRAND.indigoMute,
          }}
        >
          {s.dateLabel || `FEB ${String(s.day).padStart(2, '0')}`}
        </span>
      </div>

      {/* Body — status pill + score arc + MOTM tag */}
      <div style={{ flex: 1, position: 'relative', padding: 10 }}>
        <MStatusPill status={s.status} animated={s.status === 'processing'} />
        {isReady && s.score != null && (
          <div style={{ position: 'absolute', top: 32, left: 10 }}>
            <MatchCenterScoreArc
              value={s.score}
              size={50}
              stroke={4.5}
              color={isPlayhead ? BRAND.yellow : BRAND.indigo}
              ring={isPlayhead ? 'rgba(238,228,200,0.18)' : BRAND.lineSoft}
              textColor={isPlayhead ? BRAND.sand : BRAND.indigo}
            />
          </div>
        )}
        {isReady && s.motm && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, textAlign: 'right' }}>
            <div
              style={{
                fontFamily: TYPE.mono,
                fontSize: 8,
                letterSpacing: '0.16em',
                color: isPlayhead ? 'rgba(238,228,200,0.55)' : BRAND.indigoMute,
                fontWeight: 700,
              }}
            >
              ★ MOTM
            </div>
            <div
              style={{
                fontFamily: TYPE.body,
                fontSize: 10.5,
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {s.motm}
            </div>
            {/* Reserved Scout-watch slot — invisible bbox, v2 */}
            <div
              style={{
                height: 14,
                width: 50,
                marginLeft: 'auto',
                marginTop: 2,
                border: `1px dashed ${
                  isPlayhead ? 'rgba(238,228,200,0.18)' : 'rgba(27,21,80,0.12)'
                }`,
                borderRadius: 2,
              }}
            />
          </div>
        )}
      </div>

      {/* Footer — kind chip or opponent */}
      <div
        style={{
          background: isPlayhead ? '#0F0A36' : BRAND.sandDeep,
          borderTop: `1px solid ${
            isPlayhead ? 'rgba(238,228,200,0.16)' : BRAND.line
          }`,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 28,
        }}
      >
        {s.kind === 'training' && <MKindChip kind="training" />}
        {s.kind === 'drills' && <MKindChip kind="drills" />}
        {s.kind === 'match' && (
          <span
            style={{
              fontFamily: TYPE.body,
              fontSize: 11,
              fontWeight: 600,
              color: isPlayhead ? BRAND.sand : BRAND.indigo,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {s.opponent}
          </span>
        )}
      </div>
    </button>
  )
}
