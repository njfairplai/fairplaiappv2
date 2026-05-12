'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Footprints } from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { HubFrame, MikelGlyph } from '@/components/coach/hub/HubEmbeds'
import {
  HubChatInput,
  SuggestionChips,
  type HubChatInputHandle,
} from '@/components/coach/hub/HubChatInput'
import { HubResponseCard } from '@/components/coach/hub/HubResponseCard'
import { HubTiles } from '@/components/coach/hub/HubTiles'
import { Toast } from '@/components/coach/match-center/Toast'
import {
  getAllOpenPPEFlags,
  getLatestFatigueByPlayer,
  fatigueTier,
} from '@/lib/parent-portal'
import { players } from '@/lib/mockData'

/* Coach's Hub — /coach/web
 *
 * Mikel as the front door. Direction translated from the Claude Design
 * handoff at .claude/claude-design-pack/Handoffs/Coach Mikel/.
 *
 * Surface composition:
 *   1. Greeting eyebrow (M-glyph + "MORNING, COACH SARA")
 *   2. Hero "Ask Mikel anything." — display, scaled
 *   3. Subtitle one-liner
 *   4. Six suggestion chips (mono-pill) — tap fills the chat input
 *   5. Chat textarea — Cmd/Ctrl-K focus, Enter to submit
 *   6. Response card (mocked Mikel reply with embedded chips)
 *   7. Tile rail of destinations
 *   8. Privacy footer
 *
 * Every CTA fires real feedback through the shared Toast component.
 * No real LLM streaming yet — the response card is static mock content.
 *
 * Animations: greeting / hero / subtitle / chip strip stagger fade-in
 * via the `hubFadeIn` keyframe; the M-glyph carries a slow pulse so
 * the surface feels alive on idle. Hover lifts on the tile rail.
 */

const SUGGESTION_CHIPS = [
  'Who needs prep this week?',
  'What was our weakness vs Al Wasl?',
  "Build a 5-clip reel on Saeed's pressing",
  'Who improved most this month?',
  "Suggest tomorrow's drills",
  'Anyone overworked?',
]

export default function CoachWebHubPage() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const inputHandle = useRef<HubChatInputHandle>(null)
  const [hasThread, setHasThread] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Welfare smart-flag rail. Re-reads localStorage on mount so the seeded
  // demo data renders without a manual refresh after first visit.
  const [welfareTick, setWelfareTick] = useState(0)
  useEffect(() => {
    setWelfareTick(t => t + 1)
    // Re-trigger on visibility/focus so flags added in another tab show up
    const onFocus = () => setWelfareTick(t => t + 1)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])
  const fatigueByPlayer = getLatestFatigueByPlayer()
  const highFatigueCount = Object.values(fatigueByPlayer).filter(
    s => fatigueTier(s.load) === 'high',
  ).length
  const openPPECount = getAllOpenPPEFlags().length

  function pickSuggestion(chip: string) {
    inputHandle.current?.setValueAndFocus(chip)
  }

  function submitQuestion() {
    setToast('Mikel is thinking…')
  }

  function shareReel() {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}/coach/web/highlights?reel=mikel-saeed-pressing`
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setToast('Reel link copied to clipboard')
  }

  function newThread() {
    setHasThread(false)
    setToast('Started a new thread')
  }

  return (
    <HubFrame>
      {/* Hero zone — eyebrow / hero / subtitle / chips / input,
       *  centered with stagger fade-in animation. */}
      <div className="flex flex-col items-center px-4 pt-7 pb-[18px] md:px-9 md:pt-10 md:pb-6">
        <div className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold mb-3 flex items-center gap-2 [animation:hubFadeIn_360ms_ease_0ms_both]">
          <MikelGlyph size={18} pulse />
          MORNING, COACH SARA
        </div>

        <div className="font-clash text-[28px] md:text-5xl leading-[0.96] tracking-[-0.025em] text-brand-indigo text-center mb-1.5 [animation:hubFadeIn_360ms_ease_80ms_both]">
          Ask Mikel{' '}
          <span className="bg-brand-yellow px-1.5 md:px-2">
            anything
          </span>
          .
        </div>

        <div className="font-satoshi text-[13px] md:text-sm text-brand-indigo-mid text-center mb-[18px] md:mb-[22px] max-w-[520px] leading-[1.5] [animation:hubFadeIn_360ms_ease_160ms_both]">
          Match prep, player questions, clip reels, drill ideas. Mikel knows this
          week&apos;s footage.
        </div>

        <div className="w-full flex justify-center [animation:hubFadeIn_360ms_ease_240ms_both]">
          <SuggestionChips chips={SUGGESTION_CHIPS} onPick={pickSuggestion} />
        </div>
        <div className="w-full flex justify-center [animation:hubFadeIn_400ms_ease_320ms_both]">
          <HubChatInput
            ref={inputHandle}
            initialFocus={!isMobile}
            onSubmit={submitQuestion}
            onAttach={() => setToast('Attach clip — coming soon')}
            onMention={() => setToast('Player mention — coming soon')}
          />
        </div>
      </div>

      {/* Recent reply (when a thread exists) */}
      {hasThread && (
        <div className="flex justify-center px-3.5 py-3 md:px-9 md:py-4 [animation:hubFadeIn_480ms_ease_480ms_both]">
          <HubResponseCard
            onShare={shareReel}
            onNewThread={newThread}
            onExportReel={() => setToast('Reel queued for export')}
            onRegenerate={() => setToast('Regenerating — new angle on the way')}
          />
        </div>
      )}

      {/* Smart-flag rail — surfaces welfare intel that needs the coach's
       *  attention. Reads from the same localStorage stream the parent
       *  inbox uses, so producer + consumer stay in sync. */}
      {(highFatigueCount > 0 || openPPECount > 0) && (
        <div className="flex justify-center px-3.5 pt-1 md:px-9 md:pt-2">
          <div className="flex flex-wrap gap-2.5 max-w-[720px] w-full [animation:hubFadeIn_480ms_ease_540ms_both]">
            {highFatigueCount > 0 && (
              <button
                type="button"
                onClick={() => router.push('/coach/web/squad')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-paper border border-brand-line rounded-lg text-brand-indigo font-satoshi text-[12.5px] cursor-pointer transition-all duration-150"
                style={{ borderLeft: `3px solid ${BRAND.coral}` }}
              >
                <Footprints size={14} />
                <span>
                  <strong className="font-extrabold">{highFatigueCount}</strong>{' '}
                  player{highFatigueCount === 1 ? '' : 's'} over fatigue threshold this week
                </span>
                <span className="font-satoshi text-sm text-brand-indigo-mute ml-1">→</span>
              </button>
            )}
            {openPPECount > 0 && (
              <button
                type="button"
                onClick={() => {
                  // Open PPE flags don't have a top-level home yet; the
                  // squad surface is the closest entrypoint into players.
                  router.push('/coach/web/squad')
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-paper border border-brand-line rounded-lg text-brand-indigo font-satoshi text-[12.5px] cursor-pointer transition-all duration-150"
                style={{ borderLeft: `3px solid ${BRAND.indigo}` }}
              >
                <AlertTriangle size={14} />
                <span>
                  <strong className="font-extrabold">{openPPECount}</strong>{' '}
                  open gear flag{openPPECount === 1 ? '' : 's'}
                </span>
                <span className="font-satoshi text-sm text-brand-indigo-mute ml-1">→</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tile rail */}
      <div className="flex justify-center px-3.5 pt-4 pb-8 md:px-9 md:pt-5 md:pb-14">
        <HubTiles />
      </div>

      {/* Privacy footer */}
      <div className="text-center pb-9">
        <span className="font-fragment text-[9.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
          MIKEL DOESN&apos;T STORE QUESTIONS · YOUR CONVERSATIONS ARE PRIVATE
        </span>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </HubFrame>
  )
}
