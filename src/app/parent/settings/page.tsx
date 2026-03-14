'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { playerProfile } from '@/lib/mockData'
import Toggle from '@/components/ui/Toggle'
import { SHADOWS, COLORS } from '@/lib/constants'
import { ChevronRight } from 'lucide-react'

function RowDivider() { return <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', marginLeft: 16 }} /> }

function ChevronRow({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52 }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.navy }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {sub && <span style={{ fontSize: 14, color: '#9DA2B3' }}>{sub}</span>}
        <ChevronRight size={16} color="#9DA2B3" />
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52 }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.navy }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {sub && <span style={{ fontSize: 13, color: '#9DA2B3' }}>{sub}</span>}
        <Toggle value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) { return <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: SHADOWS.card }}>{children}</div> }
function SectionLabel({ text }: { text: string }) { return <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '20px 0 8px' }}>{text}</p> }

export default function ParentSettingsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState({ newMatch: true, highlights: true, weekly: true, monthly: false })
  const [delivery, setDelivery] = useState({ whatsapp: true, email: true })
  return (
    <div className="tab-fade" style={{ minHeight: 'calc(100dvh - 80px)', background: '#F5F6FC', paddingBottom: 100 }}>
      <div style={{ paddingTop: 28, display: 'flex', justifyContent: 'center' }}>
        <Image src="/logo-black.png" alt="FairplAI" width={100} height={30} style={{ height: 30, width: 'auto', objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 20px 0' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', position: 'relative', border: '2px solid rgba(74,74,255,0.2)' }}>
          <Image src="/players/kiyan.jpg" alt={playerProfile.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{playerProfile.name}</p>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{playerProfile.academy} · {playerProfile.team}</p>
        </div>
      </div>
      <div style={{ height: 1, background: '#EDEFF7', margin: '20px 20px 0' }} />
      <div style={{ padding: '0 20px' }}>
        <SectionLabel text="Player View" />
        <SectionCard>
          <button
            onClick={() => {
              localStorage.setItem('fairplai_view_as_player', 'true')
              router.push('/player/home')
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', height: 52, padding: '0 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 500, color: COLORS.navy }}>View as Kiyan</span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#00C9A7',
              background: 'rgba(0,201,167,0.1)', padding: '4px 10px', borderRadius: 8,
            }}>
              Open Player View →
            </span>
          </button>
        </SectionCard>
        <SectionLabel text="Notifications" />
        <SectionCard>
          <ToggleRow label="New match analysed" value={notifs.newMatch} onChange={(v) => setNotifs((s) => ({ ...s, newMatch: v }))} />
          <RowDivider />
          <ToggleRow label="New highlights" value={notifs.highlights} onChange={(v) => setNotifs((s) => ({ ...s, highlights: v }))} />
          <RowDivider />
          <ToggleRow label="Weekly summary" value={notifs.weekly} onChange={(v) => setNotifs((s) => ({ ...s, weekly: v }))} />
          <RowDivider />
          <ToggleRow label="Monthly report" value={notifs.monthly} onChange={(v) => setNotifs((s) => ({ ...s, monthly: v }))} />
        </SectionCard>
        <SectionLabel text="Delivery" />
        <SectionCard>
          <ToggleRow label="WhatsApp" sub="+971 50 123 4567" value={delivery.whatsapp} onChange={(v) => setDelivery((s) => ({ ...s, whatsapp: v }))} />
          <RowDivider />
          <ToggleRow label="Email" sub="parent@email.com" value={delivery.email} onChange={(v) => setDelivery((s) => ({ ...s, email: v }))} />
        </SectionCard>
        <SectionLabel text="App" />
        <SectionCard><ChevronRow label="Language" sub="English" /><RowDivider /><ChevronRow label="Timezone" sub="UAE (GMT+4)" /></SectionCard>
        <SectionLabel text="Support" />
        <SectionCard><ChevronRow label="Help Centre" /><RowDivider /><ChevronRow label="Contact Support" /><RowDivider /><ChevronRow label="Privacy Policy" /><RowDivider /><ChevronRow label="Terms of Service" /></SectionCard>
        <SectionLabel text="Account" />
        <SectionCard>
          <ChevronRow label="Change Password" />
          <RowDivider />
          <button onClick={() => window.alert('Your deletion request has been submitted.')} style={{ display: 'block', width: '100%', height: 52, padding: '0 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, color: COLORS.error }}>Request Data Deletion</button>
          <RowDivider />
          <button onClick={() => { localStorage.removeItem('fairplai_auth_session'); localStorage.removeItem('fairplai_role'); localStorage.removeItem('fairplai_consented'); router.push('/login') }} style={{ display: 'block', width: '100%', height: 52, padding: '0 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, color: COLORS.error }}>Sign Out</button>
        </SectionCard>
        <p style={{ fontSize: 12, color: '#9DA2B3', textAlign: 'center', marginTop: 24 }}>FairPlai Parent/Player Portal · v2.0.0<br /><span style={{ fontSize: 11, opacity: 0.7 }}>fairpl.ai · Made for GCC football families</span></p>
      </div>
    </div>
  )
}
