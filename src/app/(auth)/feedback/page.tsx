'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { COLORS } from '@/lib/constants'

const ROLE_OPTIONS = [
  { value: '', label: 'Select your role...' },
  { value: 'academy_owner', label: 'Academy Owner' },
  { value: 'head_coach', label: 'Head Coach' },
  { value: 'facility_operator', label: 'Facility Operator' },
  { value: 'technical_director', label: 'Technical Director' },
  { value: 'other', label: 'Other' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 10,
  border: `1px solid ${COLORS.border}`,
  background: '#F5F6FC',
  color: COLORS.navy,
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

export default function FeedbackGatewayPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [facilityName, setFacilityName] = useState('')

  const allFilled = name.trim() && role && facilityName.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled) return

    const identity = {
      name: name.trim(),
      role,
      facilityName: facilityName.trim(),
      enteredAt: new Date().toISOString(),
    }

    localStorage.setItem('fairplai_feedback_identity', JSON.stringify(identity))
    localStorage.setItem('fairplai_feedback_mode', 'true')
    localStorage.removeItem('fairplai_feedback_dismissed')
    router.push('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.darkBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Image
          src="/logo-white.png"
          alt="FairplAI"
          width={180}
          height={54}
          style={{ height: 54, width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 12px',
          textAlign: 'center',
        }}
      >
        Shaping the Future of Player Development
      </h1>

      {/* Intro paragraph */}
      <p
        style={{
          fontSize: 15,
          color: '#9DA2B3',
          margin: '0 0 32px',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: 480,
        }}
      >
        You&apos;re getting an early look at Fairplai because we value your perspective. This is a
        working prototype &mdash; some features are fully functional, others are still in
        development. Explore the app, try things out, and share your honest feedback as you go. A
        feedback prompt will appear on each key screen.
      </p>

      {/* White Card */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: COLORS.navy,
            margin: '0 0 4px',
          }}
        >
          Tell us about yourself
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 24px' }}>
          So we can tie your feedback to a person
        </p>

        {/* Name */}
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 6 }}>
            Your Name
          </span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ahmed Al-Farsi"
            style={inputStyle}
          />
        </label>

        {/* Role */}
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 6 }}>
            Your Role
          </span>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{
              ...inputStyle,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236E7180' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              paddingRight: 40,
              color: role ? COLORS.navy : COLORS.muted,
            }}
          >
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} disabled={!opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Facility/Academy Name */}
        <label style={{ display: 'block', marginBottom: 28 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: 'block', marginBottom: 6 }}>
            Facility / Academy Name
          </span>
          <input
            type="text"
            value={facilityName}
            onChange={e => setFacilityName(e.target.value)}
            placeholder="e.g. MAK Academy"
            style={inputStyle}
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!allFilled}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 8,
            background: COLORS.primary,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: allFilled ? 'pointer' : 'default',
            opacity: allFilled ? 1 : 0.4,
            pointerEvents: allFilled ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Start Exploring
        </button>
      </form>
    </div>
  )
}
