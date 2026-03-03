'use client'

import Image from 'next/image'
import { COLORS } from '@/lib/constants'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  firstName: string
  lastName: string
  photo?: string
  size?: number
  style?: React.CSSProperties
}

export default function Avatar({ firstName, lastName, photo, size = 48, style }: AvatarProps) {
  const initials = getInitials(firstName, lastName)

  if (photo) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          border: '2px solid rgba(74,74,255,0.15)',
          ...style,
        }}
      >
        <Image src={photo} alt={`${firstName} ${lastName}`} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${COLORS.primary}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <span style={{ fontSize: size * 0.36, fontWeight: 800, color: COLORS.primary }}>{initials}</span>
    </div>
  )
}
