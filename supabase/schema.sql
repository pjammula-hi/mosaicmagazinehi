-- Mosaic Magazine CMS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ISSUES TABLE
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    volume INTEGER,
    issue_number INTEGER,
    cover_image_url TEXT,
    publication_date DATE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, year)
);

-- 2. AUTHORS TABLE
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    photo_url TEXT,
    grade VARCHAR(20),
    school VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    page_number INTEGER,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MAGAZINE PAGES TABLE (for flipbook)
CREATE TABLE IF NOT EXISTS magazine_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(issue_id, page_number)
);

-- 6. PRINCIPAL LETTERS TABLE
CREATE TABLE IF NOT EXISTS principal_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE UNIQUE,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CLUBS TABLE
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_schedule VARCHAR(255),
    contact_email VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ARTWORK TABLE
CREATE TABLE IF NOT EXISTS artwork (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    medium VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'editor', -- 'admin', 'editor', 'contributor'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_issue ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_magazine_pages_issue ON magazine_pages(issue_id);
CREATE INDEX IF NOT EXISTS idx_issues_published ON issues(is_published);
CREATE INDEX IF NOT EXISTS idx_artwork_issue ON artwork(issue_id);

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
    ('Writing/Articles', 'writing-articles', 'Student essays, stories, and articles', '#fca5a5'),
    ('Poetry', 'poetry', 'Student poetry and spoken word', '#d8b4fe'),
    ('Art Gallery', 'art-gallery', 'Visual art and illustrations', '#a7f3d0'),
    ('Project Room', 'project-room', 'Student projects and experiments', '#bae6fd'),
    ('HI Clubs', 'hi-clubs', 'Home Instruction school clubs', '#fde68a'),
    ('Student Opportunities', 'student-opportunities', 'Opportunities for students', '#a5f3fc'),
    ('Teacher Page', 'teacher-page', 'Resources for teachers', '#fbcfe8')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE principal_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published issues" ON issues
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view all categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view articles from published issues" ON articles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = articles.issue_id 
            AND issues.is_published = true
        )
    );

CREATE POLICY "Public can view authors" ON authors
    FOR SELECT USING (true);

CREATE POLICY "Public can view magazine pages from published issues" ON magazine_pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = magazine_pages.issue_id 
            AND issues.is_published = true
        )
    );

CREATE POLICY "Public can view principal letters from published issues" ON principal_letters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = principal_letters.issue_id 
            AND issues.is_published = true
        )
    );

CREATE POLICY "Public can view active clubs" ON clubs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view artwork from published issues" ON artwork
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = artwork.issue_id 
            AND issues.is_published = true
        )
    );

-- Admin policies (authenticated users with admin role can do everything)
-- Note: You'll need to set up authentication and add admin users to the admin_users table
CREATE POLICY "Admins can do everything on issues" ON issues
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
    );

CREATE POLICY "Admins can do everything on articles" ON articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
    );

-- Add similar admin policies for other tables as needed

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_principal_letters_updated_at BEFORE UPDATE ON principal_letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_updated_at BEFORE UPDATE ON artwork
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
