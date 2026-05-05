'use client'

export type ProfileScope = 'match' | 'season'

interface ScopeToggleProps {
  scope: ProfileScope
  onChange: (next: ProfileScope) => void
  /** Match label, e.g. "vs Al Wasl . Feb 24". When in match mode this is the
   *  active match; when in season mode it's the match the user would return
   *  to if they switch back. Pass an empty string if there's no match yet. */
  matchLabel: string
  isMobile?: boolean
}

/**
 * Two-button pill that swaps the entire profile between match-view and
 * season-view. The page commits to one scope at a time so every number on
 * screen belongs to that scope (no more match-vs-season dichotomy).
 *
 * Sits directly under the identity strip. Match label is dynamic — shows
 * the current playhead match's opponent + date so the coach knows which
 * match they're about to read.
 */
export function ScopeToggle({ scope, onChange, matchLabel, isMobile }: ScopeToggleProps) {
  const matchActive = scope === 'match'
  return (
    <div
      style={{
        padding: isMobile ? '14px 16px' : '18px 36px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--brand-paper)',
        borderBottom: '1px solid var(--brand-line)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.22em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}
      >
        VIEW
      </span>
      <div
        role="tablist"
        aria-label="Profile scope"
        style={{
          display: 'inline-flex',
          background: 'var(--brand-sand)',
          border: '1px solid var(--brand-line)',
          borderRadius: 999,
          padding: 3,
          gap: 2,
        }}
      >
        <button
          role="tab"
          aria-selected={matchActive}
          type="button"
          onClick={() => onChange('match')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 999,
            border: 'none',
            background: matchActive ? 'var(--brand-indigo)' : 'transparent',
            color: matchActive ? 'var(--brand-sand)' : 'var(--brand-indigo)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Match
          {matchLabel && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                fontWeight: 700,
                opacity: matchActive ? 0.7 : 0.55,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? 120 : 220,
              }}
            >
              · {matchLabel.toUpperCase()}
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={!matchActive}
          type="button"
          onClick={() => onChange('season')}
          style={{
            padding: '7px 18px',
            borderRadius: 999,
            border: 'none',
            background: !matchActive ? 'var(--brand-indigo)' : 'transparent',
            color: !matchActive ? 'var(--brand-sand)' : 'var(--brand-indigo)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Season
        </button>
      </div>
    </div>
  )
}
