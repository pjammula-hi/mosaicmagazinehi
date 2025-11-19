/**
 * Supabase Client Singleton
 * 
 * This file exports a single shared instance of the Supabase client
 * to avoid multiple GoTrueClient instances warning.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Store client in a global variable to persist across hot reloads
declare global {
  var __supabaseClient: SupabaseClient | undefined;
}

// Create a single shared Supabase client instance
// Reuse existing instance if available (for hot module reloading)
export const supabase = globalThis.__supabaseClient ?? createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: globalThis.localStorage,
      storageKey: 'sb-mosaic-auth-token',
    }
  }
);

// Store in global for hot reload persistence
if (!globalThis.__supabaseClient) {
  globalThis.__supabaseClient = supabase;
}