'use client'

import Image from 'next/image'
import { cn } from '@/lib/cn'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  firstName: string
  lastName: string
  photo?: string
  size?: number
  className?: string
}

/**
 * Circular avatar. Falls back to brand-tinted initials when no photo.
 * Size stays as inline `style` — the px value is genuinely dynamic per
 * caller (and font-size scales proportionally with it).
 */
export default function Avatar({ firstName, lastName, photo, size = 48, className }: AvatarProps) {
  const initials = getInitials(firstName, lastName)

  if (photo) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full border-2 border-brand-indigo/15',
          className,
        )}
      >
        <Image
          src={photo}
          alt={`${firstName} ${lastName}`}
          fill
          className="object-cover object-[center_top]"
        />
      </div>
    )
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-indigo/10',
        className,
      )}
    >
      <span
        style={{ fontSize: size * 0.36 }}
        className="font-satoshi font-extrabold text-brand-indigo"
      >
        {initials}
      </span>
    </div>
  )
}
