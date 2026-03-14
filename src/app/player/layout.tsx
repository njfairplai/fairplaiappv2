'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'
import FeedbackOverlay from '@/components/feedback/FeedbackOverlay'
import { playerTokens } from '@/styles/player-tokens'

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const role = typeof window !== 'undefined' ? localStorage.getItem('fairplai_role') : null
  const viewAsPlayer = typeof window !== 'undefined' ? localStorage.getItem('fairplai_view_as_player') : null

  useEffect(() => {
    if (role && role !== 'player' && !viewAsPlayer) router.replace('/login')
  }, [role, viewAsPlayer, router])

  if (role && role !== 'player' && !viewAsPlayer) return null

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
      {viewAsPlayer && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 60,
          background: playerTokens.primary, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', fontSize: 13, fontWeight: 600,
        }}>
          <span>Viewing as Kiyan</span>
          <button
            onClick={() => {
              localStorage.removeItem('fairplai_view_as_player')
              router.push('/parent/settings')
            }}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Exit
          </button>
        </div>
      )}
      {children}
      <BottomNav portal="player" />
      <FeedbackOverlay bottomOffset={90} />
    </div>
  )
}
