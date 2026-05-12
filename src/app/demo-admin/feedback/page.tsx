import { sql } from '@vercel/postgres'
import { FeedbackView, type FeedbackRow } from './FeedbackView'

export const dynamic = 'force-dynamic'

async function fetchRows(): Promise<{ rows: FeedbackRow[]; error: string | null }> {
  if (!process.env.POSTGRES_URL) {
    return { rows: [], error: 'POSTGRES_URL not configured on this environment.' }
  }
  try {
    const { rows } = await sql<FeedbackRow>`
      SELECT id, created_at, palette_vote, responses, whats_missing,
             role, email, dwell_seconds, user_agent, referrer
      FROM feedback_responses
      ORDER BY created_at DESC
      LIMIT 200
    `
    return { rows, error: null }
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : 'Database error' }
  }
}

export default async function DemoAdminFeedbackPage() {
  const { rows, error } = await fetchRows()

  return <FeedbackView rows={rows} error={error} />
}
