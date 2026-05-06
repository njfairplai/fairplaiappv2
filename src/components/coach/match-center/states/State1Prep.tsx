'use client'

import { useEffect, useMemo, useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { MATCH_CENTER_ROSTER } from '@/lib/match-center'
import {
  readPrepAttendance,
  writePrepAttendance,
  readPrepJerseys,
  writePrepJerseys,
  readPrepDraft,
  writePrepDraft,
  readPrepConfirmation,
  writePrepConfirmation,
  writeSessionClassify,
  type AttendanceMap,
  type JerseyMap,
} from '@/lib/match-center-state'
import {
  Card,
  MEyebrow,
  MDisplay,
  MStatusPill,
  MiniAvatar,
  mcButtons,
} from '../atoms'

/* State 1 — upcoming match prep with attendance / lineup / confirm tabs.
 *
 * All four footer CTAs and every row-level edit (checkbox toggle, jersey
 * input) persist to localStorage via match-center-state helpers. The
 * header status pill flips PREP → CONFIRMED once the coach hits Confirm
 * prep → so a refresh shows the new state immediately. */

interface State1PrepProps {
  /** Stable session identifier — drives every localStorage key. */
  sessionId: string
  onToast: (message: string) => void
  /** Called when the coach reclassifies (Mark as drills only) so the
   *  parent can swap the contextual pane to a different state. */
  onReclassify: (newStatus: 'drills') => void
}

export function State1Prep({ sessionId, onToast, onReclassify }: State1PrepProps) {
  // Hydrate from localStorage on mount. SSR-safe — helpers return empty
  // values when window is undefined.
  const [tab, setTab] = useState<'attendance' | 'lineup' | 'confirm'>('attendance')
  const [attendance, setAttendance] = useState<AttendanceMap>({})
  const [jerseys, setJerseys] = useState<JerseyMap>({})
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    // SSR-safe localStorage hydration: server renders with empty state,
    // client mounts and reads persisted values. Synchronous setState in
    // the effect body is the right shape for this — useSyncExternalStore
    // is overkill for write-then-read-once-per-session-id.
    /* eslint-disable react-hooks/set-state-in-effect */
    setAttendance(readPrepAttendance(sessionId))
    setJerseys(readPrepJerseys(sessionId))
    const draft = readPrepDraft(sessionId)
    if (draft?.tab) setTab(draft.tab)
    setConfirmed(readPrepConfirmation(sessionId) != null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sessionId])

  // Effective attendance for the header counter — falls back to the
  // mock roster's `present` flag when the coach hasn't toggled.
  const presentCount = useMemo(() => {
    return MATCH_CENTER_ROSTER.filter(p => {
      const override = attendance[p.num]
      return override !== undefined ? override : p.present
    }).length
  }, [attendance])
  const totalCount = MATCH_CENTER_ROSTER.length

  function setPresence(num: number, present: boolean) {
    const next = { ...attendance, [num]: present }
    setAttendance(next)
    writePrepAttendance(sessionId, next)
  }
  function setJersey(originalNum: number, newNum: number) {
    if (newNum === originalNum) {
      const next = { ...jerseys }
      delete next[originalNum]
      setJerseys(next)
      writePrepJerseys(sessionId, next)
      return
    }
    const next = { ...jerseys, [originalNum]: newNum }
    setJerseys(next)
    writePrepJerseys(sessionId, next)
  }
  function markAllPresent() {
    const next: AttendanceMap = {}
    for (const p of MATCH_CENTER_ROSTER) next[p.num] = true
    setAttendance(next)
    writePrepAttendance(sessionId, next)
    onToast('All marked present')
  }
  function saveDraft() {
    writePrepDraft(sessionId, { tab, savedAt: new Date().toISOString() })
    onToast('Draft saved')
  }
  function confirmPrep() {
    writePrepConfirmation(sessionId, {
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    })
    setConfirmed(true)
    onToast('Prep confirmed — see you at kickoff')
  }
  function markAsDrills() {
    writeSessionClassify(sessionId, 'drills')
    onToast('Marked as drills only')
    onReclassify('drills')
  }

  return (
    <Card style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '20px 26px',
          borderBottom: `1px solid ${BRAND.line}`,
          background: confirmed ? BRAND.yellowSoft : 'rgba(235,77,109,0.10)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {confirmed ? (
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
              ✓ CONFIRMED
            </span>
          ) : (
            <MStatusPill status="prep" />
          )}
          <span
            style={{
              color: BRAND.indigoMute,
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            VS AL WASL ACADEMY · SAT 28 FEB · 15:00 · PITCH 1
          </span>
        </div>
        <MDisplay size={36} style={{ marginTop: 10 }}>
          {confirmed ? 'Matchday is set.' : 'Plan your matchday'}
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            marginTop: 6,
          }}
        >
          Confirm attendance and lineup. Bib colours don&apos;t apply for competitive matches.
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${BRAND.line}`,
          background: BRAND.sand,
          padding: '0 26px',
          flexWrap: 'wrap',
        }}
      >
        {(['attendance', 'lineup', 'confirm'] as const).map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              position: 'relative',
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: tab === t ? BRAND.indigo : BRAND.indigoMute,
              textTransform: 'uppercase',
            }}
          >
            {String(i + 1).padStart(2, '0')} · {t}
            {tab === t && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: BRAND.indigo,
                }}
              />
            )}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span
          style={{
            alignSelf: 'center',
            fontFamily: TYPE.mono,
            fontSize: 10,
            color: BRAND.indigoMute,
            letterSpacing: '0.18em',
          }}
        >
          {presentCount} PRESENT · {totalCount - presentCount} OUT
        </span>
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 26px', minHeight: 380 }}>
        {tab === 'attendance' && (
          <PrepAttendance
            attendance={attendance}
            jerseys={jerseys}
            onPresenceChange={setPresence}
            onJerseyChange={setJersey}
            onMarkAllPresent={markAllPresent}
          />
        )}
        {tab === 'lineup' && <PrepLineup />}
        {tab === 'confirm' && <PrepConfirm presentCount={presentCount} totalCount={totalCount} />}
      </div>

      {/* Footer CTA bar */}
      <div
        style={{
          padding: '14px 26px',
          borderTop: `1px solid ${BRAND.line}`,
          background: BRAND.sand,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button type="button" style={mcButtons.text} onClick={markAsDrills}>
          Mark as drills only ↗
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" style={mcButtons.ghost} onClick={saveDraft}>
          Save draft
        </button>
        <button
          type="button"
          style={{
            ...mcButtons.primary,
            opacity: confirmed ? 0.6 : 1,
            cursor: confirmed ? 'default' : 'pointer',
          }}
          onClick={confirmed ? undefined : confirmPrep}
          disabled={confirmed}
        >
          {confirmed ? 'Confirmed ✓' : 'Confirm prep →'}
        </button>
      </div>
    </Card>
  )
}

interface PrepAttendanceProps {
  attendance: AttendanceMap
  jerseys: JerseyMap
  onPresenceChange: (num: number, present: boolean) => void
  onJerseyChange: (originalNum: number, newNum: number) => void
  onMarkAllPresent: () => void
}

function PrepAttendance({
  attendance,
  jerseys,
  onPresenceChange,
  onJerseyChange,
  onMarkAllPresent,
}: PrepAttendanceProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MEyebrow>ROSTER · 16 PLAYERS</MEyebrow>
        <button type="button" style={mcButtons.text} onClick={onMarkAllPresent}>
          Mark all present →
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 24px',
          border: `1px solid ${BRAND.line}`,
          borderRadius: 4,
          background: '#fff',
        }}
      >
        {MATCH_CENTER_ROSTER.map((p, i) => {
          const present = attendance[p.num] !== undefined ? attendance[p.num] : p.present
          const jerseyValue = jerseys[p.num] ?? p.num
          return (
            <div
              key={p.num}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 38px 60px 28px',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderBottom:
                  i < MATCH_CENTER_ROSTER.length - 2 ? `1px solid ${BRAND.line}` : 'none',
              }}
            >
              <MiniAvatar num={p.num} />
              <div
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: BRAND.indigo,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.name}
              </div>
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: BRAND.indigoMute,
                  border: `1px solid ${BRAND.line}`,
                  padding: '2px 4px',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                {p.pos}
              </span>
              <input
                key={`${p.num}-${jerseyValue}`}
                defaultValue={jerseyValue}
                onBlur={e => {
                  const v = parseInt(e.currentTarget.value, 10)
                  if (Number.isFinite(v) && v > 0) onJerseyChange(p.num, v)
                  else e.currentTarget.value = String(jerseyValue)
                }}
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: BRAND.indigo,
                  border: `1px solid ${BRAND.line}`,
                  borderRadius: 3,
                  padding: '3px 6px',
                  width: 50,
                  textAlign: 'center',
                  background: BRAND.paper,
                }}
              />
              <button
                type="button"
                onClick={() => onPresenceChange(p.num, !present)}
                aria-pressed={present}
                aria-label={`${p.name} · ${present ? 'present' : 'absent'}`}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  border: `1.5px solid ${present ? BRAND.indigo : BRAND.line}`,
                  background: present ? BRAND.indigo : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.sand,
                  fontSize: 12,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {present && '✓'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const FORMATION: [number, number, string, number, string?][] = [
  [0.06, 0.5, 'GK', 1, BRAND.yellow],
  [0.22, 0.18, 'LB', 5],
  [0.22, 0.40, 'CB', 4],
  [0.22, 0.60, 'CB', 3],
  [0.22, 0.82, 'RB', 2],
  [0.45, 0.28, 'CM', 6],
  [0.45, 0.50, 'CM', 8],
  [0.45, 0.72, 'CAM', 10],
  [0.72, 0.20, 'LW', 11],
  [0.72, 0.50, 'ST', 9],
  [0.72, 0.80, 'RW', 7],
]

function PrepLineup() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <MEyebrow>FORMATION · 4-3-3</MEyebrow>
        <button type="button" style={mcButtons.text}>
          Change formation ↓
        </button>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 320,
          background: BRAND.indigo,
          borderRadius: 6,
          overflow: 'hidden',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 40px, rgba(255,255,255,0.07) 40px 80px)',
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
          preserveAspectRatio="none"
        >
          <rect
            x="8"
            y="8"
            width="calc(100% - 16px)"
            height="calc(100% - 16px)"
            fill="none"
            stroke="rgba(238,228,200,0.4)"
            strokeWidth={1.5}
          />
          <line
            x1="50%"
            y1="8"
            x2="50%"
            y2="calc(100% - 8px)"
            stroke="rgba(238,228,200,0.4)"
            strokeWidth={1.5}
          />
          <circle cx="50%" cy="50%" r="36" fill="none" stroke="rgba(238,228,200,0.4)" strokeWidth={1.5} />
        </svg>
        {FORMATION.map(([x, y, pos, num, color], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: color || BRAND.sand,
                color: BRAND.indigo,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: TYPE.display,
                fontSize: 16,
                fontWeight: 700,
                border: `2px solid ${BRAND.paper}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontFamily: TYPE.mono,
                fontSize: 8.5,
                letterSpacing: '0.18em',
                color: BRAND.sand,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              {pos}
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            fontFamily: TYPE.mono,
            fontSize: 9,
            letterSpacing: '0.18em',
            color: 'rgba(238,228,200,0.55)',
          }}
        >
          DRAG PRESENT PLAYERS INTO SLOTS · OR SKIP TO LET AI INFER
        </div>
      </div>
    </div>
  )
}

function PrepConfirm({
  presentCount,
  totalCount,
}: {
  presentCount: number
  totalCount: number
}) {
  const rows: [string, string][] = [
    ['Opponent', 'Al Wasl Academy'],
    ['Date · time', 'Sat 28 Feb · 15:00'],
    ['Pitch', 'Pitch 1 · MAK Academy'],
    ['Attendees', `${presentCount} of ${totalCount} present`],
    ['Formation', '4-3-3 (set)'],
    ['Bibs', '— (competitive match)'],
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <MEyebrow>SUMMARY</MEyebrow>
        <div
          style={{
            marginTop: 12,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 4,
            background: '#fff',
          }}
        >
          {rows.map(([k, v], i) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: i < rows.length - 1 ? `1px solid ${BRAND.line}` : 'none',
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
        <MEyebrow>WHAT HAPPENS NEXT</MEyebrow>
        <div
          style={{
            marginTop: 12,
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            lineHeight: 1.55,
          }}
        >
          On Saturday, record the match using the camera. Footage uploads automatically when
          you&apos;re back on Wi-Fi. Analysis takes ~2 hours; we&apos;ll surface a coloured
          composite + clips on this page when ready.
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: BRAND.yellowSoft,
            borderRadius: 4,
          }}
        >
          <MEyebrow color={BRAND.indigo}>★ WHILE YOU WAIT</MEyebrow>
          <div
            style={{
              fontFamily: TYPE.body,
              fontSize: 12.5,
              marginTop: 6,
              color: BRAND.indigo,
              lineHeight: 1.5,
            }}
          >
            You can scrub past matches in the calendar above. Try Feb 17 — Stratford E. just
            finished processing.
          </div>
        </div>
      </div>
    </div>
  )
}
