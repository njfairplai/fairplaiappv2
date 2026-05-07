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
import { TourDimOverlay } from './TourDimOverlay'
import { TourProgressDots } from './TourProgressDots'
import { TourTransitionCard } from './TourTransitionCard'

/**
 * TourProvider — sits at the app root, wraps every page.
 *
 * Activates whenever `fairplai_demo_active` localStorage holds a persona.
 * When active, renders the dim overlay + tooltip + progress dots over
 * the live UI. Steps are defined in `lib/demo-tour-steps.ts`.
 *
 * Navigation contract:
 *   - Each step has a `route` and an `anchor` selector
 *   - Advancing to a step where `route !== current pathname` triggers
 *     `router.push(route)` first, then re-anchors after the new route
 *     mounts
 *   - The TourTooltip uses MutationObserver to wait for the anchor to
 *     appear (the page may render asynchronously)
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
  skip: () => void
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
  // route. The tooltip itself handles waiting for the anchor to appear.
  useEffect(() => {
    if (!persona || !step) return
    if (showTransition) return
    if (pathname !== step.route) {
      router.push(step.route)
    }
  }, [persona, step, showTransition, pathname, router])

  // Tour is "active" when persona is set + we're not on an ignored route
  // (i.e. we ARE on a tour route). Avoids the overlay flashing during
  // demo gateway / palette pages.
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
    setStepIndex(i => Math.min(i + 1, steps.length - 1))
  }, [step, showTransition, steps.length, finish])

  const back = useCallback(() => {
    if (showTransition) {
      setShowTransition(false)
      return
    }
    setStepIndex(i => Math.max(0, i - 1))
  }, [showTransition])

  const skip = useCallback(() => {
    finish()
  }, [finish])

  const resume = useCallback(() => {
    if (!step) return
    if (pathname !== step.route) router.push(step.route)
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
    resume,
  }

  return (
    <TourContext.Provider value={value}>
      {children}
      {hydrated && active && !showTransition && (
        <>
          <TourDimOverlay anchor={step!.anchor} />
          <TourTooltip step={step!} />
          <TourProgressDots />
        </>
      )}
      {hydrated && active && showTransition && <TourTransitionCard />}
    </TourContext.Provider>
  )
}
