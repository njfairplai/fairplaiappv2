'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { COLORS, ROLE_PATHS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import { Building2, GraduationCap, Trophy, Heart, ChevronRight } from 'lucide-react'

const roles: { role: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { role: 'facility_admin', label: 'Facility Admin', icon: Building2, description: 'Manage pitches, contracts and facility schedule' },
  { role: 'academy_admin', label: 'Academy Admin', icon: GraduationCap, description: 'Manage rosters, players and academy operations' },
  { role: 'coach', label: 'Coach', icon: Trophy, description: 'View squad performance and session footage' },
  { role: 'parent', label: 'Parent', icon: Heart, description: "Follow your child's development and highlights" },
]

export default function SplashPage() {
  const router = useRouter()

  function selectRole(role: UserRole) {
    localStorage.setItem('fairplai_role', role)
    const consented = localStorage.getItem('fairplai_consented')
    if (!consented) {
      router.push('/consent')
    } else {
      router.push(ROLE_PATHS[role])
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at center, ${COLORS.navy} 0%, ${COLORS.darkBg} 70%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Image src="/logo-white.png" alt="FairplAI" width={120} height={36} style={{ height: 36, width: 'auto', objectFit: 'contain' }} priority />

      <p style={{ fontSize: 16, color: '#9DA2B3', marginTop: 12, marginBottom: 40, textAlign: 'center' }}>Select your portal to continue</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 480 }}>
        {roles.map(({ role, label, icon: Icon, description }) => (
          <button
            key={role}
            onClick={() => selectRole(role)}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: 16,
              padding: 24,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.15s ease',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={22} color={COLORS.primary} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: '0 0 6px' }}>{label}</p>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0, lineHeight: 1.4, flex: 1 }}>{description}</p>
            <ChevronRight size={16} color={COLORS.muted} style={{ position: 'absolute', bottom: 16, right: 16 }} />
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push('/login')}
        style={{ marginTop: 32, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 14, fontWeight: 600 }}
      >
        Sign in with credentials →
      </button>
    </div>
  )
}
