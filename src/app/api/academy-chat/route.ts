import { NextResponse } from 'next/server'

interface AcademyContext {
  playerCount: number
  coachCount: number
  rosterCount: number
  sessionCount: number
  creditBalance: number
  subscriptionTier: string
  setupProgress: { completedSteps: string[]; totalSteps: number }
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  academyContext: AcademyContext
}

// Claude API tool definitions
const TOOLS = [
  {
    name: 'show_form',
    description: 'Show an inline form to the user for creating or adding data. Use this when the user wants to add a player, invite a coach, create a squad, or schedule a session.',
    input_schema: {
      type: 'object' as const,
      properties: {
        form_type: {
          type: 'string' as const,
          enum: ['add_player', 'add_coach', 'create_roster', 'schedule_session', 'add_program'],
          description: 'The type of form to show',
        },
      },
      required: ['form_type'],
    },
  },
  {
    name: 'show_stats',
    description: 'Show academy statistics summary cards. Use when user asks about stats, numbers, or overview.',
    input_schema: {
      type: 'object' as const,
      properties: {
        include_credits: { type: 'boolean' as const, description: 'Whether to include credit balance info' },
      },
    },
  },
  {
    name: 'list_entities',
    description: 'Show a list of players, coaches, squads, or sessions. Use when user asks to see or list entities.',
    input_schema: {
      type: 'object' as const,
      properties: {
        entity_type: {
          type: 'string' as const,
          enum: ['players', 'coaches', 'rosters', 'sessions'],
          description: 'Type of entities to list',
        },
      },
      required: ['entity_type'],
    },
  },
  {
    name: 'show_suggestions',
    description: 'Show action suggestion chips to guide the user. Use when the conversation needs direction or after completing a task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        suggestions: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              label: { type: 'string' as const },
              action: { type: 'string' as const },
            },
          },
          description: 'List of suggested actions',
        },
      },
      required: ['suggestions'],
    },
  },
]

function buildSystemPrompt(ctx: AcademyContext): string {
  return `You are the FairplAI Academy Assistant — a friendly, concise command centre for academy administrators at MAK Academy.

Current academy state:
- Players: ${ctx.playerCount}
- Coaches: ${ctx.coachCount}
- Squads: ${ctx.rosterCount}
- Scheduled sessions: ${ctx.sessionCount}
- Credit balance: ${ctx.creditBalance} minutes
- Subscription: ${ctx.subscriptionTier}
- Setup progress: ${ctx.setupProgress.completedSteps.length}/${ctx.setupProgress.totalSteps} steps complete

Your role:
1. Help set up the academy (add coaches, players, squads, schedule sessions)
2. Help with ongoing management tasks
3. Answer questions about the academy state

Rules:
- Be warm but concise (1-3 sentences max before using a tool)
- Always use the appropriate tool to show forms, stats, or lists — don't describe data in text when you can show it
- After completing an action, suggest logical next steps using show_suggestions
- If unsure what the user wants, use show_suggestions to guide them`
}

// Fallback keyword-based intent matcher for when no API key is available
function fallbackResponse(userText: string, ctx: AcademyContext): { text: string; cards: Array<{ type: string; payload: Record<string, unknown> }> } {
  const lower = userText.toLowerCase()
  const cards: Array<{ type: string; payload: Record<string, unknown> }> = []

  // Form triggers
  if ((lower.includes('add') || lower.includes('new') || lower.includes('create')) && lower.includes('player')) {
    return {
      text: "Let's add players to the academy. How would you like to do it?",
      cards: [{ type: 'choice_card', payload: { context: 'add_player' } }],
    }
  }
  if ((lower.includes('invite') || lower.includes('add') || lower.includes('new')) && lower.includes('coach')) {
    return {
      text: "Let's add a coach to the academy.",
      cards: [{ type: 'inline_form', payload: { formType: 'add_coach' } }],
    }
  }
  if ((lower.includes('create') || lower.includes('add') || lower.includes('new')) && lower.includes('program')) {
    return {
      text: "Let's create a new training program. How would you like to do it?",
      cards: [{ type: 'choice_card', payload: { context: 'add_program' } }],
    }
  }
  if ((lower.includes('create') || lower.includes('add') || lower.includes('new')) && lower.includes('roster')) {
    return {
      text: "Let's create a new squad.",
      cards: [{ type: 'inline_form', payload: { formType: 'create_roster' } }],
    }
  }
  if ((lower.includes('schedule') || lower.includes('book') || lower.includes('new')) && lower.includes('session')) {
    return {
      text: "Let's schedule a new session.",
      cards: [{ type: 'inline_form', payload: { formType: 'schedule_session' } }],
    }
  }
  if (lower.includes('import') || (lower.includes('bulk') && lower.includes('player')) || lower.includes('csv') || lower.includes('spreadsheet')) {
    return {
      text: "You can import multiple players at once via CSV. Upload a file with player names and guardian emails — each guardian will receive an onboarding invite.",
      cards: [{ type: 'csv_import', payload: {} }],
    }
  }

  // Stats & info
  if (lower.includes('stat') || lower.includes('overview') || lower.includes('dashboard') || lower.includes('summary')) {
    return {
      text: "Here's your academy overview:",
      cards: [{
        type: 'stat_card',
        payload: {
          stats: [
            { label: 'Players', value: ctx.playerCount },
            { label: 'Coaches', value: ctx.coachCount },
            { label: 'Squads', value: ctx.rosterCount },
            { label: 'Sessions', value: ctx.sessionCount },
            { label: 'Credits', value: `${ctx.creditBalance} min` },
          ],
        },
      }],
    }
  }
  if (lower.includes('credit') || lower.includes('balance') || lower.includes('minutes')) {
    return {
      text: `You have ${ctx.creditBalance} analysis minutes remaining on your ${ctx.subscriptionTier} plan.`,
      cards: [{
        type: 'stat_card',
        payload: {
          stats: [
            { label: 'Credits', value: `${ctx.creditBalance} min` },
            { label: 'Plan', value: ctx.subscriptionTier },
          ],
        },
      }],
    }
  }

  // List triggers
  if (lower.includes('list') || lower.includes('show') || lower.includes('view')) {
    if (lower.includes('player')) {
      return { text: 'Here are your players:', cards: [{ type: 'entity_list', payload: { entityType: 'players' } }] }
    }
    if (lower.includes('coach')) {
      return { text: 'Here are your coaches:', cards: [{ type: 'entity_list', payload: { entityType: 'coaches' } }] }
    }
    if (lower.includes('roster') || lower.includes('team') || lower.includes('squad')) {
      return { text: 'Here are your squads:', cards: [{ type: 'entity_list', payload: { entityType: 'rosters' } }] }
    }
    if (lower.includes('session')) {
      return { text: 'Here are your sessions:', cards: [{ type: 'entity_list', payload: { entityType: 'sessions' } }] }
    }
  }

  // Greeting
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return {
      text: "Hey there! How can I help you today?",
      cards: [{
        type: 'action_chips',
        payload: {
          chips: [
            { label: 'View stats', action: 'view_stats' },
            { label: 'Add a player', action: 'add_player' },
            { label: 'Schedule session', action: 'schedule_session' },
            { label: 'Add a coach', action: 'add_coach' },
            { label: 'Create program', action: 'add_program' },
          ],
        },
      }],
    }
  }

  // Default
  return {
    text: "I can help you manage your academy. Here are some things I can do:",
    cards: [{
      type: 'action_chips',
      payload: {
        chips: [
          { label: 'Add a player', action: 'add_player' },
          { label: 'Create a squad', action: 'create_roster' },
          { label: 'Add a coach', action: 'add_coach' },
          { label: 'Schedule session', action: 'schedule_session' },
          { label: 'Create program', action: 'add_program' },
          { label: 'View stats', action: 'view_stats' },
        ],
      },
    }],
  }
}

// Map Claude tool use results to ChatCard format
function mapToolCallToCards(toolName: string, toolInput: Record<string, unknown>): Array<{ type: string; payload: Record<string, unknown> }> {
  switch (toolName) {
    case 'show_form': {
      const formType = toolInput.form_type as string
      // add_player and add_program get a choice card (manual vs upload)
      if (formType === 'add_player' || formType === 'add_program') {
        return [{ type: 'choice_card', payload: { context: formType } }]
      }
      return [{ type: 'inline_form', payload: { formType } }]
    }
    case 'show_stats':
      return [{ type: 'stat_card', payload: { includeCredits: toolInput.include_credits ?? true } }]
    case 'list_entities':
      return [{ type: 'entity_list', payload: { entityType: toolInput.entity_type } }]
    case 'show_suggestions':
      return [{ type: 'action_chips', payload: { chips: toolInput.suggestions } }]
    default:
      return []
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  let body: ChatRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ text: 'Invalid request.', cards: [] })
  }

  const { messages, academyContext } = body

  // Fallback mode when no API key
  if (!apiKey) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    const result = fallbackResponse(lastUserMsg?.content || '', academyContext)
    return NextResponse.json({ ...result, source: 'fallback' })
  }

  try {
    const apiMessages = messages
      .filter(m => m.content && m.content.trim() !== '')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: buildSystemPrompt(academyContext),
        tools: TOOLS,
        messages: apiMessages,
      }),
    })

    if (!response.ok) {
      console.error('[academy-chat] API error:', response.status)
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      const result = fallbackResponse(lastUserMsg?.content || '', academyContext)
      return NextResponse.json({ ...result, source: 'fallback' })
    }

    const data = await response.json()
    let text = ''
    const cards: Array<{ type: string; payload: Record<string, unknown> }> = []

    for (const block of data.content || []) {
      if (block.type === 'text') {
        text += block.text
      } else if (block.type === 'tool_use') {
        cards.push(...mapToolCallToCards(block.name, block.input))
      }
    }

    return NextResponse.json({ text: text || undefined, cards: cards.length > 0 ? cards : undefined, source: 'api' })
  } catch (err) {
    console.error('[academy-chat] fetch error:', err)
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    const result = fallbackResponse(lastUserMsg?.content || '', academyContext)
    return NextResponse.json({ ...result, source: 'fallback' })
  }
}
