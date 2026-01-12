# 🚨 Deployment Troubleshooting - 404 Error on gpualpha.com

## Current Issue
- Site shows 404 after merging Dev1 → Main
- Not sure what's deployed to GitHub/Vercel

## Quick Diagnosis Steps

### 1. Check Vercel Deployment Status

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your GPUalpha project**
3. **Check Deployments tab**:
   - Look at the latest deployment
   - Check if it shows ✅ Success or ❌ Error
   - Click on the deployment to see build logs

### 2. Check Which Branch is Deployed

In Vercel Dashboard:
- Go to **Settings** → **Git**
- Check which branch is connected to **Production**
- Should be `main` (or `master`)
- Verify the branch name matches your GitHub branch

### 3. Check Build Logs

In the failed deployment:
- Click **View Build Logs**
- Look for errors like:
  - ❌ Build failed
  - ❌ Missing environment variables
  - ❌ TypeScript errors
  - ❌ Missing dependencies

### 4. Check Domain Configuration

In Vercel Dashboard:
- Go to **Settings** → **Domains**
- Verify `gpualpha.com` is configured
- Check if domain is pointing to the correct deployment

## Common Causes of 404 After Branch Merge

### Issue 1: Build Failed
**Symptoms**: Deployment shows error, no files deployed
**Solution**: 
- Check build logs for errors
- Fix TypeScript/build errors
- Redeploy

### Issue 2: Wrong Branch Deployed
**Symptoms**: Old code deployed, missing new features
**Solution**:
- Verify production branch in Vercel settings
- Ensure `main` branch is set as production
- Redeploy from correct branch

### Issue 3: Missing Environment Variables
**Symptoms**: Build succeeds but app crashes on load
**Solution**:
- Check Vercel environment variables
- Ensure all required vars are set (see VERCEL_ENV_SETUP.md)
- Redeploy after adding variables

### Issue 4: Domain Not Connected
**Symptoms**: 404 on custom domain, but works on .vercel.app
**Solution**:
- Check domain configuration in Vercel
- Verify DNS settings
- Wait for DNS propagation (up to 24 hours)

## Immediate Actions

### Step 1: Check Current Deployment
```bash
# In your terminal (if git is available):
git branch                    # See current branch
git status                    # See uncommitted changes
git log --oneline -5         # See recent commits
```

### Step 2: Verify Local Build Works
```bash
npm run build
```
If this fails, fix the errors first before deploying.

### Step 3: Check Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Find your GPUalpha project
3. Check the latest deployment status
4. Review build logs for errors

### Step 4: Verify Branch Configuration
In Vercel:
- **Settings** → **Git** → **Production Branch**
- Should be: `main` (or `master`)
- If it's set to `dev1`, change it to `main`

### Step 5: Force Redeploy
If everything looks correct:
1. In Vercel Dashboard → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger deployment

## Branch Management

### Current Situation
- You have `dev1` and `main` branches
- You merged `dev1` → `main`
- Now `gpualpha.com` shows 404

### Recommended Actions

1. **Verify Main Branch Has All Code**:
   ```bash
   git checkout main
   git pull origin main
   # Verify app/page.tsx exists
   # Verify all files are present
   ```

2. **Ensure Main is Production Branch**:
   - Vercel Settings → Git → Production Branch = `main`
   - Not `dev1`

3. **Push Main to Trigger Deployment**:
   ```bash
   git checkout main
   git push origin main
   ```

## Quick Fix Checklist

- [ ] Check Vercel deployment status (Success/Error?)
- [ ] Review build logs for errors
- [ ] Verify production branch is `main` (not `dev1`)
- [ ] Check all environment variables are set in Vercel
- [ ] Verify domain `gpualpha.com` is connected in Vercel
- [ ] Test local build: `npm run build`
- [ ] Force redeploy from Vercel dashboard
- [ ] Check DNS settings if domain issue persists

## If Build is Failing

Common build errors and fixes:

1. **TypeScript Errors**:
   - Run `npm run build` locally
   - Fix all TypeScript errors
   - Commit and push

2. **Missing Dependencies**:
   - Check `package.json` is committed
   - Ensure all dependencies are listed

3. **Environment Variables**:
   - Add all required vars in Vercel
   - Redeploy after adding

4. **Missing Files**:
   - Ensure `app/page.tsx` exists
   - Ensure `app/layout.tsx` exists
   - Check all imports are valid

## Next Steps

1. **Check Vercel Dashboard** - This will tell you exactly what's wrong
2. **Review Build Logs** - Shows specific errors
3. **Fix Issues** - Based on error messages
4. **Redeploy** - After fixes

---

**Most Likely Cause**: Build failure or wrong branch deployed. Check Vercel dashboard first!


