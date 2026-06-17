import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export function isSupabaseServerConfigured() {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

export async function getSupabaseServerClient() {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
}

export function getSupabaseServerSetupMessage() {
  return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
}

export type SupabaseServerClient = SupabaseClient<Database>;
