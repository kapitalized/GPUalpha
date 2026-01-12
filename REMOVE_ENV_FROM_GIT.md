# Remove .env.local from Git Repository

## ⚠️ Security Issue
If `.env.local` was committed to Git, it contains sensitive information (API keys, secrets) that is now in your Git history.

## Steps to Remove from Git

### Option 1: Using Git Bash or Command Line (Recommended)

1. **Remove from Git tracking (but keep local file):**
   ```bash
   git rm --cached .env.local
   ```

2. **Commit the removal:**
   ```bash
   git commit -m "Remove .env.local from repository"
   ```

3. **Push to GitHub:**
   ```bash
   git push
   ```

### Option 2: Using GitHub Desktop

1. Open GitHub Desktop
2. Go to the Repository menu → Repository Settings
3. In the Git tab, you can see tracked files
4. Or use the command line from GitHub Desktop:
   - Repository → Open in Command Prompt/PowerShell
   - Run: `git rm --cached .env.local`
   - Commit the change
   - Push to origin

### Option 3: If Git is in PATH

Run these commands in your terminal:
```powershell
cd D:\Github\GPUalpha
git rm --cached .env.local
git commit -m "Remove .env.local from repository"
git push
```

## Verify .gitignore

The `.env.local` file is already in your `.gitignore` file (line 35), so it won't be tracked in the future.

## ⚠️ IMPORTANT: If Sensitive Data Was Committed

If you've already pushed `.env.local` with sensitive data to GitHub:

1. **Rotate all secrets immediately:**
   - Generate new Supabase service role keys
   - Generate new CRON_SECRET
   - Update all API keys
   - Update your `.env.local` with new values

2. **Remove from Git history (advanced):**
   If the file was committed multiple times, you may need to remove it from Git history:
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local" --prune-empty --tag-name-filter cat -- --all
   ```
   
   **WARNING:** This rewrites history. Only do this if you're the only contributor or coordinate with your team.

3. **Force push (only if you removed from history):**
   ```bash
   git push origin --force --all
   ```

## Verify Removal

After pushing, verify the file is removed:
- Check GitHub repository - `.env.local` should not appear in the file list
- The file will still exist locally (which is what you want)

## Next Steps

1. ✅ Ensure `.env.local` is in `.gitignore` (already done)
2. ✅ Remove from Git tracking
3. ✅ Rotate any exposed secrets
4. ✅ Update Vercel environment variables with new secrets if needed
