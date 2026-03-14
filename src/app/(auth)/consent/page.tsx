'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { COLORS } from '@/lib/constants'

interface CheckboxItemProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
  note?: string
}

function CheckboxItem({ checked, onChange, children, note }: CheckboxItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 20,
        cursor: 'pointer',
      }}
      onClick={() => onChange(!checked)}
    >
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          borderRadius: 6,
          border: checked ? 'none' : `2px solid ${COLORS.border}`,
          background: checked ? COLORS.primary : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          marginTop: 1,
        }}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7l3 3 5-5"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14, color: COLORS.navy, lineHeight: 1.5 }}>{children}</div>
        {note && (
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, lineHeight: 1.4 }}>
            {note}
          </div>
        )}
      </div>
    </div>
  )
}

const CURRENT_POLICY_VERSION = '2.0'

export default function ConsentPage() {
  const router = useRouter()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [dataConsent, setDataConsent] = useState(false)
  const [parentalConsent, setParentalConsent] = useState(false)
  const [isReConsent, setIsReConsent] = useState(false)

  useState(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('policy_version')
      if (storedVersion && storedVersion < CURRENT_POLICY_VERSION) {
        setIsReConsent(true)
      }
    }
  })

  const allChecked = termsAccepted && privacyAccepted && dataConsent && parentalConsent

  function handleContinue() {
    if (!allChecked) return
    localStorage.setItem('fairplai_consented', 'true')
    localStorage.setItem('consent_timestamp', new Date().toISOString())
    localStorage.setItem('policy_version', CURRENT_POLICY_VERSION)
    // Append to consent records
    const existing = localStorage.getItem('fairplai_consent_records')
    const records = existing ? JSON.parse(existing) : []
    records.push({
      policyVersion: CURRENT_POLICY_VERSION,
      acceptedAt: new Date().toISOString(),
      parentalConsent: true,
      reConsent: isReConsent,
    })
    localStorage.setItem('fairplai_consent_records', JSON.stringify(records))
    const role = localStorage.getItem('fairplai_role')
    const ROLE_PATHS: Record<string, string> = { facility_admin: '/facility/dashboard', academy_admin: '/admin/dashboard', coach: '/coach/home', parent: '/parent/home' }
    router.push(role ? (ROLE_PATHS[role] || '/') : '/')
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

      {/* Heading */}
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 8px',
          textAlign: 'center',
        }}
      >
        Before you continue
      </h1>
      <p
        style={{
          fontSize: 15,
          color: '#9DA2B3',
          margin: '0 0 32px',
          textAlign: 'center',
        }}
      >
        Please review and accept the following
      </p>

      {/* Re-consent banner */}
      {isReConsent && (
        <div style={{ width: '100%', maxWidth: 440, background: `${COLORS.warning}20`, border: `1px solid ${COLORS.warning}40`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, boxSizing: 'border-box', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#92400E', margin: 0, fontWeight: 600 }}>Our policies have been updated. Please review and re-accept to continue.</p>
        </div>
      )}

      {/* White Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxSizing: 'border-box',
        }}
      >
        {/* Checkbox 1 — Terms */}
        <CheckboxItem checked={termsAccepted} onChange={setTermsAccepted}>
          I have read and agree to the{' '}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
          >
            Terms of Service
          </a>
        </CheckboxItem>

        {/* Checkbox 2 — Privacy */}
        <CheckboxItem checked={privacyAccepted} onChange={setPrivacyAccepted}>
          I have read and agree to the{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
          >
            Privacy Policy
          </a>
        </CheckboxItem>

        {/* Checkbox 3 — Data Consent */}
        <CheckboxItem
          checked={dataConsent}
          onChange={setDataConsent}
          note="Required as your child is under 18"
        >
          I consent to FairPlai processing my child&apos;s performance data and video footage for
          analytical purposes in accordance with UAE PDPL
        </CheckboxItem>

        {/* Checkbox 4 — Parental Consent */}
        <CheckboxItem
          checked={parentalConsent}
          onChange={setParentalConsent}
          note="Required for all participants under 18"
        >
          As a parent or guardian, I give consent for my child to participate in FairPlai&apos;s
          video recording and performance analysis program
        </CheckboxItem>

        {/* Policy version */}
        <p
          style={{
            fontSize: 12,
            color: '#9DA2B3',
            textAlign: 'center',
            margin: '24px 0 24px',
          }}
        >
          Policy version {CURRENT_POLICY_VERSION} &middot; March 2026
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!allChecked}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 8,
            background: COLORS.primary,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: allChecked ? 'pointer' : 'default',
            opacity: allChecked ? 1 : 0.4,
            pointerEvents: allChecked ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
