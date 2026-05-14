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
        'flex gap-1.5 overflow-x-auto px-4 py-1.5',
        'border-b border-brand-line bg-brand-paper',
        '[scrollbar-width:none]',
      )}
    >
      {kids.map(k => {
        const isActive = k.id === activeKidId
        return (
          <button
            key={k.id}
            type="button"
            onClick={() => onSwitch(k.id)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5',
              'whitespace-nowrap border font-satoshi text-[12px] font-semibold transition-colors duration-150',
              isActive
                ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                : 'border-brand-line bg-brand-sand text-brand-indigo hover:bg-brand-paper-hi',
            )}
          >
            <PlayerGlyph
              size={20}
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
