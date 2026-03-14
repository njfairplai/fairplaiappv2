'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/types'

interface AuthSession {
  userId: string
  email: string
  role: UserRole
  loginTimestamp: number
  expiresAt: number
}

interface AuthContextType {
  user: AuthSession | null
  isAuthenticated: boolean
  login: (email: string, role: UserRole) => void
  logout: () => void
}

const AUTH_KEY = 'fairplai_auth_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const AuthContext = createContext<AuthContextType | null>(null)

// Pages that don't require auth
const PUBLIC_PATHS = ['/login', '/consent', '/forgot-password', '/invite', '/onboard', '/terms', '/privacy', '/guest', '/feedback']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname === '/'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthSession | null>(null)
  const [checked, setChecked] = useState(false)

  // Check session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) {
        const session: AuthSession = JSON.parse(stored)
        if (Date.now() < session.expiresAt) {
          setUser(session)
        } else {
          // Session expired
          localStorage.removeItem(AUTH_KEY)
          localStorage.removeItem('fairplai_role')
          localStorage.removeItem('fairplai_consented')
          if (!isPublicPath(pathname)) {
            router.replace('/login')
          }
        }
      }
    } catch {
      localStorage.removeItem(AUTH_KEY)
    }
    setChecked(true)
  }, [])

  const login = useCallback((email: string, role: UserRole) => {
    const now = Date.now()
    const session: AuthSession = {
      userId: `user_${role}_${now}`,
      email,
      role,
      loginTimestamp: now,
      expiresAt: now + SESSION_DURATION,
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    localStorage.setItem('fairplai_role', role)
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem('fairplai_role')
    localStorage.removeItem('fairplai_consented')
    setUser(null)
    router.push('/login')
  }, [router])

  if (!checked) return null

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
