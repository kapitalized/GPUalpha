# 🔧 Sentry Setup Guide - Getting Your DSN

## Step-by-Step: Getting Your Sentry DSN (API Key)

### Step 1: Log In to Sentry

1. Go to **https://sentry.io**
2. Click **"Sign In"** (top right)
3. Log in with your existing account

---

### Step 2: Create or Select an Application/Project

**Note**: Sentry may show "Applications" instead of "Projects" - they're the same thing!

#### If you don't have an application/project yet:

1. After logging in, you'll see the **Dashboard**
2. Click **"Create Project"** or **"Create Application"** button (or the **+** icon)
3. Select **"Next.js"** from the platform list
4. Enter application name: **"GPUAlpha"** (or any name you prefer)
5. Click **"Create Project"** or **"Create Application"**

#### If you already have an application:

1. Click on your **application name** from the dashboard
2. Or look for **"Applications"** in the sidebar and click it
3. Select your application from the list

---

### Step 3: Get Your DSN (Data Source Name)

**If you see "Applications" in the sidebar:**

1. Click on your **Application** name (or go to **Applications** → Select your app)
2. In the left sidebar, look for **"Settings"** (gear icon ⚙️)
3. Click **"Settings"** → Look for **"Client Keys (DSN)"** or **"Keys"**
   - It might be under: **Settings** → **Client Keys (DSN)**
   - Or: **Settings** → **Keys**
   - Or: **Settings** → **Projects** → **[Your App]** → **Client Keys**

**Alternative paths:**
- **Applications** → **[Your App]** → **Settings** → **Client Keys (DSN)**
- **Settings** → **Projects** → **[Your App]** → **Client Keys (DSN)**
- Look for a **"Keys"** or **"DSN"** link in the Settings menu

4. You'll see your **DSN** - it looks like this:
   ```
   https://abc123def456@o123456.ingest.sentry.io/7890123
   ```

5. **Copy this DSN** - you'll need it for configuration

---

### Step 4: Alternative - Get DSN from Project Settings

If you can't find "Client Keys", try this:

1. Go to **Settings** → **Projects** → **[Your Project]**
2. Look for **"Client Keys (DSN)"** or **"DSN"** section
3. The DSN will be displayed there

---

### Step 5: Understanding Your DSN

Your DSN has three parts:
```
https://[PUBLIC_KEY]@[ORGANIZATION_ID].ingest.sentry.io/[PROJECT_ID]
```

Example:
```
https://abc123def456789@o1234567.ingest.sentry.io/1234567
```

- **Public Key**: `abc123def456789` - Identifies your project
- **Organization ID**: `o1234567` - Your Sentry organization
- **Project ID**: `1234567` - Your specific project

**You'll use the entire DSN string** in your configuration.

---

## 📝 Quick Reference: Where to Find DSN

### Method 1: Application Settings
```
Sentry Dashboard → Applications → [Your App] → Settings → Client Keys (DSN)
```

### Method 2: Settings Menu
```
Sentry Dashboard → Settings → Projects → [Application Name] → Client Keys
```

### Method 3: Direct Navigation
```
Applications → [Your App] → Settings (⚙️) → Look for "Keys" or "DSN"
```

### Method 4: Direct URL (if you know your org and project slug)
```
https://sentry.io/settings/[org]/projects/[project]/keys/
```

---

## 🔒 Security Notes

### ✅ Safe to Use:
- DSN is **public** and can be exposed in client-side code
- It's designed to be in your frontend code
- It only allows **sending** data, not reading

### ⚠️ Important:
- DSN is **project-specific**
- If you rotate/regenerate it, update your config
- Keep it in environment variables for flexibility

---

## 🎯 Next Steps After Getting DSN

Once you have your DSN:

1. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/1234567
   SENTRY_AUTH_TOKEN=your-auth-token  # Optional, for releases
   ```

2. **Install Sentry**:
   ```bash
   npm install @sentry/nextjs
   ```

3. **Run Sentry Wizard** (recommended):
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
   This will automatically configure everything!

4. **Or manually configure** (if you prefer):
   - Create `sentry.client.config.ts`
   - Create `sentry.server.config.ts`
   - Update `next.config.js`

---

## 🖼️ Visual Guide

### Finding DSN in Sentry UI:

```
┌─────────────────────────────────────┐
│  Sentry Dashboard                   │
│                                     │
│  [Your Project] ← Click here        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Settings (⚙️)                │ │
│  │                               │ │
│  │  Client Keys (DSN) ← Click    │ │
│  │                               │ │
│  │  DSN: https://abc123...       │ │
│  │       [Copy] button           │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### Can't find "Client Keys"?
- Make sure you're in **Project Settings**, not Organization Settings
- Look for **"DSN"** or **"Client Keys"** in the sidebar
- Try the direct URL method above

### DSN not working?
- Make sure you copied the **entire DSN** (starts with `https://`)
- Check that your project is **active**
- Verify you're using the correct project's DSN

### Need to regenerate DSN?
- Go to **Client Keys (DSN)** settings
- Click **"Regenerate"** or **"Revoke"** → **"Create New Key"**
- Update your `.env.local` with the new DSN

---

## 📞 Need Help?

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Support**: https://sentry.io/support/
- **Community Forum**: https://forum.sentry.io/

---

**Once you have your DSN, let me know and I'll help you integrate it into GPUAlpha!** 🚀

