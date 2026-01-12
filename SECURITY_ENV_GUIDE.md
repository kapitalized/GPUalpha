# 🔒 Security Guide: Environment Variables

## ⚠️ CRITICAL: Never Commit `.env.local` to Git

**Your `.env.local` file contains sensitive secrets:**
- Supabase Service Role Key (full database access)
- API keys
- Database credentials
- Other secrets

**If committed to Git, these secrets become PUBLIC and can be used by anyone!**

---

## ✅ What's Protected

The `.gitignore` file ensures these files are **NEVER** committed:

```
.env*.local
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## ✅ Safe Files (Can Be Committed)

These files are **safe** to commit because they don't contain secrets:

- ✅ `ENV_TEMPLATE.md` - Template with placeholder values
- ✅ `.env.example` - Example file (if you create one)
- ✅ Documentation files

---

## 🛡️ How to Verify

### Check if `.env.local` is ignored:

```bash
# This should return ".env.local" if it's properly ignored
git check-ignore .env.local
```

### Check if any `.env` files are tracked:

```bash
# This should return NOTHING (no .env files should be tracked)
git ls-files | grep "\.env"
```

### If `.env.local` was accidentally committed:

**IMMEDIATE ACTIONS:**

1. **Remove from Git tracking** (but keep local file):
   ```bash
   git rm --cached .env.local
   ```

2. **Rotate all exposed secrets:**
   - Rotate Supabase Service Role Key
   - Rotate any API keys
   - Change database passwords if exposed

3. **Clean Git history** (if already pushed):
   ```bash
   # Remove from history (WARNING: rewrites history)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

4. **Verify it's in `.gitignore`**:
   - Check that `.env.local` is listed in `.gitignore`
   - Commit the `.gitignore` file if needed

---

## 📋 Best Practices

### ✅ DO:

1. **Always use `.env.local`** for local development
2. **Use `ENV_TEMPLATE.md`** to document required variables
3. **Verify `.gitignore`** includes `.env*.local`
4. **Check before committing**: `git status` should NOT show `.env.local`
5. **Use environment variables** in production (Vercel, etc.)

### ❌ DON'T:

1. **Never commit `.env.local`** to Git
2. **Never commit `.env`** files
3. **Never hardcode secrets** in source code
4. **Never share `.env.local`** in chat/email
5. **Never commit** files with actual API keys

---

## 🔍 Pre-Commit Checklist

Before committing, always check:

```bash
# 1. Check what files are staged
git status

# 2. Verify no .env files are included
git diff --cached --name-only | grep "\.env"

# 3. If you see .env files, UNSTAGE them:
git reset HEAD .env.local
```

---

## 🚨 If Secrets Are Exposed

If you accidentally committed secrets:

1. **Rotate immediately** - Change all exposed keys/passwords
2. **Remove from Git** - Use `git rm --cached`
3. **Clean history** - If pushed, clean Git history
4. **Monitor** - Check for unauthorized access
5. **Notify team** - If shared repository

---

## 📝 Environment Variables Setup

1. **Copy template**:
   ```bash
   # Don't copy .env.local (it's gitignored)
   # Instead, manually create .env.local using ENV_TEMPLATE.md
   ```

2. **Fill in values**:
   - Get Supabase keys from dashboard
   - Generate CRON_SECRET
   - Add other required variables

3. **Verify it's ignored**:
   ```bash
   git status  # Should NOT show .env.local
   ```

---

## 🔗 Related Files

- `ENV_TEMPLATE.md` - Template for environment variables
- `.gitignore` - Git ignore rules
- `SECURITY_FIX.md` - Previous security fixes

---

**Remember: When in doubt, don't commit it!** 🔒



