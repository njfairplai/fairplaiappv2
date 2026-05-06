'use client'

import { BRAND, TYPE } from '@/lib/constants'
import {
  MATCH_CENTER_HIGHLIGHTS,
  type MatchCenterHighlight,
} from '@/lib/match-center'
import {
  Card,
  MEyebrow,
  MDisplay,
  VideoBlock,
  MiniAvatar,
  mcButtons,
} from '../atoms'
import { HighlightCard } from '../HighlightCard'

interface State5ReadyProps {
  /** February day-of-month for the match being shown. Drives clip filtering. */
  sessionDay?: number
  /** Set of currently flagged clip IDs — drives the ⚑ icon's filled state. */
  flaggedClips: Set<string>
  /** "Open full match analysis →" CTA target. */
  onOpenFullAnalysis?: () => void
  /** Highlights row callbacks routed to the page so one modal serves them all. */
  onClipPlay: (clip: MatchCenterHighlight) => void
  onClipShare: (clip: MatchCenterHighlight) => void
  onClipFlagToggle: (clip: MatchCenterHighlight) => void
}

/**
 * State 5 — analysis ready (the populated landing state).
 *
 * For now Feb 24 (vs Al Wasl Academy · 3-1 W) is hardcoded as the
 * reference match — the header text, scoreline, and team-summary stats
 * stay fixed. The highlights row, however, filters MATCH_CENTER_HIGHLIGHTS
 * to the passed `sessionDay` so picking a different ready match in the
 * calendar will show that match's clips. When the API layer ships and the
 * header data becomes dynamic, the rest of this component will follow.
 */
export function State5Ready({
  sessionDay = 24,
  flaggedClips,
  onOpenFullAnalysis,
  onClipPlay,
  onClipShare,
  onClipFlagToggle,
}: State5ReadyProps) {
  const clips = MATCH_CENTER_HIGHLIGHTS.filter(h => h.sessionDay === sessionDay)

  return (
    <Card style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '20px 26px',
          borderBottom: `1px solid ${BRAND.line}`,
          background: BRAND.yellowSoft,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              background: BRAND.yellow,
              color: BRAND.indigo,
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              padding: '3px 7px',
              borderRadius: 3,
            }}
          >
            ★ MOTM SAEED KHALIFA
          </span>
          <span
            style={{
              color: BRAND.indigo,
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            VS AL WASL ACADEMY · SUN 24 FEB · 3-1 W
          </span>
        </div>
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <MDisplay size={56}>Al Wasl Academy</MDisplay>
          <span
            style={{
              fontFamily: TYPE.display,
              fontSize: 56,
              color: BRAND.indigoMute,
              lineHeight: 0.94,
            }}
          >
            <span
              style={{
                background: BRAND.yellow,
                color: BRAND.indigo,
                padding: '0 8px',
              }}
            >
              3
            </span>
            <span style={{ margin: '0 6px' }}>—</span>
            <span style={{ color: BRAND.indigoMute }}>1</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 26px' }}>
        <VideoBlock
          height={300}
          label="MATCH FOOTAGE · 84M"
          sub="SUN 24 FEB · 15:00 · PITCH 1"
        />

        {/* Highlights row */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <MEyebrow>HIGHLIGHTS · {clips.length} CLIPS</MEyebrow>
            <MEyebrow color={BRAND.indigoMute}>◀ SCROLL ▶</MEyebrow>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {clips.map(h => (
              <HighlightCard
                key={h.id}
                h={h}
                flagged={flaggedClips.has(h.id)}
                onPlay={() => onClipPlay(h)}
                onShare={() => onClipShare(h)}
                onFlagToggle={() => onClipFlagToggle(h)}
              />
            ))}
          </div>
        </div>

        {/* Two-column summary */}
        <div
          style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
          }}
        >
          <div>
            <MEyebrow>TEAM SUMMARY</MEyebrow>
            <div
              style={{
                marginTop: 12,
                border: `1px solid ${BRAND.line}`,
                borderRadius: 4,
                background: '#fff',
              }}
            >
              {(
                [
                  ['Squad avg composite', '76'],
                  ['MOTM', 'Saeed Khalifa · 82'],
                  ['Goals', '3 (2 by Saeed · 1 by Kiyan)'],
                  ['Assists', '2'],
                  ['Possession', '62%'],
                  ['Pass accuracy', '78%'],
                ] as [string, string][]
              ).map(([k, v], i, arr) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${BRAND.line}` : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 10.5,
                      color: BRAND.indigoMute,
                      letterSpacing: '0.18em',
                      fontWeight: 700,
                    }}
                  >
                    {k.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: TYPE.body,
                      fontSize: 13,
                      color: BRAND.indigo,
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <MEyebrow>TOP PERFORMERS THIS MATCH</MEyebrow>
            <div
              style={{
                marginTop: 12,
                border: `1px solid ${BRAND.line}`,
                borderRadius: 4,
                background: '#fff',
              }}
            >
              {[
                { rank: 1, name: 'Saeed Khalifa', num: 7, pos: 'RW', score: 82, motm: true },
                { rank: 2, name: 'Kiyan Makkawi', num: 6, pos: 'CM', score: 79, motm: false },
                { rank: 3, name: 'Ahmed Hassan',  num: 9, pos: 'ST', score: 76, motm: false },
              ].map((p, i, arr) => (
                <div
                  key={p.num}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '20px 28px 1fr 30px 38px 60px',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${BRAND.line}` : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 10,
                      color: BRAND.indigoMute,
                      fontWeight: 700,
                    }}
                  >
                    {p.rank}.
                  </span>
                  <MiniAvatar num={p.num} />
                  <span
                    style={{
                      fontFamily: TYPE.body,
                      fontSize: 13,
                      fontWeight: 600,
                      color: BRAND.indigo,
                    }}
                  >
                    {p.name}{' '}
                    {p.motm && (
                      <span style={{ color: BRAND.yellow, marginLeft: 2 }}>★</span>
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: TYPE.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: BRAND.indigoMute,
                      border: `1px solid ${BRAND.line}`,
                      padding: '1px 4px',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    {p.pos}
                  </span>
                  <span
                    style={{
                      fontFamily: TYPE.display,
                      fontSize: 22,
                      color: BRAND.indigo,
                    }}
                  >
                    {p.score}
                  </span>
                  <span
                    style={{
                      height: 18,
                      border: '1px dashed rgba(27,21,80,0.18)',
                      borderRadius: 2,
                      fontFamily: TYPE.mono,
                      fontSize: 8,
                      color: 'rgba(27,21,80,0.28)',
                      letterSpacing: '0.14em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    —
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: TYPE.mono,
                fontSize: 9,
                letterSpacing: '0.18em',
                color: 'rgba(27,21,80,0.4)',
                fontWeight: 700,
              }}
            >
              ↑ DASHED SLOTS = RESERVED FOR SCOUT-WATCH CHIPS (V2)
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onOpenFullAnalysis}
            style={{
              ...mcButtons.primary,
              padding: '12px 20px',
              fontSize: 11.5,
            }}
          >
            Open full match analysis →
          </button>
        </div>
      </div>
    </Card>
  )
}
