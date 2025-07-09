# Supabadge Project Guide for Claude

## Project Overview
Supabadge generates live metrics badges for Supabase projects using their REST API. Users provide their project URL and API keys, select a metric, and get a badge URL that can be embedded anywhere.

## Key Architecture Points
- Next.js 14 (on Vercel) for the badge creation wizard UI
- Supabase Edge Functions for badge generation and serving
- Uses Supabase REST API for metrics (no direct SQL)
- Stores only anon keys (safe) - never stores service keys
- Dynamic badges for table metrics, manual refresh for auth metrics

## Important Development Instructions

### Supabase MCP Usage
**ALWAYS use the Supabase MCP tools for database and edge function operations:**
- `mcp__supabase__execute_sql` - For queries and data operations
- `mcp__supabase__apply_migration` - For schema changes and DDL operations
- `mcp__supabase__list_tables` - To inspect database structure
- `mcp__supabase__search_docs` - For Supabase documentation
- `mcp__supabase__get_project_url` - To get the project URL
- `mcp__supabase__get_anon_key` - To get the anon key for testing
- `mcp__supabase__deploy_edge_function` - To deploy edge functions
- `mcp__supabase__list_edge_functions` - To list deployed functions

### Project Structure
```
supabadge/
├── app/                            # Next.js UI (deployed to Vercel)
│   ├── api/
│   │   └── setup/route.ts          # Badge creation endpoint
│   ├── wizard/page.tsx             # 3-step wizard interface
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── wizard/                     # Wizard step components
│   └── badge/                      # Badge-related components
├── lib/
│   ├── supabase.ts                 # Supabase client setup
│   └── database.ts                 # Database utilities
├── supabase/
│   └── functions/
│       ├── badge/                  # Badge serving edge function
│       │   └── index.ts
│       └── badge-refresh/          # Badge refresh edge function
│           └── index.ts
└── sql/
    └── schema.sql                  # Database schema
```

### Database Schema
The badges table stores badge configurations:
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_url TEXT NOT NULL,
  anon_key TEXT NOT NULL,
  label TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  table_name TEXT,
  color TEXT DEFAULT '#4F46E5',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Functions
1. **badge**: Serves badge SVGs dynamically
   - Route: `https://[project-ref].supabase.co/functions/v1/badge/{id}`
   - Fetches badge config from database
   - Queries target Supabase project for metrics
   - Generates and returns SVG

2. **badge-refresh**: Updates user count badges
   - Route: `https://[project-ref].supabase.co/functions/v1/badge-refresh/{id}`
   - Accepts service key in request body
   - Updates cached user count
   - Returns updated SVG

### Available Metrics
1. **table_count**: Row count for any table (dynamic, uses anon key)
2. **users**: Total authenticated users (requires service key on refresh)

### Development Workflow
1. Use Supabase MCP for all database operations
2. Use Supabase MCP to deploy edge functions
3. Test badge generation locally before deployment
4. Ensure error handling returns "Offline" badges on API failures
5. Follow the 3-step wizard flow: Setup → Metric → Customize

### Security Considerations
- Only store anon keys (public by design)
- Never store service keys - users enter them for each refresh
- All sensitive operations require user-provided keys
- Use REST API endpoints only (no direct SQL from badges)
- Edge functions handle all badge generation (isolated from main app)

### Testing Commands
```bash
# Run Next.js development server
pnpm dev

# Build Next.js for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Deploy edge function (use MCP instead)
# mcp__supabase__deploy_edge_function
```

### Environment Variables
Required in `.env.local` for Next.js app:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Common Tasks

#### Creating a new migration
Use `mcp__supabase__apply_migration` with a descriptive name:
```sql
-- Example: create_badges_table
CREATE TABLE badges (...);
```

#### Deploying edge functions
Use `mcp__supabase__deploy_edge_function` to deploy:
```typescript
// Example edge function structure
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Badge generation logic
})
```

#### Testing badge generation
1. Create a test badge via the Next.js API
2. Access the edge function URL to verify SVG generation
3. Test error cases (invalid credentials, offline API)

### Badge URL Format
- Badge serving: `https://[project-ref].supabase.co/functions/v1/badge/{badge_id}`
- Badge refresh: `https://[project-ref].supabase.co/functions/v1/badge-refresh/{badge_id}` (POST with service key)

### Error Handling
Always return an "Offline" badge SVG when:
- Supabase API is unreachable
- Invalid credentials provided
- Rate limits exceeded
- Any unexpected error occurs

### Package Management
This project uses **pnpm**. Always use pnpm commands:
```bash
# Install dependencies
pnpm install

# Add a new package
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Update dependencies
pnpm update
```

### Deployment Notes
- Next.js UI deploys to Vercel automatically
- Edge functions deploy via Supabase MCP
- Environment variables must be set in both Vercel and Supabase dashboards
- CORS headers required for badge embedding (set in edge functions)