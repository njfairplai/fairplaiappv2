'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Theme } from '@/lib/themes'
import { Logo } from '@/components/shared/Logo'

/**
 * Top bar shown on every step of the sequential walkthrough.
 *
 * Anatomy:
 *   [Logo] · PALETTE 2 OF N  [swatches]   [← Prev]  [Next →]
 *
 * Sticky to top so it's always available; uses the active palette's
 * own colors (so it looks at home inside whatever theme is showing).
 */
export function StepBar({
  step,
  total,
  theme,
  onNext,
  onPrev,
}: {
  step: number
  total: number
  theme: Theme
  onNext: () => void
  onPrev: () => void
}) {
  const router = useRouter()
  const atStart = step === 1
  const atEnd = step === total

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--brand-sand)',
      borderBottom: '1px solid var(--brand-line)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      {/* Brand mark + progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <Link href="/user-testing" style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
        }}>
          <Logo height={20} />
        </Link>
        <span style={{ width: 1, height: 18, background: 'var(--brand-line)' }} />
        <span style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
        }}>
          PALETTE {step} OF {total}
        </span>
      </div>

      {/* Theme name + swatches */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 18,
          color: 'var(--brand-indigo)',
          letterSpacing: '-0.01em',
        }}>
          {theme.name}
        </span>
        <span style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 10,
          letterSpacing: '0.16em',
          color: 'var(--brand-indigo-mute)',
        }}>
          {theme.tagline.toUpperCase()}
        </span>
        <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
          {theme.swatches.map((c, i) => (
            <span key={i} style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: c,
              border: '1px solid rgba(0,0,0,0.08)',
            }} />
          ))}
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            width: i + 1 === step ? 18 : 8,
            height: 6,
            borderRadius: 3,
            background: i + 1 === step ? 'var(--brand-yellow)' : 'var(--brand-indigo-soft)',
            transition: 'all 200ms ease',
          }} />
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Prev / Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onPrev}
          disabled={atStart}
          style={{
            background: 'transparent',
            color: atStart ? 'var(--brand-indigo-mute)' : 'var(--brand-indigo)',
            border: '1px solid var(--brand-line)',
            padding: '8px 14px',
            borderRadius: 7,
            fontFamily: 'var(--font-satoshi)',
            fontWeight: 600,
            fontSize: 13,
            cursor: atStart ? 'not-allowed' : 'pointer',
            opacity: atStart ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        {atEnd ? (
          <button
            onClick={() => router.push('/user-testing/vote')}
            style={{
              background: 'var(--brand-yellow)',
              color: 'var(--brand-indigo)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 7,
              fontFamily: 'var(--font-satoshi)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            Done → Vote on palette →
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 7,
              fontFamily: 'var(--font-satoshi)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
            }}
          >
            Next palette →
          </button>
        )}
      </div>
    </div>
  )
}
