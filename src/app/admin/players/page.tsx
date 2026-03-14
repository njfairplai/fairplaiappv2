'use client'

import { useState, useEffect, useCallback } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { players, rosters, parents } from '@/lib/mockData'
import { Search, X, Shield, User, Heart, GraduationCap, Phone, MapPin, Footprints } from 'lucide-react'
import type { Player } from '@/lib/types'

const COLORS = { primary: '#4A4AFF', navy: '#1B1650', muted: '#6E7180', border: '#E8EAED', error: '#E74C3C', success: '#27AE60', warning: '#F39C12', bg: '#F7F8FA' }
const SHADOWS = { card: '0 2px 12px rgba(0,0,0,0.06)' }

interface OnboardData {
  token: string
  guardian: { fullName: string; phone: string; relationship: string }
  player: { dateOfBirth: string; dominantFoot: string; nationality: string; passportId: string; photo?: string | null }
  additional: { schoolName: string; previousClub: string; kitSize: string; medicalNotes: string; emergencyName: string; emergencyPhone: string }
  consent: { dataProcessing: boolean; mediaRelease: boolean; medicalConsent: boolean }
  completedAt: string
}

interface MergedPlayer extends Player {
  guardianName?: string
  guardianPhone?: string
  guardianRelationship?: string
  nationality?: string
  passportId?: string
  schoolName?: string
  previousClub?: string
  kitSize?: string
  medicalNotes?: string
  emergencyName?: string
  emergencyPhone?: string
  onboardPhoto?: string | null
  onboardComplete?: boolean
}

function footLabel(f: string): string {
  if (f === 'left') return 'Left'
  if (f === 'right') return 'Right'
  if (f === 'both') return 'Both'
  return '—'
}

function positionColor(pos: string): string {
  if (['GK'].includes(pos)) return '#F59E0B'
  if (['CB', 'LB', 'RB', 'CDM'].includes(pos)) return '#3B82F6'
  if (['CM', 'AM', 'LW', 'RW'].includes(pos)) return '#10B981'
  if (['ST', 'CF', 'SS'].includes(pos)) return '#EF4444'
  return COLORS.primary
}

// Enrich mock players with realistic additional data
const MOCK_PLAYER_ENRICHMENT: Record<string, Partial<MergedPlayer>> = {
  player_001: { nationality: 'Saudi Arabian', schoolName: 'Al Noor International', kitSize: 'M', medicalNotes: 'Mild asthma — carries inhaler', emergencyName: 'Tariq Makkawi', emergencyPhone: '+971501234567' },
  player_002: { nationality: 'Egyptian', schoolName: 'International School of Choueifat', previousClub: 'Al Wahda FC Youth', kitSize: 'S', emergencyName: 'Sara Hassan', emergencyPhone: '+971502345678' },
  player_003: { nationality: 'Emirati', schoolName: 'GEMS Wellington', kitSize: 'M', emergencyName: 'Mohamed Al Rashidi', emergencyPhone: '+971503456789' },
  player_004: { nationality: 'Emirati', schoolName: 'Repton School Dubai', previousClub: 'Shabab Al Ahli Academy', kitSize: 'S', medicalNotes: 'Peanut allergy', emergencyName: 'Fatima Khalifa', emergencyPhone: '+971504567890' },
  player_005: { nationality: 'Emirati', schoolName: 'Dubai College', kitSize: 'L', emergencyName: 'Abdullah Al Mazrouei', emergencyPhone: '+971505678901' },
  player_006: { nationality: 'Emirati', schoolName: 'Al Mawakeb School', kitSize: 'S', previousClub: 'Al Nasr SC Youth', emergencyName: 'Nouf Al Nuaimi', emergencyPhone: '+971506789012' },
  player_007: { nationality: 'Emirati', schoolName: 'Kings School Dubai', kitSize: 'M', emergencyName: 'Hamed Al Mansoori', emergencyPhone: '+971507890123' },
  player_008: { nationality: 'Emirati', kitSize: 'M' },
  player_009: { nationality: 'Saudi Arabian', schoolName: 'British International School', previousClub: 'Al Hilal Academy', kitSize: 'L' },
  player_010: { nationality: 'Saudi Arabian', schoolName: 'Riyadh International School', kitSize: 'L' },
  player_011: { nationality: 'Jordanian', schoolName: 'Al Faris International', kitSize: 'M', medicalNotes: 'Wears corrective lenses during play' },
  player_012: { nationality: 'Saudi Arabian', kitSize: 'M' },
  player_013: { nationality: 'Bahraini', schoolName: 'St. Christopher\'s School', kitSize: 'M' },
  player_014: { nationality: 'Saudi Arabian', kitSize: 'L' },
  player_015: { nationality: 'Saudi Arabian', kitSize: 'M', medicalNotes: 'Recovering from ankle sprain — limited contact training' },
  player_016: { nationality: 'Afghan', schoolName: 'Dubai International Academy', kitSize: 'S' },
}

export default function AcademyPlayersPage() {
  const [search, setSearch] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<MergedPlayer | null>(null)
  const [mergedPlayers, setMergedPlayers] = useState<MergedPlayer[]>([])
  const [rosterFilter, setRosterFilter] = useState<string>('all')

  const loadPlayers = useCallback(() => {
    const academyPlayers: MergedPlayer[] = players
      .filter((p) => p.academyId === 'academy_001')
      .map((p) => {
        const parent = parents.find((pr) => pr.playerIds.includes(p.id))
        return {
          ...p,
          guardianName: parent?.name,
          guardianPhone: parent?.phone,
          guardianRelationship: parent?.relationship || (parent ? 'Parent' : undefined),
          ...MOCK_PLAYER_ENRICHMENT[p.id],
        }
      })

    try {
      const imported: Player[] = JSON.parse(localStorage.getItem('fairplai_imported_players') || '[]')
      for (const ip of imported) {
        if (ip.academyId === 'academy_001' && !academyPlayers.find((ap) => ap.id === ip.id)) {
          academyPlayers.push({ ...ip })
        }
      }
    } catch { /* ignore */ }

    try {
      const onboardEntries: OnboardData[] = JSON.parse(localStorage.getItem('fairplai_onboard_data') || '[]')
      for (const entry of onboardEntries) {
        const match = academyPlayers.find((p) => p.inviteToken === entry.token)
        if (match) {
          match.guardianName = entry.guardian.fullName
          match.guardianPhone = entry.guardian.phone
          match.guardianRelationship = entry.guardian.relationship
          match.nationality = entry.player.nationality
          match.passportId = entry.player.passportId
          match.schoolName = entry.additional.schoolName
          match.previousClub = entry.additional.previousClub
          match.kitSize = entry.additional.kitSize
          match.medicalNotes = entry.additional.medicalNotes
          match.emergencyName = entry.additional.emergencyName
          match.emergencyPhone = entry.additional.emergencyPhone
          match.onboardPhoto = entry.player.photo
          match.onboardComplete = true
          if (entry.player.dominantFoot) {
            match.dominantFoot = entry.player.dominantFoot as 'left' | 'right' | 'both'
          }
        }
      }
    } catch { /* ignore */ }

    setMergedPlayers(academyPlayers)
  }, [])

  useEffect(() => { loadPlayers() }, [loadPlayers])

  const academyRosters = rosters.filter((r) => r.academyId === 'academy_001')

  const filtered = mergedPlayers.filter((p) => {
    const matchesSearch = !search || `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
    const roster = academyRosters.find((r) => r.ageGroup === (p.dateOfBirth.startsWith('2014') ? 'U12' : 'U14'))
    const matchesRoster = rosterFilter === 'all' || roster?.id === rosterFilter
    return matchesSearch && matchesRoster
  })

  const getRosterName = (p: MergedPlayer) => {
    const roster = academyRosters.find((r) => r.ageGroup === (p.dateOfBirth.startsWith('2014') ? 'U12' : 'U14'))
    return roster?.name || '—'
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Players</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={16} color={COLORS.muted} style={{ position: 'absolute', left: 14, top: 11 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players..." style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setRosterFilter('all')} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${rosterFilter === 'all' ? COLORS.primary : COLORS.border}`, background: rosterFilter === 'all' ? `${COLORS.primary}10` : '#fff', color: rosterFilter === 'all' ? COLORS.primary : COLORS.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>All</button>
          {academyRosters.map((r) => (
            <button key={r.id} onClick={() => setRosterFilter(r.id)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${rosterFilter === r.id ? COLORS.primary : COLORS.border}`, background: rosterFilter === r.id ? `${COLORS.primary}10` : '#fff', color: rosterFilter === r.id ? COLORS.primary : COLORS.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.name}</button>
          ))}
        </div>
      </div>

      {/* Player count */}
      <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>{filtered.length} player{filtered.length !== 1 ? 's' : ''}</p>

      {/* Player Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map((p) => {
          const rosterName = getRosterName(p)
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              style={{
                background: '#fff',
                borderRadius: 14,
                boxShadow: SHADOWS.card,
                padding: '20px 16px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: `1px solid transparent`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Jersey Number badge */}
              <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 20, fontWeight: 800, color: `${COLORS.primary}20` }}>
                #{p.jerseyNumber}
              </div>

              {/* Avatar */}
              <Avatar firstName={p.firstName} lastName={p.lastName} photo={p.onboardPhoto || p.photo} size={56} />

              {/* Name */}
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0, textAlign: 'center' }}>
                {p.firstName} {p.lastName}
              </p>

              {/* Position pills */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {p.position.map((pos) => {
                  const col = positionColor(pos)
                  return (
                    <span key={pos} style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      background: `${col}14`, border: `1px solid ${col}30`,
                      fontSize: 11, fontWeight: 700, color: col,
                    }}>
                      {pos}
                    </span>
                  )
                })}
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: COLORS.muted }}>
                <span>{rosterName}</span>
                <span style={{ color: COLORS.border }}>·</span>
                <span>{footLabel(p.dominantFoot)}</span>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                <Badge variant={p.status === 'active' ? 'success' : p.status === 'injured' ? 'error' : 'neutral'}>{p.status}</Badge>
                {p.parentIds.length === 0 && !p.onboardComplete && (
                  <Badge variant="warning">No parent</Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Slide-Over Panel */}
      {selectedPlayer && (
        <PlayerDetailPanel
          player={selectedPlayer}
          rosterName={getRosterName(selectedPlayer)}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

    </div>
  )
}

function PlayerDetailPanel({ player: p, rosterName, onClose }: { player: MergedPlayer; rosterName: string; onClose: () => void }) {
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
  }
  const valueStyle: React.CSSProperties = {
    fontSize: 14, color: COLORS.navy, fontWeight: 500,
  }

  const hasGuardian = !!(p.guardianName || p.guardianPhone)
  const hasAdditional = !!(p.schoolName || p.previousClub || p.kitSize || p.nationality || p.passportId)
  const hasMedical = !!(p.medicalNotes || p.emergencyName || p.emergencyPhone)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          zIndex: 100, animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '90vw',
        background: '#fff', zIndex: 101, boxShadow: '-4px 0 30px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
        overflow: 'hidden',
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={COLORS.muted} />
          </button>
          <Avatar firstName={p.firstName} lastName={p.lastName} photo={p.onboardPhoto || p.photo} size={72} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{p.firstName} {p.lastName}</h2>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '4px 0 0' }}>#{p.jerseyNumber} · {rosterName}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {p.position.map((pos) => {
              const col = positionColor(pos)
              return (
                <span key={pos} style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: `${col}14`, border: `1px solid ${col}30`, fontSize: 12, fontWeight: 700, color: col }}>{pos}</span>
              )
            })}
            <Badge variant={p.status === 'active' ? 'success' : p.status === 'injured' ? 'error' : 'neutral'}>{p.status}</Badge>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Player Info */}
          <Section icon={<User size={15} color={COLORS.primary} />} title="Player Info">
            <InfoRow label="Date of Birth" value={p.dateOfBirth} />
            <InfoRow label="Dominant Foot" value={footLabel(p.dominantFoot)} icon={<Footprints size={13} color={COLORS.muted} />} />
            {p.nationality && <InfoRow label="Nationality" value={p.nationality} icon={<MapPin size={13} color={COLORS.muted} />} />}
            {p.passportId && <InfoRow label="Passport / ID" value={p.passportId} />}
          </Section>

          {/* Guardian */}
          {hasGuardian && (
            <Section icon={<Shield size={15} color={COLORS.primary} />} title="Guardian">
              <InfoRow label="Name" value={p.guardianName || '—'} />
              {p.guardianPhone && <InfoRow label="Phone" value={p.guardianPhone} icon={<Phone size={13} color={COLORS.muted} />} />}
              {p.guardianRelationship && <InfoRow label="Relationship" value={p.guardianRelationship.charAt(0).toUpperCase() + p.guardianRelationship.slice(1)} />}
            </Section>
          )}

          {/* Additional Details */}
          {hasAdditional && (
            <Section icon={<GraduationCap size={15} color={COLORS.primary} />} title="Additional">
              {p.schoolName && <InfoRow label="School" value={p.schoolName} />}
              {p.previousClub && <InfoRow label="Previous Club" value={p.previousClub} />}
              {p.kitSize && <InfoRow label="Kit Size" value={p.kitSize} />}
            </Section>
          )}

          {/* Medical & Emergency */}
          {hasMedical && (
            <Section icon={<Heart size={15} color={COLORS.error} />} title="Medical & Emergency">
              {p.medicalNotes && <InfoRow label="Medical Notes" value={p.medicalNotes} />}
              {p.emergencyName && <InfoRow label="Emergency Contact" value={p.emergencyName} />}
              {p.emergencyPhone && <InfoRow label="Emergency Phone" value={p.emergencyPhone} icon={<Phone size={13} color={COLORS.muted} />} />}
            </Section>
          )}

          {!hasGuardian && !hasAdditional && !hasMedical && (
            <div style={{ padding: 20, background: COLORS.bg, borderRadius: 10, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: 0, fontStyle: 'italic' }}>
                More details will appear once the parent completes onboarding.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 4 }}>
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.navy }}>{value}</span>
      </div>
    </div>
  )
}
