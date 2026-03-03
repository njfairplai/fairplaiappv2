'use client'

import Link from 'next/link'
import { COLORS } from '@/lib/constants'

export default function PrivacyPage() {
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
          Privacy Policy
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

        <p style={paragraphStyle}>
          FairPlai processes data in accordance with UAE Federal Decree-Law No. 45 of 2021 on
          Personal Data Protection (PDPL).
        </p>

        {/* Section 1 */}
        <h2 style={headingStyle}>1. Data We Collect</h2>
        <p style={paragraphStyle}>
          We collect personal information that you provide when creating an account, including your
          name, email address, and role within your academy. For youth athletes, we collect
          performance data such as match statistics, training metrics, and video footage submitted
          by coaches or parents. We may also collect device information and usage analytics to
          improve our service.
        </p>

        {/* Section 2 */}
        <h2 style={headingStyle}>2. How We Use Your Data</h2>
        <p style={paragraphStyle}>
          Your data is used to power AI-driven performance analytics, generate development reports,
          and provide actionable insights to coaches, parents, and academy administrators. We use
          aggregated and anonymised data to improve our algorithms and platform features. We do not
          sell your personal data to third parties or use it for advertising purposes.
        </p>

        {/* Section 3 */}
        <h2 style={headingStyle}>3. Data Storage and Security</h2>
        <p style={paragraphStyle}>
          FairPlai is committed to data security and operates in compliance with UAE PDPL and
          on-premises edge processing standards. Video footage and sensitive performance data are
          processed using edge computing infrastructure to minimise data transfer. All data is
          encrypted in transit and at rest, and we employ industry-standard security measures
          including access controls, audit logging, and regular security assessments.
        </p>

        {/* Section 4 */}
        <h2 style={headingStyle}>4. Your Rights</h2>
        <p style={paragraphStyle}>
          Under UAE PDPL, you have the right to access, correct, or delete your personal data at
          any time. You may withdraw consent for data processing by contacting our support team,
          though this may limit your ability to use certain features. Parents and legal guardians
          may exercise these rights on behalf of minors under the age of 18.
        </p>

        {/* Section 5 */}
        <h2 style={headingStyle}>5. Contact Us</h2>
        <p style={paragraphStyle}>
          If you have any questions about this Privacy Policy or wish to exercise your data rights,
          please contact our Data Protection Officer at privacy@fairplai.com. You may also write
          to us at AHOY, Dubai, United Arab Emirates. We aim to respond to all data-related
          requests within 30 days.
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
