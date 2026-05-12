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
    <div className="relative shrink-0" style={{ width: px, height: px }}>
      {hasPhoto ? (
        <Image
          src={player.photo!}
          alt={`${player.firstName} ${player.lastName}`}
          width={px}
          height={px}
          className="rounded-full object-cover object-top border-2 border-white/15"
          style={{ width: px, height: px }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="rounded-full text-white font-bold flex items-center justify-center"
          style={{
            width: px,
            height: px,
            background: getPositionGradient(position),
            fontSize: fontMap[size],
          }}
        >
          {initials}
        </div>
      )}
      {showJersey && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-brand-indigo text-white font-bold flex items-center justify-center border-2 border-white"
          style={{
            width: jerseySize[size],
            height: jerseySize[size],
            fontSize: jerseyFont[size],
          }}
        >
          {player.jerseyNumber}
        </div>
      )}
    </div>
  )
}
