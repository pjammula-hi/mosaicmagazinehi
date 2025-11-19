/**
 * Supabase Configuration
 * 
 * Credentials are loaded from environment variables for security.
 * See .env.example for required environment variables.
 */

// Read from environment variables (Vite uses import.meta.env)
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!projectId || !publicAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}