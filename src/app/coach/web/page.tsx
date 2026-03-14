'use client'

import { CoachHubProvider } from '@/contexts/CoachHubContext'
import CoachChatContainer from '@/components/coach/hub/CoachChatContainer'

export default function CoachWebDashboard() {
  return (
    <CoachHubProvider>
      <CoachChatContainer />
    </CoachHubProvider>
  )
}
