# 🔧 Fix 404 Error on gpualpha.com

## Quick Diagnosis

Since localhost works but production shows 404, this is **almost always** a deployment/environment issue.

## Most Likely Causes (in order)

### 1. ⚠️ Missing Environment Variables (90% of cases)

**Check Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select your **GPUalpha** project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set for **Production**:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `CRON_SECRET`

**If missing:**
- Add them (copy from your `.env.local`)
- **IMPORTANT:** After adding, you MUST redeploy
- Go to **Deployments** → Click **⋯** → **Redeploy**

### 2. 🔨 Build Failed on Vercel

**Check:**
1. Go to **Deployments** tab in Vercel
2. Look at the latest deployment
3. Is status **Error** or **Failed**?

**If build failed:**
- Click on the deployment
- Click **View Build Logs**
- Fix the errors shown
- Push fixes to GitHub (Vercel auto-redeploys)

### 3. 🌐 Domain Configuration Issue

**Check:**
1. Go to **Settings** → **Domains**
2. Is `gpualpha.com` listed?
3. Is it pointing to **Production** deployment?

**If domain not configured:**
- Add the domain
- Follow DNS setup instructions
- Wait for DNS propagation (can take up to 24 hours)

### 4. 🔀 Wrong Branch Deployed

**Check:**
1. Go to **Settings** → **Git**
2. Is **Production Branch** = `main`?

**If wrong:**
- Change to `main`
- Redeploy

## Quick Fix Steps

### Step 1: Check Deployment Status
```
1. Vercel Dashboard → GPUalpha project
2. Deployments tab
3. Check latest deployment status
```

### Step 2: Check Environment Variables
```
1. Settings → Environment Variables
2. Verify all required vars are set for Production
3. If missing → Add them → Redeploy
```

### Step 3: Test Build Locally
```bash
npm run build
```
If this fails, fix errors before deploying.

### Step 4: Check Build Logs (if deployment failed)
```
1. Click on failed deployment
2. View Build Logs
3. Look for errors (TypeScript, missing deps, etc.)
```

### Step 5: Redeploy
After fixing issues:
- **Option A:** Push a commit: `git commit --allow-empty -m "Trigger redeploy" && git push`
- **Option B:** Vercel Dashboard → Deployments → ⋯ → Redeploy

## Immediate Actions

1. ✅ **Check Vercel Dashboard** - Is deployment successful?
2. ✅ **Check Environment Variables** - Are they all set?
3. ✅ **Redeploy** - After adding env vars, redeploy is required
4. ✅ **Check Domain** - Is gpualpha.com configured?

## Testing After Fix

1. Visit: https://gpualpha.com
2. Should see the GPU Alpha homepage
3. Check browser console (F12) for any errors
4. Try API endpoint: https://gpualpha.com/api/health

## Most Common Fix

**90% of production 404s = Missing Environment Variables**

1. Add all env vars to Vercel Production
2. Redeploy (this is critical!)
3. Wait 1-2 minutes for deployment
4. Test the site

---

**Next Step:** Check Vercel Dashboard → Environment Variables → Redeploy if needed
