'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { COLORS, ROLE_PATHS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'
import {
  Building2, GraduationCap, Trophy, Heart, ChevronRight,
  Film, Eye, Monitor, Zap,
} from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()

  function selectRole(role: UserRole) {
    localStorage.setItem('fairplai_role', role)
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
      padding: '40px 20px 64px',
      overflowY: 'auto',
    }}>
      {/* ── Header ─────────────────────────────── */}
      <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain' }} priority />
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '14px 0 0', textAlign: 'center', letterSpacing: '-0.02em' }}>
        Welcome to FairplAI
      </h1>
      <p style={{ fontSize: 14, color: '#9DA2B3', marginTop: 6, marginBottom: 0, textAlign: 'center', lineHeight: 1.4 }}>
        AI-powered youth football development
      </p>
      <button
        onClick={() => router.push('/login')}
        style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary, fontSize: 13, fontWeight: 600 }}
      >
        Sign in with credentials &rarr;
      </button>

      {/* ── Player & Parent ─────────────────────── */}
      <SectionHeader label="Player & Parent" icon={Heart} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 520 }}>
        <RoleCard
          icon={Zap}
          title="Player App"
          description="Your game plan, highlights & stats"
          color="#00C9A7"
          onClick={() => selectRole('player')}
          compact
        />
        <RoleCard
          icon={Heart}
          title="Parent App"
          description="Track your child's development"
          color={COLORS.primary}
          onClick={() => selectRole('parent')}
          compact
        />
      </div>

      {/* ── Coach ───────────────────────────────── */}
      <SectionHeader label="Coach" icon={Trophy} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 520 }}>
        <RoleCard
          icon={Film}
          title="Mobile App"
          description="Watch & analyse session footage on mobile"
          color={COLORS.primary}
          onClick={() => {
            localStorage.setItem('fairplai_role', 'coach')
            router.push('/coach/video')
          }}
          compact
        />
        <RoleCard
          icon={Monitor}
          title="Web Portal"
          description="Desktop experience for review & analysis"
          color={COLORS.primary}
          onClick={() => {
            localStorage.setItem('fairplai_role', 'coach')
            router.push('/coach/web')
          }}
          compact
        />
      </div>

      {/* ── Academy ─────────────────────────────── */}
      <SectionHeader label="Academy" icon={GraduationCap} />

      <RoleCard
        icon={GraduationCap}
        title="Command Centre"
        description="Manage squads, players and academy operations"
        color={COLORS.primary}
        onClick={() => selectRole('academy_admin')}
      />

      {/* ── Facility ────────────────────────────── */}
      <SectionHeader label="Facility" icon={Building2} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 520 }}>
        <RoleCard
          icon={Building2}
          title="Facility Admin"
          description="Manage pitches, contracts & schedule"
          color="#6366F1"
          onClick={() => selectRole('facility_admin')}
          compact
        />
        <RoleCard
          icon={Eye}
          title="Guest Footage"
          description="View shared match footage"
          color="#10B981"
          onClick={() => router.push('/guest/demo-session_007')}
          compact
        />
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}

/* ── Section header with icon ──────────────────── */
function SectionHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', maxWidth: 520, margin: '28px 0 14px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={14} color="rgba(255,255,255,0.9)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
    </div>
  )
}

/* ── Role card (full or compact) ───────────────── */
function RoleCard({ icon: Icon, title, description, color, onClick, compact }: {
  icon: React.ElementType
  title: string
  description: string
  color: string
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        maxWidth: compact ? undefined : 520,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: compact ? '18px 16px' : '20px 22px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: compact ? 'column' : 'row',
        alignItems: compact ? 'flex-start' : 'center',
        gap: compact ? 0 : 16,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.borderColor = color + '50'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: compact ? 36 : 44,
        height: compact ? 36 : 44,
        borderRadius: 10,
        background: color + '18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: compact ? 10 : 0,
        flexShrink: 0,
      }}>
        <Icon size={compact ? 18 : 22} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: compact ? 15 : 18, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</p>
        <p style={{ fontSize: compact ? 12 : 13, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.3 }}>{description}</p>
      </div>
      <ChevronRight size={compact ? 14 : 18} color={color} style={{
        position: compact ? 'absolute' : 'relative',
        ...(compact ? { top: 16, right: 14 } : {}),
        opacity: 0.6,
      }} />
    </button>
  )
}

