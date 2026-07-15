import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config.js";

let client: SupabaseClient | null | undefined;

/**
 * Service-role client — bypasses RLS. Never expose this key to the frontend.
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  client =
    config.supabaseUrl && config.supabaseServiceRoleKey
      ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;
  return client;
}
