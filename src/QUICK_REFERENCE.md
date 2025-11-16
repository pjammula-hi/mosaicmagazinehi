# Mosaic Magazine HI - Quick Reference Guide

## 🚀 Quick Start

### Initial Setup
1. Deploy server: `supabase functions deploy make-server-2c0f842e`
2. Open app in browser
3. Click logo 5 times to reveal admin login
4. Click "Initial Setup"
5. Create first admin account
6. Login with admin credentials

### Common Tasks

#### Create New User (Admin)
1. Login as admin
2. Go to User Management tab
3. Click "Create User"
4. Fill in: email, full name, role, password (for admin/editor only)
5. Submit

#### Submit Content (Student/Teacher)
1. Use magic link login
2. Click "New Submission"
3. Select type (writing, photo, art, etc.)
4. Fill in title and content
5. Optional: Upload file
6. Submit

#### Review Submissions (Editor)
1. Login as editor
2. Go to "Submissions" tab
3. Review pending submissions
4. Accept/Reject with feedback
5. Optional: Assign to issue

#### Publish Magazine Issue (Editor)
1. Create new issue
2. Add title, description, cover image
3. Assign accepted submissions
4. Arrange layout
5. Click "Publish"

---

## 📡 API Endpoints Quick Reference

### Base URL
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-2c0f842e
```

### Authentication Required
Most endpoints require: `Authorization: Bearer YOUR_TOKEN`

### Key Endpoints

#### Setup
```bash
GET  /setup-status           # Check if setup needed
POST /initial-setup          # Create first admin
```

#### Auth
```bash
POST /login                  # Admin/Editor login
GET  /validate-token         # Check session
POST /change-password        # Change password
POST /forgot-password        # Request reset
POST /reset-password         # Reset password
```

#### Users (Admin Only)
```bash
GET    /users                # List all users
POST   /admin/create-user    # Create user
PUT    /admin/update-user    # Update user
PUT    /admin/toggle-user-status  # Pause/activate
DELETE /admin/delete-user    # Delete user
POST   /admin/bulk-create-users   # Bulk upload
```

#### Submissions
```bash
GET    /submissions          # List submissions
POST   /submissions          # Create submission
PUT    /submissions/:id      # Update submission
DELETE /submissions/:id      # Delete permanently
POST   /submissions/:id/trash    # Move to trash
POST   /submissions/:id/restore  # Restore from trash
POST   /submissions/empty-trash  # Empty trash
```

#### Issues
```bash
GET  /issues                 # List issues
POST /issues                 # Create issue
PUT  /issues/:id             # Update issue
POST /issues/:id/publish     # Publish issue
GET  /issues/:id/pages       # Get pages
POST /issues/:id/pages       # Save pages
```

#### Comments
```bash
GET  /comments-pending       # Pending comments
GET  /comments/:submissionId # Get comments
POST /comments               # Create comment
POST /comments/:id/approve   # Approve comment
```

#### Files
```bash
POST /upload-file            # Upload file
```

---

## 🔐 User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Everything - manage users, submissions, issues, comments |
| **Editor** | Manage submissions, issues, comments - no user management |
| **Student** | Submit content, view own submissions |
| **Teacher** | Submit content, view own submissions |

---

## 🔒 Password Requirements

- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*, etc.)
- ⚠️ Admin/Editor passwords expire every 90 days

---

## 📁 File Upload Limits

- **Images**: 5MB max
- **Documents**: 10MB max
- **Supported**: All common formats (PDF, DOCX, JPG, PNG, etc.)
- **Storage**: Private buckets with signed URLs

---

## 🐛 Troubleshooting

### Login Issues
**Problem**: "Invalid credentials"
- ✅ Check email and password are correct
- ✅ Ensure account is active (not paused)
- ✅ Verify role has login permissions (admin/editor)

### Magic Link Issues
**Problem**: Magic link not working
- ✅ Check user exists in system
- ✅ Verify account is active
- ✅ Make sure you're using the correct email

### Upload Issues
**Problem**: File upload fails
- ✅ Check file size (5MB images, 10MB docs)
- ✅ Verify you're logged in
- ✅ Try a different file format

### Password Reset Issues
**Problem**: Can't reset password
- ✅ Check email exists in system
- ✅ Use reset link within 1 hour
- ✅ Don't reuse reset tokens

### Deployment Issues
**Problem**: Server won't deploy
- ✅ Check for syntax errors
- ✅ Verify all imports use `npm:` prefix
- ✅ Ensure regex patterns are simple
- ✅ Check Supabase logs for details

---

## 📊 Data Storage

### KV Store Keys
```
user:{email}              # User records
submission:{id}           # Submissions
issue:{id}                # Magazine issues
page:{issueId}:{pageNum}  # Issue pages
comment:{id}              # Comments
reset:{token}             # Password reset tokens
audit:{timestamp}-{uuid}  # Audit logs
```

### Storage Buckets
```
make-2c0f842e-images      # Image uploads
make-2c0f842e-documents   # Document uploads
```

---

## 🔍 Monitoring

### Check Server Health
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-2c0f842e/setup-status
```

### Check Auth Status
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-2c0f842e/debug-auth \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Logs
1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Select "make-server-2c0f842e"
4. View "Logs" tab

---

## 📞 Support

### Documentation Files
- `SERVER_RESTORATION_COMPLETE.md` - Endpoint details
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `RESTORATION_STATUS_REPORT.md` - Complete status
- `USER_MANAGEMENT_GUIDE.md` - User management
- `MAGIC_LINK_SETUP.md` - Magic link config

### Common Error Codes
- **400**: Bad Request - Check your input data
- **401**: Unauthorized - Check your token/login
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Server Error - Check server logs

---

## ✨ Best Practices

### For Admins
1. Change password every 90 days
2. Review user list regularly
3. Check audit logs for suspicious activity
4. Keep only necessary users active
5. Assign appropriate roles

### For Editors
1. Review submissions promptly
2. Provide constructive feedback
3. Publish issues on schedule
4. Moderate comments fairly
5. Maintain content quality

### For Students/Teachers
1. Submit content early
2. Follow submission guidelines
3. Check submission status regularly
4. Respond to feedback
5. Keep login email safe

---

## 🎯 Key Features

✅ **Invitation-Only Access** - Controlled user creation  
✅ **Magic Link Auth** - Passwordless for students/teachers  
✅ **Traditional Login** - Password-based for admin/editor  
✅ **Hidden Admin Access** - Click logo 5 times  
✅ **Editorial Workflow** - Submit → Review → Accept/Reject  
✅ **Issue Publishing** - Create professional magazine issues  
✅ **Comment Moderation** - Approve comments before display  
✅ **Trash System** - Soft delete with restore  
✅ **Password Management** - Change, reset, expiry  
✅ **Audit Logging** - Track all critical operations  
✅ **File Upload** - Support for images and documents  
✅ **Role-Based Access** - Granular permissions  

---

**Last Updated**: November 16, 2025  
**Version**: 2.0  
**Status**: 🟢 Production Ready
