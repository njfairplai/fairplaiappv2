'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { coaches, rosters } from '@/lib/mockData'

interface TeamContextType {
  selectedRosterId: string
  setSelectedRosterId: (id: string) => void
  availableRosters: typeof rosters
}

const TeamContext = createContext<TeamContextType | null>(null)

export function TeamProvider({ children }: { children: ReactNode }) {
  const coach = coaches[0]
  const available = rosters.filter(r => coach.rosterIds.includes(r.id))
  const [selectedRosterId, setSelected] = useState(available[0]?.id || '')

  useEffect(() => {
    const stored = localStorage.getItem('fairplai_coach_team')
    if (stored && available.some(r => r.id === stored)) setSelected(stored)
  }, [])

  function setSelectedRosterId(id: string) {
    setSelected(id)
    localStorage.setItem('fairplai_coach_team', id)
  }

  return (
    <TeamContext.Provider value={{ selectedRosterId, setSelectedRosterId, availableRosters: available }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}
