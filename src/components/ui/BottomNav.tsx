'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Play, Calendar, TrendingUp, Settings, Users, ClipboardList, Dumbbell, User, BarChart3, MessageSquare, Sparkles, Film } from 'lucide-react'
import { useTourSafe } from '@/components/demo/TourProvider'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  /** When true, active state is `pathname === href`. When false (default),
   *  active state matches `pathname.startsWith(href)` so child routes
   *  (e.g. /coach/web/match-center?session=feb24) light up the parent tab. */
  exact?: boolean
}

// Parent + player share the same 5-tab structure (single portal, two
// audiences). Settings lives behind the avatar menu, not as a tab.
// Schedule folds into Stats (forward-looking match-list) + Home (next-up
// footer card) — no dedicated tab.
const parentNav: NavItem[] = [
  { id: 'home', label: 'Home', href: '/parent/home', icon: Home },
  { id: 'stats', label: 'Stats', href: '/parent/stats', icon: BarChart3 },
  { id: 'highlights', label: 'Highlights', href: '/parent/highlights', icon: Play },
  { id: 'development', label: 'Progress', href: '/parent/development', icon: TrendingUp },
  { id: 'hub', label: 'Hub', href: '/parent/hub', icon: MessageSquare },
]

const playerNav: NavItem[] = [
  { id: 'home', label: 'Home', href: '/player/home', icon: Home },
  { id: 'stats', label: 'Stats', href: '/player/stats', icon: BarChart3 },
  { id: 'highlights', label: 'Highlights', href: '/player/highlights', icon: Play },
  { id: 'development', label: 'Progress', href: '/player/development', icon: TrendingUp },
  { id: 'hub', label: 'Hub', href: '/player/hub', icon: MessageSquare },
]

const coachNav: NavItem[] = [
  { id: 'squad', label: 'Squad', href: '/coach/squad', icon: Users },
  { id: 'players', label: 'Players', href: '/coach/players', icon: ClipboardList },
  { id: 'sessions', label: 'Sessions', href: '/coach/sessions', icon: Dumbbell },
  { id: 'settings', label: 'Settings', href: '/coach/settings', icon: Settings },
]

/** Coach web app — same four tabs as the desktop top nav, surfaced as
 *  a bottom bar on mobile. The desktop top nav handles >=768px; this
 *  component only mounts <768px and the layout hides the top tabs to
 *  avoid duplicate navigation. */
const coachWebNav: NavItem[] = [
  { id: 'hub', label: 'Hub', href: '/coach/web', icon: Sparkles, exact: true },
  { id: 'match-center', label: 'Match', href: '/coach/web/match-center', icon: BarChart3 },
  { id: 'players', label: 'Players', href: '/coach/web/squad', icon: Users },
  { id: 'highlights', label: 'Highlights', href: '/coach/web/highlights', icon: Film },
]

export default function BottomNav({ portal }: { portal: 'parent' | 'coach' | 'coachWeb' | 'player' }) {
  const pathname = usePathname()
  const router = useRouter()
  const tour = useTourSafe()
  const items =
    portal === 'player'
      ? playerNav
      : portal === 'parent'
      ? parentNav
      : portal === 'coachWeb'
      ? coachWebNav
      : coachNav

  // When the tour is active, every tab except the current step's `tab`
  // gets greyed out + disabled. Keeps the user on the curated path
  // without dimming things they CAN click (within-page elements). Only
  // applies to portals the tour actually walks (parent + coachWeb).
  const tourActiveLockedTab =
    tour?.active && tour.step?.tab && (portal === 'parent' || portal === 'coachWeb')
      ? tour.step.tab
      : null

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--brand-paper)',
        borderTop: '1px solid var(--brand-line)',
        boxShadow: '0 -2px 16px rgba(11, 8, 40, 0.06)',
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
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          // Tour locks navigation: only the current step's tab is
          // clickable. The "live" tab still shows as active; others
          // dim down + the click is suppressed.
          const tourLocked = tourActiveLockedTab !== null && tourActiveLockedTab !== item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                if (tourLocked) return
                router.push(item.href)
              }}
              disabled={tourLocked}
              aria-disabled={tourLocked}
              title={tourLocked ? 'Locked during the guided tour. Use Next → in the tour card to advance.' : undefined}
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
                cursor: tourLocked ? 'not-allowed' : 'pointer',
                position: 'relative',
                opacity: tourLocked ? 0.32 : 1,
                transition: 'opacity 180ms ease',
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
                    background: 'var(--brand-yellow)',
                    borderRadius: '0 0 3px 3px',
                  }}
                />
              )}
              <Icon
                size={22}
                color={isActive ? 'var(--brand-indigo)' : 'var(--brand-indigo-mute)'}
                strokeWidth={isActive ? 2.2 : 1.7}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive ? 'var(--brand-indigo)' : 'var(--brand-indigo-mute)',
                  letterSpacing: '0.08em',
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
