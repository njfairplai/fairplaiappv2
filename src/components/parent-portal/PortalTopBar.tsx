'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Bell, User } from 'lucide-react'

interface PortalTopBarProps {
  /** Optional unread count for the bell badge. 0 hides the badge. */
  unreadCount?: number
  /** Title shown center-bar. Defaults to "Fairpl.ai". */
  title?: string
  /** When true, renders a back chevron in place of the avatar. */
  showBack?: boolean
}

/* TODO: design-refinement-target — Pack 3 will refine.
 * Slim sticky top bar with avatar (left) → settings, title (centre),
 * notification bell (right) with unread-count badge. */
export function PortalTopBar({
  unreadCount = 0,
  title = 'Fairpl.ai',
  showBack = false,
}: PortalTopBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--brand-sand)',
        borderBottom: '1px solid var(--brand-line)',
        height: 52,
        display: 'grid',
        gridTemplateColumns: '40px 1fr 40px',
        alignItems: 'center',
        padding: '0 12px',
      }}
    >
      {showBack ? (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          style={iconBtnStyle()}
        >
          ‹
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            router.push(pathname.startsWith('/player') ? '/player/settings' : '/parent/settings')
          }
          aria-label="Settings"
          style={iconBtnStyle()}
        >
          <User size={18} />
        </button>
      )}

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.32em',
          fontWeight: 800,
          color: 'var(--brand-indigo)',
          textAlign: 'center',
        }}
      >
        {title.toUpperCase()}
      </div>

      <button
        type="button"
        onClick={() =>
          router.push(pathname.startsWith('/player') ? '/player/notifications' : '/parent/notifications')
        }
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{ ...iconBtnStyle(), position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 8,
              background: 'var(--brand-yellow)',
              color: 'var(--brand-indigo)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--brand-sand)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}

function iconBtnStyle(): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--brand-indigo)',
    cursor: 'pointer',
    fontSize: 22,
    fontFamily: 'var(--font-display)',
  }
}
