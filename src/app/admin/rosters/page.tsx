'use client'
import Button from '@/components/ui/Button'
import RosterTable from '@/components/academy-admin/RosterTable'
export default function RostersPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1B1650', margin: 0 }}>Rosters</h1>
        <Button>Add Roster</Button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}><RosterTable /></div>
    </div>
  )
}
