'use client'

import React from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { players, coaches, rosters, sessions } from '@/lib/mockData'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const ACADEMY_ID = 'academy_001'
const MAX_ITEMS = 5

function getEntities(entityType: string): Array<{ id: string; label: string; subtitle?: string; badge?: string; badgeColor?: string }> {
  switch (entityType) {
    case 'players': {
      const mockPlayers = players
        .filter(p => p.academyId === ACADEMY_ID)
        .map(p => ({
          id: p.id,
          label: `${p.firstName} ${p.lastName}`,
          subtitle: `#${p.jerseyNumber} · ${p.position.join(', ')}`,
          badge: p.inviteStatus === 'pending' ? 'Pending' : p.inviteStatus === 'sent' ? 'Invited' : undefined,
          badgeColor: p.inviteStatus === 'pending' ? COLORS.warning : p.inviteStatus === 'sent' ? COLORS.primary : undefined,
        }))
      // Also include localStorage imported players
      try {
        const imported = JSON.parse(localStorage.getItem('fairplai_imported_players') || '[]')
        for (const p of imported) {
          mockPlayers.push({
            id: p.id,
            label: `${p.firstName} ${p.lastName}`,
            subtitle: p.guardianEmail || (p.position?.length ? p.position.join(', ') : ''),
            badge: 'Pending',
            badgeColor: COLORS.warning,
          })
        }
      } catch { /* ignore */ }
      return mockPlayers
    }
    case 'coaches':
      return coaches
        .filter(c => c.academyId === ACADEMY_ID)
        .map(c => ({ id: c.id, label: c.name, subtitle: c.email }))
    case 'rosters':
      return rosters
        .filter(r => r.academyId === ACADEMY_ID)
        .map(r => ({ id: r.id, label: r.name, subtitle: `${r.ageGroup} · ${r.type}` }))
    case 'sessions':
      return sessions
        .filter(s => s.academyId === ACADEMY_ID)
        .slice(0, 10)
        .map(s => ({ id: s.id, label: `${s.date} — ${s.type}`, subtitle: `${s.startTime}–${s.endTime} · ${s.status}` }))
    default:
      return []
  }
}

const ENTITY_DISPLAY_NAMES: Record<string, string> = {
  players: 'Players',
  coaches: 'Coaches',
  rosters: 'Squads',
  sessions: 'Sessions',
}

const ENTITY_ROUTES: Record<string, string> = {
  players: '/admin/players',
  coaches: '/admin/coaches',
  rosters: '/admin/rosters',
  sessions: '/admin/sessions',
}

export default function EntityListCard({ entityType }: { entityType: string }) {
  const router = useRouter()
  const entities = getEntities(entityType)
  const shown = entities.slice(0, MAX_ITEMS)
  const remaining = entities.length - MAX_ITEMS

  return (
    <div style={{
      background: '#fff', borderRadius: RADIUS.card, overflow: 'hidden',
      boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>
          {ENTITY_DISPLAY_NAMES[entityType] || entityType}
        </span>
        <span style={{ fontSize: 12, color: COLORS.muted, marginLeft: 8 }}>({entities.length})</span>
      </div>

      {shown.map((item, i) => (
        <div key={item.id} style={{
          padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: i < shown.length - 1 ? `1px solid ${COLORS.border}` : 'none',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{item.label}</div>
            {item.subtitle && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 1 }}>{item.subtitle}</div>}
          </div>
          {item.badge && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: `${item.badgeColor}18`, color: item.badgeColor,
            }}>
              {item.badge}
            </span>
          )}
        </div>
      ))}

      {remaining > 0 && (
        <button
          onClick={() => router.push(ENTITY_ROUTES[entityType] || '/admin/dashboard')}
          style={{
            width: '100%', padding: '10px 16px', background: COLORS.lightBg,
            border: 'none', borderTop: `1px solid ${COLORS.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: 'pointer',
          }}
        >
          View all {entities.length} {(ENTITY_DISPLAY_NAMES[entityType] || entityType).toLowerCase()} <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}
