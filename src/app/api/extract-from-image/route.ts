import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'AI extraction is not configured. Please use CSV upload instead.' }, { status: 503 })
  }

  let body: { image: string; mediaType: string; type: 'players' | 'program' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { image, mediaType, type } = body

  if (!image || !type) {
    return NextResponse.json({ error: 'Missing image or type.' }, { status: 400 })
  }

  const systemPrompt = type === 'players'
    ? `You are a data extraction assistant for a youth football academy. Extract player information from the image.
Return a JSON object with a "players" array. Each player should have: firstName, lastName, guardianEmail (if visible), position (if visible), jerseyNumber (if visible).
If a field is not visible, omit it or set it to empty string.
Only return valid JSON, no markdown or explanation.
Example: {"players": [{"firstName": "Ali", "lastName": "Hassan", "guardianEmail": "", "position": "CM", "jerseyNumber": "7"}]}`
    : `You are a data extraction assistant for a youth football academy. Extract training program/schedule information from the image.
Return a JSON object with a "program" key containing: name (program name), daysOfWeek (array like ["Mon","Wed","Fri"]), startTime (like "17:00"), sessionLength (in minutes as string like "90"), termStart (YYYY-MM-DD if visible), termEnd (YYYY-MM-DD if visible).
If a field is not visible, use reasonable defaults.
Only return valid JSON, no markdown or explanation.
Example: {"program": {"name": "U12 Training", "daysOfWeek": ["Mon", "Wed"], "startTime": "17:00", "sessionLength": "90", "termStart": "", "termEnd": ""}}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: image,
                },
              },
              {
                type: 'text',
                text: type === 'players'
                  ? 'Extract all player information from this image. Return JSON only.'
                  : 'Extract the training program/schedule details from this image. Return JSON only.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[extract-from-image] API error:', response.status)
      return NextResponse.json({ error: 'AI extraction failed. Try a clearer image or use CSV.' }, { status: 500 })
    }

    const data = await response.json()
    const textContent = data.content?.find((c: { type: string }) => c.type === 'text')?.text || ''

    // Parse JSON from response (handle possible markdown wrapping)
    let parsed: Record<string, unknown>
    try {
      const jsonStr = textContent.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch {
      console.error('[extract-from-image] Failed to parse JSON:', textContent)
      return NextResponse.json({ error: 'Could not parse extracted data. Try a clearer image.' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[extract-from-image] Error:', err)
    return NextResponse.json({ error: 'Extraction failed. Please try again.' }, { status: 500 })
  }
}
