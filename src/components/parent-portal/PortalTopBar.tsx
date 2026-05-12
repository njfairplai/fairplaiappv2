'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Bell, User } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/cn'

interface PortalTopBarProps {
  /** Optional unread count for the bell badge. 0 hides the badge. */
  unreadCount?: number
  /** When set, renders this string in the centre instead of the
   *  Fairplai wordmark. Used by deep pages ("Match", "Settings", etc). */
  title?: string
  /** When true, renders a back chevron in place of the avatar. */
  showBack?: boolean
}

const ICON_BTN_CLASS =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer text-brand-indigo text-[22px] font-clash'

/* Slim sticky top bar with avatar (left) → settings, brand mark
 * (centre — wordmark by default, or a deep-page title), notification
 * bell (right) with unread-count badge. */
export function PortalTopBar({
  unreadCount = 0,
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

      <button
        type="button"
        onClick={() =>
          // Parent: bell routes to /parent/hub which is now the unified
          // feed (system events + coach + announcements + community).
          // Player portal still has its own /player/notifications until
          // we unify there too.
          router.push(pathname.startsWith('/player') ? '/player/notifications' : '/parent/hub')
        }
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className={cn(ICON_BTN_CLASS, 'relative')}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute top-1 right-1 inline-flex items-center justify-center',
              'min-w-[16px] h-4 px-1 rounded-lg',
              'bg-brand-yellow text-brand-indigo',
              'font-fragment text-[9.5px] font-extrabold',
              'border-[1.5px] border-brand-sand',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}
