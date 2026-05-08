'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MessageSquare, Users, ClipboardList, UserCheck, BookOpen, Calendar, BarChart3, CreditCard, FileText, Inbox } from 'lucide-react'
import { ADMIN_UNLOCKED_KEY } from '@/lib/admin-gate'

const COLORS = { primary: '#4A4AFF', muted: '#6E7180', border: '#E8EAED' }
const navItems = [
  { href: '/admin/dashboard', label: 'Command Centre', icon: MessageSquare },
  { href: '/admin/rosters', label: 'Squads', icon: ClipboardList },
  { href: '/admin/players', label: 'Players', icon: Users },
  { href: '/admin/coaches', label: 'Coaches', icon: UserCheck },
  { href: '/admin/recurring-sessions', label: 'Recurring Sessions', icon: BookOpen },
  { href: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { href: '/admin/team-stats', label: 'Team Stats', icon: BarChart3 },
  { href: '/admin/credits', label: 'Credits', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/feedback', label: 'User Feedback', icon: Inbox },
]

/**
 * Admin shell — gates everything under /admin behind the founder-only
 * unlock (password "FairPlay 911" — see /admin/unlock).
 *
 * Three render shapes:
 *   1. /admin/unlock        — bare (no chrome), the password screen.
 *   2. /admin (root)        — portal picker, no sidebar (this is the
 *                              founder's launch page once unlocked).
 *   3. /admin/<subroute>    — academy admin shell with sidebar nav
 *                              (Command Centre, Squads, Players, etc).
 *
 * The unlock state lives in localStorage and is intentionally long-lived
 * (no expiry). It's a soft gate to keep curious clickers out, NOT a
 * security boundary — anyone with devtools can flip it. Acceptable
 * because there's no real backend auth on the platform yet.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [unlocked, setUnlocked] = useState<boolean | null>(null)

  // Read unlock state on mount only — null means "haven't checked yet"
  // so we don't flash the gate before SSR hydration completes.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setUnlocked(localStorage.getItem(ADMIN_UNLOCKED_KEY) === 'true')
  }, [])

  const isUnlockPage = pathname === '/admin/unlock'

  useEffect(() => {
    if (unlocked === null) return
    if (!unlocked && !isUnlockPage) router.replace('/admin/unlock')
  }, [unlocked, isUnlockPage, router])

  // Pre-hydration: render nothing to avoid the flash.
  if (unlocked === null) return null
  // Locked + not on unlock page: redirect is in flight.
  if (!unlocked && !isUnlockPage) return null

  // Unlock page itself: bare wrapper, no chrome.
  if (isUnlockPage) {
    return <>{children}</>
  }

  // Portal picker (root /admin): unlocked but no sidebar — the picker
  // is its own visual treatment and doesn't belong inside the academy
  // admin shell.
  if (pathname === '/admin') {
    return <>{children}</>
  }

  // Academy admin sub-routes: full sidebar shell.
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: '#fff', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40 }}>
        <div style={{ padding: '24px 20px 16px' }}><Image src="/logo-black.png" alt="FairplAI" width={100} height={30} style={{ height: 30, width: 'auto', objectFit: 'contain' }} /></div>
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (<button key={item.href} onClick={() => router.push(item.href)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2, background: isActive ? `${COLORS.primary}12` : 'transparent', color: isActive ? COLORS.primary : COLORS.muted, fontSize: 14, fontWeight: isActive ? 700 : 500, textAlign: 'left', transition: 'all 0.15s ease' }}><Icon size={18} />{item.label}</button>)
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.border}` }}>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: COLORS.primary, fontWeight: 600, marginBottom: 4 }}
          >
            ← All portals
          </button>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>MAK Academy</p>
          <p style={{ fontSize: 11, color: '#9DA2B3', margin: 0 }}>admin@makacademy.com</p>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, background: '#F5F6FC', minHeight: '100vh' }}>{children}</main>
    </div>
  )
}
