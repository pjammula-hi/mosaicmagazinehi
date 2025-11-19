# Mosaic Magazine HI - Comprehensive Testing Checklist

## 🔍 Pre-Launch Testing Report
**Generated**: November 19, 2025  
**Status**: TESTING IN PROGRESS

---

## ✅ CRITICAL PATH TESTING

### 1. Initial Setup Flow
- [ ] Navigate to app for first time
- [ ] Verify setup screen appears (no users exist)
- [ ] Create admin account with strong password
- [ ] Verify password requirements enforced
- [ ] Confirm redirect to admin login after setup
- [ ] Verify admin can log in with created credentials

### 2. Admin Login & Session Management
- [ ] Admin login with correct credentials → success
- [ ] Admin login with wrong password → error message
- [ ] Admin login with inactive account → proper error
- [ ] Token stored in localStorage
- [ ] Session persists on page refresh
- [ ] Session expires after timeout
- [ ] Logout clears all session data
- [ ] After logout, cannot access admin pages
- [ ] After logout, redirected to login page

### 3. Magic Link Authentication (Students/Teachers)
- [ ] Enter valid student email (@nycstudents.net)
- [ ] Click "Send Magic Link"
- [ ] Check console for magic link (since no email server)
- [ ] Open magic link in browser
- [ ] Verify auto-login and redirect to dashboard
- [ ] Session persists on refresh
- [ ] Logout works correctly
- [ ] After logout, must get new magic link

### 4. Password Management (Admin/Editor)
- [ ] Change password with correct current password
- [ ] Change password rejects weak passwords
- [ ] Change password rejects wrong current password
- [ ] Password expiry warning shows at 90 days
- [ ] Forced password change on expiry
- [ ] Forgot password generates reset link
- [ ] Reset link works within 1 hour
- [ ] Reset link expires after 1 hour
- [ ] Reset link can only be used once
- [ ] Copy-paste disabled on all password fields
- [ ] Password visibility toggle works

### 5. User Management (Admin Only)
- [ ] Admin can view all users
- [ ] Admin can create new users (all roles)
- [ ] Admin can deactivate users
- [ ] Admin can reactivate users
- [ ] Admin cannot create duplicate emails
- [ ] Deactivated users cannot log in
- [ ] Bulk user upload works correctly
- [ ] User search and filtering works

### 6. Submission System (Students/Teachers)
- [ ] Reader can access submission form
- [ ] All content types available (Article, Poetry, Art, Photography)
- [ ] File upload works (images, PDFs)
- [ ] Form validation prevents empty submissions
- [ ] Submission saves to database
- [ ] User can view their submissions
- [ ] Submission status shows correctly (Pending/Approved/Rejected)
- [ ] Cannot edit after submission
- [ ] Multiple file uploads work

### 7. Editorial Workflow (Editor)
- [ ] Editor can view all pending submissions
- [ ] Editor can approve submissions
- [ ] Editor can reject submissions with feedback
- [ ] Approved submissions available for publishing
- [ ] Search and filter submissions work
- [ ] Submission details view works
- [ ] PDF preview works correctly

### 8. Issue Publishing (Editor/Admin)
- [ ] Create new issue with title/description
- [ ] Add approved submissions to issue
- [ ] Drag-and-drop to reorder pages
- [ ] Remove pages from issue
- [ ] Edit page content
- [ ] Publish issue to make it live
- [ ] Published issues appear in repository
- [ ] Issue viewer shows all pages correctly

### 9. Magazine Viewing (All Users)
- [ ] Issue repository shows all published issues
- [ ] Click issue to open viewer
- [ ] Page flipping animation works smoothly
- [ ] Next/Previous buttons work
- [ ] Keyboard navigation (arrow keys) works
- [ ] Page counter displays correctly
- [ ] Full-screen mode works
- [ ] Images load correctly
- [ ] PDFs display properly

### 10. Comment Moderation (Admin/Editor)
- [ ] Users can add comments to issues
- [ ] Comments require approval before showing
- [ ] Moderator can view pending comments
- [ ] Moderator can approve comments
- [ ] Moderator can reject comments
- [ ] Approved comments display on issue
- [ ] Inappropriate comments can be deleted

---

## 🐛 KNOWN ISSUES FIXED

### Recently Resolved:
1. ✅ **401 Unauthorized errors** - Fixed by changing GET endpoints to verifyAnyAuth
2. ✅ **Magic link auth cleanup** - Fixed hash removal timing
3. ✅ **Multiple Supabase client instances** - Fixed with singleton pattern
4. ✅ **Logout loop** - Fixed by clearing Supabase session on logout

---

## ⚠️ POTENTIAL ISSUES TO MONITOR

### 1. Session Management
**Risk Level**: MEDIUM  
**Issue**: Multiple auth systems (Supabase + localStorage) could get out of sync
**Test**: Log in, close browser completely, reopen, verify session state
**Mitigation**: Session monitor checks every 60 seconds

### 2. File Upload Limits
**Risk Level**: MEDIUM  
**Issue**: Large file uploads (images, PDFs) might fail or timeout
**Test**: Upload files of varying sizes (1MB, 5MB, 10MB)
**Mitigation**: Check Supabase storage limits and add file size validation

### 3. Concurrent Editing
**Risk Level**: LOW  
**Issue**: Multiple editors modifying same issue simultaneously
**Test**: Two editors open same issue and make changes
**Mitigation**: Last-write-wins (no conflict resolution currently)

### 4. Password Reset Email
**Risk Level**: HIGH  
**Issue**: No email server configured - reset links only in console
**Test**: Trigger password reset and check console logs
**Action Required**: Configure email provider before production

### 5. Magic Link Email
**Risk Level**: HIGH  
**Issue**: No email server configured - magic links only in console
**Test**: Request magic link and check console logs  
**Action Required**: Configure email provider before production

---

## 🔧 EXTERNAL TESTING TOOLS RECOMMENDED

### 1. **Manual Testing Tools**

#### Browser DevTools (Built-in)
- **Network Tab**: Monitor all API calls, check for 401/500 errors
- **Console**: Watch for JavaScript errors and warnings
- **Application Tab**: Inspect localStorage, session storage
- **Performance Tab**: Check for slow operations

#### Recommended Browser Extensions:
- **React Developer Tools**: Inspect component state
- **Redux DevTools**: Monitor state changes (if using Redux)
- **Lighthouse**: Audit performance, accessibility, SEO
- **WAVE**: Accessibility testing

### 2. **Automated Testing Tools**

#### For End-to-End Testing:
```bash
# Playwright (Recommended - best for complex flows)
npm install -D @playwright/test
```

**Why Playwright?**
- Tests across Chrome, Firefox, Safari
- Auto-waits for elements (reduces flaky tests)
- Screenshot/video recording on failures
- Network interception for testing edge cases

**Example Test**:
```javascript
// tests/auth.spec.js
test('admin login flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[type="email"]', 'admin@schools.nyc.gov');
  await page.fill('input[type="password"]', 'SecurePassword123!');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

#### For API Testing:
```bash
# Postman or Hoppscotch (web-based)
# No installation needed: https://hoppscotch.io/
```

**Test Collection**:
- Create requests for all endpoints
- Save auth tokens as variables
- Chain requests (login → get token → use in other requests)
- Export collection for team sharing

#### For Load Testing:
```bash
# k6 (simple, effective)
npm install -g k6
```

**Example Load Test**:
```javascript
// loadtest.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('https://[your-app-url]/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads in <2s': (r) => r.timings.duration < 2000,
  });
}
```

### 3. **Database Testing**

#### Supabase Dashboard:
- Check row counts after operations
- Verify data integrity
- Monitor table storage size
- Review audit logs

#### SQL Queries to Run:
```sql
-- Check for orphaned data
SELECT * FROM kv_store_2c0f842e 
WHERE key LIKE 'submission:%' 
AND key NOT IN (SELECT key FROM kv_store_2c0f842e WHERE key LIKE 'user:%');

-- Count users by role
SELECT 
  json_extract(value, '$.role') as role,
  COUNT(*) as count
FROM kv_store_2c0f842e
WHERE key LIKE 'user:%'
GROUP BY role;

-- Find inactive users
SELECT value 
FROM kv_store_2c0f842e 
WHERE key LIKE 'user:%' 
AND json_extract(value, '$.isActive') = 0;
```

### 4. **Security Testing**

#### Recommended Tools:
- **OWASP ZAP**: Automated security scanner
- **Burp Suite Community**: Manual security testing
- **npm audit**: Check for vulnerable dependencies

```bash
# Run security audit
npm audit

# Fix fixable vulnerabilities
npm audit fix
```

#### Security Checklist:
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (React escapes by default)
- [ ] CSRF protection (check token validation)
- [ ] Rate limiting on login endpoints
- [ ] Password strength enforcement
- [ ] Secure session storage
- [ ] HTTPS only in production
- [ ] Sensitive data not in console logs (production)

### 5. **Accessibility Testing**

#### Tools:
- **axe DevTools**: Browser extension for a11y testing
- **NVDA** (Windows) or **VoiceOver** (Mac): Screen readers
- **Lighthouse**: Built into Chrome DevTools

#### A11y Checklist:
- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible
- [ ] Alt text on all images
- [ ] Form labels associated with inputs
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader can navigate entire app
- [ ] No flashing content that could trigger seizures

---

## 📊 TESTING PRIORITY MATRIX

| Priority | Feature | Risk if Broken | Users Affected |
|----------|---------|----------------|----------------|
| **P0** | Admin login | Cannot manage platform | Admin |
| **P0** | Student login (magic link) | Cannot access platform | Students |
| **P0** | Issue viewing | Core functionality broken | All |
| **P1** | Submission form | Students cannot contribute | Students |
| **P1** | Editorial review | Cannot publish content | Editors |
| **P2** | Comment moderation | Low engagement risk | All |
| **P2** | User management | Manual workarounds exist | Admin |
| **P3** | Bulk upload | Nice-to-have | Admin |

---

## 🚀 PRE-LAUNCH CHECKLIST

### Before Giving to Students:

#### Technical:
- [ ] All P0 features tested and working
- [ ] All P1 features tested and working
- [ ] Error messages are user-friendly (no technical jargon)
- [ ] Mobile responsive design tested
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance tested (loads in <3 seconds)
- [ ] Backup strategy in place

#### Content:
- [ ] Welcome message/instructions for students
- [ ] Submission guidelines published
- [ ] Sample issue published (if possible)
- [ ] FAQ section created
- [ ] Contact info for support

#### Security:
- [ ] Environment variables secured (not in code)
- [ ] Rate limiting enabled on auth endpoints
- [ ] SQL injection testing completed
- [ ] XSS testing completed
- [ ] Admin backdoor (/emoh) tested and secured

#### Email Setup (CRITICAL):
- [ ] Email provider configured in Supabase
- [ ] Magic link emails sending correctly
- [ ] Password reset emails sending correctly
- [ ] Email templates customized with school branding
- [ ] Test emails sent to multiple providers (Gmail, Outlook, etc.)

#### Documentation:
- [ ] Admin guide created
- [ ] Editor guide created
- [ ] Student guide created
- [ ] Troubleshooting guide created

---

## 🎯 RECOMMENDED TESTING WORKFLOW

### Week 1: Core Features
1. **Day 1-2**: Auth flows (admin, student, logout)
2. **Day 3-4**: User management and submissions
3. **Day 5**: Issue creation and publishing

### Week 2: Advanced Features
1. **Day 1-2**: Comment moderation and editorial workflow
2. **Day 3**: Magazine viewer and page flipping
3. **Day 4**: Edge cases and error handling
4. **Day 5**: Performance and load testing

### Week 3: Polish & Pilot
1. **Day 1-2**: Fix any bugs found
2. **Day 3**: Pilot with 5-10 trusted students
3. **Day 4**: Gather feedback and iterate
4. **Day 5**: Final preparations

### Week 4: Launch
1. Soft launch to small group
2. Monitor closely for issues
3. Gradual rollout to all students
4. Ongoing support and iteration

---

## 📝 BUG REPORT TEMPLATE

When issues are found, use this format:

```
**Title**: Brief description
**Severity**: P0/P1/P2/P3
**User Role**: Admin/Editor/Student
**Steps to Reproduce**:
1. Step one
2. Step two
3. Expected vs Actual result

**Browser/Device**: Chrome 120 / Windows 11
**Error Messages**: [paste console errors]
**Screenshots**: [attach if relevant]
```

---

## 🎓 STUDENT PILOT TEST PLAN

### Selecting Pilot Users:
- 2-3 reliable students (tech-savvy)
- 2-3 teachers
- 1 editor
- Duration: 3-5 days

### What to Test:
1. **Student Experience**:
   - Request magic link
   - View published issues
   - Submit an article
   - Submit artwork
   - Comment on an issue

2. **Teacher Experience**:
   - Same as student
   - Review submission guidelines

3. **Editor Experience**:
   - Review submissions
   - Create an issue
   - Publish an issue
   - Moderate comments

### Feedback Collection:
- Daily check-in survey
- Final feedback session
- Bug reports via shared document
- Usability observations

---

## 🔔 MONITORING IN PRODUCTION

### What to Monitor:
1. **Error Logs**: Check Supabase logs daily
2. **User Activity**: Track daily active users
3. **Submission Rate**: Monitor engagement
4. **Failed Logins**: Watch for auth issues
5. **Page Load Times**: Ensure performance

### Alert Triggers:
- More than 10% error rate on any endpoint
- No submissions for 48 hours (engagement drop)
- Server response time > 3 seconds
- Failed login rate > 20%

---

## ✨ QUALITY GATES

Don't launch until:
- [ ] Zero P0 bugs
- [ ] <5 P1 bugs (with known workarounds)
- [ ] Email system working
- [ ] At least 1 published sample issue
- [ ] Pilot test completed successfully
- [ ] Admin comfortable with all features
- [ ] Student guide published

---

**Next Steps**: 
1. I will now run through the critical paths systematically
2. Report any issues found
3. Provide recommendations for stability improvements
