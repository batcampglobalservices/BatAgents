import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const SUPABASE_CONFIRM_URL = process.env.NEXT_PUBLIC_SUPABASE_CONFIRM_URL?.trim() ?? "";

let browserClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured() {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

export function getSupabaseSetupMessage() {
  return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
}

export function getSupabaseConfirmUrl() {
  if (SUPABASE_CONFIRM_URL.length > 0) {
    return SUPABASE_CONFIRM_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/login`;
  }

  return "/login";
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return browserClient;
}
