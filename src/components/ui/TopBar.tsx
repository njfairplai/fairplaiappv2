'use client'

import Image from 'next/image'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/cn'

interface TopBarProps {
  title?: string
  showLogo?: boolean
  showNotification?: boolean
  rightContent?: React.ReactNode
  dark?: boolean
}

/**
 * Mobile top bar with optional logo, title, notification bell, and a
 * custom right slot. `dark` flips text to white and removes the border —
 * used over dark hero sections.
 */
export default function TopBar({
  title,
  showLogo = false,
  showNotification = false,
  rightContent,
  dark = false,
}: TopBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 pt-4 pb-3',
        dark ? 'bg-transparent' : 'border-b border-black/5 bg-brand-paper',
      )}
    >
      <div className="flex items-center gap-3">
        {showLogo && (
          <Image
            src={dark ? '/logo-white.png' : '/logo-black.png'}
            alt="FairplAI"
            width={80}
            height={24}
            className="h-6 w-auto object-contain"
          />
        )}
        {title && (
          <h1
            className={cn(
              'm-0 font-satoshi text-2xl font-extrabold tracking-[-0.4px]',
              dark ? 'text-white' : 'text-brand-indigo',
            )}
          >
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showNotification && (
          <button
            type="button"
            className="relative cursor-pointer border-none bg-transparent p-1"
            aria-label="Notifications"
          >
            <Bell size={22} className={dark ? 'text-white' : 'text-brand-indigo'} />
            <span
              className={cn(
                'absolute right-0.5 top-0.5 block h-2 w-2 rounded-full',
                'bg-brand-coral border-2 border-brand-paper',
              )}
            />
          </button>
        )}
        {rightContent}
      </div>
    </div>
  )
}
