'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface FeedbackIdentity {
  name: string
  role: 'academy_owner' | 'head_coach' | 'facility_operator' | 'technical_director' | 'other'
  facilityName: string
  enteredAt: string
}

interface FeedbackResponse {
  id: string
  screen: string
  question: string
  rating: number
  comment: string
  submittedAt: string
  identity: FeedbackIdentity
}

interface GeneralFeedback {
  id: string
  comment: string
  currentPage: string
  submittedAt: string
  identity: FeedbackIdentity
}

interface FeedbackContextType {
  isFeedbackMode: boolean
  identity: FeedbackIdentity | null
  checked: boolean
  dismissedScreens: Set<string>
  dismissScreen: (screenKey: string) => void
  submitRating: (screen: string, question: string, rating: number, comment: string) => void
  submitGeneral: (comment: string, currentPage: string) => void
}

const FEEDBACK_MODE_KEY = 'fairplai_feedback_mode'
const FEEDBACK_IDENTITY_KEY = 'fairplai_feedback_identity'
const FEEDBACK_DISMISSED_KEY = 'fairplai_feedback_dismissed'
const FEEDBACK_RESPONSES_KEY = 'fairplai_feedback_responses'
const FEEDBACK_GENERAL_KEY = 'fairplai_feedback_general'

const FeedbackContext = createContext<FeedbackContextType | null>(null)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isFeedbackMode, setIsFeedbackMode] = useState(false)
  const [identity, setIdentity] = useState<FeedbackIdentity | null>(null)
  const [checked, setChecked] = useState(false)
  const [dismissedScreens, setDismissedScreens] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const mode = localStorage.getItem(FEEDBACK_MODE_KEY)
      if (mode === 'true') {
        setIsFeedbackMode(true)
        const stored = localStorage.getItem(FEEDBACK_IDENTITY_KEY)
        if (stored) setIdentity(JSON.parse(stored))
        const dismissed = localStorage.getItem(FEEDBACK_DISMISSED_KEY)
        if (dismissed) setDismissedScreens(new Set(JSON.parse(dismissed)))
      }
    } catch {
      // ignore parse errors
    }
    setChecked(true)
  }, [])

  const dismissScreen = useCallback((screenKey: string) => {
    setDismissedScreens(prev => {
      const next = new Set(prev)
      next.add(screenKey)
      localStorage.setItem(FEEDBACK_DISMISSED_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const submitRating = useCallback((screen: string, question: string, rating: number, comment: string) => {
    if (!identity) return
    const entry: FeedbackResponse = {
      id: `fb_${Date.now()}`,
      screen,
      question,
      rating,
      comment,
      submittedAt: new Date().toISOString(),
      identity,
    }
    try {
      const existing = localStorage.getItem(FEEDBACK_RESPONSES_KEY)
      const arr: FeedbackResponse[] = existing ? JSON.parse(existing) : []
      arr.push(entry)
      localStorage.setItem(FEEDBACK_RESPONSES_KEY, JSON.stringify(arr))
    } catch {
      // ignore
    }
  }, [identity])

  const submitGeneral = useCallback((comment: string, currentPage: string) => {
    if (!identity) return
    const entry: GeneralFeedback = {
      id: `gfb_${Date.now()}`,
      comment,
      currentPage,
      submittedAt: new Date().toISOString(),
      identity,
    }
    try {
      const existing = localStorage.getItem(FEEDBACK_GENERAL_KEY)
      const arr: GeneralFeedback[] = existing ? JSON.parse(existing) : []
      arr.push(entry)
      localStorage.setItem(FEEDBACK_GENERAL_KEY, JSON.stringify(arr))
    } catch {
      // ignore
    }
  }, [identity])

  return (
    <FeedbackContext.Provider value={{ isFeedbackMode, identity, checked, dismissedScreens, dismissScreen, submitRating, submitGeneral }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider')
  return ctx
}
