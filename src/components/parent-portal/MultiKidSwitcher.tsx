'use client'

import type { Player } from '@/lib/types'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'

/* TODO: design-refinement-target — Pack 3 will refine visual treatment.
 * Current is a plain horizontal pill row with PlayerGlyph + name. Hidden
 * for single-kid families and for player-role (player only sees self). */

interface MultiKidSwitcherProps {
  kids: Player[]
  activeKidId: string | null
  onSwitch: (kidId: string) => void
}

export function MultiKidSwitcher({ kids, activeKidId, onSwitch }: MultiKidSwitcherProps) {
  if (kids.length <= 1) return null

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        background: 'var(--brand-paper)',
        borderBottom: '1px solid var(--brand-line)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          alignSelf: 'center',
          marginRight: 4,
          whiteSpace: 'nowrap',
        }}
      >
        VIEWING
      </span>
      {kids.map(k => {
        const isActive = k.id === activeKidId
        return (
          <button
            key={k.id}
            type="button"
            onClick={() => onSwitch(k.id)}
            aria-pressed={isActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px 6px 6px',
              borderRadius: 999,
              background: isActive ? 'var(--brand-indigo)' : 'var(--brand-sand)',
              color: isActive ? 'var(--brand-sand)' : 'var(--brand-indigo)',
              border: `1px solid ${isActive ? 'var(--brand-indigo)' : 'var(--brand-line)'}`,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <PlayerGlyph
              size={26}
              jerseyNumber={k.jerseyNumber}
              name={`${k.firstName} ${k.lastName}`}
            />
            {k.firstName}
          </button>
        )
      })}
    </div>
  )
}
