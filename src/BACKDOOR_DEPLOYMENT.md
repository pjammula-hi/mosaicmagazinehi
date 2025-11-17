# Backdoor Deployment Guide

## Current Issue
The `/emoh` backdoor path wasn't working in production because static hosting providers (Netlify/Vercel) need special configuration to handle client-side routing.

## What Was Fixed

### 1. Added Hosting Configuration Files

**For Netlify** - Created `/public/_redirects`:
```
/emoh /index.html 200
/logos /index.html 200
/*    /index.html   200
```

**For Vercel** - Created `/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/emoh",
      "destination": "/index.html"
    },
    {
      "source": "/logos",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Improved Path Detection
Updated `App.tsx` to support:
- `/emoh` (pathname)
- `/#emoh` (hash)
- Better logging for debugging

## How to Deploy

### If using **Netlify**:
1. The `_redirects` file is already in `/public/`
2. Commit and push your changes
3. Netlify will automatically use the `_redirects` file
4. After deployment, test: `https://www.mosaicmagazinehi.com/emoh`

### If using **Vercel**:
1. The `vercel.json` file is already at the root
2. Commit and push your changes
3. Vercel will automatically use the `vercel.json` config
4. After deployment, test: `https://www.mosaicmagazinehi.com/emoh`

### Universal Solution (Works Immediately):
Use the **hash version** - this works without any server configuration:
```
https://www.mosaicmagazinehi.com/#emoh
```

## Testing

### Test Local Development:
```bash
# Start dev server
npm run dev

# Open in browser:
http://localhost:5173/#emoh
```

### Test Production:
1. **Path version** (requires deployment): `https://www.mosaicmagazinehi.com/emoh`
2. **Hash version** (works now): `https://www.mosaicmagazinehi.com/#emoh`

## Verification Checklist

After deploying, verify:
- [ ] Open browser console and look for purple "Admin/Editor Access" message
- [ ] Navigate to `/#emoh` - should show admin login form
- [ ] Navigate to `/emoh` - should show admin login form (after deployment)
- [ ] Click "Back to Reader Login" - should return to magic link login
- [ ] Normal homepage still shows magic link login

## Quick Fix If Still Not Working

If after deployment `/emoh` still doesn't work:
1. Use the hash version as a permanent solution: `/#emoh`
2. Bookmark it for easy access
3. Share this URL with admin/editor users

Both versions work identically - the hash version just works universally without server configuration.
