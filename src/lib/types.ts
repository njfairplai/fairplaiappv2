export type UserRole = 'super_admin' | 'facility_admin' | 'academy_admin' | 'coach' | 'parent' | 'player'

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
  guardianEmail?: string
  inviteStatus?: 'pending' | 'sent' | 'completed'
  inviteToken?: string
}

export interface PlayerProfile {
  nationality?: string
  passportId?: string
  schoolName?: string
  previousClub?: string
  kitSize?: string
  medicalNotes?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  mediaConsent?: boolean
  medicalConsent?: boolean
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
  relationship?: 'parent' | 'legal_guardian'
  onboardingComplete?: boolean
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
  status: 'scheduled' | 'in_progress' | 'complete' | 'processing' | 'analysed' | 'playback_ready'
  processingStatusId?: string
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

// ─── WORKLOAD & INJURY RISK ──────────────────────────────
export interface PlayerWorkload {
  playerId: string
  weeklyLoads: number[] // Last 8 weeks (index 0 = oldest)
  minutesLast7: number
  minutesLast28: number
  intensityAvg: number // 1-10
  restDaysLast7: number
  injuryHistory: Array<{ date: string; type: string; daysOut: number }>
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

// ─── RATE HISTORY ────────────────────────────────────────
export interface RateChange {
  date: string
  rate: number
  currency: 'AED' | 'SAR'
  reason: string
}

// ─── BENCHMARKING ────────────────────────────────────────
export type BenchmarkGroup = 'academy' | 'position' | 'age_group'

export interface BenchmarkAverage {
  metric: string
  playerValue: number
  groupAverage: number
  groupLabel: string
}

// ─── PROCESSING PIPELINE ────────────────────────────────

export type ProcessingStage =
  | 'nvr_capture'
  | 'ingestion'
  | 'calibration'
  | 'player_tracking'
  | 'ball_tracking'
  | 'event_detection'
  | 'metric_computation'
  | 'highlights'
  | 'composite_score'
  | 'delivery'

export interface ProcessingStageStatus {
  name: ProcessingStage
  label: string
  status: 'complete' | 'in_progress' | 'pending'
  duration?: string
  startedAt?: string
}

export interface ProcessingStatus {
  sessionId: string
  stage: ProcessingStage
  progress: number
  eta: string
  startedAt: string
  stages: ProcessingStageStatus[]
}

// ─── HEATMAP ────────────────────────────────────────────

export interface HeatmapPoint {
  x: number
  y: number
  intensity: number
}

export interface PlayerHeatmapData {
  sessionId: string
  playerId: string
  positionLabel: string
  points: HeatmapPoint[]
  averagePosition: { x: number; y: number }
}

// ─── EVENT TIMELINE ─────────────────────────────────────

export interface TimelineEvent {
  highlightId: string
  playerId: string
  eventType: 'goal' | 'key_pass' | 'sprint_recovery' | 'tackle' | 'save'
  timestampSeconds: number
  confidence: number
  pitchX?: number
  pitchY?: number
}

// ─── SEASON REVIEW ───────────────────────────────────────
export interface SeasonReviewData {
  playerId: string
  seasonLabel: string
  matchesPlayed: number
  totalMinutes: number
  avgScore: number
  peakScore: number
  goalsAndAssists: number
  bestMatch: { opponent: string; score: number; date: string }
  improvementAreas: string[]
  strengthAreas: string[]
  highlightCount: number
}

// ─── COMMAND CENTRE CHAT ────────────────────────────────

export type ChatMessageRole = 'assistant' | 'user'

export type ChatCardType =
  | 'action_chips'
  | 'inline_form'
  | 'stat_card'
  | 'progress_card'
  | 'confirmation'
  | 'entity_list'
  | 'csv_import'
  | 'choice_card'
  | 'smart_upload'

export interface ChatCard {
  type: ChatCardType
  payload: Record<string, unknown>
}

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  text?: string
  cards?: ChatCard[]
  timestamp: number
}

export type SetupStep =
  | 'roster_created'
  | 'coach_added'
  | 'players_added'
  | 'session_scheduled'
  | 'program_created'
  | 'credits_checked'

export interface SetupProgress {
  completedSteps: SetupStep[]
  totalSteps: number
}

export type AgentAction =
  | 'add_player'
  | 'add_coach'
  | 'create_roster'
  | 'schedule_session'
  | 'add_program'
  | 'import_csv'
  | 'bulk_import'
  | 'view_stats'
  | 'check_credits'
  | 'list_players'
  | 'list_rosters'
  | 'list_coaches'
  | 'list_sessions'
  | 'list_programs'

// Coach Hub types
export type CoachChatCardType =
  | 'action_chips'
  | 'stat_card'
  | 'player_card'
  | 'alert_card'
  | 'review_prompt'
  | 'player_list'

export type CoachAgentAction =
  | 'view_squad'
  | 'analyze_player'
  | 'check_schedule'
  | 'review_session'
  | 'create_idp'
  | 'view_stats'

export interface CoachChatCard {
  type: CoachChatCardType
  payload: Record<string, unknown>
}

export interface CoachChatMessage {
  id: string
  role: ChatMessageRole
  text?: string
  cards?: CoachChatCard[]
  timestamp: number
}

// ─── SESSION PREP (Coach → Player) ──────────────────────

export interface SessionPrep {
  sessionId: string
  squadSize: number
  formationId: string
  lineup: Record<number, string> // position index → playerId
  playingStyle: string
  setPieces: string
  tacticalNotes: string
  drillIds: string[] // for training sessions
  createdAt: string
}

export interface DrillInfo {
  id: string
  name: string
  category: string
  duration: string
  difficulty: string
  players: string
  setup: string
  description: string
  coachingPoints: string[]
  variations: string[]
  targetSkills: string[]
}
