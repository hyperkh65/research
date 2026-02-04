import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Local database or fallback might be needed.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Table name with prefix as requested
export const TABLE_NAME = 'xxxxx_products';
