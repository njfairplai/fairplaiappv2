'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useFeedback } from '@/contexts/FeedbackContext'
import FeedbackButton from './FeedbackButton'
import FeedbackPanel from './FeedbackPanel'
import FeedbackPrompt from './FeedbackPrompt'

const SCREEN_PROMPTS: Record<string, { question: string; textPlaceholder: string }> = {
  'coach-home': {
    question: 'How valuable would this be in your environment?',
    textPlaceholder: "What's missing that a coach would need?",
  },
  'player-profile': {
    question: 'How valuable would this be in your environment?',
    textPlaceholder: 'What would make this more useful to you?',
  },
  'parent-home': {
    question: 'How valuable would this be to the parents at your academy or facility?',
    textPlaceholder: 'What concerns would parents have about this?',
  },
  'admin-dashboard': {
    question: 'How valuable would this be for running your academy or facility?',
    textPlaceholder: 'What operational pain point should we be solving?',
  },
}

function getScreenKey(pathname: string): string | null {
  if (pathname === '/coach/home') return 'coach-home'
  if (pathname === '/parent/home') return 'parent-home'
  if (pathname === '/admin/dashboard') return 'admin-dashboard'
  if (pathname.match(/^\/coach\/squad\/[^/]+$/) && pathname !== '/coach/squad/compare') return 'player-profile'
  return null
}

interface FeedbackOverlayProps {
  bottomOffset?: number
  desktopSidebarOffset?: number
}

export default function FeedbackOverlay({ bottomOffset = 90, desktopSidebarOffset = 0 }: FeedbackOverlayProps) {
  const { isFeedbackMode, checked } = useFeedback()
  const [panelOpen, setPanelOpen] = useState(false)
  const pathname = usePathname()

  // Don't render anything until we've checked localStorage (avoids hydration mismatch)
  if (!checked || !isFeedbackMode) return null

  const screenKey = getScreenKey(pathname)
  const promptConfig = screenKey ? SCREEN_PROMPTS[screenKey] : null

  return (
    <>
      <FeedbackButton onClick={() => setPanelOpen(true)} />
      <FeedbackPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      {screenKey && promptConfig && (
        <FeedbackPrompt
          key={screenKey}
          screenKey={screenKey}
          question={promptConfig.question}
          textPlaceholder={promptConfig.textPlaceholder}
          bottomOffset={bottomOffset}
          desktopSidebarOffset={desktopSidebarOffset}
        />
      )}
    </>
  )
}
