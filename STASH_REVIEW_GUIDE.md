# Reviewing Stashed Changes

## How to Check What's Stashed

Since git isn't available in this shell, use your terminal or IDE to check:

### Option 1: Using Terminal
```bash
# List all stashes
git stash list

# See what's in the most recent stash
git stash show -p

# See summary of stashed changes
git stash show
```

### Option 2: Using VS Code / Your IDE
- Open Source Control panel
- Look for "Stashed Changes" section
- Click to view what's stashed

## What to Look For

### ✅ Safe to Deploy (Usually):
- Code improvements
- Bug fixes
- New features
- Documentation updates
- Configuration improvements

### ⚠️ Review Carefully:
- Environment variable changes (might have secrets)
- Database migration files
- Large refactoring changes
- Experimental features
- Files that were deleted (might break things)

### ❌ Don't Deploy:
- Files with hardcoded API keys or secrets
- `.env.local` or similar files
- Temporary test files
- Broken/incomplete code

## Recommended Process

1. **Review the stash**:
   ```bash
   git stash show -p
   ```
   This shows the full diff of what's stashed

2. **Check for sensitive data**:
   - Look for API keys, secrets, passwords
   - Check for `.env` files
   - Verify no hardcoded credentials

3. **Check for breaking changes**:
   - Missing files that might break the app
   - Database schema changes that need migration
   - Dependencies that need to be installed

4. **If safe, apply the stash**:
   ```bash
   git stash pop
   # or
   git stash apply
   ```

5. **Test locally**:
   ```bash
   npm run build
   npm run dev
   ```

6. **If everything works, commit and push**:
   ```bash
   git add .
   git commit -m "Apply stashed changes"
   git push origin main
   ```

## Quick Safety Check

Before applying stash, ask:
- [ ] Are there any API keys or secrets in the changes?
- [ ] Are there any `.env` files?
- [ ] Will this break the build?
- [ ] Are all dependencies included?
- [ ] Have I tested these changes before?

---

**Recommendation**: Review the stash first, then decide. If unsure, share what's in the stash and I can help you decide!


