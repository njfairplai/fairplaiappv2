'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Copy, Check, Share2, MessageCircle } from 'lucide-react'
import { COLORS } from '@/lib/constants'

interface PlayerCardShareModalProps {
  open: boolean
  onClose: () => void
  player: { name: string; position: string; jerseyNumber: number; team: string; academy: string; photo?: string }
  compositeScore: number
}

const categories = [
  { label: 'Physical', score: 78, color: '#4A4AFF' },
  { label: 'Positional', score: 71, color: '#27AE60' },
  { label: 'Passing', score: 82, color: '#F39C12' },
  { label: 'Dribbling', score: 75, color: '#E74C3C' },
  { label: 'Control', score: 80, color: '#9B59B6' },
  { label: 'Defending', score: 68, color: '#3498DB' },
]

export default function PlayerCardShareModal({ open, onClose, player, compositeScore }: PlayerCardShareModalProps) {
  const [copied, setCopied] = useState(false)

  const scoreColor = compositeScore >= 75 ? '#27AE60' : compositeScore >= 60 ? '#F39C12' : '#E74C3C'
  const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase()

  function handleCopy() {
    navigator.clipboard.writeText(`https://fairpl.ai/player/demo`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const text = `Check out ${player.name}'s FairplAI Player Card! Composite Score: ${compositeScore} | ${player.position} | ${player.team} | View more: fairpl.ai/player/demo`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `${player.name} — FairplAI`, text: `${player.name} scored ${compositeScore} in their latest match!`, url: 'https://fairpl.ai/player/demo' })
    } else {
      handleCopy()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share Player Card" maxWidth={440}>
      {/* Player Card */}
      <div style={{ background: 'linear-gradient(135deg, #1B1650 0%, #0D1020 100%)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        {/* Avatar + Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4A4AFF, #6B6BFF)', border: '2px solid rgba(74,74,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{player.name}</p>
            <p style={{ fontSize: 13, color: '#9DA2B3', margin: '2px 0 0' }}>{player.position} · #{player.jerseyNumber} · {player.team}</p>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9DA2B3', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Composite Score</p>
          <span style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{compositeScore}</span>
        </div>

        {/* Category bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          {categories.map(c => (
            <div key={c.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#9DA2B3' }}>{c.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{c.score}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
                <div style={{ height: 4, borderRadius: 2, background: c.color, width: `${c.score}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Watermark */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 16, marginBottom: 0 }}>fairpl.ai — Youth Football Analytics</p>
      </div>

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleWhatsApp} style={{ flex: 1, height: 44, borderRadius: 10, background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <MessageCircle size={16} /> WhatsApp
        </button>
        <button onClick={handleCopy} style={{ flex: 1, height: 44, borderRadius: 10, background: copied ? `${COLORS.success}15` : '#F5F6FC', color: copied ? COLORS.success : COLORS.navy, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
        </button>
        <button onClick={handleShare} style={{ flex: 1, height: 44, borderRadius: 10, background: COLORS.primary, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Share2 size={16} /> Share
        </button>
      </div>
    </Modal>
  )
}
