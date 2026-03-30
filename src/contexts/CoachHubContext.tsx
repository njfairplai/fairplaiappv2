'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { CoachChatMessage, CoachChatCard, CoachAgentAction } from '@/lib/types'
import {
  sessions, players, rosters, squadScores, pendingReviewItems,
  playerFeedbackStatus, playerWorkloads, playerKeyMetrics,
} from '@/lib/mockData'
import { calculateACWR, getRiskLevel } from '@/lib/riskUtils'
import { useTeam } from '@/contexts/TeamContext'

const STORAGE_KEY = 'fairplai_coach_hub_history'
const MAX_MESSAGES = 100

const rosterPlayerMap: Record<string, string[]> = {
  roster_001: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'],
  roster_002: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'],
}

interface CoachHubContextValue {
  messages: CoachChatMessage[]
  isLoading: boolean
  sendMessage: (text: string) => Promise<void>
  triggerAction: (action: CoachAgentAction) => void
}

const CoachHubContext = createContext<CoachHubContextValue | null>(null)

export function useCoachHub() {
  const ctx = useContext(CoachHubContext)
  if (!ctx) throw new Error('useCoachHub must be used within CoachHubProvider')
  return ctx
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function CoachHubProvider({ children }: { children: React.ReactNode }) {
  const { selectedRosterId } = useTeam()
  const [messages, setMessages] = useState<CoachChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
            setInitialized(true)
            return
          }
        }
      } catch { /* ignore */ }
    }
    // Build welcome message
    const welcome = buildWelcomeMessage(selectedRosterId)
    setMessages(welcome)
    setInitialized(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage
  useEffect(() => {
    if (initialized && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)))
    }
  }, [messages, initialized])

  function getCoachContext() {
    const ids = selectedRosterId === 'all' ? Object.values(rosterPlayerMap).flat() : (rosterPlayerMap[selectedRosterId] || [])
    const rosterPlayers = players.filter(p => ids.includes(p.id))
    const roster = rosters.find(r => r.id === (selectedRosterId === 'all' ? rosters[0]?.id : selectedRosterId)) || rosters[0]
    const rosterSessions = sessions.filter(s => selectedRosterId === 'all' || s.rosterId === selectedRosterId)
    const upcomingSessions = rosterSessions.filter(s => s.status === 'scheduled')
    const completedSessions = rosterSessions.filter(s => ['analysed', 'playback_ready', 'complete'].includes(s.status))
    const pendingReviews = pendingReviewItems.filter(item => {
      const s = sessions.find(ss => ss.id === item.sessionId)
      return s && (selectedRosterId === 'all' || s.rosterId === selectedRosterId)
    })
    const feedbackDue = rosterPlayers.filter(p => {
      const status = playerFeedbackStatus[p.id]
      return status && status.sessionsSinceLastFeedback >= 10
    })
    const atRisk = rosterPlayers.filter(p => {
      const workload = playerWorkloads.find(w => w.playerId === p.id)
      if (!workload) return false
      const acwr = calculateACWR(workload.weeklyLoads)
      return getRiskLevel(acwr) === 'high' || getRiskLevel(acwr) === 'critical'
    })
    const avgScore = rosterPlayers.length > 0
      ? Math.round(rosterPlayers.reduce((sum, p) => sum + (squadScores[p.id]?.compositeScore ?? 0), 0) / rosterPlayers.length)
      : 0

    return {
      rosterName: roster?.name || 'Unknown',
      squadSize: rosterPlayers.length,
      avgScore,
      sessionsPlayed: completedSessions.length,
      upcomingCount: upcomingSessions.length,
      pendingReviewCount: pendingReviews.length,
      feedbackDueCount: feedbackDue.length,
      atRiskCount: atRisk.length,
    }
  }

  function buildWelcomeMessage(rosterId: string): CoachChatMessage[] {
    const ctx = getCoachContext()
    const alerts: string[] = []
    if (ctx.pendingReviewCount > 0) alerts.push(`${ctx.pendingReviewCount} session${ctx.pendingReviewCount > 1 ? 's' : ''} need review`)
    if (ctx.feedbackDueCount > 0) alerts.push(`${ctx.feedbackDueCount} player${ctx.feedbackDueCount > 1 ? 's' : ''} due for feedback`)
    if (ctx.atRiskCount > 0) alerts.push(`${ctx.atRiskCount} player${ctx.atRiskCount > 1 ? 's' : ''} at risk`)

    const alertText = alerts.length > 0 ? `\n\nHeads up: ${alerts.join(' · ')}` : ''

    const cards: CoachChatCard[] = [
      {
        type: 'stat_card',
        payload: {
          stats: [
            { label: 'Sessions', value: ctx.sessionsPlayed },
            { label: 'Avg Score', value: ctx.avgScore },
            { label: 'Pending Reviews', value: ctx.pendingReviewCount },
            { label: 'At Risk', value: ctx.atRiskCount },
          ],
        },
      },
      {
        type: 'action_chips',
        payload: {
          actions: [
            { label: 'View Squad', action: 'view_squad' },
            { label: 'Start IDP', action: 'create_idp' },
            { label: 'Check Schedule', action: 'check_schedule' },
            { label: 'View Stats', action: 'view_stats' },
          ],
        },
      },
    ]

    if (ctx.pendingReviewCount > 0) {
      cards.splice(1, 0, {
        type: 'review_prompt',
        payload: { count: ctx.pendingReviewCount },
      })
    }

    return [{
      id: generateId(),
      role: 'assistant',
      text: `Welcome back, Coach! Here's your ${ctx.rosterName} overview.${alertText}`,
      cards,
      timestamp: Date.now(),
    }]
  }

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: CoachChatMessage = {
      id: generateId(),
      role: 'user',
      text,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const ctx = getCoachContext()
      const res = await fetch('/api/coach-hub-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-20).concat(userMsg).map(m => ({ role: m.role, content: m.text || '' })),
          coachContext: ctx,
        }),
      })
      const data = await res.json()

      const assistantMsg: CoachChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: data.text,
        cards: data.cards,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        text: "Sorry, I couldn't process that. Try asking about your squad, schedule, or stats.",
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, selectedRosterId]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerAction = useCallback((action: CoachAgentAction) => {
    const actionMessages: Record<CoachAgentAction, string> = {
      view_squad: 'Show me my squad',
      analyze_player: 'Analyze a player',
      check_schedule: 'What\'s my schedule?',
      review_session: 'I need to review a session',
      create_idp: 'I want to start writing IDPs',
      view_stats: 'Show me team stats',
    }
    sendMessage(actionMessages[action])
  }, [sendMessage])

  return (
    <CoachHubContext.Provider value={{ messages, isLoading, sendMessage, triggerAction }}>
      {children}
    </CoachHubContext.Provider>
  )
}
