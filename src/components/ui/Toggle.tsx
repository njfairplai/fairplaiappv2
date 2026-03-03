'use client'

import { COLORS } from '@/lib/constants'

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
}

export default function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 100,
        background: value ? COLORS.primary : '#D1D5DB',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.22s ease',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: value ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
          transition: 'left 0.22s ease',
          display: 'block',
        }}
      />
    </button>
  )
}
