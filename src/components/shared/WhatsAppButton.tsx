'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phone?: string
  message?: string
  label?: string
}

export default function WhatsAppButton({ phone = '+971501234567', message = 'Hello from FairplAI!', label = 'WhatsApp' }: WhatsAppButtonProps) {
  const url = `https://wa.me/${phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 20,
        background: '#25D366',
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      <MessageCircle size={16} />
      {label}
    </a>
  )
}
