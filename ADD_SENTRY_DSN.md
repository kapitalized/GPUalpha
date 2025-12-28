# ⚠️ ACTION REQUIRED: Add Sentry DSN

## Quick Step

**Add this line to your `.env.local` file:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/1234567
```

**To get your actual DSN:**
1. Go to https://sentry.io and log in
2. Navigate to: **Your Project** → **Settings** → **Client Keys (DSN)**
3. Copy the DSN and replace `your-dsn-here@o123456.ingest.sentry.io/1234567` above

---

## Where to Add It

1. Open `.env.local` in your project root
2. Add the line above (or update if it already exists)
3. Save the file
4. Restart your dev server if running

---

## Verify It Works

After adding the DSN:

1. **In development**: Sentry is disabled by default (won't send errors)
2. **In production**: Errors will automatically be sent to Sentry
3. **Check Sentry dashboard**: https://sentry.io → Your Project → Issues

---

## That's It!

Once you add the DSN, Sentry will start tracking errors automatically in production! 🎉

See `SENTRY_INTEGRATION_COMPLETE.md` for full details.


