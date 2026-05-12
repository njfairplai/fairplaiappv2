'use client'

import { useRouter } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/cn'

/* Lower tile rail — the "I just want to scroll" escape hatch for
 * coaches who don't want to type. Four small destination cards link
 * to the rest of the coach surfaces. Each tile carries one display-
 * font primary (e.g. "SAT 28 FEB") + a mono eyebrow + a mono label
 * line at the bottom. */

interface HubTileProps {
  eyebrow: string
  primary: string
  primarySub?: string
  label: string
  accent?: string
  onClick?: () => void
}

function HubTile({
  eyebrow,
  primary,
  primarySub,
  label,
  accent = BRAND.indigo,
  onClick,
}: HubTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(11,8,40,0.12)'
        e.currentTarget.style.borderColor = 'rgba(27,21,80,0.22)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(11,8,40,0.04)'
        e.currentTarget.style.borderColor = BRAND.line
      }}
      className="flex h-[124px] min-w-[180px] flex-1 cursor-pointer flex-col justify-between rounded-md border border-brand-line bg-brand-paper px-4 py-3.5 text-left shadow-[0_1px_3px_rgba(11,8,40,0.04)] transition-[transform,box-shadow,border-color] duration-150 ease-in-out"
    >
      <div className="font-fragment text-[9.5px] font-bold tracking-[0.22em] text-brand-indigo-mute">
        {eyebrow}
      </div>
      <div>
        <div
          className="font-clash text-4xl leading-[0.94] tracking-[-0.02em]"
          style={{ color: accent }}
        >
          {primary}
          {primarySub && (
            <span className="ml-1.5 text-sm tracking-normal text-brand-indigo-mute">
              {primarySub}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {label}
        </span>
        <span className="ml-1.5 shrink-0">→</span>
      </div>
    </button>
  )
}

export function HubTiles() {
  const router = useRouter()
  const isMobile = useIsMobile()
  return (
    <div
      className={cn(
        'grid w-full max-w-[760px] gap-2.5',
        isMobile ? 'grid-cols-2' : 'grid-cols-4',
      )}
    >
      <HubTile
        eyebrow="NEXT SESSION"
        primary="SAT"
        primarySub="28 FEB"
        label="VS AL WASL · PREP"
        accent={BRAND.coral}
        onClick={() => router.push('/coach/web/match-center?session=feb28')}
      />
      <HubTile
        eyebrow="LATEST MATCH"
        primary="3-1"
        primarySub="W"
        label="VS AL WASL · 24 FEB"
        onClick={() => router.push('/coach/web/match-center?session=feb24')}
      />
      <HubTile
        eyebrow="PLAYERS"
        primary="16"
        primarySub="ROSTER"
        label="LIONS U13 · SPRING"
        onClick={() => router.push('/coach/web/squad')}
      />
      <HubTile
        eyebrow="HIGHLIGHTS"
        primary="42"
        primarySub="CLIPS"
        label="SPRING SEASON"
        accent={BRAND.indigo}
        onClick={() => router.push('/coach/web/highlights')}
      />
    </div>
  )
}
