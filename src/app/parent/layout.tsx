'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'
import { seedWelfareIfEmpty } from '@/lib/welfare-store'
import { SoftLockBanner } from '@/components/demo/SoftLockBanner'
import { PortalToggleFab } from '@/components/demo/PortalToggleFab'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const role = typeof window !== 'undefined' ? localStorage.getItem('fairplai_role') : null
  // Suppress the role-mismatch redirect during a guided demo tour.
  // Without this, a tester who previously signed in as coach lands on
  // /login the moment the coach→parent transition tries to push them
  // to /parent/home. The demo flow owns its own routing; auth gating
  // is for real users navigating /parent/* directly.
  const demoActive = typeof window !== 'undefined' ? localStorage.getItem('fairplai_demo_active') : null
  const blocked = !demoActive && !!role && role !== 'parent'
  useEffect(() => { if (blocked) router.replace('/login') }, [blocked, router])
  // Seed welfare demo data on first visit so the Workload / Gear / Coach's
  // clips surfaces have shape immediately. Idempotent.
  useEffect(() => { seedWelfareIfEmpty() }, [])
  if (blocked) return null
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
      <SoftLockBanner />
      {children}
      <BottomNav portal="parent" />
      <FeedbackOverlay bottomOffset={90} />
      <PortalToggleFab />
    </div>
  )
}
