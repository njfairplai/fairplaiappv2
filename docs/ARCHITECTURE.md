# FairplAI Platform — Technical Architecture Document

**Version:** 2.0
**Date:** 25 March 2026
**Status:** Production Architecture Specification (derived from working prototype)

---

## 1. System Overview

FairplAI is a multi-tenant sports analytics platform that provides AI-powered video analysis, player development tracking, and operational management for youth football academies. The system serves 6 distinct user roles through dedicated portals, each with role-appropriate functionality.

### 1.1 Core Value Proposition
- **Automated video analysis** of training sessions and matches using pitch-side cameras
- **AI-generated player performance metrics** (composite scores, heatmaps, event detection)
- **Highlight clip generation** with automated parent delivery via WhatsApp
- **Coach decision support** via AI chat hub (Coach Mikel)
- **Academy operations management** via AI command centre (Alex Sterling)

### 1.2 User Roles & Portals

| Role | Portal | Platform | Primary Use |
|------|--------|----------|-------------|
| Super Admin | `/super-admin/*` | Desktop | Platform operations, client management, billing |
| Academy Admin | `/admin/*` | Desktop | Squad, player, coach, program, session management |
| Facility Admin | `/facility/*` | Desktop | Pitch, booking, and camera management |
| Coach | `/coach/*` | Mobile + Desktop | Squad analysis, match prep, feedback, video review |
| Parent | `/parent/*` | Mobile | Child performance, highlights, match history |
| Player | `/player/*` | Mobile | Self-improvement, session prep, highlights |

---

## 2. Technology Stack

### 2.1 Current (Prototype)
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | TypeScript, React 18 |
| Styling | Inline CSSProperties | Design tokens in `constants.ts` |
| State | React Context + localStorage | 5 context providers |
| Data | Static mock data (`mockData.ts`) | 50+ exported datasets |
| Auth | localStorage sessions | 24-hour expiry, demo accounts |
| AI Chat | Anthropic Claude API | Tool-calling for command centre |
| Hosting | Vercel | Auto-deploy from GitHub |

### 2.2 Production Target
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | **Keep as-is** — no rewrite needed |
| Database | Supabase (PostgreSQL) | Managed DB + Auth + Storage + Realtime + RLS |
| Auth | Supabase Auth | JWT, magic link, password, OAuth, role-based |
| Storage | Supabase Storage | Player photos, logos, video clips |
| API | Next.js API Routes → Supabase | Server-side queries with RLS |
| AI Chat | Anthropic Claude API | Already integrated, needs production keys |
| Video Pipeline | Custom (see Section 8) | Separate microservice architecture |
| Email | Resend or Supabase Edge Functions | Transactional emails, invites |
| WhatsApp | WhatsApp Business API / Twilio | Highlight delivery to parents |
| Hosting | Vercel | Keep as-is |
| Monitoring | Vercel Analytics + Sentry | Error tracking, performance |

---

## 3. Database Schema

Derived directly from the TypeScript type definitions in `src/lib/types.ts`. Each type maps to a Supabase table.

### 3.1 Core Entity Tables

```sql
-- =============================================
-- ORGANIZATIONS
-- =============================================

CREATE TABLE academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  type TEXT NOT NULL CHECK (type IN ('private', 'school', 'club')),
  primary_contact TEXT,
  timezone TEXT DEFAULT 'Asia/Riyadh',
  credit_balance INTEGER DEFAULT 0,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('development', 'competitive', 'elite')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  pitch_count INTEGER DEFAULT 0,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('11v11', '7v7', '5v5')),
  camera_status TEXT DEFAULT 'inactive' CHECK (camera_status IN ('active', 'inactive', 'calibrating')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USERS & AUTH
-- =============================================

-- Supabase Auth handles the auth.users table automatically.
-- This is the public profile table linked to auth.users.

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'facility_admin', 'academy_admin', 'coach', 'parent', 'player')),
  academy_id UUID REFERENCES academies(id),
  facility_id UUID REFERENCES facilities(id),
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'deactivated')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TEAMS & PLAYERS
-- =============================================

CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female', 'mixed')),
  type TEXT DEFAULT 'development' CHECK (type IN ('development', 'competitive', 'elite')),
  coach_id UUID REFERENCES user_profiles(id),
  team_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  photo TEXT,
  date_of_birth DATE,
  positions TEXT[] DEFAULT '{}',
  jersey_number INTEGER,
  dominant_foot TEXT CHECK (dominant_foot IN ('left', 'right', 'both')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'injured', 'inactive')),
  invite_status TEXT CHECK (invite_status IN ('pending', 'sent', 'completed')),
  invite_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: players belong to multiple rosters
CREATE TABLE roster_players (
  roster_id UUID REFERENCES rosters(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (roster_id, player_id)
);

-- Many-to-many: players have multiple parents
CREATE TABLE player_parents (
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'legal_guardian')),
  PRIMARY KEY (player_id, parent_id)
);

CREATE TABLE player_profiles (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  nationality TEXT,
  passport_id TEXT,
  school_name TEXT,
  previous_club TEXT,
  kit_size TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  media_consent BOOLEAN DEFAULT false,
  medical_consent BOOLEAN DEFAULT false
);

CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: coaches manage multiple rosters
CREATE TABLE coach_rosters (
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  roster_id UUID REFERENCES rosters(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, roster_id)
);

-- =============================================
-- PROGRAMS & SESSIONS
-- =============================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  roster_id UUID REFERENCES rosters(id),
  name TEXT NOT NULL,
  days_of_week INTEGER[] DEFAULT '{}', -- 0=Sun, 1=Mon, etc.
  start_time TEXT, -- "16:00"
  session_length_minutes INTEGER DEFAULT 60,
  term_start DATE,
  term_end DATE,
  sessions_generated INTEGER DEFAULT 0,
  pitch_id UUID REFERENCES pitches(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id),
  pitch_id UUID REFERENCES pitches(id),
  academy_id UUID NOT NULL REFERENCES academies(id),
  roster_id UUID REFERENCES rosters(id),
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match', 'drill', 'training_match')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'complete', 'processing', 'analysed', 'playback_ready'
  )),
  opponent TEXT,
  competition TEXT,
  credits_consumed INTEGER DEFAULT 0,
  program_id UUID REFERENCES programs(id),
  is_ad_hoc BOOLEAN DEFAULT false,
  tournament_fixture_id UUID,
  ai_match_confidence REAL,
  auto_triggered_analysis BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: players participating in a session
CREATE TABLE session_players (
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  PRIMARY KEY (session_id, player_id)
);

-- =============================================
-- ANALYSIS & PERFORMANCE
-- =============================================

CREATE TABLE match_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  composite_score REAL,
  physical_score REAL,
  positional_score REAL,
  passing_score REAL,
  dribbling_score REAL,
  control_score REAL,
  defending_score REAL,
  distance_covered REAL, -- km
  top_speed REAL, -- km/h
  sprint_count INTEGER,
  pass_completion REAL, -- percentage
  dribble_success REAL, -- percentage
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, player_id)
);

CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  squad_id UUID REFERENCES rosters(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'goal', 'key_pass', 'sprint_recovery', 'tackle', 'save'
  )),
  timestamp_seconds INTEGER NOT NULL,
  duration_seconds INTEGER DEFAULT 10,
  thumbnail_url TEXT,
  clip_url TEXT,
  released_to_parent BOOLEAN DEFAULT false,
  confidence REAL,
  ai_confidence REAL,
  privacy TEXT DEFAULT 'team_only' CHECK (privacy IN ('parent_visible', 'team_only', 'coach_only')),
  shared_link_expiry TIMESTAMPTZ,
  watermark_enabled BOOLEAN DEFAULT true,
  flagged_by_coach BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coach_flagged_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id UUID REFERENCES highlights(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  parent_id UUID REFERENCES user_profiles(id),
  coach_id UUID NOT NULL,
  coach_note TEXT,
  session_date DATE,
  event_type TEXT,
  viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FACILITY MANAGEMENT
-- =============================================

CREATE TABLE recurring_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id),
  pitch_id UUID NOT NULL REFERENCES pitches(id),
  day_of_week INTEGER[] DEFAULT '{}',
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rate_per_session REAL,
  currency TEXT DEFAULT 'AED' CHECK (currency IN ('AED', 'SAR')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- VIDEO PROCESSING PIPELINE
-- =============================================

CREATE TABLE processing_statuses (
  session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  progress REAL DEFAULT 0,
  eta TEXT,
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE processing_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'nvr_capture', 'ingestion', 'calibration', etc.
  label TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('complete', 'in_progress', 'pending')),
  duration TEXT,
  started_at TIMESTAMPTZ
);

CREATE TABLE session_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  start_seconds INTEGER NOT NULL,
  end_seconds INTEGER NOT NULL,
  ai_classification TEXT CHECK (ai_classification IN ('match', 'drill', 'uncertain')),
  ai_confidence REAL,
  coach_confirmation TEXT CHECK (coach_confirmation IN ('match', 'drill'))
);

-- =============================================
-- COACH FEEDBACK & DEVELOPMENT
-- =============================================

CREATE TABLE coach_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  coach_id UUID NOT NULL,
  date DATE NOT NULL,
  attitude REAL CHECK (attitude BETWEEN 0 AND 5),
  effort REAL CHECK (effort BETWEEN 0 AND 5),
  coachability REAL CHECK (coachability BETWEEN 0 AND 5),
  sportsmanship REAL CHECK (sportsmanship BETWEEN 0 AND 5),
  summary TEXT,
  sessions_since_last_feedback INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE player_workloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  week_start DATE NOT NULL,
  load_value REAL,
  minutes_played INTEGER,
  intensity_avg REAL,
  rest_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, week_start)
);

-- =============================================
-- TOURNAMENTS
-- =============================================

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tournament_rosters (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  roster_id UUID REFERENCES rosters(id) ON DELETE CASCADE,
  PRIMARY KEY (tournament_id, roster_id)
);

CREATE TABLE tournament_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  tournament_name TEXT,
  round TEXT,
  opponent TEXT,
  venue TEXT,
  date DATE,
  start_time TEXT,
  end_time TEXT,
  roster_id UUID REFERENCES rosters(id),
  session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'match_analysed', 'highlights_ready', 'weekly_summary', 'session_reminder', 'credit_low'
  )),
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'whatsapp', 'email')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CONSENT & PRIVACY
-- =============================================

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  policy_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL,
  parental_consent BOOLEAN DEFAULT false,
  UNIQUE(user_id, policy_version)
);

-- =============================================
-- BOOKMARKS
-- =============================================

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  timestamp_seconds INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SESSION PREP (Coach)
-- =============================================

CREATE TABLE session_preps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  squad_size INTEGER,
  formation_id TEXT,
  lineup JSONB DEFAULT '{}', -- position_number -> player_id mapping
  playing_style TEXT,
  set_pieces TEXT,
  tactical_notes TEXT,
  drill_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- =============================================
-- CREDIT TRACKING
-- =============================================

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  session_id UUID REFERENCES sessions(id),
  amount INTEGER NOT NULL, -- positive = credit added, negative = credit consumed
  balance_after INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HEATMAPS
-- =============================================

CREATE TABLE player_heatmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  position_label TEXT,
  points JSONB NOT NULL, -- [{x, y, intensity}]
  average_position JSONB, -- {x, y}
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, player_id)
);

-- =============================================
-- PERMISSIONS (Super Admin managed)
-- =============================================

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  feature TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, feature)
);

-- =============================================
-- BILLING (Super Admin)
-- =============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('development', 'competitive', 'elite')),
  monthly_fee REAL,
  currency TEXT DEFAULT 'AED',
  credits_included INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled')),
  current_period_start DATE,
  current_period_end DATE,
  stripe_subscription_id TEXT, -- for Stripe integration
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_players_academy ON players(academy_id);
CREATE INDEX idx_sessions_academy ON sessions(academy_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_roster ON sessions(roster_id);
CREATE INDEX idx_match_analyses_session ON match_analyses(session_id);
CREATE INDEX idx_match_analyses_player ON match_analyses(player_id);
CREATE INDEX idx_highlights_session ON highlights(session_id);
CREATE INDEX idx_highlights_player ON highlights(player_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_credit_transactions_academy ON credit_transactions(academy_id);
CREATE INDEX idx_recurring_bookings_facility ON recurring_bookings(facility_id);
CREATE INDEX idx_recurring_bookings_academy ON recurring_bookings(academy_id);
CREATE INDEX idx_coach_feedback_player ON coach_feedback(player_id);
CREATE INDEX idx_roster_players_player ON roster_players(player_id);
CREATE INDEX idx_player_parents_parent ON player_parents(parent_id);
```

### 3.2 Row-Level Security (Multi-Tenancy)

Every query is scoped by `academy_id` or `facility_id`. Supabase RLS policies enforce this at the database level:

```sql
-- Example: Players are only visible to users in the same academy
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players visible to same academy" ON players
  FOR SELECT USING (
    academy_id = (SELECT academy_id FROM user_profiles WHERE id = auth.uid())
    OR EXISTS (
      -- Parents can see their own children
      SELECT 1 FROM player_parents pp
      WHERE pp.player_id = players.id AND pp.parent_id = auth.uid()
    )
    OR EXISTS (
      -- Super admins can see all
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Example: Sessions scoped to academy
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions visible to same academy" ON sessions
  FOR SELECT USING (
    academy_id = (SELECT academy_id FROM user_profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'facility_admin')
    )
  );

-- Apply similar RLS policies to ALL tables with academy_id or facility_id
-- Key principle: users only see data belonging to their organization
```

---

## 4. Authentication & Authorization

### 4.1 Auth Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Login Page  │────▶│ Supabase Auth│────▶│  user_profiles   │
│  /login      │     │  (JWT token) │     │  (role lookup)   │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │Super Admin│ │Coach     │ │Parent    │
                              │/super-    │ │/coach/   │ │/parent/  │
                              │admin/     │ │home      │ │home      │
                              └──────────┘ └──────────┘ └──────────┘
```

### 4.2 Auth Methods (Priority Order)
1. **Email + Password** — Primary for all admin roles
2. **Magic Link (Email)** — Preferred for parent onboarding
3. **WhatsApp OTP** — Future: frictionless parent auth (most parents interact via WhatsApp)
4. **Invite Token** — Academy Admin invites parents/coaches, token-based first-login

### 4.3 Session Management
- Supabase Auth issues JWT tokens (1-hour access + refresh token)
- Next.js middleware validates token on every server request
- Client-side: `useSession()` hook replaces current `AuthContext`
- Role stored in `user_profiles.role`, read after auth

### 4.4 Middleware (Production)

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Public paths - no auth required
  const publicPaths = ['/login', '/consent', '/invite', '/onboard', '/terms', '/privacy', '/guest']
  if (publicPaths.some(p => req.nextUrl.pathname.startsWith(p))) return res

  // No session - redirect to login
  if (!session) return NextResponse.redirect(new URL('/login', req.url))

  // Role-based route protection
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const roleRouteMap = {
    super_admin: '/super-admin',
    academy_admin: '/admin',
    facility_admin: '/facility',
    coach: '/coach',
    parent: '/parent',
    player: '/player',
  }

  const allowedPrefix = roleRouteMap[profile.role]
  if (!req.nextUrl.pathname.startsWith(allowedPrefix) && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL(allowedPrefix + '/dashboard', req.url))
  }

  return res
}
```

---

## 5. API Architecture

### 5.1 API Layer Pattern

All data access goes through Next.js API routes (server-side) that query Supabase. The client NEVER queries Supabase directly — this ensures RLS is enforced server-side.

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React Page  │────▶│  /api/players    │────▶│  Supabase   │
│  (client)    │     │  (server-side)   │     │  (PostgreSQL)│
│              │◀────│  + RLS enforced  │◀────│  + RLS      │
└──────────────┘     └──────────────────┘     └─────────────┘
```

### 5.2 API Route Map

```
/api/
├── auth/
│   ├── login          POST    — Email/password login
│   ├── signup         POST    — New account creation
│   ├── logout         POST    — Session invalidation
│   ├── invite         POST    — Generate invite token
│   └── verify-invite  GET     — Validate invite token
│
├── academies/
│   ├── [id]           GET     — Academy details
│   └── [id]/stats     GET     — Academy aggregate stats
│
├── players/
│   ├── list           GET     — Players (scoped by academy_id)
│   ├── [id]           GET/PUT — Player CRUD
│   ├── [id]/profile   GET/PUT — Extended profile
│   ├── [id]/analyses  GET     — Performance history
│   ├── [id]/highlights GET    — Player's highlight clips
│   ├── [id]/workload  GET     — Workload metrics
│   └── import         POST    — CSV bulk import
│
├── rosters/
│   ├── list           GET     — Squads (scoped by academy_id)
│   ├── [id]           GET/POST/PUT/DELETE
│   └── [id]/players   GET/POST — Roster membership
│
├── sessions/
│   ├── list           GET     — Sessions with filters
│   ├── [id]           GET/POST/PUT
│   ├── [id]/attendance POST   — Mark attendance
│   ├── [id]/prep      GET/PUT — Session prep data
│   └── [id]/processing GET    — Processing status
│
├── highlights/
│   ├── list           GET     — Highlights with filters
│   ├── [id]/release   POST    — Release to parent
│   └── [id]/share     POST    — Generate share link
│
├── programs/
│   ├── list           GET
│   ├── [id]           GET/POST/PUT/DELETE
│   └── [id]/generate  POST    — Generate sessions from program
│
├── bookings/
│   ├── list           GET     — Recurring bookings (facility-scoped)
│   ├── [id]           GET/POST/PUT/DELETE
│   └── check-availability POST — Conflict detection
│
├── coaches/
│   ├── list           GET
│   ├── [id]           GET/POST/PUT
│   └── [id]/feedback  GET/POST — Coach feedback entries
│
├── credits/
│   ├── balance        GET     — Current credit balance
│   └── transactions   GET     — Transaction history
│
├── notifications/
│   ├── list           GET     — User's notifications
│   └── [id]/read      PUT     — Mark as read
│
├── chat/
│   ├── academy-chat   POST    — Command Centre (Claude API)
│   └── coach-hub-chat POST    — Coach Hub (Claude API)
│
├── video/
│   ├── upload-url     POST    — Get signed upload URL
│   └── processing     GET     — Processing pipeline status
│
└── super-admin/
    ├── academies      GET/POST — All academies (no RLS filter)
    ├── users          GET/POST — All platform users
    ├── permissions    GET/PUT  — Role permission matrix
    ├── billing        GET      — Subscription & billing data
    └── stats          GET      — Platform-wide analytics
```

### 5.3 API Route Example (Production Pattern)

```typescript
// src/app/api/players/list/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Auth check - Supabase validates the JWT automatically
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RLS automatically filters by academy_id based on the user's JWT
  const { data: players, error } = await supabase
    .from('players')
    .select(`
      *,
      player_profiles(*),
      roster_players(roster_id)
    `)
    .eq('status', 'active')
    .order('last_name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(players)
}
```

---

## 6. Multi-Tenancy Architecture

### 6.1 Tenant Isolation Model

FairplAI uses **shared database, shared schema** with **Row-Level Security (RLS)**:

```
┌─────────────────────────────────────────────┐
│              Supabase PostgreSQL              │
│                                               │
│  ┌─────────────┐  ┌─────────────┐            │
│  │ MAK Academy  │  │Desert Eagles│  (same     │
│  │ academy_id=1 │  │academy_id=2 │   tables)  │
│  │              │  │             │            │
│  │ 16 players   │  │ 8 players   │            │
│  │ 2 rosters    │  │ 1 roster    │            │
│  │ 20 sessions  │  │ 5 sessions  │            │
│  └─────────────┘  └─────────────┘            │
│                                               │
│  RLS Policy: WHERE academy_id = user.academy_id │
└─────────────────────────────────────────────┘
```

### 6.2 Academy ↔ Facility Relationship

```
Facility (SportPlex Jeddah)
├── Pitch 1 (Main 11v11)
│   ├── Recurring Booking: MAK Academy, Mon/Wed 16:00-17:00
│   └── Recurring Booking: Desert Eagles, Tue/Thu 16:00-17:00
├── Pitch 2 (Training 7v7)
│   └── Recurring Booking: MAK Academy, Mon/Wed 17:00-18:00
├── Pitch 3 (Mini 5v5)
└── Pitch 4 (Indoor 5v5)
```

One facility can serve multiple academies. Bookings prevent scheduling conflicts via `conflictDetection.ts`.

---

## 7. AI Integration Architecture

### 7.1 Command Centre (Academy Admin)

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Chat UI     │────▶│  /api/academy-   │────▶│ Claude API  │
│  (React)     │     │  chat            │     │ (tool-call) │
│              │◀────│                  │◀────│             │
└──────────────┘     └──────────────────┘     └─────────────┘
                              │
                     ┌────────┼────────┐
                     ▼        ▼        ▼
               ┌──────┐ ┌──────┐ ┌──────┐
               │show_  │ │create│ │list_ │
               │form   │ │entity│ │items │
               └──────┘ └──────┘ └──────┘
```

**Agent: Alex Sterling** (Academy Admin AI assistant)
- Persona: Professional academy operations manager
- Tools: show_form, show_stats, list_entities, create_entity, check_credits, bulk_import
- Context injected: playerCount, coachCount, rosterCount, sessionCount, creditBalance, subscriptionTier, setupProgress
- Supported actions: add_player, add_coach, create_roster, schedule_session, add_program, import_csv, view_stats, check_credits, list_players, list_rosters, list_coaches, list_sessions, list_programs

### 7.2 Coach Hub (Coach)

**Agent: Coach Mikel** (Coach AI assistant)
- Persona: Experienced youth football coach
- Tools: stat_card, player_card, alert_card, review_prompt, player_list
- Context injected: rosterName, squadSize, avgScore, sessionsPlayed, upcomingCount, pendingReviewCount, feedbackDueCount, atRiskCount
- Supported actions: view_squad, analyze_player, check_schedule, review_session, create_idp, view_stats

### 7.3 Production AI Configuration

```typescript
// Environment variables
ANTHROPIC_API_KEY=sk-ant-...          // Claude API key
AI_MODEL=claude-sonnet-4-20250514     // Model selection
AI_MAX_TOKENS=1024                     // Response limit
AI_TEMPERATURE=0.7                     // Creativity level
```

---

## 8. Video Processing Pipeline (High-Level)

> **Note:** This is the one component that requires dedicated engineering. The prototype defines the pipeline stages and UI; the actual processing is a separate microservice.

### 8.1 Pipeline Stages

```
Camera (NVR) → Cloud Upload → Processing Pipeline → Results → Delivery
                                      │
                    ┌─────────────────┼──────────────────┐
                    ▼                 ▼                   ▼
              ┌──────────┐    ┌──────────────┐    ┌──────────┐
              │ Player   │    │ Event        │    │ Metric   │
              │ Tracking │    │ Detection    │    │ Compute  │
              │ (CV)     │    │ (goals,      │    │ (scores, │
              │          │    │  passes,etc) │    │  distance)│
              └──────────┘    └──────────────┘    └──────────┘
                    │                 │                   │
                    ▼                 ▼                   ▼
              ┌──────────┐    ┌──────────────┐    ┌──────────┐
              │ Heatmaps │    │ Highlights   │    │ Composite│
              │          │    │ (auto-clip)  │    │ Scores   │
              └──────────┘    └──────────────┘    └──────────┘
```

### 8.2 Processing Stages (as defined in types.ts)

1. `nvr_capture` — Camera records footage
2. `ingestion` — Upload to cloud storage
3. `calibration` — Pitch mapping / camera calibration
4. `player_tracking` — Computer vision player detection
5. `ball_tracking` — Ball position tracking
6. `event_detection` — Goal, pass, tackle, sprint classification
7. `metric_computation` — Performance score calculation
8. `highlights` — Automatic clip extraction
9. `composite_score` — Overall player scoring
10. `delivery` — WhatsApp/email delivery to parents

### 8.3 Recommended Tech Stack for Pipeline
| Component | Technology | Notes |
|-----------|-----------|-------|
| Video storage | AWS S3 / Cloudflare R2 | Cost-effective for large files |
| Processing queue | AWS SQS or Bull (Redis) | Job queue for async processing |
| Computer vision | Custom ML models or third-party (e.g., Sportlogiq, Second Spectrum) | Core IP |
| Clip generation | FFmpeg (serverless) | Extract highlight segments |
| Delivery | WhatsApp Business API | Automated parent notifications |

---

## 9. Data Flow Diagrams

### 9.1 Session Lifecycle

```
Program Created (Admin)
    │
    ▼
Sessions Auto-Generated (based on program schedule)
    │
    ▼
Session Scheduled ──── Coach prepares (lineup, tactics, drills)
    │
    ▼
Session In Progress ── Camera recording (NVR)
    │
    ▼
Session Complete ───── Coach marks attendance
    │
    ▼
Processing ─────────── 10-stage pipeline (15-45 min)
    │
    ├── Coach reviews segments (classify match vs drill)
    ├── Coach reviews player tags (verify jersey tracking)
    │
    ▼
Analysed ──────────── Scores, heatmaps, event timeline available
    │
    ├── Coach views squad scores, provides feedback
    ├── Coach flags highlights for parents
    │
    ▼
Playback Ready ────── Full video DVR available
    │
    ├── Highlights released to parents (WhatsApp)
    ├── Parent views child's performance + highlights
    ├── Player views their own highlights + prep notes
    │
    ▼
Credits Consumed ──── Academy credit balance decremented
```

### 9.2 Parent Onboarding Flow

```
Academy Admin adds player
    │
    ▼
Admin enters guardian email
    │
    ▼
System generates invite token
    │
    ▼
Email/WhatsApp invite sent to parent
    │
    ▼
Parent clicks invite link → /onboard/[token]
    │
    ├── Creates account (Supabase Auth)
    ├── Accepts consent (media, medical, privacy)
    ├── Verifies WhatsApp number
    │
    ▼
Parent account linked to player
    │
    ▼
Parent receives highlights after next session
```

---

## 10. Deployment Architecture

### 10.1 Infrastructure

```
┌──────────────────────────────────────────────────┐
│                    Vercel                          │
│  ┌──────────────────────────────────────────┐    │
│  │  Next.js Application                      │    │
│  │  ├── Static pages (ISR)                   │    │
│  │  ├── API routes (serverless functions)    │    │
│  │  └── Edge middleware (auth)               │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│    Supabase      │  │   Anthropic API  │
│  ├── PostgreSQL  │  │   (Claude)       │
│  ├── Auth        │  └──────────────────┘
│  ├── Storage     │
│  ├── Realtime    │
│  └── Edge Funcs  │
└──────────────────┘
           │
           ▼
┌──────────────────┐
│  Video Pipeline  │
│  (separate infra)│
│  ├── S3 storage  │
│  ├── Processing  │
│  └── CDN delivery│
└──────────────────┘
```

### 10.2 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...     # Server-side only, never exposed

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Video Storage
S3_BUCKET=fairplai-videos
S3_REGION=me-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Email
RESEND_API_KEY=re_...

# WhatsApp (future)
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# App
NEXT_PUBLIC_APP_URL=https://fairplaiappv2.vercel.app
```

---

## 11. Migration Plan (Prototype → Production)

### Phase 1: Foundation (Days 1-3)
- [ ] Create Supabase project
- [ ] Run database schema SQL (Section 3.1)
- [ ] Configure RLS policies (Section 3.2)
- [ ] Set up Supabase Auth (email + password)
- [ ] Create Next.js middleware for auth (Section 4.4)
- [ ] Replace `AuthContext` with Supabase session hook
- [ ] Seed database with demo data (migrate from mockData.ts)
- [ ] Add environment variables to Vercel

### Phase 2: Core Data Migration (Days 4-7)
- [ ] Create `/api/` routes for all CRUD operations (Section 5.2)
- [ ] Replace mockData imports in Academy Admin pages (dashboard, players, rosters, coaches, programs, sessions, credits, reports, team-stats)
- [ ] Replace mockData imports in Facility Admin pages (dashboard, contracts→bookings, pitches, sessions)
- [ ] Replace mockData imports in Super Admin pages (dashboard, clients, facilities, users, permissions, billing)
- [ ] Test: each admin page loads data from Supabase

### Phase 3: Mobile Portals (Days 8-10)
- [ ] Replace mockData imports in Coach pages (home, squad, insights, review, video, season-review, hub)
- [ ] Replace mockData imports in Parent pages (home, highlights, matches, development)
- [ ] Replace mockData imports in Player pages (home, sessions, highlights, development)
- [ ] Wire up AI chat endpoints with real data context (inject live counts instead of hardcoded)
- [ ] Test: all 6 portals functional with real data

### Phase 4: Operational Features (Days 11-13)
- [ ] Invite flow: Academy Admin sends invite → email sent → parent onboards
- [ ] Session prep: Coach saves lineup/tactics → persists to DB (not localStorage)
- [ ] Attendance marking: Coach marks attendance → saved to session_players
- [ ] Coach feedback: Submit ratings → saved to coach_feedback table
- [ ] Highlight release: Coach flags clip → parent notified → clip visible in parent portal
- [ ] Notification system: in-app notifications from DB, not mock data
- [ ] File uploads: player photos, academy logos → Supabase Storage

### Phase 5: Polish & Deploy (Day 14)
- [ ] Error handling (loading states, error boundaries, retry logic)
- [ ] Seed production data for first client
- [ ] Final testing across all portals
- [ ] Deploy to production Vercel environment
- [ ] Hand off video pipeline requirements to engineering team

---

## 12. Appendix

### 12.1 Component Count by Portal

| Portal | Pages | Components | Contexts |
|--------|-------|------------|----------|
| Super Admin | 6 | 0 (inline) | — |
| Academy Admin | 10 | 18 | CommandCentreContext |
| Facility Admin | 4 | 3 | — |
| Coach | 20 | 9 | CoachHubContext, TeamContext |
| Parent | 5 | 8 | — |
| Player | 5 | 4 | — |
| Shared | — | 10 | AuthContext, FeedbackContext |
| **Total** | **50** | **52** | **5** |

### 12.2 External Dependencies

| Package | Purpose |
|---------|---------|
| next | Framework |
| react / react-dom | UI library |
| typescript | Type safety |
| lucide-react | Icon library |
| recharts | Charts (LineChart, RadarChart) |
| @anthropic-ai/sdk | Claude API |
| @supabase/supabase-js | Database client (to add) |
| @supabase/auth-helpers-nextjs | Auth integration (to add) |
| resend | Email delivery (to add) |

### 12.3 Key Design Decisions

1. **Inline CSSProperties over Tailwind/CSS Modules** — Chosen for prototype speed; could be migrated to Tailwind later but is NOT a blocker for production
2. **Single Next.js app for all portals** — Simpler deployment; role-based routing handles separation. Could split into micro-frontends later if needed
3. **Supabase over custom backend** — Managed PostgreSQL + Auth + Storage + Realtime eliminates 80% of backend work
4. **Server-side API routes** — Client never talks to DB directly; enables RLS enforcement and API rate limiting
5. **Credit-based billing model** — Each session analysis consumes credits; academies purchase credit packages tied to subscription tier
