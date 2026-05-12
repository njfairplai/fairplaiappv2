'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ROLE_PATHS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import { Building2, GraduationCap, Trophy, Heart, Zap, ArrowRightLeft, X, Video, Home, Monitor, Shield, Share2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const roles: { role: UserRole; label: string; icon: React.ElementType; description: string; color?: string }[] = [
  { role: 'super_admin', label: 'Super Admin', icon: Shield, description: 'Platform management & client operations', color: '#DC2626' },
  { role: 'facility_admin', label: 'Facility Admin', icon: Building2, description: 'Manage pitches & contracts' },
  { role: 'academy_admin', label: 'Academy Admin', icon: GraduationCap, description: 'Manage squads, players & credits' },
  { role: 'coach', label: 'Coach (Mobile)', icon: Trophy, description: 'Pitch-side: record, attendance & squad' },
  { role: 'parent', label: 'Parent', icon: Heart, description: "Track your child's progress" },
  { role: 'player', label: 'Player', icon: Zap, description: 'See your game plan & highlights' },
]

const BRAND_PRIMARY = '#4A4AFF'

/**
 * Dev-only role switcher pill that floats bottom-right. Hidden on public
 * pages and on the coach/web product surfaces (those are the customer-
 * facing flow; the switcher would be noise there).
 *
 * Per-role accent colours are role-semantic (red for super_admin, etc.) so
 * they don't follow the active palette — kept as inline arbitrary values.
 */
export default function FloatingNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/share/') ||
    pathname.startsWith('/guest/') ||
    pathname.startsWith('/coach/web')

  function selectRole(role: UserRole) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fairplai_role', role)
    }
    setOpen(false)
    router.push(ROLE_PATHS[role] || '/')
  }

  const currentRole = typeof window !== 'undefined' ? localStorage.getItem('fairplai_role') : null
  const currentLabel = roles.find(r => r.role === currentRole)?.label || 'Switch'

  if (isPublicPage) return null

  return (
    <>
      {pathname !== '/' && (
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
      )}

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
              {roles.map(({ role, label, icon: Icon, description, color }) => {
                const isActive = currentRole === role
                const accent = color || BRAND_PRIMARY
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectRole(role)}
                    style={{
                      background: isActive ? `${accent}10` : '#F5F6FC',
                      borderColor: isActive ? accent : 'transparent',
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors duration-150"
                  >
                    <div
                      style={{ background: `${accent}15` }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                    >
                      <Icon size={20} style={{ color: accent }} />
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

              {/* Coach Web Portal */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') localStorage.setItem('fairplai_role', 'coach')
                  setOpen(false)
                  router.push('/coach/web')
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors duration-150',
                  pathname.startsWith('/coach/web')
                    ? 'bg-[color:var(--color-ahoy-blue)]/10 border-[color:var(--color-ahoy-blue)]'
                    : 'bg-[#F5F6FC] border-transparent',
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--color-ahoy-blue)]/15">
                  <Monitor size={20} className="text-[color:var(--color-ahoy-blue)]" />
                </div>
                <div className="flex-1">
                  <p className="m-0 font-satoshi text-[15px] font-bold text-[color:var(--color-deep-indigo)]">
                    Coach (Web)
                  </p>
                  <p className="m-0 font-satoshi text-xs text-[color:var(--color-graphite)]">
                    Desktop: review, analyse & develop
                  </p>
                </div>
              </button>

              <div className="mt-2 flex flex-col gap-2 border-t border-[color:var(--color-fp-white)] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.push('/guest/demo-session_007')
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-transparent bg-[#F5F6FC] px-4 py-3.5 text-left transition-colors duration-150"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--color-ahoy-blue)]/15">
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
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.push('/share/demo')
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-transparent bg-[#F5F6FC] px-4 py-3.5 text-left transition-colors duration-150"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#25D366]/15">
                    <Share2 size={20} className="text-[#25D366]" />
                  </div>
                  <div className="flex-1">
                    <p className="m-0 font-satoshi text-[15px] font-bold text-[color:var(--color-deep-indigo)]">
                      WhatsApp Share
                    </p>
                    <p className="m-0 font-satoshi text-xs text-[color:var(--color-graphite)]">
                      See the shared link experience
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
