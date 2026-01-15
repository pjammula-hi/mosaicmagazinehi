/**
 * Supabase Client Configuration
 * 
 * SECURITY: This file requires environment variables to be set.
 * Never commit credentials to version control.
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Get environment variables from .env file
// In Vite, import.meta.env is always defined, so we can access it directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// SECURITY: Validate that required environment variables are present
// Fail fast if credentials are missing - do NOT use hardcoded fallbacks
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '🔒 SECURITY ERROR: Missing Supabase credentials!\n\n' +
        'Required environment variables:\n' +
        '  - VITE_SUPABASE_URL\n' +
        '  - VITE_SUPABASE_ANON_KEY\n\n' +
        'Please check your .env file and ensure these variables are set.\n' +
        'See .env.example for reference.'
    )
}

// Additional validation: Check if anon key looks valid (should be a JWT)
if (!supabaseAnonKey.includes('.') || supabaseAnonKey.length < 100) {
    throw new Error(
        '🔒 SECURITY ERROR: Invalid Supabase anon key!\n\n' +
        'The VITE_SUPABASE_ANON_KEY appears to be incomplete or invalid.\n' +
        'It should be a long JWT token (200+ characters).\n\n' +
        'Get the correct key from:\n' +
        'Supabase Dashboard → Settings → API → Project API keys → anon/public'
    )
}

// Create and export the Supabase client
// Note: Database typing temporarily removed due to type inference issues with React 18/19 conflict
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
        schema: 'public'
    },
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
})

// Export configuration for testing/debugging purposes
export const dbConfig = {
    url: supabaseUrl
}

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js'
export type { Database } from '../types/database.types'
