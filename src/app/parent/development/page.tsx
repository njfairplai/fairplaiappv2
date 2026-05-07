'use client'

import { useEffect, useMemo, useState } from 'react'
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
  getNotificationsForKid,
  readClientNotifications,
  mergeNotifications,
  type PortalNotification,
} from '@/lib/parent-portal'
import { MultiKidSwitcher } from '@/components/parent-portal/MultiKidSwitcher'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { WelfareCards } from '@/components/parent-portal/WelfareCards'
import { IdpModal } from '@/components/parent-portal/IdpModal'
import { ChevronRight } from 'lucide-react'

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

  // Notifications for bell badge.
  const baseNotifications = useMemo(
    () => (activeKid ? getNotificationsForKid(activeKid.id) : []),
    [activeKid],
  )
  const [clientNotifications, setClientNotifications] = useState<PortalNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [idpOpen, setIdpOpen] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !activeKid) return
    setClientNotifications(readClientNotifications(activeKid.id))
    try {
      const raw = localStorage.getItem('fairplai_parent_notifications_read')
      if (raw) setReadIds(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore */
    }
  }, [activeKid])
  const allNotifications = useMemo(
    () => mergeNotifications(baseNotifications, clientNotifications),
    [baseNotifications, clientNotifications],
  )
  const unreadCount = allNotifications.filter(n => !readIds.has(n.id)).length

  if (!activeKid) {
    return null
  }

  const attendancePct =
    att && att.totalSessions > 0
      ? Math.round((att.sessionsAttended / att.totalSessions) * 100)
      : 0

  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        minHeight: '100dvh',
        color: 'var(--brand-indigo)',
        paddingBottom: 80,
      }}
    >
      <PortalTopBar unreadCount={unreadCount} />

      <MultiKidSwitcher
        kids={kids}
        activeKidId={activeKidId}
        onSwitch={setActiveKidId}
      />

      {/* Eyebrow + headline */}
      <section style={{ padding: '20px 16px 0' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          DEVELOPMENT
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            color: 'var(--brand-indigo)',
            letterSpacing: '-0.02em',
            margin: '4px 0 0',
            lineHeight: 1.1,
          }}
        >
          What {activeKid.firstName} is working on.
        </h1>
      </section>

      {/* Attendance card */}
      {att && (
        <section style={{ padding: '20px 16px 0' }}>
          <Card label="ATTENDANCE">
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 36,
                  color: 'var(--brand-indigo)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {attendancePct}%
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.18em',
                  color: 'var(--brand-indigo-mute)',
                  fontWeight: 700,
                }}
              >
                {att.sessionsAttended} OF {att.totalSessions} SESSIONS
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: 'var(--brand-line-soft)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${attendancePct}%`,
                  background:
                    attendancePct >= 80
                      ? 'var(--brand-yellow)'
                      : attendancePct >= 60
                      ? 'var(--brand-indigo)'
                      : 'var(--brand-coral)',
                  transition: 'width 200ms ease',
                }}
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
        <section style={{ padding: '24px 16px 0' }}>
          <button
            type="button"
            onClick={() => setIdpOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              width: '100%',
              padding: '16px 18px',
              background: 'var(--brand-indigo)',
              color: 'var(--brand-sand)',
              border: 'none',
              borderRadius: 12,
              fontFamily: 'inherit',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(11, 8, 40, 0.18)',
              textAlign: 'left',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-fragment)',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  color: 'var(--brand-yellow)',
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                INDIVIDUAL DEVELOPMENT PLAN
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                }}
              >
                Open development plan
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  color: 'rgba(238, 228, 200, 0.7)',
                  marginTop: 4,
                }}
              >
                Coach plan, strengths, soft skills, season summary. PDF download inside.
              </div>
            </div>
            <ChevronRight size={20} color="var(--brand-yellow)" />
          </button>
        </section>
      )}

      <section style={{ padding: '24px 16px' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11.5,
            color: 'var(--brand-indigo-mute)',
            textAlign: 'center',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
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
    <div
      style={{
        background: 'var(--brand-paper)',
        border: '1px solid var(--brand-line)',
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.22em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          display: 'block',
          marginBottom: 12,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function SoftSkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--brand-indigo)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          {value} / 5
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background:
                n <= value ? 'var(--brand-yellow)' : 'var(--brand-line-soft)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
