# 🚨 SECURITY FIX: Exposed Supabase Service Role Key

## Critical Issue

Your Supabase Service Role JWT was exposed in your GitHub repository on December 17th, 2025. This key has **full database access** and can bypass all Row Level Security policies.

## ⚠️ IMMEDIATE ACTIONS REQUIRED ⚠️

**The exposed key was committed on December 17th, 2025. Anyone with access to your repository can use it to access your database with full privileges.**

### Step 1: Rotate the Service Role Key in Supabase ⚠️ CRITICAL - DO THIS NOW

1. Go to your Supabase Dashboard: https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/settings/api
2. Scroll to **Service Role** section
3. Click **Reset** or **Reveal** → **Reset service_role key**
4. **Copy the new key** and save it securely
5. Update your `.env.local` file with the new key

**⚠️ IMPORTANT:** The old key is now compromised and must be rotated immediately!

### Step 2: Update Your Local Environment

Update `D:\Github\GPUalpha\.env.local` with the new service role key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cycpibwgmkvdpdooqbzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
CRON_SECRET=your-secure-random-secret
```

### Step 3: Remove from Git History (If Committed)

If the key was committed to Git, you need to remove it from history:

**Option A: Using Git (if you have access)**

```bash
# Remove from current commits (if still in working directory)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

**Option B: Using BFG Repo-Cleaner (Recommended)**

1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Run:
```bash
java -jar bfg.jar --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

**Option C: Contact GitHub Support**

If the repository is public or you're unsure, contact GitHub support to help remove sensitive data from history.

### Step 4: Verify .gitignore is Correct

I've already updated `.gitignore` to include:
- `.env*.local`
- `.env`

Verify these are present in your `.gitignore` file.

### Step 5: Check for Other Exposed Secrets

Search your repository for:
- Any `.env` files
- Hardcoded API keys
- Database credentials
- JWT tokens

## Prevention

### ✅ Already Done
- ✅ `.gitignore` includes `.env*.local` and `.env`
- ✅ Service role key is only in `.env.local` (not committed)

### 🔒 Best Practices Going Forward

1. **Never commit `.env` files** - Always use `.gitignore`
2. **Use environment variables** - Never hardcode secrets
3. **Rotate keys regularly** - Especially if exposed
4. **Use Supabase Anon Key** - For client-side code (has RLS protection)
5. **Use Service Role Key** - Only in server-side API routes, never in client code
6. **Review commits** - Before pushing, check `git diff` for secrets

## Current Status

✅ `.gitignore` properly configured
✅ No secrets found in current codebase
✅ Code updated to support new Supabase key format
⚠️ **ACTION REQUIRED:** 
  1. Rotate the service role key in Supabase immediately
  2. Migrate to new Supabase keys (see `SUPABASE_KEY_MIGRATION.md`)

## After Rotating the Key

1. Update `.env.local` with new key
2. Restart your development server
3. Test that API routes still work
4. Monitor Supabase logs for any unauthorized access attempts

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/platform/api-keys
- GitHub Security: https://docs.github.com/en/code-security/secret-scanning

