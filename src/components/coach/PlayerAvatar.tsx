'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { Player } from '@/lib/types'

const sizeMap = { sm: 36, md: 52, lg: 72, xl: 96 } as const
const fontMap = { sm: 12, md: 16, lg: 24, xl: 32 } as const
const jerseySize = { sm: 20, md: 20, lg: 24, xl: 24 } as const
const jerseyFont = { sm: 10, md: 10, lg: 12, xl: 12 } as const

function getPositionGradient(position: string): string {
  if (position === 'GK') return 'linear-gradient(135deg, #F39C12, #E67E22)'
  if (['CB', 'LB', 'RB'].includes(position)) return 'linear-gradient(135deg, #27AE60, #1E8449)'
  if (['CM', 'AM', 'DM', 'CDM'].includes(position)) return 'linear-gradient(135deg, #4A4AFF, #3025AE)'
  if (['ST', 'CF', 'LW', 'RW'].includes(position)) return 'linear-gradient(135deg, #E74C3C, #C0392B)'
  return 'linear-gradient(135deg, #6E7180, #40424D)'
}

interface PlayerAvatarProps {
  player: Player
  size: 'sm' | 'md' | 'lg' | 'xl'
  showJersey?: boolean
}

export default function PlayerAvatar({ player, size, showJersey }: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const px = sizeMap[size]
  const position = player.position[0] || 'CM'
  const initials = (player.firstName[0] || '') + (player.lastName[0] || '')
  const hasPhoto = !!player.photo && !imgError

  return (
    <div style={{ position: 'relative', width: px, height: px, flexShrink: 0 }}>
      {hasPhoto ? (
        <Image
          src={player.photo!}
          alt={`${player.firstName} ${player.lastName}`}
          width={px}
          height={px}
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            objectFit: 'cover',
            objectPosition: 'top',
            border: '2px solid rgba(255,255,255,0.15)',
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            background: getPositionGradient(position),
            color: '#fff',
            fontSize: fontMap[size],
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initials}
        </div>
      )}
      {showJersey && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: jerseySize[size],
            height: jerseySize[size],
            borderRadius: '50%',
            background: '#1B1650',
            color: '#fff',
            fontSize: jerseyFont[size],
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
          }}
        >
          {player.jerseyNumber}
        </div>
      )}
    </div>
  )
}
