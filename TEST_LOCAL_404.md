# Testing 404 Error Locally

## Quick Test Steps

### 1. Start Local Dev Server on Port 2000

```bash
npm run dev:2000
```

Or manually:
```bash
npx next dev -p 2000
```

### 2. Test the Root Route

Open in browser:
- **http://localhost:2000/** (root page)
- **http://localhost:2000/api/index** (API route)
- **http://localhost:2000/api/prices** (API route)

### 3. Check for Errors

**In Terminal:**
- Look for build errors
- Look for Supabase connection errors
- Look for missing environment variable warnings

**In Browser Console (F12):**
- Check for JavaScript errors
- Check Network tab for failed requests
- Look for 404 responses

### 4. Verify Environment Variables

Make sure `.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## Common Issues

### Issue: 404 on Root Route (`/`)

**Check:**
1. Is `app/page.tsx` present? ✅ (should exist)
2. Is `app/layout.tsx` present? ✅ (should exist)
3. Are there build errors? Check terminal output
4. Are environment variables set? Check `.env.local`

### Issue: 404 on API Routes

**Check:**
1. Is `app/api/index/route.ts` present? ✅
2. Is `app/api/prices/route.ts` present? ✅
3. Check terminal for route registration errors

### Issue: Supabase Connection Error

**Symptoms:** Page loads but shows errors, or crashes

**Fix:**
1. Verify `.env.local` has correct Supabase credentials
2. Check Supabase project is active
3. Restart dev server after adding env vars

## Debugging Checklist

- [ ] Dev server starts without errors
- [ ] Root page (`/`) loads
- [ ] API route `/api/index` returns data
- [ ] API route `/api/prices` returns data
- [ ] No console errors in browser
- [ ] Environment variables are loaded (check terminal output)

## Compare with Vercel

If it works locally but not on Vercel:
- ✅ **Environment variables** - Most likely cause
- ✅ **Build configuration** - Check `next.config.js`
- ✅ **Branch deployed** - Verify production branch

If it fails locally too:
- ✅ **Code issue** - Fix locally first
- ✅ **Missing dependencies** - Run `npm install`
- ✅ **TypeScript errors** - Run `npm run build`

## Next Steps

1. **Test locally first** - Fix any issues here
2. **If local works** - Check Vercel environment variables
3. **If local fails** - Fix code issues before deploying

---

**Command to test:**
```bash
npm run dev:2000
```

Then visit: http://localhost:2000


