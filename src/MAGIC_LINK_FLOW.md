# Magic Link Authentication Flow

## Current Problem vs. Expected Behavior

### ❌ Current Behavior (Broken)
```
User enters email
    ↓
Magic link sent to email
    ↓
User clicks link in email
    ↓
❌ Redirects to: http://localhost:3000/#access_token=...
    ↓
😕 User sees error (page not found in production)
```

### ✅ Expected Behavior (After Fix)
```
User enters email
    ↓
Magic link sent to email
    ↓
User clicks link in email
    ↓
✅ Redirects to: https://your-production-domain.com/#access_token=...
    ↓
😊 User automatically logged in
```

---

## Technical Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Requests Magic Link                                 │
│    Location: Production Site (your-domain.com)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend Calls Supabase Auth                             │
│    Code: MagicLinkLogin.tsx                                 │
│    Method: supabase.auth.signInWithOtp()                    │
│    Redirect URL: import.meta.env.VITE_APP_URL               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Supabase Sends Email                                     │
│    To: User's email (jpravin@gmail.com)                     │
│    Contains: Magic link with access token                   │
│    URL Format: {REDIRECT_URL}/#access_token=...             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User Clicks Link in Email                                │
│    Opens: Production site with token in URL                 │
│    Browser: Navigates to production domain                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. App Detects Token in URL                                 │
│    Component: MagicLinkLogin.tsx                            │
│    Event: onAuthStateChange (SIGNED_IN)                     │
│    Extracts: access_token from URL hash                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Verify User in System                                    │
│    Endpoint: /verify-magic-link-user                        │
│    Checks: User exists and is active                        │
│    Returns: User profile data                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. User Logged In                                           │
│    Token: Stored in localStorage                            │
│    User: Stored in localStorage                             │
│    Redirects: To appropriate dashboard                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Points

### 🔧 Point 1: Supabase Dashboard
**Location**: Supabase Dashboard → Authentication → URL Configuration

**Settings to Configure:**
```yaml
Site URL: 
  https://your-production-domain.com

Redirect URLs:
  - https://your-production-domain.com
  - http://localhost:3000  # For development
```

**Why This Matters:**
- Supabase validates redirect URLs against this list
- If URL not in list, magic link will fail
- Site URL is the default redirect

---

### 🔧 Point 2: Environment Variable
**Location**: Deployment Platform (Vercel/Netlify/etc.)

**Variable to Set:**
```bash
VITE_APP_URL=https://your-production-domain.com
```

**Why This Matters:**
- Frontend uses this to tell Supabase where to redirect
- Without it, uses `window.location.origin` (which is localhost in dev)
- Different per environment (dev vs production)

---

### 🔧 Point 3: Code Configuration
**Location**: `/components/MagicLinkLogin.tsx`

**Code Change:**
```typescript
// Line 109-111 (already updated)
const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;

const { error: signInError } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: redirectUrl,  // Uses env var in production
  }
});
```

**Why This Matters:**
- Tells Supabase where to send user after clicking magic link
- Uses environment variable if available
- Falls back to current origin for development

---

## URL Anatomy

### Magic Link URL Structure
```
https://your-domain.com/#access_token=JWT_TOKEN&expires_at=TIMESTAMP&expires_in=3600&refresh_token=TOKEN&token_type=bearer&type=signup
```

**Components:**
- `https://your-domain.com/` - **Base URL** (set by VITE_APP_URL)
- `#` - **Hash separator** (fragment identifier)
- `access_token=...` - **JWT token** for authentication
- `expires_at=...` - **Expiration timestamp** (Unix timestamp)
- `expires_in=...` - **Validity period** (seconds)
- `refresh_token=...` - **Token for refreshing** session
- `token_type=bearer` - **Token type**
- `type=signup` - **Event type** (signup/magiclink)

### Why Hash Fragment?
The hash fragment (`#`) is used because:
1. ✅ Client-side only (not sent to server)
2. ✅ Supabase JS SDK reads from URL hash
3. ✅ Single Page App (SPA) routing compatible
4. ✅ Secure (tokens stay in browser)

---

## Security Considerations

### ✅ What's Secure
- ✅ Tokens only in URL hash (client-side)
- ✅ Tokens expire in 1 hour
- ✅ One-time use tokens
- ✅ HTTPS required in production
- ✅ User verification in backend

### ⚠️ What to Watch
- ⚠️ Don't share magic link URLs
- ⚠️ Tokens visible in browser history
- ⚠️ Must verify redirect URL matches allowed list
- ⚠️ Check user is active before login

---

## Environment Differences

### Development (localhost)
```yaml
Environment:
  VITE_APP_URL: (not set)

Behavior:
  - Uses window.location.origin
  - Result: http://localhost:3000
  - Works for local testing

Magic Link URL:
  http://localhost:3000/#access_token=...
```

### Production (your domain)
```yaml
Environment:
  VITE_APP_URL: https://your-production-domain.com

Behavior:
  - Uses environment variable
  - Result: https://your-production-domain.com
  - Works for real users

Magic Link URL:
  https://your-production-domain.com/#access_token=...
```

---

## Testing Strategy

### Test 1: Development
```bash
# Terminal
npm run dev

# Browser
1. Go to http://localhost:3000
2. Enter email for magic link
3. Check email - should have localhost URL ✅
4. Click link - should work in dev ✅
```

### Test 2: Production
```bash
# After setting VITE_APP_URL and deploying
1. Go to https://your-production-domain.com
2. Enter email for magic link
3. Check email - should have production URL ✅
4. Click link - should work in production ✅
```

### Test 3: Cross-Environment
```bash
# What happens if you:
1. Request magic link from production ✅
2. But email has localhost URL ❌

# Fix: Set VITE_APP_URL in production
```

---

## Debugging Checklist

If magic link still redirects to localhost:

```
□ VITE_APP_URL environment variable is set
□ Environment variable has correct production URL
□ No typos in URL (https, not http)
□ No trailing slash in URL
□ Application was redeployed after setting variable
□ Supabase redirect URLs include production domain
□ Browser cache cleared
□ Tested in incognito mode
□ New magic link requested (not old email)
```

---

## Common Mistakes

### ❌ Mistake 1: Forgot to Redeploy
```
Set environment variable → Forgot to redeploy
Result: Still uses old code without env var
Fix: Always redeploy after changing environment variables
```

### ❌ Mistake 2: Wrong URL Format
```
VITE_APP_URL=your-production-domain.com  ❌ (missing https://)
VITE_APP_URL=https://your-production-domain.com/  ❌ (trailing slash)
VITE_APP_URL=https://your-production-domain.com  ✅ (correct)
```

### ❌ Mistake 3: Not Added to Supabase
```
Set env var ✅
Forgot Supabase redirect URLs ❌
Result: Supabase rejects redirect
Fix: Add URL to Supabase dashboard
```

### ❌ Mistake 4: Using Old Magic Link
```
Requested link before fix
Fixed configuration
Used old link from email
Result: Still goes to localhost
Fix: Request a NEW magic link
```

---

## Success Indicators

### ✅ You'll Know It's Working When:

1. **Email Contains Production URL**
   ```
   Check: Open email HTML/text
   Look for: https://your-production-domain.com
   Not: http://localhost:3000
   ```

2. **Clicking Link Works**
   ```
   Click: Magic link in email
   Opens: Your production site
   Auto-login: Yes
   Dashboard: Loads correctly
   ```

3. **Token in URL is Correct**
   ```
   URL bar shows: https://your-production-domain.com/#access_token=...
   Not: http://localhost:3000/#access_token=...
   ```

4. **User Profile Loads**
   ```
   User name displayed
   Dashboard accessible
   Submissions visible
   Session persists
   ```

---

**Quick Summary:**
1. Set `VITE_APP_URL` in deployment platform
2. Add production URL to Supabase redirect URLs
3. Redeploy application
4. Test with new magic link request

**Last Updated**: November 16, 2025
