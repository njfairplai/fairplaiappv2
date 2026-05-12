/**
 * Single source of truth for the user-testing feedback questions.
 * Both PortalFeedbackForm (data in) and FeedbackView/Tally (data out) read
 * from here so a question can never be asked but never displayed, or vice
 * versa.
 *
 * The shape ALSO defines the JSONB shape under feedback_responses.responses
 * — when adding a new question, append it here and the form + viewer pick
 * it up automatically. Old rows that don't have the new key just render
 * with a "—" placeholder.
 */

export type Role = 'coach' | 'parent' | 'other'

export const ROLE_TEXT: Record<Role, { trust: string; intent: string; nps: string }> = {
  coach: {
    trust: "my squad's",
    intent: 'your team',
    nps: 'another coach',
  },
  parent: {
    trust: "my kid's",
    intent: "your kid's club",
    nps: 'another parent',
  },
  other: {
    trust: 'sensitive',
    intent: 'your work',
    nps: 'someone in football',
  },
}

export function resolveRole(raw: string | null | undefined): Role {
  if (raw === 'coach' || raw === 'academy_admin') return 'coach'
  if (raw === 'parent' || raw === 'player') return 'parent'
  return 'other'
}

export type LikertQuestion = {
  kind: 'likert'
  /** key under responses (or top-level for whats_missing); dotted for nested keys like 'feel.professional' */
  key: string
  /** static or role-templated label; if a function, called with the resolved role */
  label: string | ((role: Role) => string)
  /** display name in tally view (short) */
  short: string
  required: boolean
}

export type IntentQuestion = {
  kind: 'intent'
  key: 'intent'
  label: (role: Role) => string
  short: string
  required: boolean
}

export type NpsQuestion = {
  kind: 'nps'
  key: 'nps'
  label: (role: Role) => string
  short: string
  required: boolean
}

export type ChipsQuestion = {
  kind: 'chips'
  key: string
  label: string
  short: string
  required: boolean
  /** if set, max selections */
  max?: number
  /** colour: 'positive' for favourites, 'negative' for kill list */
  tone: 'positive' | 'negative'
}

export type OpenQuestion = {
  kind: 'open'
  key: string
  label: string
  short: string
  required: boolean
  /** placeholder for the textarea */
  placeholder?: string
}

export type Question =
  | LikertQuestion
  | IntentQuestion
  | NpsQuestion
  | ChipsQuestion
  | OpenQuestion

/** Section labels — drives the eyebrow text above each block in the form. */
export const SECTIONS = {
  comprehension: 'SECTION B · COMPREHENSION',
  feel: 'SECTION C · OVERALL FEEL',
  features: 'SECTION D · FAVOURITES',
  killList: 'SECTION E · KILL LIST',
  intent: 'SECTION F · INTENT',
  nps: 'SECTION G · RECOMMENDATION',
  surprise: 'SECTION H · SURPRISE',
  missing: 'SECTION I · ANYTHING ELSE',
  about: 'SECTION J · ABOUT YOU',
} as const

/** Feature keys + display labels — used for both favourite + kill questions. */
export const FEATURES = [
  { key: 'match_in_numbers', label: 'Match in Numbers (stat bars)' },
  { key: 'timeline', label: 'Timeline of moments' },
  { key: 'clip', label: 'Clip + Key Stats panel' },
  { key: 'squad', label: 'Squad table' },
  { key: 'player_detail', label: 'Per-player detail panel' },
  { key: 'recap', label: 'Match recap (WhatsApp share)' },
  { key: 'watch_match', label: 'Watch full match link' },
] as const

export const FEATURE_LABEL: Record<string, string> = Object.fromEntries(
  FEATURES.map(f => [f.key, f.label]),
)

/** Comprehension trio — comes first in the form, the most diagnostic signal. */
export const COMPREHENSION_QUESTIONS: LikertQuestion[] = [
  {
    kind: 'likert',
    key: 'tour_clarity',
    label: 'The tour made the value clear to me.',
    short: 'Tour clear',
    required: true,
  },
  {
    kind: 'likert',
    key: 'mikel_understood',
    label: 'I understood what Mikel does.',
    short: 'Mikel',
    required: true,
  },
  {
    kind: 'likert',
    key: 'score_understood',
    label: 'The composite player score made sense.',
    short: 'Score',
    required: true,
  },
]

/** Feel pair — visual quality. Dropped 'scan' (weak signal). */
export const FEEL_QUESTIONS: LikertQuestion[] = [
  {
    kind: 'likert',
    key: 'feel.professional',
    label: 'The design looks professional.',
    short: 'Professional',
    required: true,
  },
  {
    kind: 'likert',
    key: 'feel.trust',
    label: role => `I'd trust this with ${ROLE_TEXT[role].trust} data.`,
    short: 'Trust',
    required: true,
  },
]

export const FAVOURITE_QUESTION: ChipsQuestion = {
  kind: 'chips',
  key: 'favourite_features',
  label: 'Which features would you actually use?',
  short: 'Favourites',
  required: true,
  max: 3,
  tone: 'positive',
}

export const KILL_QUESTION: ChipsQuestion = {
  kind: 'chips',
  key: 'kill_features',
  label: 'Which features felt unnecessary or confusing?',
  short: 'Kill',
  required: false,
  tone: 'negative',
}

export const INTENT_QUESTION: IntentQuestion = {
  kind: 'intent',
  key: 'intent',
  label: role => `Would you actually use this with ${ROLE_TEXT[role].intent}?`,
  short: 'Intent',
  required: true,
}

export const NPS_QUESTION: NpsQuestion = {
  kind: 'nps',
  key: 'nps',
  label: role => `How likely are you to recommend Fairplai to ${ROLE_TEXT[role].nps}?`,
  short: 'NPS',
  required: true,
}

export const SURPRISE_QUESTION: OpenQuestion = {
  kind: 'open',
  key: 'surprise',
  label: "What's the one feature that surprised you most?",
  short: 'Surprise',
  required: false,
  placeholder: 'Something you didn\'t expect, in a good or bad way…',
}

export const MISSING_QUESTION: OpenQuestion = {
  kind: 'open',
  key: 'whats_missing',
  label: "What's missing or what would you change?",
  short: 'Missing',
  required: false,
  placeholder: "Features, info, interactions you'd want to see…",
}

export const ROLES = [
  { value: '', label: 'Pick one (optional)' },
  { value: 'coach', label: 'Coach' },
  { value: 'academy_admin', label: 'Academy admin' },
  { value: 'parent', label: 'Parent' },
  { value: 'player', label: 'Player' },
  { value: 'analyst', label: 'Performance analyst' },
  { value: 'tech', label: 'Tech / engineering' },
  { value: 'other', label: 'Other' },
]

/** All questions in display order — the viewer iterates this for the cards
 *  view so structure is consistent regardless of which fields the response
 *  filled. */
export const QUESTION_ORDER: Question[] = [
  ...COMPREHENSION_QUESTIONS,
  ...FEEL_QUESTIONS,
  FAVOURITE_QUESTION,
  KILL_QUESTION,
  INTENT_QUESTION,
  NPS_QUESTION,
  SURPRISE_QUESTION,
  MISSING_QUESTION,
]

export type IntentValue = 'yes' | 'maybe' | 'no'

export const INTENT_OPTIONS: { value: IntentValue; label: string; tone: 'positive' | 'neutral' | 'negative' }[] = [
  { value: 'yes', label: 'Yes', tone: 'positive' },
  { value: 'maybe', label: 'Maybe', tone: 'neutral' },
  { value: 'no', label: 'No', tone: 'negative' },
]

/** Look up a value from a row's responses object using a dotted key like
 *  'feel.professional'. Returns undefined if the path doesn't exist. */
export function readKey(responses: Record<string, unknown> | null | undefined, key: string): unknown {
  if (!responses) return undefined
  const parts = key.split('.')
  let cur: unknown = responses
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return cur
}

/** Resolve a question's display label given the row's role context. */
export function questionLabel(q: Question, role: Role): string {
  if (typeof q.label === 'function') return q.label(role)
  return q.label
}
