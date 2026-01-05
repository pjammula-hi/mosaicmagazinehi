
-- Insert new issue into database
-- Run this in Supabase SQL Editor after uploading cover image

INSERT INTO issues (month, year, cover_image_url, publication_date, is_published)
VALUES (
  'February',
  2026,
  '/documents/February 2026/1.jpg',
  '2026-01-01',
  false
)
RETURNING id;

-- Save the returned ID and use it when creating articles, pages, etc.
