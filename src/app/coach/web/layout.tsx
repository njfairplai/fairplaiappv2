'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, Film, Users, FileText, ChevronDown, Smartphone } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'

const tabs = [
  { href: '/coach/web', label: "Coach's Hub", icon: Sparkles, exact: true },
  { href: '/coach/web/video', label: 'Video', icon: Film },
  { href: '/coach/web/squad', label: 'Squad', icon: Users },
  { href: '/coach/web/idps', label: 'IDPs', icon: FileText },
]

export default function CoachWebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedRosterId, setSelectedRosterId, availableRosters } = useTeam()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F5F6FC' }}>
      {/* Header bar */}
      <header style={{
        height: 60, flexShrink: 0,
        background: '#0A0E1A',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Image src="/logo-white.png" alt="FairplAI" width={100} height={28} style={{ height: 28, width: 'auto', objectFit: 'contain' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Team selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedRosterId}
              onChange={e => setSelectedRosterId(e.target.value)}
              style={{
                padding: '7px 30px 7px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#F8FAFC', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', outline: 'none',
                appearance: 'none', WebkitAppearance: 'none',
              }}
            >
              {availableRosters.map(r => (
                <option key={r.id} value={r.id} style={{ background: '#0A0E1A', color: '#F8FAFC' }}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} color="rgba(248,250,252,0.4)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Switch to Mobile */}
          <button
            onClick={() => {
              localStorage.setItem('fairplai_switch_from', pathname)
              router.push('/coach/home')
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(74,74,255,0.12)', border: '1px solid rgba(74,74,255,0.25)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(74,74,255,0.2)'
              e.currentTarget.style.borderColor = 'rgba(74,74,255,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(74,74,255,0.12)'
              e.currentTarget.style.borderColor = 'rgba(74,74,255,0.25)'
            }}
          >
            <Smartphone size={14} color="#4A4AFF" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4A4AFF' }}>Mobile</span>
          </button>

          {/* Coach label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(74,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4A4AFF' }}>CA</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(248,250,252,0.7)' }}>Coach Ali</span>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav style={{
        height: 48, flexShrink: 0,
        background: '#0F1629',
        display: 'flex', alignItems: 'stretch',
        padding: '0 24px',
        gap: 4,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {tabs.map(tab => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          const Icon = tab.icon

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 16px',
                border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: isActive ? '#fff' : 'rgba(248,250,252,0.5)',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                borderBottom: isActive ? '3px solid #4A4AFF' : '3px solid transparent',
                transition: 'all 0.15s ease',
                marginBottom: -1,
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = 'rgba(248,250,252,0.8)'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = 'rgba(248,250,252,0.5)'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>

      <FeedbackOverlay bottomOffset={16} />
    </div>
  )
}
