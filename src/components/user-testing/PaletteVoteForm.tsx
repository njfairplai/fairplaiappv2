'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES, applyTheme } from '@/lib/themes'

/**
 * Phase 1B form (Slice 4.5): tiny palette vote.
 *
 * Two questions only — palette pick + 3-word descriptors. Stores the answers
 * to localStorage under `fairplai-testing-palette` so phase 2 can apply the
 * chosen theme and the final form (Phase 2B) can read them back to bundle
 * with the app feedback in a single submission.
 *
 * No Likerts, no NPS here — those live in phase 2 because they're about the
 * APP rendered in the chosen palette, not about colours in the abstract.
 */

const DESCRIPTOR_WORDS = [
  // positive
  'Modern', 'Calm', 'Premium', 'Trustworthy', 'Clear', 'Bold', 'Professional', 'Playful',
  // neutral
  'Different',
  // negative
  'Cluttered', 'Confusing', 'Busy', 'Cold', 'Outdated', 'Cheap', 'Generic',
] as const

const sectionEyebrow = {
  fontFamily: 'var(--font-fragment)',
  fontSize: 10,
  letterSpacing: '0.22em',
  color: 'var(--brand-indigo)',
  fontWeight: 700,
  marginBottom: 6,
} as const

const sectionHeadline = {
  fontFamily: 'var(--font-clash)',
  fontSize: 22,
  letterSpacing: '-0.01em',
  color: 'var(--brand-indigo)',
  margin: '0 0 18px',
  lineHeight: 1.2,
} as const

export function PaletteVoteForm() {
  const router = useRouter()
  const [paletteVote, setPaletteVote] = useState<string>('')
  const [words, setWords] = useState<string[]>([])

  const toggleWord = (w: string) => {
    setWords(prev => {
      if (prev.includes(w)) return prev.filter(x => x !== w)
      if (prev.length >= 3) return prev
      return [...prev, w]
    })
  }

  const canContinue = !!paletteVote && words.length > 0

  const onContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canContinue) return
    try {
      localStorage.setItem('fairplai-testing-palette', JSON.stringify({
        palette_vote: paletteVote,
        palette_words: words,
      }))
    } catch { /* noop */ }
    // Apply the chosen theme so the next page renders in it immediately
    applyTheme(paletteVote)
    router.push('/user-testing/portal')
  }

  return (
    <form onSubmit={onContinue} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Section A: palette vote */}
      <section>
        <div style={sectionEyebrow}>SECTION A · PHASE 1 OF 2</div>
        <h2 style={sectionHeadline}>Which palette felt right?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THEMES.map(t => {
            const active = paletteVote === t.id
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: active ? 'var(--brand-yellow-soft)' : 'var(--brand-paper)',
                  border: `1px solid ${active ? 'var(--brand-yellow)' : 'var(--brand-line)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
              >
                <input
                  type="radio"
                  name="palette"
                  value={t.id}
                  checked={active}
                  onChange={() => setPaletteVote(t.id)}
                  style={{ accentColor: 'var(--brand-indigo)' }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  {t.swatches.map((c, i) => (
                    <span key={i} style={{ width: 18, height: 18, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-fragment)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--brand-indigo-mute)' }}>
                    {t.tagline.toUpperCase()}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {/* Section B: descriptor words */}
      <section>
        <div style={sectionEyebrow}>SECTION B · GUT REACTION</div>
        <h2 style={sectionHeadline}>Pick up to three words to describe it.</h2>
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginBottom: 14,
        }}>
          {words.length}/3 SELECTED
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DESCRIPTOR_WORDS.map(w => {
            const active = words.includes(w)
            const disabled = !active && words.length >= 3
            return (
              <button
                key={w}
                type="button"
                onClick={() => toggleWord(w)}
                disabled={disabled}
                style={{
                  padding: '8px 14px',
                  background: active ? 'var(--brand-indigo)' : 'var(--brand-paper)',
                  color: active ? 'var(--brand-sand)' : 'var(--brand-indigo)',
                  border: `1px solid ${active ? 'var(--brand-indigo)' : 'var(--brand-line)'}`,
                  borderRadius: 999,
                  fontFamily: 'var(--font-satoshi)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  transition: 'all 140ms ease',
                }}
              >
                {w}
              </button>
            )
          })}
        </div>
      </section>

      {!canContinue && (
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}>
          PICK A PALETTE AND AT LEAST ONE WORD TO CONTINUE.
        </div>
      )}

      <button
        type="submit"
        disabled={!canContinue}
        style={{
          padding: '14px 24px',
          background: canContinue ? 'var(--brand-indigo)' : 'var(--brand-indigo-soft)',
          color: canContinue ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-satoshi)',
          fontWeight: 700,
          fontSize: 15,
          cursor: canContinue ? 'pointer' : 'not-allowed',
          alignSelf: 'flex-start',
          boxShadow: canContinue ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        Continue → Try the app in this palette →
      </button>
    </form>
  )
}
