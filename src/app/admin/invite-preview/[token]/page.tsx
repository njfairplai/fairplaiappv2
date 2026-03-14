'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { Mail, Copy, ExternalLink, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface InvitePlayer {
  firstName: string
  lastName: string
  guardianEmail: string
  inviteToken: string
  position?: string[]
  jerseyNumber?: number
}

function findPlayerByToken(token: string): InvitePlayer | null {
  try {
    const imported = JSON.parse(localStorage.getItem('fairplai_imported_players') || '[]')
    const match = imported.find((p: InvitePlayer) => p.inviteToken === token)
    if (match) return match
  } catch { /* ignore */ }
  return null
}

export default function InvitePreviewPage() {
  const params = useParams()
  const token = params.token as string
  const [player, setPlayer] = useState<InvitePlayer | null>(null)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = findPlayerByToken(token)
    setPlayer(p)
  }, [token])

  if (!mounted) return null

  const onboardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/onboard/${token}`
    : `/onboard/${token}`

  function handleCopy() {
    navigator.clipboard.writeText(onboardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!player) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Mail size={48} color={COLORS.muted} style={{ marginBottom: 16 }} />
        <h2 style={{ color: COLORS.navy, fontSize: 18, marginBottom: 8 }}>Invite not found</h2>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>
          No player found with this invite token. The invite may have been removed.
        </p>
        <Link href="/admin/dashboard" style={{ color: COLORS.primary, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          ← Back to Command Centre
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/dashboard" style={{ color: COLORS.muted, display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Invite Email Preview</h1>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
              This is what {player.guardianEmail} will receive
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
          {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy onboarding link</>}
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
            <span style={{ color: COLORS.navy }}>{player.guardianEmail}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: COLORS.muted, width: 50 }}>Subject:</span>
            <span style={{ color: COLORS.navy, fontWeight: 600 }}>You&apos;re invited to join MAK Academy on FairplAI</span>
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
            <p style={{ margin: '0 0 16px' }}>Hello,</p>
            <p style={{ margin: '0 0 16px' }}>
              <strong>{player.firstName} {player.lastName}</strong> has been registered with{' '}
              <strong>MAK Academy</strong> and you&apos;ve been listed as their guardian.
            </p>
            <p style={{ margin: '0 0 24px' }}>
              Please complete the onboarding process to set up your account, provide player details, and give the required consents. It only takes a few minutes.
            </p>
          </div>

          {/* Player card */}
          <div style={{
            padding: 16, borderRadius: RADIUS.card,
            background: COLORS.lightBg, border: `1px solid ${COLORS.border}`,
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `${COLORS.primary}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: COLORS.primary,
              }}>
                {player.firstName[0]}{player.lastName[0]}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>
                  {player.firstName} {player.lastName}
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>
                  {player.position?.[0] ? `Position: ${player.position[0]}` : 'Position: Not assigned'}
                  {player.jerseyNumber ? ` · #${player.jerseyNumber}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link
              href={`/onboard/${token}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: RADIUS.input,
                background: COLORS.primary, color: '#fff',
                fontSize: 15, fontWeight: 700, textDecoration: 'none',
                boxShadow: `0 4px 12px ${COLORS.primary}40`,
              }}
            >
              Complete Onboarding <ExternalLink size={16} />
            </Link>
          </div>

          {/* Footer text */}
          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
            <p style={{ margin: '0 0 8px' }}>
              If you did not expect this email, you can safely ignore it.
            </p>
            <p style={{ margin: '0 0 8px' }}>
              This link will expire in 7 days. If you need a new one, please contact the academy.
            </p>
            <p style={{ margin: 0, color: '#999' }}>
              FairplAI · Youth Football Analytics · fairplai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
