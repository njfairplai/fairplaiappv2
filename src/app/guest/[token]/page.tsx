'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { COLORS, RADIUS } from '@/lib/constants'
import { sessions, pitches } from '@/lib/mockData'
import Button from '@/components/ui/Button'

function getSessionFromToken(token: string) {
  const match = token.match(/^demo-(.+)$/)
  if (!match) return null
  return sessions.find(s => s.id === match[1]) || null
}

function formatBookingDetails(session: { date: string; pitchId: string; startTime: string; endTime: string }) {
  const d = new Date(session.date + 'T00:00:00')
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const pitch = pitches.find(p => p.id === session.pitchId)
  const pitchLabel = pitch ? pitch.name.split(' — ')[0] : 'Pitch'
  const [sh, sm] = session.startTime.split(':').map(Number)
  const [eh, em] = session.endTime.split(':').map(Number)
  const durationMin = (eh * 60 + em) - (sh * 60 + sm)
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]} · ${pitchLabel} · ${durationMin} min`
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: RADIUS.input,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontSize: 15,
  color: '#fff',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
}

export default function GuestFootagePage() {
  const params = useParams()
  const token = params.token as string
  const [verified, setVerified] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const session = getSessionFromToken(token)
  const storageKey = `fairplai_guest_verified_${token}`

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) setVerified(true)
    }
  }, [storageKey])

  function handleVerify() {
    if (!inputValue.trim()) return
    sessionStorage.setItem(storageKey, 'true')
    setVerified(true)
  }

  // Invalid / expired token
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.darkBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain', marginBottom: 32 }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px', textAlign: 'center' }}>Link expired or invalid</h2>
        <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0, textAlign: 'center' }}>This footage link is no longer available.</p>
      </div>
    )
  }

  // Verification gate
  if (!verified) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.darkBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Image src="/logo-white.png" alt="FairplAI" width={140} height={42} style={{ height: 42, width: 'auto', objectFit: 'contain', marginBottom: 40 }} />

          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `${COLORS.primary}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <Play size={24} color={COLORS.primary} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            Your match footage is ready
          </h1>
          <p style={{ fontSize: 14, color: '#9DA2B3', textAlign: 'center', margin: '0 0 28px' }}>
            Enter your name or phone number to continue
          </p>

          <input
            style={inputStyle}
            placeholder="Your name or phone number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify() }}
          />

          <div style={{ width: '100%', marginTop: 16 }}>
            <Button
              fullWidth
              disabled={!inputValue.trim()}
              onClick={handleVerify}
            >
              <Play size={16} />
              Watch Now
            </Button>
          </div>

          <p style={{ fontSize: 12, color: '#6E7180', textAlign: 'center', marginTop: 24 }}>
            No account required
          </p>
        </div>
      </div>
    )
  }

  // Footage view
  const bookingDetails = formatBookingDetails(session)

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.darkBg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Image src="/logo-white.png" alt="FairplAI" width={100} height={30} style={{ height: 30, width: 'auto', objectFit: 'contain' }} />
        <p style={{ fontSize: 14, color: '#9DA2B3', margin: 0 }}>{bookingDetails}</p>
      </div>

      {/* Video Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        padding: 24,
        flex: 1,
      }}>
        {/* Highlights */}
        <div style={{ flex: '1 1 480px', minWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${COLORS.primary}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={14} color={COLORS.primary} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Highlights</h3>
          </div>
          <video
            controls
            playsInline
            style={{
              width: '100%',
              borderRadius: RADIUS.card,
              background: '#000',
              aspectRatio: '16/9',
              display: 'block',
            }}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          />
          <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 10, lineHeight: 1.5 }}>
            Your best moments from the session, auto-generated by FairplAI
          </p>
        </div>

        {/* Full Footage */}
        <div style={{ flex: '1 1 480px', minWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={14} color="#9DA2B3" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Full Footage</h3>
          </div>
          <video
            controls
            playsInline
            style={{
              width: '100%',
              borderRadius: RADIUS.card,
              background: '#000',
              aspectRatio: '16/9',
              display: 'block',
            }}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
          />
          <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 10, lineHeight: 1.5 }}>
            Full recording · {(() => {
              const [sh, sm] = session.startTime.split(':').map(Number)
              const [eh, em] = session.endTime.split(':').map(Number)
              return (eh * 60 + em) - (sh * 60 + sm)
            })()} min
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: '#6E7180', margin: 0 }}>
          Footage available for 7 days · Powered by FairplAI
        </p>
      </div>
    </div>
  )
}
