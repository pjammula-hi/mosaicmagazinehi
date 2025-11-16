# Production Setup Guide - Mosaic Magazine HI

## Magic Link Redirect URL Configuration

### Problem
Magic links are redirecting to `http://localhost:3000` instead of your production URL.

### Solution

#### 1. Configure Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Update Authentication Settings**
   - Go to: **Authentication** → **URL Configuration**
   - Find the **Redirect URLs** section

3. **Add Production URL**
   ```
   Add these URLs (one per line):
   - https://your-production-domain.com
   - http://localhost:3000
   - http://localhost:3001
   ```

4. **Update Site URL**
   - Set **Site URL** to: `https://your-production-domain.com`

5. **Click Save**

#### 2. Environment Variables

Create a `.env` file in your project root (if deploying to a platform like Vercel, Netlify, etc.):

```bash
# .env file
VITE_APP_URL=https://your-production-domain.com
```

**For Vercel:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add: `VITE_APP_URL` = `https://your-production-domain.com`

**For Netlify:**
1. Go to your Netlify site settings
2. Navigate to **Environment Variables**
3. Add: `VITE_APP_URL` = `https://your-production-domain.com`

**For other platforms:**
Add the environment variable according to your platform's documentation.

#### 3. Verify the Fix

After deploying:

1. **Test Magic Link Flow:**
   - Go to your production site
   - Enter a user email
   - Request magic link
   - Check your email
   - Click the magic link
   - **Verify it redirects to production URL** (not localhost)

2. **Check URL in Email:**
   - The magic link should contain: `https://your-production-domain.com/#access_token=...`
   - NOT: `http://localhost:3000/#access_token=...`

---

## Complete Production Checklist

### ☑️ Supabase Configuration

#### Authentication Settings
- [ ] Site URL set to production domain
- [ ] Production URL added to Redirect URLs
- [ ] Localhost kept for development
- [ ] Email templates reviewed (optional)
- [ ] Rate limiting configured (optional)

#### Edge Functions
- [ ] Server deployed: `supabase functions deploy make-server-2c0f842e`
- [ ] Function logs showing no errors
- [ ] All 38 endpoints accessible

#### Storage
- [ ] Buckets created automatically on first upload
- [ ] Storage policies reviewed
- [ ] File size limits configured (5MB images, 10MB docs)

### ☑️ Environment Variables

Set these in your deployment platform:

```bash
# Required - Set in deployment platform
VITE_APP_URL=https://your-production-domain.com

# Optional - For custom configurations
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** The Supabase URL and anon key are already in `/utils/supabase/info.tsx`, so you only need to set `VITE_APP_URL` if you want to override the redirect URL.

### ☑️ Deployment Platform Setup

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### ☑️ DNS Configuration

- [ ] Domain pointed to deployment platform
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured
- [ ] DNS propagation complete (can take 24-48 hours)

### ☑️ Testing Checklist

#### Authentication Testing
- [ ] Magic link login works from production
- [ ] Magic link redirects to production URL
- [ ] Admin login works
- [ ] Editor login works
- [ ] Password reset flow works
- [ ] Session persistence works

#### User Management Testing
- [ ] Create user
- [ ] Update user
- [ ] Pause/activate user
- [ ] Delete user
- [ ] Bulk upload users

#### Submission Testing
- [ ] Upload files
- [ ] Create submission
- [ ] Update submission
- [ ] Trash/restore submission
- [ ] Accept/reject submission

#### Issue Testing
- [ ] Create issue
- [ ] Add content to issue
- [ ] Publish issue
- [ ] View published issue on landing page

#### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] File uploads work
- [ ] Large file handling
- [ ] Multiple concurrent users

---

## Common Production Issues

### Issue 1: Magic Link Redirects to Localhost
**Symptom:** Magic link emails contain `localhost` URLs  
**Solution:** 
1. Set `VITE_APP_URL` environment variable
2. Add production URL to Supabase redirect URLs
3. Redeploy application

### Issue 2: CORS Errors
**Symptom:** API calls fail with CORS errors  
**Solution:** Server already has CORS enabled. Check that:
1. Edge function is deployed
2. URLs match (https vs http)
3. No trailing slashes in URLs

### Issue 3: File Uploads Fail
**Symptom:** File upload returns errors  
**Solution:**
1. Check storage buckets exist in Supabase
2. Verify file size limits
3. Check browser console for detailed errors

### Issue 4: Users Can't Login
**Symptom:** Login fails in production  
**Solution:**
1. Verify user exists in database
2. Check user is active (not paused)
3. Verify Supabase Auth is enabled
4. Check browser console for errors

---

## Security Best Practices

### ✅ Before Going Live

1. **Review User Permissions**
   - Audit all admin accounts
   - Remove test accounts
   - Verify role assignments

2. **Check Password Policies**
   - 90-day expiry enabled
   - Strong password requirements active
   - Reset tokens expire in 1 hour

3. **Review Storage**
   - Buckets are private
   - Signed URLs configured
   - No public file access

4. **Monitor Logs**
   - Edge function logs reviewed
   - No errors in production
   - Audit logs tracking actions

5. **Backup Strategy**
   - Regular database backups (Supabase handles this)
   - Document export procedures
   - Test restore process

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Edge function health
- [ ] Error rates < 1%
- [ ] User login success rate > 95%

### Weekly Checks
- [ ] Review audit logs
- [ ] Check storage usage
- [ ] Monitor user growth
- [ ] Review submissions

### Monthly Checks
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Test backup restore
- [ ] Performance optimization

---

## Environment Configuration Summary

### Development
```bash
# Uses localhost automatically
# No environment variables needed
# Magic links redirect to http://localhost:3000
```

### Production
```bash
# Set in deployment platform:
VITE_APP_URL=https://your-production-domain.com

# Supabase Dashboard:
# - Site URL: https://your-production-domain.com
# - Redirect URLs: Include production domain
```

---

## Rollback Plan

If issues occur in production:

1. **Immediate:**
   - Revert to previous deployment
   - Check error logs
   - Notify users if needed

2. **Investigation:**
   - Review changed files
   - Check environment variables
   - Verify Supabase configuration

3. **Fix & Redeploy:**
   - Apply fixes locally
   - Test thoroughly
   - Deploy with monitoring

---

## Support Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com

### Project Documentation
- `SERVER_RESTORATION_COMPLETE.md` - Server endpoints
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `QUICK_REFERENCE.md` - Quick reference guide
- `USER_MANAGEMENT_GUIDE.md` - User management

---

## Next Steps After Production Deployment

1. **Test Everything:**
   - Run through all workflows
   - Test with real users
   - Monitor for errors

2. **User Training:**
   - Create user guides
   - Train administrators
   - Provide support channels

3. **Monitor Performance:**
   - Set up alerts
   - Track user engagement
   - Optimize as needed

4. **Plan Updates:**
   - Schedule maintenance windows
   - Communicate changes
   - Keep documentation updated

---

**Last Updated:** November 16, 2025  
**Status:** Ready for Production Deployment 🚀
