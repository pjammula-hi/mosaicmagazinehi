# User Management Guide

## Overview

The Admin Dashboard now includes comprehensive user management features with search, edit, pause/activate, and delete functionality.

---

## Features

### 🔍 **Search Users**

Quickly find users by:
- Full name
- Email address
- Role

**How to use:**
1. Go to Admin Dashboard → User Management
2. Type in the search bar at the top
3. Results filter in real-time
4. Clear search by clicking the X button

---

### ✏️ **Edit User**

Update user information including:
- Full name
- Email address
- Role (student, teacher, guardian, editor, admin)
- Password (for admin/editor roles only)

**How to edit:**
1. Find the user in the list
2. Click the **⋮** (three dots) menu button
3. Select **"Edit"**
4. Update the fields you want to change
5. Click **"Update User"**

**Notes:**
- Email changes are validated to prevent duplicates
- Password field is only shown for admin/editor roles
- Password is optional when editing (leave blank to keep current password)
- New passwords must meet requirements: 8+ chars, uppercase, lowercase, number, special character

---

### ⏸️ **Pause/Activate User**

Temporarily disable or re-enable user access:
- **Pause**: User cannot log in (account remains in system)
- **Activate**: User can log in again

**How to pause/activate:**
1. Find the user in the list
2. Click the **⋮** (three dots) menu button
3. Select **"Pause"** (for active users) or **"Activate"** (for paused users)
4. Status changes immediately

**Use cases:**
- Student graduated or transferred schools
- Temporary suspension
- User requested account pause
- Seasonal access (summer break)

**Status indicators:**
- 🟢 **Green "Active"** badge = User can log in
- 🔴 **Red "Paused"** badge = User cannot log in

---

### 🗑️ **Delete User**

Permanently remove a user from the system:
- Deletes user from database
- Deletes user from Supabase Auth
- Logs deletion in audit trail
- **Cannot be undone!**

**How to delete:**
1. Find the user in the list
2. Click the **⋮** (three dots) menu button
3. Select **"Delete"**
4. Confirm deletion in the popup
5. User is permanently removed

**Notes:**
- You cannot delete your own admin account (safety measure)
- All user data is removed
- Deletion is logged in audit logs
- Consider **pausing** instead if you might need to reactivate the user later

---

## User Table Columns

| Column | Description |
|--------|-------------|
| **Name** | User's full name |
| **Email** | User's email address |
| **Role** | student, teacher, guardian, editor, or admin |
| **Status** | Active (green) or Paused (red) |
| **Created** | Date user was added to system |
| **Actions** | Menu with Edit, Pause/Activate, Delete options |

---

## Role Badges

Users are color-coded by role for quick identification:

- 🟣 **Purple** = Admin
- 🔵 **Blue** = Editor
- 🟢 **Green** = Teacher
- ⚪ **Gray** = Student or Guardian

---

## Workflows

### Adding a New User

1. Click **"Add User"** button
2. Fill in:
   - Full Name
   - Email
   - Role
   - Password (only for admin/editor)
3. Click **"Create User"**
4. User appears in the list
5. User receives access (magic link for students/teachers/guardians)

### Updating User Role

1. Find user → Click **⋮** → **Edit**
2. Change role in dropdown
3. If changing to admin/editor, optionally set password
4. Click **"Update User"**
5. User's access level changes immediately

### Temporarily Disabling Access

1. Find user → Click **⋮** → **Pause**
2. User status changes to "Paused"
3. User cannot log in
4. To restore: Click **⋮** → **Activate**

### Removing a User Completely

1. Find user → Click **⋮** → **Delete**
2. Confirm in popup dialog
3. User is removed from all systems
4. Action is logged in audit trail

---

## Search Tips

### Search by Name
```
John
John Doe
jane
```

### Search by Email
```
student@
@schools.nyc.gov
teacher@
```

### Search by Role
```
admin
editor
student
teacher
```

### Search is Case-Insensitive
- "JOHN" finds "John Doe"
- "Admin" finds all admins
- Partial matches work: "joh" finds "John"

---

## Best Practices

### ✅ Do:
- Search before adding new users to avoid duplicates
- Use **Pause** instead of Delete when you might need to restore access
- Regularly review the user list and remove inactive accounts
- Check audit logs after making changes to users
- Verify email addresses are correct before creating users
- Use consistent naming conventions (First Last)

### ❌ Don't:
- Don't delete users with active submissions (pause instead)
- Don't share admin passwords or create unnecessary admin accounts
- Don't delete your own admin account
- Don't forget to set strong passwords for admin/editor accounts

---

## Audit Trail

All user management actions are logged:

- User created
- User updated (tracks what changed)
- User paused/activated
- User deleted

**To view audit logs:**
1. Click **"Audit Logs"** button in Admin Dashboard header
2. See all user management actions with timestamps
3. View who performed each action
4. Review changes made to users

---

## Security Features

### Password Requirements (Admin/Editor only)
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&* etc.)
- Copy/paste disabled for password fields

### Access Control
- Only admins can manage users
- Editors cannot access user management
- Students/teachers/guardians cannot see user list
- You cannot delete your own account

### Authentication
- Students/teachers/guardians use magic link (no password)
- Admins/editors use password login
- All users created in both database and Supabase Auth
- Sessions are tracked and logged

---

## Troubleshooting

### "Email already in use"
- A user with this email already exists
- Use search to find the existing user
- Edit the existing user if needed

### "Password does not meet requirements"
- Password must be 8+ characters
- Include uppercase, lowercase, number, special character
- Example: `Welcome2024!`

### User can't receive magic link
- Check if user status is "Active" (not paused)
- Verify email address is correct
- Check if Email provider is enabled in Supabase
- See `/MAGIC_LINK_FIX.md` for troubleshooting

### Can't delete a user
- You cannot delete your own account
- Make sure you have admin permissions
- Check if user exists in the list

### Edit modal won't close
- Click "Cancel" button or X in corner
- Press Escape key
- Click outside the modal won't work (by design)

---

## Keyboard Shortcuts

While using the search bar:
- **Escape** = Clear search
- **Enter** = (No action, search is automatic)

While using Edit modal:
- **Escape** = Close modal
- **Enter** = Submit form (when in input field)

---

## Mobile & Responsive Design

The user management interface is fully responsive:
- Table scrolls horizontally on small screens
- Search bar adapts to screen width
- Edit modal is touch-friendly
- Action menu buttons are large enough for touch

---

## Integration with Other Features

### Bulk User Upload
- Add multiple users at once via CSV
- All users appear in searchable list
- Can edit/pause/delete bulk-uploaded users

### Audit Logs
- All user management actions logged
- Track who created/edited/deleted users
- View action timestamps and details

### Reader/Editor Views
- Test user experience by switching views
- See what different roles can access
- Verify permissions are correct

---

## FAQ

**Q: What's the difference between Pause and Delete?**
A: Pause temporarily disables access but keeps the user in the system. Delete permanently removes the user and cannot be undone.

**Q: Can I change a user's email address?**
A: Yes, use the Edit feature. The system validates that the new email isn't already in use.

**Q: Do students need passwords?**
A: No, students/teachers/guardians use magic link authentication (email-only login).

**Q: Can I restore a deleted user?**
A: No, deletion is permanent. You'll need to create a new user account.

**Q: How do I find all paused users?**
A: Use the search feature or look for red "Paused" status badges in the Status column.

**Q: Can editors manage users?**
A: No, only admins have access to user management.

**Q: What happens to a user's submissions if I delete them?**
A: The submissions remain in the system (linked by user ID), but the user account is removed. Consider pausing instead of deleting.

---

## Support

For additional help:
- Check `/AUTHENTICATION_TROUBLESHOOTING.md` for login issues
- See `/MAGIC_LINK_FIX.md` for magic link problems
- Review `/NEXT_STEPS.md` for general setup guidance

---

*Last updated: November 16, 2025*
