'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  stepsForPersona,
  totalSteps,
  type TourPersona,
  type TourStep,
} from '@/lib/demo-tour-steps'
import { TourTooltip } from './TourTooltip'
import { TourTransitionCard } from './TourTransitionCard'
import { EndDemoPill } from './EndDemoPill'

/**
 * TourProvider — sits at the app root, wraps every page.
 *
 * Activates whenever `fairplai_demo_active` localStorage holds a persona.
 * When active, renders a floating top-right narrator card + a bottom-
 * right End Demo pill over the live UI. The page underneath stays fully
 * interactive — no dim, no spotlight, no blocked clicks.
 *
 * Navigation contract:
 *   - Each step has a `route`. Advancing where `route !== current
 *     pathname` triggers `router.push(route)` first, then re-shows the
 *     tooltip on the new surface
 *   - `hide()` collapses the tooltip for the current stop only; the
 *     next route change brings it back. The EndDemoPill stays visible
 *   - `skip()` ends the demo: marks completed, routes to /demo/end
 *
 * Routes ignored by the tour:
 *   - `/`, `/welcome`, `/demo/*`, `/login`, `/user-testing/*`
 *   These are pre-tour or post-tour surfaces; the overlay should not show.
 */

const TOUR_IGNORED_PREFIXES = [
  '/welcome',
  '/demo',
  '/login',
  '/user-testing',
]

interface TourContextValue {
  persona: TourPersona | null
  stepIndex: number
  step: TourStep | null
  totalSteps: number
  isTransition: boolean
  /** True when persona is set + we're not on an ignored route. */
  active: boolean
  next: () => void
  back: () => void
  /** End the demo entirely — sets `completed` + routes to /demo/end. */
  skip: () => void
  /** Hide the tooltip for the current stop only. The pill stays visible
   *  and the tooltip returns on the next route change. */
  hide: () => void
  resume: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used inside <TourProvider>')
  return ctx
}

const LS_PERSONA = 'fairplai_demo_active'
const LS_STEP = 'fairplai_demo_step'
const LS_COMPLETED = 'fairplai_demo_completed'

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() ?? '/'

  const [persona, setPersona] = useState<TourPersona | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [showTransition, setShowTransition] = useState(false)
  const [tooltipHidden, setTooltipHidden] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate persona + step from localStorage on mount AND on every
  // pathname change. The pathname dependency is critical: when
  // /demo/persona writes the persona and routes to a tour route, this
  // hook re-runs after navigation and picks up the new persona. Without
  // it, the provider's state would stay stale because mount happened
  // earlier (at app root) before the persona was selected.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const p = window.localStorage.getItem(LS_PERSONA) as TourPersona | null
      const s = window.localStorage.getItem(LS_STEP)
      if (p === 'coach' || p === 'parent' || p === 'misc') {
        setPersona(p)
        setStepIndex(s ? Math.max(0, Number(s) || 0) : 0)
      } else {
        setPersona(null)
        setStepIndex(0)
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
    // Tooltip hidden state resets on every route change so a new stop's
    // narration always shows even if the user × dismissed the prior one.
    setTooltipHidden(false)
  }, [pathname])

  // Persist step index whenever it changes.
  useEffect(() => {
    if (!hydrated || persona == null) return
    try {
      window.localStorage.setItem(LS_STEP, String(stepIndex))
    } catch {
      /* ignore */
    }
  }, [stepIndex, hydrated, persona])

  const steps = useMemo(
    () => (persona ? stepsForPersona(persona) : []),
    [persona],
  )
  const total = useMemo(
    () => (persona ? totalSteps(persona) : 0),
    [persona],
  )
  const step = steps[stepIndex] ?? null

  // If we're on the right route already, skip to it. If not, push the
  // route. The tooltip then renders against whatever's on the page.
  useEffect(() => {
    if (!persona || !step) return
    if (showTransition) return
    if (pathname !== step.route) {
      router.push(step.route)
    }
  }, [persona, step, showTransition, pathname, router])

  // Tour is "active" when persona is set + we're not on an ignored route.
  const onIgnoredRoute = TOUR_IGNORED_PREFIXES.some(p =>
    p === pathname ? true : pathname.startsWith(`${p}/`),
  ) || pathname === '/'
  const active = !!persona && !onIgnoredRoute && !!step

  const finish = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(LS_COMPLETED, 'true')
      window.localStorage.removeItem(LS_PERSONA)
      window.localStorage.removeItem(LS_STEP)
    } catch {
      /* ignore */
    }
    setPersona(null)
    setStepIndex(0)
    setShowTransition(false)
    setTooltipHidden(false)
    router.push('/demo/end')
  }, [router])

  const next = useCallback(() => {
    if (!step) return
    if (step.cta === 'finish') {
      finish()
      return
    }
    if (step.cta === 'transition' && !showTransition) {
      setShowTransition(true)
      return
    }
    setShowTransition(false)
    setTooltipHidden(false)
    setStepIndex(i => Math.min(i + 1, steps.length - 1))
  }, [step, showTransition, steps.length, finish])

  const back = useCallback(() => {
    if (showTransition) {
      setShowTransition(false)
      return
    }
    setTooltipHidden(false)
    setStepIndex(i => Math.max(0, i - 1))
  }, [showTransition])

  const skip = useCallback(() => {
    finish()
  }, [finish])

  const hide = useCallback(() => {
    setTooltipHidden(true)
  }, [])

  const resume = useCallback(() => {
    if (!step) return
    if (pathname !== step.route) router.push(step.route)
    setTooltipHidden(false)
  }, [step, pathname, router])

  const value: TourContextValue = {
    persona,
    stepIndex,
    step,
    totalSteps: total,
    isTransition: showTransition,
    active,
    next,
    back,
    skip,
    hide,
    resume,
  }

  return (
    <TourContext.Provider value={value}>
      {children}
      {hydrated && active && !showTransition && !tooltipHidden && (
        <TourTooltip step={step!} />
      )}
      {hydrated && active && showTransition && <TourTransitionCard />}
      {hydrated && active && <EndDemoPill />}
    </TourContext.Provider>
  )
}
