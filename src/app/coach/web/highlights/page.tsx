'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import {
  DEFAULT_SELECTED_DAY,
  MATCH_CENTER_HIGHLIGHTS,
  SESSIONS_BY_DAY,
} from '@/lib/match-center'
import {
  MEyebrow,
  MDisplay,
  Card,
  VideoBlock,
  mcButtons,
} from '@/components/coach/match-center/atoms'
import { Calendar } from '@/components/coach/match-center/Calendar'
import { HighlightCard } from '@/components/coach/match-center/HighlightCard'

/**
 * Highlights — same calendar primitive as Match Center, but the pane
 * below is a clip-browse: featured clip on the left, all-clips list
 * on the right, filter pills at the top of the band.
 *
 * Calendar built once, rendered twice. Coaches scrub by date, then
 * filter by event type within a single match's clips. Sharing a reel
 * or opening the full match drill-in are the two CTAs.
 */
const FILTERS = ['ALL', 'GOALS', 'KEY', 'TACKLES', 'SAVES', 'SPRINTS'] as const
type Filter = (typeof FILTERS)[number]

export default function CoachHighlightsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session')
  const initialDay = useMemo(() => parseSessionParam(sessionParam) ?? DEFAULT_SELECTED_DAY, [sessionParam])

  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedDay, setSelectedDay] = useState<number>(initialDay)
  const [filter, setFilter] = useState<Filter>('ALL')

  const session = SESSIONS_BY_DAY[selectedDay] ?? null

  // For now the clip set is the populated Feb 24 demo set whenever the
  // selected day is a ready match. Real wiring (clips per session) lands
  // when the API layer ships.
  const clips =
    session?.status === 'ready'
      ? filter === 'ALL'
        ? MATCH_CENTER_HIGHLIGHTS
        : MATCH_CENTER_HIGHLIGHTS.filter(h => filterMatch(h.ev, filter))
      : []

  return (
    <div
      style={{
        background: BRAND.sand,
        minHeight: '100%',
        padding: '32px 36px',
        color: BRAND.indigo,
      }}
    >
      <div>
        <MEyebrow>SPRING 2026 SEASON</MEyebrow>
        <MDisplay size={64} style={{ marginTop: 6 }}>
          Highlights
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 14,
            color: BRAND.indigoMid,
            marginTop: 4,
          }}
        >
          Every clip we&apos;ve tagged from this season. Pick a match to scope, then filter
          by event type.
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Calendar
          view={view}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          onViewChange={setView}
          onRecord={() => router.push('/coach/web/record')}
        />
      </div>

      <div style={{ marginTop: 28 }}>
        <Card style={{ padding: 0 }}>
          {/* Header for the selected match */}
          <div
            style={{
              padding: '20px 26px',
              borderBottom: `1px solid ${BRAND.line}`,
              background: BRAND.yellowSoft,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <MEyebrow>SCOPE · MATCH</MEyebrow>
              <MDisplay size={32} style={{ marginTop: 6 }}>
                {session?.status === 'ready' && session.opponent
                  ? `vs ${session.opponent} · 3-1 W`
                  : 'No clips for this day'}
              </MDisplay>
              <div
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: BRAND.indigoMute,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {session?.status === 'ready'
                  ? `SUN ${selectedDay} FEB · ${MATCH_CENTER_HIGHLIGHTS.length} CLIPS · 2:54 TOTAL`
                  : 'PICK A READY MATCH FROM THE CALENDAR'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {FILTERS.map(f => {
                const active = f === filter
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 10px',
                      border: active ? 'none' : `1px solid ${BRAND.line}`,
                      background: active ? BRAND.indigo : 'transparent',
                      color: active ? BRAND.sand : BRAND.indigo,
                      fontFamily: TYPE.mono,
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      borderRadius: 3,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Featured clip + all-clips list */}
          {session?.status === 'ready' ? (
            <div
              style={{
                padding: '20px 26px',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: 24,
              }}
            >
              <div>
                <VideoBlock
                  height={300}
                  label={`GOAL · 47' · SAEED KHALIFA #7`}
                  sub="LATE-ARRIVAL FINISH · 2-1"
                />
                <div
                  style={{
                    marginTop: 14,
                    padding: '14px 16px',
                    background: BRAND.paper,
                    border: `1px solid ${BRAND.line}`,
                    borderRadius: 4,
                  }}
                >
                  <MEyebrow color={BRAND.indigoMute}>WHAT JUST HAPPENED</MEyebrow>
                  <div
                    style={{
                      fontFamily: TYPE.body,
                      fontSize: 13,
                      marginTop: 6,
                      color: BRAND.indigo,
                      lineHeight: 1.55,
                    }}
                  >
                    Saeed peels off the back-post defender on Kiyan&apos;s switch and arrives
                    in stride. Right-foot finish across the keeper. Top-corner. The drill we
                    ran Tuesday — directly visible.
                  </div>
                </div>
              </div>
              <div>
                <MEyebrow style={{ marginBottom: 10 }}>ALL CLIPS · {filter}</MEyebrow>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {clips.length === 0 ? (
                    <div
                      style={{
                        fontFamily: TYPE.body,
                        fontSize: 13,
                        color: BRAND.indigoMute,
                        padding: '10px 12px',
                        border: `1px dashed ${BRAND.line}`,
                        borderRadius: 4,
                        textAlign: 'center',
                      }}
                    >
                      No clips for this filter.
                    </div>
                  ) : (
                    clips.map(h => <HighlightCard key={h.id} h={h} compact />)
                  )}
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <button type="button" style={mcButtons.ghost}>
                    Share reel ↗
                  </button>
                  <button
                    type="button"
                    style={mcButtons.primary}
                    onClick={() => router.push('/coach/web/match/session_010')}
                  >
                    Open match →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '40px 26px',
                textAlign: 'center',
                fontFamily: TYPE.body,
                fontSize: 14,
                color: BRAND.indigoMute,
              }}
            >
              Pick a ready match from the calendar above to see its clips.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function filterMatch(ev: string, filter: Filter): boolean {
  switch (filter) {
    case 'GOALS':   return ev === 'GOAL'
    case 'KEY':     return ev === 'KEY'
    case 'TACKLES': return ev === 'TACKLE'
    case 'SAVES':   return ev === 'SAVE'
    case 'SPRINTS': return ev === 'SPRINT'
    default:        return true
  }
}

function parseSessionParam(p: string | null): number | null {
  if (!p) return null
  const m = p.match(/feb(\d{1,2})/i)
  if (!m) return null
  const day = parseInt(m[1]!, 10)
  if (!Number.isFinite(day) || day < 1 || day > 28) return null
  return day
}
