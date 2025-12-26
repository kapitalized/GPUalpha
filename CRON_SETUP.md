# ⏰ Cron Job Setup for Price Updates

## 🚀 Quick Start (Vercel Free Plan)

**Vercel free plan only allows cron jobs to run once per day.** For frequent updates (every 5 minutes), use an external service:

### Recommended: cron-job.org (Free)

1. Sign up: https://cron-job.org/
2. Create cron job:
   - URL: `https://your-domain.vercel.app/api/prices/update`
   - Method: POST
   - Headers: `Authorization: Bearer gpu-alpha-price-update-secret-7819`
   - Schedule: Every 5 minutes
3. Done! ✅

**Alternative**: GitHub Actions (see Option 2 below)

---

## Overview

The price update endpoint (`/api/prices/update`) fetches data from Vast.ai, Lambda Labs, and RunPod APIs and updates your database. This guide shows how to set it up to run automatically.

## Current Configuration

- **Endpoint**: `POST /api/prices/update`
- **Authentication**: Bearer token (CRON_SECRET)
- **Vercel Free Plan**: Once per day maximum
- **Recommended for frequent updates**: External cron service

## ⚠️ Vercel Free Plan Limitations

**Vercel Hobby (Free) Plan:**
- ✅ Up to 2 cron jobs
- ❌ **Maximum frequency: Once per day**
- ❌ Cannot run every 5 minutes on free plan
- ⏰ Timing not guaranteed (may run within 1-hour window)

**Vercel Pro Plan:**
- ✅ Up to 40 cron jobs
- ✅ Unlimited invocations per day
- ✅ Can run every 5 minutes

## Option 1: Vercel Cron (Free Plan - Once Daily)

### Setup Steps

1. **Update `vercel.json`** (already configured for once daily):
```json
{
  "crons": [
    {
      "path": "/api/prices/update",
      "schedule": "0 12 * * *"
    }
  ]
}
```

**Note**: Free plan only allows once per day. For more frequent updates, use Option 2 (External Cron Service).

2. **Set Environment Variable in Vercel**:
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add: `CRON_SECRET` = `gpu-alpha-price-update-secret-7819` (or your custom secret)
   - Make sure it's set for **Production**, **Preview**, and **Development**

3. **Deploy to Vercel**:
   ```bash
   git add vercel.json
   git commit -m "Update cron schedule to every 5 minutes"
   git push
   ```

4. **Verify in Vercel Dashboard**:
   - Go to your project → **Settings** → **Cron Jobs**
   - You should see the cron job listed
   - Check execution logs to verify it's running

### Schedule Options (Free Plan - Once Daily Only)

- **Once daily at midnight**: `0 0 * * *`
- **Once daily at noon**: `0 12 * * *` (current)
- **Once daily at 6 AM**: `0 6 * * *`
- **Once daily at 6 PM**: `0 18 * * *`

**For more frequent updates (every 5-15 minutes), use Option 2 below.**

## Option 2: External Cron Service (Recommended for Frequent Updates)

**Best for**: Running every 5-15 minutes on Vercel free plan

### Using cron-job.org (Free - Recommended)

1. **Sign up**: https://cron-job.org/
2. **Create a new cron job**:
   - **Title**: GPU Price Update
   - **URL**: `https://your-domain.com/api/prices/update`
   - **Request Method**: POST
   - **Request Headers**: 
     ```
     Authorization: Bearer gpu-alpha-price-update-secret-7819
     Content-Type: application/json
     ```
   - **Schedule**: Every 5 minutes
   - **Active**: ✅

3. **Test the job**:
   - Click "Run now" to test
   - Check your database/logs to verify it worked

### Using GitHub Actions (Free)

Create `.github/workflows/price-update.yml`:

```yaml
name: Price Update Cron

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-prices:
    runs-on: ubuntu-latest
    steps:
      - name: Call Price Update API
        run: |
          curl -X POST https://your-domain.com/api/prices/update \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

**Setup**:
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add secret: `CRON_SECRET` = `gpu-alpha-price-update-secret-7819`
3. Commit the workflow file
4. GitHub will run it automatically

### Using EasyCron (Paid, more reliable)

1. Sign up: https://www.easycron.com/
2. Create cron job:
   - **URL**: `https://your-domain.com/api/prices/update`
   - **Method**: POST
   - **Headers**: `Authorization: Bearer gpu-alpha-price-update-secret-7819`
   - **Schedule**: Every 5 minutes

## Option 3: Local/Server Cron (If self-hosting)

### Linux/Mac

Add to crontab (`crontab -e`):

```bash
*/5 * * * * curl -X POST https://your-domain.com/api/prices/update -H "Authorization: Bearer gpu-alpha-price-update-secret-7819" -H "Content-Type: application/json"
```

### Windows Task Scheduler

1. Open **Task Scheduler**
2. Create **Basic Task**
3. **Trigger**: Daily, repeat every 5 minutes
4. **Action**: Start a program
5. **Program**: `curl.exe`
6. **Arguments**: 
   ```
   -X POST https://your-domain.com/api/prices/update -H "Authorization: Bearer gpu-alpha-price-update-secret-7819" -H "Content-Type: application/json"
   ```

## Testing the Cron Job

### Manual Test (PowerShell)

```powershell
$headers = @{
    "Authorization" = "Bearer gpu-alpha-price-update-secret-7819"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:2000/api/prices/update" -Method POST -Headers $headers
```

### Manual Test (curl)

```bash
curl -X POST http://localhost:2000/api/prices/update \
  -H "Authorization: Bearer gpu-alpha-price-update-secret-7819" \
  -H "Content-Type: application/json"
```

### Expected Response

```json
{
  "success": true,
  "message": "Price update completed",
  "updates": [...],
  "notFound": [...],
  "stats": {
    "vastAiModels": 25,
    "lambdaModels": 15,
    "runPodModels": 20,
    "totalUpdated": 30
  }
}
```

## Security Notes

1. **Never commit CRON_SECRET to Git** - It's already in `.gitignore`
2. **Use a strong secret** - Generate a random string:
   ```bash
   # PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   
   # Bash
   openssl rand -hex 32
   ```
3. **Rotate secrets periodically** - Update CRON_SECRET if exposed
4. **Monitor logs** - Check for unauthorized access attempts

## Troubleshooting

### Cron job not running

1. **Check Vercel logs**: Project → **Deployments** → Click deployment → **Functions** → Check logs
2. **Verify CRON_SECRET**: Must match in both environment and cron service
3. **Check endpoint**: Test manually first
4. **Verify schedule**: Use cron expression validator: https://crontab.guru/

### 401 Unauthorized errors

- Verify `CRON_SECRET` matches in:
  - `.env.local` (local)
  - Vercel environment variables (production)
  - Cron service configuration

### API rate limits

- If hitting rate limits, reduce frequency:
  - Change to `*/10 * * * *` (every 10 minutes)
  - Or `*/15 * * * *` (every 15 minutes)

## Recommended Setup by Plan

### Vercel Free Plan
- **Option A**: Use Vercel cron (once daily) + External service (every 5 min)
- **Option B**: Use only external service (cron-job.org or GitHub Actions)
- **Best**: cron-job.org (free, reliable, every 5 minutes)

### Vercel Pro Plan
- **Option A**: Use Vercel cron directly (every 5 minutes)
- **Option B**: Still use external service (more control)

## Recommended Schedule

- **Development**: Every 15-30 minutes (to save API calls)
- **Production**: Every 5 minutes (for real-time data)
- **Free Plan**: Use external cron service for frequent updates

## Next Steps

1. ✅ Update `vercel.json` with desired schedule
2. ✅ Set `CRON_SECRET` in Vercel environment variables
3. ✅ Deploy to Vercel
4. ✅ Monitor first few executions
5. ✅ Verify price history is being created

Your price history will build up over time as the cron job runs! 📈

