# 🔍 404 Error Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Vercel Build Status
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **GPUalpha** project
3. Check **Deployments** tab:
   - ✅ **Success** = Build worked, check runtime errors
   - ❌ **Error** = Build failed, check build logs

### 2. Check Environment Variables
**Most Common Cause**: Missing Supabase environment variables

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify these are set for **Production**:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `CRON_SECRET`

**If missing:**
- Add them (see `VERCEL_ENV_SETUP.md`)
- **Redeploy** after adding (variables don't update existing deployments)

### 3. Check Production Branch
1. Go to **Settings** → **Git**
2. Verify **Production Branch** = `main` (not `dev1` or other)
3. If wrong, change it and redeploy

### 4. Check Build Logs
In the deployment:
1. Click on the deployment
2. Click **View Build Logs**
3. Look for:
   - ❌ TypeScript errors
   - ❌ Missing dependencies
   - ❌ Environment variable errors
   - ❌ Import errors

### 5. Check Runtime Logs
1. In deployment, click **Functions** tab
2. Check for runtime errors
3. Look for Supabase connection errors

## Common Causes & Fixes

### Issue 1: Missing Environment Variables
**Symptoms**: 404 or blank page, build succeeds but app crashes

**Fix**:
1. Add all required env vars to Vercel (see `VERCEL_ENV_SETUP.md`)
2. Redeploy: **Deployments** → **⋯** → **Redeploy**

### Issue 2: Build Failed
**Symptoms**: Deployment shows error, no files generated

**Fix**:
1. Check build logs for specific errors
2. Fix TypeScript/build errors locally: `npm run build`
3. Commit and push fixes
4. Vercel will auto-redeploy

### Issue 3: Wrong Branch Deployed
**Symptoms**: Old code, missing features, 404 on new routes

**Fix**:
1. **Settings** → **Git** → Set **Production Branch** = `main`
2. Redeploy from correct branch

### Issue 4: Domain Not Connected
**Symptoms**: 404 on custom domain, works on `.vercel.app`

**Fix**:
1. **Settings** → **Domains**
2. Verify domain is added and pointing to production
3. Check DNS settings (may take up to 24h to propagate)

## Immediate Actions

### Step 1: Verify Local Build
```bash
npm run build
```
If this fails, fix errors first before deploying.

### Step 2: Check Vercel Dashboard
- [ ] Build status (Success/Error?)
- [ ] Environment variables set?
- [ ] Production branch correct?
- [ ] Domain configured?

### Step 3: Check Deployment Logs
- [ ] Build logs show errors?
- [ ] Runtime logs show errors?
- [ ] Any Supabase connection errors?

### Step 4: Redeploy
After fixing issues:
1. **Deployments** → **⋯** → **Redeploy**
2. Or push a new commit: `git push`

## Quick Fix Checklist

- [ ] All environment variables added to Vercel
- [ ] Production branch set to `main`
- [ ] Build succeeds locally (`npm run build`)
- [ ] Build succeeds on Vercel
- [ ] Domain configured correctly
- [ ] Redeployed after env var changes

## Still Not Working?

1. **Check Vercel Function Logs**: Look for runtime errors
2. **Test API Routes**: Try `/api/index` directly
3. **Check Browser Console**: Look for client-side errors
4. **Verify Supabase**: Check if database is accessible

## Most Likely Fix

**90% of 404s are caused by missing environment variables.**

1. Add all env vars to Vercel (see `VERCEL_ENV_SETUP.md`)
2. Redeploy
3. Check deployment logs for confirmation

---

**Next Steps**: Follow the checklist above, starting with environment variables.


