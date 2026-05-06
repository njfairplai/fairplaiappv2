'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BRAND, TYPE } from '@/lib/constants'
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
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11,8,40,0.62)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 95, padding: 24,
      }}
    >
      <div
        style={{
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderRadius: 8,
          width: '100%', maxWidth: 420,
          padding: '20px 22px',
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={13} color={BRAND.coral} />
          <MEyebrow>FLAG INJURY</MEyebrow>
        </div>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            marginTop: 6,
          }}
        >
          {playerName} · this match
        </div>

        {/* Minute */}
        <div style={{ marginTop: 16 }}>
          <Label>Minute</Label>
          <input
            type="number"
            min={0}
            max={120}
            value={minute}
            onChange={e => setMinute(e.target.value)}
            placeholder="e.g. 47"
            style={inputStyle}
          />
        </div>

        {/* Type */}
        <div style={{ marginTop: 14 }}>
          <Label>Type</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                style={pillStyle(type === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div style={{ marginTop: 14 }}>
          <Label>Severity</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {SEVERITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                style={{
                  ...pillStyle(severity === opt.value),
                  flexDirection: 'column',
                  padding: '8px 6px',
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>{opt.label}</span>
                <span style={{ fontSize: 10.5, opacity: 0.75 }}>{opt.helper}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 14 }}>
          <Label>Notes (optional)</Label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What happened? Did the physio see it?"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              fontFamily: TYPE.body,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
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
    <div
      style={{
        fontFamily: TYPE.mono,
        fontSize: 10.5,
        letterSpacing: '0.18em',
        color: BRAND.indigoMute,
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: `1px solid ${BRAND.line}`,
  borderRadius: 6,
  fontFamily: TYPE.body,
  fontSize: 13.5,
  color: BRAND.indigo,
  background: BRAND.sand,
  outline: 'none',
  boxSizing: 'border-box',
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '9px 8px',
    border: `1px solid ${active ? BRAND.indigo : BRAND.line}`,
    borderRadius: 6,
    background: active ? BRAND.indigo : BRAND.sand,
    color: active ? BRAND.sand : BRAND.indigo,
    fontFamily: TYPE.body,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}
