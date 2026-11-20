import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isServiceRoleConfigured,
} from "@/shared/lib/supabase/env";

/** Server-only Supabase client with service role (bypasses RLS). */
export function createAdminClient() {
  if (!isServiceRoleConfigured()) return null;
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
