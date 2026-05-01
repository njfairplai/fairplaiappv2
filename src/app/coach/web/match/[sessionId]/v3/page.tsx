'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { sessions, players, matchAnalyses, highlights, pitches } from '@/lib/mockData'
import type { MatchAnalysis, Player, Highlight } from '@/lib/types'
import { BRAND, TYPE, COLORS } from '@/lib/constants'

const RadarChartDynamic = dynamic(() => import('@/components/charts/RadarChart'), { ssr: false, loading: () => <div style={{ height: 220 }} /> })

/* ──────────────────────────────────────────────────────────────────
   Direction C v3 — Coach Match Analysis (parallel route)
   Visual language: sand surface, indigo structure, yellow earns its keep.
   This is built on a /v3 route so the existing /coach/web/match/[id]
   keeps working while we iterate.
   ────────────────────────────────────────────────────────────────── */

/* ── Hardcoded match scores (mirrors current page) ── */
const gameScores: Record<string, { homeGoals: number; awayGoals: number }> = {
  session_005: { homeGoals: 2, awayGoals: 1 },
  session_006: { homeGoals: 1, awayGoals: 2 },
  session_007: { homeGoals: 3, awayGoals: 1 },
  session_010: { homeGoals: 0, awayGoals: 0 },
  session_013: { homeGoals: 2, awayGoals: 0 },
  session_014: { homeGoals: 3, awayGoals: 2 },
}

/* ── Helpers ── */
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatDateMeta(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()].toUpperCase()} ${d.getDate()} ${monthAbbr[d.getMonth()]}`
}

/** Score values: keep traffic-light semantics (red/yellow/green) for clarity per locked plan. */
function scoreValueColor(score: number): string {
  if (score >= 80) return COLORS.success
  if (score >= 60) return COLORS.warning
  return COLORS.error
}

/** "Exceptional" tier per v3 — drives MOTM treatment. */
function isExceptional(score: number): boolean {
  return score >= 85
}

/** Generate a "why this matters" line for a highlight (placeholder until AI surface lands). */
function whyForHighlight(h: Highlight, p: Player | undefined): string {
  const name = p ? p.firstName : 'Player'
  switch (h.eventType) {
    case 'goal': return `${name} finds the net. Show this clip back at training — exactly the pattern we drilled.`
    case 'key_pass': return `Vision under pressure. ${name} unlocks the line — the kind of pass we want more of.`
    case 'sprint_recovery': return `Workrate moment. ${name} recovers shape on the counter; saved the danger.`
    case 'tackle': return `Timing on the ball-winning tackle. ${name} reads it two passes early.`
    case 'save': return `${name} stays big. Keeps us in the game at a critical moment.`
    default: return `Worth a second look — ${name}'s decision in this phase.`
  }
}

/** Map highlight event type → v3 letter + label. */
const eventMeta: Record<string, { letter: string; label: string; isWarning?: boolean }> = {
  goal:             { letter: 'G', label: 'GOAL' },
  key_pass:         { letter: 'A', label: 'KEY PASS' },
  sprint_recovery:  { letter: 'P', label: 'PRESS' },
  tackle:           { letter: 'T', label: 'TACKLE' },
  save:             { letter: 'S', label: 'SAVE' },
}

/* ─────────── Motion (inline <style>) ─────────── */
const v3Motion = `
@keyframes v3-track-draw { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
@keyframes v3-pin-pop    { 0% { transform: translate(-50%,-50%) scale(0); opacity:0 } 60% { transform: translate(-50%,-50%) scale(1.18); opacity:1 } 100% { transform: translate(-50%,-50%) scale(1); opacity:1 } }
@keyframes v3-row-rise   { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: translateY(0) } }
@keyframes v3-pulse-ring { 0% { transform: translate(-50%,-50%) scale(0.6); opacity:0.6 } 100% { transform: translate(-50%,-50%) scale(2.2); opacity:0 } }
@keyframes v3-playhead   { 0%,100% { opacity:0.55 } 50% { opacity:1 } }
@keyframes v3-panel-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes v3-panel-up    { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes v3-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
.v3-row { animation: v3-row-rise .42s cubic-bezier(.2,.7,.2,1) both; }
.v3-pin { animation: v3-pin-pop .38s cubic-bezier(.2,1.4,.4,1) both; }
.v3-track-line { stroke-dasharray: 1200; animation: v3-track-draw 900ms cubic-bezier(.6,0,.2,1) 80ms both; }
.v3-pulse-ring { animation: v3-pulse-ring 1.6s ease-out infinite; }
.v3-playhead { animation: v3-playhead 1.6s ease-in-out infinite; }
.v3-row .v3-stripe, .v3-row .v3-num, .v3-row .v3-arrow { transition: all 220ms cubic-bezier(.2,.7,.3,1); }
.v3-row:hover { background: rgba(27,21,80,0.025); }
.v3-row:hover .v3-stripe { filter: brightness(0.9); }
.v3-row:hover .v3-num    { background: ${BRAND.indigo}; color: ${BRAND.sand}; transform: scale(1.04); }
.v3-row .v3-arrow { opacity: 0; transform: translateX(-4px); }
.v3-row:hover .v3-arrow { opacity: 1; transform: translateX(0); }
.v3-cta { transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease; }
.v3-cta:hover { transform: translateY(-1px); }
.v3-cta:active { transform: translateY(0); }
.v3-pill:hover { background: rgba(27,21,80,0.06); }
`

/* ─────────────────── Back row ───────────────────
 * Replaces the redundant V3Header band. The existing coach layout
 * already provides the brand mark and the Coach's Hub / Video /
 * Analysis / Squad / IDPs nav. We just need a back-link + a place
 * for the "Share recap" CTA, both on the sand surface so they
 * read as part of the v3 page, not the platform chrome.
 */
function V3BackRow({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      background: BRAND.sand,
      padding: '14px 28px 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily: TYPE.body,
    }}>
      <button onClick={onBack} className="v3-cta" style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: BRAND.indigo, fontSize: 14,
        fontFamily: TYPE.mono, letterSpacing: '0.16em', fontWeight: 600,
        padding: '4px 0',
        display: 'flex', alignItems: 'center', gap: 8,
      }} aria-label="Back to matches">
        ← BACK TO MATCHES
      </button>
      <div style={{ marginLeft: 'auto' }}>
        <button className="v3-cta" style={{
          background: BRAND.indigo, color: BRAND.sand, border: 'none',
          padding: '9px 16px', fontFamily: TYPE.body, fontWeight: 600, fontSize: 13,
          borderRadius: 7, cursor: 'pointer', letterSpacing: '0.01em',
          boxShadow: '0 4px 10px rgba(27,21,80,0.18)',
        }}>Share recap →</button>
      </div>
    </div>
  )
}

/** Available filter keys — each maps to a subset of event types in the data. */
type FilterKey = 'all' | 'goal' | 'key_pass' | 'tackle' | 'save'

const FILTER_DEFS: { key: FilterKey; label: string; matches: (eventType: string) => boolean }[] = [
  { key: 'all',      label: 'All',         matches: () => true },
  { key: 'goal',     label: 'Goals',       matches: t => t === 'goal' },
  { key: 'key_pass', label: 'Key passes',  matches: t => t === 'key_pass' },
  { key: 'tackle',   label: 'Tackles',     matches: t => t === 'tackle' },
  { key: 'save',     label: 'Saves',       matches: t => t === 'save' },
]

/* ─────────────────── Score strip ─────────────────── */
function V3ScoreStrip({
  homeName, awayName, homeGoals, awayGoals, dateLabel, venue,
  filter, setFilter, countsByKey,
}: {
  homeName: string; awayName: string;
  homeGoals: number; awayGoals: number;
  dateLabel: string; venue: string;
  filter: FilterKey; setFilter: (s: FilterKey) => void;
  countsByKey: Record<FilterKey, number>;
}) {
  const homeWon = homeGoals > awayGoals
  const drew = homeGoals === awayGoals
  return (
    <div style={{
      padding: '14px 28px 22px',
      borderBottom: `1px solid ${BRAND.line}`,
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      background: BRAND.sand,
      flexWrap: 'wrap',
    }}>
      <div style={{ fontFamily: TYPE.display, fontSize: 32, color: BRAND.indigo, letterSpacing: '0.02em' }}>{homeName.toUpperCase()}</div>
      <div style={{ fontFamily: TYPE.display, fontSize: 44, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 10, color: BRAND.indigo }}>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          {/* yellow swatch behind the winning team's goal count (or both, if draw) */}
          {(homeWon || drew) && (
            <span style={{ position: 'absolute', inset: '-8px -10px', background: BRAND.yellow, borderRadius: 4, zIndex: 0 }} />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{homeGoals}</span>
        </span>
        <span style={{ color: BRAND.indigoMute, fontSize: 24 }}>—</span>
        <span style={{ position: 'relative', display: 'inline-block', color: homeWon ? BRAND.indigoMid : BRAND.indigo }}>
          {(drew || (!homeWon && homeGoals !== awayGoals)) && (
            <span style={{ position: 'absolute', inset: '-8px -10px', background: BRAND.yellow, borderRadius: 4, zIndex: 0 }} />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{awayGoals}</span>
        </span>
      </div>
      <div style={{ fontFamily: TYPE.display, fontSize: 32, color: BRAND.indigoMute, letterSpacing: '0.02em' }}>{awayName.toUpperCase()}</div>
      <div style={{ width: 1, height: 28, background: BRAND.line, marginLeft: 6 }} />
      <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em', color: BRAND.indigoMute }}>
        FT · {dateLabel} · {venue}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTER_DEFS.map(f => {
          const active = filter === f.key
          const n = countsByKey[f.key]
          // Hide pills that match nothing (e.g. no saves in this match)
          if (f.key !== 'all' && n === 0) return null
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={active ? '' : 'v3-pill'}
              style={{
                background: active ? BRAND.indigo : 'transparent',
                color: active ? BRAND.sand : BRAND.indigo,
                border: `1px solid ${active ? BRAND.indigo : BRAND.line}`,
                padding: '7px 12px', borderRadius: 999,
                fontFamily: TYPE.body, fontSize: 11.5, fontWeight: active ? 600 : 500,
                letterSpacing: '0.02em', cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
            >{f.label} ({n})</button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────── Timeline ─────────────────── */
type TLEvent = { id: string; t: number; type: string; playerId: string; isGoal: boolean; isWarning: boolean }

function V3Timeline({ events, totalMin, activeId, onSelect }: {
  events: TLEvent[]; totalMin: number; activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = events.find(e => e.id === activeId)
  const playheadPct = active ? (active.t / totalMin) * 100 : 0
  const HALF_TIME = totalMin / 2
  const ticks = [0, totalMin * 0.25, HALF_TIME, totalMin * 0.75, totalMin]

  return (
    <div style={{ position: 'relative', padding: '28px 28px 22px', background: BRAND.sand, borderBottom: `1px solid ${BRAND.line}` }}>
      {/* minute scale */}
      <div style={{ position: 'relative', height: 14, marginBottom: 6 }}>
        {ticks.map((m, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(m / totalMin) * 100}%`,
              transform: 'translateX(-50%)',
              fontFamily: TYPE.mono,
              fontSize: 9.5,
              letterSpacing: '0.15em',
              color: BRAND.indigoMute,
            }}
          >
            {Math.abs(m - HALF_TIME) < 0.1 ? 'HALF' : `${Math.round(m)}'`}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', height: 78 }}>
        <svg width="100%" height="78" viewBox="0 0 1200 78" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <line x1="0" y1="39" x2="1200" y2="39" stroke="rgba(27,21,80,0.18)" strokeWidth="1" />
          <line className="v3-track-line" x1="0" y1="39" x2="1200" y2="39" stroke={BRAND.indigo} strokeOpacity="0.85" strokeWidth="2" />
        </svg>
        {/* HT marker */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, borderLeft: `1px dashed ${BRAND.line}` }} />

        {events.map((e, i) => {
          const meta = eventMeta[e.type] || { letter: '·', label: e.type.toUpperCase() }
          const left = (e.t / totalMin) * 100
          const above = i % 2 === 0
          const isActive = e.id === activeId
          return (
            <div
              key={e.id}
              className={i < 12 ? 'v3-pin' : ''}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: above ? 6 : 50,
                animationDelay: `${80 + i * 60}ms`,
              }}
            >
              {isActive && (
                <div className="v3-pulse-ring" style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: 26, height: 26, borderRadius: '50%',
                  border: `2px solid ${e.isGoal ? BRAND.yellow : BRAND.indigo}`,
                  pointerEvents: 'none',
                }} />
              )}
              <button
                onClick={() => onSelect(e.id)}
                aria-label={meta.label}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: isActive ? 30 : 22, height: isActive ? 30 : 22,
                  borderRadius: '50%',
                  background: e.isGoal ? BRAND.yellow : (isActive ? BRAND.indigo : BRAND.sand),
                  border: `2px solid ${BRAND.indigo}`,
                  color: e.isGoal ? BRAND.indigo : (isActive ? BRAND.sand : BRAND.indigo),
                  fontFamily: TYPE.display, fontSize: isActive ? 13 : 11,
                  cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive
                    ? `0 0 0 5px ${e.isGoal ? BRAND.yellowSoft : BRAND.indigoSoft}, 0 4px 8px rgba(27,21,80,0.15)`
                    : '0 1px 3px rgba(27,21,80,0.18)',
                  transition: 'all 180ms cubic-bezier(.2,1.4,.4,1)',
                }}
              >{meta.letter}</button>
              <div style={{
                position: 'absolute', left: '50%', top: above ? 16 : -16, width: 1,
                height: 22, background: isActive ? BRAND.indigo : BRAND.line,
              }} />
            </div>
          )
        })}

        {active && (
          <div className="v3-playhead" style={{
            position: 'absolute', left: `${playheadPct}%`, top: -8, bottom: -8, width: 2,
            background: BRAND.yellow, transform: 'translateX(-50%)',
            boxShadow: `0 0 8px ${BRAND.yellow}`,
          }} />
        )}
      </div>

      {/* legend */}
      <div style={{ marginTop: 18, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {Object.entries(eventMeta).map(([k, m]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.15em', color: BRAND.indigoMute }}>
            <span style={{
              width: 11, height: 11, borderRadius: '50%',
              background: k === 'goal' ? BRAND.yellow : 'transparent',
              border: `1.5px solid ${BRAND.indigo}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, color: BRAND.indigo, fontFamily: TYPE.display,
            }}>{m.letter}</span>
            {m.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── Clip panel (video well + commentary) ─────────────────── */
function V3ClipPanel({ event, player, totalMin }: {
  event: TLEvent | null;
  player: Player | undefined;
  totalMin: number;
}) {
  if (!event || !player) return null
  const meta = eventMeta[event.type] || { letter: '·', label: event.type.toUpperCase() }
  const playerName = `${player.firstName} ${player.lastName}`
  const why = whyForHighlight({ eventType: event.type as Highlight['eventType'] } as Highlight, player)
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.45fr 1fr',
      gap: 0,
      position: 'relative',
      background: BRAND.sand,
      borderBottom: `1px solid ${BRAND.line}`,
    }}>
      {/* video well — the only "dark" surface in v3 */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: BRAND.indigo, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 80%, ${BRAND.indigoMid} 0%, ${BRAND.indigo} 70%)` }} />
        {/* mowed-stripes ambient texture */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, top: `${i * 12.5}%`, height: '12.5%',
            background: i % 2 ? 'rgba(238,228,200,0.04)' : 'transparent',
          }} />
        ))}
        {/* pitch markings */}
        <svg width="100%" height="100%" viewBox="0 0 100 56" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <rect x="2" y="2" width="96" height="52" fill="none" stroke={BRAND.sand} strokeOpacity="0.18" strokeWidth="0.25" />
          <line x1="50" y1="2" x2="50" y2="54" stroke={BRAND.sand} strokeOpacity="0.18" strokeWidth="0.25" />
          <circle cx="50" cy="28" r="6" fill="none" stroke={BRAND.sand} strokeOpacity="0.18" strokeWidth="0.25" />
        </svg>
        {/* trail */}
        <svg width="100%" height="100%" viewBox="0 0 100 56" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <path className="v3-track-line" d="M 18 38 Q 32 26, 48 22 T 78 14" stroke={BRAND.yellow} strokeWidth="0.8" fill="none" strokeDasharray="3 1.6" opacity="0.95" />
          <circle className="v3-pin" style={{ animationDelay: '750ms' }} cx="78" cy="14" r="2.4" fill={BRAND.yellow} />
          <circle cx="78" cy="14" r="5" fill={BRAND.yellow} fillOpacity="0.22" />
          <circle cx="18" cy="38" r="1.6" fill={BRAND.sand} fillOpacity="0.55" />
        </svg>
        {/* HUD top-left */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(11,8,40,0.65)', backdropFilter: 'blur(6px)', color: BRAND.sand, fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em', padding: '5px 10px', borderRadius: 4, border: `1px solid rgba(238,228,200,0.18)` }}>● 0.5× SLOW-MO</div>
          <div style={{
            background: event.isGoal ? BRAND.yellow : BRAND.sand,
            color: BRAND.indigo,
            fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em', padding: '5px 10px', borderRadius: 4, fontWeight: 700,
          }}>{meta.label}</div>
        </div>
        {/* big timestamp top-right */}
        <div style={{ position: 'absolute', top: 14, right: 14, color: BRAND.sand, fontFamily: TYPE.display, fontSize: 44, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          {Math.floor(event.t)}'
        </div>
        {/* play controls */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="v3-cta" style={{ width: 50, height: 50, borderRadius: '50%', background: BRAND.yellow, border: 'none', color: BRAND.indigo, fontSize: 18, cursor: 'pointer', boxShadow: `0 4px 14px rgba(252,215,24,0.4)` }}>▶</button>
          <div style={{ flex: 1, height: 4, background: 'rgba(238,228,200,0.22)', borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '42%', background: BRAND.yellow, borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: '42%', top: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: BRAND.yellow, boxShadow: `0 0 0 4px rgba(252,215,24,0.32)` }} />
          </div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 11, color: BRAND.sand, letterSpacing: '0.12em' }}>0:18 / 0:42</div>
        </div>
      </div>

      {/* commentary panel — sand on sand, with paper card for the headline + yellow why card */}
      <div style={{
        background: BRAND.sand, color: BRAND.indigo, padding: '24px 26px',
        position: 'relative', overflow: 'hidden',
        borderLeft: `1px solid ${BRAND.line}`,
      }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 11, letterSpacing: '0.22em', color: BRAND.indigo, fontWeight: 700 }}>
          {String(Math.floor(event.t)).padStart(2, '0')}' · {meta.label}
        </div>
        <div style={{ fontFamily: TYPE.display, fontSize: 38, marginTop: 4, lineHeight: 1, letterSpacing: '-0.02em', color: BRAND.indigo }}>
          {event.isGoal ? `${playerName.split(' ')[0]}'s finish` : meta.label.toLowerCase()}
        </div>

        {/* player chip */}
        <div style={{
          marginTop: 18, display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', background: BRAND.paper, borderRadius: 10,
          border: `1px solid ${BRAND.line}`,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: BRAND.indigo, color: BRAND.sand,
            fontFamily: TYPE.display, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{player.jerseyNumber}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: TYPE.body, fontSize: 14, fontWeight: 600 }}>{playerName}</div>
            <div style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.14em', color: BRAND.indigoMute }}>{(player.position[0] || '').toUpperCase()} · #{player.jerseyNumber}</div>
          </div>
        </div>

        {/* why this matters — the yellow editorial moment */}
        <div style={{
          marginTop: 18, padding: '16px 18px',
          background: BRAND.yellow, color: BRAND.indigo, borderRadius: 10,
          position: 'relative',
          boxShadow: '0 4px 14px rgba(252,215,24,0.25)',
        }}>
          <div style={{ position: 'absolute', left: -3, top: 14, bottom: 14, width: 3, background: BRAND.indigo, borderRadius: 2 }} />
          <div style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.22em', color: BRAND.indigo, fontWeight: 700 }}>WHY THIS MATTERS</div>
          <div style={{ fontFamily: TYPE.body, fontSize: 14.5, lineHeight: 1.55, marginTop: 6, color: BRAND.indigo, fontWeight: 500 }}>
            {why}
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <button className="v3-cta" style={{
            flex: 1, padding: '12px', background: BRAND.indigo, color: BRAND.sand, border: 'none', borderRadius: 8,
            fontFamily: TYPE.body, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27,21,80,0.18)',
          }}>Save clip</button>
          <button className="v3-cta" style={{
            flex: 1, padding: '12px', background: 'transparent', color: BRAND.indigo,
            border: `1px solid ${BRAND.indigo}`, borderRadius: 8,
            fontFamily: TYPE.body, fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>Send to {player.firstName}</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Roster row ─────────────────── */
type PlayerRow = { player: Player; analysis: MatchAnalysis; events: TLEvent[] }

function V3RosterRow({ row, idx, totalMin, onSelect }: {
  row: PlayerRow; idx: number; totalMin: number;
  onSelect: (playerId: string) => void;
}) {
  const { player: p, analysis: a, events } = row
  const c = scoreValueColor(a.compositeScore)
  const exceptional = isExceptional(a.compositeScore)
  return (
    <div
      className="v3-row"
      onClick={() => onSelect(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}
      style={{
        animationDelay: `${100 + idx * 35}ms`,
        display: 'grid',
        gridTemplateColumns: '46px 170px 1fr 100px 70px 24px',
        alignItems: 'center', gap: 16, padding: '14px 4px',
        borderBottom: `1px solid ${BRAND.line}`, cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div className="v3-num" style={{
        width: 36, height: 36, borderRadius: 8,
        background: exceptional ? BRAND.yellow : BRAND.paper,
        border: `1.5px solid ${exceptional ? BRAND.indigo : BRAND.line}`,
        color: BRAND.indigo, fontFamily: TYPE.display, fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{p.jerseyNumber}</div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: TYPE.body, fontSize: 14, fontWeight: 600, color: BRAND.indigo, display: 'flex', alignItems: 'center', gap: 6 }}>
          {p.firstName} {p.lastName}
          {exceptional && <span style={{ fontSize: 10, color: BRAND.indigo, background: BRAND.yellow, padding: '1px 5px', borderRadius: 2, fontFamily: TYPE.mono, letterSpacing: '0.12em', fontWeight: 700 }}>★ MOTM</span>}
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.16em', color: BRAND.indigoMute }}>{(p.position[0] || '').toUpperCase()}</div>
      </div>

      {/* score stripe with moment ticks */}
      <div style={{ position: 'relative', height: 22 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 9, height: 4, background: BRAND.indigoSoft, borderRadius: 2 }} />
        <div className="v3-stripe" style={{
          position: 'absolute', left: 0, top: 9, height: 4, width: `${a.compositeScore}%`,
          background: c, borderRadius: 2,
        }} />
        {events.map((e, i) => (
          <div key={i} title={e.type} style={{
            position: 'absolute', left: `${(e.t / totalMin) * 100}%`, top: 0, bottom: 0,
            transform: 'translateX(-50%)',
          }}>
            <div style={{
              width: e.isGoal ? 10 : 8,
              height: e.isGoal ? 10 : 8,
              borderRadius: '50%',
              background: e.isGoal ? BRAND.yellow : BRAND.indigo,
              border: `1.5px solid ${BRAND.indigo}`,
              marginTop: e.isGoal ? 6 : 7,
              boxShadow: e.isGoal ? `0 0 6px ${BRAND.yellow}` : 'none',
            }} />
          </div>
        ))}
      </div>

      {/* tags */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
        {events.slice(0, 2).map((e, i) => {
          const m = eventMeta[e.type] || { letter: '·' }
          return (
            <span key={i} style={{
              fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.12em', fontWeight: 700,
              padding: '3px 6px',
              background: e.isGoal ? BRAND.yellow : BRAND.indigoSoft,
              color: BRAND.indigo,
              borderRadius: 3,
            }}>{m.letter}</span>
          )
        })}
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: TYPE.display, fontSize: 22, color: c, letterSpacing: '-0.02em', lineHeight: 1 }}>{a.compositeScore}</div>
      </div>

      <div className="v3-arrow" style={{ color: BRAND.indigo, fontSize: 16, fontFamily: TYPE.body }}>→</div>
    </div>
  )
}

/* ─────────────────── Player detail panel ─────────────────── */
/** Letter grade + colour band for a category score (0–100). */
function getGrade(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: 'A', color: COLORS.success }
  if (score >= 70) return { grade: 'B', color: COLORS.success }
  if (score >= 60) return { grade: 'C', color: COLORS.warning }
  if (score >= 50) return { grade: 'D', color: COLORS.warning }
  return { grade: 'F', color: COLORS.error }
}

/** Mobile detection — full-page takeover on phones, slide-in on desktop. */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = () => setIsMobile(m.matches)
    handler()
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

function V3PlayerDetail({ row, onClose }: { row: PlayerRow; onClose: () => void }) {
  const { player: p, analysis: a } = row
  const isMobile = useIsMobile()
  const compositeColor = scoreValueColor(a.compositeScore)
  const exceptional = isExceptional(a.compositeScore)

  // Season average not tracked per-match in mock data — use composite as a placeholder.
  // Real implementation will pull this from PlayerSeasonStats.
  const radarData = [
    { category: 'Physical',   score: a.physicalScore,   avg: a.compositeScore },
    { category: 'Passing',    score: a.passingScore,    avg: a.compositeScore },
    { category: 'Dribbling',  score: a.dribblingScore,  avg: a.compositeScore },
    { category: 'Defending',  score: a.defendingScore,  avg: a.compositeScore },
    { category: 'Control',    score: a.controlScore,    avg: a.compositeScore },
    { category: 'Positional', score: a.positionalScore, avg: a.compositeScore },
  ]

  const grades = [
    { label: 'Physical', score: a.physicalScore },
    { label: 'Passing', score: a.passingScore },
    { label: 'Dribbling', score: a.dribblingScore },
    { label: 'Defending', score: a.defendingScore },
    { label: 'Control', score: a.controlScore },
    { label: 'Positional', score: a.positionalScore },
  ]

  // Persisted per-session, per-player coach notes (mirrors the existing match page pattern).
  const noteKey = `fairplai_player_session_note_${a.sessionId}_${p.id}`
  const [note, setNote] = useState<string>('')
  useEffect(() => {
    if (typeof window === 'undefined') return
    setNote(window.localStorage.getItem(noteKey) ?? '')
  }, [noteKey])
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (note) window.localStorage.setItem(noteKey, note)
  }, [note, noteKey])

  // Common panel content (header + score + radar + grades + physical + notes)
  const content = (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      background: BRAND.sand,
      color: BRAND.indigo,
      fontFamily: TYPE.body,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 24px',
        background: BRAND.indigo, color: BRAND.sand,
        position: 'sticky', top: 0, zIndex: 2,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: BRAND.sand, color: BRAND.indigo,
          fontFamily: TYPE.display, fontSize: 18, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: exceptional ? `0 0 0 2px ${BRAND.yellow}` : 'none',
          flexShrink: 0,
        }}>{p.jerseyNumber}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TYPE.display, fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            {p.firstName} {p.lastName}
          </div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em', color: 'rgba(238,228,200,0.7)', marginTop: 4 }}>
            #{p.jerseyNumber} · {(p.position[0] || '').toUpperCase()} · {a.minutesPlayed ?? '—'}'
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="v3-cta"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(238,228,200,0.10)', color: BRAND.sand,
            border: `1px solid rgba(238,228,200,0.2)`,
            fontSize: 16, cursor: 'pointer', flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* Composite score band */}
      <div style={{
        padding: '24px',
        display: 'flex', alignItems: 'center', gap: 18,
        borderBottom: `1px solid ${BRAND.line}`,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          border: `4px solid ${compositeColor}`,
          background: BRAND.paper,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: TYPE.display, fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', color: compositeColor }}>{a.compositeScore}</div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 8.5, letterSpacing: '0.2em', color: BRAND.indigoMute, marginTop: 4 }}>SCORE</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700 }}>SESSION SCORE</div>
          <div style={{ fontFamily: TYPE.display, fontSize: 24, marginTop: 4, letterSpacing: '-0.01em' }}>
            {a.compositeScore >= 85 ? 'Exceptional.' : a.compositeScore >= 75 ? 'Strong session.' : a.compositeScore >= 60 ? 'Solid.' : 'Room to grow.'}
          </div>
          {exceptional && (
            <div style={{
              display: 'inline-block',
              marginTop: 8,
              padding: '4px 10px',
              background: BRAND.yellow, color: BRAND.indigo,
              fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.18em', fontWeight: 700,
              borderRadius: 4,
            }}>★ MOTM</div>
          )}
        </div>
      </div>

      {/* Performance Radar */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 8 }}>PERFORMANCE RADAR</div>
        <div style={{ background: BRAND.paper, borderRadius: 12, padding: 12, border: `1px solid ${BRAND.line}` }}>
          <RadarChartDynamic data={radarData} height={isMobile ? 240 : 280} />
        </div>
      </div>

      {/* Category Grades */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 10 }}>CATEGORY GRADES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {grades.map(({ label, score }) => {
            const { grade, color } = getGrade(score)
            return (
              <div key={label} style={{
                background: BRAND.paper, border: `1px solid ${BRAND.line}`,
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: BRAND.indigoMute, fontFamily: TYPE.mono, letterSpacing: '0.12em' }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily: TYPE.display, fontSize: 22, color: BRAND.indigo, marginTop: 2, letterSpacing: '-0.01em' }}>{score}</div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
                }}>{grade}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Physical Details */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 10 }}>PHYSICAL</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Distance', value: `${a.distanceCovered.toFixed(1)} km` },
            { label: 'Top Speed', value: `${a.topSpeed.toFixed(1)} km/h` },
            { label: 'Sprints', value: `${a.sprintCount}` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 10,
              padding: '12px 8px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: TYPE.display, fontSize: 18, fontWeight: 700, color: BRAND.indigo, letterSpacing: '-0.01em' }}>{value}</div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.16em', color: BRAND.indigoMute, marginTop: 4 }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coach notes */}
      <div style={{ padding: '20px 24px 32px' }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.2em', color: BRAND.indigoMute, fontWeight: 700, marginBottom: 8 }}>SESSION NOTES</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={`Add notes about ${p.firstName}...`}
          style={{
            width: '100%', minHeight: 90,
            border: `1px solid ${BRAND.line}`, background: BRAND.paper,
            borderRadius: 10, padding: 12,
            fontSize: 14, color: BRAND.indigo,
            resize: 'vertical', fontFamily: TYPE.body, boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(11,8,40,0.45)',
          zIndex: 90,
          animation: 'v3-backdrop-in 180ms ease-out both',
        }}
      />
      {/* panel: takeover on mobile, slide-in 460px on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? '100vw' : 460,
          background: BRAND.sand,
          boxShadow: '-8px 0 32px rgba(11,8,40,0.18)',
          zIndex: 100,
          animation: isMobile
            ? 'v3-panel-up 280ms cubic-bezier(.2,.7,.2,1) both'
            : 'v3-panel-right 280ms cubic-bezier(.2,.7,.2,1) both',
        }}
      >
        {content}
      </div>
    </>
  )
}

/* ─────────────────── Page ─────────────────── */
export default function V3MatchAnalysisPage() {
  const params = useParams<{ sessionId: string }>()
  const router = useRouter()
  const sessionId = params?.sessionId ?? ''

  const session = useMemo(() => sessions.find(s => s.id === sessionId), [sessionId])

  // Compute roster rows from real data
  const sessionAnalyses = useMemo(() => matchAnalyses.filter(a => a.sessionId === sessionId), [sessionId])

  // Highlights live in a separate top-level export, joined by sessionId.
  const sessionHighlights = useMemo(() => highlights.filter(h => h.sessionId === sessionId), [sessionId])

  // Aggregate timeline events across all highlights for the session
  const allEvents: TLEvent[] = useMemo(
    () => sessionHighlights
      .map(h => ({
        id: h.id,
        t: h.timestampSeconds / 60, // seconds → minutes
        type: h.eventType,
        playerId: h.playerId,
        isGoal: h.eventType === 'goal',
        isWarning: false,
      }))
      .sort((a, b) => a.t - b.t),
    [sessionHighlights],
  )

  // Player rows always show all players; their per-row event ticks/tags filter
  // along with the timeline so the page reads as one coordinated filter state.
  const buildPlayerRows = (events: TLEvent[]): PlayerRow[] => {
    return sessionAnalyses
      .map(a => {
        const p = players.find(pl => pl.id === a.playerId)
        if (!p) return null
        const evs: TLEvent[] = events.filter(e => e.playerId === a.playerId)
        return { player: p, analysis: a, events: evs }
      })
      .filter((r): r is PlayerRow => r !== null)
      .sort((a, b) => b.analysis.compositeScore - a.analysis.compositeScore)
  }
  const playerRows: PlayerRow[] = useMemo(
    () => buildPlayerRows(allEvents),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionAnalyses, allEvents],
  )

  const totalMin = useMemo(() => {
    if (!session) return 70
    const [sh, sm] = session.startTime.split(':').map(Number)
    const [eh, em] = session.endTime.split(':').map(Number)
    return Math.max(20, (eh * 60 + em) - (sh * 60 + sm))
  }, [session])

  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  // Apply the active filter to the events list
  const filterDef = FILTER_DEFS.find(f => f.key === filter) ?? FILTER_DEFS[0]
  const visibleEvents = useMemo(
    () => allEvents.filter(e => filterDef.matches(e.type)),
    [allEvents, filterDef],
  )

  // Per-row events respect the current filter so the page reads as one
  // coordinated state (timeline + roster ticks + roster tags all filter together).
  const visiblePlayerRows: PlayerRow[] = useMemo(() => {
    if (filter === 'all') return playerRows
    return playerRows.map(r => ({ ...r, events: r.events.filter(e => filterDef.matches(e.type)) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRows, filter])

  // Default-select the most "interesting" visible event when data/filter changes.
  // If the current selection isn't in the filtered set, fall back to the first goal,
  // then to the first visible event.
  useMemo(() => {
    if (visibleEvents.length === 0) {
      setActiveEventId(null)
      return
    }
    if (activeEventId && visibleEvents.some(e => e.id === activeEventId)) return
    const goal = visibleEvents.find(e => e.isGoal)
    setActiveEventId((goal ?? visibleEvents[0]).id)
  }, [visibleEvents, activeEventId])

  const activeEvent = visibleEvents.find(e => e.id === activeEventId) ?? null
  const activePlayer = activeEvent ? players.find(p => p.id === activeEvent.playerId) : undefined

  // Counts per filter key for the pill labels (total set, regardless of current selection)
  const countsByKey = useMemo(() => {
    const out: Record<FilterKey, number> = { all: 0, goal: 0, key_pass: 0, tackle: 0, save: 0 }
    out.all = allEvents.length
    for (const e of allEvents) {
      if (e.type in out) (out as Record<string, number>)[e.type]++
    }
    return out
  }, [allEvents])

  if (!session) {
    return (
      <div style={{ background: BRAND.sand, minHeight: '100vh', padding: 40, color: BRAND.indigo, fontFamily: TYPE.body }}>
        <style dangerouslySetInnerHTML={{ __html: v3Motion }} />
        <div style={{ fontFamily: TYPE.display, fontSize: 32 }}>Session not found</div>
        <button onClick={() => router.back()} style={{ marginTop: 20 }}>Go back</button>
      </div>
    )
  }

  // Header / score strip data
  const score = gameScores[sessionId]
  const homeName = 'Lions U13' // placeholder — real roster name would come from rosters/squad
  const awayName = session.opponent ?? 'Training B'
  const dateLabel = formatDateMeta(session.date)
  const venue = pitches.find(p => p.id === session.pitchId)?.name ?? 'Academy Pitch'
  const homeGoals = score?.homeGoals ?? 0
  const awayGoals = score?.awayGoals ?? 0

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: BRAND.sand,
      color: BRAND.indigo,
      fontFamily: TYPE.body,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style dangerouslySetInnerHTML={{ __html: v3Motion }} />

      <V3BackRow onBack={() => router.back()} />

      <V3ScoreStrip
        homeName={homeName}
        awayName={awayName}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        dateLabel={dateLabel}
        venue={venue}
        filter={filter}
        setFilter={setFilter}
        countsByKey={countsByKey}
      />

      <V3Timeline
        events={visibleEvents}
        totalMin={totalMin}
        activeId={activeEventId}
        onSelect={setActiveEventId}
      />

      <V3ClipPanel event={activeEvent} player={activePlayer} totalMin={totalMin} />

      {/* Roster */}
      <div style={{ background: BRAND.sand, padding: '24px 28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: TYPE.mono, fontSize: 11, letterSpacing: '0.22em', color: BRAND.indigoMute, fontWeight: 700 }}>SQUAD · {playerRows.length} PLAYERS</div>
            <div style={{ fontFamily: TYPE.display, fontSize: 32, color: BRAND.indigo, marginTop: 2, letterSpacing: '-0.01em' }}>Who did what — at a glance.</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Score ↓', 'Position', 'Moments', 'Worries'].map((l, i) => (
              <button key={l} className={i === 0 ? '' : 'v3-pill'} style={{
                background: i === 0 ? BRAND.indigo : 'transparent',
                color: i === 0 ? BRAND.sand : BRAND.indigo,
                border: `1px solid ${i === 0 ? BRAND.indigo : BRAND.line}`,
                padding: '6px 11px', borderRadius: 999,
                fontFamily: TYPE.body, fontSize: 11.5, cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '46px 170px 1fr 100px 70px 24px', gap: 16,
          padding: '8px 4px', borderBottom: `1px solid ${BRAND.line}`,
          fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.18em', color: BRAND.indigoMute,
        }}>
          <div>#</div><div>NAME</div><div>SCORE STRIPE · MOMENTS</div><div style={{ textAlign: 'right' }}>TAGS</div><div style={{ textAlign: 'right' }}>SCORE</div><div></div>
        </div>

        {visiblePlayerRows.map((r, i) => (
          <V3RosterRow key={r.player.id} row={r} idx={i} totalMin={totalMin} onSelect={setSelectedPlayerId} />
        ))}
      </div>

      {/* Player detail panel (slide-in on desktop, takeover on mobile) */}
      {selectedPlayerId && (() => {
        const row = playerRows.find(r => r.player.id === selectedPlayerId)
        if (!row) return null
        return <V3PlayerDetail row={row} onClose={() => setSelectedPlayerId(null)} />
      })()}
    </div>
  )
}
