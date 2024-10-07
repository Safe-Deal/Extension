import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE } from "../../constants/supabase";

const { SUPABASE_ANON_KEY, SUPABASE_URL } = SUPABASE;

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export default supabase;
