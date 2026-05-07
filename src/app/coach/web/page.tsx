'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Footprints } from 'lucide-react'
import { BRAND, TYPE } from '@/lib/constants'
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
      <div
        style={{
          padding: isMobile ? '28px 16px 18px' : '40px 36px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: BRAND.indigoMute,
            fontWeight: 700,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'hubFadeIn 360ms ease 0ms both',
          }}
        >
          <MikelGlyph size={18} pulse />
          MORNING, COACH SARA
        </div>

        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: isMobile ? 28 : 48,
            lineHeight: 0.96,
            letterSpacing: '-0.025em',
            color: BRAND.indigo,
            textAlign: 'center',
            marginBottom: 6,
            animation: 'hubFadeIn 360ms ease 80ms both',
          }}
        >
          Ask Mikel{' '}
          <span
            style={{
              background: BRAND.yellow,
              padding: isMobile ? '0 6px' : '0 8px',
            }}
          >
            anything
          </span>
          .
        </div>

        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: isMobile ? 13 : 14,
            color: BRAND.indigoMid,
            textAlign: 'center',
            marginBottom: isMobile ? 18 : 22,
            maxWidth: 520,
            lineHeight: 1.5,
            animation: 'hubFadeIn 360ms ease 160ms both',
          }}
        >
          Match prep, player questions, clip reels, drill ideas. Mikel knows this
          week&apos;s footage.
        </div>

        <div
          style={{
            animation: 'hubFadeIn 360ms ease 240ms both',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <SuggestionChips chips={SUGGESTION_CHIPS} onPick={pickSuggestion} />
        </div>
        <div
          style={{
            animation: 'hubFadeIn 400ms ease 320ms both',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: isMobile ? '12px 14px' : '16px 36px',
            animation: 'hubFadeIn 480ms ease 480ms both',
          }}
        >
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: isMobile ? '4px 14px 0' : '8px 36px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              maxWidth: 720,
              width: '100%',
              animation: 'hubFadeIn 480ms ease 540ms both',
            }}
          >
            {highFatigueCount > 0 && (
              <button
                type="button"
                onClick={() => router.push('/coach/web/squad')}
                style={smartFlagStyle(BRAND.coral)}
              >
                <Footprints size={14} />
                <span>
                  <strong style={{ fontWeight: 800 }}>{highFatigueCount}</strong>{' '}
                  player{highFatigueCount === 1 ? '' : 's'} over fatigue threshold this week
                </span>
                <span style={smartFlagArrow}>→</span>
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
                style={smartFlagStyle(BRAND.indigo)}
              >
                <AlertTriangle size={14} />
                <span>
                  <strong style={{ fontWeight: 800 }}>{openPPECount}</strong>{' '}
                  open gear flag{openPPECount === 1 ? '' : 's'}
                </span>
                <span style={smartFlagArrow}>→</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tile rail */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? '16px 14px 32px' : '20px 36px 56px',
        }}
      >
        <HubTiles />
      </div>

      {/* Privacy footer */}
      <div style={{ textAlign: 'center', paddingBottom: 36 }}>
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9.5,
            letterSpacing: '0.22em',
            color: BRAND.indigoMute,
            fontWeight: 700,
          }}
        >
          MIKEL DOESN&apos;T STORE QUESTIONS · YOUR CONVERSATIONS ARE PRIVATE
        </span>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </HubFrame>
  )
}

function smartFlagStyle(accent: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 14px',
    background: BRAND.paper,
    border: `1px solid ${BRAND.line}`,
    borderLeft: `3px solid ${accent}`,
    borderRadius: 8,
    color: BRAND.indigo,
    fontFamily: TYPE.body, fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }
}

const smartFlagArrow: React.CSSProperties = {
  fontFamily: TYPE.body,
  fontSize: 14,
  color: BRAND.indigoMute,
  marginLeft: 4,
}
