'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Check, X } from 'lucide-react'

interface MatchNoteEditorProps {
  playerId: string
  sessionId: string
  /** "Coach Sara" by default — name attribution shown on saved notes. */
  author?: string
  /** Override styling: 'light' for sand/paper backgrounds, 'dark' for indigo. */
  variant?: 'light' | 'dark'
}

interface SavedNote {
  text: string
  savedAt: number
  author: string
}

const STORE_KEY = 'fairplai_match_notes'

/** Read all notes from localStorage. Quietly returns {} if unavailable. */
function readAll(): Record<string, SavedNote> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, SavedNote>) : {}
  } catch {
    return {}
  }
}

/** Persist a note keyed by `${playerId}__${sessionId}`. */
function writeNote(key: string, note: SavedNote | null) {
  if (typeof window === 'undefined') return
  try {
    const all = readAll()
    if (note === null) delete all[key]
    else all[key] = note
    localStorage.setItem(STORE_KEY, JSON.stringify(all))
  } catch {
    // localStorage unavailable; no-op
  }
}

/** Format a timestamp as relative ("2 days ago") for the note attribution. */
function relative(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

/**
 * Inline note editor for a single match. Three states:
 *   1. No note + collapsed: "+ Add note" affordance
 *   2. No note + expanded: textarea + Save / Cancel
 *   3. Has note: shows the note text + author + relative date + edit pencil
 *
 * Notes persist to localStorage (`fairplai_match_notes` keyed by playerId+sessionId)
 * so they survive reload without needing a backend.
 */
export function MatchNoteEditor({
  playerId,
  sessionId,
  author = 'Coach',
  variant = 'light',
}: MatchNoteEditorProps) {
  const key = `${playerId}__${sessionId}`
  const [saved, setSaved] = useState<SavedNote | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  // Hydrate from localStorage on mount + when key changes.
  useEffect(() => {
    const all = readAll()
    setSaved(all[key] ?? null)
    setEditing(false)
    setDraft('')
  }, [key])

  // Auto-focus textarea when entering editing mode.
  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  const isDark = variant === 'dark'
  const labelColor = isDark ? 'rgba(238, 228, 200, 0.6)' : 'var(--brand-indigo-mute)'
  const textColor = isDark ? 'var(--brand-sand)' : 'var(--brand-indigo)'
  const surfaceColor = isDark ? 'rgba(238, 228, 200, 0.06)' : 'var(--brand-sand)'
  const borderColor = isDark ? 'rgba(238, 228, 200, 0.16)' : 'var(--brand-line)'

  const handleSave = () => {
    const text = draft.trim()
    if (!text) {
      setEditing(false)
      setDraft('')
      return
    }
    const note: SavedNote = { text, savedAt: Date.now(), author }
    writeNote(key, note)
    setSaved(note)
    setEditing(false)
    setDraft('')
  }

  const handleCancel = () => {
    setEditing(false)
    setDraft('')
  }

  const handleEdit = () => {
    setDraft(saved?.text ?? '')
    setEditing(true)
  }

  if (editing) {
    return (
      <div style={{ marginTop: 6 }}>
        <textarea
          ref={taRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={`What stood out about this match for ${author === 'Coach' ? 'this player' : author}?`}
          rows={3}
          style={{
            width: '100%',
            background: surfaceColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            padding: '8px 10px',
            color: textColor,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: isDark ? 'var(--brand-yellow)' : 'var(--brand-indigo)',
              color: isDark ? 'var(--brand-indigo)' : 'var(--brand-sand)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Check size={12} /> Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'transparent',
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 6,
              padding: '6px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  if (saved) {
    return (
      <div style={{ marginTop: 6 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: textColor,
            lineHeight: 1.55,
          }}
        >
          “{saved.text}”
        </div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.18em',
            color: labelColor,
            fontWeight: 700,
          }}
        >
          <span>{saved.author.toUpperCase()} · {relative(saved.savedAt).toUpperCase()}</span>
          <button
            type="button"
            onClick={handleEdit}
            style={{
              background: 'transparent',
              border: 'none',
              color: textColor,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              letterSpacing: 'inherit',
              fontWeight: 'inherit',
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            EDIT ↗
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'transparent',
        border: 'none',
        color: textColor,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 600,
        marginTop: 6,
        padding: 0,
        cursor: 'pointer',
        opacity: 0.85,
      }}
    >
      <Plus size={14} /> Add note
    </button>
  )
}
