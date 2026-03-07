import type {
  User, Academy, Facility, Pitch, Roster, Player, Coach, Parent,
  Session, MatchAnalysis, Highlight, SessionSegment, LeaseContract,
  Notification, CategoryGrade, PercentileItem, SeasonProgressPoint,
  RadarDataItem, MatchRecord, HighlightClip, Program, Bookmark,
  TournamentPlaceholder, TournamentFixture, CoachFlaggedClip, PendingReviewItem,
  PlayerSeasonStats,
  CoachFeedback,
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
]

// ─── MATCH ANALYSIS (Kiyan Makkawi — across multiple matches) ────
export const matchAnalyses: MatchAnalysis[] = [
  { id: 'analysis_001', sessionId: 'session_007', playerId: 'player_001', compositeScore: 81, physicalScore: 82, positionalScore: 74, passingScore: 68, dribblingScore: 71, controlScore: 65, defendingScore: 70, distanceCovered: 7.4, topSpeed: 27.3, sprintCount: 14, passCompletion: 73, dribbleSuccess: 68, highlights: [] },
  { id: 'analysis_002', sessionId: 'session_006', playerId: 'player_001', compositeScore: 78, physicalScore: 80, positionalScore: 72, passingScore: 66, dribblingScore: 70, controlScore: 63, defendingScore: 68, distanceCovered: 7.1, topSpeed: 26.8, sprintCount: 12, passCompletion: 71, dribbleSuccess: 65, highlights: [] },
  { id: 'analysis_003', sessionId: 'session_005', playerId: 'player_001', compositeScore: 75, physicalScore: 78, positionalScore: 70, passingScore: 64, dribblingScore: 68, controlScore: 61, defendingScore: 66, distanceCovered: 6.9, topSpeed: 26.5, sprintCount: 11, passCompletion: 69, dribbleSuccess: 62, highlights: [] },
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
