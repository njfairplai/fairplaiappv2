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
      className={`flex items-center gap-3 bg-brand-paper border-b border-brand-line ${
        isMobile ? 'px-4 py-3.5' : 'px-9 py-4'
      }`}
    >
      <span className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold">
        VIEW
      </span>
      <div
        role="tablist"
        aria-label="Profile scope"
        className="inline-flex bg-brand-sand border border-brand-line rounded-full p-[3px] gap-[2px]"
      >
        <button
          role="tab"
          aria-selected={matchActive}
          type="button"
          onClick={() => onChange('match')}
          className={`inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full border-0 font-satoshi text-[13px] font-bold cursor-pointer tracking-[0.01em] ${
            matchActive ? 'bg-brand-indigo text-brand-sand' : 'bg-transparent text-brand-indigo'
          }`}
        >
          Match
          {matchLabel && (
            <span
              className={`font-fragment text-[10px] tracking-[0.16em] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${
                matchActive ? 'opacity-70' : 'opacity-55'
              }`}
              style={{ maxWidth: isMobile ? 120 : 220 }}
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
          className={`px-[18px] py-[7px] rounded-full border-0 font-satoshi text-[13px] font-bold cursor-pointer tracking-[0.01em] ${
            !matchActive ? 'bg-brand-indigo text-brand-sand' : 'bg-transparent text-brand-indigo'
          }`}
        >
          Season
        </button>
      </div>
    </div>
  )
}
