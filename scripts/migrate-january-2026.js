#!/usr/bin/env node

/**
 * Migrate January 2026 Content to Database
 * 
 * This script helps migrate existing January 2026 content to the Supabase database
 * It generates SQL INSERT statements based on existing files
 */

const fs = require('fs');
const path = require('path');

console.log('\n📦 Migrating January 2026 Content to Database\n');

// Configuration
const ISSUE_MONTH = 'January';
const ISSUE_YEAR = 2026;
const DOCUMENTS_PATH = path.join(__dirname, '..', 'documents', 'January 2026');

// Check if folder exists
if (!fs.existsSync(DOCUMENTS_PATH)) {
    console.error(`❌ Error: Documents folder not found: ${DOCUMENTS_PATH}`);
    process.exit(1);
}

// Count pages
const files = fs.readdirSync(DOCUMENTS_PATH);
const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png)$/i));
const pageCount = imageFiles.length;

console.log(`📄 Found ${pageCount} page images`);

// Generate SQL for issue
let sql = `-- Migration SQL for January 2026 Issue
-- Generated: ${new Date().toISOString()}
-- Run this in Supabase SQL Editor

-- 1. Create the issue
INSERT INTO issues (month, year, volume, issue_number, cover_image_url, publication_date, is_published)
VALUES (
  '${ISSUE_MONTH}',
  ${ISSUE_YEAR},
  1,
  1,
  '/documents/January 2026/1.jpg',
  '2026-01-01',
  true
)
RETURNING id;

-- Save the ID from above and replace {ISSUE_ID} below with it

`;

// Generate SQL for pages
sql += `\n-- 2. Create magazine pages\n`;
imageFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
}).forEach((file, index) => {
    const pageNum = index + 1;
    sql += `INSERT INTO magazine_pages (issue_id, page_number, image_url)
VALUES ('{ISSUE_ID}', ${pageNum}, '/documents/January 2026/${file}');\n`;
});

// Generate SQL for principal's letter
sql += `\n-- 3. Create principal's letter
INSERT INTO principal_letters (issue_id, title, excerpt, content, image_url)
VALUES (
  '{ISSUE_ID}',
  'In the fractures, we find the genius.',
  'Welcome to Mosaic—a tribute to our history and a wide-open horizon for our future. This is your canvas for the infinite...',
  'Full letter content goes here...',
  '/images/todd_artistic.png'
);

`;

// Sample articles (you'll need to add real content)
sql += `\n-- 4. Create sample articles
-- First, create authors
INSERT INTO authors (name, grade, school)
VALUES 
  ('Student Name 1', '10th Grade', 'Home Instruction'),
  ('Student Name 2', '11th Grade', 'Home Instruction')
RETURNING id;

-- Replace {AUTHOR_ID_1}, {AUTHOR_ID_2} with returned IDs

-- Get category IDs
SELECT id, name FROM categories;

-- Replace {CATEGORY_ID} with appropriate category ID

-- Create articles
INSERT INTO articles (issue_id, author_id, category_id, title, subtitle, excerpt, content, featured_image_url, page_number, is_featured)
VALUES
  (
    '{ISSUE_ID}',
    '{AUTHOR_ID_1}',
    '{CATEGORY_ID}',
    'Article Title',
    'Article Subtitle',
    'Brief excerpt of the article...',
    'Full article content goes here...',
    '/images/article-image.jpg',
    4,
    true
  );

-- Repeat for each article

`;

// Write SQL file
const outputPath = path.join(__dirname, '..', 'supabase', 'migrate-january-2026.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ Migration SQL generated: ${outputPath}`);
console.log(`\n📝 Next steps:`);
console.log(`1. Open Supabase SQL Editor`);
console.log(`2. Run the SQL file to create the issue`);
console.log(`3. Note the returned issue ID`);
console.log(`4. Replace {ISSUE_ID} in the SQL with the actual ID`);
console.log(`5. Run the rest of the SQL to create pages and content`);
console.log(`6. Use the admin panel to add/edit articles\n`);

// Create a summary JSON
const summary = {
    month: ISSUE_MONTH,
    year: ISSUE_YEAR,
    pageCount,
    files: imageFiles,
    migrationDate: new Date().toISOString(),
    sqlFile: outputPath
};

fs.writeFileSync(
    path.join(__dirname, '..', 'supabase', 'migration-summary.json'),
    JSON.stringify(summary, null, 2)
);

console.log(`✅ Migration summary saved\n`);
