import type {
  User, Academy, Facility, Pitch, Roster, Player, Coach, Parent,
  Session, MatchAnalysis, Highlight, SessionSegment, LeaseContract,
  Notification, CategoryGrade, PercentileItem, SeasonProgressPoint,
  RadarDataItem, MatchRecord, HighlightClip, Program, Bookmark,
  TournamentPlaceholder, TournamentFixture, CoachFlaggedClip, PendingReviewItem,
  PlayerSeasonStats,
  CoachFeedback,
  PlayerWorkload,
  RateChange,
  BenchmarkAverage,
  SeasonReviewData,
  ProcessingStatus,
  PlayerHeatmapData,
  SessionPrep,
  DrillInfo,
} from './types'

// ─── FACILITIES ────────────────────────────────────────────
export const facilities: Facility[] = [
  {
    id: 'facility_001',
    name: 'SportPlex Jeddah',
    logo: '/logos/mak-academy.jpeg',
    pitchCount: 4,
    location: 'Al Rawdah District, Jeddah, Saudi Arabia',
  },
]

// ─── PITCHES ───────────────────────────────────────────────
export const pitches: Pitch[] = [
  { id: 'pitch_001', facilityId: 'facility_001', name: 'Pitch 1 — Main', type: '11v11', cameraStatus: 'active' },
  { id: 'pitch_002', facilityId: 'facility_001', name: 'Pitch 2 — Training', type: '7v7', cameraStatus: 'active' },
  { id: 'pitch_003', facilityId: 'facility_001', name: 'Pitch 3 — Academy', type: '5v5', cameraStatus: 'calibrating' },
  { id: 'pitch_004', facilityId: 'facility_001', name: 'Pitch 4 — Indoor', type: '5v5', cameraStatus: 'inactive' },
]

// ─── ACADEMIES ─────────────────────────────────────────────
export const academies: Academy[] = [
  {
    id: 'academy_001',
    name: 'MAK Academy',
    logo: '/logos/mak-academy.jpeg',
    type: 'private',
    primaryContact: 'Tariq Makkawi',
    timezone: 'Asia/Riyadh',
    creditBalance: 47,
    subscriptionTier: 'competitive',
  },
  {
    id: 'academy_002',
    name: 'Desert Eagles FC',
    logo: '/logos/mak-academy.jpeg',
    type: 'club',
    primaryContact: 'Omar Al-Rashid',
    timezone: 'Asia/Dubai',
    creditBalance: 23,
    subscriptionTier: 'development',
  },
]

// ─── COACHES ───────────────────────────────────────────────
export const coaches: Coach[] = [
  {
    id: 'coach_001',
    academyId: 'academy_001',
    name: 'Marcus Silva',
    email: 'coach@makacademy.com',
    rosterIds: ['roster_001', 'roster_002'],
  },
  {
    id: 'coach_002',
    academyId: 'academy_001',
    name: 'Ahmed Farouk',
    email: 'ahmed@makacademy.com',
    rosterIds: ['roster_001'],
  },
  {
    id: 'coach_003',
    academyId: 'academy_002',
    name: 'Khalid Al-Mutairi',
    email: 'khalid@deserteagles.com',
    rosterIds: ['roster_003'],
  },
]

// ─── ROSTERS ───────────────────────────────────────────────
export const rosters: Roster[] = [
  {
    id: 'roster_001',
    academyId: 'academy_001',
    name: 'MAK U12 Red',
    ageGroup: 'U12',
    gender: 'male',
    type: 'competitive',
    coachId: 'coach_001',
    teamPhoto: '/players/teamphoto.jpg',
  },
  {
    id: 'roster_002',
    academyId: 'academy_001',
    name: 'MAK U14 Blue',
    ageGroup: 'U14',
    gender: 'male',
    type: 'elite',
    coachId: 'coach_001',
  },
  {
    id: 'roster_003',
    academyId: 'academy_002',
    name: 'Desert Eagles U12',
    ageGroup: 'U12',
    gender: 'mixed',
    type: 'development',
    coachId: 'coach_003',
  },
]

// ─── PLAYERS ───────────────────────────────────────────────
const u12RedPlayerIds = ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008']
const u14BluePlayerIds = ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016']

export const players: Player[] = [
  // MAK U12 Red — 8 players with specified names/positions/scores
  { id: 'player_001', academyId: 'academy_001', firstName: 'Kiyan', lastName: 'Makkawi', photo: '/players/kiyan.jpg', dateOfBirth: '2014-03-15', position: ['CM'], jerseyNumber: 7, dominantFoot: 'right', status: 'active', parentIds: ['parent_001'] },
  { id: 'player_002', academyId: 'academy_001', firstName: 'Ahmed', lastName: 'Hassan', photo: '/players/ahmed.jpg', dateOfBirth: '2014-06-22', position: ['ST'], jerseyNumber: 9, dominantFoot: 'left', status: 'active', parentIds: ['parent_002'] },
  { id: 'player_003', academyId: 'academy_001', firstName: 'Omar', lastName: 'Al Rashidi', photo: '/players/omar.jpg', dateOfBirth: '2014-01-10', position: ['CB'], jerseyNumber: 4, dominantFoot: 'right', status: 'active', parentIds: ['parent_003'] },
  { id: 'player_004', academyId: 'academy_001', firstName: 'Saeed', lastName: 'Khalifa', photo: '/players/saeed.jpg', dateOfBirth: '2014-08-05', position: ['RW'], jerseyNumber: 11, dominantFoot: 'left', status: 'active', parentIds: ['parent_004'] },
  { id: 'player_005', academyId: 'academy_001', firstName: 'Hamdan', lastName: 'Al Mazrouei', photo: '/players/hamdan.jpg', dateOfBirth: '2014-11-18', position: ['GK'], jerseyNumber: 1, dominantFoot: 'right', status: 'active', parentIds: ['parent_005'] },
  { id: 'player_006', academyId: 'academy_001', firstName: 'Faisal', lastName: 'Al Nuaimi', photo: '/players/faisal.jpg', dateOfBirth: '2014-04-30', position: ['LB'], jerseyNumber: 3, dominantFoot: 'left', status: 'active', parentIds: ['parent_006'] },
  { id: 'player_007', academyId: 'academy_001', firstName: 'Zayed', lastName: 'Al Mansoori', photo: '/players/zayed.jpg', dateOfBirth: '2014-09-14', position: ['CM'], jerseyNumber: 8, dominantFoot: 'both', status: 'active', parentIds: ['parent_007'] },
  { id: 'player_008', academyId: 'academy_001', firstName: 'Rashid', lastName: 'Al Shamsi', dateOfBirth: '2014-07-25', position: ['RB'], jerseyNumber: 2, dominantFoot: 'right', status: 'active', parentIds: ['parent_008'] },

  // MAK U14 Blue
  { id: 'player_009', academyId: 'academy_001', firstName: 'Zain', lastName: 'Al-Dosari', dateOfBirth: '2012-02-14', position: ['CF', 'SS'], jerseyNumber: 10, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_010', academyId: 'academy_001', firstName: 'Tariq', lastName: 'Mansour', dateOfBirth: '2012-05-20', position: ['CB'], jerseyNumber: 5, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_011', academyId: 'academy_001', firstName: 'Ibrahim', lastName: 'Sharif', dateOfBirth: '2012-09-01', position: ['CM'], jerseyNumber: 8, dominantFoot: 'left', status: 'active', parentIds: [] },
  { id: 'player_012', academyId: 'academy_001', firstName: 'Majed', lastName: 'Al-Shehri', dateOfBirth: '2012-12-11', position: ['LB'], jerseyNumber: 3, dominantFoot: 'left', status: 'active', parentIds: [] },
  { id: 'player_013', academyId: 'academy_001', firstName: 'Nasser', lastName: 'Bin Hamad', dateOfBirth: '2012-03-27', position: ['RW'], jerseyNumber: 7, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_014', academyId: 'academy_001', firstName: 'Waleed', lastName: 'Khatib', dateOfBirth: '2012-07-08', position: ['GK'], jerseyNumber: 1, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_015', academyId: 'academy_001', firstName: 'Bilal', lastName: 'Al-Rashidi', dateOfBirth: '2012-10-19', position: ['CDM'], jerseyNumber: 6, dominantFoot: 'right', status: 'injured', parentIds: [] },
  { id: 'player_016', academyId: 'academy_001', firstName: 'Sami', lastName: 'Habibi', dateOfBirth: '2012-01-03', position: ['LW'], jerseyNumber: 11, dominantFoot: 'left', status: 'active', parentIds: [] },

  // Desert Eagles U12
  { id: 'player_017', academyId: 'academy_002', firstName: 'Layla', lastName: 'Al-Maktoum', dateOfBirth: '2014-04-12', position: ['CF'], jerseyNumber: 9, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_018', academyId: 'academy_002', firstName: 'Rayan', lastName: 'Siddiqui', dateOfBirth: '2014-06-30', position: ['CM'], jerseyNumber: 8, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_019', academyId: 'academy_002', firstName: 'Amira', lastName: 'Hassan', dateOfBirth: '2014-02-18', position: ['CB'], jerseyNumber: 4, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_020', academyId: 'academy_002', firstName: 'Sultan', lastName: 'Al-Nuaimi', dateOfBirth: '2014-08-22', position: ['GK'], jerseyNumber: 1, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_021', academyId: 'academy_002', firstName: 'Mariam', lastName: 'Qasim', dateOfBirth: '2014-11-05', position: ['LW'], jerseyNumber: 11, dominantFoot: 'left', status: 'active', parentIds: [] },
  { id: 'player_022', academyId: 'academy_002', firstName: 'Khalid', lastName: 'Bin Zayed', dateOfBirth: '2014-01-28', position: ['RB'], jerseyNumber: 2, dominantFoot: 'right', status: 'active', parentIds: [] },
  { id: 'player_023', academyId: 'academy_002', firstName: 'Noura', lastName: 'Al-Suwaidi', dateOfBirth: '2014-07-14', position: ['AM'], jerseyNumber: 10, dominantFoot: 'both', status: 'active', parentIds: [] },
  { id: 'player_024', academyId: 'academy_002', firstName: 'Fahad', lastName: 'Othman', dateOfBirth: '2014-10-09', position: ['CDM'], jerseyNumber: 6, dominantFoot: 'right', status: 'active', parentIds: [] },
]

// ─── PARENTS ───────────────────────────────────────────────
export const parents: Parent[] = [
  { id: 'parent_001', name: 'Tariq Makkawi', email: 'parent@makacademy.com', phone: '+971501234567', whatsappVerified: true, playerIds: ['player_001'] },
  { id: 'parent_002', name: 'Sara Hassan', email: 'sara@email.com', phone: '+971502345678', whatsappVerified: true, playerIds: ['player_002'] },
  { id: 'parent_003', name: 'Mohamed Al Rashidi', email: 'mrashidi@email.com', phone: '+971503456789', whatsappVerified: false, playerIds: ['player_003'] },
  { id: 'parent_004', name: 'Fatima Khalifa', email: 'fkhalifa@email.com', whatsappVerified: true, playerIds: ['player_004'] },
  { id: 'parent_005', name: 'Abdullah Al Mazrouei', email: 'amazrouei@email.com', whatsappVerified: false, playerIds: ['player_005'] },
  { id: 'parent_006', name: 'Nouf Al Nuaimi', email: 'nnuaimi@email.com', phone: '+971506789012', whatsappVerified: true, playerIds: ['player_006'] },
  { id: 'parent_007', name: 'Hamed Al Mansoori', email: 'hmansoori@email.com', whatsappVerified: false, playerIds: ['player_007'] },
  { id: 'parent_008', name: 'Aisha Al Shamsi', email: 'ashamsi@email.com', phone: '+971508901234', whatsappVerified: true, playerIds: ['player_008'] },
]

// ─── PROGRAMS ─────────────────────────────────────────────
export const programs: Program[] = [
  {
    id: 'program_001',
    academyId: 'academy_001',
    rosterId: 'roster_001',
    name: 'U12 Red — Spring Term 2026',
    daysOfWeek: [2, 4], // Tue, Thu
    startTime: '17:00',
    sessionLengthMinutes: 120,
    termStart: '2026-01-06',
    termEnd: '2026-04-30',
    sessionsGenerated: 34,
    pitchId: 'pitch_002',
  },
  {
    id: 'program_002',
    academyId: 'academy_001',
    rosterId: 'roster_002',
    name: 'U14 Blue — Spring Term 2026',
    daysOfWeek: [1, 3], // Mon, Wed
    startTime: '18:00',
    sessionLengthMinutes: 90,
    termStart: '2026-01-06',
    termEnd: '2026-04-30',
    sessionsGenerated: 34,
    pitchId: 'pitch_001',
  },
  {
    id: 'program_003',
    academyId: 'academy_001',
    rosterId: 'roster_001',
    name: 'U12 Red — Saturday Fixtures',
    daysOfWeek: [6], // Sat
    startTime: '15:00',
    sessionLengthMinutes: 90,
    termStart: '2026-01-10',
    termEnd: '2026-04-25',
    sessionsGenerated: 16,
    pitchId: 'pitch_001',
  },
]

// ─── SESSIONS (12 total) ─────────────────────────────────
export const sessions: Session[] = [
  // 4 drill/training sessions for U12 Red — playback_ready
  { id: 'session_001', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-10', startTime: '17:00', endTime: '19:00', type: 'drill', status: 'playback_ready', programId: 'program_001', participatingPlayerIds: [...u12RedPlayerIds] },
  { id: 'session_002', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-12', startTime: '17:00', endTime: '19:00', type: 'drill', status: 'playback_ready', programId: 'program_001', participatingPlayerIds: [...u12RedPlayerIds] },
  { id: 'session_003', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-17', startTime: '17:00', endTime: '19:00', type: 'drill', status: 'playback_ready', programId: 'program_001', participatingPlayerIds: [...u12RedPlayerIds] },
  { id: 'session_004', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-20', startTime: '17:00', endTime: '19:00', type: 'drill', status: 'playback_ready', programId: 'program_001', participatingPlayerIds: [...u12RedPlayerIds] },

  // 4 match sessions for U12 Red — analysed, autoTriggered on 3
  { id: 'session_005', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-07', startTime: '15:00', endTime: '16:30', type: 'match', status: 'analysed', opponent: 'Baniyas SC', competition: 'Friendly', creditsConsumed: 38, programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], aiMatchConfidence: 91, autoTriggeredAnalysis: true },
  { id: 'session_006', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-14', startTime: '15:00', endTime: '16:30', type: 'match', status: 'analysed', opponent: 'Al Ain FC', competition: 'UAE Youth League', creditsConsumed: 42, programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], aiMatchConfidence: 88, autoTriggeredAnalysis: true },
  { id: 'session_007', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-24', startTime: '15:00', endTime: '16:30', type: 'match', status: 'analysed', opponent: 'Al Wasl Academy', competition: 'UAE Youth League', creditsConsumed: 40, programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], aiMatchConfidence: 93, autoTriggeredAnalysis: true },
  { id: 'session_008', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-02-28', startTime: '15:00', endTime: '16:30', type: 'match', status: 'complete', opponent: 'Shabab Al Ahli', competition: 'UAE Youth League', programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], aiMatchConfidence: 72, autoTriggeredAnalysis: false },

  // 2 sessions for U14 Blue
  { id: 'session_009', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_002', date: '2026-02-19', startTime: '18:00', endTime: '19:30', type: 'drill', status: 'playback_ready', programId: 'program_002', participatingPlayerIds: [...u14BluePlayerIds] },
  { id: 'session_010', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_002', date: '2026-02-22', startTime: '15:00', endTime: '16:30', type: 'match', status: 'analysed', opponent: 'Sharjah FC', competition: 'UAE Youth League', creditsConsumed: 35, participatingPlayerIds: [...u14BluePlayerIds], aiMatchConfidence: 90, autoTriggeredAnalysis: true },

  // 1 upcoming training for U12 Red
  { id: 'session_011', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-03-03', startTime: '17:00', endTime: '19:00', type: 'drill', status: 'scheduled', programId: 'program_001', participatingPlayerIds: [...u12RedPlayerIds] },

  // 1 upcoming match for U12 Red
  { id: 'session_012', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-03-07', startTime: '15:00', endTime: '16:30', type: 'match', status: 'scheduled', opponent: 'Dubai SC', competition: 'UAE Youth League', programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds] },

  // 2 past match sessions for U12 Red — for form dots
  { id: 'session_013', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-01-24', startTime: '15:00', endTime: '16:30', type: 'match', status: 'analysed', opponent: 'Sharjah FC', competition: 'UAE Youth League', creditsConsumed: 36, programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], aiMatchConfidence: 87, autoTriggeredAnalysis: true },
  { id: 'session_014', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-01-31', startTime: '15:00', endTime: '16:30', type: 'match', status: 'analysed', opponent: 'Ajman FC', competition: 'Cup', creditsConsumed: 40, programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], aiMatchConfidence: 89, autoTriggeredAnalysis: true },

  // Tournament fixture sessions — UAE U12 Spring Cup
  { id: 'session_015', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-04-15', startTime: '10:00', endTime: '11:30', type: 'match', status: 'scheduled', opponent: 'Al Wahda FC', competition: 'UAE U12 Spring Cup', participatingPlayerIds: [...u12RedPlayerIds], tournamentFixtureId: 'fixture_001' },
  { id: 'session_016', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-04-16', startTime: '14:00', endTime: '15:30', type: 'match', status: 'scheduled', opponent: 'Sharjah Youth', competition: 'UAE U12 Spring Cup', participatingPlayerIds: [...u12RedPlayerIds], tournamentFixtureId: 'fixture_002' },
  { id: 'session_017', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-04-17', startTime: '16:00', endTime: '17:30', type: 'match', status: 'scheduled', opponent: 'Abu Dhabi Stars', competition: 'UAE U12 Spring Cup', participatingPlayerIds: [...u12RedPlayerIds], tournamentFixtureId: 'fixture_003' },

  // Ad hoc session (standalone, not from a program)
  { id: 'session_018', facilityId: 'facility_001', pitchId: 'pitch_003', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-03-10', startTime: '16:00', endTime: '17:30', type: 'drill', status: 'scheduled', participatingPlayerIds: [...u12RedPlayerIds], isAdHoc: true },

  // Processing sessions (pipeline in progress)
  { id: 'session_019', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-03-05', startTime: '15:00', endTime: '16:30', type: 'match', status: 'processing', opponent: 'Al Jazira Youth', competition: 'UAE Youth League', programId: 'program_003', participatingPlayerIds: [...u12RedPlayerIds], processingStatusId: 'proc_001' },
  { id: 'session_020', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-03-04', startTime: '17:00', endTime: '19:00', type: 'drill', status: 'processing', programId: 'program_001', participatingPlayerIds: [...u12RedPlayerIds], processingStatusId: 'proc_002' },

  // Analysed training sessions
  { id: 'session_021', facilityId: 'facility_001', pitchId: 'pitch_002', academyId: 'academy_001', rosterId: 'roster_001', date: '2026-03-27', startTime: '17:00', endTime: '19:00', type: 'drill' as const, status: 'analysed' as const, opponent: undefined, competition: undefined, creditsConsumed: 30, programId: 'program_001', participatingPlayerIds: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005', 'player_006', 'player_007', 'player_008'], aiMatchConfidence: 85, autoTriggeredAnalysis: true },
  { id: 'session_022', facilityId: 'facility_001', pitchId: 'pitch_001', academyId: 'academy_001', rosterId: 'roster_002', date: '2026-03-26', startTime: '17:00', endTime: '18:30', type: 'drill' as const, status: 'analysed' as const, opponent: undefined, competition: undefined, creditsConsumed: 28, programId: 'program_002', participatingPlayerIds: ['player_009', 'player_010', 'player_011', 'player_012', 'player_013', 'player_014', 'player_015', 'player_016'], aiMatchConfidence: 82, autoTriggeredAnalysis: true },
]

// ─── MATCH ANALYSIS (Kiyan Makkawi — across multiple matches) ────
export const matchAnalyses: MatchAnalysis[] = [
  // session_007 — competitive match vs Al Wasl Academy (all players get minutesPlayed)
  { id: 'analysis_001', sessionId: 'session_007', playerId: 'player_001', compositeScore: 81, physicalScore: 82, positionalScore: 74, passingScore: 68, dribblingScore: 71, controlScore: 65, defendingScore: 70, distanceCovered: 7.4, topSpeed: 27.3, sprintCount: 14, passCompletion: 73, dribbleSuccess: 68, highlights: [], minutesPlayed: 90 },
  { id: 'analysis_002', sessionId: 'session_006', playerId: 'player_001', compositeScore: 78, physicalScore: 80, positionalScore: 72, passingScore: 66, dribblingScore: 70, controlScore: 63, defendingScore: 68, distanceCovered: 7.1, topSpeed: 26.8, sprintCount: 12, passCompletion: 71, dribbleSuccess: 65, highlights: [], minutesPlayed: 85 },
  { id: 'analysis_003', sessionId: 'session_005', playerId: 'player_001', compositeScore: 75, physicalScore: 78, positionalScore: 70, passingScore: 64, dribblingScore: 68, controlScore: 61, defendingScore: 66, distanceCovered: 6.9, topSpeed: 26.5, sprintCount: 11, passCompletion: 69, dribbleSuccess: 62, highlights: [], minutesPlayed: 78 },

  // session_007 — additional players (competitive match vs Al Wasl Academy)
  { id: 'analysis_004', sessionId: 'session_007', playerId: 'player_002', compositeScore: 78, physicalScore: 76, positionalScore: 72, passingScore: 70, dribblingScore: 80, controlScore: 74, defendingScore: 55, distanceCovered: 6.8, topSpeed: 26.1, sprintCount: 11, passCompletion: 68, dribbleSuccess: 72, highlights: [], minutesPlayed: 90 },
  { id: 'analysis_005', sessionId: 'session_007', playerId: 'player_003', compositeScore: 74, physicalScore: 80, positionalScore: 78, passingScore: 62, dribblingScore: 48, controlScore: 60, defendingScore: 85, distanceCovered: 6.2, topSpeed: 24.5, sprintCount: 8, passCompletion: 75, dribbleSuccess: 40, highlights: [], minutesPlayed: 90 },
  { id: 'analysis_006', sessionId: 'session_007', playerId: 'player_004', compositeScore: 72, physicalScore: 82, positionalScore: 68, passingScore: 65, dribblingScore: 78, controlScore: 70, defendingScore: 52, distanceCovered: 7.1, topSpeed: 28.2, sprintCount: 16, passCompletion: 62, dribbleSuccess: 74, highlights: [], minutesPlayed: 82 },
  { id: 'analysis_007', sessionId: 'session_007', playerId: 'player_005', compositeScore: 70, physicalScore: 58, positionalScore: 82, passingScore: 60, dribblingScore: 35, controlScore: 65, defendingScore: 88, distanceCovered: 3.2, topSpeed: 18.5, sprintCount: 3, passCompletion: 72, dribbleSuccess: 30, highlights: [], minutesPlayed: 90 },
  { id: 'analysis_008', sessionId: 'session_007', playerId: 'player_006', compositeScore: 68, physicalScore: 74, positionalScore: 72, passingScore: 64, dribblingScore: 55, controlScore: 62, defendingScore: 80, distanceCovered: 6.5, topSpeed: 25.8, sprintCount: 10, passCompletion: 70, dribbleSuccess: 45, highlights: [], minutesPlayed: 90 },
  { id: 'analysis_009', sessionId: 'session_007', playerId: 'player_007', compositeScore: 75, physicalScore: 78, positionalScore: 76, passingScore: 80, dribblingScore: 68, controlScore: 72, defendingScore: 70, distanceCovered: 7.0, topSpeed: 26.5, sprintCount: 12, passCompletion: 82, dribbleSuccess: 60, highlights: [], minutesPlayed: 65 },
  { id: 'analysis_010', sessionId: 'session_007', playerId: 'player_008', compositeScore: 72, physicalScore: 76, positionalScore: 74, passingScore: 66, dribblingScore: 50, controlScore: 64, defendingScore: 82, distanceCovered: 6.4, topSpeed: 25.2, sprintCount: 9, passCompletion: 71, dribbleSuccess: 42, highlights: [], minutesPlayed: 72 },

  // session_021 — training (roster_001, drill type, analysed) — Team A: players 1,2,4,5 | Team B: players 3,6,7,8
  { id: 'analysis_011', sessionId: 'session_021', playerId: 'player_001', compositeScore: 79, physicalScore: 80, positionalScore: 72, passingScore: 70, dribblingScore: 74, controlScore: 67, defendingScore: 68, distanceCovered: 7.2, topSpeed: 27.0, sprintCount: 13, passCompletion: 75, dribbleSuccess: 70, highlights: [], teamAssignment: 'A', minutesPlayed: 120 },
  { id: 'analysis_012', sessionId: 'session_021', playerId: 'player_002', compositeScore: 76, physicalScore: 74, positionalScore: 70, passingScore: 72, dribblingScore: 83, controlScore: 76, defendingScore: 53, distanceCovered: 6.6, topSpeed: 25.8, sprintCount: 10, passCompletion: 70, dribbleSuccess: 75, highlights: [], teamAssignment: 'A', minutesPlayed: 120 },
  { id: 'analysis_013', sessionId: 'session_021', playerId: 'player_003', compositeScore: 72, physicalScore: 78, positionalScore: 76, passingScore: 65, dribblingScore: 50, controlScore: 63, defendingScore: 83, distanceCovered: 6.0, topSpeed: 24.0, sprintCount: 7, passCompletion: 73, dribbleSuccess: 42, highlights: [], teamAssignment: 'B', minutesPlayed: 120 },
  { id: 'analysis_014', sessionId: 'session_021', playerId: 'player_004', compositeScore: 74, physicalScore: 84, positionalScore: 70, passingScore: 63, dribblingScore: 75, controlScore: 68, defendingScore: 50, distanceCovered: 7.3, topSpeed: 28.5, sprintCount: 18, passCompletion: 60, dribbleSuccess: 72, highlights: [], teamAssignment: 'A', minutesPlayed: 120 },
  { id: 'analysis_015', sessionId: 'session_021', playerId: 'player_005', compositeScore: 68, physicalScore: 56, positionalScore: 80, passingScore: 62, dribblingScore: 38, controlScore: 63, defendingScore: 86, distanceCovered: 3.0, topSpeed: 18.0, sprintCount: 2, passCompletion: 74, dribbleSuccess: 32, highlights: [], teamAssignment: 'A', minutesPlayed: 120 },
  { id: 'analysis_016', sessionId: 'session_021', playerId: 'player_006', compositeScore: 70, physicalScore: 76, positionalScore: 74, passingScore: 66, dribblingScore: 58, controlScore: 64, defendingScore: 78, distanceCovered: 6.3, topSpeed: 25.5, sprintCount: 9, passCompletion: 72, dribbleSuccess: 48, highlights: [], teamAssignment: 'B', minutesPlayed: 120 },
  { id: 'analysis_017', sessionId: 'session_021', playerId: 'player_007', compositeScore: 73, physicalScore: 76, positionalScore: 74, passingScore: 82, dribblingScore: 70, controlScore: 74, defendingScore: 68, distanceCovered: 6.8, topSpeed: 26.0, sprintCount: 11, passCompletion: 84, dribbleSuccess: 63, highlights: [], teamAssignment: 'B', minutesPlayed: 120 },
  { id: 'analysis_018', sessionId: 'session_021', playerId: 'player_008', compositeScore: 70, physicalScore: 74, positionalScore: 72, passingScore: 68, dribblingScore: 52, controlScore: 66, defendingScore: 80, distanceCovered: 6.2, topSpeed: 24.8, sprintCount: 8, passCompletion: 73, dribbleSuccess: 44, highlights: [], teamAssignment: 'B', minutesPlayed: 120 },

  // session_022 — training (roster_002, drill type, analysed) — Team A: players 9,11,13,14 | Team B: players 10,12,15,16
  { id: 'analysis_019', sessionId: 'session_022', playerId: 'player_009', compositeScore: 76, physicalScore: 78, positionalScore: 74, passingScore: 72, dribblingScore: 80, controlScore: 76, defendingScore: 55, distanceCovered: 7.0, topSpeed: 27.0, sprintCount: 13, passCompletion: 70, dribbleSuccess: 75, highlights: [], teamAssignment: 'A', minutesPlayed: 90 },
  { id: 'analysis_020', sessionId: 'session_022', playerId: 'player_010', compositeScore: 71, physicalScore: 76, positionalScore: 80, passingScore: 65, dribblingScore: 45, controlScore: 62, defendingScore: 84, distanceCovered: 6.0, topSpeed: 24.0, sprintCount: 7, passCompletion: 74, dribbleSuccess: 38, highlights: [], teamAssignment: 'B', minutesPlayed: 90 },
  { id: 'analysis_021', sessionId: 'session_022', playerId: 'player_011', compositeScore: 73, physicalScore: 74, positionalScore: 72, passingScore: 78, dribblingScore: 66, controlScore: 70, defendingScore: 68, distanceCovered: 6.8, topSpeed: 25.5, sprintCount: 11, passCompletion: 80, dribbleSuccess: 58, highlights: [], teamAssignment: 'A', minutesPlayed: 90 },
  { id: 'analysis_022', sessionId: 'session_022', playerId: 'player_012', compositeScore: 67, physicalScore: 72, positionalScore: 70, passingScore: 62, dribblingScore: 52, controlScore: 60, defendingScore: 78, distanceCovered: 6.3, topSpeed: 25.0, sprintCount: 9, passCompletion: 68, dribbleSuccess: 44, highlights: [], teamAssignment: 'B', minutesPlayed: 90 },
  { id: 'analysis_023', sessionId: 'session_022', playerId: 'player_013', compositeScore: 74, physicalScore: 80, positionalScore: 68, passingScore: 66, dribblingScore: 82, controlScore: 72, defendingScore: 50, distanceCovered: 7.2, topSpeed: 28.5, sprintCount: 15, passCompletion: 64, dribbleSuccess: 76, highlights: [], teamAssignment: 'A', minutesPlayed: 90 },
  { id: 'analysis_024', sessionId: 'session_022', playerId: 'player_014', compositeScore: 69, physicalScore: 56, positionalScore: 80, passingScore: 58, dribblingScore: 32, controlScore: 62, defendingScore: 86, distanceCovered: 3.0, topSpeed: 17.8, sprintCount: 2, passCompletion: 70, dribbleSuccess: 28, highlights: [], teamAssignment: 'A', minutesPlayed: 90 },
  { id: 'analysis_025', sessionId: 'session_022', playerId: 'player_015', compositeScore: 72, physicalScore: 76, positionalScore: 78, passingScore: 74, dribblingScore: 55, controlScore: 68, defendingScore: 82, distanceCovered: 6.6, topSpeed: 25.8, sprintCount: 10, passCompletion: 76, dribbleSuccess: 48, highlights: [], teamAssignment: 'B', minutesPlayed: 90 },
  { id: 'analysis_026', sessionId: 'session_022', playerId: 'player_016', compositeScore: 70, physicalScore: 78, positionalScore: 66, passingScore: 64, dribblingScore: 76, controlScore: 68, defendingScore: 48, distanceCovered: 7.0, topSpeed: 27.5, sprintCount: 14, passCompletion: 60, dribbleSuccess: 70, highlights: [], teamAssignment: 'B', minutesPlayed: 90 },
]

// ─── HIGHLIGHTS (with privacy + squad + aiConfidence) ─────────
export const highlights: Highlight[] = [
  // Kiyan Makkawi
  { id: 'highlight_001', sessionId: 'session_007', playerId: 'player_001', eventType: 'goal', timestampSeconds: 2040, durationSeconds: 12, releasedToParent: true, confidence: 0.97, privacy: 'parent_visible', watermarkEnabled: true, squadId: 'roster_001', aiConfidence: 91, flaggedByCoach: false },
  { id: 'highlight_002', sessionId: 'session_007', playerId: 'player_001', eventType: 'key_pass', timestampSeconds: 4020, durationSeconds: 8, releasedToParent: true, confidence: 0.91, privacy: 'parent_visible', watermarkEnabled: true, squadId: 'roster_001', aiConfidence: 87, flaggedByCoach: false },
  { id: 'highlight_003', sessionId: 'session_007', playerId: 'player_001', eventType: 'sprint_recovery', timestampSeconds: 4680, durationSeconds: 15, releasedToParent: false, confidence: 0.85, privacy: 'coach_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 78, flaggedByCoach: false },
  // Ahmed Hassan
  { id: 'highlight_004', sessionId: 'session_007', playerId: 'player_002', eventType: 'goal', timestampSeconds: 1380, durationSeconds: 10, releasedToParent: false, confidence: 0.89, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 89, flaggedByCoach: false },
  // Omar Al Rashidi
  { id: 'highlight_005', sessionId: 'session_007', playerId: 'player_003', eventType: 'tackle', timestampSeconds: 4020, durationSeconds: 8, releasedToParent: false, confidence: 0.82, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 82, flaggedByCoach: false },
  // Saeed Khalifa
  { id: 'highlight_006', sessionId: 'session_007', playerId: 'player_004', eventType: 'sprint_recovery', timestampSeconds: 720, durationSeconds: 11, releasedToParent: false, confidence: 0.91, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 91, flaggedByCoach: false },
  // Zayed Al Mansoori
  { id: 'highlight_007', sessionId: 'session_007', playerId: 'player_007', eventType: 'key_pass', timestampSeconds: 2640, durationSeconds: 9, releasedToParent: false, confidence: 0.85, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 85, flaggedByCoach: false },
  // Hamdan Al Mazrouei
  { id: 'highlight_008', sessionId: 'session_007', playerId: 'player_005', eventType: 'save', timestampSeconds: 4680, durationSeconds: 7, releasedToParent: false, confidence: 0.88, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 88, flaggedByCoach: false },
  // Rashid Al Shamsi
  { id: 'highlight_009', sessionId: 'session_007', playerId: 'player_008', eventType: 'tackle', timestampSeconds: 3300, durationSeconds: 6, releasedToParent: false, confidence: 0.80, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 80, flaggedByCoach: false },

  // ── Session 005 — vs Baniyas SC (Feb 7) ──
  { id: 'highlight_010', sessionId: 'session_005', playerId: 'player_001', eventType: 'key_pass', timestampSeconds: 1260, durationSeconds: 9, releasedToParent: false, confidence: 0.88, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 84, flaggedByCoach: false },
  { id: 'highlight_011', sessionId: 'session_005', playerId: 'player_002', eventType: 'goal', timestampSeconds: 2520, durationSeconds: 11, releasedToParent: true, confidence: 0.94, privacy: 'parent_visible', watermarkEnabled: true, squadId: 'roster_001', aiConfidence: 92, flaggedByCoach: false },
  { id: 'highlight_012', sessionId: 'session_005', playerId: 'player_004', eventType: 'sprint_recovery', timestampSeconds: 3600, durationSeconds: 13, releasedToParent: false, confidence: 0.83, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 79, flaggedByCoach: false },
  { id: 'highlight_013', sessionId: 'session_005', playerId: 'player_003', eventType: 'tackle', timestampSeconds: 4500, durationSeconds: 7, releasedToParent: false, confidence: 0.86, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 83, flaggedByCoach: false },

  // ── Session 006 — vs Al Ain FC (Feb 14) ──
  { id: 'highlight_014', sessionId: 'session_006', playerId: 'player_001', eventType: 'goal', timestampSeconds: 1800, durationSeconds: 12, releasedToParent: true, confidence: 0.96, privacy: 'parent_visible', watermarkEnabled: true, squadId: 'roster_001', aiConfidence: 94, flaggedByCoach: true },
  { id: 'highlight_015', sessionId: 'session_006', playerId: 'player_007', eventType: 'key_pass', timestampSeconds: 3060, durationSeconds: 8, releasedToParent: false, confidence: 0.87, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 85, flaggedByCoach: false },
  { id: 'highlight_016', sessionId: 'session_006', playerId: 'player_005', eventType: 'save', timestampSeconds: 3900, durationSeconds: 6, releasedToParent: false, confidence: 0.90, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 90, flaggedByCoach: false },
  { id: 'highlight_017', sessionId: 'session_006', playerId: 'player_006', eventType: 'tackle', timestampSeconds: 4800, durationSeconds: 9, releasedToParent: false, confidence: 0.84, privacy: 'team_only', watermarkEnabled: false, squadId: 'roster_001', aiConfidence: 81, flaggedByCoach: false },
]

// ─── COACH FLAGGED CLIPS ──────────────────────────────────
export const coachFlaggedClips: CoachFlaggedClip[] = [
  { id: 'clip_flag_001', highlightId: 'highlight_001', playerId: 'player_001', parentId: 'parent_001', coachId: 'coach_001', coachNote: 'Watch your positioning before receiving — good instinct here', sessionDate: '2026-02-24', eventType: 'goal', createdAt: '2026-02-25T10:00:00Z', viewed: false },
  { id: 'clip_flag_002', highlightId: 'highlight_002', playerId: 'player_001', parentId: 'parent_001', coachId: 'coach_001', coachNote: undefined, sessionDate: '2026-02-24', eventType: 'key_pass', createdAt: '2026-02-25T10:05:00Z', viewed: false },
]

// ─── PENDING REVIEW ITEMS ──────────────────────────────────
export const pendingReviewItems: PendingReviewItem[] = [
  {
    id: 'review_001',
    type: 'classify',
    sessionId: 'session_008',
    sessionDate: '2026-02-28',
    sessionLabel: 'Feb 28 · U12 Red · Pitch 2',
    aiConfidence: 71,
    segments: [
      { id: 'seg_1', label: 'Warm-up', startMin: 0, endMin: 18, aiClassification: 'drill', confidence: 94 },
      { id: 'seg_2', label: 'Technical Work', startMin: 18, endMin: 45, aiClassification: 'drill', confidence: 88 },
      { id: 'seg_3', label: 'Training Match', startMin: 45, endMin: 78, aiClassification: 'match', confidence: 91 },
      { id: 'seg_4', label: 'Unknown Segment', startMin: 78, endMin: 90, aiClassification: 'uncertain', confidence: 61 },
    ],
  },
  {
    id: 'review_002',
    type: 'tag',
    sessionId: 'session_007',
    sessionDate: '2026-02-24',
    sessionLabel: 'Feb 24 · vs Al Wasl · Match',
    playersToTag: [
      { boundingBoxId: 'box_01', jerseyNumber: '7', suggestedPlayerId: 'player_001', confidence: 94 },
      { boundingBoxId: 'box_02', jerseyNumber: '?', suggestedPlayerId: null, confidence: 31 },
      { boundingBoxId: 'box_03', jerseyNumber: '11', suggestedPlayerId: 'player_004', confidence: 71 },
    ],
    totalPlayers: 16,
    autoTaggedCount: 13,
  },
]

// ─── SESSION SEGMENTS (for session_008 — uncertain, needs classification) ────
export const sessionSegments: SessionSegment[] = [
  { id: 'segment_001', sessionId: 'session_008', startSeconds: 0, endSeconds: 1080, aiClassification: 'drill', aiConfidence: 0.94 },
  { id: 'segment_002', sessionId: 'session_008', startSeconds: 1080, endSeconds: 2700, aiClassification: 'drill', aiConfidence: 0.87 },
  { id: 'segment_003', sessionId: 'session_008', startSeconds: 2700, endSeconds: 4320, aiClassification: 'match', aiConfidence: 0.91 },
  { id: 'segment_004', sessionId: 'session_008', startSeconds: 4320, endSeconds: 5400, aiClassification: 'uncertain', aiConfidence: 0.72 },
]

// ─── BOOKMARKS (on session_004 — Feb 20 training) ───────────
export const bookmarks: Bookmark[] = [
  { id: 'bookmark_001', sessionId: 'session_004', timestampSeconds: 754, label: 'Show team', createdAt: '2026-02-20T17:12:34Z' },
  { id: 'bookmark_002', sessionId: 'session_004', timestampSeconds: 2061, label: 'Review with Ahmed', createdAt: '2026-02-20T17:34:21Z' },
  { id: 'bookmark_003', sessionId: 'session_004', timestampSeconds: 4065, label: 'Good pressing trigger', createdAt: '2026-02-20T18:07:45Z' },
]

// ─── LEASE CONTRACTS ───────────────────────────────────────
const expiringDate = new Date()
expiringDate.setDate(expiringDate.getDate() + 25)
const expiringDateStr = expiringDate.toISOString().slice(0, 10)

export const leaseContracts: LeaseContract[] = [
  {
    id: 'contract_001',
    facilityId: 'facility_001',
    academyId: 'academy_001',
    pitchId: 'pitch_002',
    dayOfWeek: [2, 4], // Tue, Thu
    startTime: '17:00',
    endTime: '19:00',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    ratePerSession: 180,
    currency: 'AED',
    status: 'active',
  },
  {
    id: 'contract_002',
    facilityId: 'facility_001',
    academyId: 'academy_001',
    pitchId: 'pitch_001',
    dayOfWeek: [6], // Sat
    startTime: '14:00',
    endTime: '16:00',
    startDate: '2026-01-01',
    endDate: expiringDateStr,
    ratePerSession: 220,
    currency: 'AED',
    status: 'expiring_soon',
  },
]

// ─── TOURNAMENTS ──────────────────────────────────────────
export const tournaments: TournamentPlaceholder[] = [
  {
    id: 'tournament_001',
    name: 'UAE U12 Spring Cup',
    startDate: '2026-04-15',
    endDate: '2026-04-17',
    location: 'Dubai Sports City',
    rosterIds: ['roster_001'],
  },
]

// ─── TOURNAMENT FIXTURES ─────────────────────────────────────
export const tournamentFixtures: TournamentFixture[] = [
  { id: 'fixture_001', tournamentId: 'tournament_001', tournamentName: 'UAE U12 Spring Cup', round: 'Group Stage', opponent: 'Al Wahda FC', venue: 'Dubai Sports City — Pitch A', date: '2026-04-15', startTime: '10:00', endTime: '11:30', rosterId: 'roster_001', sessionId: 'session_015' },
  { id: 'fixture_002', tournamentId: 'tournament_001', tournamentName: 'UAE U12 Spring Cup', round: 'Quarter-Final', opponent: 'Sharjah Youth', venue: 'Dubai Sports City — Pitch B', date: '2026-04-16', startTime: '14:00', endTime: '15:30', rosterId: 'roster_001', sessionId: 'session_016' },
  { id: 'fixture_003', tournamentId: 'tournament_001', tournamentName: 'UAE U12 Spring Cup', round: 'Semi-Final', opponent: 'Abu Dhabi Stars', venue: 'Dubai Sports City — Main Arena', date: '2026-04-17', startTime: '16:00', endTime: '17:30', rosterId: 'roster_001', sessionId: 'session_017' },
]

// ─── NOTIFICATIONS ─────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'notif_001', userId: 'parent_001', type: 'match_analysed', title: 'Match Analysis Ready', body: 'Kiyan\'s match vs Al Wasl Academy has been analysed', read: false, createdAt: '2026-02-24T18:30:00Z', channel: 'in_app' },
  { id: 'notif_002', userId: 'parent_001', type: 'highlights_ready', title: 'New Highlights', body: '3 new clips from the Al Wasl match are ready', read: false, createdAt: '2026-02-24T19:00:00Z', channel: 'whatsapp' },
  { id: 'notif_003', userId: 'coach_001', type: 'session_reminder', title: 'Upcoming Session', body: 'Training session tomorrow at 17:00 on Pitch 2', read: true, createdAt: '2026-02-23T10:00:00Z', channel: 'in_app' },
]

// ─── USERS ─────────────────────────────────────────────────
export const users: User[] = [
  { id: 'user_001', email: 'coach@makacademy.com', name: 'Marcus Silva', role: 'coach', academyId: 'academy_001' },
  { id: 'user_002', email: 'admin@makacademy.com', name: 'Tariq Makkawi', role: 'academy_admin', academyId: 'academy_001' },
  { id: 'user_003', email: 'parent@makacademy.com', name: 'Tariq Makkawi', role: 'parent', academyId: 'academy_001' },
  { id: 'user_004', email: 'facility@sportplex.com', name: 'Mohammed Al-Harbi', role: 'facility_admin', facilityId: 'facility_001' },
]

// ─── PLAYER-SPECIFIC DATA (for Parent Portal) ─────────────
export const playerProfile = {
  name: 'Kiyan Makkawi',
  firstName: 'Kiyan',
  lastName: 'Makkawi',
  initials: 'KM',
  age: 12,
  jerseyNumber: 7,
  position: 'Central Midfielder',
  team: 'U12 Red',
  academy: 'MAK Academy',
  compositeScore: 81,
}

// ─── POSITION-SPECIFIC SEASON STATS ──────────────────────────
export const playerSeasonStats: PlayerSeasonStats[] = [
  // Kiyan (CM) — Midfielder
  { playerId: 'player_001', positionGroup: 'midfielder', stats: [
    { label: 'Passes', value: '312' },
    { label: 'Pass Accuracy', value: '79%' },
    { label: 'Key Passes', value: '14' },
    { label: 'Distance', value: '6.8km avg' },
    { label: 'Goals + Assists', value: '6' },
    { label: 'Avg Score', value: '73' },
  ]},
  // Ahmed (ST) — Forward
  { playerId: 'player_002', positionGroup: 'forward', stats: [
    { label: 'Goals', value: '8' },
    { label: 'Assists', value: '4' },
    { label: 'Shots', value: '28' },
    { label: 'Shot Accuracy', value: '61%' },
    { label: 'Dribbles', value: '21' },
    { label: 'Avg Score', value: '76' },
  ]},
  // Omar (CB) — Defender
  { playerId: 'player_003', positionGroup: 'defender', stats: [
    { label: 'Clean Sheets', value: '4' },
    { label: 'Duels Won', value: '68%' },
    { label: 'Interceptions', value: '18' },
    { label: 'Clearances', value: '24' },
    { label: 'Pass Accuracy', value: '81%' },
    { label: 'Avg Score', value: '71' },
  ]},
  // Saeed (RW) — Forward
  { playerId: 'player_004', positionGroup: 'forward', stats: [
    { label: 'Goals', value: '5' },
    { label: 'Assists', value: '7' },
    { label: 'Shots', value: '22' },
    { label: 'Shot Accuracy', value: '55%' },
    { label: 'Dribbles', value: '34' },
    { label: 'Avg Score', value: '74' },
  ]},
  // Hamdan (GK) — Goalkeeper
  { playerId: 'player_005', positionGroup: 'goalkeeper', stats: [
    { label: 'Clean Sheets', value: '4' },
    { label: 'Saves', value: '23' },
    { label: 'Save Rate', value: '79%' },
    { label: 'Goals Conceded', value: '6' },
    { label: 'Distribution', value: '71%' },
    { label: 'Avg Score', value: '74' },
  ]},
  // Faisal (LB) — Defender
  { playerId: 'player_006', positionGroup: 'defender', stats: [
    { label: 'Clean Sheets', value: '3' },
    { label: 'Duels Won', value: '64%' },
    { label: 'Interceptions', value: '15' },
    { label: 'Clearances', value: '19' },
    { label: 'Pass Accuracy', value: '77%' },
    { label: 'Avg Score', value: '68' },
  ]},
  // Zayed (CM) — Midfielder
  { playerId: 'player_007', positionGroup: 'midfielder', stats: [
    { label: 'Passes', value: '287' },
    { label: 'Pass Accuracy', value: '76%' },
    { label: 'Key Passes', value: '11' },
    { label: 'Distance', value: '6.5km avg' },
    { label: 'Goals + Assists', value: '4' },
    { label: 'Avg Score', value: '70' },
  ]},
  // Rashid (RB) — Defender
  { playerId: 'player_008', positionGroup: 'defender', stats: [
    { label: 'Clean Sheets', value: '3' },
    { label: 'Duels Won', value: '62%' },
    { label: 'Interceptions', value: '14' },
    { label: 'Clearances', value: '16' },
    { label: 'Pass Accuracy', value: '74%' },
    { label: 'Avg Score', value: '66' },
  ]},
]

export const highlightClips: HighlightClip[] = [
  { id: 1, title: 'Goal', subtitle: '34th minute', duration: '0:12', label: 'Goal', eventType: 'Goal', minute: "34'", color: '#22c55e' },
  { id: 2, title: 'Key Pass', subtitle: '67th minute', duration: '0:08', label: 'Key Pass', eventType: 'Key Pass', minute: "67'", color: '#4A4AFF' },
  { id: 3, title: 'Sprint Recovery', subtitle: '78th minute', duration: '0:15', label: 'Sprint Recovery', eventType: 'Sprint Recovery', minute: "78'", color: '#9333ea' },
]

export const radarData: RadarDataItem[] = [
  { category: 'Physical', score: 82, avg: 76 },
  { category: 'Positional', score: 74, avg: 70 },
  { category: 'Passing', score: 68, avg: 65 },
  { category: 'Dribbling', score: 71, avg: 68 },
  { category: 'Control', score: 65, avg: 62 },
  { category: 'Defending', score: 70, avg: 67 },
]

export const categoryGrades: CategoryGrade[] = [
  { category: 'Physical', grade: 'A', gradeColor: '#27AE60', label: 'Elite', score: 82, subMetrics: ['7.4km', '27.3 km/h top', '14 sprints'] },
  { category: 'Passing', grade: 'B', gradeColor: '#4A4AFF', label: 'Good', score: 68, subMetrics: ['73% completion', '4 key passes', '6 progressive'] },
  { category: 'Dribbling', grade: 'B', gradeColor: '#4A4AFF', label: 'Good', score: 71, subMetrics: ['68% success', '12 attempts', '84m carried'] },
  { category: 'Control', grade: 'B-', gradeColor: '#4A4AFF', label: 'Above Average', score: 65, subMetrics: ['71% retention', '34 touches', '8 tight space'] },
  { category: 'Defending', grade: 'B', gradeColor: '#4A4AFF', label: 'Good', score: 70, subMetrics: ['6 duels won', '3 interceptions', '9 pressing'] },
  { category: 'Impact', grade: 'A-', gradeColor: '#27AE60', label: 'Excellent', score: 87, subMetrics: ['1 goal', '2 assists', '3 chances created'] },
]

export const percentileData: PercentileItem[] = [
  { metric: 'Sprint Speed', percentile: 84, topPct: 'Top 16%' },
  { metric: 'Distance Covered', percentile: 79, topPct: 'Top 21%' },
  { metric: 'Pass Completion', percentile: 61, topPct: 'Top 39%' },
  { metric: 'Dribble Success', percentile: 67, topPct: 'Top 33%' },
  { metric: 'Defensive Actions', percentile: 55, topPct: 'Top 45%' },
  { metric: 'Goals + Assists', percentile: 88, topPct: 'Top 12%' },
]

export const seasonProgressData: SeasonProgressPoint[] = [
  { match: 'Jan 6', score: 65 },
  { match: 'Jan 13', score: 69 },
  { match: 'Jan 20', score: 72 },
  { match: 'Jan 27', score: 68 },
  { match: 'Feb 3', score: 75 },
  { match: 'Feb 10', score: 71 },
  { match: 'Feb 17', score: 78 },
  { match: 'Feb 24', score: 81 },
]

export const matchHistory: MatchRecord[] = [
  { id: 1, day: 24, month: 'Feb', opponent: 'Al Wasl Academy', competition: 'UAE Youth League', duration: '90min', score: 81, tier: 'green', type: 'match' },
  { id: 9, day: 21, month: 'Feb', opponent: 'MAK Academy', competition: 'Team Training', duration: '75min', score: 74, tier: 'green', type: 'training' },
  { id: 2, day: 17, month: 'Feb', opponent: 'Al Ain FC', competition: 'UAE Youth League', duration: '90min', score: 78, tier: 'green', type: 'match' },
  { id: 10, day: 14, month: 'Feb', opponent: 'MAK Academy', competition: 'Team Training', duration: '60min', score: 70, tier: 'amber', type: 'training' },
  { id: 3, day: 10, month: 'Feb', opponent: 'Shabab Al Ahli', competition: 'Friendly', duration: '85min', score: 71, tier: 'amber', type: 'match' },
  { id: 11, day: 7, month: 'Feb', opponent: 'MAK Academy', competition: 'Skills Session', duration: '60min', score: 76, tier: 'green', type: 'training' },
  { id: 4, day: 3, month: 'Feb', opponent: 'Dubai SC', competition: 'UAE Youth League', duration: '90min', score: 75, tier: 'green', type: 'match' },
  { id: 12, day: 31, month: 'Jan', opponent: 'MAK Academy', competition: 'Team Training', duration: '75min', score: 72, tier: 'amber', type: 'training' },
  { id: 5, day: 27, month: 'Jan', opponent: 'Sharjah FC', competition: 'UAE Youth League', duration: '80min', score: 68, tier: 'amber', type: 'match' },
  { id: 6, day: 20, month: 'Jan', opponent: 'Ajman FC', competition: 'Cup', duration: '90min', score: 72, tier: 'amber', type: 'match' },
  { id: 13, day: 17, month: 'Jan', opponent: 'MAK Academy', competition: 'Skills Session', duration: '60min', score: 67, tier: 'amber', type: 'training' },
  { id: 7, day: 13, month: 'Jan', opponent: 'Al Jazira', competition: 'UAE Youth League', duration: '90min', score: 69, tier: 'amber', type: 'match' },
  { id: 14, day: 10, month: 'Jan', opponent: 'MAK Academy', competition: 'Team Training', duration: '75min', score: 63, tier: 'red', type: 'training' },
  { id: 8, day: 6, month: 'Jan', opponent: 'Baniyas SC', competition: 'Friendly', duration: '75min', score: 65, tier: 'red', type: 'match' },
]

// ─── SQUAD COMPOSITE SCORES (for coach portal) ────────────
export const squadScores: Record<string, { compositeScore: number; avgScore: number }> = {
  player_001: { compositeScore: 81, avgScore: 74 },
  player_002: { compositeScore: 63, avgScore: 81 }, // flagged — down 18%
  player_003: { compositeScore: 74, avgScore: 72 },
  player_004: { compositeScore: 78, avgScore: 73 },
  player_005: { compositeScore: 71, avgScore: 69 },
  player_006: { compositeScore: 69, avgScore: 67 },
  player_007: { compositeScore: 75, avgScore: 72 },
  player_008: { compositeScore: 72, avgScore: 70 },
}

// ─── SESSION TEAM SCORES (for form dots) ─────────────────────
export const sessionTeamScores: Record<string, number> = {
  session_007: 78,  // Feb 24 vs Al Wasl — win
  session_006: 71,  // Feb 14 vs Al Ain — draw
  session_005: 65,  // Feb 7 vs Baniyas — draw
  session_014: 82,  // Jan 31 vs Ajman — win
  session_013: 55,  // Jan 24 vs Sharjah — loss
  session_010: 74,  // Feb 22 vs Sharjah (U14)
}

// ─── PLAYER STANDOUT METRICS (for squad cards) ───────────────
export const playerStandoutMetrics: Record<string, string> = {
  player_001: '7.4km covered',
  player_002: '9 shots',
  player_003: '8 interceptions',
  player_004: '14 sprints',
  player_005: '6 saves',
  player_006: '11 sprints',
  player_007: '6.9km covered',
  player_008: '6.2km covered',
}

// ─── ANALYSIS MINUTES TRANSACTIONS ─────────────────────────
export const creditTransactions = [
  { date: '2026-02-24', session: 'MAK U12 Red vs Al Wasl Academy', minutesAnalysed: 40, balanceAfter: 47 },
  { date: '2026-02-22', session: 'MAK U14 Blue vs Sharjah FC', minutesAnalysed: 35, balanceAfter: 87 },
  { date: '2026-02-14', session: 'MAK U12 Red vs Al Ain FC', minutesAnalysed: 42, balanceAfter: 122 },
  { date: '2026-02-07', session: 'MAK U12 Red vs Baniyas SC', minutesAnalysed: 38, balanceAfter: 164 },
  { date: '2026-01-27', session: 'MAK U12 Red vs Sharjah FC', minutesAnalysed: 40, balanceAfter: 202 },
  { date: '2026-01-20', session: 'MAK U12 Red vs Ajman FC', minutesAnalysed: 38, balanceAfter: 242 },
  { date: '2026-01-13', session: 'MAK U12 Red vs Al Jazira', minutesAnalysed: 41, balanceAfter: 280 },
  { date: '2026-01-06', session: 'MAK U12 Red vs Baniyas SC', minutesAnalysed: 36, balanceAfter: 321 },
  { date: '2025-12-16', session: 'MAK U14 Blue vs Al Wahda', minutesAnalysed: 34, balanceAfter: 357 },
  { date: '2025-12-09', session: 'MAK U12 Red vs Al Ain Youth', minutesAnalysed: 39, balanceAfter: 391 },
]

export const creditUsageByMonth = [
  { month: 'Sep', credits: 4 },
  { month: 'Oct', credits: 6 },
  { month: 'Nov', credits: 5 },
  { month: 'Dec', credits: 3 },
  { month: 'Jan', credits: 5 },
  { month: 'Feb', credits: 4 },
]

// ─── COACH FEEDBACK STATUS ─────────────────────────────────
export const playerFeedbackStatus: Record<string, { sessionsSinceLastFeedback: number; lastFeedbackDate: string | null }> = {
  player_001: { sessionsSinceLastFeedback: 4, lastFeedbackDate: '2026-02-10' },
  player_002: { sessionsSinceLastFeedback: 12, lastFeedbackDate: '2026-01-06' },
  player_003: { sessionsSinceLastFeedback: 10, lastFeedbackDate: '2026-01-13' },
  player_004: { sessionsSinceLastFeedback: 6, lastFeedbackDate: '2026-01-27' },
  player_005: { sessionsSinceLastFeedback: 11, lastFeedbackDate: '2026-01-06' },
  player_006: { sessionsSinceLastFeedback: 3, lastFeedbackDate: '2026-02-17' },
  player_007: { sessionsSinceLastFeedback: 14, lastFeedbackDate: '2025-12-16' },
  player_008: { sessionsSinceLastFeedback: 8, lastFeedbackDate: '2026-01-20' },
}

// ─── COACH FEEDBACK HISTORY ────────────────────────────────
export const coachFeedbackHistory: CoachFeedback[] = [
  {
    id: 'feedback_001',
    playerId: 'player_001',
    coachId: 'coach_001',
    date: '2026-02-10',
    attitude: 5,
    effort: 4,
    coachability: 5,
    sportsmanship: 4,
    summary: 'Kiyan continues to show excellent leadership on the pitch. His willingness to listen and adapt during training is outstanding. Keep working on maintaining effort for the full 90 minutes.',
    sessionsSinceLastFeedback: 6,
  },
]

// ─── SESSIONS NEEDING ATTENDANCE ───────────────────────────
export const sessionsNeedingAttendance: string[] = ['session_004', 'session_008']

// ─── PLAYER KEY METRICS (Technical, Temperament, Strain) ──
export const playerKeyMetrics: Record<string, { technical: number; temperament: number; strain: 'low' | 'moderate' | 'high' }> = {
  player_001: { technical: 81, temperament: 88, strain: 'low' },
  player_002: { technical: 63, temperament: 72, strain: 'moderate' },
  player_003: { technical: 74, temperament: 85, strain: 'low' },
  player_004: { technical: 78, temperament: 70, strain: 'moderate' },
  player_005: { technical: 71, temperament: 82, strain: 'low' },
  player_006: { technical: 69, temperament: 90, strain: 'low' },
  player_007: { technical: 75, temperament: 68, strain: 'high' },
  player_008: { technical: 72, temperament: 76, strain: 'moderate' },
  player_009: { technical: 80, temperament: 84, strain: 'low' },
  player_010: { technical: 73, temperament: 79, strain: 'moderate' },
  player_011: { technical: 67, temperament: 74, strain: 'moderate' },
  player_012: { technical: 70, temperament: 86, strain: 'low' },
  player_013: { technical: 76, temperament: 71, strain: 'high' },
  player_014: { technical: 68, temperament: 80, strain: 'low' },
  player_015: { technical: 62, temperament: 65, strain: 'high' },
  player_016: { technical: 74, temperament: 77, strain: 'moderate' },
}

// ─── ATTENDANCE DATA (per roster) ─────────────────────────
export const attendanceData: Record<string, Array<{ playerId: string; sessionsAttended: number; totalSessions: number }>> = {
  roster_001: [
    { playerId: 'player_001', sessionsAttended: 16, totalSessions: 18 },
    { playerId: 'player_002', sessionsAttended: 14, totalSessions: 18 },
    { playerId: 'player_003', sessionsAttended: 17, totalSessions: 18 },
    { playerId: 'player_004', sessionsAttended: 12, totalSessions: 18 },
    { playerId: 'player_005', sessionsAttended: 15, totalSessions: 18 },
    { playerId: 'player_006', sessionsAttended: 18, totalSessions: 18 },
    { playerId: 'player_007', sessionsAttended: 13, totalSessions: 18 },
    { playerId: 'player_008', sessionsAttended: 16, totalSessions: 18 },
  ],
  roster_002: [
    { playerId: 'player_009', sessionsAttended: 14, totalSessions: 16 },
    { playerId: 'player_010', sessionsAttended: 15, totalSessions: 16 },
    { playerId: 'player_011', sessionsAttended: 12, totalSessions: 16 },
    { playerId: 'player_012', sessionsAttended: 16, totalSessions: 16 },
    { playerId: 'player_013', sessionsAttended: 11, totalSessions: 16 },
    { playerId: 'player_014', sessionsAttended: 13, totalSessions: 16 },
    { playerId: 'player_015', sessionsAttended: 8, totalSessions: 16 },
    { playerId: 'player_016', sessionsAttended: 15, totalSessions: 16 },
  ],
}

// ─── DEVELOPMENT REPORT DATA ──────────────────────────────
export const developmentReportData: Record<string, { softSkills: Array<{ category: string; score: number; avg: number }>; coachNotes: string }> = {
  player_001: { softSkills: [{ category: 'Attitude', score: 90, avg: 75 }, { category: 'Effort', score: 85, avg: 72 }, { category: 'Coachability', score: 92, avg: 70 }, { category: 'Sportsmanship', score: 80, avg: 74 }, { category: 'Leadership', score: 78, avg: 65 }], coachNotes: 'Kiyan continues to show exceptional leadership and game intelligence. Keep working on maintaining effort for the full 90 minutes.' },
  player_002: { softSkills: [{ category: 'Attitude', score: 70, avg: 75 }, { category: 'Effort', score: 78, avg: 72 }, { category: 'Coachability', score: 65, avg: 70 }, { category: 'Sportsmanship', score: 72, avg: 74 }, { category: 'Leadership', score: 55, avg: 65 }], coachNotes: 'Ahmed has great natural ability but needs to work on consistency and focus during training sessions.' },
  player_003: { softSkills: [{ category: 'Attitude', score: 88, avg: 75 }, { category: 'Effort', score: 90, avg: 72 }, { category: 'Coachability', score: 85, avg: 70 }, { category: 'Sportsmanship', score: 92, avg: 74 }, { category: 'Leadership', score: 70, avg: 65 }], coachNotes: 'Omar is a model professional. Excellent defensive awareness and always sets a great example for the team.' },
  player_004: { softSkills: [{ category: 'Attitude', score: 75, avg: 75 }, { category: 'Effort', score: 82, avg: 72 }, { category: 'Coachability', score: 70, avg: 70 }, { category: 'Sportsmanship', score: 68, avg: 74 }, { category: 'Leadership', score: 60, avg: 65 }], coachNotes: 'Saeed has explosive pace and good instincts. Needs to channel energy more productively in tight situations.' },
  player_005: { softSkills: [{ category: 'Attitude', score: 85, avg: 75 }, { category: 'Effort', score: 80, avg: 72 }, { category: 'Coachability', score: 88, avg: 70 }, { category: 'Sportsmanship', score: 82, avg: 74 }, { category: 'Leadership', score: 72, avg: 65 }], coachNotes: 'Hamdan is a reliable goalkeeper with good communication. Working on distribution and decision-making under pressure.' },
  player_006: { softSkills: [{ category: 'Attitude', score: 95, avg: 75 }, { category: 'Effort', score: 92, avg: 72 }, { category: 'Coachability', score: 90, avg: 70 }, { category: 'Sportsmanship', score: 88, avg: 74 }, { category: 'Leadership', score: 75, avg: 65 }], coachNotes: 'Faisal has the best attitude on the team. Always first to training and last to leave. A genuine pleasure to coach.' },
  player_007: { softSkills: [{ category: 'Attitude', score: 65, avg: 75 }, { category: 'Effort', score: 60, avg: 72 }, { category: 'Coachability', score: 68, avg: 70 }, { category: 'Sportsmanship', score: 70, avg: 74 }, { category: 'Leadership', score: 58, avg: 65 }], coachNotes: 'Zayed has talent but effort levels have dropped recently. Need to have a conversation about commitment and goals.' },
  player_008: { softSkills: [{ category: 'Attitude', score: 78, avg: 75 }, { category: 'Effort', score: 75, avg: 72 }, { category: 'Coachability', score: 80, avg: 70 }, { category: 'Sportsmanship', score: 76, avg: 74 }, { category: 'Leadership', score: 62, avg: 65 }], coachNotes: 'Rashid is a steady and dependable defender. Would benefit from more vocal communication during matches.' },
  player_009: { softSkills: [{ category: 'Attitude', score: 86, avg: 75 }, { category: 'Effort', score: 84, avg: 72 }, { category: 'Coachability', score: 82, avg: 70 }, { category: 'Sportsmanship', score: 80, avg: 74 }, { category: 'Leadership', score: 78, avg: 65 }], coachNotes: 'Zain is the captain of U14 Blue for a reason. Strong leader with excellent technical ability.' },
  player_010: { softSkills: [{ category: 'Attitude', score: 80, avg: 75 }, { category: 'Effort', score: 78, avg: 72 }, { category: 'Coachability', score: 76, avg: 70 }, { category: 'Sportsmanship', score: 82, avg: 74 }, { category: 'Leadership', score: 68, avg: 65 }], coachNotes: 'Tariq is a solid centre-back with room to grow. Positioning has improved significantly this term.' },
  player_011: { softSkills: [{ category: 'Attitude', score: 72, avg: 75 }, { category: 'Effort', score: 70, avg: 72 }, { category: 'Coachability', score: 74, avg: 70 }, { category: 'Sportsmanship', score: 75, avg: 74 }, { category: 'Leadership', score: 60, avg: 65 }], coachNotes: 'Ibrahim has good technical skill but needs more consistency in matches. Training performance doesn\'t always transfer to game day.' },
  player_012: { softSkills: [{ category: 'Attitude', score: 88, avg: 75 }, { category: 'Effort', score: 86, avg: 72 }, { category: 'Coachability', score: 84, avg: 70 }, { category: 'Sportsmanship', score: 90, avg: 74 }, { category: 'Leadership', score: 72, avg: 65 }], coachNotes: 'Majed has 100% attendance and always gives maximum effort. A great team player and reliable left-back.' },
  player_013: { softSkills: [{ category: 'Attitude', score: 68, avg: 75 }, { category: 'Effort', score: 72, avg: 72 }, { category: 'Coachability', score: 66, avg: 70 }, { category: 'Sportsmanship', score: 64, avg: 74 }, { category: 'Leadership', score: 55, avg: 65 }], coachNotes: 'Nasser has pace and skill but needs to improve attitude in training. Potential is there but needs more discipline.' },
  player_014: { softSkills: [{ category: 'Attitude', score: 82, avg: 75 }, { category: 'Effort', score: 78, avg: 72 }, { category: 'Coachability', score: 80, avg: 70 }, { category: 'Sportsmanship', score: 78, avg: 74 }, { category: 'Leadership', score: 65, avg: 65 }], coachNotes: 'Waleed is a dependable goalkeeper. Good shot-stopping and improving distribution. Needs to be more commanding in the box.' },
  player_015: { softSkills: [{ category: 'Attitude', score: 60, avg: 75 }, { category: 'Effort', score: 58, avg: 72 }, { category: 'Coachability', score: 62, avg: 70 }, { category: 'Sportsmanship', score: 65, avg: 74 }, { category: 'Leadership', score: 50, avg: 65 }], coachNotes: 'Bilal has been struggling with injury and motivation. Need to support his recovery and rebuild confidence gradually.' },
  player_016: { softSkills: [{ category: 'Attitude', score: 78, avg: 75 }, { category: 'Effort', score: 76, avg: 72 }, { category: 'Coachability', score: 74, avg: 70 }, { category: 'Sportsmanship', score: 80, avg: 74 }, { category: 'Leadership', score: 64, avg: 65 }], coachNotes: 'Sami is a creative winger with good instincts. Working on defensive contribution and tracking back.' },
}

// ─── PLAYER WORKLOAD DATA (for Load & Injury Risk Dashboard) ────
export const playerWorkloads: PlayerWorkload[] = [
  { playerId: 'player_001', weeklyLoads: [420, 480, 510, 450, 520, 490, 530, 500], minutesLast7: 210, minutesLast28: 840, intensityAvg: 7.2, restDaysLast7: 2, injuryHistory: [] },
  { playerId: 'player_002', weeklyLoads: [380, 410, 390, 450, 480, 520, 550, 580], minutesLast7: 240, minutesLast28: 880, intensityAvg: 8.1, restDaysLast7: 1, injuryHistory: [{ date: '2025-11-15', type: 'Ankle Sprain', daysOut: 14 }] },
  { playerId: 'player_003', weeklyLoads: [400, 420, 440, 430, 410, 420, 430, 420], minutesLast7: 180, minutesLast28: 720, intensityAvg: 6.5, restDaysLast7: 3, injuryHistory: [] },
  { playerId: 'player_004', weeklyLoads: [350, 380, 420, 460, 500, 530, 560, 590], minutesLast7: 250, minutesLast28: 920, intensityAvg: 8.5, restDaysLast7: 1, injuryHistory: [{ date: '2026-01-10', type: 'Hamstring Strain', daysOut: 10 }] },
  { playerId: 'player_005', weeklyLoads: [380, 400, 390, 410, 400, 420, 410, 400], minutesLast7: 170, minutesLast28: 680, intensityAvg: 6.0, restDaysLast7: 3, injuryHistory: [] },
  { playerId: 'player_006', weeklyLoads: [400, 430, 450, 440, 460, 470, 480, 470], minutesLast7: 200, minutesLast28: 780, intensityAvg: 7.0, restDaysLast7: 2, injuryHistory: [] },
  { playerId: 'player_007', weeklyLoads: [500, 520, 480, 550, 580, 600, 620, 640], minutesLast7: 270, minutesLast28: 960, intensityAvg: 8.8, restDaysLast7: 0, injuryHistory: [{ date: '2025-12-01', type: 'Knee Contusion', daysOut: 7 }, { date: '2026-02-01', type: 'Muscle Fatigue', daysOut: 5 }] },
  { playerId: 'player_008', weeklyLoads: [360, 380, 400, 410, 420, 430, 440, 430], minutesLast7: 190, minutesLast28: 740, intensityAvg: 6.8, restDaysLast7: 2, injuryHistory: [] },
]

// ─── CONTRACT RATE HISTORY ──────────────────────────────────
export const contractRateHistory: Record<string, RateChange[]> = {
  contract_001: [
    { date: '2025-07-01', rate: 150, currency: 'AED', reason: 'Initial contract' },
    { date: '2025-10-01', rate: 160, currency: 'AED', reason: 'Mid-term adjustment' },
    { date: '2026-01-01', rate: 180, currency: 'AED', reason: 'Term renewal — peak hours' },
  ],
  contract_002: [
    { date: '2025-07-01', rate: 200, currency: 'AED', reason: 'Initial contract — Pitch 1 premium' },
    { date: '2026-01-01', rate: 220, currency: 'AED', reason: 'Annual rate increase' },
  ],
}

// ─── BENCHMARKING COMPARISON DATA ───────────────────────────
export const benchmarkData: Record<string, BenchmarkAverage[]> = {
  academy: [
    { metric: 'Sprint Speed', playerValue: 84, groupAverage: 72, groupLabel: 'MAK Academy Avg' },
    { metric: 'Distance Covered', playerValue: 79, groupAverage: 68, groupLabel: 'MAK Academy Avg' },
    { metric: 'Pass Completion', playerValue: 61, groupAverage: 65, groupLabel: 'MAK Academy Avg' },
    { metric: 'Dribble Success', playerValue: 67, groupAverage: 62, groupLabel: 'MAK Academy Avg' },
    { metric: 'Defensive Actions', playerValue: 55, groupAverage: 58, groupLabel: 'MAK Academy Avg' },
    { metric: 'Goals + Assists', playerValue: 88, groupAverage: 64, groupLabel: 'MAK Academy Avg' },
  ],
  position: [
    { metric: 'Sprint Speed', playerValue: 84, groupAverage: 78, groupLabel: 'CM Average (U12)' },
    { metric: 'Distance Covered', playerValue: 79, groupAverage: 82, groupLabel: 'CM Average (U12)' },
    { metric: 'Pass Completion', playerValue: 61, groupAverage: 70, groupLabel: 'CM Average (U12)' },
    { metric: 'Dribble Success', playerValue: 67, groupAverage: 64, groupLabel: 'CM Average (U12)' },
    { metric: 'Defensive Actions', playerValue: 55, groupAverage: 62, groupLabel: 'CM Average (U12)' },
    { metric: 'Goals + Assists', playerValue: 88, groupAverage: 58, groupLabel: 'CM Average (U12)' },
  ],
  age_group: [
    { metric: 'Sprint Speed', playerValue: 84, groupAverage: 70, groupLabel: 'U12 National Avg' },
    { metric: 'Distance Covered', playerValue: 79, groupAverage: 65, groupLabel: 'U12 National Avg' },
    { metric: 'Pass Completion', playerValue: 61, groupAverage: 60, groupLabel: 'U12 National Avg' },
    { metric: 'Dribble Success', playerValue: 67, groupAverage: 55, groupLabel: 'U12 National Avg' },
    { metric: 'Defensive Actions', playerValue: 55, groupAverage: 52, groupLabel: 'U12 National Avg' },
    { metric: 'Goals + Assists', playerValue: 88, groupAverage: 48, groupLabel: 'U12 National Avg' },
  ],
}

// ─── SEASON REVIEW DATA ─────────────────────────────────────
export const seasonReviews: SeasonReviewData[] = [
  { playerId: 'player_001', seasonLabel: 'Spring 2026', matchesPlayed: 8, totalMinutes: 680, avgScore: 74, peakScore: 81, goalsAndAssists: 6, bestMatch: { opponent: 'Al Wasl Academy', score: 81, date: '2026-02-24' }, improvementAreas: ['Pass Completion', 'Defensive Actions', 'Ball Control'], strengthAreas: ['Sprint Speed', 'Goals + Assists', 'Physical Output'], highlightCount: 5 },
  { playerId: 'player_002', seasonLabel: 'Spring 2026', matchesPlayed: 7, totalMinutes: 590, avgScore: 76, peakScore: 85, goalsAndAssists: 12, bestMatch: { opponent: 'Ajman FC', score: 85, date: '2026-01-31' }, improvementAreas: ['Consistency', 'Effort Levels', 'Defensive Contribution'], strengthAreas: ['Goals', 'Shot Accuracy', 'Dribbling'], highlightCount: 4 },
  { playerId: 'player_003', seasonLabel: 'Spring 2026', matchesPlayed: 8, totalMinutes: 710, avgScore: 72, peakScore: 79, goalsAndAssists: 1, bestMatch: { opponent: 'Al Ain FC', score: 79, date: '2026-02-14' }, improvementAreas: ['Passing Range', 'Aerial Duels', 'Build-up Play'], strengthAreas: ['Defensive Solidity', 'Interceptions', 'Positioning'], highlightCount: 3 },
  { playerId: 'player_004', seasonLabel: 'Spring 2026', matchesPlayed: 6, totalMinutes: 480, avgScore: 74, peakScore: 82, goalsAndAssists: 12, bestMatch: { opponent: 'Al Wasl Academy', score: 82, date: '2026-02-24' }, improvementAreas: ['Sportsmanship', 'Decision Making', 'Consistency'], strengthAreas: ['Pace', 'Dribbling', 'Crossing'], highlightCount: 3 },
  { playerId: 'player_005', seasonLabel: 'Spring 2026', matchesPlayed: 7, totalMinutes: 630, avgScore: 74, peakScore: 80, goalsAndAssists: 0, bestMatch: { opponent: 'Baniyas SC', score: 80, date: '2026-02-07' }, improvementAreas: ['Distribution', 'Communication', 'Sweeping'], strengthAreas: ['Shot Stopping', 'Save Rate', 'Positioning'], highlightCount: 2 },
  { playerId: 'player_006', seasonLabel: 'Spring 2026', matchesPlayed: 8, totalMinutes: 720, avgScore: 68, peakScore: 75, goalsAndAssists: 2, bestMatch: { opponent: 'Sharjah FC', score: 75, date: '2026-01-24' }, improvementAreas: ['Attacking Contribution', 'Crossing', 'Pace'], strengthAreas: ['Attitude', 'Work Rate', 'Tackling'], highlightCount: 2 },
  { playerId: 'player_007', seasonLabel: 'Spring 2026', matchesPlayed: 6, totalMinutes: 510, avgScore: 70, peakScore: 78, goalsAndAssists: 4, bestMatch: { opponent: 'Al Ain FC', score: 78, date: '2026-02-14' }, improvementAreas: ['Effort Consistency', 'Attitude', 'Defensive Tracking'], strengthAreas: ['Technical Ability', 'Key Passes', 'Vision'], highlightCount: 2 },
  { playerId: 'player_008', seasonLabel: 'Spring 2026', matchesPlayed: 7, totalMinutes: 610, avgScore: 66, peakScore: 74, goalsAndAssists: 0, bestMatch: { opponent: 'Baniyas SC', score: 74, date: '2026-02-07' }, improvementAreas: ['Communication', 'Aerial Duels', 'Attacking Overlap'], strengthAreas: ['Consistency', 'Positioning', 'Tackling'], highlightCount: 1 },
]

// ─── EXPIRED CONTRACT (for market slot) ─────────────────────
export const expiredContracts: LeaseContract[] = [
  {
    id: 'contract_003',
    facilityId: 'facility_001',
    academyId: 'academy_002',
    pitchId: 'pitch_003',
    dayOfWeek: [1, 3],
    startTime: '16:00',
    endTime: '17:30',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    ratePerSession: 140,
    currency: 'AED',
    status: 'expired',
  },
]

// ─── PLAYER RADAR DATA (per player, for comparison) ────────
export const playerRadarData: Record<string, RadarDataItem[]> = {
  player_001: [{ category: 'Physical', score: 82, avg: 76 }, { category: 'Positional', score: 74, avg: 70 }, { category: 'Passing', score: 68, avg: 65 }, { category: 'Dribbling', score: 71, avg: 68 }, { category: 'Control', score: 65, avg: 62 }, { category: 'Defending', score: 70, avg: 67 }],
  player_002: [{ category: 'Physical', score: 78, avg: 76 }, { category: 'Positional', score: 68, avg: 70 }, { category: 'Passing', score: 60, avg: 65 }, { category: 'Dribbling', score: 76, avg: 68 }, { category: 'Control', score: 72, avg: 62 }, { category: 'Defending', score: 45, avg: 67 }],
  player_003: [{ category: 'Physical', score: 75, avg: 76 }, { category: 'Positional', score: 80, avg: 70 }, { category: 'Passing', score: 72, avg: 65 }, { category: 'Dribbling', score: 55, avg: 68 }, { category: 'Control', score: 60, avg: 62 }, { category: 'Defending', score: 85, avg: 67 }],
  player_004: [{ category: 'Physical', score: 88, avg: 76 }, { category: 'Positional', score: 65, avg: 70 }, { category: 'Passing', score: 58, avg: 65 }, { category: 'Dribbling', score: 82, avg: 68 }, { category: 'Control', score: 70, avg: 62 }, { category: 'Defending', score: 48, avg: 67 }],
  player_005: [{ category: 'Physical', score: 70, avg: 76 }, { category: 'Positional', score: 78, avg: 70 }, { category: 'Passing', score: 65, avg: 65 }, { category: 'Dribbling', score: 45, avg: 68 }, { category: 'Control', score: 68, avg: 62 }, { category: 'Defending', score: 75, avg: 67 }],
  player_006: [{ category: 'Physical', score: 72, avg: 76 }, { category: 'Positional', score: 70, avg: 70 }, { category: 'Passing', score: 64, avg: 65 }, { category: 'Dribbling', score: 58, avg: 68 }, { category: 'Control', score: 55, avg: 62 }, { category: 'Defending', score: 78, avg: 67 }],
  player_007: [{ category: 'Physical', score: 76, avg: 76 }, { category: 'Positional', score: 72, avg: 70 }, { category: 'Passing', score: 74, avg: 65 }, { category: 'Dribbling', score: 68, avg: 68 }, { category: 'Control', score: 62, avg: 62 }, { category: 'Defending', score: 65, avg: 67 }],
  player_008: [{ category: 'Physical', score: 74, avg: 76 }, { category: 'Positional', score: 75, avg: 70 }, { category: 'Passing', score: 62, avg: 65 }, { category: 'Dribbling', score: 50, avg: 68 }, { category: 'Control', score: 58, avg: 62 }, { category: 'Defending', score: 80, avg: 67 }],
}

// ─── PROCESSING STATUS DATA ──────────────────────────────
export const processingStatuses: Record<string, ProcessingStatus> = {
  proc_001: {
    sessionId: 'session_019',
    stage: 'event_detection',
    progress: 58,
    eta: '~12 min remaining',
    startedAt: '2026-03-05T17:02:00Z',
    stages: [
      { name: 'nvr_capture', label: 'NVR Capture', status: 'complete', duration: '1m 12s' },
      { name: 'ingestion', label: 'Ingestion', status: 'complete', duration: '2m 34s' },
      { name: 'calibration', label: 'Calibration', status: 'complete', duration: '1m 48s' },
      { name: 'player_tracking', label: 'Player Tracking', status: 'complete', duration: '4m 21s' },
      { name: 'ball_tracking', label: 'Ball Tracking', status: 'complete', duration: '3m 56s' },
      { name: 'event_detection', label: 'Event Detection', status: 'in_progress', startedAt: '2026-03-05T17:15:51Z' },
      { name: 'metric_computation', label: 'Metric Computation', status: 'pending' },
      { name: 'highlights', label: 'Highlights', status: 'pending' },
      { name: 'composite_score', label: 'Composite Score', status: 'pending' },
      { name: 'delivery', label: 'Delivery', status: 'pending' },
    ],
  },
  proc_002: {
    sessionId: 'session_020',
    stage: 'calibration',
    progress: 18,
    eta: '~28 min remaining',
    startedAt: '2026-03-04T19:10:00Z',
    stages: [
      { name: 'nvr_capture', label: 'NVR Capture', status: 'complete', duration: '1m 08s' },
      { name: 'ingestion', label: 'Ingestion', status: 'complete', duration: '2m 12s' },
      { name: 'calibration', label: 'Calibration', status: 'in_progress', startedAt: '2026-03-04T19:13:20Z' },
      { name: 'player_tracking', label: 'Player Tracking', status: 'pending' },
      { name: 'ball_tracking', label: 'Ball Tracking', status: 'pending' },
      { name: 'event_detection', label: 'Event Detection', status: 'pending' },
      { name: 'metric_computation', label: 'Metric Computation', status: 'pending' },
      { name: 'highlights', label: 'Highlights', status: 'pending' },
      { name: 'composite_score', label: 'Composite Score', status: 'pending' },
      { name: 'delivery', label: 'Delivery', status: 'pending' },
    ],
  },
}

// ─── PLAYER HEATMAP DATA ─────────────────────────────────
export const playerHeatmaps: Record<string, PlayerHeatmapData> = {
  // Kiyan (CM) on session_007 — clustered around center midfield
  'session_007_player_001': {
    sessionId: 'session_007', playerId: 'player_001', positionLabel: 'Central Midfielder',
    averagePosition: { x: 48, y: 42 },
    points: [
      { x: 45, y: 40, intensity: 0.95 }, { x: 50, y: 38, intensity: 0.88 },
      { x: 42, y: 45, intensity: 0.82 }, { x: 55, y: 35, intensity: 0.75 },
      { x: 38, y: 50, intensity: 0.70 }, { x: 60, y: 42, intensity: 0.65 },
      { x: 35, y: 55, intensity: 0.55 }, { x: 48, y: 30, intensity: 0.60 },
      { x: 52, y: 48, intensity: 0.78 }, { x: 44, y: 36, intensity: 0.85 },
      { x: 65, y: 38, intensity: 0.40 }, { x: 30, y: 52, intensity: 0.35 },
      { x: 47, y: 43, intensity: 0.92 }, { x: 53, y: 40, intensity: 0.80 },
      { x: 40, y: 48, intensity: 0.68 }, { x: 58, y: 36, intensity: 0.55 },
      { x: 50, y: 45, intensity: 0.90 }, { x: 46, y: 38, intensity: 0.87 },
    ],
  },
  // Ahmed (ST) on session_007 — clustered in final third
  'session_007_player_002': {
    sessionId: 'session_007', playerId: 'player_002', positionLabel: 'Striker',
    averagePosition: { x: 72, y: 48 },
    points: [
      { x: 75, y: 45, intensity: 0.95 }, { x: 80, y: 50, intensity: 0.90 },
      { x: 70, y: 42, intensity: 0.85 }, { x: 85, y: 48, intensity: 0.78 },
      { x: 68, y: 55, intensity: 0.65 }, { x: 78, y: 38, intensity: 0.72 },
      { x: 82, y: 52, intensity: 0.82 }, { x: 65, y: 45, intensity: 0.55 },
      { x: 73, y: 50, intensity: 0.88 }, { x: 77, y: 42, intensity: 0.80 },
      { x: 88, y: 46, intensity: 0.60 }, { x: 60, y: 48, intensity: 0.40 },
      { x: 76, y: 47, intensity: 0.92 }, { x: 72, y: 52, intensity: 0.75 },
    ],
  },
  // Omar (CB) on session_007 — defensive half
  'session_007_player_003': {
    sessionId: 'session_007', playerId: 'player_003', positionLabel: 'Centre Back',
    averagePosition: { x: 25, y: 48 },
    points: [
      { x: 22, y: 45, intensity: 0.95 }, { x: 28, y: 50, intensity: 0.90 },
      { x: 20, y: 42, intensity: 0.85 }, { x: 25, y: 55, intensity: 0.78 },
      { x: 30, y: 48, intensity: 0.72 }, { x: 18, y: 50, intensity: 0.68 },
      { x: 26, y: 40, intensity: 0.82 }, { x: 24, y: 52, intensity: 0.80 },
      { x: 32, y: 45, intensity: 0.55 }, { x: 15, y: 48, intensity: 0.50 },
      { x: 28, y: 42, intensity: 0.88 }, { x: 22, y: 55, intensity: 0.65 },
      { x: 35, y: 50, intensity: 0.40 }, { x: 20, y: 48, intensity: 0.92 },
    ],
  },
  // Hamdan (GK) on session_007 — in the goal area
  'session_007_player_005': {
    sessionId: 'session_007', playerId: 'player_005', positionLabel: 'Goalkeeper',
    averagePosition: { x: 6, y: 50 },
    points: [
      { x: 5, y: 48, intensity: 0.98 }, { x: 7, y: 52, intensity: 0.95 },
      { x: 4, y: 50, intensity: 0.92 }, { x: 8, y: 46, intensity: 0.85 },
      { x: 6, y: 54, intensity: 0.88 }, { x: 3, y: 50, intensity: 0.80 },
      { x: 9, y: 48, intensity: 0.75 }, { x: 5, y: 52, intensity: 0.90 },
      { x: 12, y: 50, intensity: 0.45 }, { x: 7, y: 50, intensity: 0.95 },
      { x: 6, y: 46, intensity: 0.82 }, { x: 10, y: 52, intensity: 0.55 },
    ],
  },
  // Kiyan (CM) on session_006 — slightly different pattern
  'session_006_player_001': {
    sessionId: 'session_006', playerId: 'player_001', positionLabel: 'Central Midfielder',
    averagePosition: { x: 50, y: 45 },
    points: [
      { x: 48, y: 42, intensity: 0.90 }, { x: 52, y: 40, intensity: 0.85 },
      { x: 45, y: 48, intensity: 0.80 }, { x: 55, y: 38, intensity: 0.72 },
      { x: 40, y: 52, intensity: 0.65 }, { x: 58, y: 44, intensity: 0.60 },
      { x: 50, y: 35, intensity: 0.55 }, { x: 42, y: 50, intensity: 0.75 },
      { x: 54, y: 46, intensity: 0.82 }, { x: 46, y: 40, intensity: 0.88 },
      { x: 62, y: 40, intensity: 0.42 }, { x: 35, y: 55, intensity: 0.38 },
      { x: 50, y: 44, intensity: 0.92 }, { x: 48, y: 48, intensity: 0.78 },
      { x: 52, y: 42, intensity: 0.86 }, { x: 44, y: 38, intensity: 0.70 },
    ],
  },
  // Saeed (RW) on session_007 — right wing area
  'session_007_player_004': {
    sessionId: 'session_007', playerId: 'player_004', positionLabel: 'Right Winger',
    averagePosition: { x: 65, y: 22 },
    points: [
      { x: 68, y: 18, intensity: 0.95 }, { x: 72, y: 22, intensity: 0.88 },
      { x: 65, y: 15, intensity: 0.82 }, { x: 75, y: 20, intensity: 0.75 },
      { x: 60, y: 25, intensity: 0.70 }, { x: 70, y: 28, intensity: 0.62 },
      { x: 78, y: 18, intensity: 0.60 }, { x: 55, y: 22, intensity: 0.50 },
      { x: 66, y: 20, intensity: 0.90 }, { x: 70, y: 16, intensity: 0.85 },
      { x: 62, y: 28, intensity: 0.55 }, { x: 80, y: 24, intensity: 0.45 },
      { x: 67, y: 22, intensity: 0.92 }, { x: 72, y: 18, intensity: 0.78 },
    ],
  },
}

// ─── HIGHLIGHT PITCH LOCATIONS ──────────────────────────────
export const highlightLocations: Record<string, { pitchX: number; pitchY: number }> = {
  // Session 007 — vs Al Wasl Academy
  highlight_001: { pitchX: 82, pitchY: 45 },   // Kiyan goal — in the box
  highlight_002: { pitchX: 55, pitchY: 38 },   // Kiyan key pass — midfield
  highlight_003: { pitchX: 35, pitchY: 60 },   // Kiyan sprint recovery — own half
  highlight_004: { pitchX: 85, pitchY: 50 },   // Ahmed goal — penalty area
  highlight_005: { pitchX: 28, pitchY: 42 },   // Omar tackle — defensive third
  highlight_006: { pitchX: 70, pitchY: 18 },   // Saeed sprint — right wing
  highlight_007: { pitchX: 50, pitchY: 35 },   // Zayed key pass — center
  highlight_008: { pitchX: 6, pitchY: 50 },    // Hamdan save — in goal
  highlight_009: { pitchX: 22, pitchY: 75 },   // Rashid tackle — right-back area
  // Session 005 — vs Baniyas SC
  highlight_010: { pitchX: 52, pitchY: 42 },   // Kiyan key pass
  highlight_011: { pitchX: 78, pitchY: 48 },   // Ahmed goal
  highlight_012: { pitchX: 65, pitchY: 18 },   // Saeed sprint
  highlight_013: { pitchX: 25, pitchY: 55 },   // Omar tackle
  // Session 006 — vs Al Ain FC
  highlight_014: { pitchX: 80, pitchY: 52 },   // Kiyan goal
  highlight_015: { pitchX: 48, pitchY: 40 },   // Zayed key pass
  highlight_016: { pitchX: 5, pitchY: 48 },    // Hamdan save
  highlight_017: { pitchX: 20, pitchY: 65 },   // Faisal tackle
}

// ─── DRILL LIBRARY ──────────────────────────────────────────
export const drillLibrary: DrillInfo[] = [
  {
    id: 'drill_001', name: 'Rondo 4v2', category: 'Passing', duration: '10 min', difficulty: 'Easy',
    players: '6', setup: '15×15m grid',
    description: 'Four players keep possession against two defenders in a tight space. Develops quick passing, movement off the ball, and pressing when defending.',
    coachingPoints: ['First touch away from pressure', 'Body shape open to receive', 'Defenders work as a pair to cut passing lanes', 'Rotate defenders every 2 minutes'],
    variations: ['Increase to 5v2 for easier possession', 'Shrink grid to 12×12m for more pressure', 'Add "two-touch only" constraint'],
    targetSkills: ['passing', 'control'],
  },
  {
    id: 'drill_002', name: '1v1 Wing Play', category: 'Dribbling', duration: '15 min', difficulty: 'Medium',
    players: '2 per station', setup: 'Sideline channel 10×30m',
    description: 'Attacker receives on the wing and must beat the defender 1v1 to deliver a cross.',
    coachingPoints: ['Attack the defender at pace', 'Use feints before committing', 'Cross early if defender drops off', 'Defender: stay on feet, show inside'],
    variations: ['Add a second attacker for overlap', 'Timed rounds — 30 seconds', 'Defender starts 5m back'],
    targetSkills: ['dribbling', 'crossing'],
  },
  {
    id: 'drill_003', name: 'Pressing Triggers', category: 'Tactical', duration: '20 min', difficulty: 'Hard',
    players: '11 vs 6', setup: 'Half pitch',
    description: 'Team of 11 practices coordinated pressing against 6 opposition players.',
    coachingPoints: ['Press as a unit — not individually', 'First player sets the press angle', 'Cut off the easy pass before engaging', 'Transition immediately on turnover'],
    variations: ['Must win ball in 8 seconds', 'Opposition scores by passing through pressing line', 'Vary starting position'],
    targetSkills: ['defending', 'positional'],
  },
  {
    id: 'drill_004', name: 'Finishing Circuit', category: 'Shooting', duration: '15 min', difficulty: 'Medium',
    players: '4-6', setup: 'Penalty area + 2 goals',
    description: 'Rotating stations around the box for different finishing scenarios: volleys, 1v1, cutbacks, first-time finishes.',
    coachingPoints: ['Hit the target — power comes second', 'Approach at an angle for side-foot finish', 'Stay composed', 'Follow up every shot for rebounds'],
    variations: ['Finish within 3 seconds', 'Defender closes in from behind', 'Weak foot only station'],
    targetSkills: ['shooting', 'composure'],
  },
  {
    id: 'drill_005', name: 'Defensive Shape', category: 'Tactical', duration: '20 min', difficulty: 'Medium',
    players: '8 vs 4', setup: 'Half pitch',
    description: 'Back four plus two midfielders maintain defensive shape against four attackers.',
    coachingPoints: ['Slide together — keep distances tight', 'CB talks and organises the line', 'No one gets drawn out of position', 'Spring the offside trap on signal'],
    variations: ['Add a striker to test depth', 'Play from goal kicks', 'Allow attackers to switch play'],
    targetSkills: ['defending', 'positional'],
  },
  {
    id: 'drill_006', name: 'GK Distribution', category: 'Goalkeeping', duration: '10 min', difficulty: 'Easy',
    players: '1 GK + 3 targets', setup: 'Full pitch length',
    description: 'Goalkeeper practices distribution to three target players at varying distances.',
    coachingPoints: ['Pick the pass before receiving', 'Goal kicks: strike through the ball', 'Short distribution: play to the safer foot', 'Communication with centre-backs'],
    variations: ['Add a pressing player on the GK', 'Distribute within 4 seconds', 'Vary target positions'],
    targetSkills: ['passing', 'composure'],
  },
  {
    id: 'drill_007', name: 'Counter-Attack 3v2', category: 'Tactical', duration: '15 min', difficulty: 'Hard',
    players: '5 (3 att + 2 def)', setup: 'Half pitch',
    description: 'Three attackers break against two defenders from the halfway line.',
    coachingPoints: ['Carry the ball fast — don\'t over-pass', 'Wide players stay wide', 'Ball carrier decides early', 'Attack the rebound'],
    variations: ['Add a third defender 10m behind', 'Score within 10 seconds', 'Start from a turnover'],
    targetSkills: ['dribbling', 'shooting', 'positional'],
  },
]

// ─── SESSION PREPS ──────────────────────────────────────────
export const sessionPreps: Record<string, SessionPrep> = {
  // Upcoming match vs Dubai SC
  session_012: {
    sessionId: 'session_012',
    squadSize: 7,
    formationId: '7v7_2-3-1',
    lineup: {
      0: 'player_005', // GK — Hamdan
      1: 'player_003', // LB — Omar
      2: 'player_008', // RB — Rashid
      3: 'player_006', // LM — Faisal
      4: 'player_001', // CM — Kiyan
      5: 'player_004', // RM — Saeed
      6: 'player_002', // ST — Ahmed
    },
    playingStyle: 'Play out from the back through midfield. Kiyan to dictate tempo from CM. Wide players push high to stretch their defence. Press high when they have the ball in their defensive third.',
    setPieces: 'Corners: Kiyan takes, near post run from Ahmed. Free kicks within 25m: Kiyan direct. Goal kicks: short to Omar or Rashid.',
    tacticalNotes: 'Dubai SC play a compact 3-2-1. Their weakness is the channels between CB and full-back. Saeed and Faisal should look to run in behind. Their GK is strong on crosses but weaker on shots from distance.',
    drillIds: [],
    createdAt: '2026-03-06T10:00:00',
  },
  // Upcoming training session
  session_011: {
    sessionId: 'session_011',
    squadSize: 7,
    formationId: '',
    lineup: {},
    playingStyle: '',
    setPieces: '',
    tacticalNotes: 'Focus on pressing triggers and finishing ahead of the Dubai SC match. Start with rondo to warm up, then pressing drill, finish with shooting circuit.',
    drillIds: ['drill_001', 'drill_003', 'drill_004'],
    createdAt: '2026-03-02T09:00:00',
  },
  // Past match — Al Wasl Academy (already analysed)
  session_007: {
    sessionId: 'session_007',
    squadSize: 7,
    formationId: '7v7_2-3-1',
    lineup: {
      0: 'player_005',
      1: 'player_003',
      2: 'player_008',
      3: 'player_006',
      4: 'player_001',
      5: 'player_004',
      6: 'player_002',
    },
    playingStyle: 'Possession-based, play through midfield. High press on their goal kicks.',
    setPieces: 'Standard set piece routines. Kiyan on corners.',
    tacticalNotes: 'Al Wasl like to play long balls. Keep a compact shape and win second balls.',
    drillIds: [],
    createdAt: '2026-02-23T14:00:00',
  },
}

// ─── SUPER ADMIN DATA ─────────────────────────────────────
export const platformStats = {
  totalAcademies: 2,
  totalFacilities: 1,
  totalUsers: 47,
  totalPlayers: 24,
  totalCoaches: 3,
  totalSessions: 20,
  totalSessionsThisMonth: 8,
  creditsConsumed: 1240,
  creditsRemaining: 760,
  activeSubscriptions: 2,
}

export const academyStats = [
  {
    academyId: 'academy_001',
    name: 'MAK Academy',
    players: 16,
    coaches: 2,
    squads: 2,
    sessionsThisMonth: 6,
    creditsUsed: 180,
    creditsRemaining: 320,
    subscriptionTier: 'professional' as const,
    status: 'active' as const,
    facilityName: 'SportPlex Jeddah',
    lastActivity: '2026-03-24',
  },
  {
    academyId: 'academy_002',
    name: 'Desert Eagles FC',
    players: 8,
    coaches: 1,
    squads: 1,
    sessionsThisMonth: 2,
    creditsUsed: 60,
    creditsRemaining: 140,
    subscriptionTier: 'development' as const,
    status: 'active' as const,
    facilityName: 'SportPlex Jeddah',
    lastActivity: '2026-03-20',
  },
]

export const platformUsers = [
  { id: 'user_001', name: 'Tariq Makkawi', email: 'admin@makacademy.com', role: 'academy_admin' as const, assignedTo: 'MAK Academy', status: 'active' as const, lastLogin: '2026-03-24' },
  { id: 'user_002', name: 'Mohammed Al-Harbi', email: 'facility@sportplex.com', role: 'facility_admin' as const, assignedTo: 'SportPlex Jeddah', status: 'active' as const, lastLogin: '2026-03-23' },
  { id: 'user_003', name: 'Ahmed Al-Rashid', email: 'admin@deserteagles.com', role: 'academy_admin' as const, assignedTo: 'Desert Eagles FC', status: 'active' as const, lastLogin: '2026-03-20' },
  { id: 'user_004', name: 'Sara Al-Fahd', email: 'facility2@sportplex.com', role: 'facility_admin' as const, assignedTo: 'SportPlex Jeddah', status: 'invited' as const, lastLogin: '' },
]

export const billingData = [
  { academyId: 'academy_001', name: 'MAK Academy', tier: 'Professional', monthlyFee: 2500, currency: 'AED', creditsIncluded: 500, creditsUsed: 180, lastPayment: '2026-03-01', nextPayment: '2026-04-01', status: 'active' as const },
  { academyId: 'academy_002', name: 'Desert Eagles FC', tier: 'Development', monthlyFee: 1200, currency: 'AED', creditsIncluded: 200, creditsUsed: 60, lastPayment: '2026-03-01', nextPayment: '2026-04-01', status: 'active' as const },
]

export const defaultPermissions: Record<string, Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean }>> = {
  academy_admin: {
    Players: { view: true, create: true, edit: true, delete: true, export: true },
    Squads: { view: true, create: true, edit: true, delete: true, export: false },
    Coaches: { view: true, create: true, edit: true, delete: true, export: false },
    Sessions: { view: true, create: true, edit: false, delete: false, export: true },
    Programs: { view: true, create: true, edit: true, delete: true, export: false },
    Highlights: { view: true, create: false, edit: false, delete: false, export: false },
    Credits: { view: true, create: false, edit: false, delete: false, export: true },
    Reports: { view: true, create: false, edit: false, delete: false, export: true },
    IDPs: { view: true, create: false, edit: false, delete: false, export: false },
    Feedback: { view: true, create: false, edit: false, delete: false, export: false },
  },
  facility_admin: {
    Players: { view: false, create: false, edit: false, delete: false, export: false },
    Squads: { view: false, create: false, edit: false, delete: false, export: false },
    Coaches: { view: false, create: false, edit: false, delete: false, export: false },
    Sessions: { view: true, create: false, edit: false, delete: false, export: true },
    Programs: { view: false, create: false, edit: false, delete: false, export: false },
    Highlights: { view: false, create: false, edit: false, delete: false, export: false },
    Credits: { view: false, create: false, edit: false, delete: false, export: false },
    Reports: { view: false, create: false, edit: false, delete: false, export: false },
    IDPs: { view: false, create: false, edit: false, delete: false, export: false },
    Feedback: { view: false, create: false, edit: false, delete: false, export: false },
    'Recurring Bookings': { view: true, create: true, edit: true, delete: true, export: true },
    Pitches: { view: true, create: true, edit: true, delete: false, export: false },
  },
  coach: {
    Players: { view: true, create: false, edit: false, delete: false, export: false },
    Squads: { view: true, create: false, edit: false, delete: false, export: false },
    Coaches: { view: false, create: false, edit: false, delete: false, export: false },
    Sessions: { view: true, create: true, edit: true, delete: false, export: false },
    Programs: { view: false, create: false, edit: false, delete: false, export: false },
    Highlights: { view: true, create: true, edit: true, delete: true, export: false },
    Credits: { view: false, create: false, edit: false, delete: false, export: false },
    Reports: { view: false, create: false, edit: false, delete: false, export: false },
    IDPs: { view: true, create: true, edit: true, delete: false, export: false },
    Feedback: { view: true, create: true, edit: true, delete: false, export: false },
    'Workload Monitoring': { view: true, create: false, edit: false, delete: false, export: false },
  },
  parent: {
    Players: { view: true, create: false, edit: false, delete: false, export: false },
    Squads: { view: false, create: false, edit: false, delete: false, export: false },
    Coaches: { view: false, create: false, edit: false, delete: false, export: false },
    Sessions: { view: true, create: false, edit: false, delete: false, export: false },
    Programs: { view: false, create: false, edit: false, delete: false, export: false },
    Highlights: { view: true, create: false, edit: false, delete: false, export: false },
    Credits: { view: false, create: false, edit: false, delete: false, export: false },
    Reports: { view: false, create: false, edit: false, delete: false, export: false },
    IDPs: { view: false, create: false, edit: false, delete: false, export: false },
    Feedback: { view: true, create: false, edit: false, delete: false, export: false },
  },
  player: {
    Players: { view: true, create: false, edit: false, delete: false, export: false },
    Squads: { view: false, create: false, edit: false, delete: false, export: false },
    Coaches: { view: false, create: false, edit: false, delete: false, export: false },
    Sessions: { view: true, create: false, edit: false, delete: false, export: false },
    Programs: { view: false, create: false, edit: false, delete: false, export: false },
    Highlights: { view: true, create: false, edit: false, delete: false, export: false },
    Credits: { view: false, create: false, edit: false, delete: false, export: false },
    Reports: { view: false, create: false, edit: false, delete: false, export: false },
    IDPs: { view: false, create: false, edit: false, delete: false, export: false },
    Feedback: { view: true, create: false, edit: false, delete: false, export: false },
  },
}

export const recentActivity = [
  { id: 'act_001', timestamp: '2026-03-24T14:32:00', type: 'session_analysed', description: 'MAK Academy U12 Red session analysed', academy: 'MAK Academy' },
  { id: 'act_002', timestamp: '2026-03-24T11:15:00', type: 'user_login', description: 'Tariq Makkawi logged in', academy: 'MAK Academy' },
  { id: 'act_003', timestamp: '2026-03-23T16:45:00', type: 'credits_consumed', description: '15 credits consumed for session processing', academy: 'MAK Academy' },
  { id: 'act_004', timestamp: '2026-03-23T09:20:00', type: 'player_added', description: '2 new players added to Desert Eagles U12', academy: 'Desert Eagles FC' },
  { id: 'act_005', timestamp: '2026-03-22T18:00:00', type: 'booking_renewed', description: 'Recurring booking renewed for Pitch 2', academy: 'MAK Academy' },
  { id: 'act_006', timestamp: '2026-03-21T10:30:00', type: 'program_created', description: 'New training program created: U14 Blue Spring', academy: 'MAK Academy' },
  { id: 'act_007', timestamp: '2026-03-20T15:00:00', type: 'session_recorded', description: 'Desert Eagles U12 training session recorded', academy: 'Desert Eagles FC' },
  { id: 'act_008', timestamp: '2026-03-19T12:00:00', type: 'highlights_released', description: '8 highlights released to parents', academy: 'MAK Academy' },
]

// ─── ACADEMY ADMIN TEAM STATS DATA ─────────────────────────────────────
export const squadPerformance = [
  {
    squadId: 'roster_001',
    squadName: 'U12 Red',
    coachName: 'Coach Hassan',
    playerCount: 8,
    avgScore: 7.2,
    previousAvgScore: 6.9,
    trend: 'improving' as const,
    attendanceRate: 91,
    sessionsThisMonth: 4,
    sessionsPlanned: 5,
    playersImproving: 5,
    playersStable: 2,
    playersDeclining: 1,
    topPerformer: { name: 'Yusuf Al-Rashid', score: 8.1 },
    areaOfConcern: 'Defensive positioning',
    lastSessionDate: '2026-03-23',
    avgTechnical: 7.4,
    avgTemperament: 7.0,
    avgPhysical: 7.1,
  },
  {
    squadId: 'roster_002',
    squadName: 'U12 Blue',
    coachName: 'Coach Hassan',
    playerCount: 8,
    avgScore: 6.8,
    previousAvgScore: 6.8,
    trend: 'stable' as const,
    attendanceRate: 84,
    sessionsThisMonth: 3,
    sessionsPlanned: 5,
    playersImproving: 3,
    playersStable: 3,
    playersDeclining: 2,
    topPerformer: { name: 'Omar Fikri', score: 7.6 },
    areaOfConcern: 'Pass completion',
    lastSessionDate: '2026-03-21',
    avgTechnical: 6.9,
    avgTemperament: 6.7,
    avgPhysical: 6.8,
  },
]

export const academyWideStats = {
  totalActivePlayers: 16,
  averageScore: 7.0,
  previousAverageScore: 6.85,
  totalSessionsDelivered: 20,
  totalSessionsPlanned: 24,
  averageAttendance: 87,
  creditConsumptionRate: 72, // percent of available credits used
  monthlyScoreTrend: [6.5, 6.7, 6.85, 7.0], // last 4 months
  monthLabels: ['Dec', 'Jan', 'Feb', 'Mar'],
}

export const teamAlerts = [
  { id: 'alert_001', type: 'attendance' as const, severity: 'warning' as const, message: '3 players in U12 Red have attendance below 70%', squad: 'U12 Red', date: '2026-03-24' },
  { id: 'alert_002', type: 'performance' as const, severity: 'info' as const, message: 'U12 Blue average score unchanged for 2 consecutive months', squad: 'U12 Blue', date: '2026-03-23' },
  { id: 'alert_003', type: 'coaching' as const, severity: 'warning' as const, message: 'Coach feedback not logged for U12 Blue in 10 days', squad: 'U12 Blue', date: '2026-03-22' },
  { id: 'alert_004', type: 'performance' as const, severity: 'positive' as const, message: 'U12 Red squad average improved by +0.3 this month', squad: 'U12 Red', date: '2026-03-24' },
  { id: 'alert_005', type: 'attendance' as const, severity: 'positive' as const, message: 'Academy-wide attendance up to 87% from 82% last month', squad: 'All', date: '2026-03-24' },
]

// ─── COMPETITIVE / LEAGUE DATA ─────────────────────────────────────
export const squadMatchRecords = [
  {
    squadId: 'roster_001',
    squadName: 'U12 Red',
    league: 'Jeddah Youth Premier League',
    division: 'Division 1',
    season: '2025/26',
    position: 2,
    totalTeams: 10,
    played: 14,
    won: 9,
    drawn: 3,
    lost: 2,
    goalsFor: 28,
    goalsAgainst: 12,
    goalDifference: 16,
    points: 30,
    form: ['W', 'W', 'D', 'W', 'L'] as const, // last 5 matches, most recent first
    recentMatches: [
      { date: '2026-03-22', opponent: 'Al-Ahli Youth', result: 'W', score: '3-1', scorers: ['Yusuf Al-Rashid (2)', 'Zain Malik'] },
      { date: '2026-03-15', opponent: 'Jeddah Stars', result: 'W', score: '2-0', scorers: ['Yusuf Al-Rashid', 'Adam El-Sayed'] },
      { date: '2026-03-08', opponent: 'Al-Ittihad Youth', result: 'D', score: '1-1', scorers: ['Omar Fikri'] },
      { date: '2026-03-01', opponent: 'Red Sea FC Youth', result: 'W', score: '4-2', scorers: ['Yusuf Al-Rashid (2)', 'Zain Malik', 'Adam El-Sayed'] },
      { date: '2026-02-22', opponent: 'Makkah United Youth', result: 'L', score: '0-1', scorers: [] },
    ],
  },
  {
    squadId: 'roster_002',
    squadName: 'U12 Blue',
    league: 'Jeddah Youth Premier League',
    division: 'Division 2',
    season: '2025/26',
    position: 5,
    totalTeams: 10,
    played: 14,
    won: 5,
    drawn: 4,
    lost: 5,
    goalsFor: 18,
    goalsAgainst: 20,
    goalDifference: -2,
    points: 19,
    form: ['L', 'D', 'W', 'L', 'W'] as const,
    recentMatches: [
      { date: '2026-03-22', opponent: 'Al-Wehda Youth B', result: 'L', score: '1-2', scorers: ['Karim Hassan'] },
      { date: '2026-03-15', opponent: 'Desert Hawks', result: 'D', score: '2-2', scorers: ['Omar Fikri', 'Karim Hassan'] },
      { date: '2026-03-08', opponent: 'Jeddah Academy B', result: 'W', score: '3-1', scorers: ['Omar Fikri (2)', 'Nabil Zouari'] },
      { date: '2026-03-01', opponent: 'South Jeddah FC Youth', result: 'L', score: '0-2', scorers: [] },
      { date: '2026-02-22', opponent: 'Coast FC Youth', result: 'W', score: '2-1', scorers: ['Karim Hassan', 'Omar Fikri'] },
    ],
  },
]

export const leagueStandings: Record<string, { position: number; team: string; played: number; won: number; drawn: number; lost: number; gd: number; points: number; isUs: boolean }[]> = {
  'roster_001': [
    { position: 1, team: 'Al-Hilal Youth', played: 14, won: 10, drawn: 2, lost: 2, gd: 20, points: 32, isUs: false },
    { position: 2, team: 'MAK Academy U12 Red', played: 14, won: 9, drawn: 3, lost: 2, gd: 16, points: 30, isUs: true },
    { position: 3, team: 'Al-Ahli Youth', played: 14, won: 8, drawn: 3, lost: 3, gd: 10, points: 27, isUs: false },
    { position: 4, team: 'Al-Ittihad Youth', played: 14, won: 7, drawn: 4, lost: 3, gd: 8, points: 25, isUs: false },
    { position: 5, team: 'Jeddah Stars', played: 14, won: 6, drawn: 3, lost: 5, gd: 3, points: 21, isUs: false },
    { position: 6, team: 'Red Sea FC Youth', played: 14, won: 5, drawn: 4, lost: 5, gd: -1, points: 19, isUs: false },
    { position: 7, team: 'Makkah United Youth', played: 14, won: 4, drawn: 5, lost: 5, gd: -3, points: 17, isUs: false },
    { position: 8, team: 'Al-Faisaly Youth', played: 14, won: 3, drawn: 4, lost: 7, gd: -8, points: 13, isUs: false },
    { position: 9, team: 'Hatten Youth', played: 14, won: 2, drawn: 3, lost: 9, gd: -15, points: 9, isUs: false },
    { position: 10, team: 'South Jeddah FC Youth', played: 14, won: 1, drawn: 3, lost: 10, gd: -20, points: 6, isUs: false },
  ],
  'roster_002': [
    { position: 1, team: 'Al-Wehda Youth B', played: 14, won: 9, drawn: 3, lost: 2, gd: 14, points: 30, isUs: false },
    { position: 2, team: 'Desert Hawks', played: 14, won: 8, drawn: 4, lost: 2, gd: 11, points: 28, isUs: false },
    { position: 3, team: 'Jeddah Academy B', played: 14, won: 7, drawn: 4, lost: 3, gd: 8, points: 25, isUs: false },
    { position: 4, team: 'Coast FC Youth', played: 14, won: 6, drawn: 4, lost: 4, gd: 4, points: 22, isUs: false },
    { position: 5, team: 'MAK Academy U12 Blue', played: 14, won: 5, drawn: 4, lost: 5, gd: -2, points: 19, isUs: true },
    { position: 6, team: 'Al-Nasr Youth B', played: 14, won: 5, drawn: 3, lost: 6, gd: -4, points: 18, isUs: false },
    { position: 7, team: 'Green Crescent Youth', played: 14, won: 4, drawn: 4, lost: 6, gd: -5, points: 16, isUs: false },
    { position: 8, team: 'Taif Youth', played: 14, won: 3, drawn: 5, lost: 6, gd: -7, points: 14, isUs: false },
    { position: 9, team: 'Al-Batin Youth B', played: 14, won: 3, drawn: 2, lost: 9, gd: -12, points: 11, isUs: false },
    { position: 10, team: 'Yanbu FC Youth', played: 14, won: 2, drawn: 1, lost: 11, gd: -17, points: 7, isUs: false },
  ],
}
