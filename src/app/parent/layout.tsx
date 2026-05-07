'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'
import { seedWelfareIfEmpty } from '@/lib/welfare-store'
import { SoftLockBanner } from '@/components/demo/SoftLockBanner'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const role = typeof window !== 'undefined' ? localStorage.getItem('fairplai_role') : null
  useEffect(() => { if (role && role !== 'parent') router.replace('/login') }, [role, router])
  // Seed welfare demo data on first visit so the Workload / Gear / Coach's
  // clips surfaces have shape immediately. Idempotent.
  useEffect(() => { seedWelfareIfEmpty() }, [])
  if (role && role !== 'parent') return null
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
      <SoftLockBanner />
      {children}
      <BottomNav portal="parent" />
      <FeedbackOverlay bottomOffset={90} />
    </div>
  )
}
