# ✅ Vercel Environment Variables Checklist

## Current Status

### ✅ You Have (Required for Basic Functionality)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Set
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set  
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Set

### ❌ Missing (Required for Full Functionality)
- ❌ `CRON_SECRET` - **Required** for `/api/prices/update` endpoint

### ⚠️ Optional (Recommended)
- ⚠️ `NEXT_PUBLIC_SENTRY_DSN` - Error tracking (recommended)
- ⚠️ `RUNPOD_API_KEY` - Better GPU price data (optional but recommended)

---

## 🔍 Critical Check: Environment Scope

**IMPORTANT:** Make sure your variables are set for the **Production** environment!

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. For each variable, check the **Environment** column
3. Make sure **Production** is checked ✅

If variables are only set for **Preview** or **Development**, they won't work on `gpualpha.com`!

---

## 🚨 Why You're Getting 404

The 404 error is **NOT** caused by missing `CRON_SECRET` (that only affects price updates).

Most likely causes:
1. **Environment variables not set for Production** (most common)
2. **Build failed** - Check deployment logs
3. **Deployment not redeployed** after adding env vars

---

## ✅ Action Items

### Step 1: Verify Environment Scope
1. Go to: https://vercel.com/dashboard
2. Select your **GPUalpha** project
3. Go to **Settings** → **Environment Variables**
4. For each variable, verify **Production** is checked ✅
5. If not, edit each variable and check **Production**

### Step 2: Add Missing CRON_SECRET
1. Generate a secure secret:
   ```bash
   openssl rand -hex 32
   ```
   Or use the one from your `.env.local` file
2. In Vercel Dashboard:
   - **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `CRON_SECRET`
   - Value: (your generated secret)
   - **IMPORTANT:** Check ✅ **Production**
   - Click **Save**

### Step 3: Redeploy (CRITICAL!)
After adding/changing environment variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes for deployment to complete

**OR** push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

### Step 4: Verify Deployment
1. Check deployment status (should be ✅ Success)
2. Visit: https://gpualpha.com
3. Test API: https://gpualpha.com/api/health

---

## 🔧 Quick Fix Commands

If you have access to your `.env.local` file, you can copy the CRON_SECRET from there:

```bash
# View your local CRON_SECRET (if you have it)
cat .env.local | grep CRON_SECRET
```

Then add it to Vercel with **Production** environment checked.

---

## 📋 Complete Environment Variables List

### Required (Must Have)
```
NEXT_PUBLIC_SUPABASE_URL=https://cycpibwgmkvdpdooqbzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=your-secret-here
```

### Recommended (Nice to Have)
```
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/...
RUNPOD_API_KEY=rpa_your-key-here
```

### Auto-Set (Don't Add)
```
NODE_ENV=production  # Vercel sets this automatically
```

---

## 🎯 Next Steps

1. ✅ **Verify Production environment** is checked for all variables
2. ✅ **Add CRON_SECRET** with Production checked
3. ✅ **Redeploy** the application
4. ✅ **Test** https://gpualpha.com

---

## 🐛 Still Getting 404?

If you've done all the above and still get 404:

1. **Check Build Logs:**
   - Go to **Deployments** → Click on deployment → **View Build Logs**
   - Look for errors

2. **Check Runtime Logs:**
   - Go to **Deployments** → Click on deployment → **Functions** tab
   - Look for runtime errors

3. **Test Health Endpoint:**
   - Visit: https://gpualpha.com/api/health
   - This will show which env vars are missing

4. **Verify Domain:**
   - Go to **Settings** → **Domains**
   - Make sure `gpualpha.com` is configured and pointing to Production

---

**Last Updated:** 2026-01-12
