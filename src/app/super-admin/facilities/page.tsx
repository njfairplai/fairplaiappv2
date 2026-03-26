'use client'

import { MapPin, Camera } from 'lucide-react'
import { COLORS, SHADOWS, RADIUS } from '@/lib/constants'
import { facilities, pitches, academyStats } from '@/lib/mockData'

const cameraStatusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: `${COLORS.success}15`, color: COLORS.success },
  calibrating: { bg: `${COLORS.warning}15`, color: COLORS.warning },
  inactive: { bg: `${COLORS.error}15`, color: COLORS.error },
}

export default function FacilitiesPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 24px' }}>Facilities</h1>

      {facilities.map((f) => {
        const facilityPitches = pitches.filter((p) => p.facilityId === f.id)
        const linkedAcademies = academyStats.filter((a) => a.facilityName === f.name)
        const activeCameras = facilityPitches.filter((p) => p.cameraStatus === 'active').length
        const totalCameras = facilityPitches.length

        return (
          <div key={f.id} style={{ background: '#fff', borderRadius: RADIUS.card, padding: 24, boxShadow: SHADOWS.card, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{f.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <MapPin size={14} color={COLORS.muted} />
                  <span style={{ fontSize: 13, color: COLORS.muted }}>{f.location}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{f.pitchCount}</p>
                  <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Pitches</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{linkedAcademies.length}</p>
                  <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Academies</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Camera size={16} color={COLORS.muted} />
                  <span style={{ fontSize: 13, color: COLORS.navy, fontWeight: 600 }}>{activeCameras}/{totalCameras} active</span>
                </div>
              </div>
            </div>

            {/* Pitches Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Pitch', 'Type', 'Camera Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: COLORS.muted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facilityPitches.map((p) => {
                  const cs = cameraStatusColors[p.cameraStatus]
                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{p.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: 14, color: COLORS.navy, borderBottom: `1px solid ${COLORS.border}` }}>{p.type}</td>
                      <td style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: RADIUS.pill,
                          background: cs.bg, color: cs.color, textTransform: 'capitalize',
                        }}>{p.cameraStatus}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Linked Academies */}
            {linkedAcademies.length > 0 && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#F5F6FC', borderRadius: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, margin: '0 0 6px' }}>Linked Academies</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {linkedAcademies.map((a) => (
                    <span key={a.academyId} style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, background: '#fff', padding: '4px 12px', borderRadius: RADIUS.pill, border: `1px solid ${COLORS.border}` }}>{a.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
