# Mosaic Magazine CMS Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete Content Management System for Mosaic Magazine.

## Phase 1: Database Setup

### Step 1: Run the Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/xvuvgmppucrsnwkrbluy
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click "Run" to execute

This will create all the necessary tables, indexes, and security policies.

### Step 2: Set up Storage for Images

1. In Supabase Dashboard, go to "Storage"
2. Create a new bucket called `magazine-content`
3. Make it public
4. Set up the following folder structure:
   ```
   magazine-content/
   ├── covers/           (magazine cover images)
   ├── pages/            (magazine page scans)
   ├── articles/         (article featured images)
   ├── artwork/          (student artwork)
   ├── authors/          (author photos)
   └── principal/        (principal photos)
   ```

### Step 3: Add Your First Admin User

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('your-email@example.com', 'Your Name', 'admin', true);
```

## Phase 2: Admin Panel Access

### Development

```bash
npm run dev
```

Then navigate to: `http://localhost:5173/admin`

### Production

The admin panel will be available at: `https://mosaicmagazinejan5.vercel.app/admin`

## Phase 3: Creating Your First Issue

### Using the Admin Panel

1. Log in to the admin panel
2. Click "Issues" → "Create New Issue"
3. Fill in:
   - Month: January
   - Year: 2026
   - Volume: 1
   - Issue Number: 1
   - Upload cover image
   - Set publication date
4. Click "Save Draft" or "Publish"

### Adding Content

#### Principal's Letter
1. Go to "Principal Letters"
2. Select the issue
3. Write the letter content
4. Upload principal's photo
5. Save

#### Articles
1. Go to "Articles" → "Create New"
2. Select the issue
3. Choose/create author
4. Select category
5. Write title, excerpt, and content
6. Upload featured image
7. Set page number
8. Mark as featured (optional)
9. Save

#### Magazine Pages (for flipbook)
1. Go to "Magazine Pages"
2. Select the issue
3. Upload page images in order
4. The system will auto-number them

#### Artwork
1. Go to "Artwork" → "Create New"
2. Select issue
3. Choose/create artist
4. Upload artwork image
5. Add title and description
6. Save

## Phase 4: Monthly Update Workflow

### Template for New Issue

1. **Create New Issue** (first week of month)
   - Set month/year
   - Upload cover
   - Save as draft

2. **Collect Content** (weeks 2-3)
   - Students submit articles/artwork
   - Teachers review submissions
   - Principal writes letter

3. **Add to CMS** (week 3)
   - Create author profiles
   - Upload articles with images
   - Upload artwork
   - Add principal's letter
   - Upload magazine page scans

4. **Review & Publish** (week 4)
   - Preview all content
   - Check for errors
   - Mark issue as "Published"
   - Announce to students

## Phase 5: Content Management Best Practices

### Image Guidelines
- **Cover**: 1200x1600px, JPG/PNG
- **Article Images**: 1200x800px minimum
- **Artwork**: Original resolution, JPG/PNG
- **Author Photos**: 400x400px, square
- **Magazine Pages**: 1200x1600px, JPG (for flipbook)

### SEO Optimization
- Write descriptive article titles
- Add meaningful excerpts (150-200 characters)
- Use relevant categories
- Include author bios

### Content Organization
- Use consistent naming for images
- Tag articles properly
- Keep author profiles updated
- Archive old issues

## Troubleshooting

### Can't see published content?
- Check if issue is marked as "Published"
- Verify RLS policies are enabled
- Clear browser cache

### Images not loading?
- Check Supabase Storage bucket is public
- Verify image URLs are correct
- Check file size (max 5MB recommended)

### Admin panel not accessible?
- Verify you're added to `admin_users` table
- Check Supabase authentication is working
- Clear cookies and try again

## Support

For technical issues, contact: [your-email@example.com]

## Next Steps

After setup:
1. ✅ Migrate January 2026 content to database
2. ✅ Test the admin panel
3. ✅ Train editors on the system
4. ✅ Set up automated backups
5. ✅ Create submission form for students
