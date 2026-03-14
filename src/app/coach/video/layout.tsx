'use client'

import { TeamProvider } from '@/contexts/TeamContext'

export default function VideoPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeamProvider>
      {children}
    </TeamProvider>
  )
}
