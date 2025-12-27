# 🧪 Testing Sentry in Development

## ✅ Sentry is Now Enabled in Development

Sentry will now capture errors in development mode so you can test it!

---

## 🎯 How to Test

### Test 1: Trigger an API Error

1. Visit: http://localhost:2000/api/predictions
2. Try to POST invalid data (or visit a non-existent route)
3. Check your Sentry dashboard - you should see the error!

### Test 2: Trigger a Client Error

1. Open browser console (F12)
2. Type: `throw new Error("Test Sentry error")`
3. Press Enter
4. Check your Sentry dashboard - error should appear!

### Test 3: Test via Logger

The logger will automatically send errors to Sentry:

```javascript
// In any API route or component
import { logger } from '../lib/utils/logger'

logger.error('Test error for Sentry', new Error('This is a test'))
```

---

## 📊 View Errors in Sentry

1. Go to **https://sentry.io**
2. Log in
3. Click on your **application/project**
4. Go to **"Issues"** tab
5. You should see your test errors!

---

## 🔍 What You'll See

- **Error message** and stack trace
- **Request details** (URL, method, headers)
- **Browser/device info**
- **User context** (if available)
- **Environment**: development

---

## ⚠️ Note

Sentry is now enabled in development for testing. 

**For production**, you might want to change it back to:
```typescript
enabled: process.env.NODE_ENV === 'production'
```

But for now, you can test and see how it works! 🎉

---

## 🚀 Quick Test Right Now

1. **Visit**: http://localhost:2000/api/test-error (doesn't exist - will trigger 404)
2. **Or**: Open console and type: `throw new Error("Sentry test")`
3. **Check**: https://sentry.io → Your Project → Issues

You should see the error appear within a few seconds!


