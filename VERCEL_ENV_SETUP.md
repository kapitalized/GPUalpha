# 🔐 Vercel Environment Variables Setup Guide

## ⚠️ Important: Production Deployment

**YES - You MUST add all environment variables to Vercel!**

`.env.local` is **only for local development** and is **NOT deployed** to Vercel. All production environment variables must be set in Vercel's dashboard.

---

## 📋 Required Environment Variables

Add these to your Vercel project:

### 1. **Supabase Configuration** (Required)

```
NEXT_PUBLIC_SUPABASE_URL=https://cycpibwgmkvdpdooqbzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to get them:**
- Go to: https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/settings/api
- Copy the values from your `.env.local` file

**Security Notes:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose (public)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (protected by RLS)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - **KEEP SECRET** (full database access)

---

### 2. **Cron Secret** (Required for Price Updates)

```
CRON_SECRET=your-secure-random-secret-here
```

**Purpose:** Secures the `/api/prices/update` endpoint used by Vercel cron jobs

**Generate a new one:**
```bash
openssl rand -hex 32
```

**Or use the same one from `.env.local`** (recommended for consistency)

---

### 3. **Sentry Error Tracking** (Recommended)

```
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/1234567
```

**Purpose:** Error tracking and monitoring in production

**Note:** This is the same DSN from `ADD_SENTRY_DSN.md`

---

### 4. **Google Analytics** (Optional)

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Purpose:** Analytics tracking (optional)

**Where to get it:**
- Get from: https://analytics.google.com/
- Create a property and copy the Measurement ID (starts with `G-`)

---

### 5. **RunPod API Key** (Optional but Recommended)

```
RUNPOD_API_KEY=your-runpod-api-key-here
```

**Purpose:** Fetches GPU pricing data from RunPod (highest priority data source)

**Where to get it:**
- Sign up at: https://runpod.io/
- Go to: **Settings** → **API Keys**
- Create a new API key
- Copy the key (starts with `rpa_`)

**Note:** Without this key, the price update endpoint will still work but won't fetch RunPod data (uses Vast.ai and Lambda Labs only)

---

### 6. **Node Environment** (Auto-set by Vercel)

```
NODE_ENV=production
```

**Note:** Vercel automatically sets this to `production` for production deployments. You don't need to add it manually.

---

## 🚀 How to Add Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to your Vercel project:**
   - Visit: https://vercel.com/dashboard
   - Select your `GPUalpha` project

2. **Navigate to Settings:**
   - Click **Settings** tab
   - Click **Environment Variables** in the sidebar

3. **Add each variable:**
   - Click **Add New**
   - Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (copy from your `.env.local`)
   - Select environments:
     - ✅ **Production**
     - ✅ **Preview** (optional, for PR previews)
     - ✅ **Development** (optional, if using Vercel dev)
   - Click **Save**

4. **Repeat for all variables:**
   - Add all 5-6 variables listed above
   - Make sure to select the correct environments for each

### Method 2: Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add CRON_SECRET production
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add NEXT_PUBLIC_GA_ID production
```

---

## ✅ Verification Checklist

After adding all variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `CRON_SECRET` added
- [ ] `NEXT_PUBLIC_SENTRY_DSN` added (optional but recommended)
- [ ] `NEXT_PUBLIC_GA_ID` added (optional)
- [ ] `RUNPOD_API_KEY` added (optional but recommended)
- [ ] All variables set for **Production** environment
- [ ] Values match your `.env.local` (except `NODE_ENV`)

---

## 🔄 After Adding Variables

### 1. **Redeploy Your Application**

After adding environment variables, you need to redeploy:

**Option A: Via Dashboard**
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Trigger redeploy with new env vars"
git push
```

**Option C: Via CLI**
```bash
vercel --prod
```

### 2. **Verify Variables Are Loaded**

Check your deployment logs:
- Go to **Deployments** → Click on deployment → **Build Logs**
- Look for any errors about missing environment variables

### 3. **Test Your Application**

After redeploy:
- Visit your production URL
- Test authentication (requires Supabase keys)
- Test API endpoints
- Check Sentry dashboard for errors (if configured)

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Add all required variables to Vercel
- ✅ Use different `CRON_SECRET` for production (optional but recommended)
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never commit to Git)
- ✅ Use Vercel's environment variable encryption
- ✅ Set variables only for needed environments (Production, Preview, Development)

### ❌ DON'T:
- ❌ Commit `.env.local` to Git (already protected by `.gitignore`)
- ❌ Share `SUPABASE_SERVICE_ROLE_KEY` publicly
- ❌ Use the same `CRON_SECRET` across multiple projects
- ❌ Add environment variables to your code/repository

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Verify all Supabase variables are added to Vercel
- Check that variables are set for **Production** environment
- Redeploy after adding variables

### Issue: "CRON_SECRET not configured"

**Solution:**
- Add `CRON_SECRET` to Vercel environment variables
- Make sure it's set for **Production** environment
- Redeploy the application

### Issue: "Sentry not tracking errors"

**Solution:**
- Verify `NEXT_PUBLIC_SENTRY_DSN` is added to Vercel
- Check Sentry dashboard for project configuration
- Ensure DSN matches your Sentry project

### Issue: Variables not updating after redeploy

**Solution:**
- Environment variables are cached during build
- You must **redeploy** after adding/changing variables
- Use `vercel --prod` or trigger a new deployment

---

## 📝 Quick Reference

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```

**Optional Variables (Recommended):**
```
NEXT_PUBLIC_SENTRY_DSN
RUNPOD_API_KEY
```

**Optional Variables:**
```
NEXT_PUBLIC_GA_ID
```

**Auto-Set by Vercel:**
```
NODE_ENV=production
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Environment Variables Docs:** https://vercel.com/docs/concepts/projects/environment-variables
- **Supabase API Settings:** https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/settings/api
- **Sentry Project Settings:** https://sentry.io/settings/

---

**Next Steps:**
1. Add all variables to Vercel dashboard
2. Redeploy your application
3. Test production deployment
4. Monitor Sentry for any errors

🎉 **You're ready for production!**

