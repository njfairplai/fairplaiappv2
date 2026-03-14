'use client'

import { Bell } from 'lucide-react'
import { COLORS } from '@/lib/constants'

interface NotificationBellProps {
  count?: number
  dark?: boolean
  onClick?: () => void
}

export default function NotificationBell({ count = 0, dark = false, onClick }: NotificationBellProps) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
      <Bell size={22} color={dark ? '#fff' : COLORS.navy} />
      {count > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: COLORS.error,
            border: `2px solid ${dark ? COLORS.darkBg : '#fff'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          {count}
        </div>
      )}
    </button>
  )
}
