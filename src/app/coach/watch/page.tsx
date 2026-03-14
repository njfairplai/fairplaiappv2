'use client'

import { useEffect } from 'react'

export default function WatchRedirect() {
  useEffect(() => {
    window.location.replace('/coach/video')
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
      Redirecting to Video Portal…
    </div>
  )
}
