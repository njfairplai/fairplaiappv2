import { NextResponse } from 'next/server'

interface CoachContext {
  rosterName: string
  squadSize: number
  avgScore: number
  sessionsPlayed: number
  upcomingCount: number
  pendingReviewCount: number
  feedbackDueCount: number
  atRiskCount: number
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  coachContext: CoachContext
}

// Keyword-based intent matcher
function generateResponse(userText: string, ctx: CoachContext): { text: string; cards?: Array<{ type: string; payload: Record<string, unknown> }> } {
  const lower = userText.toLowerCase()
  const cards: Array<{ type: string; payload: Record<string, unknown> }> = []

  // Squad
  if (lower.includes('squad') || lower.includes('player') || lower.includes('team')) {
    return {
      text: `Your ${ctx.rosterName} squad has ${ctx.squadSize} players with an average score of ${ctx.avgScore}. ${ctx.atRiskCount > 0 ? `${ctx.atRiskCount} player${ctx.atRiskCount > 1 ? 's are' : ' is'} flagged for load risk.` : 'No players are at risk.'} You can view the full squad in the Squad tab.`,
      cards: [
        {
          type: 'stat_card',
          payload: {
            stats: [
              { label: 'Squad Size', value: ctx.squadSize },
              { label: 'Avg Score', value: ctx.avgScore },
              { label: 'At Risk', value: ctx.atRiskCount },
              { label: 'Feedback Due', value: ctx.feedbackDueCount },
            ],
          },
        },
        {
          type: 'action_chips',
          payload: {
            actions: [
              { label: 'Start IDP', action: 'create_idp' },
              { label: 'Check Schedule', action: 'check_schedule' },
            ],
          },
        },
      ],
    }
  }

  // Schedule
  if (lower.includes('schedule') || lower.includes('session') || lower.includes('upcoming') || lower.includes('next')) {
    return {
      text: ctx.upcomingCount > 0
        ? `You have ${ctx.upcomingCount} upcoming session${ctx.upcomingCount > 1 ? 's' : ''} for ${ctx.rosterName}. Head to the Record tab on your mobile app to start a session.`
        : `No upcoming sessions scheduled for ${ctx.rosterName}. You can schedule sessions through the academy admin.`,
      cards: [{
        type: 'stat_card',
        payload: {
          stats: [
            { label: 'Upcoming', value: ctx.upcomingCount },
            { label: 'Completed', value: ctx.sessionsPlayed },
            { label: 'Pending Review', value: ctx.pendingReviewCount },
          ],
        },
      }],
    }
  }

  // Review
  if (lower.includes('review')) {
    if (ctx.pendingReviewCount > 0) {
      return {
        text: `You have ${ctx.pendingReviewCount} session${ctx.pendingReviewCount > 1 ? 's' : ''} waiting for review. These need classification or player tagging.`,
        cards: [{
          type: 'review_prompt',
          payload: { count: ctx.pendingReviewCount },
        }],
      }
    }
    return { text: "You're all caught up — no sessions need review right now." }
  }

  // IDP / development / report
  if (lower.includes('idp') || lower.includes('development') || lower.includes('report') || lower.includes('feedback')) {
    return {
      text: `${ctx.feedbackDueCount > 0 ? `${ctx.feedbackDueCount} player${ctx.feedbackDueCount > 1 ? 's are' : ' is'} due for feedback.` : 'All feedback is up to date.'} You can generate IDPs in the IDPs tab — they auto-populate from match data, and you just add your temperament ratings and goals.`,
      cards: [{
        type: 'action_chips',
        payload: {
          actions: [
            { label: 'Open IDPs', action: 'create_idp' },
            { label: 'View Squad', action: 'view_squad' },
          ],
        },
      }],
    }
  }

  // Stats / overview
  if (lower.includes('stat') || lower.includes('overview') || lower.includes('summary') || lower.includes('how')) {
    return {
      text: `Here's your ${ctx.rosterName} overview:`,
      cards: [{
        type: 'stat_card',
        payload: {
          stats: [
            { label: 'Sessions', value: ctx.sessionsPlayed },
            { label: 'Avg Score', value: ctx.avgScore },
            { label: 'Pending Reviews', value: ctx.pendingReviewCount },
            { label: 'At Risk', value: ctx.atRiskCount },
          ],
        },
      },
      {
        type: 'action_chips',
        payload: {
          actions: [
            { label: 'View Squad', action: 'view_squad' },
            { label: 'Check Schedule', action: 'check_schedule' },
            { label: 'Start IDP', action: 'create_idp' },
          ],
        },
      }],
    }
  }

  // Risk / load
  if (lower.includes('risk') || lower.includes('load') || lower.includes('injury') || lower.includes('fatigue')) {
    return {
      text: ctx.atRiskCount > 0
        ? `${ctx.atRiskCount} player${ctx.atRiskCount > 1 ? 's are' : ' is'} flagged for load risk. Toggle the Risk View in the Squad tab to see ACWR ratios and strain levels for each player.`
        : 'All players are in good condition. No load risk flags at the moment.',
      cards: [{
        type: 'action_chips',
        payload: {
          actions: [
            { label: 'View Squad', action: 'view_squad' },
            { label: 'View Stats', action: 'view_stats' },
          ],
        },
      }],
    }
  }

  // Default / help
  return {
    text: "I can help with your squad, schedule, player development, or session reviews. What would you like to know?",
    cards: [{
      type: 'action_chips',
      payload: {
        actions: [
          { label: 'View Squad', action: 'view_squad' },
          { label: 'Check Schedule', action: 'check_schedule' },
          { label: 'Start IDP', action: 'create_idp' },
          { label: 'View Stats', action: 'view_stats' },
        ],
      },
    }],
  }
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const lastUserMessage = body.messages[body.messages.length - 1]?.content || ''

    const response = generateResponse(lastUserMessage, body.coachContext)

    return NextResponse.json(response)
  } catch {
    return NextResponse.json(
      { text: "Something went wrong. Please try again.", cards: [] },
      { status: 500 }
    )
  }
}
