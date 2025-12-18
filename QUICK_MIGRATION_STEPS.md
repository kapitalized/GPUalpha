# 🚀 Quick Migration Steps

## Supabase Key Migration - Quick Guide

### Step 1: Get Your New Keys

1. Go to: https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/settings/api
2. Copy:
   - **New Anon Key** (replaces old JWT)
   - **New Service Role Key**: `c0d4ba50-10de-4061-b024-3a562d3d46ae` (rotated from standby - now active)

### Step 2: Update `.env.local`

Open `D:\Github\GPUalpha\.env.local` and update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cycpibwgmkvdpdooqbzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-new-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=c0d4ba50-10de-4061-b024-3a562d3d46ae
CRON_SECRET=your-secure-random-secret
```

**Note**: The service role key `c0d4ba50-10de-4061-b024-3a562d3d46ae` has been rotated from standby to active.

### Step 3: Restart Server

```powershell
# Stop current server (Ctrl+C if running)
# Then restart
cd D:\Github\GPUalpha
$env:PORT=2000
npm run dev
```

### Step 4: Test

1. Visit: http://localhost:2000
2. Check that GPUs load
3. Test API: http://localhost:2000/api/prices
4. Check console for errors

### ✅ Done!

Your code is already updated to support the new key format. Just update your `.env.local` file!

---

**Need more details?** See `SUPABASE_KEY_MIGRATION.md` for full documentation.

