export type UserRole = 'facility_admin' | 'academy_admin' | 'coach' | 'parent' | 'player'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  academyId?: string
  facilityId?: string
}

export interface Academy {
  id: string
  name: string
  logo: string
  type: 'private' | 'school' | 'club'
  primaryContact: string
  timezone: string
  creditBalance: number
  subscriptionTier: 'development' | 'competitive' | 'elite'
}

export interface Facility {
  id: string
  name: string
  logo: string
  pitchCount: number
  location: string
}

export interface Pitch {
  id: string
  facilityId: string
  name: string
  type: '11v11' | '7v7' | '5v5'
  cameraStatus: 'active' | 'inactive' | 'calibrating'
}

export interface Roster {
  id: string
  academyId: string
  name: string
  ageGroup: string
  gender: 'male' | 'female' | 'mixed'
  type: 'development' | 'competitive' | 'elite'
  coachId: string
  teamPhoto?: string
}

export interface Player {
  id: string
  academyId: string
  firstName: string
  lastName: string
  photo?: string
  dateOfBirth: string
  position: string[]
  jerseyNumber: number
  dominantFoot: 'left' | 'right' | 'both'
  status: 'active' | 'injured' | 'inactive'
  parentIds: string[]
}

export interface Coach {
  id: string
  academyId: string
  name: string
  email: string
  photo?: string
  rosterIds: string[]
}

export interface Parent {
  id: string
  name: string
  email: string
  phone?: string
  whatsappVerified: boolean
  playerIds: string[]
}

export interface Session {
  id: string
  facilityId: string
  pitchId: string
  academyId: string
  rosterId: string
  date: string
  startTime: string
  endTime: string
  type: 'match' | 'drill' | 'training_match'
  status: 'scheduled' | 'in_progress' | 'complete' | 'analysed' | 'playback_ready'
  opponent?: string
  competition?: string
  creditsConsumed?: number
  programId?: string
  participatingPlayerIds: string[]
  aiMatchConfidence?: number
  autoTriggeredAnalysis?: boolean
  isAdHoc?: boolean
  tournamentFixtureId?: string
}

export interface MatchAnalysis {
  id: string
  sessionId: string
  playerId: string
  compositeScore: number
  physicalScore: number
  positionalScore: number
  passingScore: number
  dribblingScore: number
  controlScore: number
  defendingScore: number
  distanceCovered: number
  topSpeed: number
  sprintCount: number
  passCompletion: number
  dribbleSuccess: number
  highlights: Highlight[]
}

export type HighlightPrivacy = 'parent_visible' | 'team_only' | 'coach_only'

export interface Highlight {
  id: string
  sessionId: string
  playerId: string
  eventType: 'goal' | 'key_pass' | 'sprint_recovery' | 'tackle' | 'save'
  timestampSeconds: number
  durationSeconds: number
  thumbnailUrl?: string
  clipUrl?: string
  releasedToParent: boolean
  confidence: number
  privacy: HighlightPrivacy
  sharedLinkExpiry?: string
  watermarkEnabled: boolean
  squadId: string
  aiConfidence: number
  flaggedByCoach: boolean
}

export interface SessionSegment {
  id: string
  sessionId: string
  startSeconds: number
  endSeconds: number
  aiClassification: 'match' | 'drill' | 'uncertain'
  aiConfidence: number
  coachConfirmation?: 'match' | 'drill'
}

export interface LeaseContract {
  id: string
  facilityId: string
  academyId: string
  pitchId: string
  dayOfWeek: number[]
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  ratePerSession: number
  currency: 'AED' | 'SAR'
  status: 'active' | 'expiring_soon' | 'expired'
}

export interface LeaseContractWithSessions extends LeaseContract {
  generatedSessionIds: string[]
}

export interface Program {
  id: string
  academyId: string
  rosterId: string
  name: string
  daysOfWeek: number[]
  startTime: string
  sessionLengthMinutes: number
  termStart: string
  termEnd: string
  sessionsGenerated: number
  pitchId: string
}

export interface Bookmark {
  id: string
  sessionId: string
  timestampSeconds: number
  label: string
  createdAt: string
}

export interface ConsentRecord {
  userId: string
  policyVersion: string
  acceptedAt: string
  parentalConsent: boolean
}

export interface TournamentPlaceholder {
  id: string
  name: string
  startDate: string
  endDate: string
  location: string
  rosterIds: string[]
}

export interface TournamentFixture {
  id: string
  tournamentId: string
  tournamentName: string
  round: string
  opponent: string
  venue: string
  date: string
  startTime: string
  endTime: string
  rosterId: string
  sessionId?: string
}

export type DVRFilter = 'all' | 'by_squad' | 'by_player'

export interface Notification {
  id: string
  userId: string
  type: 'match_analysed' | 'highlights_ready' | 'weekly_summary' | 'session_reminder' | 'credit_low'
  title: string
  body: string
  read: boolean
  createdAt: string
  channel: 'in_app' | 'whatsapp' | 'email'
}

export interface CategoryGrade {
  category: string
  grade: string
  gradeColor: string
  label: string
  score: number
  subMetrics: string[]
}

export interface PercentileItem {
  metric: string
  percentile: number
  topPct: string
}

export interface SeasonProgressPoint {
  match: string
  score: number
}

export interface RadarDataItem {
  category: string
  score: number
  avg: number
}

export interface MatchRecord {
  id: number
  day: number
  month: string
  opponent: string
  competition: string
  duration: string
  score: number
  tier: 'green' | 'amber' | 'red'
  type: 'match' | 'training'
}

export interface HighlightClip {
  id: number
  title: string
  subtitle: string
  duration: string
  label: string
  eventType: string
  minute: string
  color: string
}

export interface CoachFlaggedClip {
  id: string
  highlightId: string
  playerId: string
  parentId: string
  coachId: string
  coachNote?: string
  sessionDate: string
  eventType: string
  createdAt: string
  viewed: boolean
}

export interface PendingReviewSegment {
  id: string
  label: string
  startMin: number
  endMin: number
  aiClassification: 'match' | 'drill' | 'uncertain'
  confidence: number
}

export interface PendingPlayerTag {
  boundingBoxId: string
  jerseyNumber: string
  suggestedPlayerId: string | null
  confidence: number
}

export interface PendingReviewItem {
  id: string
  type: 'classify' | 'tag'
  sessionId: string
  sessionDate: string
  sessionLabel: string
  aiConfidence?: number
  segments?: PendingReviewSegment[]
  playersToTag?: PendingPlayerTag[]
  totalPlayers?: number
  autoTaggedCount?: number
}

export type PositionGroup = 'goalkeeper' | 'defender' | 'midfielder' | 'forward'

export interface SeasonStat {
  label: string
  value: string
}

export interface PlayerSeasonStats {
  playerId: string
  positionGroup: PositionGroup
  stats: SeasonStat[]
}

export interface CoachFeedback {
  id: string
  playerId: string
  coachId: string
  date: string
  attitude: number
  effort: number
  coachability: number
  sportsmanship: number
  summary: string
  sessionsSinceLastFeedback: number
}
