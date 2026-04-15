'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { COLORS, RADIUS } from '@/lib/constants'

/* ━━━ WhatsApp-style colors ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const WA_BG = '#0B141A'
const WA_HEADER = '#1F2C34'
const WA_CHAT_BG = '#0B141A'
const WA_BUBBLE_OUT = '#005C4B'
const WA_BUBBLE_IN = '#1F2C34'
const WA_LINK = '#53BDEB'
const WA_GREEN = '#25D366'
const WA_TEXT = '#E9EDEF'
const WA_META = '#8696A0'
const WA_BG_PATTERN = 'rgba(255,255,255,0.02)'

interface DemoOption {
  id: string
  token: string
  label: string
  sublabel: string
  message: string[]
  time: string
}

const DEMOS: DemoOption[] = [
  {
    id: 'highlight',
    token: 'abc123xyz',
    label: 'Highlight Clip',
    sublabel: 'Coach shares a goal clip',
    message: [
      '🏟️ Kiyan Makkawi — Match Highlight',
      '⚽ Goal vs Al Wasl Academy (58\')',
      '📊 Match Score: 81/100',
      '',
      'Watch the clip 👇',
      '{{link}}',
      '',
      'Powered by FairplAI · Expires 21 Apr',
    ],
    time: '10:30 AM',
  },
  {
    id: 'stats',
    token: 'def456uvw',
    label: 'Performance Stats',
    sublabel: 'Parent shares match stats',
    message: [
      '📊 Kiyan Makkawi — Performance Summary',
      'UAE Youth League vs Al Wasl · 24 Feb 2026',
      'Score: 81/100',
      '',
      'View full stats 👇',
      '{{link}}',
      '',
      'Powered by FairplAI · Expires 21 Apr',
    ],
    time: '2:00 PM',
  },
  {
    id: 'expired',
    token: 'expired999',
    label: 'Expired Link',
    sublabel: 'What happens after 7 days',
    message: [
      '🏟️ Kiyan Makkawi — Match Highlight',
      '⚽ Key Pass vs Desert Eagles (23\')',
      '',
      'Watch the clip 👇',
      '{{link}}',
      '',
      'Powered by FairplAI · Expires 22 Jan',
    ],
    time: 'Jan 15',
  },
]

export default function ShareDemoPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string>('highlight')
  const demo = DEMOS.find(d => d.id === selected)!

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  function handleLinkClick() {
    router.push(`/share/${demo.token}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1020',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top bar */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'rgba(255,255,255,0.06)', border: 'none',
            borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="#9DA2B3" />
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
            WhatsApp Share Demo
          </h1>
          <p style={{ fontSize: 12, color: '#6E7180', margin: 0 }}>
            See how shared links look in WhatsApp
          </p>
        </div>
      </div>

      {/* Variant picker */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '0 20px 16px',
        display: 'flex', gap: 8,
      }}>
        {DEMOS.map(d => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 10,
              background: selected === d.id ? `${COLORS.primary}20` : 'rgba(255,255,255,0.04)',
              border: selected === d.id ? `1.5px solid ${COLORS.primary}` : '1.5px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: selected === d.id ? COLORS.primary : '#9DA2B3', margin: '0 0 2px' }}>
              {d.label}
            </p>
            <p style={{ fontSize: 10, color: '#6E7180', margin: 0 }}>
              {d.sublabel}
            </p>
          </button>
        ))}
      </div>

      {/* WhatsApp phone mockup */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '0 20px 24px',
      }}>
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          {/* WhatsApp header */}
          <div style={{
            background: WA_HEADER,
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <ArrowLeft size={20} color={WA_TEXT} />
            {/* Contact avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: WA_GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>FP</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: WA_TEXT, margin: 0 }}>FairplAI</p>
              <p style={{ fontSize: 12, color: WA_META, margin: 0 }}>online</p>
            </div>
          </div>

          {/* Chat area */}
          <div style={{
            background: WA_CHAT_BG,
            backgroundImage: `radial-gradient(${WA_BG_PATTERN} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            padding: '20px 16px',
            minHeight: 380,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 4,
          }}>
            {/* Date chip */}
            <div style={{
              alignSelf: 'center',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '4px 12px',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 11, color: WA_META }}>
                {demo.id === 'expired' ? '15 January 2026' : 'Today'}
              </span>
            </div>

            {/* Outgoing message bubble (the shared link) */}
            <div style={{
              alignSelf: 'flex-end',
              maxWidth: '85%',
            }}>
              <div style={{
                background: WA_BUBBLE_OUT,
                borderRadius: '10px 10px 2px 10px',
                padding: '8px 10px 6px',
                position: 'relative',
              }}>
                {/* Link preview card */}
                <div
                  onClick={handleLinkClick}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginBottom: 6,
                    cursor: 'pointer',
                  }}
                >
                  {/* Preview image area */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1B1650 0%, #4A4AFF 100%)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <Image src="/logo-white.png" alt="FairplAI" width={80} height={24} style={{ height: 20, width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
                    <div style={{
                      width: 1, height: 24, background: 'rgba(255,255,255,0.2)',
                    }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>
                        {demo.id === 'stats' ? '📊 Performance Summary' : '⚽ Match Highlight'}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Kiyan Makkawi</p>
                    </div>
                  </div>
                  {/* Link preview metadata */}
                  <div style={{ padding: '8px 12px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: WA_TEXT, margin: '0 0 2px' }}>
                      app.fairplai.com
                    </p>
                    <p style={{ fontSize: 11, color: WA_META, margin: 0 }}>
                      {demo.id === 'stats' ? 'UAE Youth League vs Al Wasl · Score: 81/100' : demo.id === 'expired' ? 'Key Pass vs Desert Eagles' : 'Goal vs Al Wasl Academy · Score: 81/100'}
                    </p>
                  </div>
                </div>

                {/* Message text */}
                <div style={{ padding: '0 2px' }}>
                  {demo.message.map((line, i) => {
                    if (line === '') return <div key={i} style={{ height: 6 }} />
                    if (line === '{{link}}') {
                      return (
                        <p
                          key={i}
                          onClick={handleLinkClick}
                          style={{
                            fontSize: 13, color: WA_LINK, margin: '1px 0',
                            textDecoration: 'underline', cursor: 'pointer',
                            lineHeight: 1.4,
                          }}
                        >
                          app.fairplai.com/s/{demo.token.slice(0, 8)}...
                        </p>
                      )
                    }
                    return (
                      <p key={i} style={{
                        fontSize: 13, color: WA_TEXT, margin: '1px 0',
                        lineHeight: 1.4,
                      }}>
                        {line}
                      </p>
                    )
                  })}
                </div>

                {/* Time + double check */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  gap: 4, marginTop: 4,
                }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{demo.time}</span>
                  <CheckCheck size={14} color={WA_LINK} />
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp input bar */}
          <div style={{
            background: WA_HEADER,
            padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              flex: 1, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center',
              padding: '0 16px',
            }}>
              <span style={{ fontSize: 14, color: WA_META }}>Message</span>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: WA_GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '0 20px 12px',
      }}>
        <button
          onClick={handleLinkClick}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: COLORS.primary,
            border: 'none',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.2px',
          }}
        >
          Tap to open shared link →
        </button>
      </div>

      {/* Explanation */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '0 20px 32px',
      }}>
        <p style={{ fontSize: 12, color: '#6E7180', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
          This is what the recipient sees in WhatsApp when a coach, parent, or player shares a highlight or stats.
          Tap the link preview or the button to see the landing page.
        </p>
      </div>
    </div>
  )
}
