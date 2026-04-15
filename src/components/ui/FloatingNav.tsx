'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { COLORS, RADIUS, ROLE_PATHS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import { Building2, GraduationCap, Trophy, Heart, Zap, ArrowRightLeft, X, Video, Home, Monitor, Shield, Share2 } from 'lucide-react'

const roles: { role: UserRole; label: string; icon: React.ElementType; description: string; color?: string }[] = [
  { role: 'super_admin', label: 'Super Admin', icon: Shield, description: 'Platform management & client operations', color: '#DC2626' },
  { role: 'facility_admin', label: 'Facility Admin', icon: Building2, description: 'Manage pitches & contracts' },
  { role: 'academy_admin', label: 'Academy Admin', icon: GraduationCap, description: 'Manage squads, players & credits' },
  { role: 'coach', label: 'Coach (Mobile)', icon: Trophy, description: 'Pitch-side: record, attendance & squad' },
  { role: 'parent', label: 'Parent', icon: Heart, description: "Track your child's progress" },
  { role: 'player', label: 'Player', icon: Zap, description: 'See your game plan & highlights' },
]

export default function FloatingNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on public pages (home, shared links, guest footage)
  const isPublicPage = pathname === '/' || pathname.startsWith('/share/') || pathname.startsWith('/guest/')

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
      {/* Home button */}
      {pathname !== '/' && (
        <button
          onClick={() => router.push('/')}
          style={{
            position: 'fixed',
            bottom: 148,
            right: 16,
            zIndex: 999,
            width: 40,
            height: 40,
            borderRadius: 20,
            background: '#fff',
            border: `1.5px solid ${COLORS.primary}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Home size={18} color={COLORS.primary} />
        </button>
      )}

      {/* Role switcher button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 16,
          zIndex: 999,
          height: 40,
          borderRadius: 20,
          background: COLORS.primary,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 14px',
          boxShadow: '0 4px 20px rgba(74,74,255,0.4)',
        }}
      >
        <ArrowRightLeft size={16} color="#fff" />
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{currentLabel}</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: RADIUS.card + 4,
              padding: 24,
              width: '100%',
              maxWidth: 360,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', background: '#FEF3C7', padding: '3px 10px', borderRadius: 12, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Demo Mode</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color={COLORS.muted} />
              </button>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: '0 0 4px' }}>Switch Portal</h3>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 16px' }}>Select a role to explore</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roles.map(({ role, label, icon: Icon, description, color }) => {
                const isActive = currentRole === role
                const accent = color || COLORS.primary
                return (
                  <button
                    key={role}
                    onClick={() => selectRole(role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: RADIUS.card,
                      background: isActive ? `${accent}10` : '#F5F6FC',
                      border: isActive ? `2px solid ${accent}` : '2px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${accent}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={20} color={accent} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{description}</p>
                    </div>
                  </button>
                )
              })}

              {/* Coach Web Portal */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') localStorage.setItem('fairplai_role', 'coach')
                  setOpen(false)
                  router.push('/coach/web')
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: RADIUS.card,
                  background: pathname.startsWith('/coach/web') ? `${COLORS.primary}10` : '#F5F6FC',
                  border: pathname.startsWith('/coach/web') ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', width: '100%',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${COLORS.primary}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Monitor size={20} color={COLORS.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Coach (Web)</p>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Desktop: review, analyse & develop</p>
                </div>
              </button>

              <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => { setOpen(false); router.push('/guest/demo-session_007') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: RADIUS.card,
                    background: '#F5F6FC', border: '2px solid transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', width: '100%',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${COLORS.primary}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Video size={20} color={COLORS.primary} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Guest Footage</p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>View match footage as a guest</p>
                  </div>
                </button>
                <button
                  onClick={() => { setOpen(false); router.push('/share/demo') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: RADIUS.card,
                    background: '#F5F6FC', border: '2px solid transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', width: '100%',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: '#25D36615',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Share2 size={20} color="#25D366" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0 }}>WhatsApp Share</p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>See the shared link experience</p>
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
