/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client with your project credentials.
 * Import this client whenever you need to interact with your Supabase database.
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables (works in both Vite and Node.js)
const supabaseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    process.env.VITE_SUPABASE_URL ||
    'https://xvuvgmppucrsnwkrbluy.supabase.co'

const supabaseAnonKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env file.'
    )
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database connection info (for reference)
export const dbConfig = {
    url: supabaseUrl,
    postgresUrl:
        (typeof import.meta !== 'undefined' && import.meta.env?.DATABASE_URL) ||
        process.env.DATABASE_URL ||
        'postgresql://postgres:iyic4XQBtC7seoRC@db.xvuvgmppucrsnwkrbluy.supabase.co:5432/postgres',
    password:
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_DB_PASSWORD) ||
        process.env.VITE_SUPABASE_DB_PASSWORD ||
        'iyic4XQBtC7seoRC',
}

// Export types for TypeScript (optional but recommended)
export type { User, Session } from '@supabase/supabase-js'
