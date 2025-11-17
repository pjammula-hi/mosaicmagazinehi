# 🗑️ Trash Filter Fix - v1.1.3

## 🐛 The Bug

After v1.1.2 fixed the `onUpdate` prop issue:
- ✅ "Submission moved to trash" alert appears
- ✅ Modal closes successfully
- ❌ **But submission still visible in the list!**

---

## 🔍 Root Cause

### Backend Issue:

**File:** `/supabase/functions/server/index.tsx` Line 1267

```typescript
app.get('/make-server-2c0f842e/submissions', async (c) => {
  // ...
  let submissions = await kv.getByPrefix('submission:');
  
  // ❌ NO FILTERING! Returns ALL submissions including trashed ones
  
  return c.json({ submissions });
});
```

The backend was returning **ALL submissions** regardless of `is_trashed` status!

### Frontend Issue:

**File:** `/components/EnhancedSubmissionManager.tsx`

```typescript
const fetchSubmissions = async () => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`
    // ❌ No query parameter to filter trash!
  );
};
```

The frontend wasn't passing any parameter to indicate whether to show trash or inbox.

---

## ✅ The Fix

### 1. Backend - Filter by `is_trashed` Status

**File:** `/supabase/functions/server/index.tsx`

```typescript
app.get('/make-server-2c0f842e/submissions', async (c) => {
  try {
    let submissions = await kv.getByPrefix('submission:');

    // ✅ Filter out trashed submissions (unless explicitly requesting trash)
    const showTrash = c.req.query('trash') === 'true';
    if (!showTrash) {
      submissions = submissions.filter((s: any) => !s.is_trashed);
    } else {
      // If showing trash, only show trashed items
      submissions = submissions.filter((s: any) => s.is_trashed);
    }

    // Filter based on user role
    if (user.role === 'student' || user.role === 'teacher') {
      submissions = submissions.filter((s: any) => s.authorEmail === user.email);
    }

    submissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ submissions });
  } catch (error) {
    // ...
  }
});
```

**Logic:**
- By default: Show only non-trashed submissions (`!s.is_trashed`)
- With `?trash=true`: Show only trashed submissions (`s.is_trashed`)

---

### 2. Frontend - Pass Query Parameter Based on viewMode

**File:** `/components/EnhancedSubmissionManager.tsx`

```typescript
const fetchSubmissions = async () => {
  setLoading(true);
  try {
    // ✅ Add query parameter to show trash or inbox based on viewMode
    const trashParam = viewMode === 'trash' ? '?trash=true' : '';
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions${trashParam}`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );
    const data = await response.json();
    if (response.ok) {
      setSubmissions(data.submissions || []);
    }
  } catch (err) {
    console.error('Error fetching submissions:', err);
  } finally {
    setLoading(false);
  }
};
```

**Logic:**
- If `viewMode === 'inbox'`: Fetch without parameter → shows non-trashed
- If `viewMode === 'trash'`: Fetch with `?trash=true` → shows trashed

---

### 3. Re-fetch When View Mode Changes

```typescript
useEffect(() => {
  fetchSubmissions();
  fetchIssues();
  fetchContributorStatuses();
  fetchContentTypes();
}, [viewMode]); // ✅ Re-fetch when switching between inbox and trash
```

**Before:** Empty dependency array `[]` - only fetched on mount  
**After:** Dependency on `viewMode` - re-fetches when switching views

---

## 🎯 Complete Flow

### Moving to Trash:

1. User clicks "Move to Trash"
2. API sets `is_trashed: true` on submission
3. `fetchSubmissions()` is called
4. Frontend sends: `GET /submissions` (no trash param)
5. Backend filters: `submissions.filter(s => !s.is_trashed)`
6. Response excludes the trashed submission
7. UI updates - submission disappears! ✅

### Viewing Trash:

1. User clicks "Trash" tab
2. `setViewMode('trash')` triggers
3. useEffect dependency triggers `fetchSubmissions()`
4. Frontend sends: `GET /submissions?trash=true`
5. Backend filters: `submissions.filter(s => s.is_trashed)`
6. Response includes only trashed submissions
7. UI shows trash view ✅

### Restoring from Trash:

1. User in trash view clicks "Restore"
2. API sets `is_trashed: false`
3. `fetchSubmissions()` is called with `?trash=true`
4. Backend filters: `submissions.filter(s => s.is_trashed)`
5. Response excludes the restored submission
6. UI updates - submission disappears from trash! ✅
7. User switches to inbox - submission appears there ✅

---

## 📊 Version History

| Version | Issue | Fix |
|---------|-------|-----|
| v1.0.8 | HTTP method wrong | Changed PUT → POST |
| v1.0.9 | Hoisting issue | Inlined closeModal (incomplete) |
| v1.1.1 | Missing state setters | Added all state setters |
| v1.1.2 | Missing onUpdate prop | Added onUpdate to EditorDashboard |
| v1.1.3 | Trashed items still visible | **Filter by is_trashed status** |

---

## 🚀 Deploy v1.1.3

```bash
git add .
git commit -m "v1.1.3 - Filter trashed submissions from inbox view"
git push
```

---

## ✅ Expected Result After v1.1.3

### Inbox View (default):
1. ✅ Shows only non-trashed submissions
2. ✅ Click "Move to Trash" → submission disappears immediately
3. ✅ Alert: "Submission moved to trash"

### Trash View:
1. ✅ Click "Trash" tab
2. ✅ Shows only trashed submissions
3. ✅ Can restore or permanently delete

### Restore:
1. ✅ Click "Restore" in trash view
2. ✅ Submission disappears from trash
3. ✅ Switch to inbox → submission appears there

---

## 🧪 Testing Checklist

After deployment:

- [ ] Move submission to trash in inbox view
- [ ] Verify it disappears from inbox immediately
- [ ] Switch to trash tab
- [ ] Verify submission appears in trash
- [ ] Restore submission from trash
- [ ] Verify it disappears from trash
- [ ] Switch to inbox tab
- [ ] Verify submission reappears in inbox
- [ ] No console errors

---

## 🎓 Lessons Learned

**Always check both frontend AND backend when data isn't updating!**

1. ✅ Frontend UI logic
2. ✅ API request parameters
3. ✅ Backend filtering logic
4. ✅ State dependency triggers

In this case, the backend was returning all data regardless of status, and the frontend wasn't asking for filtered data!

---

**This should finally make trash functionality work end-to-end!** 🎉
