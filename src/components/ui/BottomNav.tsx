'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Play, Calendar, TrendingUp, Settings, Users, ClipboardList, Dumbbell } from 'lucide-react'
import { COLORS } from '@/lib/constants'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
}

const parentNav: NavItem[] = [
  { id: 'home', label: 'Home', href: '/parent/home', icon: Home },
  { id: 'highlights', label: 'Highlights', href: '/parent/highlights', icon: Play },
  { id: 'matches', label: 'Matches', href: '/parent/matches', icon: Calendar },
  { id: 'development', label: 'Development', href: '/parent/development', icon: TrendingUp },
  { id: 'settings', label: 'Settings', href: '/parent/settings', icon: Settings },
]

const coachNav: NavItem[] = [
  { id: 'squad', label: 'Squad', href: '/coach/squad', icon: Users },
  { id: 'players', label: 'Players', href: '/coach/players', icon: ClipboardList },
  { id: 'sessions', label: 'Sessions', href: '/coach/sessions', icon: Dumbbell },
  { id: 'settings', label: 'Settings', href: '/coach/settings', icon: Settings },
]

export default function BottomNav({ portal }: { portal: 'parent' | 'coach' }) {
  const pathname = usePathname()
  const router = useRouter()
  const items = portal === 'parent' ? parentNav : coachNav

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          maxWidth: 480,
          margin: '0 auto',
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
        }}
      >
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '10px 8px',
                minWidth: 50,
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 3,
                    background: COLORS.primary,
                    borderRadius: '0 0 3px 3px',
                  }}
                />
              )}
              <Icon size={22} color={isActive ? COLORS.primary : COLORS.muted} strokeWidth={isActive ? 2.2 : 1.7} />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: isActive ? COLORS.primary : COLORS.muted,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
