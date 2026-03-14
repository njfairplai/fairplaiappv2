'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { Mail, Copy, ExternalLink, CheckCircle, ArrowLeft, Shield, BarChart3, Video, Users } from 'lucide-react'
import Link from 'next/link'

interface InviteCoach {
  id: string
  academyId: string
  name: string
  email: string
  phone: string
  role: string
  rosterIds: string[]
  inviteStatus: 'pending' | 'completed'
  inviteToken: string
}

const ROLE_COLORS: Record<string, string> = {
  head_coach: '#4A4AFF',
  assistant_coach: '#8B5CF6',
  goalkeeper_coach: '#F59E0B',
  fitness_coach: '#10B981',
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function findCoachByToken(token: string): InviteCoach | null {
  try {
    const imported = JSON.parse(localStorage.getItem('fairplai_imported_coaches') || '[]')
    const match = imported.find((c: InviteCoach) => c.inviteToken === token)
    if (match) return match
  } catch { /* ignore */ }
  return null
}

export default function CoachInvitePreviewPage() {
  const params = useParams()
  const token = params.token as string
  const [coach, setCoach] = useState<InviteCoach | null>(null)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const c = findCoachByToken(token)
    setCoach(c)
  }, [token])

  if (!mounted) return null

  const onboardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/onboard/coach/${token}`
    : `/onboard/coach/${token}`

  function handleCopy() {
    navigator.clipboard.writeText(onboardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!coach) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Mail size={48} color={COLORS.muted} style={{ marginBottom: 16 }} />
        <h2 style={{ color: COLORS.navy, fontSize: 18, marginBottom: 8 }}>Coach not found</h2>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>
          No coach found with this invite token. The invite may have been removed.
        </p>
        <Link href="/admin/dashboard" style={{ color: COLORS.primary, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          &larr; Back to Command Centre
        </Link>
      </div>
    )
  }

  const roleColor = ROLE_COLORS[coach.role] || COLORS.primary
  const formattedRole = formatRole(coach.role)
  const initials = coach.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const accessFeatures = [
    { icon: <BarChart3 size={16} color={COLORS.primary} />, label: 'AI-powered match analysis' },
    { icon: <Users size={16} color={COLORS.primary} />, label: 'Player performance tracking' },
    { icon: <Video size={16} color={COLORS.primary} />, label: 'Video review tools' },
    { icon: <Shield size={16} color={COLORS.primary} />, label: 'Squad management' },
  ]

  return (
    <div style={{ padding: '24px 32px', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/dashboard" style={{ color: COLORS.muted, display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Coach Invite Preview</h1>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
              This is how the invitation email will appear to {coach.name}
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: RADIUS.input,
            border: `1px solid ${COLORS.border}`, background: '#fff',
            fontSize: 13, fontWeight: 600, color: copied ? COLORS.success : COLORS.navy,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Onboarding Link</>}
        </button>
      </div>

      {/* Email client frame */}
      <div style={{
        borderRadius: RADIUS.card, border: `1px solid ${COLORS.border}`,
        boxShadow: SHADOWS.card, overflow: 'hidden', background: '#fff',
      }}>
        {/* Email header bar */}
        <div style={{
          padding: '14px 20px', background: COLORS.lightBg,
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: COLORS.muted, width: 50 }}>From:</span>
            <span style={{ color: COLORS.navy }}>FairplAI &lt;noreply@fairplai.com&gt;</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: COLORS.muted, width: 50 }}>To:</span>
            <span style={{ color: COLORS.navy }}>{coach.email}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: COLORS.muted, width: 50 }}>Subject:</span>
            <span style={{ color: COLORS.navy, fontWeight: 600 }}>You&apos;re invited to coach at MAK Academy on FairplAI</span>
          </div>
        </div>

        {/* Email body */}
        <div style={{ padding: '40px 48px', background: '#fff' }}>
          {/* Academy logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.periwinkle})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 800,
            }}>
              M
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: '12px 0 4px' }}>
              MAK Academy
            </h2>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
              Powered by FairplAI
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: COLORS.border, margin: '0 0 32px' }} />

          {/* Email content */}
          <div style={{ fontSize: 15, lineHeight: 1.7, color: '#333' }}>
            <p style={{ margin: '0 0 16px' }}>Hi {coach.name},</p>
            <p style={{ margin: '0 0 16px' }}>
              You&apos;ve been invited to join <strong>MAK Academy</strong> as a{' '}
              <strong>{formattedRole}</strong>. Complete your profile to get started with AI-powered coaching tools.
            </p>
          </div>

          {/* Coach card */}
          <div style={{
            padding: 16, borderRadius: RADIUS.card,
            background: COLORS.lightBg, border: `1px solid ${COLORS.border}`,
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `${roleColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: roleColor,
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>
                  {coach.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: roleColor,
                    background: `${roleColor}15`, padding: '2px 8px',
                    borderRadius: RADIUS.pill,
                  }}>
                    {formattedRole}
                  </span>
                </div>
              </div>
            </div>
            {coach.rosterIds && coach.rosterIds.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, fontWeight: 600 }}>
                  Assigned Squads
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {coach.rosterIds.map((id) => (
                    <span key={id} style={{
                      fontSize: 11, fontWeight: 600, color: COLORS.navy,
                      background: COLORS.cloud, padding: '2px 8px',
                      borderRadius: RADIUS.pill,
                    }}>
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feature list */}
          <div style={{
            padding: 20, borderRadius: RADIUS.card,
            background: `${COLORS.primary}08`, border: `1px solid ${COLORS.primary}20`,
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 12 }}>
              What you&apos;ll get access to:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {accessFeatures.map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {f.icon}
                  <span style={{ fontSize: 14, color: '#333' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA button */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link
              href={`/onboard/coach/${token}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: RADIUS.input,
                background: COLORS.primary, color: '#fff',
                fontSize: 15, fontWeight: 700, textDecoration: 'none',
                boxShadow: `0 4px 12px ${COLORS.primary}40`,
              }}
            >
              Complete Your Profile <ExternalLink size={16} />
            </Link>
          </div>

          {/* Footer text */}
          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
            <p style={{ margin: '0 0 8px' }}>
              This invitation expires in 7 days. If you weren&apos;t expecting this email, you can safely ignore it.
            </p>
            <p style={{ margin: 0, color: '#999' }}>
              FairplAI &middot; Youth Football Analytics &middot; fairplai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
