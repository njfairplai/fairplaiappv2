'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

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
        background: isOn ? '#4A4AFF' : '#E8EAED',
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
    <div style={{ padding: 16, background: '#F5F6FC', minHeight: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div style={{ fontWeight: 700, fontSize: 24, color: '#1B1650', marginBottom: 20 }}>Settings</div>

      {/* Profile Card */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#4A4AFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            MS
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1B1650' }}>Marcus Silva</div>
            <div style={{ fontSize: 13, color: '#6E7180' }}>coach@makacademy.com</div>
            <div style={{ fontSize: 12, color: '#4A4AFF', marginTop: 2 }}>MAK U12 Red &middot; MAK U14 Blue</div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1B1650', marginBottom: 12 }}>Notifications</div>

        {toggleLabels.map(({ key, label }) => (
          <div key={key} style={{
            background: '#fff',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 14, color: '#1B1650' }}>{label}</div>
            {renderToggle(toggles[key], () => handleToggle(key))}
          </div>
        ))}
      </div>

      {/* Account Section */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1B1650', marginBottom: 12 }}>Account</div>

        <div style={{
          background: '#fff',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: 14, color: '#1B1650' }}>Change Password</div>
          <ChevronRight size={18} color="#9DA2B3" />
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: 14, color: '#E74C3C' }}>Sign Out</div>
          <ChevronRight size={18} color="#9DA2B3" />
        </div>
      </div>

      {/* App Version */}
      <div style={{ textAlign: 'center', color: '#9DA2B3', fontSize: 12, marginTop: 24 }}>
        FairPlai v1.0.0 &middot; Coach Portal
      </div>
    </div>
  )
}
