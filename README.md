# Supabadge

![Orders](https://zdpqxgwvzlspdbfsqxmi.supabase.co/functions/v1/badge/b55dd4d9-14b7-4bc1-a8f3-920c62a44a90)
![Support Tickets](https://zdpqxgwvzlspdbfsqxmi.supabase.co/functions/v1/badge/46c9a96a-6f0b-439c-b633-bf9b234ea7ed)
![Products](https://zdpqxgwvzlspdbfsqxmi.supabase.co/functions/v1/badge/95bee450-098e-4166-9e5a-8ad473cce33e)

![Supabadge](/public/assets/supabadge-social-share.png)

Create beautiful, live-updating metrics badges for your Supabase projects. Display real-time table counts and statistics in your READMEs, dashboards, and documentation.

## Features

- 🚀 **Live Updates** - Badges automatically reflect current data for public tables
- 🔒 **Secure** - Only stores publishable keys, never your secret keys
- 🎨 **Customizable** - Choose your badge color and label
- ⚡ **Fast** - Optimized edge functions serve badges quickly
- 🔄 **RLS Support** - Manual refresh for tables with Row Level Security
- 📊 **Any Table** - Track row counts from any table in your database

## Quick Start

1. Visit [Supabadge](https://supabadge.vercel.app) (or your deployment URL)
2. Enter your Supabase project details:
   - **Project ID**: Found in your Supabase Dashboard → Settings → General
   - **Publishable Key**: Your `sb_publishable_*` or anon key
   - **Secret Key**: Your `sb_secret_*` or service role key (used only for setup, never stored)
3. Select the table you want to track
4. Customize your badge appearance
5. Copy the badge URL and add it to your README!

## Example Usage

Add a badge to your README:

```markdown
![Users](https://your-project.supabase.co/functions/v1/badge/your-badge-id)
```

Or use HTML for more control:

```html
<img src="https://your-project.supabase.co/functions/v1/badge/your-badge-id" alt="Users" />
```

## How It Works

![Screenshot](/public/assets/supabadge-screenshot.png)

Supabadge creates dynamic SVG badges that fetch data from your Supabase project:

1. **Public Tables**: Badges update automatically using your publishable key
2. **RLS-Protected Tables**: Initial count is cached during setup, manual refresh available

Note: Non-publich schema badges are currently not supported.

## Manual Refresh (for RLS-Protected Tables)

If your table has Row Level Security or is in a non-public schema, you'll need to refresh the count manually:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/badge-refresh/your-badge-id \
  -H "Content-Type: application/json" \
  -d '{"serviceKey": "your-secret-key"}'
```

## API Key Compatibility

Supabadge works with both old and new Supabase API key formats:
- ✅ New keys: `sb_publishable_*` and `sb_secret_*`
- ✅ Legacy JWT keys: `eyJ...`

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/supabadge.git
cd supabadge
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Run the development server:
```bash
pnpm dev
```

### Project Structure

```
supabadge/
├── app/                    # Next.js app (wizard UI)
├── components/             # React components
├── lib/                    # Utilities and helpers
├── supabase/
│   └── functions/
│       ├── badge/         # Badge serving function
│       └── badge-refresh/ # Manual refresh function
└── sql/
    └── schema.sql         # Database schema
```

### Database Schema

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_url TEXT NOT NULL,
  anon_key TEXT NOT NULL,
  label TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  table_name TEXT,
  color TEXT DEFAULT '#4F46E5',
  cached_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Deployment

### Deploy to Vercel

The Next.js UI deploys easily to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fsupabadge)

### Deploy Edge Functions

Use the Supabase CLI to deploy edge functions:

```bash
supabase functions deploy badge
supabase functions deploy badge-refresh
```

## Security Considerations

- 🔐 **Secret keys are never stored** - only used during setup
- 🌐 **Publishable keys only** - safe to store and use in edge functions
- 🛡️ **CORS enabled** - badges can be embedded anywhere
- 🚫 **No direct SQL** - uses REST API for all queries

## Troubleshooting

### "Access to schema is forbidden"
This error occurs when trying to access non-public schemas with a publishable key. Badges for non-public schema tables will always use cached values.

### "Offline" badge
The badge shows "Offline" when:
- The Supabase API is unreachable
- Invalid credentials are provided
- Rate limits are exceeded

### Badge not updating
- For public tables: Check that RLS policies allow read access with the anon key
- For RLS-protected tables: Use the manual refresh endpoint with your secret key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

Made with ❤️ for the Supabase community
