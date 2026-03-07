'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, PlayCircle, ClipboardList, Settings } from 'lucide-react'
import { TeamProvider } from '@/contexts/TeamContext'
import RoleSwitcher from '@/components/ui/RoleSwitcher'

const tabs = [
  { id: 'home', label: 'Home', href: '/coach/home', icon: Home },
  { id: 'squad', label: 'Squad', href: '/coach/squad', icon: Users },
  { id: 'watch', label: 'Watch', href: '/coach/watch', icon: PlayCircle },
  { id: 'hub', label: 'Coach', href: '/coach/hub', icon: ClipboardList },
  { id: 'settings', label: 'Settings', href: '/coach/settings', icon: Settings },
]

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const activeIndex = tabs.findIndex(tab => pathname.startsWith(tab.href))

  return (
    <TeamProvider>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 80, minHeight: '100vh', background: '#F8F9FC' }}>
        {children}
      </div>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#0A0E1A',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-around',
          maxWidth: 480,
          margin: '0 auto',
          height: 64,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          position: 'relative',
        }}>
          {/* Sliding active indicator */}
          {activeIndex >= 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: `calc(${activeIndex * 20 + 10}% - 1px)`,
              width: 2,
              height: 20,
              background: '#4A4AFF',
              borderRadius: 1,
              transition: 'left 300ms ease',
            }} />
          )}

          {tabs.map(tab => {
            const isActive = pathname.startsWith(tab.href)
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: 0,
                }}
              >
                {/* Pill background + icon + label container */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '4px 16px',
                  borderRadius: 12,
                  background: isActive ? 'rgba(74,74,255,0.12)' : 'transparent',
                  position: 'relative',
                }}>
                  {/* Icon wrapper for badge positioning */}
                  <div style={{ position: 'relative', lineHeight: 0 }}>
                    <Icon
                      size={22}
                      color={isActive ? '#4A4AFF' : '#64748B'}
                      strokeWidth={isActive ? 2.2 : 1.7}
                    />
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#4A4AFF' : '#64748B',
                  }}>
                    {tab.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </nav>
      <RoleSwitcher />
    </TeamProvider>
  )
}
