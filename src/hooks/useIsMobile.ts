'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true when the viewport width is below the given breakpoint.
 * Defaults to 768px (matches the standard tablet/mobile breakpoint).
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  return isMobile
}
