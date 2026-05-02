'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { THEMES, applyTheme } from '@/lib/themes'
import { StepBar } from '@/components/user-testing/StepBar'

/**
 * /user-testing/explore?step=N — the sequential walkthrough.
 *
 * Each step applies one of the 5 palettes via `data-theme` and renders the
 * live coach portal inside an iframe. We propagate the active theme into
 * the iframe's document on load so the embedded coach page picks up the
 * same CSS variables. Dwell time per palette is tracked to localStorage
 * and posted with the feedback form.
 */
export default function UserTestingExplorePage() {
  const router = useRouter()
  const search = useSearchParams()
  const stepParam = search?.get('step')
  const step = useMemo(() => {
    const n = parseInt(stepParam ?? '1', 10)
    if (!Number.isFinite(n) || n < 1) return 1
    if (n > THEMES.length) return THEMES.length
    return n
  }, [stepParam])
  const theme = THEMES[step - 1]
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Apply the palette to the OUTER document (so the StepBar adopts it),
  // and also push it into the iframe's document each time the theme
  // changes or the iframe finishes loading. Track dwell time per step.
  const enteredAt = useRef<number>(Date.now())
  useEffect(() => {
    applyTheme(theme.id)
    enteredAt.current = Date.now()

    // Push the current theme into the iframe if it's already loaded
    const iframeDoc = iframeRef.current?.contentDocument
    if (iframeDoc?.documentElement) {
      iframeDoc.documentElement.setAttribute('data-theme', theme.id)
    }

    const recordDwell = () => {
      const elapsed = Math.round((Date.now() - enteredAt.current) / 1000)
      try {
        const raw = localStorage.getItem('fairplai-testing-dwell')
        const obj = raw ? JSON.parse(raw) : {}
        obj[theme.id] = (obj[theme.id] ?? 0) + elapsed
        localStorage.setItem('fairplai-testing-dwell', JSON.stringify(obj))
      } catch { /* noop */ }
    }

    window.addEventListener('beforeunload', recordDwell)
    return () => {
      recordDwell()
      window.removeEventListener('beforeunload', recordDwell)
    }
  }, [theme.id])

  const goToStep = (n: number) => {
    router.push(`/user-testing/explore?step=${n}`)
  }

  /** When the iframe finishes (re)loading, push the current data-theme in. */
  const onIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument
    if (doc?.documentElement) {
      doc.documentElement.setAttribute('data-theme', theme.id)
    }
  }

  return (
    <div data-theme={theme.id} style={{ background: 'var(--brand-sand)', minHeight: '100vh' }}>
      <StepBar
        step={step}
        total={THEMES.length}
        theme={theme}
        onNext={() => goToStep(Math.min(THEMES.length, step + 1))}
        onPrev={() => goToStep(Math.max(1, step - 1))}
      />
      <iframe
        ref={iframeRef}
        src="/coach/web/match/session_007"
        title="Coach portal preview"
        onLoad={onIframeLoad}
        style={{
          display: 'block',
          width: '100%',
          height: 'calc(100vh - 64px)',
          border: 'none',
          background: 'var(--brand-sand)',
        }}
      />
    </div>
  )
}
