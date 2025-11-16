# 🔧 Quick Fix: Magic Link Localhost Redirect Issue

## Problem
Magic links are redirecting to `http://localhost:3000` instead of your production URL.

**Example URL you're seeing:**
```
http://localhost:3000/#access_token=eyJhbGc...&expires_at=1763330381&...
```

**What you should see:**
```
https://your-production-domain.com/#access_token=eyJhbGc...&expires_at=1763330381&...
```

---

## ✅ Solution (2 Steps)

### Step 1: Update Supabase Dashboard (5 minutes)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `leatxjnijihjzxkmhmuk`

2. **Navigate to Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **URL Configuration**

3. **Configure URLs**
   
   **Site URL:**
   ```
   https://your-production-domain.com
   ```
   
   **Redirect URLs (add both):**
   ```
   https://your-production-domain.com
   http://localhost:3000
   ```
   
   This allows magic links to work in both production and development.

4. **Save Changes**
   - Click the **Save** button
   - Wait for confirmation

### Step 2: Set Environment Variable

Choose your deployment platform:

#### Option A: Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Key**: `VITE_APP_URL`
   - **Value**: `https://your-production-domain.com`
4. Click **Save**
5. **Redeploy** your application

#### Option B: Netlify
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add new variable:
   - **Key**: `VITE_APP_URL`
   - **Value**: `https://your-production-domain.com`
4. Click **Save**
5. **Redeploy** your application

#### Option C: Other Platforms
Add this environment variable to your deployment platform:
```bash
VITE_APP_URL=https://your-production-domain.com
```

---

## 🧪 Testing the Fix

### Test 1: Request Magic Link
1. Go to your **production site**
2. Enter email: `jpravin@gmail.com` (or any user email)
3. Click "Send Magic Link"
4. Check your email

### Test 2: Check Email URL
The magic link in your email should now look like:
```
https://your-production-domain.com/#access_token=...
```

**NOT:**
```
http://localhost:3000/#access_token=...
```

### Test 3: Click Magic Link
1. Click the magic link in your email
2. You should be redirected to your **production site**
3. You should be automatically logged in

---

## 📋 Verification Checklist

After making changes:

- [ ] Supabase Site URL updated to production domain
- [ ] Production domain added to Supabase Redirect URLs
- [ ] Environment variable `VITE_APP_URL` set in deployment platform
- [ ] Application redeployed after environment variable change
- [ ] Magic link test successful (redirects to production)
- [ ] Login flow works end-to-end

---

## 🔍 Troubleshooting

### Still Redirecting to Localhost?

**Check 1: Environment Variable**
- Verify `VITE_APP_URL` is set correctly
- Check for typos in the URL
- Ensure no trailing slash: ✅ `.com` ❌ `.com/`

**Check 2: Redeployment**
- Environment variables only apply after redeployment
- Trigger a new deployment
- Clear browser cache

**Check 3: Supabase Configuration**
- Verify changes were saved in Supabase dashboard
- Check both "Site URL" and "Redirect URLs" fields
- Make sure production URL uses HTTPS (not HTTP)

**Check 4: Browser Cache**
- Clear your browser cache
- Try in incognito/private browsing mode
- Test on a different device

### Magic Link Not Working at All?

**Verify User Exists:**
```bash
# The user jpravin@gmail.com needs to exist in your system
# Check in Admin Dashboard → User Management
```

**Check Supabase Email Settings:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Verify email provider is configured
3. Check email delivery logs

---

## 📝 What Changed in the Code

The `MagicLinkLogin.tsx` component now uses:

```typescript
// Before (always used localhost in dev)
emailRedirectTo: window.location.origin

// After (uses environment variable if set)
const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
emailRedirectTo: redirectUrl
```

This means:
- **Production**: Uses `VITE_APP_URL` environment variable
- **Development**: Falls back to `window.location.origin` (localhost)

---

## 🚀 Quick Commands

### Redeploy on Vercel
```bash
vercel --prod
```

### Redeploy on Netlify
```bash
netlify deploy --prod
```

### Check Environment Variables (Local)
```bash
# Create .env file
echo "VITE_APP_URL=https://your-production-domain.com" > .env

# Build and test locally
npm run build
npm run preview
```

---

## ⚡ Expected Timeline

- **Step 1 (Supabase)**: 5 minutes
- **Step 2 (Environment)**: 5 minutes
- **Redeployment**: 2-5 minutes
- **DNS Propagation**: Instant (if domain already set up)
- **Testing**: 5 minutes

**Total Time**: ~15-20 minutes

---

## ✅ Success Criteria

You'll know it's fixed when:

1. ✅ Magic link email contains production URL
2. ✅ Clicking magic link redirects to production site
3. ✅ User is automatically logged in
4. ✅ No localhost URLs appear anywhere
5. ✅ Session persists on production site

---

## 📞 Still Having Issues?

If the problem persists:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

2. **Check Supabase Logs**
   - Go to Supabase Dashboard → Edge Functions
   - Select `make-server-2c0f842e`
   - View logs for errors

3. **Verify Email Delivery**
   - Check spam folder
   - Verify email was sent (check Supabase Auth logs)
   - Try a different email address

---

**Quick Reference:**
- Your Project ID: `leatxjnijihjzxkmhmuk`
- Your Email: `jpravin@gmail.com`
- Current Issue: Localhost redirect
- Fix: Set production URL in Supabase + environment variable

---

**Last Updated**: November 16, 2025  
**Issue**: Magic Link Localhost Redirect  
**Status**: 🔧 Fix Applied - Needs Testing
