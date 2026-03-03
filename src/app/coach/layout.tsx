'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, PlayCircle, ClipboardCheck, Settings } from 'lucide-react'
import { TeamProvider } from '@/contexts/TeamContext'
import RoleSwitcher from '@/components/ui/RoleSwitcher'
import { pendingReviewItems } from '@/lib/mockData'

const tabs = [
  { id: 'home', label: 'Home', href: '/coach/home', icon: Home },
  { id: 'squad', label: 'Squad', href: '/coach/squad', icon: Users },
  { id: 'watch', label: 'Watch', href: '/coach/watch', icon: PlayCircle },
  { id: 'review', label: 'Review', href: '/coach/review', icon: ClipboardCheck, badge: pendingReviewItems.length },
  { id: 'settings', label: 'Settings', href: '/coach/settings', icon: Settings },
]

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <TeamProvider>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 80, minHeight: '100vh', background: '#F5F6FC' }}>
        {children}
      </div>
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderTop: '1px solid #E8EAED', boxShadow: '0 -2px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: 480, margin: '0 auto', paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}>
          {tabs.map(tab => {
            const isActive = pathname.startsWith(tab.href)
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => router.push(tab.href)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 0', flex: 1, background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
                {isActive && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: '#4A4AFF', borderRadius: '0 0 3px 3px' }} />}
                <Icon size={22} color={isActive ? '#4A4AFF' : '#9DA2B3'} strokeWidth={isActive ? 2.2 : 1.7} />
                {tab.badge && tab.badge > 0 && (
                  <div style={{ position: 'absolute', top: 4, right: 'calc(50% - 16px)', width: 16, height: 16, background: '#F39C12', borderRadius: '50%', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.badge}</div>
                )}
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 600, color: isActive ? '#4A4AFF' : '#9DA2B3' }}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      <RoleSwitcher />
    </TeamProvider>
  )
}
