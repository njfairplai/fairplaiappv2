'use client'

import { useEffect, useMemo, useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { MATCH_CENTER_ROSTER, type MatchCenterKind } from '@/lib/match-center'
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
 * Footer CTAs are tab-aware: walking left-to-right uses Next →, the
 * dedicated Confirm prep → CTA only fires on the Confirm tab. Save
 * draft is always available. The Lineup tab branches:
 *
 *   - Match → 4-3-3 starting-XI on a horizontal pitch
 *   - Training match → team A / team B picker
 *
 * All edits persist to localStorage via match-center-state helpers so
 * the surface walks like a real product.
 */

interface State1PrepProps {
  /** Stable session identifier — drives every localStorage key. */
  sessionId: string
  /** Session kind drives the lineup branch. */
  kind: MatchCenterKind
  /** Header title. */
  opponent: string | null
  /** Header date/time/pitch line. */
  metaLine: string
  onToast: (message: string) => void
  onReclassify: (newStatus: 'drills') => void
}

type TabId = 'attendance' | 'lineup' | 'confirm'
const TAB_ORDER: TabId[] = ['attendance', 'lineup', 'confirm']

export function State1Prep({
  sessionId,
  kind,
  opponent,
  metaLine,
  onToast,
  onReclassify,
}: State1PrepProps) {
  const [tab, setTab] = useState<TabId>('attendance')
  const [attendance, setAttendance] = useState<AttendanceMap>({})
  const [jerseys, setJerseys] = useState<JerseyMap>({})
  const [confirmed, setConfirmed] = useState(false)
  const [teamAssignments, setTeamAssignments] = useState<Record<number, 'A' | 'B'>>({})

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setAttendance(readPrepAttendance(sessionId))
    setJerseys(readPrepJerseys(sessionId))
    const draft = readPrepDraft(sessionId)
    if (draft?.tab) setTab(draft.tab)
    setConfirmed(readPrepConfirmation(sessionId) != null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sessionId])

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
  function setTeam(playerNum: number, team: 'A' | 'B') {
    setTeamAssignments(t => ({ ...t, [playerNum]: team }))
  }
  function autoSplitTeams() {
    const present = MATCH_CENTER_ROSTER.filter(p => {
      const override = attendance[p.num]
      return override !== undefined ? override : p.present
    })
    const next: Record<number, 'A' | 'B'> = {}
    present.forEach((p, i) => {
      next[p.num] = i % 2 === 0 ? 'A' : 'B'
    })
    setTeamAssignments(next)
    onToast('Teams auto-split')
  }

  const tabIdx = TAB_ORDER.indexOf(tab)
  const isFirstTab = tabIdx === 0
  const isLastTab = tabIdx === TAB_ORDER.length - 1

  function goNext() {
    if (!isLastTab) setTab(TAB_ORDER[tabIdx + 1]!)
  }
  function goBack() {
    if (!isFirstTab) setTab(TAB_ORDER[tabIdx - 1]!)
  }

  const isTraining = kind === 'training'
  const headerTitle = confirmed
    ? 'Matchday is set.'
    : isTraining
    ? 'Plan your training session'
    : 'Plan your matchday'
  const headerSub = isTraining
    ? 'Confirm attendance and split into Team A / Team B.'
    : "Confirm attendance and lineup. Bib colours don't apply for competitive matches."

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
            {(opponent ? `VS ${opponent.toUpperCase()} · ` : '') + metaLine}
          </span>
        </div>
        <MDisplay size={36} style={{ marginTop: 10 }}>
          {headerTitle}
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            marginTop: 6,
          }}
        >
          {headerSub}
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
        {TAB_ORDER.map((t, i) => (
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
            {String(i + 1).padStart(2, '0')} · {t === 'lineup' && isTraining ? 'TEAMS' : t}
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
        {tab === 'lineup' && isTraining && (
          <PrepTeams
            attendance={attendance}
            assignments={teamAssignments}
            onAssign={setTeam}
            onAutoSplit={autoSplitTeams}
          />
        )}
        {tab === 'lineup' && !isTraining && <PrepLineup />}
        {tab === 'confirm' && (
          <PrepConfirm
            presentCount={presentCount}
            totalCount={totalCount}
            isTraining={isTraining}
            opponent={opponent}
          />
        )}
      </div>

      {/* Footer CTA bar — tab-aware */}
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
        {!isTraining && (
          <button type="button" style={mcButtons.text} onClick={markAsDrills}>
            Mark as drills only ↗
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button type="button" style={mcButtons.ghost} onClick={saveDraft}>
          Save draft
        </button>
        {!isFirstTab && (
          <button type="button" style={mcButtons.ghost} onClick={goBack}>
            ← Back
          </button>
        )}
        {!isLastTab ? (
          <button type="button" style={mcButtons.primary} onClick={goNext}>
            Next →
          </button>
        ) : (
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
        )}
      </div>
    </Card>
  )
}

// ─── Attendance tab ─────────────────────────────────────────────────

interface PrepAttendanceProps {
  attendance: AttendanceMap
  jerseys: JerseyMap
  onPresenceChange: (num: number, present: boolean) => void
  onJerseyChange: (originalNum: number, newNum: number) => void
  onMarkAllPresent: () => void
}

const ATT_COL_TEMPLATE = '28px 1fr 38px 60px 28px'

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
          border: `1px solid ${BRAND.line}`,
          borderRadius: 4,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Two-column header row mirrors the data grid below. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 24px',
            background: BRAND.sand,
            borderBottom: `1px solid ${BRAND.line}`,
          }}
        >
          {[0, 1].map(col => (
            <div
              key={col}
              style={{
                display: 'grid',
                gridTemplateColumns: ATT_COL_TEMPLATE,
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
              }}
            >
              <span />
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: BRAND.indigoMute,
                }}
              >
                PLAYER
              </span>
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: BRAND.indigoMute,
                  textAlign: 'center',
                }}
              >
                POS
              </span>
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: BRAND.indigoMute,
                  textAlign: 'center',
                }}
              >
                JERSEY
              </span>
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: BRAND.indigoMute,
                  textAlign: 'center',
                }}
              >
                IN
              </span>
            </div>
          ))}
        </div>
        {/* Data grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 24px',
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
                  gridTemplateColumns: ATT_COL_TEMPLATE,
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
    </div>
  )
}

// ─── Lineup tab (match) ─────────────────────────────────────────────

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
        <MEyebrow>STARTING XI · 4-3-3</MEyebrow>
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

// ─── Lineup tab (training match) — Team A vs Team B ─────────────────

interface PrepTeamsProps {
  attendance: AttendanceMap
  assignments: Record<number, 'A' | 'B'>
  onAssign: (playerNum: number, team: 'A' | 'B') => void
  onAutoSplit: () => void
}

function PrepTeams({ attendance, assignments, onAssign, onAutoSplit }: PrepTeamsProps) {
  const present = MATCH_CENTER_ROSTER.filter(p => {
    const override = attendance[p.num]
    return override !== undefined ? override : p.present
  })
  const teamA = present.filter(p => assignments[p.num] === 'A')
  const teamB = present.filter(p => assignments[p.num] === 'B')
  const unassigned = present.filter(p => !assignments[p.num])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MEyebrow>SPLIT INTO TEAM A / TEAM B · {present.length} PRESENT</MEyebrow>
        <button type="button" style={mcButtons.text} onClick={onAutoSplit}>
          Auto split →
        </button>
      </div>

      {unassigned.length > 0 && (
        <>
          <MEyebrow color={BRAND.coral} style={{ marginBottom: 6 }}>
            UNASSIGNED · {unassigned.length}
          </MEyebrow>
          <TeamGrid players={unassigned} assignments={assignments} onAssign={onAssign} />
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
        <div>
          <MEyebrow>TEAM A · INDIGO · {teamA.length}</MEyebrow>
          <div style={{ marginTop: 8 }}>
            <TeamGrid players={teamA} assignments={assignments} onAssign={onAssign} />
          </div>
        </div>
        <div>
          <MEyebrow color={BRAND.coral}>TEAM B · CORAL · {teamB.length}</MEyebrow>
          <div style={{ marginTop: 8 }}>
            <TeamGrid players={teamB} assignments={assignments} onAssign={onAssign} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamGrid({
  players,
  assignments,
  onAssign,
}: {
  players: typeof MATCH_CENTER_ROSTER
  assignments: Record<number, 'A' | 'B'>
  onAssign: (playerNum: number, team: 'A' | 'B') => void
}) {
  if (players.length === 0)
    return (
      <div
        style={{
          fontFamily: TYPE.body,
          fontSize: 12,
          color: BRAND.indigoMute,
          padding: '10px 12px',
          border: `1px dashed ${BRAND.line}`,
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        No players yet.
      </div>
    )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {players.map(p => {
        const team = assignments[p.num]
        return (
          <div
            key={p.num}
            style={{
              padding: '8px 10px',
              background: '#fff',
              border: `1px solid ${BRAND.line}`,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <MiniAvatar num={p.num} />
            <div
              style={{
                flex: 1,
                minWidth: 0,
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
            <div style={{ display: 'flex', gap: 2 }}>
              {(['A', 'B'] as const).map(t => {
                const active = team === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onAssign(p.num, t)}
                    style={{
                      padding: '3px 8px',
                      border: active ? 'none' : `1px solid ${BRAND.line}`,
                      background: active ? (t === 'A' ? BRAND.indigo : BRAND.coral) : 'transparent',
                      color: active ? BRAND.sand : BRAND.indigo,
                      fontFamily: TYPE.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Confirm tab ────────────────────────────────────────────────────

function PrepConfirm({
  presentCount,
  totalCount,
  isTraining,
  opponent,
}: {
  presentCount: number
  totalCount: number
  isTraining: boolean
  opponent: string | null
}) {
  const rows: [string, string][] = [
    ['Type', isTraining ? 'Training match' : 'Match'],
    ['Opponent', opponent ?? '—'],
    ['Attendees', `${presentCount} of ${totalCount} present`],
    ['Setup', isTraining ? 'Team A vs Team B' : '4-3-3 starting XI'],
    ['Bibs', isTraining ? 'Indigo / Coral' : '— (competitive)'],
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
          On the day, record using the camera. Footage uploads automatically when you&apos;re
          back on Wi-Fi. Analysis takes ~2 hours; we&apos;ll surface a coloured composite +
          clips on this page when ready.
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: BRAND.yellowSoft,
            borderRadius: 4,
          }}
        >
          <MEyebrow color={BRAND.indigo}>★ TIP</MEyebrow>
          <div
            style={{
              fontFamily: TYPE.body,
              fontSize: 12.5,
              marginTop: 6,
              color: BRAND.indigo,
              lineHeight: 1.5,
            }}
          >
            Click ← Back to revisit attendance or {isTraining ? 'team split' : 'lineup'}.
            Save draft any time — your edits persist on this device.
          </div>
        </div>
      </div>
    </div>
  )
}
