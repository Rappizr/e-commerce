import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elbizeymyoertwutkrei.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2yS1oj_0-7pnVfwxZ9Fx_g_tJh9fAbr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

