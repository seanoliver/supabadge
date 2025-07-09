# Supabadge - Minimal Hackathon Implementation

## Overview

Supabadge generates live metrics badges for Supabase projects using their REST API. Users provide their project URL and API keys, select a metric, and get a badge URL.

## Simplified Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Badge Wizard  │ -> │   Badge API     │ -> │ Supabase REST   │
│   (Next.js)     │    │   (Next.js)     │    │      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        
                              v                        
                       ┌─────────────────┐             
                       │ Badge Storage   │             
                       │  (Our Database) │             
                       └─────────────────┘             
```

**How it works:**
1. User provides Supabase project URL and API keys
2. We store API keys and badge config in our database
3. Badge URLs (`/badge/{badge_id}`) call Supabase REST API and return SVG
4. Much simpler than SQL - uses Supabase's built-in REST endpoints

## Project Structure

```
supabadge/
├── app/
│   ├── api/
│   │   ├── badge/[id]/route.ts         # Badge serving endpoint
│   │   └── setup/route.ts              # Badge creation
│   ├── wizard/page.tsx                 # Simple 3-step wizard
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn/ui components (already exists)
│   ├── wizard/
│   │   ├── ProjectSetup.tsx            # Project URL + API keys
│   │   ├── MetricSelector.tsx          # Choose from 3 preset metrics
│   │   └── BadgeCustomizer.tsx         # Label and color only
│   └── badge/
│       └── SVGBadge.tsx                # Badge SVG generation
├── lib/
│   ├── supabase.ts                     # Our Supabase client (already exists)
│   ├── badge/
│   │   ├── generator.ts                # SVG badge generation
│   │   └── metrics.ts                  # 3 preset metrics using REST API
│   └── database.ts                     # Database utilities
└── sql/
    └── schema.sql                      # Simplified badge storage schema
```

## Database Schema (Our Supabase Project)

```sql
-- Simplified badge storage - only store anon keys for security
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_url TEXT NOT NULL,
  anon_key TEXT NOT NULL, -- safe to store (public key)
  label TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'table_count', 'users'
  table_name TEXT, -- required for table_count metric
  color TEXT DEFAULT '#4F46E5',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Phases

### Phase 1: Core Setup (Day 1)
- [x] Next.js 14 project with TypeScript and Tailwind (already exists)
- [ ] Create badge storage schema in our Supabase project
- [ ] Set up environment variables

### Phase 2: Badge Generation (Day 1)
- [ ] Create simple SVG badge generator
- [ ] Implement badge serving API at `/api/badge/[id]`
- [ ] Create 3 preset metrics using Supabase REST API
- [ ] Add basic error handling with "Offline" badge fallback

### Phase 3: Wizard Interface (Day 1-2)
- [ ] Create simple 3-step wizard:
  - **Step 1**: Project URL + anon key only
  - **Step 2**: Choose from 2 preset metrics (table_count, users)
  - **Step 3**: Customize label and color, get badge URL + refresh instructions

## Preset Metrics (Using Supabase REST API)

```javascript
export const PRESET_METRICS = {
  table_count: {
    label: "Records",
    endpoint: "/rest/v1/{table_name}?select=*&head=true",
    description: "Row count for any table",
    requiresTableName: true,
    usesAnonKey: true, // dynamic - works forever
    dynamic: true
  },
  users: {
    label: "Users",
    endpoint: "/auth/v1/admin/users",
    description: "Total authenticated users",
    requiresServiceKey: true, // user must enter each time
    usesAnonKey: false,
    dynamic: false // requires manual refresh
  }
};
```

## How It Works

1. **Setup**: User provides Supabase project URL and anon key only
2. **Validation**: Test connection by calling `/rest/v1/` endpoint
3. **Storage**: Store anon key and badge config (no sensitive keys stored)
4. **Badge Generation**: 
   - **Table metrics**: Use stored anon key → dynamic badges
   - **User metrics**: User enters service key each time → manual refresh
5. **Serving**: Badge URLs work forever for table metrics, require refresh for user metrics
6. **Fallback**: If API fails, show "Offline" badge

## Security (Much Better!)

- **Anon Keys**: Safe to store (meant to be public)
- **Service Keys**: NEVER stored - user enters each time for auth metrics
- **No SQL Injection**: Uses Supabase REST API only  
- **Error Handling**: Show "Offline" badge if API fails
- **Secure by Design**: Dynamic where safe, manual where sensitive

## API Endpoints

### POST /api/setup
Creates new badge
```typescript
// Request
{ 
  projectUrl: string,
  anonKey: string,
  label: string,
  metricType: string,
  tableName?: string, // required for table_count
  color: string
}

// Response
{ badgeId: string, badgeUrl: string }
```

### GET /api/badge/[id]
Serves badge SVG (dynamic for table metrics)
```typescript
// Response: SVG image with CORS headers
// Content-Type: image/svg+xml
// Access-Control-Allow-Origin: *
```

### POST /api/badge/[id]/refresh
Refreshes user metric badges (requires service key)
```typescript
// Request
{ serviceKey: string }

// Response: Updated SVG image
```

## Success Criteria

- [ ] Users can create badges in under 2 minutes
- [ ] Table count badges work dynamically (no refresh needed)
- [ ] User count badges work with manual refresh
- [ ] Basic error handling with "Offline" fallback
- [ ] Works with any Supabase project

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Vercel

## Key Files to Implement

1. `app/api/badge/[id]/route.ts` - Badge serving logic
2. `app/api/setup/route.ts` - Badge creation endpoint
3. `app/wizard/page.tsx` - Simple 3-step wizard
4. `components/wizard/` - Three wizard components  
5. `lib/badge/generator.ts` - SVG generation with fallback
6. `lib/badge/metrics.ts` - 2 preset metrics using REST API
7. `sql/schema.sql` - Simple badge storage schema

## Setup Instructions for Users

To use Supabadge with your Supabase project:

1. **Get your project URL** from Supabase Dashboard (e.g., `https://abc123.supabase.co`)
2. **Get your anon key** from Settings → API (this gets stored safely)
3. **For table count badges**: Works immediately and updates dynamically
4. **For user count badges**: Keep your service key handy for manual refreshes

**Security Benefits:**
- Only anon keys are stored (meant to be public anyway)
- Service keys never stored - you enter them only when refreshing
- Perfect balance of convenience and security!