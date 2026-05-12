'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Briefcase, Inbox, Users } from 'lucide-react'
import { Eyebrow, Headline } from '@/components/ui/typography'

/**
 * Founder portal picker — landing page once /demo-admin is unlocked.
 *
 * Coach + Parent cards stamp the right session and drop the founder
 * into the matching portal — no demo flow, no email gate. Plus a quick
 * jump to the user-testing feedback viewer.
 *
 * Demo state is intentionally NOT touched — if a demo session is in
 * progress, the founder might be using /demo-admin to peek at a portal
 * mid-tour and we don't want to disrupt that.
 */

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

type Role = 'parent' | 'coach'

interface PortalCard {
  role: Role
  title: string
  blurb: string
  route: string
  icon: typeof Briefcase
}

const PORTALS: PortalCard[] = [
  {
    role: 'coach',
    title: 'Coach Portal',
    blurb: 'Mikel, Match Center, Squad pitch, Highlights, Hub.',
    route: '/coach/web',
    icon: Briefcase,
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    blurb: 'Parent home, Stats, Highlights, Development, Hub.',
    route: '/parent/home',
    icon: Users,
  },
]

function stampSession(role: Role) {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const session = {
    userId: `user_${role}_${now}`,
    email: `${role}@fairplai.local`,
    role,
    loginTimestamp: now,
    expiresAt: now + SESSION_DURATION_MS,
  }
  try {
    localStorage.setItem('fairplai_auth_session', JSON.stringify(session))
    localStorage.setItem('fairplai_role', role)
    localStorage.setItem('fairplai_consented', 'true')
  } catch {
    /* ignore */
  }
}

const CARD_CLASSES =
  'flex flex-col gap-3 rounded-xl border border-brand-line bg-brand-paper px-[18px] py-5 text-left text-brand-indigo no-underline transition-all duration-[160ms] ease-out hover:-translate-y-0.5 hover:border-brand-indigo hover:shadow-[0_10px_28px_rgba(11,8,40,0.10)]'

const ICON_TILE =
  'inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-brand-indigo text-brand-yellow'

const CTA_ROW =
  'mt-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.02em] text-brand-indigo'

export default function DemoAdminPortalPickerPage() {
  const router = useRouter()

  function open(card: PortalCard) {
    stampSession(card.role)
    router.push(card.route)
  }

  return (
    <main className="min-h-screen bg-brand-sand px-6 pb-20 pt-12 font-satoshi text-brand-indigo">
      <div className="mx-auto max-w-[880px]">
        <Eyebrow className="mb-3">FAIRPLAI · DEMO ADMIN</Eyebrow>

        <Headline as="h1" size="lg" className="mb-3">
          Pick a portal.
        </Headline>
        <p className="mb-9 mt-0 max-w-[540px] text-base leading-[1.5] text-brand-indigo-mute">
          Each card stamps the right session and drops you straight in —
          no demo flow, no email gate. Once you&apos;re inside, the floating
          chip (bottom right) lets you flip between coach and parent
          without coming back here.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
          {PORTALS.map(card => {
            const Icon = card.icon
            return (
              <button
                key={card.role}
                type="button"
                onClick={() => open(card)}
                className={CARD_CLASSES + ' cursor-pointer font-satoshi'}
              >
                <span className={ICON_TILE}>
                  <Icon size={18} />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-clash text-xl font-bold tracking-[-0.01em]">
                    {card.title}
                  </span>
                  <span className="text-[12.5px] leading-[1.45] text-brand-indigo-mute">
                    {card.blurb}
                  </span>
                </div>
                <span className={CTA_ROW}>
                  Open <ArrowRight size={13} />
                </span>
              </button>
            )
          })}

          <Link href="/demo-admin/feedback" className={CARD_CLASSES}>
            <span className={ICON_TILE}>
              <Inbox size={18} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-clash text-xl font-bold tracking-[-0.01em]">
                User Feedback
              </span>
              <span className="text-[12.5px] leading-[1.45] text-brand-indigo-mute">
                Live submissions from the user-testing flow. Reload to refresh.
              </span>
            </div>
            <span className={CTA_ROW}>
              Open <ArrowRight size={13} />
            </span>
          </Link>
        </div>

        <div className="mt-12 rounded-lg border border-dashed border-brand-line bg-brand-paper px-4 py-3.5 text-xs leading-[1.5] text-brand-indigo-mute">
          Jump back to <strong className="text-brand-indigo">/demo-admin</strong>{' '}
          any time to switch portals or check feedback. The unlock cookie
          lasts 30 days per device.
        </div>
      </div>
    </main>
  )
}
