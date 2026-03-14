'use client'
import { useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { coaches, rosters } from '@/lib/mockData'
import { Phone, Calendar, Trophy, Shield, Globe, MapPin } from 'lucide-react'

const COLORS = { primary: '#4A4AFF', navy: '#1B1650', muted: '#6E7180' }
const SHADOWS = { card: '0 2px 12px rgba(0,0,0,0.06)' }

const ROLE_LABELS: Record<string, string> = {
  head_coach: 'Head Coach',
  assistant_coach: 'Assistant Coach',
  goalkeeper_coach: 'Goalkeeper Coach',
  fitness_coach: 'Fitness Coach',
}

const ROLE_COLORS: Record<string, string> = {
  'Head Coach': '#4A4AFF',
  head_coach: '#4A4AFF',
  'Assistant Coach': '#10B981',
  assistant_coach: '#10B981',
  'Goalkeeper Coach': '#F59E0B',
  goalkeeper_coach: '#F59E0B',
  'Fitness Coach': '#EF4444',
  fitness_coach: '#EF4444',
}

const SPEC_COLORS: Record<string, string> = {
  Attacking: '#EF4444',
  Defending: '#3B82F6',
  'Set Pieces': '#8B5CF6',
  Goalkeeping: '#F59E0B',
  Fitness: '#10B981',
  'Youth Development': '#EC4899',
}

interface OnboardData {
  token: string
  role: string
  profile: {
    fullName: string
    phone: string
    dateOfBirth: string
    nationality: string
    photo: string | null
  }
  background: {
    experience: string
    licenses: string[]
    specialisations: string[]
    previousClubs: string
  }
  preferences: {
    formation: string
    language: string
    notification: string
  }
  completedAt: string
}

interface MergedCoach {
  id: string
  name: string
  email: string
  phone?: string
  photo?: string | null
  role?: string
  rosterIds: string[]
  dateOfBirth?: string
  nationality?: string
  experience?: string
  licenses?: string[]
  specialisations?: string[]
  previousClubs?: string
  formation?: string
  language?: string
  notification?: string
  inviteStatus?: string
  source: 'mock' | 'imported'
}

export default function CoachesPage() {
  const [allCoaches, setAllCoaches] = useState<MergedCoach[]>([])

  // Enrich mock coaches with realistic details
  const MOCK_ENRICHMENT: Record<string, Partial<MergedCoach>> = {
    coach_001: {
      role: 'Head Coach',
      phone: '+966 55 812 3456',
      nationality: 'Brazilian',
      experience: '12',
      licenses: ['UEFA A License', 'AFC Pro Diploma'],
      specialisations: ['Attacking', 'Youth Development'],
      previousClubs: 'Al Ahli FC Youth, Santos Academy',
      formation: '4-3-3',
      language: 'English',
    },
    coach_002: {
      role: 'Assistant Coach',
      phone: '+966 50 234 7890',
      nationality: 'Egyptian',
      experience: '6',
      licenses: ['AFC B License'],
      specialisations: ['Defending', 'Set Pieces'],
      formation: '4-2-3-1',
      language: 'Arabic',
    },
  }

  useEffect(() => {
    // Start with mock coaches
    const mockCoaches: MergedCoach[] = coaches
      .filter((c) => c.academyId === 'academy_001')
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        photo: c.photo,
        rosterIds: c.rosterIds,
        source: 'mock' as const,
        ...MOCK_ENRICHMENT[c.id],
      }))

    // Load imported coaches from localStorage
    try {
      const imported = JSON.parse(localStorage.getItem('fairplai_imported_coaches') || '[]')
      const onboardEntries: OnboardData[] = JSON.parse(localStorage.getItem('fairplai_onboard_data') || '[]')

      const importedCoaches: MergedCoach[] = imported.map((ic: {
        id: string; name: string; email?: string; phone?: string;
        role?: string; rosterIds?: string[]; inviteToken?: string; inviteStatus?: string;
      }) => {
        // Find matching onboard data by invite token
        const onboard = onboardEntries.find(
          (o) => o.token === ic.inviteToken && o.role === 'coach'
        )

        const merged: MergedCoach = {
          id: ic.id,
          name: onboard?.profile?.fullName || ic.name,
          email: ic.email || '',
          phone: onboard?.profile?.phone || ic.phone,
          photo: onboard?.profile?.photo,
          role: ic.role,
          rosterIds: ic.rosterIds || [],
          inviteStatus: ic.inviteStatus,
          source: 'imported',
        }

        if (onboard) {
          merged.dateOfBirth = onboard.profile.dateOfBirth
          merged.nationality = onboard.profile.nationality
          merged.experience = onboard.background.experience
          merged.licenses = onboard.background.licenses
          merged.specialisations = onboard.background.specialisations
          merged.previousClubs = onboard.background.previousClubs
          merged.formation = onboard.preferences.formation
          merged.language = onboard.preferences.language
          merged.notification = onboard.preferences.notification
        }

        return merged
      })

      setAllCoaches([...mockCoaches, ...importedCoaches])
    } catch {
      setAllCoaches(mockCoaches)
    }
  }, [])

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>Coaches</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {allCoaches.map((c) => {
          const assignedRosters = rosters.filter((r) => c.rosterIds.includes(r.id))
          const nameParts = c.name.split(' ')
          const roleColor = c.role ? (ROLE_COLORS[c.role] || COLORS.primary) : COLORS.primary

          return (
            <div key={c.id} style={{
              background: '#fff', borderRadius: 14, boxShadow: SHADOWS.card,
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid #F0F1F4',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {c.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.photo}
                    alt={c.name}
                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <Avatar firstName={nameParts[0]} lastName={nameParts[1] || ''} size={52} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{c.name}</p>
                    {c.role && (
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px', borderRadius: 20,
                        background: `${roleColor}14`,
                        border: `1px solid ${roleColor}30`,
                        fontSize: 11, fontWeight: 700, color: roleColor,
                        whiteSpace: 'nowrap',
                      }}>
                        {ROLE_LABELS[c.role] || c.role}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: COLORS.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Contact & personal info */}
                {(c.phone || c.dateOfBirth || c.nationality) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {c.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone size={14} color={COLORS.muted} />
                        <span style={{ fontSize: 13, color: COLORS.navy }}>{c.phone}</span>
                      </div>
                    )}
                    {c.dateOfBirth && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={14} color={COLORS.muted} />
                        <span style={{ fontSize: 13, color: COLORS.navy }}>{c.dateOfBirth}</span>
                      </div>
                    )}
                    {c.nationality && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={14} color={COLORS.muted} />
                        <span style={{ fontSize: 13, color: COLORS.navy }}>{c.nationality}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Background section */}
                {(c.experience || (c.licenses && c.licenses.length > 0) || (c.specialisations && c.specialisations.length > 0) || c.previousClubs) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>Background</p>

                    {c.experience && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={14} color={COLORS.muted} />
                        <span style={{ fontSize: 13, color: COLORS.navy }}>{c.experience} years experience</span>
                      </div>
                    )}

                    {c.licenses && c.licenses.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Shield size={13} color={COLORS.muted} />
                          <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Licenses</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 19 }}>
                          {c.licenses.map((l) => (
                            <span key={l} style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                              background: '#F0F1F4', fontSize: 11, fontWeight: 600, color: COLORS.navy,
                            }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {c.specialisations && c.specialisations.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.specialisations.map((s) => {
                          const color = SPEC_COLORS[s] || COLORS.primary
                          return (
                            <span key={s} style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                              background: `${color}14`, border: `1px solid ${color}30`,
                              fontSize: 11, fontWeight: 600, color,
                            }}>
                              {s}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {c.previousClubs && (
                      <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontStyle: 'italic' }}>
                        Previously: {c.previousClubs}
                      </p>
                    )}
                  </div>
                )}

                {/* Preferences */}
                {(c.formation || c.language) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>Preferences</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {c.formation && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                            background: `${COLORS.primary}14`, fontSize: 12, fontWeight: 700, color: COLORS.primary,
                          }}>
                            {c.formation}
                          </span>
                        </div>
                      )}
                      {c.language && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Globe size={13} color={COLORS.muted} />
                          <span style={{ fontSize: 12, color: COLORS.navy }}>{c.language}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Squads */}
                {assignedRosters.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {assignedRosters.map((r) => (
                      <Badge key={r.id} variant="info">{r.name}</Badge>
                    ))}
                  </div>
                )}

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <Badge variant="success">Active</Badge>
                  {c.inviteStatus && c.inviteStatus !== 'completed' && (
                    <Badge variant="warning">Onboarding {c.inviteStatus}</Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
