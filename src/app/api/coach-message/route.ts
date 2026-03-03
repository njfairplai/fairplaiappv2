import { NextResponse } from 'next/server'

const FALLBACK_MESSAGE =
  "Kiyan, what a match today — your engine was absolutely on fire! Covering 7.4km and hitting 14 sprints is elite output for a U12 midfielder, and it showed in how you dominated the second half. Your goal and two assists demonstrate exactly the kind of decisive, box-to-box impact we've been building towards all season. This week in training, let's focus on your first touch under pressure — if you can tighten that up, your control score will jump and you'll be even harder to handle in tight spaces."

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  let playerData
  try {
    playerData = await request.json()
  } catch {
    playerData = {}
  }

  if (!apiKey) {
    return NextResponse.json({ message: FALLBACK_MESSAGE, source: 'fallback' })
  }

  try {
    const playerInfo = playerData.playerId
      ? 'Player: Kiyan Makkawi, Age 12, Position: Central Midfielder. Match vs Al Wasl Academy. Stats: Composite score 81/100, Distance 7.4km (season avg 6.8km, +9%), Top speed 27.3 km/h (season avg 25.1, +8%), Sprint count 14 (season avg 11, +27%), Pass completion 73% (season avg 71%), Dribble success 68%. Category grades: Physical A, Positional B+, Passing B, Dribbling B, Control B-, Defending B. Training attendance this term: 11 of 12 sessions attended. Last training session focus: pressing triggers and passing combinations. Training consistency trend: improving (missed 0 of last 6 sessions).'
      : JSON.stringify(playerData)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system:
          'You are an encouraging youth football coach writing a brief personal performance message to a player and their parent after a match. Write in second person addressing the player directly. Be warm, specific, and constructive. Keep it to 3-4 sentences. End with one specific thing to work on. Reference both match stats and training attendance/consistency where relevant. Do not use generic praise — reference the specific stats provided.',
        messages: [
          {
            role: 'user',
            content: `${playerInfo} Write a post-match message for this player.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[coach-message] API error:', response.status)
      return NextResponse.json({ message: FALLBACK_MESSAGE, source: 'fallback' })
    }

    const data = await response.json()
    const message = data?.content?.[0]?.text ?? FALLBACK_MESSAGE
    return NextResponse.json({ message, source: 'api' })
  } catch (err) {
    console.error('[coach-message] fetch error:', err)
    return NextResponse.json({ message: FALLBACK_MESSAGE, source: 'fallback' })
  }
}

export async function GET() {
  return NextResponse.json({ message: FALLBACK_MESSAGE, source: 'fallback' })
}
