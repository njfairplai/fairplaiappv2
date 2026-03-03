'use client'

import Image from 'next/image'
import { COLORS } from '@/lib/constants'
import { Bell } from 'lucide-react'

interface TopBarProps {
  title?: string
  showLogo?: boolean
  showNotification?: boolean
  rightContent?: React.ReactNode
  dark?: boolean
}

export default function TopBar({ title, showLogo = false, showNotification = false, rightContent, dark = false }: TopBarProps) {
  const textColor = dark ? '#fff' : COLORS.navy

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        background: dark ? 'transparent' : '#fff',
        borderBottom: dark ? 'none' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showLogo && (
          <Image
            src={dark ? '/logo-white.png' : '/logo-black.png'}
            alt="FairplAI"
            width={80}
            height={24}
            style={{ height: 24, width: 'auto', objectFit: 'contain' }}
          />
        )}
        {title && (
          <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, letterSpacing: '-0.4px', margin: 0 }}>
            {title}
          </h1>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showNotification && (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
            <Bell size={22} color={textColor} />
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: COLORS.error,
                border: '2px solid #fff',
              }}
            />
          </button>
        )}
        {rightContent}
      </div>
    </div>
  )
}
