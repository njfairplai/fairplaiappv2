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
      <div data-tour-id="parent-development-welfare">
        <WelfareCards playerId={activeKid.id} />
      </div>

      {/* Coach's plan (IDP read-only) */}
      {(dev || feedback) && (
        <section style={{ padding: '20px 16px 0' }}>
          <Card label="COACH'S PLAN">
            {dev?.coachNotes && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--brand-indigo)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                “{dev.coachNotes}”
              </p>
            )}
            {review?.strengthAreas && review!.strengthAreas.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.18em',
                    color: 'var(--brand-indigo-mute)',
                    fontWeight: 700,
                  }}
                >
                  STRENGTHS
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {review!.strengthAreas.map(s => (
                    <span
                      key={s}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: 'var(--brand-yellow-soft)',
                        color: 'var(--brand-indigo)',
                        border: '1px solid var(--brand-yellow)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {review?.improvementAreas && review!.improvementAreas.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.18em',
                    color: 'var(--brand-indigo-mute)',
                    fontWeight: 700,
                  }}
                >
                  WORKING ON
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {review!.improvementAreas.map(s => (
                    <span
                      key={s}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: 'transparent',
                        color: 'var(--brand-coral)',
                        border: '1px solid var(--brand-coral)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Soft skills */}
      {feedback && (
        <section style={{ padding: '20px 16px 0' }}>
          <Card label="SOFT SKILLS">
            <SoftSkillBar label="Attitude" value={feedback.attitude} />
            <SoftSkillBar label="Effort" value={feedback.effort} />
            <SoftSkillBar label="Coachability" value={feedback.coachability} />
            <SoftSkillBar label="Sportsmanship" value={feedback.sportsmanship} />
          </Card>
        </section>
      )}

      {/* Performance summary (composite) */}
      {score && (
        <section style={{ padding: '20px 16px 0' }}>
          <Card label="SEASON COMPOSITE">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 38,
                  color:
                    score.compositeScore >= 75
                      ? 'var(--brand-yellow)'
                      : score.compositeScore >= 60
                      ? 'var(--brand-indigo)'
                      : 'var(--brand-coral)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {score.compositeScore}
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
                SEASON AVG · {score.avgScore}
              </span>
            </div>
          </Card>
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
