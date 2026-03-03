'use client'

import { useState, useCallback } from 'react'
import type { UserRole } from '@/lib/types'

const ROLE_KEY = 'fairplai_role'

export function useRole() {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'parent'
    return (localStorage.getItem(ROLE_KEY) as UserRole) || 'parent'
  })

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_KEY, newRole)
    }
  }, [])

  return { role, setRole }
}
