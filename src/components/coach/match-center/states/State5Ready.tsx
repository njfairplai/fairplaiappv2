'use client'

import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MATCH_CENTER_HIGHLIGHTS,
  type MatchCenterHighlight,
  type MatchCenterSession,
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
  /** The session being shown — drives header, scoreline, MOTM, footage label. */
  session: MatchCenterSession
  /** Set of currently flagged clip IDs — drives the ⚑ icon's filled state. */
  flaggedClips: Set<string>
  /** "Open full match analysis →" CTA target. */
  onOpenFullAnalysis?: () => void
  onClipPlay: (clip: MatchCenterHighlight) => void
  onClipShare: (clip: MatchCenterHighlight) => void
  onClipFlagToggle: (clip: MatchCenterHighlight) => void
  onPlayMatchReel: () => void
}

/* Tiny per-day "demo" data we embellish on top of the bare session.
 * Lets a training session render an internal-training framing while
 * a competitive match renders the scoreline + MOTM. Real wiring (full
 * MatchAnalysis records joined from the API) lands in a follow-up. */
const DEMO_OUR_SCORE: Record<number, number> = {
  3: 4,
  8: 1,
  17: 2,
  22: 3,
  24: 3,
}
const DEMO_OPP_SCORE: Record<number, number> = {
  3: 2,
  8: 0,
  17: 0,
  22: 1,
  24: 1,
}

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function dateLabel(s: MatchCenterSession): string {
  const dow = new Date(s.year, s.month - 1, s.day).toLocaleDateString('en-GB', {
    weekday: 'short',
  })
  return `${dow.toUpperCase()} ${s.day} ${MONTH_SHORT[s.month - 1]}`
}

/**
 * State 5 — analysis ready. Dynamic header, scoreline, footage label
 * driven by the passed `session`. Two-mode framing:
 *
 *   - Competitive match → "vs <Opp>" headline, scoreline, MOTM badge
 *   - Training match    → "Internal training" headline, no scoreline
 */
export function State5Ready({
  session,
  flaggedClips,
  onOpenFullAnalysis,
  onClipPlay,
  onClipShare,
  onClipFlagToggle,
  onPlayMatchReel,
}: State5ReadyProps) {
  const isMobile = useIsMobile()
  const clips = MATCH_CENTER_HIGHLIGHTS.filter(h => h.sessionDay === session.day)
  const isTraining = session.kind === 'training'
  const ourScore = DEMO_OUR_SCORE[session.day] ?? null
  const oppScore = DEMO_OPP_SCORE[session.day] ?? null
  const result = ourScore != null && oppScore != null
    ? ourScore > oppScore
      ? 'W'
      : ourScore < oppScore
      ? 'L'
      : 'D'
    : null
  const motm = session.motm ?? clips[0]?.player.split(' ')[0]
  const headline = isTraining ? 'Internal training' : `vs ${session.opponent ?? 'Opponent'}`
  const metaLine = isTraining
    ? `${dateLabel(session)} · TEAM A vs TEAM B`
    : `VS ${(session.opponent ?? 'OPPONENT').toUpperCase()} · ${dateLabel(session)}${
        result ? ` · ${ourScore}-${oppScore} ${result}` : ''
      }`

  return (
    <Card style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: isMobile ? '16px 16px' : '20px 26px',
          borderBottom: `1px solid ${BRAND.line}`,
          background: BRAND.yellowSoft,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {!isTraining && motm && (
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
              ★ MOTM {motm.toUpperCase()}
            </span>
          )}
          {isTraining && (
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
              TRAINING
            </span>
          )}
          <span
            style={{
              color: BRAND.indigo,
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            {metaLine}
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
          <MDisplay size={isMobile ? 32 : 56}>{headline}</MDisplay>
          {!isTraining && ourScore != null && oppScore != null && (
            <span
              style={{
                fontFamily: TYPE.display,
                fontSize: isMobile ? 32 : 56,
                color: BRAND.indigoMute,
                lineHeight: 0.94,
              }}
            >
              <span
                style={{
                  background: ourScore >= oppScore ? BRAND.yellow : 'transparent',
                  color: BRAND.indigo,
                  padding: '0 8px',
                }}
              >
                {ourScore}
              </span>
              <span style={{ margin: '0 6px' }}>—</span>
              <span style={{ color: BRAND.indigoMute }}>{oppScore}</span>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: isMobile ? '16px 16px' : '20px 26px' }}>
        <VideoBlock
          height={isMobile ? 200 : 300}
          label={`MATCH FOOTAGE${session.day === 24 ? ' · 84M' : ''}`}
          sub={`${dateLabel(session)} · 15:00 · PITCH 1`}
        />

        {/* Highlights row */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <MEyebrow>HIGHLIGHTS · {clips.length} CLIPS</MEyebrow>
            <button
              type="button"
              onClick={onPlayMatchReel}
              disabled={clips.length === 0}
              style={{
                ...mcButtons.primary,
                background: BRAND.yellow,
                color: BRAND.indigo,
                opacity: clips.length === 0 ? 0.4 : 1,
                cursor: clips.length === 0 ? 'default' : 'pointer',
                padding: '7px 14px',
              }}
            >
              ▶ Play match reel
            </button>
          </div>
          {clips.length === 0 ? (
            <div
              style={{
                fontFamily: TYPE.body,
                fontSize: 13,
                color: BRAND.indigoMute,
                padding: '14px 16px',
                border: `1px dashed ${BRAND.line}`,
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              No clips tagged for this session yet.
            </div>
          ) : (
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
          )}
        </div>

        {/* Two-column summary on desktop, stacked on mobile so the
         *  training summary table + top performers list each get the
         *  full width of the surface. */}
        <div
          style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 18 : 24,
          }}
        >
          <div>
            <MEyebrow>{isTraining ? 'TRAINING SUMMARY' : 'TEAM SUMMARY'}</MEyebrow>
            <div
              style={{
                marginTop: 12,
                border: `1px solid ${BRAND.line}`,
                borderRadius: 4,
                background: '#fff',
              }}
            >
              {summaryRows(session, ourScore, oppScore, motm).map(([k, v], i, arr) => (
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
            <MEyebrow>TOP PERFORMERS THIS SESSION</MEyebrow>
            <div
              style={{
                marginTop: 12,
                border: `1px solid ${BRAND.line}`,
                borderRadius: 4,
                background: '#fff',
              }}
            >
              {topPerformersFor(session).map((p, i, arr) => (
                <div
                  key={p.num}
                  style={{
                    display: 'grid',
                    /* Mobile drops the POS chip + dashed scout-slot
                     * columns to keep the row from overflowing on phone
                     * widths. The scout-slot reservation moves to a
                     * single-line footer note below. */
                    gridTemplateColumns: isMobile
                      ? '20px 28px 1fr 36px'
                      : '20px 28px 1fr 30px 38px 60px',
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
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.name}{' '}
                    {p.motm && (
                      <span style={{ color: BRAND.yellow, marginLeft: 2 }}>★</span>
                    )}
                  </span>
                  {!isMobile && (
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
                  )}
                  <span
                    style={{
                      fontFamily: TYPE.display,
                      fontSize: isMobile ? 18 : 22,
                      color: BRAND.indigo,
                      textAlign: 'right',
                    }}
                  >
                    {p.score}
                  </span>
                  {!isMobile && (
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
                  )}
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
              ↑ {isMobile ? 'SCOUT-WATCH CHIPS RESERVED' : 'DASHED SLOTS = RESERVED FOR SCOUT-WATCH CHIPS'} (V2)
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: isMobile ? 'stretch' : 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onOpenFullAnalysis}
            style={{
              ...mcButtons.primary,
              padding: '12px 20px',
              fontSize: 11.5,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Open full match analysis →
          </button>
        </div>
      </div>
    </Card>
  )
}

function summaryRows(
  session: MatchCenterSession,
  ourScore: number | null,
  oppScore: number | null,
  motm: string | undefined,
): [string, string][] {
  const rows: [string, string][] = [['Squad avg composite', String(session.score ?? 76)]]
  if (session.kind === 'training') {
    rows.push(['Setup', 'Team A vs Team B'])
    rows.push(['Bibs', 'Indigo / Coral'])
  } else {
    rows.push(['MOTM', motm ? `${motm} · ${session.score ?? 82}` : '—'])
    if (ourScore != null && oppScore != null) {
      rows.push(['Goals', `${ourScore} (we) · ${oppScore} (them)`])
    }
  }
  rows.push(['Possession', '62%'])
  rows.push(['Pass accuracy', '78%'])
  return rows
}

function topPerformersFor(
  session: MatchCenterSession,
): Array<{ rank: number; name: string; num: number; pos: string; score: number; motm: boolean }> {
  // Static demo set, lightly differentiated per-day so each session reads
  // distinctly. Real wiring joins MatchAnalysis records when the API ships.
  const motmName = session.motm ?? 'Saeed K.'
  if (session.day === 3) {
    return [
      { rank: 1, name: motmName,         num: 7,  pos: 'RW', score: 78, motm: true },
      { rank: 2, name: 'Yousef Al-Zaabi', num: 8,  pos: 'CM', score: 75, motm: false },
      { rank: 3, name: 'Salem Al-Dhaheri',num: 11, pos: 'LW', score: 73, motm: false },
    ]
  }
  if (session.day === 17) {
    return [
      { rank: 1, name: motmName,           num: 7,  pos: 'RW', score: 80, motm: true },
      { rank: 2, name: 'Hamad Al-Mansoori', num: 10, pos: 'CAM', score: 77, motm: false },
      { rank: 3, name: 'Ahmed Hassan',     num: 9,  pos: 'ST', score: 75, motm: false },
    ]
  }
  if (session.day === 8) {
    return [
      { rank: 1, name: motmName,         num: 6, pos: 'CM', score: 76, motm: true },
      { rank: 2, name: 'Saeed Khalifa',  num: 7, pos: 'RW', score: 73, motm: false },
      { rank: 3, name: 'Khalid Al-Naqbi',num: 4, pos: 'CB', score: 70, motm: false },
    ]
  }
  // Default — Feb 24 vs Al Wasl populated demo
  return [
    { rank: 1, name: 'Saeed Khalifa', num: 7, pos: 'RW', score: 82, motm: true },
    { rank: 2, name: 'Kiyan Makkawi', num: 6, pos: 'CM', score: 79, motm: false },
    { rank: 3, name: 'Ahmed Hassan',  num: 9, pos: 'ST', score: 76, motm: false },
  ]
}
