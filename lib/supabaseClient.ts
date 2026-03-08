import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (typeof window === "undefined" || !supabaseUrl.startsWith("https://") || !supabaseAnonKey) {
    throw new Error("Supabase is not configured or not in browser");
  }
  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
