# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "Authentication failed" Error When Logging In

**Symptoms:**
- You see error: "Authentication failed" when trying to log in as admin/editor
- Initial setup completed but login doesn't work

**Possible Causes:**
- Email provider not enabled in Supabase
- Supabase Auth user wasn't created during initial setup
- Incorrect password

**Solutions:**

#### Option A: Verify Email Provider is Enabled
1. Go to Supabase Dashboard: `https://supabase.com/dashboard/project/leatxjnijihzjxkmhmuk`
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. Make sure **"Enable Email provider"** toggle is **ON**
5. Click **Save**

#### Option B: Check if Admin User Exists in Supabase Auth
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Check if your admin email is listed
4. If NOT listed, the auth user wasn't created - proceed to Option C

#### Option C: Reset and Recreate Admin (If Auth User Missing)
1. You'll need to delete the existing admin from the database and recreate it
2. Contact support or use the database console to delete the user from kv_store
3. Refresh the app - it should show the Initial Setup screen again
4. Create the admin account again

#### Option D: Use Forgot Password Feature
1. On the login screen, click **"Forgot Password?"**
2. Enter your admin email
3. Check your email for the reset link
4. Set a new password
5. Try logging in again

---

### 2. "User not found" Error for Magic Link

**Symptoms:**
- User tries to request magic link
- Gets error: "User not found or inactive"

**Solution:**
1. The user must be added to the system first by an admin
2. Log in as admin
3. Go to **User Management**
4. Add the user with their email address
5. Select role: Student, Teacher, or Guardian
6. Now they can use magic link login

---

### 3. Magic Link Email Not Received

**Symptoms:**
- User requests magic link
- Email never arrives

**Solutions:**

#### Check Spam/Junk Folder
- Magic link emails might be filtered as spam

#### Verify Email Provider is Enabled
1. Go to Supabase Dashboard: **Authentication** → **Providers**
2. Ensure **Email provider** is enabled

#### Check Supabase Email Service Status
1. Supabase's built-in email service has rate limits
2. For production, set up custom SMTP:
   - Go to **Project Settings** → **Auth** → **SMTP Settings**
   - Configure your email service (SendGrid, AWS SES, or school email server)

---

### 4. Initial Setup Fails

**Symptoms:**
- Error when creating first admin account
- Setup doesn't complete

**Solutions:**

#### Check Error Message
The error will tell you what went wrong:
- "Failed to create authentication user" → Email provider not enabled
- "Password does not meet requirements" → Password too weak
- "Email already exists" → User already exists (refresh page)

#### Enable Email Provider First
Before running initial setup:
1. Enable Email provider in Supabase (see Option A above)
2. Then try initial setup again

---

### 5. Session Expires / Logged Out Unexpectedly

**Symptoms:**
- User gets logged out randomly
- "Invalid session" errors

**Solution:**
This is expected behavior for security. Sessions expire after:
- **Admin/Editor**: When JWT token expires (typically 1 hour, but Supabase auto-refreshes)
- **Magic Link users**: 30 days

Just log in again.

---

## How to Check System Logs

### Server Logs (Backend)
1. Go to Supabase Dashboard
2. Navigate to **Functions** → **make-server-2c0f842e**
3. Click **Logs**
4. Look for error messages with timestamps

### Browser Console (Frontend)
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages starting with `[Login]`, `[MagicLink]`, etc.

---

## Testing Checklist

After enabling Email provider, test these scenarios:

### ✅ Initial Setup
- [ ] Create first admin account
- [ ] See "Setup Complete" message
- [ ] Admin appears in Supabase **Authentication** → **Users**

### ✅ Admin Login
- [ ] Can login with admin email and password
- [ ] Redirected to Admin Dashboard
- [ ] Can access all admin features

### ✅ Magic Link (After Adding Users)
- [ ] Add a student/teacher user as admin
- [ ] Log out of admin
- [ ] Request magic link with student email
- [ ] Receive email with magic link
- [ ] Click link and get logged in
- [ ] Redirected to Reader Dashboard

---

## Emergency Reset

If everything is broken and you need to start fresh:

### ⚠️ WARNING: This deletes ALL data

1. Go to Supabase Dashboard → **Database** → **Tables**
2. Find table: `kv_store_2c0f842e`
3. Delete all rows (or delete entire table)
4. Go to **Authentication** → **Users**
5. Delete all users
6. Refresh your app
7. Initial setup screen should appear
8. Create admin account again

---

## Support Contacts

- **Supabase Support**: support@supabase.com
- **Supabase Documentation**: https://supabase.com/docs

---

## Configuration Reference

### Supabase Project Details
- **Project ID**: `leatxjnijihzjxkmhmuk`
- **Project URL**: `https://leatxjnijihzjxkmhmuk.supabase.co`
- **Dashboard**: `https://supabase.com/dashboard/project/leatxjnijihzjxkmhmuk`

### Key Settings to Verify
1. **Authentication** → **Providers** → **Email** → **Enabled** ✅
2. **Authentication** → **Configuration** → **Email Confirm** → **Disabled** (for magic links to work smoothly)
3. **Project Settings** → **Auth** → **SMTP Settings** → (Optional, for production)
