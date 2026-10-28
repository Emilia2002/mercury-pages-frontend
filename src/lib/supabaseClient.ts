import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Keep static generation from failing when deployment-time Supabase variables are
// unavailable. Auth requests still require the real project variables at runtime.
const runtimeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const runtimeSupabaseAnonKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(runtimeSupabaseUrl, runtimeSupabaseAnonKey);

