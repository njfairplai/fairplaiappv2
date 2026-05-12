'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Pitch } from '@/components/coach/squad-grass/Pitch'
import Modal from '@/components/ui/Modal'
import {
  FORMATIONS,
  autoAssignByFormation,
  roleGroup,
  type Formation,
  type FormationRoleGroup,
  type SquadSize,
} from '@/lib/formations'
import type { RosterEntry } from '@/lib/match-center'
import type { LineupFormat } from '@/lib/match-center-state'
import { MEyebrow, MiniAvatar } from './atoms'

/* Visual lineup picker for competitive matches.
 *
 * Coach flow:
 *   1. Pick a formation from the dropdown (defaults to format's first).
 *   2. Present players auto-fill the pitch by best positional fit.
 *   3. Tap any slot → bottom sheet with unassigned (sub) players,
 *      role-filtered. Tap a sub to swap; old slot player → subs.
 *      'Remove from lineup' empties the slot.
 *   4. Subs section below the pitch lists everyone not in slotMap.
 *
 * State shape lives in LineupState (see match-center-state.ts):
 *   - formationId: which formation is active
 *   - slotMap: positionIdx (in formation.positions) → jersey number
 * Anything present but not in slotMap.values is implicit subs.
 */

const FORMAT_TO_SQUAD: Record<LineupFormat, SquadSize> = {
  '5v5': 5,
  '7v7': 7,
  '9v9': 9,
  '11v11': 11,
}

interface LineupPickerProps {
  /** Present roster (already filtered through attendance). */
  presentPlayers: RosterEntry[]
  format: LineupFormat
  formationId: string | null
  /** positionIdx → jersey number. Sparse. */
  slotMap: Record<number, number>
  onChange: (formationId: string, slotMap: Record<number, number>) => void
}

export function LineupPicker({
  presentPlayers,
  format,
  formationId,
  slotMap,
  onChange,
}: LineupPickerProps) {
  const squadSize = FORMAT_TO_SQUAD[format]
  const formations = FORMATIONS[squadSize]
  const currentFormation: Formation =
    formations.find(f => f.id === formationId) ?? formations[0]!

  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [filterGroup, setFilterGroup] = useState<FormationRoleGroup | 'ALL'>('ALL')

  // Lazy-init: if no formation chosen yet, auto-assign with the default
  // for this format. Only runs when formationId is null or doesn't match
  // any formation for the current squad size.
  useEffect(() => {
    if (!formations.length) return
    const known = formations.some(f => f.id === formationId)
    if (known) return
    const f = formations[0]!
    const fresh = computeAutoAssign(f, presentPlayers)
    onChange(f.id, fresh)
    // We intentionally depend on format + formationId so a format
    // switch (5v5 → 11v11) re-seeds. presentPlayers change does NOT
    // re-seed — coach edits stick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, formationId])

  function pickFormation(newId: string) {
    const nf = formations.find(f => f.id === newId)
    if (!nf) return
    // Re-auto-assign — formation shape changed so slot indices don't map
    // 1:1. Coach can still tap slots to refine after.
    const fresh = computeAutoAssign(nf, presentPlayers)
    onChange(nf.id, fresh)
  }

  function placeAt(slotIdx: number, jerseyNum: number | null) {
    const next: Record<number, number> = { ...slotMap }
    if (jerseyNum !== null) {
      // Remove this jersey from any other slot it currently occupies.
      for (const k of Object.keys(next)) {
        if (next[Number(k)] === jerseyNum) delete next[Number(k)]
      }
      next[slotIdx] = jerseyNum
    } else {
      delete next[slotIdx]
    }
    onChange(currentFormation.id, next)
  }

  function openSlot(slotIdx: number) {
    const slot = currentFormation.positions[slotIdx]
    if (!slot) return
    setFilterGroup(roleGroup(slot.role))
    setEditingSlot(slotIdx)
  }

  // ─── Derived ───────────────────────────────────────────────────────
  const assignedJerseys = new Set(Object.values(slotMap))
  const subs = presentPlayers.filter(p => !assignedJerseys.has(p.num))
  const playerByNum = useMemo(() => {
    const m = new Map<number, RosterEntry>()
    for (const p of presentPlayers) m.set(p.num, p)
    return m
  }, [presentPlayers])

  const editingSlotData =
    editingSlot !== null ? currentFormation.positions[editingSlot] : null
  const editingCurrentJersey =
    editingSlot !== null ? slotMap[editingSlot] : undefined
  const editingCurrentPlayer =
    editingCurrentJersey !== undefined ? playerByNum.get(editingCurrentJersey) : undefined

  const subsForSheet =
    filterGroup === 'ALL'
      ? subs
      : subs.filter(p => roleGroup(p.pos) === filterGroup)

  return (
    <div>
      {/* Formation dropdown + summary */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex items-center gap-[10px] flex-wrap">
          <MEyebrow>FORMATION</MEyebrow>
          <select
            value={currentFormation.id}
            onChange={e => pickFormation(e.target.value)}
            className="font-fragment text-[11px] font-bold tracking-[0.16em] text-brand-indigo border border-brand-line rounded-[3px] px-[10px] py-[5px] bg-brand-paper cursor-pointer touch-manipulation"
          >
            {formations.map(f => (
              <option key={f.id} value={f.id}>
                {format} · {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-baseline gap-[14px] flex-wrap">
          <span className="font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo">
            STARTING {Object.keys(slotMap).length}/{currentFormation.positions.length}
          </span>
          <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            {subs.length} SUB{subs.length === 1 ? '' : 'S'}
          </span>
        </div>
      </div>

      {/* Pitch */}
      <div className="max-w-[420px] mx-auto">
        <Pitch>
          {currentFormation.positions.map((pos, idx) => {
            const jersey = slotMap[idx]
            const player = jersey !== undefined ? playerByNum.get(jersey) : undefined
            return (
              <SlotToken
                key={idx}
                x={pos.x}
                // FORMATIONS y is 0=own goal, 100=opp goal; PlayerToken
                // convention is bottom-anchored, so feeding y directly
                // puts attackers near the top (opponent goal) — exactly
                // what we want for a vertical attacking-up pitch.
                y={pos.y}
                role={pos.role}
                player={player}
                onClick={() => openSlot(idx)}
              />
            )
          })}
        </Pitch>
      </div>

      {/* Subs list */}
      <div className="mt-5">
        <MEyebrow>SUBS · {subs.length}</MEyebrow>
        {subs.length === 0 ? (
          <div className="mt-2 font-satoshi text-[12.5px] text-brand-indigo-mute px-3 py-[10px] border border-dashed border-brand-line rounded-[4px] text-center">
            Every present player is in the starting lineup.
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {subs.map(p => (
              <div
                key={p.num}
                className="flex items-center gap-2 bg-white border border-brand-line rounded-full pl-1 pr-3 py-1"
              >
                <MiniAvatar num={p.num} />
                <span className="font-satoshi text-[12px] font-semibold text-brand-indigo">
                  {p.name}
                </span>
                <span className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute border border-brand-line px-1 py-px rounded-[2px]">
                  {p.pos}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap bottom-sheet (Modal — works as a centred sheet on mobile) */}
      <Modal
        open={editingSlot !== null}
        onClose={() => setEditingSlot(null)}
        title={
          editingCurrentPlayer
            ? `Swap ${editingCurrentPlayer.name}`
            : editingSlotData
            ? `Assign ${editingSlotData.role}`
            : 'Swap'
        }
        maxWidth={460}
      >
        {/* Role filter chips */}
        <div className="flex gap-[6px] mb-3 flex-wrap">
          {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map(g => {
            const active = filterGroup === g
            return (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGroup(g)}
                className={cn(
                  'px-[10px] py-[5px] font-fragment text-[9.5px] font-bold tracking-[0.18em] rounded-[3px] cursor-pointer uppercase touch-manipulation',
                  active
                    ? 'border-none bg-brand-indigo text-brand-sand'
                    : 'border border-brand-line bg-transparent text-brand-indigo',
                )}
              >
                {g}
              </button>
            )
          })}
        </div>

        {/* Subs list */}
        <div className="max-h-[50vh] overflow-y-auto border border-brand-line rounded-[4px] bg-white">
          {subsForSheet.length === 0 ? (
            <div className="px-3 py-4 text-center font-satoshi text-[13px] text-brand-indigo-mute">
              No unassigned players match this filter.
            </div>
          ) : (
            subsForSheet.map((p, i) => (
              <button
                key={p.num}
                type="button"
                onClick={() => {
                  if (editingSlot === null) return
                  placeAt(editingSlot, p.num)
                  setEditingSlot(null)
                }}
                className={cn(
                  'w-full grid items-center gap-3 px-3 py-2 cursor-pointer bg-transparent text-left border-0 touch-manipulation hover:bg-brand-sand',
                  i < subsForSheet.length - 1 && 'border-b border-brand-line',
                )}
                style={{ gridTemplateColumns: '28px 1fr 44px 44px' }}
              >
                <MiniAvatar num={p.num} />
                <span className="font-satoshi text-[13px] font-semibold text-brand-indigo whitespace-nowrap overflow-hidden text-ellipsis">
                  {p.name}
                </span>
                <span className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo-mute border border-brand-line px-1 py-px rounded-[2px] text-center">
                  {p.pos}
                </span>
                <span className="font-fragment text-[9px] font-bold tracking-[0.16em] text-brand-indigo bg-brand-line-soft px-1 py-px rounded-[2px] text-center">
                  {roleGroup(p.pos)}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer actions */}
        {editingCurrentPlayer && (
          <button
            type="button"
            onClick={() => {
              if (editingSlot === null) return
              placeAt(editingSlot, null)
              setEditingSlot(null)
            }}
            className="mt-3 w-full px-4 py-[10px] font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-coral border border-brand-coral bg-transparent rounded-[3px] cursor-pointer uppercase touch-manipulation"
          >
            Remove from lineup
          </button>
        )}
      </Modal>
    </div>
  )
}

// ─── Pitch slot token ────────────────────────────────────────────────
// Local — we don't reuse PlayerToken because RosterEntry has a single
// `name` field instead of firstName/lastName/jerseyNumber, and we want
// a smaller, calmer visual on the prep pitch (no score badge, no halo).

interface SlotTokenProps {
  x: number
  y: number
  role: string
  player: RosterEntry | undefined
  onClick: () => void
}

function SlotToken({ x, y, role, player, onClick }: SlotTokenProps) {
  const initials = player ? firstName(player.name).slice(0, 1) : ''
  const empty = !player
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        player
          ? `${player.name}, jersey ${player.num}, ${role} — tap to swap`
          : `Empty ${role} slot — tap to assign`
      }
      className="absolute -translate-x-1/2 translate-y-1/2 bg-transparent border-0 cursor-pointer p-0 touch-manipulation"
      style={{ left: `${x}%`, bottom: `${y}%`, zIndex: 1 }}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-clash font-bold shadow-[0_6px_14px_rgba(0,0,0,0.35)]',
          empty
            ? 'bg-white/10 text-white/70 border-[1.5px] border-dashed border-white/55'
            : 'bg-[#1B1550] text-brand-sand border-[2.5px] border-white/85',
        )}
        style={{ width: 44, height: 44, fontSize: 16 }}
      >
        {empty ? role : player!.num}
      </div>
      <div
        className="mt-1 text-center font-satoshi text-[11px] text-white font-semibold tracking-[0.02em] whitespace-nowrap"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
      >
        {empty ? <span className="opacity-70">{role}</span> : firstName(player!.name)}
        {!empty && initials && (
          <span className="ml-1 font-fragment text-[9px] tracking-[0.16em] opacity-70">
            {role}
          </span>
        )}
      </div>
    </button>
  )
}

function firstName(full: string): string {
  return full.split(' ')[0] ?? full
}

// ─── Auto-assign bridge ─────────────────────────────────────────────
// `autoAssignByFormation` works against a generic `{ id, position[] }`
// shape so the algorithm stays decoupled from the match-center roster.
// Here we adapt RosterEntry (single `pos`) by wrapping into the
// expected array form, then translate the id→playerId result back into
// our jersey-number-indexed slotMap.

function computeAutoAssign(
  formation: Formation,
  presentPlayers: RosterEntry[],
): Record<number, number> {
  const adapted = presentPlayers.map(p => ({ id: String(p.num), position: [p.pos] }))
  const idxToId = autoAssignByFormation(formation, adapted)
  const out: Record<number, number> = {}
  for (const [k, v] of Object.entries(idxToId)) {
    out[Number(k)] = Number(v)
  }
  return out
}
