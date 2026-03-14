import { sessions as baseSessions, leaseContracts } from './mockData'
import type { Session } from './types'

interface ConflictResult {
  hasConflict: boolean
  type: 'session_overlap' | 'outside_hours' | null
  message: string
  conflictingSessions: Session[]
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  const start1 = timeToMinutes(s1)
  const end1 = timeToMinutes(e1)
  const start2 = timeToMinutes(s2)
  const end2 = timeToMinutes(e2)
  return start1 < end2 && start2 < end1
}

export function checkConflicts(
  pitchId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
): ConflictResult {
  if (!pitchId || !date || !startTime || !endTime) {
    return { hasConflict: false, type: null, message: '', conflictingSessions: [] }
  }

  // Gather all sessions (mock + ad-hoc from localStorage)
  let allSessions = [...baseSessions]
  if (typeof window !== 'undefined') {
    try {
      const adhoc = localStorage.getItem('fairplai_adhoc_sessions')
      if (adhoc) allSessions = [...allSessions, ...JSON.parse(adhoc)]
    } catch { /* ignore */ }
  }

  // Filter to same pitch and date
  const samePitchDate = allSessions.filter(s =>
    s.pitchId === pitchId &&
    s.date === date &&
    s.id !== excludeSessionId
  )

  // Check time overlap
  const conflicting = samePitchDate.filter(s =>
    timesOverlap(startTime, endTime, s.startTime, s.endTime)
  )

  if (conflicting.length > 0) {
    const first = conflicting[0]
    return {
      hasConflict: true,
      type: 'session_overlap',
      message: `Conflicts with "${first.type === 'match' ? 'Match' : 'Training'}" session on this pitch from ${first.startTime} to ${first.endTime}`,
      conflictingSessions: conflicting,
    }
  }

  // Check if within contracted hours
  const dayOfWeek = new Date(date + 'T00:00:00').getDay()
  const pitchContracts = leaseContracts.filter(c =>
    c.pitchId === pitchId &&
    c.status !== 'expired' &&
    c.dayOfWeek.includes(dayOfWeek)
  )

  if (pitchContracts.length > 0) {
    const withinContract = pitchContracts.some(c =>
      timeToMinutes(startTime) >= timeToMinutes(c.startTime) &&
      timeToMinutes(endTime) <= timeToMinutes(c.endTime)
    )
    if (!withinContract) {
      return {
        hasConflict: true,
        type: 'outside_hours',
        message: `This timeslot is outside the contracted hours for this pitch on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}`,
        conflictingSessions: [],
      }
    }
  }

  return { hasConflict: false, type: null, message: '', conflictingSessions: [] }
}
