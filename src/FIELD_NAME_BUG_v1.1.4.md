# 🐛 Field Name Mismatch Bug - v1.1.4

## 🚨 The Problem

After v1.1.3, trash still didn't work because:

### ❌ **Wrong Field Name in Backend Filter:**

```typescript
// v1.1.3 - WRONG! ❌
submissions = submissions.filter((s: any) => !s.is_trashed);  // snake_case
```

### ✅ **Actual Field Name Used by API:**

```typescript
// Line 1459 in trash endpoint
submission.isTrashed = true;  // camelCase!
```

**The filter was checking `is_trashed` but the data has `isTrashed`!**

---

## 🔍 Full Analysis

### Backend Sets (Line 1459):
```typescript
submission.isTrashed = true;        // ✅ camelCase
submission.trashedAt = new Date().toISOString();
submission.trashedBy = user.email;
```

### Backend Filter Used (v1.1.3):
```typescript
submissions.filter((s: any) => !s.is_trashed)  // ❌ snake_case - WRONG!
```

### Result:
- Filter checked `s.is_trashed` which was always `undefined`
- `!undefined` = `true` → all submissions passed the filter
- Both trashed and non-trashed appeared in inbox! 🤦

---

## ✅ The Fix

### 1. Backend Filter - Use Correct Field Name

**File:** `/supabase/functions/server/index.tsx`

```typescript
// Filter out trashed submissions (unless explicitly requesting trash)
const showTrash = c.req.query('trash') === 'true';
if (!showTrash) {
  submissions = submissions.filter((s: any) => !s.isTrashed);  // ✅ camelCase!
} else {
  // If showing trash, only show trashed items
  submissions = submissions.filter((s: any) => s.isTrashed === true);  // ✅ camelCase!
}
```

### 2. Remove Duplicate Frontend Filter

**File:** `/components/EnhancedSubmissionManager.tsx`

**BEFORE:**
```typescript
const filteredSubmissions = submissions.filter(s => {
  // Filter by view mode (inbox or trash)
  if (viewMode === 'inbox' && s.status === 'deleted') return false;  // ❌ Wrong field!
  if (viewMode === 'trash' && s.status !== 'deleted') return false;  // ❌ Wrong field!
  
  // Filter by status
  if (filterStatus !== 'all' && s.status !== filterStatus) return false;
  
  return true;
});
```

**AFTER:**
```typescript
const filteredSubmissions = submissions.filter(s => {
  // Backend now handles inbox/trash filtering via ?trash=true parameter
  // Only filter by status here
  if (filterStatus !== 'all' && s.status !== filterStatus) return false;
  
  return true;
});
```

**Why?**
- Backend now handles trash filtering correctly with `isTrashed`
- Frontend was filtering with wrong field `status === 'deleted'`
- Removed duplicate/incorrect frontend filter

### 3. Add Debug Logging

```typescript
console.log(`[Get Submissions] Total: ${submissions.length}, ShowTrash: ${showTrash}`);

if (!showTrash) {
  const beforeCount = submissions.length;
  submissions = submissions.filter((s: any) => !s.isTrashed);
  console.log(`[Get Submissions] Filtered inbox: ${beforeCount} → ${submissions.length} (removed ${beforeCount - submissions.length} trashed)`);
} else {
  const beforeCount = submissions.length;
  submissions = submissions.filter((s: any) => s.isTrashed === true);
  console.log(`[Get Submissions] Filtered trash: ${beforeCount} → ${submissions.length} (showing only trashed)`);
}

console.log(`[Get Submissions] Returning ${submissions.length} submissions`);
```

---

## 📊 All Field Names Used

### Consistent camelCase throughout:

| Endpoint | Field Set | Value |
|----------|-----------|-------|
| Create submission | `isTrashed` | `false` |
| Move to trash | `isTrashed` | `true` |
| | `trashedAt` | ISO timestamp |
| | `trashedBy` | user.email |
| Restore from trash | `isTrashed` | `false` |
| | `trashedAt` | deleted |
| | `trashedBy` | deleted |
| Empty trash | Filter by | `s.isTrashed` |
| Get submissions | Filter by | `s.isTrashed` |

**All using camelCase `isTrashed` - NO `is_trashed` or `status === 'deleted'`**

---

## 🎯 Complete Flow Now

### 1. Move to Trash (Inbox View):
```
1. User clicks "Move to Trash"
2. POST /submissions/:id/trash
3. Backend: submission.isTrashed = true
4. Frontend: fetchSubmissions() with NO params
5. Backend: GET /submissions (no ?trash=true)
6. Backend filters: !s.isTrashed
7. Returns: Only non-trashed submissions
8. UI: Submission disappears! ✅
```

### 2. View Trash:
```
1. User clicks "Trash" tab
2. setViewMode('trash')
3. useEffect triggers fetchSubmissions()
4. Frontend: GET /submissions?trash=true
5. Backend filters: s.isTrashed === true
6. Returns: Only trashed submissions
7. UI: Shows trash view! ✅
```

### 3. Restore from Trash:
```
1. User in trash view clicks "Restore"
2. POST /submissions/:id/restore
3. Backend: submission.isTrashed = false
4. Frontend: fetchSubmissions() with ?trash=true
5. Backend filters: s.isTrashed === true
6. Returns: Only remaining trashed submissions
7. UI: Restored submission disappears from trash! ✅
```

### 4. View Inbox:
```
1. User clicks "Inbox" tab
2. setViewMode('inbox')
3. useEffect triggers fetchSubmissions()
4. Frontend: GET /submissions (no param)
5. Backend filters: !s.isTrashed
6. Returns: All non-trashed submissions
7. UI: Restored submission appears! ✅
```

---

## 📊 Version History

| Version | Issue | Fix |
|---------|-------|-----|
| v1.0.8 | HTTP method | PUT → POST |
| v1.0.9 | Hoisting | Inline closeModal |
| v1.1.1 | Missing setters | Add state setters |
| v1.1.2 | Missing prop | Add onUpdate |
| v1.1.3 | No filtering | Add backend filter |
| v1.1.4 | **Wrong field name** | **`is_trashed` → `isTrashed`** |

---

## 🚀 Deploy v1.1.4

```bash
git add .
git commit -m "v1.1.4 - Fix field name mismatch: is_trashed → isTrashed"
git push
```

---

## ✅ Expected Console Output After Deploy

### When Moving to Trash:
```
🗑️ Moving submission to trash: abc-123
🗑️ Response status: 200
🗑️ Success: { success: true, submission: {...} }
🗑️ Step 1: Resetting modal state...
🗑️ Step 2: Resetting modal position...
🗑️ Step 3: Resetting submission edit mode...
🗑️ Step 4: Fetching submissions...
[Get Submissions] Total: 10, ShowTrash: false, User: admin@schools.nyc.gov
[Get Submissions] Filtered inbox: 10 → 9 (removed 1 trashed)
[Get Submissions] Returning 9 submissions
🗑️ Step 5: Calling onUpdate...
[EditorDashboard] Submission update triggered
🗑️ Step 6: Showing alert...
```

### When Viewing Trash Tab:
```
[Get Submissions] Total: 10, ShowTrash: true, User: admin@schools.nyc.gov
[Get Submissions] Filtered trash: 10 → 1 (showing only trashed)
[Get Submissions] Returning 1 submissions
```

---

## 🎓 Lesson Learned

**Field naming consistency is CRITICAL!**

When debugging, check:
1. ✅ What field name is SET in the database
2. ✅ What field name is QUERIED in filters
3. ✅ camelCase vs snake_case
4. ✅ Consistent naming across ALL endpoints

In this case:
- ❌ v1.1.3 used `is_trashed` (doesn't exist)
- ✅ v1.1.4 uses `isTrashed` (actual field)

**One character difference broke everything!** 🤦

---

**This should FINALLY make trash work end-to-end!** 🎉
