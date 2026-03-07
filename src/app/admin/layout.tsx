'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import RoleSwitcher from '@/components/ui/RoleSwitcher'
import { LayoutDashboard, Users, ClipboardList, UserCheck, Calendar, CreditCard, FileText } from 'lucide-react'

const COLORS = { primary: '#4A4AFF', muted: '#6E7180', border: '#E8EAED' }
const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/rosters', label: 'Rosters', icon: ClipboardList },
  { href: '/admin/players', label: 'Players', icon: Users },
  { href: '/admin/coaches', label: 'Coaches', icon: UserCheck },
  { href: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { href: '/admin/credits', label: 'Credits', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
]

export default function AcademyAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
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
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.border}` }}><p style={{ fontSize: 12, color: COLORS.muted }}>MAK Academy</p><p style={{ fontSize: 11, color: '#9DA2B3' }}>admin@makacademy.com</p></div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, background: '#F5F6FC', minHeight: '100vh' }}>{children}</main>
      <RoleSwitcher />
    </div>
  )
}
