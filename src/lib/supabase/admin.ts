import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

let adminClient: SupabaseClient<Database> | null = null;

export function isSupabaseAdminConfigured() {
  return SUPABASE_URL.length > 0 && SUPABASE_SERVICE_ROLE_KEY.length > 0;
}

export function getSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

export function getSupabaseAdminSetupMessage() {
  return "Supabase admin access is not configured.";
}
