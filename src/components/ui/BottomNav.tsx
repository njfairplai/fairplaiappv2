'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Play, Calendar, TrendingUp, Settings, Users, ClipboardList, Dumbbell, User } from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { playerTokens } from '@/styles/player-tokens'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
}

const parentNav: NavItem[] = [
  { id: 'home', label: 'Home', href: '/parent/home', icon: Home },
  { id: 'highlights', label: 'Highlights', href: '/parent/highlights', icon: Play },
  { id: 'matches', label: 'Schedule', href: '/parent/matches', icon: Calendar },
  { id: 'development', label: 'Progress', href: '/parent/development', icon: TrendingUp },
  { id: 'settings', label: 'Settings', href: '/parent/settings', icon: Settings },
]

const playerNav: NavItem[] = [
  { id: 'home', label: 'Home', href: '/player/home', icon: Home },
  { id: 'sessions', label: 'Sessions', href: '/player/sessions', icon: Calendar },
  { id: 'highlights', label: 'Highlights', href: '/player/highlights', icon: Play },
  { id: 'profile', label: 'Profile', href: '/player/profile', icon: User },
]

const coachNav: NavItem[] = [
  { id: 'squad', label: 'Squad', href: '/coach/squad', icon: Users },
  { id: 'players', label: 'Players', href: '/coach/players', icon: ClipboardList },
  { id: 'sessions', label: 'Sessions', href: '/coach/sessions', icon: Dumbbell },
  { id: 'settings', label: 'Settings', href: '/coach/settings', icon: Settings },
]

export default function BottomNav({ portal }: { portal: 'parent' | 'coach' | 'player' }) {
  const pathname = usePathname()
  const router = useRouter()
  const items = portal === 'player' ? playerNav : portal === 'parent' ? parentNav : coachNav
  const accentColor = portal === 'player' ? playerTokens.primary : COLORS.primary

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
                    background: accentColor,
                    borderRadius: '0 0 3px 3px',
                  }}
                />
              )}
              <Icon size={22} color={isActive ? accentColor : COLORS.muted} strokeWidth={isActive ? 2.2 : 1.7} />
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
