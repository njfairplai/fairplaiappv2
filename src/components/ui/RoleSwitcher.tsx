'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLE_PATHS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import { Building2, GraduationCap, Trophy, Heart, Zap, ArrowRightLeft, X, Video, Home } from 'lucide-react'
import { cn } from '@/lib/cn'

const roles: { role: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { role: 'facility_admin', label: 'Facility Admin', icon: Building2, description: 'Manage pitches & contracts' },
  { role: 'academy_admin', label: 'Academy Admin', icon: GraduationCap, description: 'Manage squads, players & credits' },
  { role: 'coach', label: 'Coach', icon: Trophy, description: 'View squad, sessions & analytics' },
  { role: 'parent', label: 'Parent', icon: Heart, description: "Track your child's progress" },
  { role: 'player', label: 'Player', icon: Zap, description: 'See your game plan & highlights' },
]

/**
 * Legacy role switcher (simpler version of FloatingNav, kept for screens
 * that don't need the super-admin / coach-web variants). Same chrome.
 */
export default function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function selectRole(role: UserRole) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fairplai_role', role)
    }
    setOpen(false)
    router.push(ROLE_PATHS[role] || '/')
  }

  const currentRole = typeof window !== 'undefined' ? localStorage.getItem('fairplai_role') : null
  const currentLabel = roles.find((r) => r.role === currentRole)?.label || 'Switch'

  const rowClass =
    'flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-transparent bg-[#F5F6FC] px-4 py-3.5 text-left transition-colors duration-150'
  const iconBoxClass =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--color-ahoy-blue)]/15'

  return (
    <>
      <button
        type="button"
        onClick={() => router.push('/')}
        className={cn(
          'fixed bottom-[148px] right-4 z-[999]',
          'flex h-10 w-10 cursor-pointer items-center justify-center',
          'rounded-full border-[1.5px] border-[color:var(--color-ahoy-blue)] bg-white',
          'shadow-[0_4px_20px_rgba(0,0,0,0.15)]',
        )}
        aria-label="Home"
      >
        <Home size={18} className="text-[color:var(--color-ahoy-blue)]" />
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-[100px] right-4 z-[999]',
          'flex h-10 cursor-pointer items-center gap-1.5 rounded-full border-none px-3.5',
          'bg-[color:var(--color-ahoy-blue)]',
          'shadow-[0_4px_20px_rgba(74,74,255,0.4)]',
        )}
      >
        <ArrowRightLeft size={16} className="text-white" />
        <span className="whitespace-nowrap font-satoshi text-xs font-semibold text-white">
          {currentLabel}
        </span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] rounded-2xl bg-white p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-xl bg-[#FEF3C7] px-2.5 py-1 font-satoshi text-[11px] font-bold uppercase tracking-[0.03em] text-[#92400E]">
                Demo Mode
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer border-none bg-transparent p-1"
                aria-label="Close"
              >
                <X size={18} className="text-[color:var(--color-graphite)]" />
              </button>
            </div>
            <h3 className="m-0 mb-1 font-satoshi text-lg font-extrabold text-[color:var(--color-deep-indigo)]">
              Switch Portal
            </h3>
            <p className="m-0 mb-4 font-satoshi text-[13px] text-[color:var(--color-graphite)]">
              Select a role to explore
            </p>
            <div className="flex flex-col gap-2">
              {roles.map(({ role, label, icon: Icon, description }) => {
                const isActive = currentRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectRole(role)}
                    className={cn(
                      rowClass,
                      isActive &&
                        '!bg-[color:var(--color-ahoy-blue)]/10 !border-[color:var(--color-ahoy-blue)]',
                    )}
                  >
                    <div className={iconBoxClass}>
                      <Icon size={20} className="text-[color:var(--color-ahoy-blue)]" />
                    </div>
                    <div className="flex-1">
                      <p className="m-0 font-satoshi text-[15px] font-bold text-[color:var(--color-deep-indigo)]">
                        {label}
                      </p>
                      <p className="m-0 font-satoshi text-xs text-[color:var(--color-graphite)]">
                        {description}
                      </p>
                    </div>
                  </button>
                )
              })}

              <div className="mt-2 border-t border-[color:var(--color-fp-white)] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.push('/guest/demo-session_007')
                  }}
                  className={rowClass}
                >
                  <div className={iconBoxClass}>
                    <Video size={20} className="text-[color:var(--color-ahoy-blue)]" />
                  </div>
                  <div className="flex-1">
                    <p className="m-0 font-satoshi text-[15px] font-bold text-[color:var(--color-deep-indigo)]">
                      Guest Footage
                    </p>
                    <p className="m-0 font-satoshi text-xs text-[color:var(--color-graphite)]">
                      View match footage as a guest
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
