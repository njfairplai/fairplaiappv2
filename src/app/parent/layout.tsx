import BottomNav from '@/components/ui/BottomNav'
import RoleSwitcher from '@/components/ui/RoleSwitcher'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
      {children}
      <BottomNav portal="parent" />
      <RoleSwitcher />
    </div>
  )
}
