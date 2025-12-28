# 🎯 Quick Guide: Finding DSN When You See "Applications"

## You're in the Right Place!

If you see **"Applications"** in Sentry, that's correct! Sentry uses "Applications" and "Projects" interchangeably.

---

## 🚀 Quick Steps to Find DSN

### Option 1: From Applications List

1. **Click "Applications"** in the left sidebar (or it might already be selected)
2. **Click on your application name** (e.g., "GPUAlpha" or whatever you named it)
3. In the left sidebar of your application, look for:
   - **Settings** (⚙️ gear icon)
   - Click **Settings**
4. Look for one of these:
   - **"Client Keys (DSN)"**
   - **"Keys"**
   - **"DSN"**
5. **Copy the DSN** - it starts with `https://`

---

### Option 2: From Dashboard

1. From the main **Dashboard**
2. Click on your **application name** (in the recent activity or list)
3. Go to **Settings** → **Client Keys (DSN)**

---

### Option 3: Search in Settings

1. Click **Settings** (⚙️) in the main left sidebar (at the top level)
2. Look for **"Projects"** or **"Applications"** section
3. Click on your application
4. Find **"Client Keys (DSN)"** or **"Keys"**

---

## 📍 Where to Look (Visual Guide)

```
┌─────────────────────────────────────┐
│  Sentry Dashboard                   │
│                                     │
│  Left Sidebar:                     │
│  ├─ Dashboard                       │
│  ├─ Applications  ← You're here!    │
│  │   └─ [Your App] ← Click this    │
│  │       ├─ Issues                 │
│  │       ├─ Performance            │
│  │       ├─ Settings (⚙️) ← Click  │
│  │       │   └─ Client Keys (DSN)   │
│  │       └─ ...                    │
│  └─ Settings                        │
└─────────────────────────────────────┘
```

---

## 🔍 What the DSN Looks Like

When you find it, you'll see something like:

```
DSN
https://abc123def456789@o1234567.ingest.sentry.io/1234567

[Copy] button
```

**Copy the entire URL** starting with `https://`

---

## ❓ Still Can't Find It?

### Try These:

1. **Create a new application** if you don't have one:
   - Click **"Create Project"** or **"+"** button
   - Select **"Next.js"**
   - Name it "GPUAlpha"
   - After creation, the DSN will be shown automatically

2. **Check the URL bar**:
   - When you're in your application, the URL might be:
   - `https://sentry.io/organizations/[org]/projects/[app]/`
   - Try adding `/settings/keys/` to the end

3. **Look for "Installation" or "Setup"**:
   - Sometimes Sentry shows the DSN during initial setup
   - Check if there's a setup wizard or installation guide

4. **Search in the top bar**:
   - Use Sentry's search to find "DSN" or "Client Keys"

---

## 💡 Pro Tip

If you're setting up a new application:

1. **Create the application** (Next.js platform)
2. Sentry will **automatically show you the DSN** during setup
3. **Copy it immediately** - it's right there!

---

## ✅ Once You Have It

Add to `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/1234567
```

Then let me know and I'll help integrate it! 🚀

---

**Can't find it?** Tell me what you see in your Sentry dashboard and I'll guide you step-by-step!


