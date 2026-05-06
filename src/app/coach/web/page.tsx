'use client'

import { useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { HubFrame, MikelGlyph } from '@/components/coach/hub/HubEmbeds'
import { HubChatInput, SuggestionChips } from '@/components/coach/hub/HubChatInput'
import { HubResponseCard } from '@/components/coach/hub/HubResponseCard'
import { HubTiles } from '@/components/coach/hub/HubTiles'

/* Coach's Hub — /coach/web
 *
 * Front door for the coach. Direction: Coach Mikel as an LLM agent.
 * Translated from the Claude Design handoff at
 * .claude/claude-design-pack/Handoffs/Coach Mikel/.
 *
 * Surface composition:
 *   1. Greeting eyebrow      — "MORNING, COACH SARA"
 *   2. Hero headline         — "Ask Mikel anything." (yellow highlight)
 *   3. Subtitle              — short copy explaining what Mikel knows
 *   4. Suggestion chips      — six starter prompts in mono pill style
 *   5. Chat input            — large centered input, the actual surface
 *   6. Response card         — Mikel's most-recent reply (mocked) with
 *                              embedded composite/player/clip chips
 *   7. Tile rail             — four small destinations (escape hatch)
 *   8. Privacy footer
 *
 * Replaces the legacy CoachChatContainer surface. The response card
 * uses local state to show/hide; default lands populated so the surface
 * is never empty. No real LLM streaming yet — the conversation
 * behaviour ships separately when the model layer wires up.
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
  // hasThread = whether the response card should render. Seeded `true`
  // so the demo lands on the populated state. Real wiring will replace
  // this with a streamed response when the LLM layer ships.
  const [hasThread] = useState(true)

  return (
    <HubFrame>
      {/* Hero zone — eyebrow / hero / subtitle / chips / input,
       *  centered horizontally with generous vertical spacing */}
      <div
        style={{
          padding: isMobile ? '36px 16px 20px' : '64px 36px 28px',
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
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MikelGlyph size={18} />
          MORNING, COACH SARA
        </div>

        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: isMobile ? 44 : 84,
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
            color: BRAND.indigo,
            textAlign: 'center',
            marginBottom: 6,
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
            fontSize: isMobile ? 14 : 16,
            color: BRAND.indigoMid,
            textAlign: 'center',
            marginBottom: isMobile ? 22 : 30,
            maxWidth: 560,
            lineHeight: 1.5,
          }}
        >
          Match prep, player questions, clip reels, drill ideas. Mikel knows this
          week&apos;s footage.
        </div>

        <SuggestionChips chips={SUGGESTION_CHIPS} />
        <HubChatInput initialFocus={!isMobile} />
      </div>

      {/* Recent reply (when a thread exists) */}
      {hasThread && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: isMobile ? '12px 14px' : '16px 36px',
          }}
        >
          <HubResponseCard />
        </div>
      )}

      {/* Tile rail */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? '20px 14px 36px' : '24px 36px 64px',
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
    </HubFrame>
  )
}
