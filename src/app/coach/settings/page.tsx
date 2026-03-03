'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

const defaultToggles = {
  matchAnalysis: true,
  sessionFlagged: true,
  coachFlaggedClip: true,
  weeklySummary: true,
  lowMinutes: true,
}

export default function SettingsPage() {
  const [toggles, setToggles] = useState(defaultToggles)

  const handleToggle = (key: keyof typeof defaultToggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleLabels: { key: keyof typeof defaultToggles; label: string }[] = [
    { key: 'matchAnalysis', label: 'Match analysis complete' },
    { key: 'sessionFlagged', label: 'Session flagged for review' },
    { key: 'coachFlaggedClip', label: 'Coach flagged clip \u2014 player confirmation' },
    { key: 'weeklySummary', label: 'Weekly performance summary' },
    { key: 'lowMinutes', label: 'Low analysis minutes' },
  ]

  const renderToggle = (isOn: boolean, onToggle: () => void) => (
    <div
      onClick={onToggle}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        background: isOn ? '#4A4AFF' : '#D1D5DB',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        position: 'absolute',
        top: 2,
        left: isOn ? 24 : 2,
        transition: 'left 0.2s',
      }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC' }}>
      {/* Header Section */}
      <div style={{
        background: '#0A0E1A',
        padding: '48px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* FairplAI White Logo */}
        <Image
          src="/logo-white.png"
          alt="FairplAI"
          width={80}
          height={28}
          style={{ objectFit: 'contain' }}
        />

        {/* Coach Avatar */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4A4AFF, #6B6BFF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          marginTop: 16,
          flexShrink: 0,
        }}>
          MS
        </div>

        {/* Coach Name */}
        <div style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          marginTop: 12,
          textAlign: 'center',
        }}>
          Marcus Silva
        </div>

        {/* Academy + Rosters */}
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 14,
          textAlign: 'center',
          marginTop: 4,
        }}>
          MAK Academy &middot; U12 Red, U14 Blue
        </div>
      </div>

      {/* Settings Groups */}
      <div style={{ padding: 16 }}>

        {/* Notification Preferences Group */}
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#64748B',
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
          padding: '12px 16px 8px',
        }}>
          Notifications
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 16,
        }}>
          {toggleLabels.map(({ key, label }, index) => (
            <div key={key} style={{
              height: 52,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: index < toggleLabels.length - 1 ? '1px solid #F8F9FC' : 'none',
            }}>
              <div style={{ fontSize: 15, color: '#0F172A' }}>{label}</div>
              {renderToggle(toggles[key], () => handleToggle(key))}
            </div>
          ))}
        </div>

        {/* Account Group */}
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#64748B',
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
          padding: '12px 16px 8px',
        }}>
          Account
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 16,
        }}>
          <div style={{
            height: 52,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F8F9FC',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 15, color: '#0F172A' }}>Change Password</div>
            <ChevronRight size={18} color="#9DA2B3" />
          </div>

          <div style={{
            height: 52,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 15, color: '#E74C3C' }}>Sign Out</div>
            <ChevronRight size={18} color="#9DA2B3" />
          </div>
        </div>

        {/* App Version Footer */}
        <div style={{ textAlign: 'center', color: '#9DA2B3', fontSize: 12, marginTop: 24, paddingBottom: 16 }}>
          FairPlai v1.0.0 &middot; Coach Portal
        </div>
      </div>
    </div>
  )
}
