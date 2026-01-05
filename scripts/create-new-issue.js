#!/usr/bin/env node

/**
 * Create New Issue Script
 * 
 * Automates the creation of a new monthly magazine issue
 * 
 * Usage:
 *   node scripts/create-new-issue.js --month February --year 2026
 *   npm run create-issue -- --month February --year 2026
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const monthIndex = args.indexOf('--month');
const yearIndex = args.indexOf('--year');

if (monthIndex === -1 || yearIndex === -1) {
    console.error('❌ Error: Missing required arguments');
    console.log('Usage: node scripts/create-new-issue.js --month February --year 2026');
    process.exit(1);
}

const month = args[monthIndex + 1];
const year = parseInt(args[yearIndex + 1]);

if (!month || !year) {
    console.error('❌ Error: Invalid month or year');
    process.exit(1);
}

console.log(`\n🎨 Creating new issue: ${month} ${year}\n`);

// Create folder structure
const issueFolder = path.join(__dirname, '..', 'documents', `${month} ${year}`);

if (fs.existsSync(issueFolder)) {
    console.error(`❌ Error: Issue folder already exists: ${issueFolder}`);
    process.exit(1);
}

// Create directories
fs.mkdirSync(issueFolder, { recursive: true });
console.log(`✅ Created folder: ${issueFolder}`);

// Create placeholder files
const placeholderReadme = `# ${month} ${year} Issue

## Contents

This folder contains all assets for the ${month} ${year} issue of Mosaic Magazine.

### Files:
- 1.jpg - Magazine cover
- 2.jpg through N.jpg - Magazine pages

### Upload Instructions:
1. Export your magazine pages as high-quality JPGs (1200x1600px recommended)
2. Name them sequentially: 1.jpg, 2.jpg, 3.jpg, etc.
3. Place them in this folder
4. Update the database with page count

### Database Entry:
After uploading files, create the issue in the admin panel:
- Month: ${month}
- Year: ${year}
- Cover Image: /documents/${month} ${year}/1.jpg
- Page Count: [number of pages]

---
Created: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(issueFolder, 'README.md'), placeholderReadme);
console.log(`✅ Created README.md`);

// Create issue metadata JSON
const issueMetadata = {
    month,
    year,
    created: new Date().toISOString(),
    status: 'draft',
    coverImage: `/documents/${month} ${year}/1.jpg`,
    pages: [],
    articles: [],
    principalLetter: {
        title: '',
        excerpt: '',
        content: ''
    }
};

fs.writeFileSync(
    path.join(issueFolder, 'metadata.json'),
    JSON.stringify(issueMetadata, null, 2)
);
console.log(`✅ Created metadata.json`);

// Generate SQL insert statement
const sqlInsert = `
-- Insert new issue into database
-- Run this in Supabase SQL Editor after uploading cover image

INSERT INTO issues (month, year, cover_image_url, publication_date, is_published)
VALUES (
  '${month}',
  ${year},
  '/documents/${month} ${year}/1.jpg',
  '${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01',
  false
)
RETURNING id;

-- Save the returned ID and use it when creating articles, pages, etc.
`;

fs.writeFileSync(path.join(issueFolder, 'database-insert.sql'), sqlInsert);
console.log(`✅ Created database-insert.sql`);

// Summary
console.log(`\n✨ Issue created successfully!\n`);
console.log(`📁 Location: ${issueFolder}`);
console.log(`\n📝 Next steps:`);
console.log(`1. Upload magazine cover as: ${issueFolder}/1.jpg`);
console.log(`2. Upload magazine pages as: ${issueFolder}/2.jpg, 3.jpg, etc.`);
console.log(`3. Run the SQL in: ${issueFolder}/database-insert.sql`);
console.log(`4. Use the admin panel to add articles and content`);
console.log(`5. Publish when ready!\n`);
