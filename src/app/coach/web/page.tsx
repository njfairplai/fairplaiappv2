'use client'

import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/cn'
import { HubFrame, MikelGlyph } from '@/components/coach/hub/HubEmbeds'
import {
  HubChatInput,
  type HubChatInputHandle,
} from '@/components/coach/hub/HubChatInput'
import { HubResponseCard } from '@/components/coach/hub/HubResponseCard'
import { Toast } from '@/components/coach/match-center/Toast'
import {
  getAllOpenPPEFlags,
  getLatestFatigueByPlayer,
  fatigueTier,
} from '@/lib/parent-portal'

/* Coach's Hub — /coach/web
 *
 * Chat-first redesign (May 2026). Replaces the earlier "hero + chips +
 * tile rail + smart-flag rail + response card" pastiche with a genuine
 * LLM-chat surface. Mikel is the front door; everything is the
 * conversation.
 *
 * What's on the surface:
 *   1. Compact header (Mikel glyph + name + New chat reset)
 *   2. Message stream (scrollable). User bubbles right, Mikel bubbles
 *      left with the yellow-rule treatment. Rich Mikel responses render
 *      as <HubResponseCard> inside a bubble (mocked Saeed-pressing reel).
 *   3. Empty state: Mikel proactive greeting + 3-4 suggestion chips.
 *      Welfare smart-flag content (high fatigue / open PPE) becomes part
 *      of the greeting, not a separate rail.
 *   4. Sticky input pinned to the bottom of the viewport.
 *
 * Thread persistence: messages stored in localStorage under
 * `fairplai_coach_mikel_thread`. "New chat" clears the thread and
 * re-seeds the greeting. Single-thread for now; multi-thread switcher
 * is a follow-up.
 *
 * What was removed from this surface:
 *   - The greeting eyebrow + hero + subtitle stack (no longer needed
 *     when the page IS the chat).
 *   - The 6-chip wrapping suggestion rail (replaced by 4 prompts on
 *     the empty state only).
 *   - The separate smart-flag rail (welfare content folded into Mikel's
 *     proactive greeting).
 *   - The 2x2 tile rail (destinations already in the top nav).
 *   - The privacy footer (deferred; reinstate as a tooltip if needed).
 */

const SUGGESTION_CHIPS = [
  "Yesterday's match summary",
  'Who needs rest this week?',
  "Tomorrow's session plan",
  'Build a reel from last match',
]

const STORAGE_KEY = 'fairplai_coach_mikel_thread'

interface ChatMessage {
  id: string
  role: 'mikel' | 'coach'
  body: string
  /** When true, render this Mikel message as the rich HubResponseCard
   *  (mocked Saeed-pressing reel) instead of a plain bubble. */
  isRichResponse?: boolean
  timestamp: number
}

function loadThread(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

function saveThread(msgs: ChatMessage[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
  } catch {
    /* quota or disabled — silent */
  }
}

/** Build Mikel's proactive opening message. Folds welfare smart-flag
 *  content directly into the greeting so the coach lands with a real
 *  starting point, not a generic prompt. */
function buildGreeting(highFatigueCount: number, openPPECount: number): string {
  const parts: string[] = ['Morning Sara.']
  if (highFatigueCount > 0 && openPPECount > 0) {
    parts.push(
      `${highFatigueCount} player${highFatigueCount === 1 ? '' : 's'} over fatigue threshold this week, plus ${openPPECount} open gear flag${openPPECount === 1 ? '' : 's'}.`,
    )
  } else if (highFatigueCount > 0) {
    parts.push(
      `${highFatigueCount} player${highFatigueCount === 1 ? '' : 's'} over fatigue threshold this week — worth a look.`,
    )
  } else if (openPPECount > 0) {
    parts.push(
      `${openPPECount} open gear flag${openPPECount === 1 ? '' : 's'} on the squad.`,
    )
  }
  parts.push("What's on your mind?")
  return parts.join(' ')
}

export default function CoachWebHubPage() {
  const isMobile = useIsMobile()
  const inputHandle = useRef<HubChatInputHandle>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const fatigueByPlayer = getLatestFatigueByPlayer()
  const highFatigueCount = Object.values(fatigueByPlayer).filter(
    s => fatigueTier(s.load) === 'high',
  ).length
  const openPPECount = getAllOpenPPEFlags().length

  // Hydrate from localStorage on mount. If thread is empty, seed with
  // Mikel's proactive greeting.
  useEffect(() => {
    const loaded = loadThread()
    if (loaded.length === 0) {
      const greeting: ChatMessage = {
        id: `mikel-greet-${Date.now()}`,
        role: 'mikel',
        body: buildGreeting(highFatigueCount, openPPECount),
        timestamp: Date.now(),
      }
      /* eslint-disable react-hooks/set-state-in-effect */
      setMessages([greeting])
      saveThread([greeting])
    } else {
      setMessages(loaded)
    }
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    // Dependencies intentionally empty — welfare counts are read once
    // on mount to seed the greeting. Re-running would overwrite the
    // user's conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist + scroll on every message change.
  useEffect(() => {
    if (!hydrated || messages.length === 0) return
    saveThread(messages)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, hydrated])

  function submitQuestion(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = {
      id: `coach-${Date.now()}`,
      role: 'coach',
      body: trimmed,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setToast('Mikel is thinking…')
    // Mock Mikel reply after a brief delay. Always renders the rich
    // response card (Saeed-pressing reel) for demo purposes — the
    // backend will hydrate this with a real LLM response later.
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `mikel-${Date.now()}`,
        role: 'mikel',
        body: '',
        isRichResponse: true,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, reply])
      setToast(null)
    }, 900)
  }

  function pickSuggestion(chip: string) {
    inputHandle.current?.setValueAndFocus(chip)
  }

  function shareReel() {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}/coach/web/highlights?reel=mikel-saeed-pressing`
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setToast('Reel link copied to clipboard')
  }

  function newThread() {
    const greeting: ChatMessage = {
      id: `mikel-greet-${Date.now()}`,
      role: 'mikel',
      body: buildGreeting(highFatigueCount, openPPECount),
      timestamp: Date.now(),
    }
    setMessages([greeting])
    setToast('Started a new chat')
  }

  // Empty state = only the greeting message is present. Show suggestion
  // chips below the greeting until the coach actually engages.
  const isEmpty = messages.length === 1 && messages[0]?.role === 'mikel'

  return (
    <HubFrame>
      <div className="flex h-[100dvh] flex-col">
        {/* Compact header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-line bg-brand-sand px-4 py-3 md:px-9">
          <div className="flex items-center gap-2">
            <MikelGlyph size={20} pulse />
            <span className="font-clash text-[16px] font-bold tracking-[-0.01em] text-brand-indigo">
              Coach Mikel
            </span>
          </div>
          <button
            type="button"
            onClick={newThread}
            className="cursor-pointer rounded-full border border-brand-line bg-transparent px-3 py-1 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em] text-brand-indigo"
          >
            New chat
          </button>
        </div>

        {/* Message stream */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 md:px-9 md:py-7">
          {messages.map(m => {
            if (m.role === 'mikel' && m.isRichResponse) {
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="w-full max-w-[720px]">
                    <HubResponseCard
                      onShare={shareReel}
                      onNewThread={newThread}
                      onExportReel={() => setToast('Reel queued for export')}
                      onRegenerate={() =>
                        setToast('Regenerating — new angle on the way')
                      }
                    />
                  </div>
                </div>
              )
            }
            if (m.role === 'mikel') {
              return <MikelMessage key={m.id} body={m.body} />
            }
            return <CoachMessage key={m.id} body={m.body} />
          })}

          {/* Suggestion chips — only show on empty state (just the
              greeting message in the thread). Once the coach engages,
              they disappear. */}
          {isEmpty && (
            <div className="mt-1 flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickSuggestion(c)}
                  className={cn(
                    'cursor-pointer rounded-full border border-brand-line bg-brand-paper font-satoshi text-brand-indigo transition-colors hover:bg-brand-paper-hi',
                    'px-3.5 py-1.5 text-[12.5px]',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky input */}
        <div className="shrink-0 border-t border-brand-line bg-brand-sand px-4 py-3 md:px-9 md:py-4">
          <div className="mx-auto flex justify-center">
            <HubChatInput
              ref={inputHandle}
              initialFocus={!isMobile}
              onSubmit={submitQuestion}
              onAttach={() => setToast('Attach clip — coming soon')}
              onMention={() => setToast('Player mention — coming soon')}
            />
          </div>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </HubFrame>
  )
}

function MikelMessage({ body }: { body: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-lg border-l-[3px] border-brand-yellow bg-brand-paper px-4 py-3">
        <div className="mb-1 font-fragment text-[9.5px] font-bold uppercase tracking-[0.18em] text-brand-indigo-mute">
          Mikel
        </div>
        <p className="m-0 whitespace-pre-wrap font-satoshi text-[14px] leading-[1.55] text-brand-indigo">
          {body}
        </p>
      </div>
    </div>
  )
}

function CoachMessage({ body }: { body: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-lg bg-brand-indigo px-4 py-3">
        <p className="m-0 whitespace-pre-wrap font-satoshi text-[14px] leading-[1.55] text-brand-sand">
          {body}
        </p>
      </div>
    </div>
  )
}
