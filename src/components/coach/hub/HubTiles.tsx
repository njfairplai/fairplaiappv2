'use client'

import { useRouter } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'

/* Lower tile rail — the "I just want to scroll" escape hatch for
 * coaches who don't want to type. Four small destination cards link
 * to the rest of the coach surfaces. Each tile carries one display-
 * font primary (e.g. "SAT 28 FEB") + a mono eyebrow + a mono label
 * line at the bottom. */

interface HubTileProps {
  eyebrow: string
  primary: string
  primarySub?: string
  label: string
  accent?: string
  onClick?: () => void
}

function HubTile({
  eyebrow,
  primary,
  primarySub,
  label,
  accent = BRAND.indigo,
  onClick,
}: HubTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(11,8,40,0.12)'
        e.currentTarget.style.borderColor = 'rgba(27,21,80,0.22)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(11,8,40,0.04)'
        e.currentTarget.style.borderColor = BRAND.line
      }}
      style={{
        flex: 1,
        minWidth: 180,
        height: 124,
        background: BRAND.paper,
        border: `1px solid ${BRAND.line}`,
        borderRadius: 6,
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        boxShadow: '0 1px 3px rgba(11,8,40,0.04)',
      }}
    >
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9.5,
          letterSpacing: '0.22em',
          color: BRAND.indigoMute,
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </div>
      <div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 36,
            lineHeight: 0.94,
            letterSpacing: '-0.02em',
            color: accent,
          }}
        >
          {primary}
          {primarySub && (
            <span
              style={{
                fontSize: 14,
                color: BRAND.indigoMute,
                marginLeft: 6,
                letterSpacing: 0,
              }}
            >
              {primarySub}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          color: BRAND.indigo,
          fontWeight: 700,
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
        <span style={{ flexShrink: 0, marginLeft: 6 }}>→</span>
      </div>
    </button>
  )
}

export function HubTiles() {
  const router = useRouter()
  const isMobile = useIsMobile()
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 760,
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 10,
      }}
    >
      <HubTile
        eyebrow="NEXT SESSION"
        primary="SAT"
        primarySub="28 FEB"
        label="VS AL WASL · PREP"
        accent={BRAND.coral}
        onClick={() => router.push('/coach/web/match-center?session=feb28')}
      />
      <HubTile
        eyebrow="LATEST MATCH"
        primary="3-1"
        primarySub="W"
        label="VS AL WASL · 24 FEB"
        onClick={() => router.push('/coach/web/match-center?session=feb24')}
      />
      <HubTile
        eyebrow="PLAYERS"
        primary="16"
        primarySub="ROSTER"
        label="LIONS U13 · SPRING"
        onClick={() => router.push('/coach/web/squad')}
      />
      <HubTile
        eyebrow="HIGHLIGHTS"
        primary="42"
        primarySub="CLIPS"
        label="SPRING SEASON"
        accent={BRAND.indigo}
        onClick={() => router.push('/coach/web/highlights')}
      />
    </div>
  )
}
