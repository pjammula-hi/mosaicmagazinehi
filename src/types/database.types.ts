// Mosaic Magazine Database Types
// Auto-generated from Supabase schema

export interface Database {
    public: {
        Tables: {
            issues: {
                Row: {
                    id: string;
                    month: string;
                    year: number;
                    volume: number | null;
                    issue_number: number | null;
                    cover_image_url: string | null;
                    publication_date: string | null;
                    is_published: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    month: string;
                    year: number;
                    volume?: number | null;
                    issue_number?: number | null;
                    cover_image_url?: string | null;
                    publication_date?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    month?: string;
                    year?: number;
                    volume?: number | null;
                    issue_number?: number | null;
                    cover_image_url?: string | null;
                    publication_date?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            authors: {
                Row: {
                    id: string;
                    name: string;
                    bio: string | null;
                    photo_url: string | null;
                    grade: string | null;
                    school: string | null;
                    email: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    bio?: string | null;
                    photo_url?: string | null;
                    grade?: string | null;
                    school?: string | null;
                    email?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    bio?: string | null;
                    photo_url?: string | null;
                    grade?: string | null;
                    school?: string | null;
                    email?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    color: string | null;
                    icon: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    color?: string | null;
                    icon?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    color?: string | null;
                    icon?: string | null;
                    created_at?: string;
                };
            };
            articles: {
                Row: {
                    id: string;
                    issue_id: string | null;
                    author_id: string | null;
                    category_id: string | null;
                    title: string;
                    subtitle: string | null;
                    excerpt: string | null;
                    content: string;
                    featured_image_url: string | null;
                    page_number: number | null;
                    is_featured: boolean;
                    view_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    issue_id?: string | null;
                    author_id?: string | null;
                    category_id?: string | null;
                    title: string;
                    subtitle?: string | null;
                    excerpt?: string | null;
                    content: string;
                    featured_image_url?: string | null;
                    page_number?: number | null;
                    is_featured?: boolean;
                    view_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    issue_id?: string | null;
                    author_id?: string | null;
                    category_id?: string | null;
                    title?: string;
                    subtitle?: string | null;
                    excerpt?: string | null;
                    content?: string;
                    featured_image_url?: string | null;
                    page_number?: number | null;
                    is_featured?: boolean;
                    view_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            magazine_pages: {
                Row: {
                    id: string;
                    issue_id: string;
                    page_number: number;
                    image_url: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    issue_id: string;
                    page_number: number;
                    image_url: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    issue_id?: string;
                    page_number?: number;
                    image_url?: string;
                    created_at?: string;
                };
            };
            principal_letters: {
                Row: {
                    id: string;
                    issue_id: string;
                    title: string;
                    excerpt: string | null;
                    content: string;
                    image_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    issue_id: string;
                    title: string;
                    excerpt?: string | null;
                    content: string;
                    image_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    issue_id?: string;
                    title?: string;
                    excerpt?: string | null;
                    content?: string;
                    image_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            clubs: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    meeting_schedule: string | null;
                    contact_email: string | null;
                    image_url: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    meeting_schedule?: string | null;
                    contact_email?: string | null;
                    image_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    meeting_schedule?: string | null;
                    contact_email?: string | null;
                    image_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            artwork: {
                Row: {
                    id: string;
                    issue_id: string | null;
                    artist_id: string | null;
                    title: string;
                    description: string | null;
                    image_url: string;
                    medium: string | null;
                    is_featured: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    issue_id?: string | null;
                    artist_id?: string | null;
                    title: string;
                    description?: string | null;
                    image_url: string;
                    medium?: string | null;
                    is_featured?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    issue_id?: string | null;
                    artist_id?: string | null;
                    title?: string;
                    description?: string | null;
                    image_url?: string;
                    medium?: string | null;
                    is_featured?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            admin_users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: string;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    role?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
