'use client'

import { useRouter, usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/cn'

interface PortalTopBarProps {
  /** When set, renders this string in the centre instead of the
   *  Fairplai wordmark. Used by deep pages ("Match", "Settings", etc). */
  title?: string
  /** When true, renders a back chevron in place of the avatar. */
  showBack?: boolean
}

const ICON_BTN_CLASS =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer text-brand-indigo text-[22px] font-clash'

/* Slim sticky top bar with avatar (left) → settings, brand mark
 * (centre — wordmark by default, or a deep-page title). The notification
 * bell was removed (May 2026); the Hub tab in the bottom nav is now the
 * only path to communications. */
export function PortalTopBar({
  title,
  showBack = false,
}: PortalTopBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header
      className={cn(
        'sticky top-0 z-20 grid h-[52px] items-center px-3',
        'bg-brand-sand border-b border-brand-line',
        'grid-cols-[40px_1fr_40px]',
      )}
    >
      {showBack ? (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className={ICON_BTN_CLASS}
        >
          ‹
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            router.push(pathname.startsWith('/player') ? '/player/settings' : '/parent/settings')
          }
          aria-label="Settings"
          className={ICON_BTN_CLASS}
        >
          <User size={18} />
        </button>
      )}

      <div className="flex items-center justify-center">
        {title ? (
          <span className="text-center font-fragment text-[11px] font-extrabold tracking-[0.32em] text-brand-indigo">
            {title.toUpperCase()}
          </span>
        ) : (
          <Logo height={20} />
        )}
      </div>

      {/* Right slot intentionally empty — keeps the centred logo balanced.
       *  Previously held the notification bell; removed in favour of the
       *  Hub tab in the bottom nav. */}
      <span aria-hidden />
    </header>
  )
}
