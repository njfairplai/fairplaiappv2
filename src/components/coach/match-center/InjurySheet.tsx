'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { flagInjury } from '@/lib/match-center'
import type {
  InjuryType,
  InjurySeverity,
} from '@/lib/types'
import { MEyebrow, mcButtons } from './atoms'

/* Injury flag sheet — opens from a roster row in the match drill-in.
 * Captures minute / type / severity / notes and writes an InjuryFlag
 * via flagInjury() (localStorage; the parent inbox picks it up via
 * readClientNotifications). The optional clipId is omitted here —
 * coach attaches a clip from the timeline / highlights row separately
 * in a follow-up. */

interface InjurySheetProps {
  open: boolean
  sessionId: string
  playerId: string
  playerName: string
  onClose: () => void
  onSaved: () => void
}

const TYPE_OPTIONS: { value: InjuryType; label: string }[] = [
  { value: 'collision', label: 'Collision' },
  { value: 'fall', label: 'Fall' },
  { value: 'strain', label: 'Strain' },
  { value: 'other', label: 'Other' },
]

const SEVERITY_OPTIONS: { value: InjurySeverity; label: string; helper: string }[] = [
  { value: 1, label: '1', helper: 'Walked off' },
  { value: 2, label: '2', helper: 'Treated' },
  { value: 3, label: '3', helper: 'Subbed off' },
]

export function InjurySheet({
  open,
  sessionId,
  playerId,
  playerName,
  onClose,
  onSaved,
}: InjurySheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [minute, setMinute] = useState<string>('')
  const [type, setType] = useState<InjuryType>('strain')
  const [severity, setSeverity] = useState<InjurySeverity>(1)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset on open so old form state doesn't bleed across rows.
  useEffect(() => {
    if (open) {
      setMinute('')
      setType('strain')
      setSeverity(1)
      setNotes('')
    }
  }, [open])

  if (!open) return null

  function save() {
    const minNum = Number(minute)
    if (!Number.isFinite(minNum) || minNum < 0) return
    flagInjury({
      sessionId,
      playerId,
      minute: Math.round(minNum),
      type,
      severity,
      notes: notes.trim() || undefined,
    })
    onSaved()
    onClose()
  }

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-[95] flex items-center justify-center p-6 backdrop-blur-[4px]"
      style={{ background: 'rgba(11,8,40,0.62)' }}
    >
      <div className="w-full max-w-[420px] rounded-lg border border-brand-line bg-brand-paper px-[22px] py-5 shadow-[0_24px_56px_rgba(11,8,40,0.4)]">
        <div className="inline-flex items-center gap-1.5">
          <AlertTriangle size={13} color={BRAND.coral} />
          <MEyebrow>FLAG INJURY</MEyebrow>
        </div>
        <div className="mt-1.5 font-satoshi text-[13px] text-brand-indigo-mid">
          {playerName} · this match
        </div>

        {/* Minute */}
        <div className="mt-4">
          <Label>Minute</Label>
          <input
            type="number"
            min={0}
            max={120}
            value={minute}
            onChange={e => setMinute(e.target.value)}
            placeholder="e.g. 47"
            className={INPUT_CLS}
          />
        </div>

        {/* Type */}
        <div className="mt-3.5">
          <Label>Type</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={pillCls(type === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="mt-3.5">
          <Label>Severity</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {SEVERITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={cn(pillCls(severity === opt.value), 'flex-col gap-0.5 px-1.5 py-2')}
              >
                <span className="text-sm font-bold">{opt.label}</span>
                <span className="text-[10.5px] opacity-75">{opt.helper}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-3.5">
          <Label>Notes (optional)</Label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What happened? Did the physio see it?"
            rows={3}
            className={cn(INPUT_CLS, 'resize-y font-satoshi')}
          />
        </div>

        <div className="mt-[18px] flex justify-end gap-2">
          <button type="button" style={mcButtons.text} onClick={onClose}>Cancel</button>
          <button
            type="button"
            style={{ ...mcButtons.primary, padding: '10px 16px' }}
            onClick={save}
            disabled={minute.length === 0}
          >
            Flag injury
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
      {children}
    </div>
  )
}

const INPUT_CLS = 'box-border w-full rounded-md border border-brand-line bg-brand-sand px-3 py-[9px] font-satoshi text-[13.5px] text-brand-indigo outline-none'

function pillCls(active: boolean): string {
  return cn(
    'inline-flex cursor-pointer items-center justify-center rounded-md border px-2 py-[9px] font-satoshi text-[12.5px] font-semibold transition-all duration-150 ease-in-out',
    active
      ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
      : 'border-brand-line bg-brand-sand text-brand-indigo',
  )
}
