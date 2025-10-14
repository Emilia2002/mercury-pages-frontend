import { createClient } from '@supabase/supabase-js';

// These variables are pulled from your environment configuration.
// In Next.js, they must be prefixed with NEXT_PUBLIC_ to be available in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This check provides a clear error message if the environment variables are missing.
// This is a common issue when deploying to production.
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Please check your .env.local file or production environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

