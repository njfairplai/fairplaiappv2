'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, Film, Users, ChevronDown, BarChart3 } from 'lucide-react'
import { useTeam } from '@/contexts/TeamContext'
import { CoachThemeProvider, useCoachTheme } from '@/contexts/CoachThemeContext'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'
import BottomNav from '@/components/ui/BottomNav'
import { useIsMobile } from '@/hooks/useIsMobile'
import { BRAND } from '@/lib/constants'
import { Logo } from '@/components/shared/Logo'
import { seedWelfareIfEmpty } from '@/lib/welfare-store'
import { SoftLockBanner } from '@/components/demo/SoftLockBanner'
import { PortalToggleFab } from '@/components/demo/PortalToggleFab'
import { useTourSafe } from '@/components/demo/TourProvider'

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
  { href: '/coach/web',              label: 'Hub',          icon: Sparkles,  exact: true, tourTab: 'hub' as const },
  { href: '/coach/web/match-center', label: 'Match Center', icon: BarChart3,              tourTab: 'match-center' as const },
  { href: '/coach/web/squad',        label: 'Players',      icon: Users,                  tourTab: 'players' as const },
  { href: '/coach/web/highlights',   label: 'Highlights',   icon: Film,                   tourTab: 'highlights' as const },
]

function CoachWebLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedRosterId, setSelectedRosterId, availableRosters } = useTeam()
  const { mode, colors: themeColors } = useCoachTheme()
  const isMobile = useIsMobile()
  const tour = useTourSafe()
  const tourLockedTab = tour?.active && tour.step?.tab ? tour.step.tab : null

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
    pathname.startsWith('/coach/web/record') ||
    pathname.startsWith('/coach/web/idps')
  const colors = isBrandedRoute ? { ...themeColors, ...BRAND_CHROME } : themeColors
  // Brand fonts are now the default across every coach/web route (chrome
  // unification — Slice 6 polish), even on routes whose body still uses
  // the legacy CoachThemeContext colours. Body font + tab weight live in
  // the Tailwind classes below (font-satoshi + font-semibold/bold).

  // `overflowX: 'hidden'` was previously set on the parent flex
  // column to suppress horizontal scrollbars on edge cases. We
  // dropped it: it silently created a scroll context that broke
  // `position: sticky` on the header + tab bar. `maxWidth: '100vw'`
  // on the parent covers the original concern.
  return (
    <div
      className="flex flex-col min-h-screen max-w-[100vw] font-satoshi bg-[var(--coach-page-bg)]"
      style={{
        ['--coach-page-bg' as string]: colors.pageBg,
        ['--coach-header-bg' as string]: colors.headerBg,
        ['--coach-header-border' as string]: colors.headerBorder,
        ['--coach-header-text' as string]: colors.headerText,
        ['--coach-header-text-muted' as string]: colors.headerTextMuted,
        ['--coach-text-muted' as string]: colors.textMuted,
        ['--coach-text-secondary' as string]: colors.textSecondary,
        ['--coach-tabbar-bg' as string]: colors.tabBarBg,
        ['--coach-tabbar-border' as string]: colors.tabBarBorder,
        ['--coach-tab-text' as string]: colors.tabText,
        ['--coach-tab-text-active' as string]: colors.tabTextActive,
        ['--coach-tab-indicator' as string]: colors.tabIndicator,
      }}
    >
      <SoftLockBanner />
      {/* Header bar — sticky so the logo + team selector + avatar
       *  stay visible as the page content scrolls beneath. */}
      <header className="h-[52px] md:h-[60px] flex-shrink-0 flex items-center justify-between px-3 md:px-6 gap-2 sticky top-0 z-40 border-b border-b-[var(--coach-header-border)] bg-[var(--coach-header-bg)]">
        {isBrandedRoute ? (
          <Logo height={isMobile ? 22 : 28} className="flex-shrink-0" />
        ) : (
          <Image
            src={mode === 'light' ? '/logo-black.png' : '/logo-white.png'}
            alt="Fairplai"
            width={100}
            height={28}
            className="h-6 md:h-7 w-auto object-contain flex-shrink-0"
          />
        )}

        <div className="flex items-center gap-1.5 md:gap-4 min-w-0">
          {/* Team selector */}
          <div className="relative min-w-0">
            <select
              value={selectedRosterId}
              onChange={e => setSelectedRosterId(e.target.value)}
              className={
                'font-satoshi font-semibold cursor-pointer outline-none appearance-none [-webkit-appearance:none] rounded-lg py-1.5 pl-2 pr-[22px] md:py-[7px] md:pl-3 md:pr-[30px] text-[11px] md:text-[13px] max-w-[110px] md:max-w-none border text-[var(--coach-header-text)] ' +
                (isBrandedRoute
                  ? 'bg-brand-paper border-brand-line'
                  : mode === 'light'
                  ? 'bg-[#F1F5F9] border-[#E2E8F0]'
                  : 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)]')
              }
            >
              <option value="all" className="bg-[var(--coach-header-bg)] text-[var(--coach-header-text)]">All Teams</option>
              {availableRosters.map(r => (
                <option key={r.id} value={r.id} className="bg-[var(--coach-header-bg)] text-[var(--coach-header-text)]">
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={isMobile ? 11 : 13}
              color={colors.textMuted}
              className="absolute right-1.5 md:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Mobile-app switch button intentionally removed for the demo
           *  build — mobile coach app isn't part of the demo scope and
           *  the button confuses testers. Keep the import out too. */}

          {/* Coach label (avatar only on mobile) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={
                'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ' +
                (isBrandedRoute ? 'bg-brand-indigo' : 'bg-[rgba(74,74,255,0.15)]')
              }
            >
              <span
                className={
                  'font-clash font-bold text-[11px] md:text-[13px] ' +
                  (isBrandedRoute ? 'text-brand-sand' : 'text-[#4A4AFF]')
                }
              >CA</span>
            </div>
            {!isMobile && (
              <span className="font-satoshi text-[13px] font-semibold text-[var(--coach-header-text-muted)]">Coach Ali</span>
            )}
          </div>
        </div>
      </header>

      {/* Top tab bar — desktop only. Sticky beneath the header so the
       *  Hub / Match Center / Players / Highlights tabs stay anchored
       *  while the page scrolls. On mobile the same four tabs surface
       *  as a fixed bottom bar (BottomNav portal="coachWeb") and the
       *  top tab bar is hidden to avoid duplicate navigation. */}
      <nav className="h-12 flex-shrink-0 hidden md:flex items-stretch px-6 gap-1 sticky top-[60px] z-[39] border-b bg-[var(--coach-tabbar-bg)] border-b-[var(--coach-tabbar-border)]">
        {tabs.map(tab => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          const Icon = tab.icon
          // Tour locks navigation: only the current step's tab is clickable.
          const tourLocked = tourLockedTab !== null && tourLockedTab !== tab.tourTab

          return (
            <button
              key={tab.href}
              onClick={() => {
                if (tourLocked) return
                router.push(tab.href)
              }}
              disabled={tourLocked}
              aria-disabled={tourLocked}
              title={tourLocked ? 'Locked during the guided tour. Use Next → in the tour card to advance.' : undefined}
              className={
                'flex items-center gap-2 px-4 border-none bg-transparent font-satoshi transition-all duration-150 -mb-px flex-shrink-0 whitespace-nowrap ' +
                (tourLocked ? 'cursor-not-allowed opacity-[0.32]' : 'cursor-pointer opacity-100') + ' ' +
                (isBrandedRoute ? 'text-[12.5px] tracking-[0.06em] uppercase' : 'text-sm normal-case tracking-normal') + ' ' +
                (isActive
                  ? 'text-[var(--coach-tab-text-active)] font-bold border-b-[3px] border-b-[var(--coach-tab-indicator)]'
                  : 'text-[var(--coach-tab-text)] font-semibold border-b-[3px] border-b-transparent')
              }
              onMouseEnter={e => {
                if (!isActive && !tourLocked) e.currentTarget.style.color = colors.textSecondary
              }}
              onMouseLeave={e => {
                if (!isActive && !tourLocked) e.currentTarget.style.color = colors.tabText
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
      <main className="flex-1 pb-[72px] md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav — same four tabs as the desktop top bar. */}
      {isMobile && <BottomNav portal="coachWeb" />}

      <FeedbackOverlay bottomOffset={isMobile ? 80 : 16} />
      <PortalToggleFab />
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
