'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, Film, Users, FileText, ChevronDown, Smartphone, BarChart3, Sun, Moon } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { CoachThemeProvider, useCoachTheme } from '@/contexts/CoachThemeContext'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'
import { useIsMobile } from '@/hooks/useIsMobile'

const tabs = [
  { href: '/coach/web', label: "Coach's Hub", icon: Sparkles, exact: true },
  { href: '/coach/web/video', label: 'Video', icon: Film },
  { href: '/coach/web/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/coach/web/squad', label: 'Squad', icon: Users },
  { href: '/coach/web/idps', label: 'IDPs', icon: FileText },
]

function CoachWebLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedRosterId, setSelectedRosterId, availableRosters } = useTeam()
  const { mode, colors, toggleTheme } = useCoachTheme()
  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.pageBg, maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header bar */}
      <header style={{
        height: isMobile ? 52 : 60, flexShrink: 0,
        background: colors.headerBg,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 24px',
        borderBottom: `1px solid ${colors.headerBorder}`,
        gap: 8,
      }}>
        <Image
          src={mode === 'light' ? '/logo-black.png' : '/logo-white.png'}
          alt="FairplAI"
          width={100}
          height={28}
          style={{ height: isMobile ? 24 : 28, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16, minWidth: 0 }}>
          {/* Team selector */}
          <div style={{ position: 'relative', minWidth: 0 }}>
            <select
              value={selectedRosterId}
              onChange={e => setSelectedRosterId(e.target.value)}
              style={{
                padding: isMobile ? '6px 22px 6px 8px' : '7px 30px 7px 12px',
                borderRadius: 8,
                background: mode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${mode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.1)'}`,
                color: colors.headerText, fontSize: isMobile ? 11 : 13, fontWeight: 600,
                cursor: 'pointer', outline: 'none',
                appearance: 'none', WebkitAppearance: 'none',
                maxWidth: isMobile ? 110 : 'none',
              }}
            >
              <option value="all" style={{ background: colors.headerBg, color: colors.headerText }}>All Teams</option>
              {availableRosters.map(r => (
                <option key={r.id} value={r.id} style={{ background: colors.headerBg, color: colors.headerText }}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown size={isMobile ? 11 : 13} color={colors.textMuted} style={{ position: 'absolute', right: isMobile ? 6 : 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 8,
              background: mode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${mode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
            }}
          >
            {mode === 'light'
              ? <Moon size={isMobile ? 14 : 16} color="#64748B" />
              : <Sun size={isMobile ? 14 : 16} color="#F59E0B" />
            }
          </button>

          {/* Switch to Mobile (icon only on mobile) */}
          <button
            onClick={() => {
              localStorage.setItem('fairplai_switch_from', pathname)
              router.push('/coach/home')
            }}
            title="Switch to mobile app"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isMobile ? 0 : '6px 12px',
              width: isMobile ? 32 : 'auto', height: isMobile ? 32 : 'auto',
              justifyContent: 'center',
              borderRadius: 8,
              background: mode === 'light' ? 'rgba(74,74,255,0.06)' : 'rgba(74,74,255,0.12)',
              border: `1px solid ${mode === 'light' ? 'rgba(74,74,255,0.15)' : 'rgba(74,74,255,0.25)'}`,
              cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
            }}
          >
            <Smartphone size={isMobile ? 14 : 14} color="#4A4AFF" />
            {!isMobile && <span style={{ fontSize: 12, fontWeight: 600, color: '#4A4AFF' }}>Mobile</span>}
          </button>

          {/* Coach label (avatar only on mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: '50%', background: 'rgba(74,74,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: '#4A4AFF' }}>CA</span>
            </div>
            {!isMobile && (
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.headerTextMuted }}>Coach Ali</span>
            )}
          </div>
        </div>
      </header>

      {/* Tab bar (horizontally scrollable on mobile, icon-only) */}
      <nav style={{
        height: isMobile ? 44 : 48, flexShrink: 0,
        background: colors.tabBarBg,
        display: 'flex', alignItems: 'stretch',
        padding: isMobile ? '0 4px' : '0 24px',
        gap: isMobile ? 0 : 4,
        borderBottom: `1px solid ${colors.tabBarBorder}`,
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
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
                display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 8,
                padding: isMobile ? '0 10px' : '0 16px',
                border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: isActive ? colors.tabTextActive : colors.tabText,
                fontSize: isMobile ? 12 : 14, fontWeight: isActive ? 700 : 500,
                borderBottom: isActive ? `3px solid ${colors.tabIndicator}` : '3px solid transparent',
                transition: 'all 0.15s ease',
                marginBottom: -1, flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = colors.textSecondary
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = colors.tabText
              }}
            >
              <Icon size={isMobile ? 14 : 16} />
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

export default function CoachWebLayout({ children }: { children: React.ReactNode }) {
  return (
    <CoachThemeProvider>
      <CoachWebLayoutInner>{children}</CoachWebLayoutInner>
    </CoachThemeProvider>
  )
}
