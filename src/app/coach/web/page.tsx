'use client'

import { CoachHubProvider } from '@/contexts/CoachHubContext'
import CoachChatContainer from '@/components/coach/hub/CoachChatContainer'

/* ─── MAIN PAGE ───────────────────────────────────────────── */
export default function CoachWebDashboard() {
  return (
    <CoachHubProvider>
      <div style={{
        padding: 20,
        height: 'calc(100vh - 108px)',
        background: '#F5F6FC',
      }}>
        <div style={{ height: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8EAED' }}>
          <CoachChatContainer />
        </div>
      </div>
    </CoachHubProvider>
  )
}
