# ⚠️ ACTION REQUIRED: Add Sentry DSN

## Quick Step

**Add this line to your `.env.local` file:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://9f4927db822278c35fc7dda7f0c1cda7@o4510131841597440.ingest.us.sentry.io/4510601172025344
```

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


