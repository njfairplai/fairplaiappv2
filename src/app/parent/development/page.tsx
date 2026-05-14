'use client'

import { useMemo, useState } from 'react'
import {
  attendanceData,
  developmentReportData,
  seasonReviews,
  coachFeedbackHistory,
  squadScores,
} from '@/lib/mockData'
import {
  getKidsForParent,
  getDefaultKid,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { WelfareCards } from '@/components/parent-portal/WelfareCards'
import { IdpModal } from '@/components/parent-portal/IdpModal'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Parent Development — read-only IDP summary, attendance record, soft-
 * skill bars, strengths / areas for development. The coach owns the
 * source data; parent and player both see read-only here. Player-only
 * surfaces (personal goals, post-match self-rating) come in via the
 * `role="player"` mirror in `src/app/player/development/page.tsx`.
 */
export default function ParentDevelopmentPage() {
  const PARENT_ID = 'parent_001'

  const kids = useMemo(() => getKidsForParent(PARENT_ID), [])
  const defaultKidId = useMemo(() => getDefaultKid(PARENT_ID)?.id ?? null, [])
  const [activeKidId, setActiveKidId] = useState<string | null>(defaultKidId)
  const activeKid = kids.find(k => k.id === activeKidId) ?? null

  const dev = activeKid ? developmentReportData[activeKid.id] : null
  const review = activeKid
    ? seasonReviews.find(r => r.playerId === activeKid.id) ?? null
    : null
  const feedback = activeKid
    ? coachFeedbackHistory
        .filter(f => f.playerId === activeKid.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
    : null
  const score = activeKid ? squadScores[activeKid.id] : null
  const att = activeKid
    ? Object.values(attendanceData)
        .flat()
        .find(a => a.playerId === activeKid.id)
    : null

  const [idpOpen, setIdpOpen] = useState(false)

  if (!activeKid) {
    return null
  }

  const attendancePct =
    att && att.totalSessions > 0
      ? Math.round((att.sessionsAttended / att.totalSessions) * 100)
      : 0

  return (
    <div className="bg-brand-sand min-h-[100dvh] text-brand-indigo pb-20">
      <PortalTopBar />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Page anchor — eyebrow dropped (the top nav and Progress tab
          already establish scope; eyebrow was chrome without info). */}
      <section className="px-4 pt-5">
        <h1 className="m-0 font-clash text-[28px] leading-[1.1] tracking-[-0.02em] text-brand-indigo">
          What {activeKid.firstName} is working on.
        </h1>
      </section>

      {/* Attendance card */}
      {att && (
        <section className="px-4 pt-5">
          <Card label="ATTENDANCE">
            <div className="flex items-baseline gap-2.5 mb-2.5">
              <span className="font-clash text-[36px] text-brand-indigo tracking-[-0.02em] leading-none">
                {attendancePct}%
              </span>
              <span className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold">
                {att.sessionsAttended} OF {att.totalSessions} SESSIONS
              </span>
            </div>
            <div className="h-2 rounded-full bg-brand-line-soft overflow-hidden">
              <div
                className={cn(
                  'h-full transition-[width] duration-200 ease-linear',
                  attendancePct >= 80
                    ? 'bg-brand-yellow'
                    : attendancePct >= 60
                    ? 'bg-brand-indigo'
                    : 'bg-brand-coral',
                )}
                style={{ width: `${attendancePct}%` }}
              />
            </div>
          </Card>
        </section>
      )}

      {/* Workload + Gear — welfare cards. Auto-hide if no fatigue / PPE
       *  data exists for this kid, so the page stays clean for kids
       *  without flags. */}
      <WelfareCards playerId={activeKid.id} />

      {/* Open Development Plan — single CTA that opens the IdpModal.
       *  Replaces the previously-inline coach plan + soft-skills + season
       *  composite + season summary content (which was bloating this
       *  page). The full document lives in the modal with a Download
       *  PDF button (window.print() under the hood). */}
      {(dev || feedback || score) && (
        <section className="px-4 pt-6">
          <button
            type="button"
            onClick={() => setIdpOpen(true)}
            className="flex items-center justify-between gap-3.5 w-full px-[18px] py-4 bg-brand-indigo text-brand-sand border-none rounded-xl font-[inherit] cursor-pointer shadow-[0_4px_14px_rgba(11,8,40,0.18)] text-left"
          >
            <div>
              <div className="font-fragment text-[10px] tracking-[0.22em] text-brand-yellow font-bold mb-1">
                INDIVIDUAL DEVELOPMENT PLAN
              </div>
              <div className="font-clash text-[22px] tracking-[-0.01em] leading-[1.1]">
                Open development plan
              </div>
              <div className="font-satoshi text-[12.5px] text-[rgba(238,228,200,0.7)] mt-1">
                Coach plan, strengths, soft skills, season summary. PDF download inside.
              </div>
            </div>
            <ChevronRight size={20} color="var(--brand-yellow)" />
          </button>
        </section>
      )}

      <section className="px-4 pb-6 pt-4">
        <p className="m-0 text-center font-satoshi text-[11.5px] leading-[1.5] text-brand-indigo-mute">
          The coach owns this plan. To respond, send Coach Sara a message
          from the Hub.
        </p>
      </section>

      <IdpModal
        open={idpOpen}
        onClose={() => setIdpOpen(false)}
        player={activeKid}
        dev={dev}
        feedback={feedback}
        composite={score?.compositeScore ?? null}
        review={review}
      />
    </div>
  )
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-brand-paper border border-brand-line rounded-xl px-[18px] py-4">
      <span className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold block mb-3">
        {label}
      </span>
      {children}
    </div>
  )
}

function SoftSkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 mb-2.5">
      <div className="flex items-baseline justify-between">
        <span className="font-satoshi text-[13px] text-brand-indigo font-semibold">
          {label}
        </span>
        <span className="font-fragment text-[10px] tracking-[0.18em] text-brand-indigo-mute font-bold">
          {value} / 5
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            className={cn(
              'flex-1 h-1.5 rounded-[3px]',
              n <= value ? 'bg-brand-yellow' : 'bg-brand-line-soft',
            )}
          />
        ))}
      </div>
    </div>
  )
}
