'use client'

import { useEffect, useMemo, useState } from 'react'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/hooks/useIsMobile'
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
  readLineup,
  writeLineup,
  writeSessionClassify,
  LINEUP_FORMAT_TARGET,
  type AttendanceMap,
  type JerseyMap,
  type LineupFormat,
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
  /** Fired when the coach confirms prep — lets the parent rebuild
   *  the confirmed-prep set so the calendar flips PREP→PREPPED. */
  onConfirmedChange?: () => void
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
  onConfirmedChange,
}: State1PrepProps) {
  const [tab, setTab] = useState<TabId>('attendance')
  const [attendance, setAttendance] = useState<AttendanceMap>({})
  const [jerseys, setJerseys] = useState<JerseyMap>({})
  const [confirmed, setConfirmed] = useState(false)
  const [teamAssignments, setTeamAssignments] = useState<Record<number, 'A' | 'B'>>({})
  const [format, setFormat] = useState<LineupFormat>('11v11')
  const [benched, setBenched] = useState<Set<number>>(new Set())

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setAttendance(readPrepAttendance(sessionId))
    setJerseys(readPrepJerseys(sessionId))
    const draft = readPrepDraft(sessionId)
    if (draft?.tab) setTab(draft.tab)
    setConfirmed(readPrepConfirmation(sessionId) != null)
    const stored = readLineup(sessionId)
    setFormat(stored.format)
    setBenched(new Set(stored.benched))
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
    onConfirmedChange?.()
  }
  function markAsDrills() {
    writeSessionClassify(sessionId, 'drills')
    onToast('Marked as drills only')
    onReclassify('drills')
  }
  function setTeam(playerNum: number, team: 'A' | 'B') {
    setTeamAssignments(t => ({ ...t, [playerNum]: team }))
  }
  function setLineupFormat(f: LineupFormat) {
    setFormat(f)
    writeLineup(sessionId, { format: f, benched: Array.from(benched) })
  }
  function toggleBench(num: number) {
    const next = new Set(benched)
    if (next.has(num)) next.delete(num)
    else next.add(num)
    setBenched(next)
    writeLineup(sessionId, { format, benched: Array.from(next) })
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
    <Card className="p-0">
      {/* Header */}
      <div
        className={cn(
          'px-[26px] py-5 border-b border-brand-line',
          confirmed && 'bg-brand-yellow-soft',
        )}
        style={confirmed ? undefined : { background: 'rgba(235,77,109,0.10)' }}
      >
        <div className="flex items-center gap-[10px] flex-wrap">
          {confirmed ? (
            <span className="bg-brand-yellow text-brand-indigo font-fragment text-[9px] font-bold tracking-[0.18em] px-[7px] py-[3px] rounded-[3px]">
              ✓ CONFIRMED
            </span>
          ) : (
            <MStatusPill status="prep" />
          )}
          <span className="text-brand-indigo-mute font-fragment text-[10.5px] tracking-[0.18em] font-bold">
            {(opponent ? `VS ${opponent.toUpperCase()} · ` : '') + metaLine}
          </span>
        </div>
        <MDisplay size={36} className="mt-[10px]">
          {headerTitle}
        </MDisplay>
        <div className="font-satoshi text-[13px] text-brand-indigo-mid mt-[6px]">
          {headerSub}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-brand-line bg-brand-sand px-[26px] flex-wrap">
        {TAB_ORDER.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-[18px] py-3 border-none bg-transparent cursor-pointer relative font-fragment text-[10.5px] font-bold tracking-[0.18em] uppercase',
              tab === t ? 'text-brand-indigo' : 'text-brand-indigo-mute',
            )}
          >
            {String(i + 1).padStart(2, '0')} · {t === 'lineup' && isTraining ? 'TEAMS' : t}
            {tab === t && (
              <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-brand-indigo" />
            )}
          </button>
        ))}
        <span className="flex-1" />
        <span className="self-center font-fragment text-[10px] text-brand-indigo-mute tracking-[0.18em]">
          {presentCount} PRESENT · {totalCount - presentCount} OUT
        </span>
      </div>

      {/* Tab content */}
      <div className="px-[26px] py-5 min-h-[380px]">
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
        {tab === 'lineup' && !isTraining && (
          <PrepLineup
            attendance={attendance}
            format={format}
            benched={benched}
            onFormatChange={setLineupFormat}
            onToggleBench={toggleBench}
          />
        )}
        {tab === 'confirm' && (
          <PrepConfirm
            presentCount={presentCount}
            totalCount={totalCount}
            isTraining={isTraining}
            opponent={opponent}
            format={format}
            startingCount={presentCount - benched.size}
          />
        )}
      </div>

      {/* Footer CTA bar — tab-aware */}
      <div className="px-[26px] py-[14px] border-t border-brand-line bg-brand-sand flex items-center gap-[10px] flex-wrap">
        {!isTraining && (
          <button type="button" style={mcButtons.text} onClick={markAsDrills}>
            Mark as drills only ↗
          </button>
        )}
        <span className="flex-1" />
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

/** Reusable column-header label inside the attendance / lineup grids. */
function ColHeader({ children, centered }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <span
      className={cn(
        'font-fragment text-[9px] font-bold tracking-[0.18em] text-brand-indigo-mute',
        centered && 'text-center',
      )}
    >
      {children}
    </span>
  )
}

function PrepAttendance({
  attendance,
  jerseys,
  onPresenceChange,
  onJerseyChange,
  onMarkAllPresent,
}: PrepAttendanceProps) {
  const isMobile = useIsMobile()
  return (
    <div>
      <div className="flex items-center justify-between mb-[10px] flex-wrap gap-[10px]">
        <MEyebrow>ROSTER · 16 PLAYERS</MEyebrow>
        <button type="button" style={mcButtons.text} onClick={onMarkAllPresent}>
          Mark all present →
        </button>
      </div>
      <div className="border border-brand-line rounded-[4px] bg-white overflow-hidden">
        {/* Two-column header row mirrors the data grid below. Single
         *  column on mobile so each row gets the full width and the
         *  inputs don't crash into each other. */}
        <div
          className={cn(
            'grid bg-brand-sand border-b border-brand-line',
            isMobile ? 'grid-cols-1' : 'grid-cols-2',
          )}
          style={{ gap: '0 24px' }}
        >
          {(isMobile ? [0] : [0, 1]).map(col => (
            <div
              key={col}
              className="grid items-center gap-[10px] px-3 py-2"
              style={{ gridTemplateColumns: ATT_COL_TEMPLATE }}
            >
              <span />
              <ColHeader>PLAYER</ColHeader>
              <ColHeader centered>POS</ColHeader>
              <ColHeader centered>JERSEY</ColHeader>
              <ColHeader centered>IN</ColHeader>
            </div>
          ))}
        </div>
        {/* Data grid */}
        <div
          className={cn('grid', isMobile ? 'grid-cols-1' : 'grid-cols-2')}
          style={{ gap: '0 24px' }}
        >
          {MATCH_CENTER_ROSTER.map((p, i) => {
            const present = attendance[p.num] !== undefined ? attendance[p.num] : p.present
            const jerseyValue = jerseys[p.num] ?? p.num
            return (
              <div
                key={p.num}
                className={cn(
                  'grid items-center gap-[10px] px-3 py-2',
                  i < MATCH_CENTER_ROSTER.length - 2 && 'border-b border-brand-line',
                )}
                style={{ gridTemplateColumns: ATT_COL_TEMPLATE }}
              >
                <MiniAvatar num={p.num} />
                <div className="font-satoshi text-[12.5px] font-semibold text-brand-indigo whitespace-nowrap overflow-hidden text-ellipsis">
                  {p.name}
                </div>
                <span className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute border border-brand-line px-1 py-px rounded-[2px] text-center">
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
                  className="font-fragment text-[11px] font-bold text-brand-indigo border border-brand-line rounded-[3px] px-[6px] py-[3px] w-[50px] text-center bg-brand-paper"
                />
                <button
                  type="button"
                  onClick={() => onPresenceChange(p.num, !present)}
                  aria-pressed={present}
                  aria-label={`${p.name} · ${present ? 'present' : 'absent'}`}
                  className={cn(
                    'w-[18px] h-[18px] rounded-[3px] flex items-center justify-center text-brand-sand text-xs leading-none cursor-pointer p-0',
                    present
                      ? 'bg-brand-indigo border-[1.5px] border-brand-indigo'
                      : 'bg-transparent border-[1.5px] border-brand-line',
                  )}
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

// ─── Lineup tab (match) — start / bench mirror of attendance ────────
//
// The previous cut showed a per-player position picker (LB / CB / RB /
// CDM / CM / CAM / LW / ST / RW / BENCH) but each player already has
// a primary position in the roster — the coach doesn't need to assign
// granular positions every matchday. The actual question is "who's
// starting and who's benched?"
//
// Layout mirrors the attendance grid: a single starting checkbox per
// row, primary position shown read-only. A format selector at the top
// (5v5 / 7v7 / 9v9 / 11v11) sets the target starting count; the tally
// goes coral when the coach is over the limit, indigo at/under.
//
// Group breakdown (1 GK · 4 DEF · 3 MID · 3 ATT) is derived from each
// player's `pos` field via positionGroup() so the coach can sense-check
// the shape without locking a formation.

const FORMAT_OPTIONS: LineupFormat[] = ['5v5', '7v7', '9v9', '11v11']

function positionGroup(pos: string): 'GK' | 'DEF' | 'MID' | 'ATT' {
  if (pos === 'GK') return 'GK'
  if (pos === 'LB' || pos === 'CB' || pos === 'RB' || pos === 'LWB' || pos === 'RWB')
    return 'DEF'
  if (pos === 'CDM' || pos === 'CM' || pos === 'CAM' || pos === 'LM' || pos === 'RM')
    return 'MID'
  return 'ATT'
}

interface PrepLineupProps {
  attendance: AttendanceMap
  format: LineupFormat
  benched: Set<number>
  onFormatChange: (f: LineupFormat) => void
  onToggleBench: (num: number) => void
}

function PrepLineup({
  attendance,
  format,
  benched,
  onFormatChange,
  onToggleBench,
}: PrepLineupProps) {
  const isMobile = useIsMobile()
  const present = MATCH_CENTER_ROSTER.filter(p => {
    const override = attendance[p.num]
    return override !== undefined ? override : p.present
  })
  const starters = present.filter(p => !benched.has(p.num))
  const groupTally = { GK: 0, DEF: 0, MID: 0, ATT: 0 }
  for (const p of starters) groupTally[positionGroup(p.pos)]++

  const target = LINEUP_FORMAT_TARGET[format]
  const startingCount = starters.length
  const tallyOver = startingCount > target
  const tallyExact = startingCount === target

  const lineupCols = isMobile
    ? '24px 1fr 44px 44px 22px'
    : '28px 1fr 60px 60px 28px'

  return (
    <div>
      {/* Format selector + tally header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex items-center gap-[10px] flex-wrap">
          <MEyebrow>FORMAT</MEyebrow>
          <div className="flex gap-1">
            {FORMAT_OPTIONS.map(f => {
              const active = f === format
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFormatChange(f)}
                  className={cn(
                    'px-[10px] py-[5px] font-fragment text-[9.5px] font-bold tracking-[0.18em] rounded-[3px] cursor-pointer uppercase',
                    active
                      ? 'border-none bg-brand-indigo text-brand-sand'
                      : 'border border-brand-line bg-transparent text-brand-indigo',
                  )}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-baseline gap-[14px] flex-wrap">
          <span
            className={cn(
              'font-fragment text-[10.5px] font-bold tracking-[0.18em]',
              tallyOver
                ? 'text-brand-coral'
                : tallyExact
                ? 'text-brand-indigo'
                : 'text-brand-indigo-mute',
            )}
          >
            STARTING {startingCount}/{target}
            {tallyOver && ' · OVER'}
          </span>
          <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            {groupTally.GK} GK · {groupTally.DEF} DEF · {groupTally.MID} MID ·{' '}
            {groupTally.ATT} ATT
          </span>
        </div>
      </div>

      {/* List */}
      <div className="border border-brand-line rounded-[4px] bg-white overflow-hidden">
        {/* Header row */}
        <div
          className="grid items-center gap-3 px-3 py-2 bg-brand-sand border-b border-brand-line"
          style={{ gridTemplateColumns: lineupCols }}
        >
          <span />
          <ColHeader>PLAYER</ColHeader>
          <ColHeader centered>POS</ColHeader>
          <ColHeader centered>GROUP</ColHeader>
          <ColHeader centered>START</ColHeader>
        </div>

        {present.length === 0 ? (
          <div className="px-3 py-5 text-center font-satoshi text-[13px] text-brand-indigo-mute">
            Mark some players present in the Attendance tab first.
          </div>
        ) : (
          present.map((p, i) => {
            const isStarting = !benched.has(p.num)
            const group = positionGroup(p.pos)
            return (
              <div
                key={p.num}
                className={cn(
                  'grid items-center gap-3 px-3 py-2',
                  i < present.length - 1 && 'border-b border-brand-line',
                )}
                style={{
                  gridTemplateColumns: lineupCols,
                  opacity: isStarting ? 1 : 0.5,
                }}
              >
                <MiniAvatar num={p.num} />
                <div className="font-satoshi text-[12.5px] font-semibold text-brand-indigo whitespace-nowrap overflow-hidden text-ellipsis">
                  {p.name}
                </div>
                <span className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute border border-brand-line px-1 py-px rounded-[2px] text-center">
                  {p.pos}
                </span>
                <span className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo bg-brand-line-soft px-1 py-px rounded-[2px] text-center">
                  {group}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleBench(p.num)}
                  aria-pressed={isStarting}
                  aria-label={`${p.name} · ${isStarting ? 'starting' : 'benched'}`}
                  className={cn(
                    'w-[18px] h-[18px] rounded-[3px] flex items-center justify-center text-brand-sand text-xs leading-none cursor-pointer p-0',
                    isStarting
                      ? 'bg-brand-indigo border-[1.5px] border-brand-indigo'
                      : 'bg-transparent border-[1.5px] border-brand-line',
                  )}
                >
                  {isStarting && '✓'}
                </button>
              </div>
            )
          })
        )}
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
  const isMobile = useIsMobile()
  const present = MATCH_CENTER_ROSTER.filter(p => {
    const override = attendance[p.num]
    return override !== undefined ? override : p.present
  })
  const teamA = present.filter(p => assignments[p.num] === 'A')
  const teamB = present.filter(p => assignments[p.num] === 'B')
  const unassigned = present.filter(p => !assignments[p.num])

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-[10px]">
        <MEyebrow>SPLIT INTO TEAM A / TEAM B · {present.length} PRESENT</MEyebrow>
        <button type="button" style={mcButtons.text} onClick={onAutoSplit}>
          Auto split →
        </button>
      </div>

      {unassigned.length > 0 && (
        <>
          <MEyebrow color={BRAND.coral} className="mb-[6px]">
            UNASSIGNED · {unassigned.length}
          </MEyebrow>
          <TeamGrid players={unassigned} assignments={assignments} onAssign={onAssign} />
        </>
      )}

      <div
        className={cn(
          'grid gap-4 mt-[18px]',
          isMobile ? 'grid-cols-1' : 'grid-cols-2',
        )}
      >
        <div>
          <MEyebrow>TEAM A · INDIGO · {teamA.length}</MEyebrow>
          <div className="mt-2">
            <TeamGrid players={teamA} assignments={assignments} onAssign={onAssign} />
          </div>
        </div>
        <div>
          <MEyebrow color={BRAND.coral}>TEAM B · CORAL · {teamB.length}</MEyebrow>
          <div className="mt-2">
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
      <div className="font-satoshi text-xs text-brand-indigo-mute px-3 py-[10px] border border-dashed border-brand-line rounded-[4px] text-center">
        No players yet.
      </div>
    )
  return (
    <div className="flex flex-col gap-[6px]">
      {players.map(p => {
        const team = assignments[p.num]
        return (
          <div
            key={p.num}
            className="px-[10px] py-2 bg-white border border-brand-line rounded-[4px] flex items-center gap-[10px]"
          >
            <MiniAvatar num={p.num} />
            <div className="flex-1 min-w-0 font-satoshi text-[12.5px] font-semibold text-brand-indigo whitespace-nowrap overflow-hidden text-ellipsis">
              {p.name}
            </div>
            <div className="flex gap-[2px]">
              {(['A', 'B'] as const).map(t => {
                const active = team === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onAssign(p.num, t)}
                    className={cn(
                      'px-2 py-[3px] font-fragment text-[9px] font-bold tracking-[0.16em] rounded-[3px] cursor-pointer',
                      active
                        ? t === 'A'
                          ? 'border-none bg-brand-indigo text-brand-sand'
                          : 'border-none bg-brand-coral text-brand-sand'
                        : 'border border-brand-line bg-transparent text-brand-indigo',
                    )}
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
  format,
  startingCount,
}: {
  presentCount: number
  totalCount: number
  isTraining: boolean
  opponent: string | null
  format: LineupFormat
  startingCount: number
}) {
  const isMobile = useIsMobile()
  const target = LINEUP_FORMAT_TARGET[format]
  const rows: [string, string][] = [
    ['Type', isTraining ? 'Training match' : 'Match'],
    ['Opponent', opponent ?? '—'],
    ['Attendees', `${presentCount} of ${totalCount} present`],
    isTraining
      ? ['Setup', 'Team A vs Team B']
      : ['Format', `${format} · ${startingCount}/${target} starting`],
    ['Bibs', isTraining ? 'Indigo / Coral' : '— (competitive)'],
  ]

  return (
    <div
      className={cn(
        'grid',
        isMobile ? 'grid-cols-1 gap-[18px]' : 'grid-cols-2 gap-6',
      )}
    >
      <div>
        <MEyebrow>SUMMARY</MEyebrow>
        <div className="mt-3 border border-brand-line rounded-[4px] bg-white">
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className={cn(
                'flex justify-between px-[14px] py-[10px]',
                i < rows.length - 1 && 'border-b border-brand-line',
              )}
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
        <MEyebrow>WHAT HAPPENS NEXT</MEyebrow>
        <div className="mt-3 font-satoshi text-[13px] text-brand-indigo-mid leading-[1.55]">
          On the day, record using the camera. Footage uploads automatically when you&apos;re
          back on Wi-Fi. Analysis takes ~2 hours; we&apos;ll surface a coloured composite +
          clips on this page when ready.
        </div>
        <div className="mt-4 p-[14px] bg-brand-yellow-soft rounded-[4px]">
          <MEyebrow color={BRAND.indigo}>★ TIP</MEyebrow>
          <div className="font-satoshi text-[12.5px] mt-[6px] text-brand-indigo leading-[1.5]">
            Click ← Back to revisit attendance or {isTraining ? 'team split' : 'lineup'}.
            Save draft any time — your edits persist on this device.
          </div>
        </div>
      </div>
    </div>
  )
}
