'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { COLORS, ROLE_PATHS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import {
  Building2, GraduationCap, Trophy, Heart, ChevronRight,
  Film, Eye, UserPlus, Mail, Video, BookOpen, Monitor,
} from 'lucide-react'

/* ── Portal roles ────────────────────────────── */
const roles: { role: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { role: 'facility_admin', label: 'Facility Admin', icon: Building2, description: 'Manage pitches, contracts and facility schedule' },
  { role: 'academy_admin', label: 'Academy Admin', icon: GraduationCap, description: 'Manage squads, players and academy operations' },
  { role: 'coach', label: 'Coach', icon: Trophy, description: 'View squad performance and session footage' },
  { role: 'parent', label: 'Parent/Player', icon: Heart, description: "Follow your child's development and highlights" },
]

/* ── Setup & onboarding links ────────────────── */
const setupLinks: { label: string; description: string; href: string; icon: React.ElementType; color: string }[] = [
  { label: 'Player Onboarding', description: 'Preview player sign-up flow', href: '/onboard/demo-token', icon: UserPlus, color: '#10B981' },
  { label: 'Coach Onboarding', description: 'Preview coach sign-up flow', href: '/onboard/coach/demo-coach-token', icon: Trophy, color: '#F59E0B' },
  { label: 'Programs', description: 'Manage training programs', href: '/admin/programs', icon: BookOpen, color: '#8B5CF6' },
  { label: 'Sessions', description: 'Schedule & manage sessions', href: '/admin/sessions', icon: Video, color: '#6366F1' },
]

export default function SplashPage() {
  const router = useRouter()

  function selectRole(role: UserRole) {
    localStorage.setItem('fairplai_role', role)
    // Consent screen is only required for parent/player role
    if (role === 'parent') {
      const consented = localStorage.getItem('fairplai_consented')
      const storedVersion = localStorage.getItem('policy_version')
      if (!consented || (storedVersion && storedVersion < '2.0')) {
        router.push('/consent')
        return
      }
    }
    router.push(ROLE_PATHS[role])
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at center, ${COLORS.navy} 0%, ${COLORS.darkBg} 70%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px 64px',
      overflowY: 'auto',
    }}>
      {/* ── Header ─────────────────────────────── */}
      <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain' }} priority />
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '16px 0 0', textAlign: 'center', letterSpacing: '-0.02em' }}>
        Welcome to FairplAI
      </h1>
      <p style={{ fontSize: 15, color: '#9DA2B3', marginTop: 6, marginBottom: 0, textAlign: 'center' }}>
        AI-powered youth football development
      </p>
      <button
        onClick={() => router.push('/login')}
        style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 13, fontWeight: 600 }}
      >
        Sign in with credentials &rarr;
      </button>

      {/* ── Portals ─────────────────────────────── */}
      <SectionHeader label="Portals" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 520 }}>
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

      {/* ── Coach Tools ─────────────────────────── */}
      <SectionHeader label="Coach Tools" />

      {/* Video Portal — Hero card */}
      <Link
        href="/coach/video"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          width: '100%',
          maxWidth: 520,
          padding: '24px 28px',
          borderRadius: 18,
          background: `linear-gradient(135deg, ${COLORS.primary}18 0%, ${COLORS.periwinkle}12 100%)`,
          border: `1.5px solid ${COLORS.primary}40`,
          textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = COLORS.primary + '80'
          e.currentTarget.style.transform = 'scale(1.01)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = COLORS.primary + '40'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: `${COLORS.primary}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Film size={28} color={COLORS.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>Video Portal</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.3 }}>
            Watch &amp; analyse session footage
          </p>
          <p style={{ fontSize: 11, color: COLORS.primary, margin: '6px 0 0', fontWeight: 600 }}>
            Training &middot; Matches &middot; Highlights
          </p>
        </div>
        <ChevronRight size={20} color={COLORS.primary} />
      </Link>

      {/* Coach Web Portal */}
      <Link
        href="/coach/web"
        onClick={() => { localStorage.setItem('fairplai_role', 'coach') }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          width: '100%',
          maxWidth: 520,
          padding: '24px 28px',
          borderRadius: 18,
          marginTop: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = COLORS.primary + '60'
          e.currentTarget.style.transform = 'scale(1.01)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: `${COLORS.primary}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Monitor size={28} color={COLORS.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>Coach Web Portal</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.3 }}>
            Desktop experience for review &amp; analysis
          </p>
          <p style={{ fontSize: 11, color: COLORS.primary, margin: '6px 0 0', fontWeight: 600 }}>
            Dashboard &middot; Match Centre &middot; Squad Analytics
          </p>
        </div>
        <ChevronRight size={20} color={COLORS.primary} />
      </Link>

      {/* ── Setup & Onboarding ─────────────────── */}
      <SectionHeader label="Setup & Onboarding" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 520 }}>
        {setupLinks.map(({ label, description, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '16px 18px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = color + '60'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0', lineHeight: 1.3 }}>{description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Guest Access ────────────────────────── */}
      <SectionHeader label="Guest Access" />

      <Link
        href="/guest/demo-session_007"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          maxWidth: 520,
          padding: '18px 22px',
          borderRadius: 14,
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.2)',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(16,185,129,0.1)'
          e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(16,185,129,0.06)'
          e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: 'rgba(16,185,129,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Eye size={22} color="#10B981" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Guest Footage</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '3px 0 0', lineHeight: 1.3 }}>
            View shared match footage without an account
          </p>
        </div>
        <ChevronRight size={18} color="#10B981" />
      </Link>

      <div style={{ height: 32 }} />
    </div>
  )
}

/* ── Section header with lines ─────────────────── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', maxWidth: 520, margin: '32px 0 16px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
    </div>
  )
}
