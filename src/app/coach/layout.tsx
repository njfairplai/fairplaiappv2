'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Home, Users, ClipboardList, Circle, Settings } from 'lucide-react'
import { TeamProvider } from '@/contexts/TeamContext'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'

const tabs = [
  { id: 'home', label: 'Home', href: '/coach/home', icon: Home },
  { id: 'prep', label: 'Prep', href: '/coach/insights', icon: ClipboardList },
  { id: 'record', label: 'Record', href: '/coach/record', icon: Circle },
  { id: 'squad', label: 'Squad', href: '/coach/squad', icon: Users },
  { id: 'settings', label: 'Settings', href: '/coach/settings', icon: Settings },
]

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const role = typeof window !== 'undefined' ? localStorage.getItem('fairplai_role') : null
  useEffect(() => { if (role && role !== 'coach') router.replace('/login') }, [role, router])
  if (role && role !== 'coach') return null

  const activeIndex = tabs.findIndex(tab => pathname.startsWith(tab.href))

  // Video portal & web portal get their own layouts — skip mobile chrome
  if (pathname.startsWith('/coach/video') || pathname.startsWith('/coach/web')) {
    return <TeamProvider>{children}</TeamProvider>
  }

  return (
    <TeamProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#0A0E1A',
      }}>
        {/* Scrollable content area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#F8F9FC',
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </div>

        {/* Bottom tab bar — always visible, no position:fixed */}
        <nav style={{
          flexShrink: 0,
          background: '#0A0E1A',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-around',
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
              const isRecord = tab.id === 'record'
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
                    background: isActive ? (isRecord ? 'rgba(239,68,68,0.12)' : 'rgba(74,74,255,0.12)') : 'transparent',
                    position: 'relative',
                  }}>
                    {/* Icon wrapper for badge positioning */}
                    <div style={{ position: 'relative', lineHeight: 0 }}>
                      <Icon
                        size={22}
                        color={isRecord ? '#EF4444' : (isActive ? '#4A4AFF' : '#64748B')}
                        strokeWidth={isActive ? 2.2 : 1.7}
                        fill={isRecord ? '#EF4444' : 'none'}
                      />
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: isActive ? 700 : 500,
                      color: isRecord ? '#EF4444' : (isActive ? '#4A4AFF' : '#64748B'),
                    }}>
                      {tab.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
      <FeedbackOverlay bottomOffset={90} />
    </TeamProvider>
  )
}
