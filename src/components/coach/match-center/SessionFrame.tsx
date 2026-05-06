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

const STATUS_DOT_COLOR: Record<string, string> = {
  prep: BRAND.coral,
  processing: BRAND.indigoMute,
  ready: BRAND.indigo,
  drills: BRAND.sandDeeper,
  upcoming: BRAND.indigoMute,
  uncategorised: BRAND.coral,
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
  const dotColor = STATUS_DOT_COLOR[s.status] ?? BRAND.indigoMute
  const labelText =
    s.kind === 'drills'
      ? 'DRILLS'
      : s.kind === 'training'
      ? 'TRAINING'
      : s.opponent
      ? s.opponent.split(' ').slice(0, 2).join(' ')
      : '—'

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
        alignItems: 'center',
        gap: 5,
        boxShadow: selected ? '0 6px 14px rgba(11,8,40,0.25)' : 'none',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
          ...(s.status === 'processing'
            ? { animation: 'mcPulse 1.4s ease-in-out infinite' }
            : {}),
        }}
      />
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 8.5,
          letterSpacing: '0.04em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {labelText}
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
