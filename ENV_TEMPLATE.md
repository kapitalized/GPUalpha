# Environment Variables Template

## ⚠️ SECURITY WARNING

**NEVER commit `.env.local` to Git!** It contains sensitive secrets.

This file is automatically ignored by `.gitignore`. If you see `.env.local` in `git status`, something is wrong!

---

## Setup Instructions

Copy this template to `.env.local` and fill in your values:

```env
# Supabase Configuration
# Get these from: https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://cycpibwgmkvdpdooqbzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (Server-side only - NEVER expose in client code)
# Get from Supabase Dashboard → Settings → API → Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Cron Secret (for securing cron job endpoints)
# Generate a secure random string: openssl rand -hex 32
CRON_SECRET=your-secure-random-secret-here

# Google Analytics (Optional)
# Get from: https://analytics.google.com/
NEXT_PUBLIC_GA_ID=G-KT9C7GBWMB

# Sentry Error Tracking (Optional but Recommended)
# Get from: https://sentry.io → Your Project → Settings → Client Keys (DSN)
# See SENTRY_SETUP_GUIDE.md for detailed instructions
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/1234567

# RunPod API Key (Optional but Recommended)
# Get from: https://runpod.io/ → Settings → API Keys
# Used for fetching GPU pricing data from RunPod
RUNPOD_API_KEY=your-runpod-api-key-here

# Environment
NODE_ENV=development
```

## Getting Your Keys

1. **Supabase Anon Key**: 
   - Go to https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/settings/api
   - Copy the "anon public" key

2. **Supabase Service Role Key**:
   - Same page as above
   - Copy the "service_role" key (keep this secret!)

3. **Cron Secret**:
   - Generate with: `openssl rand -hex 32`
   - Or use any secure random string

4. **Google Analytics** (optional):
   - Get from your Google Analytics dashboard
   - Currently set to: `G-KT9C7GBWMB`

5. **Sentry DSN** (optional but recommended):
   - Go to https://sentry.io and log in
   - Navigate to: **Your Project** → **Settings** → **Client Keys (DSN)**
   - Copy the DSN (looks like: `https://abc123@o123456.ingest.sentry.io/1234567`)
   - See `SENTRY_SETUP_GUIDE.md` for detailed step-by-step instructions

6. **RunPod API Key** (optional but recommended):
   - Sign up at: https://runpod.io/
   - Go to: **Settings** → **API Keys**
   - Create a new API key
   - Copy the key (starts with `rpa_`)
   - Used for fetching GPU pricing data (highest priority data source)

## Security Notes

- ⚠️ **NEVER commit `.env.local` to Git** - It's in `.gitignore` for a reason!
- ⚠️ Service role key has full database access - keep it secret
- ✅ Anon key is safe to expose in client-side code (protected by RLS)
- ✅ `.gitignore` protects `.env*.local` files automatically

## Verify It's Protected

After creating `.env.local`, verify it's ignored:
```bash
git status  # Should NOT show .env.local
```

If you see `.env.local` in git status, check that `.gitignore` exists and includes `.env*.local`

See `SECURITY_ENV_GUIDE.md` for more security information.

