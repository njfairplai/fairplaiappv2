'use client'

import { CommandCentreProvider } from '@/contexts/CommandCentreContext'
import ChatContainer from '@/components/academy-admin/chat/ChatContainer'

export default function AcademyDashboard() {
  return (
    <div style={{ padding: 24, height: '100vh', boxSizing: 'border-box' }}>
      <CommandCentreProvider>
        <ChatContainer />
      </CommandCentreProvider>
    </div>
  )
}
