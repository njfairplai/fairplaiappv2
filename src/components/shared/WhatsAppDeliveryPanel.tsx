'use client'

import { useState } from 'react'
import { X, MessageCircle, Check, Loader2, Mail } from 'lucide-react'
import { COLORS } from '@/lib/constants'

interface WhatsAppDeliveryPanelProps {
  open: boolean
  onClose: () => void
  session: { id: string; rosterId: string; opponent?: string; date: string; type: string } | null
}

const mockParents = [
  { id: 'p1', name: 'Tariq Makkawi', phone: '+971 50 123 4567', checked: true },
  { id: 'p2', name: 'Sarah Al-Rashid', phone: '+971 55 987 6543', checked: true },
  { id: 'p3', name: 'Omar Hassan', phone: '+971 52 456 7890', checked: true },
]

export default function WhatsAppDeliveryPanel({ open, onClose, session }: WhatsAppDeliveryPanelProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [parents, setParents] = useState(mockParents)

  if (!open || !session) return null

  function handleSend() {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      const deliveries = JSON.parse(localStorage.getItem('fairplai_whatsapp_deliveries') || '{}')
      deliveries[session!.id] = { status: 'sent', sentAt: new Date().toISOString(), count: parents.filter(p => p.checked).length }
      localStorage.setItem('fairplai_whatsapp_deliveries', JSON.stringify(deliveries))
    }, 1500)
  }

  function handleClose() {
    setSending(false)
    setSent(false)
    setParents(mockParents)
    onClose()
  }

  return (
    <>
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff', zIndex: 200, boxShadow: '0 8px 32px rgba(27,22,80,0.25)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Send Match Summary</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={COLORS.muted} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {sent ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#25D36620', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} color="#25D366" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: '0 0 8px' }}>Messages Sent!</h3>
              <p style={{ fontSize: 14, color: COLORS.muted }}>{parents.filter(p => p.checked).length} parents notified via WhatsApp</p>
            </div>
          ) : (
            <>
              {/* WhatsApp header */}
              <div style={{ background: '#25D366', borderRadius: 10, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageCircle size={18} color="#fff" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>WhatsApp Message Preview</span>
              </div>

              {/* Message bubble */}
              <div style={{ background: '#DCF8C6', borderRadius: '12px 12px 0 12px', padding: 16, marginBottom: 20, fontSize: 14, color: '#111', lineHeight: 1.5 }}>
                <strong>Match Analysis Ready!</strong> Your child performed great in today&apos;s session{session.opponent ? ` vs ${session.opponent}` : ''}. Composite score: 81. View highlights and full stats: fairpl.ai/match/demo
              </div>

              {/* Recipients */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>Recipients</p>
                {parents.map((p) => (
                  <div key={p.id} onClick={() => setParents(prev => prev.map(pp => pp.id === p.id ? { ...pp, checked: !pp.checked } : pp))} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: p.checked ? 'none' : `2px solid ${COLORS.border}`, background: p.checked ? COLORS.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.checked && <Check size={12} color="#fff" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.navy, margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{p.phone}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send button */}
              <button onClick={handleSend} disabled={sending || parents.filter(p => p.checked).length === 0} style={{ width: '100%', height: 48, borderRadius: 10, background: '#25D366', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sending ? 0.7 : 1 }}>
                {sending ? <><Loader2 size={18} className="spin" /> Sending...</> : <><MessageCircle size={18} /> Send Now</>}
              </button>

              {/* Email fallback */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: '10px 12px', background: '#F5F6FC', borderRadius: 8 }}>
                <Mail size={14} color={COLORS.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontStyle: 'italic' }}>If WhatsApp delivery fails, parents will receive an email notification instead.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
