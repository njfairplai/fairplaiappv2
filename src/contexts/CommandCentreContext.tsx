'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import type { ChatMessage, ChatCard, SetupProgress, SetupStep, AgentAction } from '@/lib/types'
import { players, rosters, coaches, sessions, academies } from '@/lib/mockData'

const STORAGE_KEY = 'fairplai_command_centre_history'
const MAX_MESSAGES = 100
const ACADEMY_ID = 'academy_001'

interface CommandCentreContextValue {
  messages: ChatMessage[]
  setupProgress: SetupProgress
  isLoading: boolean
  sendMessage: (text: string) => Promise<void>
  executeAction: (action: AgentAction, data?: Record<string, unknown>) => void
  triggerAction: (action: AgentAction) => void
  appendAssistantMessage: (text: string, cards?: ChatCard[]) => void
}

const CommandCentreContext = createContext<CommandCentreContextValue | null>(null)

export function useCommandCentre() {
  const ctx = useContext(CommandCentreContext)
  if (!ctx) throw new Error('useCommandCentre must be used within CommandCentreProvider')
  return ctx
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function computeSetupProgress(): SetupProgress {
  const completed: SetupStep[] = []
  const academyRosters = rosters.filter(r => r.academyId === ACADEMY_ID)
  const academyCoaches = coaches.filter(c => c.academyId === ACADEMY_ID)
  const academyPlayers = players.filter(p => p.academyId === ACADEMY_ID)
  const academySessions = sessions.filter(s => s.academyId === ACADEMY_ID)
  const academy = academies.find(a => a.id === ACADEMY_ID)

  if (academyRosters.length > 0) completed.push('roster_created')
  if (academyCoaches.length > 0) completed.push('coach_added')
  if (academyPlayers.length > 0) completed.push('players_added')
  if (academySessions.length > 0) completed.push('session_scheduled')
  if (academy && academy.creditBalance > 0) completed.push('credits_checked')

  // Check localStorage for additional custom data
  if (typeof window !== 'undefined') {
    try {
      const customRosters = localStorage.getItem('fairplai_custom_rosters')
      if (customRosters && JSON.parse(customRosters).length > 0 && !completed.includes('roster_created')) {
        completed.push('roster_created')
      }
      const adhocSessions = localStorage.getItem('fairplai_adhoc_sessions')
      if (adhocSessions && JSON.parse(adhocSessions).length > 0 && !completed.includes('session_scheduled')) {
        completed.push('session_scheduled')
      }
      const importedPlayers = localStorage.getItem('fairplai_imported_players')
      if (importedPlayers && JSON.parse(importedPlayers).length > 0 && !completed.includes('players_added')) {
        completed.push('players_added')
      }
      const importedCoaches = localStorage.getItem('fairplai_imported_coaches')
      if (importedCoaches && JSON.parse(importedCoaches).length > 0 && !completed.includes('coach_added')) {
        completed.push('coach_added')
      }
      const customPrograms = localStorage.getItem('fairplai_custom_programs')
      if (customPrograms && JSON.parse(customPrograms).length > 0 && !completed.includes('program_created')) {
        completed.push('program_created')
      }
    } catch { /* ignore parse errors */ }
  }

  return { completedSteps: completed, totalSteps: 6 }
}

function getAcademyContext(progress: SetupProgress) {
  const academyPlayers = players.filter(p => p.academyId === ACADEMY_ID)
  const academyCoaches = coaches.filter(c => c.academyId === ACADEMY_ID)
  const academyRosters = rosters.filter(r => r.academyId === ACADEMY_ID)
  const academySessions = sessions.filter(s => s.academyId === ACADEMY_ID)
  const academy = academies.find(a => a.id === ACADEMY_ID)

  return {
    playerCount: academyPlayers.length,
    coachCount: academyCoaches.length,
    rosterCount: academyRosters.length,
    sessionCount: academySessions.length,
    creditBalance: academy?.creditBalance ?? 0,
    subscriptionTier: academy?.subscriptionTier ?? 'development',
    setupProgress: progress,
  }
}

function buildWelcomeMessages(progress: SetupProgress): ChatMessage[] {
  const msgs: ChatMessage[] = []
  const incomplete = progress.completedSteps.length < progress.totalSteps

  msgs.push({
    id: generateId(),
    role: 'assistant',
    text: incomplete
      ? "Welcome to FairplAI! I'm your academy assistant. Let me help you get set up — here's where we stand:"
      : "Welcome back! Your academy is all set up. What would you like to do today?",
    cards: [
      { type: 'progress_card' as const, payload: { progress } },
      {
        type: 'action_chips' as const,
        payload: {
          chips: [
            { label: 'Create a squad', action: 'create_roster' },
            { label: 'Add a coach', action: 'add_coach' },
            { label: 'Add players', action: 'add_player' },
            { label: 'Schedule a session', action: 'schedule_session' },
            { label: 'Create program', action: 'add_program' },
            { label: 'View stats', action: 'view_stats' },
          ],
        },
      },
    ],
    timestamp: Date.now(),
  })

  return msgs
}

export function CommandCentreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [setupProgress, setSetupProgress] = useState<SetupProgress>({ completedSteps: [], totalSteps: 6 })
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useRef(false)

  // Initialize on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const progress = computeSetupProgress()
    setSetupProgress(progress)

    // Load saved messages or create welcome
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[]
        if (parsed.length > 0) {
          setMessages(parsed.slice(-MAX_MESSAGES))
          return
        }
      }
    } catch { /* ignore */ }

    setMessages(buildWelcomeMessages(progress))
  }, [])

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)))
      } catch { /* ignore */ }
    }
  }, [messages])

  const refreshProgress = useCallback(() => {
    const p = computeSetupProgress()
    setSetupProgress(p)
    return p
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const ctx = getAcademyContext(setupProgress)
      const response = await fetch('/api/academy-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-20).map(m => ({
            role: m.role,
            content: m.text || '',
          })),
          academyContext: ctx,
        }),
      })

      const data = await response.json()
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: data.text,
        cards: data.cards,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: "Sorry, I had trouble processing that. Could you try again?",
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [messages, setupProgress])

  const executeAction = useCallback((action: AgentAction, data?: Record<string, unknown>) => {
    let confirmText = ''

    switch (action) {
      case 'add_player': {
        const p = data as { firstName: string; lastName: string; guardianEmail: string; position: string; jerseyNumber: string }
        const playerToken = `onboard_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        try {
          const existing = JSON.parse(localStorage.getItem('fairplai_imported_players') || '[]')
          existing.push({
            id: `player_custom_${Date.now()}`,
            academyId: ACADEMY_ID,
            firstName: p.firstName,
            lastName: p.lastName,
            guardianEmail: p.guardianEmail,
            position: p.position ? [p.position] : [],
            jerseyNumber: parseInt(p.jerseyNumber) || 0,
            dateOfBirth: '',
            dominantFoot: 'right',
            status: 'active',
            parentIds: [],
            inviteStatus: 'pending',
            inviteToken: playerToken,
          })
          localStorage.setItem('fairplai_imported_players', JSON.stringify(existing))
        } catch { /* ignore */ }
        // Include inviteToken in data so confirmation card can link to preview
        if (data) data.inviteToken = playerToken
        confirmText = `Added ${p.firstName} ${p.lastName}. Onboarding invite sent to ${p.guardianEmail}.`
        break
      }
      case 'bulk_import': {
        const b = data as { count: number }
        confirmText = `${b.count} players imported. Onboarding invites sent to all guardians.`
        break
      }
      case 'add_coach': {
        const c = data as { name: string; email: string; phone: string; role: string; rosterIds: string[] }
        const coachToken = `coach_onboard_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        try {
          const existing = JSON.parse(localStorage.getItem('fairplai_imported_coaches') || '[]')
          existing.push({
            id: `coach_custom_${Date.now()}`,
            academyId: ACADEMY_ID,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            role: c.role || 'head_coach',
            rosterIds: c.rosterIds || [],
            inviteStatus: 'pending',
            inviteToken: coachToken,
          })
          localStorage.setItem('fairplai_imported_coaches', JSON.stringify(existing))
        } catch { /* ignore */ }
        if (data) data.inviteToken = coachToken
        confirmText = `Added ${c.name}. Onboarding invite sent to ${c.email}.`
        break
      }
      case 'create_roster': {
        const r = data as { name: string; ageGroup: string; type: string }
        try {
          const existing = JSON.parse(localStorage.getItem('fairplai_custom_rosters') || '[]')
          existing.push({
            id: `roster_custom_${Date.now()}`,
            academyId: ACADEMY_ID,
            name: r.name,
            ageGroup: r.ageGroup,
            gender: 'male',
            type: r.type || 'development',
            coachId: '',
          })
          localStorage.setItem('fairplai_custom_rosters', JSON.stringify(existing))
        } catch { /* ignore */ }
        confirmText = `Squad "${r.name}" (${r.ageGroup}) created.`
        break
      }
      case 'schedule_session': {
        const s = data as { rosterId: string; date: string; startTime: string; endTime: string; type: string }
        try {
          const existing = JSON.parse(localStorage.getItem('fairplai_adhoc_sessions') || '[]')
          existing.push({
            id: `session_custom_${Date.now()}`,
            academyId: ACADEMY_ID,
            rosterId: s.rosterId,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            type: s.type || 'training_match',
            status: 'scheduled',
            isAdHoc: true,
          })
          localStorage.setItem('fairplai_adhoc_sessions', JSON.stringify(existing))
        } catch { /* ignore */ }
        confirmText = `Session scheduled for ${s.date}.`
        break
      }
      case 'add_program': {
        const prog = data as { name: string; rosterId: string; facilityId?: string; pitchId?: string; daysOfWeek: string[]; startTime: string; sessionLength: string; termStart: string; termEnd: string }
        // Generate sessions from program
        const generatedSessions: Record<string, unknown>[] = []
        const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
        const selectedDayNums = (prog.daysOfWeek || []).map(d => dayMap[d])
        const start = new Date(prog.termStart)
        const end = new Date(prog.termEnd)
        const programId = `program_custom_${Date.now()}`
        const d = new Date(start)
        const lengthMinutes = parseInt(prog.sessionLength) || 90
        while (d <= end) {
          if (selectedDayNums.includes(d.getDay())) {
            const [h, m] = (prog.startTime || '17:00').split(':').map(Number)
            const endH = h + Math.floor((m + lengthMinutes) / 60)
            const endM = (m + lengthMinutes) % 60
            generatedSessions.push({
              id: `session_prog_${Date.now()}_${generatedSessions.length}`,
              academyId: ACADEMY_ID,
              rosterId: prog.rosterId,
              facilityId: prog.facilityId || '',
              pitchId: prog.pitchId || '',
              date: d.toISOString().split('T')[0],
              startTime: prog.startTime,
              endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
              type: 'drill',
              status: 'scheduled',
              programId,
            })
          }
          d.setDate(d.getDate() + 1)
        }
        try {
          const existingPrograms = JSON.parse(localStorage.getItem('fairplai_custom_programs') || '[]')
          existingPrograms.push({
            id: programId,
            academyId: ACADEMY_ID,
            name: prog.name,
            rosterId: prog.rosterId,
            facilityId: prog.facilityId || '',
            pitchId: prog.pitchId || '',
            daysOfWeek: prog.daysOfWeek,
            startTime: prog.startTime,
            sessionLengthMinutes: lengthMinutes,
            termStart: prog.termStart,
            termEnd: prog.termEnd,
            sessionsGenerated: generatedSessions.length,
          })
          localStorage.setItem('fairplai_custom_programs', JSON.stringify(existingPrograms))
          const existingSessions = JSON.parse(localStorage.getItem('fairplai_adhoc_sessions') || '[]')
          existingSessions.push(...generatedSessions)
          localStorage.setItem('fairplai_adhoc_sessions', JSON.stringify(existingSessions))
        } catch { /* ignore */ }
        confirmText = `Program "${prog.name}" created with ${generatedSessions.length} sessions generated.`
        break
      }
      default:
        confirmText = 'Action completed.'
    }

    const confirmMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      text: confirmText,
      cards: [{ type: 'confirmation', payload: { action, ...data } }],
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, confirmMsg])
    refreshProgress()
  }, [refreshProgress])

  const appendAssistantMessage = useCallback((text: string, cards?: ChatCard[]) => {
    const msg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      text,
      cards,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, msg])
  }, [])

  const triggerAction = useCallback((action: AgentAction) => {
    const actionLabels: Record<string, string> = {
      add_player: "I'd like to add a player",
      add_coach: "I'd like to add a coach",
      create_roster: "I want to create a squad",
      schedule_session: "I'd like to schedule a session",
      add_program: "I want to create a training program",
      import_csv: "I want to import players from CSV",
      view_stats: "Show me the academy stats",
      check_credits: "What's my credit balance?",
      list_players: "Show me the player list",
      list_rosters: "Show me the squads",
      list_coaches: "Show me the coaches",
      list_sessions: "Show me upcoming sessions",
      list_programs: "Show me the programs",
    }
    const text = actionLabels[action] || action
    sendMessage(text)
  }, [sendMessage])

  return (
    <CommandCentreContext.Provider value={{ messages, setupProgress, isLoading, sendMessage, executeAction, triggerAction, appendAssistantMessage }}>
      {children}
    </CommandCentreContext.Provider>
  )
}
