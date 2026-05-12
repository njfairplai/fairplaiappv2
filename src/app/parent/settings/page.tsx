'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { playerProfile } from '@/lib/mockData'
import Toggle from '@/components/ui/Toggle'
import { ChevronRight } from 'lucide-react'

function RowDivider() {
  return <div className="h-px bg-brand-line-soft ml-4" />
}

function ChevronRow({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between px-4 h-[52px]">
      <span className="text-[15px] font-medium text-brand-indigo">{label}</span>
      <div className="flex items-center gap-2 text-brand-indigo-mute">
        {sub && <span className="text-sm">{sub}</span>}
        <ChevronRight size={16} />
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 h-[52px]">
      <span className="text-[15px] font-medium text-brand-indigo">{label}</span>
      <div className="flex items-center gap-2.5">
        {sub && <span className="text-[13px] text-brand-indigo-mute">{sub}</span>}
        <Toggle value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-paper rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[13px] font-bold text-brand-indigo-mute tracking-[0.08em] uppercase mt-5 mb-2">
      {text}
    </p>
  )
}

export default function ParentSettingsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState({ newMatch: true, highlights: true, weekly: true, monthly: false })
  const [delivery, setDelivery] = useState({ whatsapp: true, email: true })
  return (
    <div className="tab-fade min-h-[calc(100dvh-80px)] bg-brand-sand pb-[100px]">
      <div className="pt-7 flex justify-center">
        <Image src="/logo-black.png" alt="FairplAI" width={100} height={30} className="h-[30px] w-auto object-contain" />
      </div>
      <div className="flex flex-col items-center gap-2 px-5 pt-5">
        <div className="w-[52px] h-[52px] rounded-full overflow-hidden relative border-2 border-brand-indigo/20">
          <Image src="/players/kiyan.jpg" alt={playerProfile.name} fill className="object-cover object-[center_top]" />
        </div>
        <div className="text-center">
          <p className="text-base font-extrabold text-brand-indigo m-0">{playerProfile.name}</p>
          <p className="text-[13px] text-brand-indigo-mute mt-0.5">{playerProfile.academy} · {playerProfile.team}</p>
        </div>
      </div>
      <div className="h-px bg-brand-line mx-5 mt-5" />
      <div className="px-5">
        <SectionLabel text="Player View" />
        <SectionCard>
          <button
            onClick={() => {
              localStorage.setItem('fairplai_view_as_player', 'true')
              router.push('/player/home')
            }}
            className="flex items-center justify-between w-full h-[52px] px-4 bg-transparent border-none cursor-pointer text-left"
          >
            <span className="text-[15px] font-medium text-brand-indigo">View as Kiyan</span>
            <span className="text-xs font-bold text-brand-yellow bg-brand-yellow/15 px-2.5 py-1 rounded-lg">
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
          <button
            onClick={() => window.alert('Your deletion request has been submitted.')}
            className="block w-full h-[52px] px-4 text-left bg-transparent border-none cursor-pointer text-[15px] font-medium text-brand-coral"
          >
            Request Data Deletion
          </button>
          <RowDivider />
          <button
            onClick={() => { localStorage.removeItem('fairplai_auth_session'); localStorage.removeItem('fairplai_role'); localStorage.removeItem('fairplai_consented'); router.push('/login') }}
            className="block w-full h-[52px] px-4 text-left bg-transparent border-none cursor-pointer text-[15px] font-medium text-brand-coral"
          >
            Sign Out
          </button>
        </SectionCard>
        <p className="text-xs text-brand-indigo-mute text-center mt-6">
          FairPlai Parent/Player Portal · v2.0.0<br />
          <span className="text-[11px] opacity-70">fairpl.ai · Made for GCC football families</span>
        </p>
      </div>
    </div>
  )
}
