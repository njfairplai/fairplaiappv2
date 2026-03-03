'use client'

import Link from 'next/link'
import { COLORS } from '@/lib/constants'

export default function TermsPage() {
  const headingStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.navy,
    margin: '32px 0 12px',
  }

  const paragraphStyle: React.CSSProperties = {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.7,
    margin: '0 0 16px',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 720 }}>
        {/* Back link */}
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            fontSize: 14,
            color: COLORS.primary,
            textDecoration: 'none',
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          &larr; Back
        </Link>

        {/* Title */}
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.navy,
            margin: '0 0 8px',
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            fontSize: 14,
            color: COLORS.muted,
            margin: '0 0 32px',
          }}
        >
          Version 1.0 — March 2026
        </p>

        {/* Section 1 */}
        <h2 style={headingStyle}>1. Acceptance of Terms</h2>
        <p style={paragraphStyle}>
          By accessing or using the FairPlai platform, you agree to be bound by these Terms of
          Service and all applicable laws and regulations. If you do not agree with any part of
          these terms, you may not use our service. These terms apply to all visitors, users, and
          others who access or use the platform.
        </p>

        {/* Section 2 */}
        <h2 style={headingStyle}>2. Use of Service</h2>
        <p style={paragraphStyle}>
          FairPlai provides AI-powered sports performance analytics for youth athletes, coaches,
          academies, and parents. You agree to use the service only for its intended purpose and in
          compliance with all applicable local, national, and international laws. You are responsible
          for maintaining the confidentiality of your account credentials and for all activities
          that occur under your account.
        </p>

        {/* Section 3 */}
        <h2 style={headingStyle}>3. Data and Privacy</h2>
        <p style={paragraphStyle}>
          Your use of FairPlai is also governed by our Privacy Policy, which describes how we
          collect, use, and protect your personal data. By using the platform, you consent to the
          collection and processing of data as described in the Privacy Policy. We are committed to
          protecting the privacy of minors and comply with applicable child data protection
          regulations.
        </p>

        {/* Section 4 */}
        <h2 style={headingStyle}>4. Intellectual Property</h2>
        <p style={paragraphStyle}>
          All content, features, and functionality of the FairPlai platform, including but not
          limited to text, graphics, logos, icons, algorithms, and software, are the exclusive
          property of FairPlai and AHOY. You may not reproduce, distribute, modify, or create
          derivative works from any content on the platform without express written permission.
        </p>

        {/* Section 5 */}
        <h2 style={headingStyle}>5. Limitation of Liability</h2>
        <p style={paragraphStyle}>
          FairPlai and its affiliates shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use of or inability to use the
          service. The platform is provided on an &quot;as is&quot; and &quot;as available&quot;
          basis without warranties of any kind. In no event shall our total liability exceed the
          amount paid by you, if any, for accessing the service during the twelve months preceding
          the claim.
        </p>

        {/* Footer */}
        <p
          style={{
            fontSize: 13,
            color: COLORS.muted,
            textAlign: 'center',
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          &copy; 2026 FairPlai / AHOY. All rights reserved.
        </p>
      </div>
    </div>
  )
}
