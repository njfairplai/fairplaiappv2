'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/constants'
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
/** Default visible clip count before the "+N more" expand fires.
 *  Past this we'd be asking the coach to scroll right through a long
 *  horizontal row, which loses scannability — same threshold the
 *  Highlights match groups use. */
const CLIPS_VISIBLE_BEFORE_EXPAND = 6

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

  // Reset the expanded state whenever the selected day changes — a
  // coach scrubbing across matches expects each new day to open
  // collapsed.
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    // Reset on session change. Synchronous setState in an effect is
    // the right shape here — we're syncing local state with an
    // external prop change, not chasing a render.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setExpanded(false)
  }, [session.day])
  const overflow = clips.length - CLIPS_VISIBLE_BEFORE_EXPAND
  const showCollapseControls = clips.length > CLIPS_VISIBLE_BEFORE_EXPAND
  const visibleClips = expanded ? clips : clips.slice(0, CLIPS_VISIBLE_BEFORE_EXPAND)
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
  // Meta line carries the date + venue. Opponent + scoreline are
  // already in the hero (headline + score chip below) — repeating them
  // here was the duplication you flagged.
  const metaLine = isTraining
    ? `${dateLabel(session)} · TEAM A vs TEAM B`
    : `${dateLabel(session)} · 15:00 · PITCH 1`

  return (
    <Card className="p-0">
      {/* Header */}
      <div
        className={`border-b border-brand-line bg-brand-yellow-soft ${
          isMobile ? 'px-4 py-4' : 'px-[26px] py-5'
        }`}
      >
        <div className="flex items-center gap-[10px] flex-wrap">
          {!isTraining && motm && (
            <span className="bg-brand-yellow text-brand-indigo font-fragment text-[9px] font-bold tracking-[0.18em] px-[7px] py-[3px] rounded-[3px]">
              ★ MOTM {motm.toUpperCase()}
            </span>
          )}
          {isTraining && (
            <span className="bg-brand-yellow text-brand-indigo font-fragment text-[9px] font-bold tracking-[0.18em] px-[7px] py-[3px] rounded-[3px]">
              TRAINING
            </span>
          )}
          <span className="text-brand-indigo font-fragment text-[10.5px] tracking-[0.18em] font-bold">
            {metaLine}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-4 flex-wrap">
          <MDisplay size={isMobile ? 32 : 56}>{headline}</MDisplay>
          {!isTraining && ourScore != null && oppScore != null && (
            <span
              className="font-clash text-brand-indigo-mute leading-[0.94]"
              style={{ fontSize: isMobile ? 32 : 56 }}
            >
              <span
                className="text-brand-indigo px-2"
                style={{ background: ourScore >= oppScore ? BRAND.yellow : 'transparent' }}
              >
                {ourScore}
              </span>
              <span className="mx-[6px]">—</span>
              <span className="text-brand-indigo-mute">{oppScore}</span>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={isMobile ? 'px-4 py-4' : 'px-[26px] py-5'}>
        <VideoBlock
          height={isMobile ? 200 : 300}
          label={`MATCH FOOTAGE${session.day === 24 ? ' · 84M' : ''}`}
          sub={`${dateLabel(session)} · 15:00 · PITCH 1`}
        />

        {/* Highlights row */}
        <div className="mt-[22px]">
          <div className="flex justify-between items-center mb-[10px] flex-wrap gap-[10px]">
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
            <div className="font-satoshi text-[13px] text-brand-indigo-mute px-4 py-[14px] border border-dashed border-brand-line rounded-[4px] text-center">
              No clips tagged for this session yet.
            </div>
          ) : (
            <>
              <div
                style={{
                  /* Collapsed: horizontal scroll. Expanded: vertical
                   * wrap grid so the coach can scan all clips at a
                   * glance without swiping. Same pattern as the
                   * Highlights match-group rows. */
                  display: expanded ? 'grid' : 'flex',
                  gridTemplateColumns: expanded
                    ? 'repeat(auto-fill, minmax(280px, 1fr))'
                    : undefined,
                  gap: 10,
                  overflowX: expanded ? 'visible' : 'auto',
                  paddingBottom: 4,
                }}
              >
                {visibleClips.map(h => (
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
              {showCollapseControls && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(e => !e)}
                    style={mcButtons.text}
                  >
                    {expanded ? '↑ Show fewer' : `+${overflow} more clips ↓`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Two-column summary on desktop, stacked on mobile so the
         *  training summary table + top performers list each get the
         *  full width of the surface. */}
        <div
          className={`mt-7 grid ${
            isMobile ? 'grid-cols-1 gap-[18px]' : 'grid-cols-2 gap-6'
          }`}
        >
          <div>
            <MEyebrow>{isTraining ? 'TRAINING SUMMARY' : 'TEAM SUMMARY'}</MEyebrow>
            <div className="mt-3 border border-brand-line rounded-[4px] bg-white">
              {summaryRows(session, ourScore, oppScore, motm).map(([k, v], i, arr) => (
                <div
                  key={k}
                  className={`flex justify-between px-[14px] py-[10px] ${
                    i < arr.length - 1 ? 'border-b border-brand-line' : ''
                  }`}
                >
                  <span className="font-fragment text-[10.5px] text-brand-indigo-mute tracking-[0.18em] font-bold">
                    {k.toUpperCase()}
                  </span>
                  <span className="font-satoshi text-[13px] text-brand-indigo font-semibold">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <MEyebrow>TOP PERFORMERS THIS SESSION</MEyebrow>
            <div className="mt-3 border border-brand-line rounded-[4px] bg-white">
              {topPerformersFor(session).map((p, i, arr) => (
                <div
                  key={p.num}
                  className={`grid items-center gap-[10px] px-[14px] py-[10px] ${
                    i < arr.length - 1 ? 'border-b border-brand-line' : ''
                  }`}
                  style={{
                    /* Mobile drops the POS chip + dashed scout-slot
                     * columns to keep the row from overflowing on phone
                     * widths. The scout-slot reservation moves to a
                     * single-line footer note below. */
                    gridTemplateColumns: isMobile
                      ? '20px 28px 1fr 36px'
                      : '20px 28px 1fr 30px 38px 60px',
                  }}
                >
                  <span className="font-fragment text-[10px] text-brand-indigo-mute font-bold">
                    {p.rank}.
                  </span>
                  <MiniAvatar num={p.num} />
                  <span className="font-satoshi text-[13px] font-semibold text-brand-indigo whitespace-nowrap overflow-hidden text-ellipsis">
                    {p.name}{' '}
                    {p.motm && (
                      <span className="text-brand-yellow ml-[2px]">★</span>
                    )}
                  </span>
                  {!isMobile && (
                    <span className="font-fragment text-[9px] font-bold tracking-[0.14em] text-brand-indigo-mute border border-brand-line px-1 py-px rounded-[2px] text-center">
                      {p.pos}
                    </span>
                  )}
                  <span
                    className="font-clash text-brand-indigo text-right"
                    style={{ fontSize: isMobile ? 18 : 22 }}
                  >
                    {p.score}
                  </span>
                  {!isMobile && (
                    <span
                      className="h-[18px] rounded-[2px] font-fragment text-[8px] tracking-[0.14em] flex items-center justify-center"
                      style={{
                        border: '1px dashed rgba(27,21,80,0.18)',
                        color: 'rgba(27,21,80,0.28)',
                      }}
                    >
                      —
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div
              className="mt-2 font-fragment text-[9px] tracking-[0.18em] font-bold"
              style={{ color: 'rgba(27,21,80,0.4)' }}
            >
              ↑ {isMobile ? 'SCOUT-WATCH CHIPS RESERVED' : 'DASHED SLOTS = RESERVED FOR SCOUT-WATCH CHIPS'} (V2)
            </div>
          </div>
        </div>

        <div
          className={`mt-6 flex ${isMobile ? 'justify-stretch' : 'justify-end'}`}
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
