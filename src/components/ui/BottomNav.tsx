'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Play, Calendar, TrendingUp, Settings, Users, ClipboardList, Dumbbell, User, BarChart3, MessageSquare, Sparkles, Film } from 'lucide-react'
import { useTourSafe } from '@/components/demo/TourProvider'
import { cn } from '@/lib/cn'

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
  // gets greyed out + disabled.
  const tourActiveLockedTab =
    tour?.active && tour.step?.tab && (portal === 'parent' || portal === 'coachWeb')
      ? tour.step.tab
      : null

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-brand-paper border-t border-brand-line',
        'shadow-[0_-2px_16px_rgba(11,8,40,0.06)]',
      )}
    >
      <div
        className="mx-auto flex max-w-[480px] items-center justify-around"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}
      >
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          const tourLocked = tourActiveLockedTab !== null && tourActiveLockedTab !== item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (tourLocked) return
                router.push(item.href)
              }}
              disabled={tourLocked}
              aria-disabled={tourLocked}
              title={
                tourLocked
                  ? 'Locked during the guided tour. Use Next → in the tour card to advance.'
                  : undefined
              }
              className={cn(
                'relative flex min-w-[50px] flex-1 cursor-pointer flex-col items-center gap-0.5 border-none bg-transparent px-2 py-2.5',
                'transition-opacity duration-200',
                tourLocked && 'cursor-not-allowed opacity-30',
              )}
            >
              {isActive && (
                <div
                  className={cn(
                    'absolute left-1/2 top-0 -translate-x-1/2',
                    'h-[3px] w-6 rounded-b-[3px] bg-brand-yellow',
                  )}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.7}
                className={cn(isActive ? 'text-brand-indigo' : 'text-brand-indigo-mute')}
              />
              <span
                className={cn(
                  'whitespace-nowrap font-fragment text-[9px] font-bold tracking-[0.08em]',
                  isActive ? 'text-brand-indigo' : 'text-brand-indigo-mute',
                )}
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
