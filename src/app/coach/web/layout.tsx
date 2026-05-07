'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, Film, Users, ChevronDown, Smartphone, BarChart3 } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { CoachThemeProvider, useCoachTheme } from '@/contexts/CoachThemeContext'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'
import BottomNav from '@/components/ui/BottomNav'
import { useIsMobile } from '@/hooks/useIsMobile'
import { BRAND, TYPE } from '@/lib/constants'
import { Logo } from '@/components/shared/Logo'
import { seedWelfareIfEmpty } from '@/lib/welfare-store'
import { SoftLockBanner } from '@/components/demo/SoftLockBanner'

/**
 * Brand chrome override for the redesigned Coach Match Analysis route.
 * When the user is on /coach/web/match/[id], the existing coach header +
 * tab bar adopt the sand surface, indigo structure, and Clash Display +
 * Satoshi typography so the chrome and the page read as one designed
 * system. All other coach routes keep the CoachThemeContext-driven look
 * until they get their own redesign pass.
 */
const BRAND_CHROME = {
  headerBg: BRAND.sand,
  headerBorder: BRAND.line,
  headerText: BRAND.indigo,
  headerTextMuted: BRAND.indigoMute,
  textMuted: BRAND.indigoMute,
  textSecondary: BRAND.indigo,
  tabBarBg: BRAND.sand,
  tabBarBorder: BRAND.line,
  tabText: BRAND.indigoMute,
  tabTextActive: BRAND.indigo,
  tabIndicator: BRAND.yellow,
  pageBg: BRAND.sand,
} as const

// Slice 6.3 — top nav swapped to: Hub · Match Center · Players · Highlights.
// "Video" + "Analysis" are dropped; the legacy paths redirect (see
// next.config.ts) so old bookmarks land on the new surfaces. "Players"
// points to the squad-as-pitch view, which IS the all-players surface.
// Per-player profiles live at /coach/web/player/[id]; the IDP editor at
// /coach/web/idps is reachable from the player profile postscript.
const tabs = [
  { href: '/coach/web',              label: 'Hub',          icon: Sparkles,  exact: true },
  { href: '/coach/web/match-center', label: 'Match Center', icon: BarChart3 },
  { href: '/coach/web/squad',        label: 'Players',      icon: Users },
  { href: '/coach/web/highlights',   label: 'Highlights',   icon: Film },
]

function CoachWebLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedRosterId, setSelectedRosterId, availableRosters } = useTeam()
  const { mode, colors: themeColors } = useCoachTheme()
  const isMobile = useIsMobile()

  // Seed welfare demo data on first visit so the smart-flag rail + fatigue
  // chips have shape immediately. Idempotent.
  useEffect(() => { seedWelfareIfEmpty() }, [])

  // Routes that have been redesigned into the brand chrome opt in here.
  // Slice 6.1 added /coach/web/squad (pitch-cluster squad view).
  // Slice 6.1.1 added /coach/web/player/* (filmstrip player profile).
  const isBrandedRoute =
    pathname === '/coach/web' ||
    pathname.startsWith('/coach/web/match/') ||
    pathname === '/coach/web/squad' ||
    pathname.startsWith('/coach/web/player/') ||
    pathname.startsWith('/coach/web/match-center') ||
    pathname.startsWith('/coach/web/highlights') ||
    pathname.startsWith('/coach/web/record')
  const colors = isBrandedRoute ? { ...themeColors, ...BRAND_CHROME } : themeColors
  // Brand fonts are now the default across every coach/web route (chrome
  // unification — Slice 6 polish), even on routes whose body still uses
  // the legacy CoachThemeContext colours.
  const fontFamilyBody = TYPE.body
  const tabFontWeight = 600

  // `overflowX: 'hidden'` was previously set on the parent flex
  // column to suppress horizontal scrollbars on edge cases. We
  // dropped it: it silently created a scroll context that broke
  // `position: sticky` on the header + tab bar. `maxWidth: '100vw'`
  // on the parent covers the original concern.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.pageBg, maxWidth: '100vw', fontFamily: fontFamilyBody }}>
      <SoftLockBanner />
      {/* Header bar — sticky so the logo + team selector + avatar
       *  stay visible as the page content scrolls beneath. */}
      <header style={{
        height: isMobile ? 52 : 60, flexShrink: 0,
        background: colors.headerBg,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 24px',
        borderBottom: `1px solid ${colors.headerBorder}`,
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {isBrandedRoute ? (
          <Logo height={isMobile ? 22 : 28} style={{ flexShrink: 0 }} />
        ) : (
          <Image
            src={mode === 'light' ? '/logo-black.png' : '/logo-white.png'}
            alt="Fairplai"
            width={100}
            height={28}
            style={{ height: isMobile ? 24 : 28, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16, minWidth: 0 }}>
          {/* Team selector */}
          <div style={{ position: 'relative', minWidth: 0 }}>
            <select
              value={selectedRosterId}
              onChange={e => setSelectedRosterId(e.target.value)}
              style={{
                padding: isMobile ? '6px 22px 6px 8px' : '7px 30px 7px 12px',
                borderRadius: 8,
                background: isBrandedRoute ? BRAND.paper : (mode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.06)'),
                border: `1px solid ${isBrandedRoute ? BRAND.line : (mode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.1)')}`,
                color: colors.headerText, fontSize: isMobile ? 11 : 13, fontWeight: 600,
                fontFamily: TYPE.body,
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
              background: isBrandedRoute ? BRAND.indigoSoft : (mode === 'light' ? 'rgba(74,74,255,0.06)' : 'rgba(74,74,255,0.12)'),
              border: `1px solid ${isBrandedRoute ? 'rgba(27,21,80,0.18)' : (mode === 'light' ? 'rgba(74,74,255,0.15)' : 'rgba(74,74,255,0.25)')}`,
              cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
              fontFamily: TYPE.body,
            }}
          >
            <Smartphone size={isMobile ? 14 : 14} color={isBrandedRoute ? BRAND.indigo : '#4A4AFF'} />
            {!isMobile && <span style={{ fontSize: 12, fontWeight: 600, color: isBrandedRoute ? BRAND.indigo : '#4A4AFF' }}>Mobile</span>}
          </button>

          {/* Coach label (avatar only on mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: '50%',
              background: isBrandedRoute ? BRAND.indigo : 'rgba(74,74,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: isMobile ? 11 : 13, fontWeight: 700,
                color: isBrandedRoute ? BRAND.sand : '#4A4AFF',
                fontFamily: TYPE.display,
              }}>CA</span>
            </div>
            {!isMobile && (
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: colors.headerTextMuted,
                fontFamily: TYPE.body,
              }}>Coach Ali</span>
            )}
          </div>
        </div>
      </header>

      {/* Top tab bar — desktop only. Sticky beneath the header so the
       *  Hub / Match Center / Players / Highlights tabs stay anchored
       *  while the page scrolls. On mobile the same four tabs surface
       *  as a fixed bottom bar (BottomNav portal="coachWeb") and the
       *  top tab bar is hidden to avoid duplicate navigation. */}
      <nav style={{
        height: 48, flexShrink: 0,
        background: colors.tabBarBg,
        display: isMobile ? 'none' : 'flex',
        alignItems: 'stretch',
        padding: '0 24px',
        gap: 4,
        borderBottom: `1px solid ${colors.tabBarBorder}`,
        position: 'sticky',
        top: isMobile ? 52 : 60,
        zIndex: 39,
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
                color: isActive ? colors.tabTextActive : colors.tabText,
                fontSize: isBrandedRoute ? 12.5 : 14,
                fontWeight: isActive ? 700 : (tabFontWeight ?? 500),
                fontFamily: TYPE.body,
                letterSpacing: isBrandedRoute ? '0.06em' : 'normal',
                textTransform: isBrandedRoute ? ('uppercase' as const) : ('none' as const),
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
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Content. Letting the document scroll (not main) so the
       *  sticky header + tab bar above actually catch at the top.
       *  On mobile we pad the bottom of the page so the last surface
       *  row never sits hidden behind the fixed BottomNav. */}
      <main
        style={{
          flex: 1,
          paddingBottom: isMobile ? 72 : 0,
        }}
      >
        {children}
      </main>

      {/* Mobile bottom nav — same four tabs as the desktop top bar. */}
      {isMobile && <BottomNav portal="coachWeb" />}

      <FeedbackOverlay bottomOffset={isMobile ? 80 : 16} />
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
