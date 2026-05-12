'use client'

import type { Player } from '@/lib/types'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'
import { cn } from '@/lib/cn'

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
      className={cn(
        'flex gap-2 px-4 py-3 overflow-x-auto',
        'bg-brand-paper border-b border-brand-line',
        '[scrollbar-width:none]',
      )}
    >
      <span
        className={cn(
          'self-center mr-1 whitespace-nowrap',
          'font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-indigo-mute',
        )}
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
            className={cn(
              'inline-flex items-center gap-2 pr-3 py-1.5 pl-1.5 rounded-full',
              'font-satoshi text-[13px] font-semibold whitespace-nowrap shrink-0 cursor-pointer',
              'border transition-colors duration-150',
              isActive
                ? 'bg-brand-indigo text-brand-sand border-brand-indigo'
                : 'bg-brand-sand text-brand-indigo border-brand-line hover:bg-brand-paper-hi',
            )}
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
